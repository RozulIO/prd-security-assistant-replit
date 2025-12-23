import { db } from "./db";
import { assessments, type InsertAssessment, type Assessment, type RiskAssessmentItem } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  getAllAssessments(): Promise<Assessment[]>;
  updateRiskAnalysis(id: number, risks: RiskAssessmentItem[]): Promise<Assessment>;
  updateReport(id: number, report: string): Promise<Assessment>;
}

export class DatabaseStorage implements IStorage {
  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db.insert(assessments).values(assessment).returning();
    return newAssessment;
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment;
  }

  async getAllAssessments(): Promise<Assessment[]> {
    return db.select().from(assessments).orderBy(desc(assessments.createdAt));
  }

  async updateRiskAnalysis(id: number, risks: RiskAssessmentItem[]): Promise<Assessment> {
    const [updated] = await db
      .update(assessments)
      .set({ riskAnalysis: risks })
      .where(eq(assessments.id, id))
      .returning();
    return updated;
  }

  async updateReport(id: number, report: string): Promise<Assessment> {
    const [updated] = await db
      .update(assessments)
      .set({ reportContent: report })
      .where(eq(assessments.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
