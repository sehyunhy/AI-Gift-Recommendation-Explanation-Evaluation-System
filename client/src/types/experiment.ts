import type { FriendPersona, Product } from "@shared/schema";

export type ExplanationType = 'featureFocused' | 'profileBased' | 'contextBased';

// 새로운 A/B/C 매핑
export type ExplanationTypeABC = 'A' | 'B' | 'C';
export type ExperimentPair = 'AB' | 'AC' | 'BC';

// A = 제품기능(Feature), B = 프로필/사회적증거(Social-proof), C = 선물의도(Gift-intent)
export const EXPLANATION_MAPPING = {
  'A': 'featureFocused',    // 제품기능 중심
  'B': 'profileBased',      // 프로필/사회적증거 
  'C': 'contextBased'       // 선물의도/맥락 기반
} as const;

export interface ExperimentSession {
  id: string;
  persona: FriendPersona;
  product: Product;
  explanations: ExplanationSet;
  order: ExplanationType[];
  currentStep: number;
  responses: ExperimentResponse[];
  completed: boolean;
  startedAt: number;
  finalChoice?: FinalChoice;
}

export interface ExplanationSet {
  featureFocused: string;
  profileBased: string;
  contextBased: string;
}

export interface ExperimentResponse {
  explanationType: ExplanationType;
  stepIndex: number;
  // 신뢰 - 역량
  trustCompetence1: number;  // 상황과 특징 반영
  trustCompetence2: number;  // 취향과 필요 이해
  trustCompetence3: number;  // 신뢰할 만한 근거 기반
  trustCompetence4: number;  // 전문성 부족 (역순)
  // 신뢰 - 선의
  trustBenevolence1: number; // 좋은 선물 고르기 도움 태도
  trustBenevolence2: number; // 실제 도움 되려는 의도
  trustBenevolence3: number; // 관심사와 상황 고려
  trustBenevolence4: number; // 시스템 편의 우선시 (역순)
  // 신뢰 - 진실성
  trustIntegrity1: number;   // 공정하고 편향 없는 제시
  trustIntegrity2: number;   // 정직하고 투명한 전달
  trustIntegrity3: number;   // 과장이나 왜곡 없이 사실 그대로
  trustIntegrity4: number;   // 불확실한 부분 숨김 (역순)
  // 투명성 - 이해가능성
  transparency1: number;     // 데이터와 근거 파악 가능
  transparency2: number;     // 추천 생성 과정 이해 가능
  transparency3: number;     // 데이터 출처 명확성
  transparency4: number;     // 추천 근거 이해 어려움 (역순)
  // 행동 의도
  behavioral1: number;       // 실제 구매 의향
  behavioral2: number;       // 시스템 재이용 의향
  behavioral3: number;       // 다른 사람 소개 의향
  openFeedback?: string;     // 자유 응답
  responseTime: number;      // 응답 시간 (ms)
}

export interface FinalChoice {
  selectedExplanationType: ExplanationType;
  reason: {
    understandability: number;     // 설명이 이해하기 쉬웠다
    appropriateness: number;       // 나에게 적절하다고 느껴졌다
    trustworthiness: number;       // 신뢰가 느껴졌다
    clarity: number;               // 추천 이유가 명확했다
    usageIntent: number;           // 실제로 사용할 의향이 생겼다
  };
}