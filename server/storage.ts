import { type Experiment, type InsertExperiment, experiments, type ExplanationType, type SurveyQuestionResponse, type Demographics, type FinalComparison } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Within-subject experiment methods
  createExperiment(experiment: InsertExperiment): Promise<Experiment>;
  getExperiment(id: string): Promise<Experiment | undefined>;
  updateExperiment(id: string, updates: Partial<Experiment>): Promise<Experiment | undefined>;
  updateExperimentStep(id: string, step: number): Promise<void>;
  addSurveyResponse(id: string, response: SurveyQuestionResponse & { condition: ExplanationType; stepIndex: number; timestamp: string; responseTime: number }): Promise<void>;
  updateFinalComparison(id: string, comparison: FinalComparison): Promise<void>;
  updateDemographics(id: string, demographics: Demographics): Promise<void>;
  updateRecipientInfo(id: string, recipientInfo: { friendName: string; friendAge: number; gender: string }): Promise<void>;
  addTrackingData(id: string, trackingData: any): Promise<void>;
  getAllExperiments(): Promise<Experiment[]>;
}

export class DatabaseStorage implements IStorage {
  async createExperiment(insertExperiment: InsertExperiment): Promise<Experiment> {
    const [experiment] = await db
      .insert(experiments)
      .values(insertExperiment as any)
      .returning();
    return experiment;
  }

  async getExperiment(id: string): Promise<Experiment | undefined> {
    const [experiment] = await db.select().from(experiments).where(eq(experiments.id, id));
    return experiment || undefined;
  }

  async updateExperiment(id: string, updates: Partial<Experiment>): Promise<Experiment | undefined> {
    const [updated] = await db
      .update(experiments)
      .set(updates)
      .where(eq(experiments.id, id))
      .returning();
    return updated || undefined;
  }

  async updateExperimentStep(id: string, step: number): Promise<void> {
    await db
      .update(experiments)
      .set({ currentStep: step })
      .where(eq(experiments.id, id));
  }

  async addSurveyResponse(id: string, response: SurveyQuestionResponse & { condition: ExplanationType; stepIndex: number; timestamp: string; responseTime: number }): Promise<void> {
    const experiment = await this.getExperiment(id);
    if (!experiment) throw new Error("Experiment not found");

    const updatedResponses = [...(experiment.surveyResponses || []), response];
    
    await db
      .update(experiments)
      .set({ surveyResponses: updatedResponses })
      .where(eq(experiments.id, id));
  }

  async updateFinalComparison(id: string, comparison: FinalComparison): Promise<void> {
    await db
      .update(experiments)
      .set({ 
        finalComparison: {
          ...comparison,
          timestamp: new Date().toISOString()
        }
      })
      .where(eq(experiments.id, id));
  }

  async updateDemographics(id: string, demographics: Demographics): Promise<void> {
    await db
      .update(experiments)
      .set({ demographics })
      .where(eq(experiments.id, id));
  }

  async updateRecipientInfo(id: string, recipientInfo: { friendName: string; friendAge: number; gender: string }): Promise<void> {
    await db
      .update(experiments)
      .set({ 
        friendName: recipientInfo.friendName,
        friendAge: recipientInfo.friendAge,
        gender: recipientInfo.gender
      })
      .where(eq(experiments.id, id));
  }

  async addTrackingData(id: string, trackingData: any): Promise<void> {
    const experiment = await this.getExperiment(id);
    if (!experiment) throw new Error("Experiment not found");

    // Merge new tracking data with existing
    const existingTracking = experiment.trackingData || {
      dwellTimes: [],
      scrollPatterns: [],
      firstInteractions: [],
      buttonClicks: [],
      sessionDuration: { startTime: '', endTime: null, totalDuration: null }
    };

    const mergedTracking = {
      dwellTimes: [...existingTracking.dwellTimes, ...(trackingData.dwellTimes || [])],
      scrollPatterns: [...existingTracking.scrollPatterns, ...(trackingData.scrollPatterns || [])],
      firstInteractions: [...existingTracking.firstInteractions, ...(trackingData.firstInteractions || [])],
      buttonClicks: [...existingTracking.buttonClicks, ...(trackingData.buttonClicks || [])],
      sessionDuration: trackingData.sessionDuration || existingTracking.sessionDuration
    };

    await db
      .update(experiments)
      .set({ trackingData: mergedTracking })
      .where(eq(experiments.id, id));
  }

  async getAllExperiments(): Promise<Experiment[]> {
    return await db.select().from(experiments);
  }
}

export const storage = new DatabaseStorage();