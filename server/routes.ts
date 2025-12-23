import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import mammoth from "mammoth";
import { GoogleGenAI } from "@google/genai";

const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Upload Route
  app.post(api.assessments.upload.path, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      const text = result.value;

      const assessment = await storage.createAssessment({
        title: req.file.originalname,
        originalText: text,
      });

      res.status(201).json(assessment);
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ message: 'Failed to process file' });
    }
  });

  // Get Assessment
  app.get(api.assessments.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const assessment = await storage.getAssessment(id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.json(assessment);
  });

  // List Assessments
  app.get(api.assessments.list.path, async (req, res) => {
    const assessments = await storage.getAllAssessments();
    res.json(assessments);
  });

  // Analyze Risk
  app.post(api.assessments.analyze.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getAssessment(id);
      
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }

      const prompt = `
        You are a Senior Security Engineer. You are analyzing a product requirement document.
        Apply the STRIDE threat modeling methodology to the following system description.
        Identify potential threats and return the output as a strictly formatted JSON array of objects. 
        
        System Description:
        ${assessment.originalText}

        Each object must have the following keys:
        - "featureName": The specific feature or component affected.
        - "threatType": The STRIDE category (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).
        - "description": A description of the threat.
        - "risk": The potential impact or consequence.
        - "recommendation": Mitigation steps.
        - "riskLevel": High, Medium, or Low.

        Do not include markdown formatting like \`\`\`json. Just return the JSON array.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No response from AI');
      }

      // Clean up markdown if present
      const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
      const risks = JSON.parse(jsonStr);

      const updated = await storage.updateRiskAnalysis(id, risks);
      res.json(updated.riskAnalysis);
    } catch (err) {
      console.error('Analysis error:', err);
      res.status(500).json({ message: 'Failed to analyze risks' });
    }
  });

  // Generate Report
  app.post(api.assessments.generateReport.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getAssessment(id);
      
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }

      const prompt = `
        You are a Senior Security Engineer. Generate a comprehensive security risk assessment report in Markdown format based on the following system description and risk analysis.
        
        System Description:
        ${assessment.originalText}

        Risk Analysis:
        ${JSON.stringify(assessment.riskAnalysis)}

        The report should include:
        1. Executive Summary
        2. Introduction
        3. Scope
        4. Methodology (STRIDE)
        5. Detailed Risk Assessment (Summarize the key risks)
        6. Conclusion & Recommendations

        Format strictly as Markdown.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const report = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!report) {
        throw new Error('No response from AI');
      }

      await storage.updateReport(id, report);
      res.json({ report });
    } catch (err) {
      console.error('Report generation error:', err);
      res.status(500).json({ message: 'Failed to generate report' });
    }
  });

  return httpServer;
}
