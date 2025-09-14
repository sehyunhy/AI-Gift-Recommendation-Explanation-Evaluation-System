import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Friend persona schema for form validation
export const friendPersonaSchema = z.object({
  name: z.string().min(1, "친구 이름을 입력해주세요"),
  age: z.number().min(1).max(120, "올바른 나이를 입력해주세요"),
  gender: z.enum(["남", "여"]),
  priceRange: z.string().min(1, "가격대를 선택해주세요"),
  emotionalState: z.string().optional(),
});

export type FriendPersona = z.infer<typeof friendPersonaSchema>;

// Product schema
export const productSchema = z.object({
  name: z.string(),
  price: z.number(),
  features: z.array(z.string()),
  description: z.string(),
  imageUrl: z.string(),
});

export type Product = z.infer<typeof productSchema>;

// Explanation types
export type ExplanationType = 'featureFocused' | 'profileBased' | 'contextBased';

// Explanation schema
export const explanationSchema = z.object({
  featureFocused: z.string(),
  profileBased: z.string(),
  contextBased: z.string(),
});

export type Explanations = z.infer<typeof explanationSchema>;

// Within-subject 3-condition sequential experiment with Latin Square design
export const experiments = pgTable("experiments", {
  id: varchar("id").primaryKey(),
  
  // 참가자 기본 정보
  friendName: text("friend_name").notNull(),
  friendAge: integer("friend_age").notNull(),
  gender: text("gender").notNull(),
  priceRange: text("price_range").notNull(),
  emotionalState: text("emotional_state"),
  
  // 제품 정보 (고정)
  productName: text("product_name").notNull(),
  productPrice: integer("product_price").notNull(),
  productFeatures: jsonb("product_features").$type<string[]>().notNull(),
  productDescription: text("product_description").notNull(),
  productImageUrl: text("product_image_url").notNull(),
  
  // 설명 전체 (A, B, C 모두 포함)
  explanations: jsonb("explanations").$type<{
    featureFocused: string;
    profileBased: string;
    contextBased: string;
  }>().notNull(),
  
  // 라틴 스퀘어 설계: A,B,C 3조건의 6가지 순서 조합
  experimentOrder: jsonb("experiment_order").$type<{
    sequence: readonly [ExplanationType, ExplanationType, ExplanationType];
    orderType: 'ABC' | 'ACB' | 'BAC' | 'BCA' | 'CAB' | 'CBA';
  }>().notNull(),
  
  // 각 조건별 설문 응답
  surveyResponses: jsonb("survey_responses").$type<Array<{
    condition: ExplanationType;
    stepIndex: number; // 1 (첫 번째) 2 (두 번째) 3 (세 번째 조건)
    
    // MC1: 설명 유형 인식 (단일 선택)
    mc1_explanationType: 'feature' | 'profile' | 'intent';
    
    
    // 설명 이해도
    comprehension1: number;
    comprehension2: number;
    comprehension3: number;
    comprehension4: number;
    
    // 정보 과부하
    overload1: number;
    overload2: number;
    overload3: number;
    overload4: number;
    
    // 제품-상황 적합성
    perceivedFit1: number;
    perceivedFit2: number;
    perceivedFit3: number;
    
    // 구매 의도
    purchaseIntent1: number;
    purchaseIntent2: number;
    purchaseIntent3: number;
    
    responseTime: number; // 응답 시간 (ms)
    timestamp: string;
  }>>().default([]),
  
  // 최종 3조건 비교 결과
  finalComparison: jsonb("final_comparison").$type<{
    preferredCondition: ExplanationType;
    reason: string; // "왜?" 1문장 응답
    confidenceLevel: number; // 1-7 확신 정도
    rankings: {
      first: ExplanationType;
      second: ExplanationType;
      third: ExplanationType;
    };
    timestamp: string;
  }>(),
  
  // 인구통계학적 정보
  demographics: jsonb("demographics").$type<{
    age: number;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    giftShoppingFrequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'always';
  }>(),
  
  // 행동 추적 데이터
  trackingData: jsonb("tracking_data").$type<{
    // 각 조건별 dwell time
    dwellTimes: Array<{
      condition: ExplanationType;
      startTime: string;
      endTime: string;
      duration: number; // ms
    }>;
    
    // 스크롤 패턴
    scrollPatterns: Array<{
      condition: ExplanationType;
      scrollY: number;
      timestamp: string;
      stopDuration: number;
    }>;
    
    // 첫 상호작용
    firstInteractions: Array<{
      condition: ExplanationType;
      type: 'mouseenter' | 'click' | 'scroll';
      target: string;
      timestamp: string;
      coordinates?: { x: number; y: number };
    }>;
    
    // 버튼 클릭 (새로운 구조)
    buttonClicks: Array<{
      condition: ExplanationType;
      event_type: 'click_info_menu' | 'click_action_menu' | 'click_regenerate';
      sub_event?: 'spec' | 'review' | 'compare' | 'wishlist' | 'cart' | 'share' | 'purchase' | 'regenerate';
      timestamp: string;
      coordinates?: { x: number; y: number };
    }>;
    
    // 전체 세션 시간
    sessionDuration: {
      startTime: string;
      endTime: string | null;
      totalDuration: number | null; // ms
    };
  }>().default({
    dwellTimes: [],
    scrollPatterns: [],
    firstInteractions: [],
    buttonClicks: [],
    sessionDuration: { startTime: '', endTime: null, totalDuration: null }
  }),
  
  // 실험 진행 상태
  currentStep: integer("current_step").default(0), // 0: 시작, 1: 조건1, 2: 설문1, 3: 조건2, 4: 설문2, 5: 비교, 6: 인구통계, 7: 완료
  
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExperimentSchema = createInsertSchema(experiments).omit({
  createdAt: true,
});

export type InsertExperiment = z.infer<typeof insertExperimentSchema>;
export type Experiment = typeof experiments.$inferSelect;

// Survey response validation schemas
export const surveyQuestionSchema = z.object({
  // MC1: 설명 유형 인식 (단일 선택)
  mc1_explanationType: z.enum(['feature', 'profile', 'intent']),
  
  
  // 설명 이해도
  comprehension1: z.number().min(1).max(7),
  comprehension2: z.number().min(1).max(7),
  comprehension3: z.number().min(1).max(7),
  comprehension4: z.number().min(1).max(7),
  
  // 정보 과부하
  overload1: z.number().min(1).max(7),
  overload2: z.number().min(1).max(7),
  overload3: z.number().min(1).max(7),
  overload4: z.number().min(1).max(7),
  
  // 제품-상황 적합성
  perceivedFit1: z.number().min(1).max(7),
  perceivedFit2: z.number().min(1).max(7),
  perceivedFit3: z.number().min(1).max(7),
  
  // 구매 의도
  purchaseIntent1: z.number().min(1).max(7),
  purchaseIntent2: z.number().min(1).max(7),
  purchaseIntent3: z.number().min(1).max(7),
});

export type SurveyQuestionResponse = z.infer<typeof surveyQuestionSchema>;

// Demographics schema
export const demographicsSchema = z.object({
  age: z.number().min(18).max(100),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  phone: z.string().min(10).max(15), // 전화번호 필드 추가 (암호화 처리됨)
  giftShoppingFrequency: z.enum(['never', 'rarely', 'sometimes', 'often', 'always']),
  
  // 카카오톡 선물하기 관련 질문들
  priceImportance: z.number().min(1).max(7), // 1-7 척도
  qualityImportance: z.number().min(1).max(7), // 1-7 척도
  relationshipImportance: z.number().min(1).max(7), // 1-7 척도 (취향 적합성)
  relationshipIntimacy: z.number().min(1).max(7), // 1-7 척도 (관계 친밀도)
  hasUsedKakaoGift: z.boolean(), // 카카오톡 선물하기 사용 경험
  giftSituations: z.array(z.string()), // 복수 선택 (빈 배열 가능)
  giftMindset: z.string(), // 단일 선택
});

export type Demographics = z.infer<typeof demographicsSchema>;

// Final comparison schema (새로운 최종 평가)
export const finalComparisonSchema = z.object({
  // [1] 조작점검 (Manipulation Check)
  differentInfoMethods: z.boolean(), // 예/아니오
  clearDifferences: z.boolean(), // 예/아니오 (리커트 척도에서 변경)
  
  // [2] 설명 유형 비교 평가
  mostComprehensible: z.enum(['featureFocused', 'profileBased', 'contextBased']),
  mostOverloaded: z.enum(['featureFocused', 'profileBased', 'contextBased']),
  personalPreference: z.enum(['featureFocused', 'profileBased', 'contextBased']),
  
  // [2-3] 설명 적합성 평가
  bestGiftAppropriatenessExplanation: z.enum(['featureFocused', 'profileBased', 'contextBased']),
});

export type FinalComparison = z.infer<typeof finalComparisonSchema>;