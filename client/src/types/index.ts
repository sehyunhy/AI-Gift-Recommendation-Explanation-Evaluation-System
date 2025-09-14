import type { FriendPersona, Product, Explanations } from "@shared/schema";

export interface StepData {
  currentStep: number;
  friendPersona?: FriendPersona;
  product?: Product;
  explanations?: Explanations;
  selectedExplanationType?: number;
  selectedExplanationContent?: string;
  surveyCompleted?: boolean;
}

export const PRICE_RANGES = [
  "5만원 ~ 10만원"
];

export const RELATIONSHIPS = ["지인"] as const;
export const OCCASIONS = ["축하"] as const;
export const GENDERS = ["남", "여"] as const;

