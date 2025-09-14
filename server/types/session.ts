import 'express-session';

export interface ExperimentSession {
  id: string;
  persona: any;
  product: any;
  explanations: {
    featureFocused: string;
    profileBased: string;
    contextBased: string;
  };
  order: ('featureFocused' | 'profileBased' | 'contextBased')[];
  currentStep: number;
  responses: any[];
  completed: boolean;
  startedAt: number;
  finalChoice?: any;
}

declare module 'express-session' {
  interface SessionData {
    experimentSession?: ExperimentSession;
  }
}