import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/chat";

// === TABLE DEFINITIONS ===
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  originalText: text("original_text").notNull(),
  riskAnalysis: jsonb("risk_analysis").$type<RiskAssessmentItem[]>(), 
  reportContent: text("report_content"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === TYPES ===
export interface RiskAssessmentItem {
  featureName: string;
  threatType: string;
  description: string;
  risk: string;
  recommendation: string;
  riskLevel: "High" | "Medium" | "Low";
}

export const insertAssessmentSchema = createInsertSchema(assessments).omit({ 
  id: true, 
  createdAt: true,
  riskAnalysis: true,
  reportContent: true 
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
