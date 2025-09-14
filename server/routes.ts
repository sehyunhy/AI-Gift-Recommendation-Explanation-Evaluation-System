import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { friendPersonaSchema, surveyQuestionSchema, demographicsSchema, finalComparisonSchema, type ExplanationType } from "@shared/schema";
import { generateProductRecommendation, generateExplanations, generateProductImage } from "./services/openai";
import './types/session';

export async function registerRoutes(app: Express): Promise<Server> {
  
  // 새로운 Within-subject 실험 시작
  app.post("/api/experiment/start", async (req, res) => {
    try {
      const persona = friendPersonaSchema.parse(req.body);
      
      // 제품 생성 먼저
      console.log('🚀 Generating product...');
      const product = await generateProductRecommendation(persona);
      
      // 설명과 이미지를 병렬로 생성
      console.log('🎨 Starting parallel explanation and image generation...');
      const [explanations, imageUrl] = await Promise.all([
        generateExplanations(persona, product),
        generateProductImage(product.name, product.description)
      ]);
      
      const productWithImage = { ...product, imageUrl };
      console.log('✅ All generation completed');
      
      // 라틴 스퀘어 설계: A,B,C 3조건의 6가지 순서 조합
      const LATIN_SQUARE_ORDERS = [
        { sequence: ['featureFocused', 'profileBased', 'contextBased'], orderType: 'ABC' },
        { sequence: ['featureFocused', 'contextBased', 'profileBased'], orderType: 'ACB' },
        { sequence: ['profileBased', 'featureFocused', 'contextBased'], orderType: 'BAC' },
        { sequence: ['profileBased', 'contextBased', 'featureFocused'], orderType: 'BCA' },
        { sequence: ['contextBased', 'featureFocused', 'profileBased'], orderType: 'CAB' },
        { sequence: ['contextBased', 'profileBased', 'featureFocused'], orderType: 'CBA' }
      ] as const;
      
      const randomOrder = LATIN_SQUARE_ORDERS[Math.floor(Math.random() * LATIN_SQUARE_ORDERS.length)];
      
      const experimentData = {
        id: Date.now().toString(),
        friendName: persona.name,
        friendAge: persona.age,
        gender: persona.gender,
        priceRange: persona.priceRange,
        emotionalState: persona.emotionalState,
        productName: productWithImage.name,
        productPrice: productWithImage.price,
        productFeatures: productWithImage.features,
        productDescription: productWithImage.description,
        productImageUrl: productWithImage.imageUrl,
        explanations: {
          featureFocused: explanations.featureFocused,
          profileBased: explanations.profileBased,
          contextBased: explanations.contextBased
        },
        experimentOrder: randomOrder,
        surveyResponses: [],
        finalComparison: null,
        demographics: null,
        trackingData: {
          dwellTimes: [],
          scrollPatterns: [],
          firstInteractions: [],
          buttonClicks: [],
          sessionDuration: { 
            startTime: new Date().toISOString(), 
            endTime: null, 
            totalDuration: null 
          }
        },
        currentStep: 0,
        startedAt: new Date(),
        completedAt: null
      };
      
      const savedExperiment = await storage.createExperiment(experimentData);
      console.log('✅ Within-subject experiment created:', savedExperiment.id);
      
      res.json({
        id: savedExperiment.id,
        experimentOrder: randomOrder,
        product: productWithImage,
        explanations,
        currentStep: 0
      });
    } catch (error: any) {
      console.error('❌ Experiment creation failed:', error);
      res.status(400).json({ message: error.message || "실험 시작 실패" });
    }
  });

  // 실험 진행 단계 업데이트
  app.patch("/api/experiment/:id/step", async (req, res) => {
    try {
      const { id } = req.params;
      const { step } = req.body;
      
      await storage.updateExperimentStep(id, step);
      console.log(`📍 Experiment ${id} step updated to: ${step}`);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Step update failed:', error);
      res.status(400).json({ message: error.message || "단계 업데이트 실패" });
    }
  });

  // 설문 응답 저장 (각 조건 후)
  app.post("/api/experiment/:id/survey", async (req, res) => {
    try {
      const { id } = req.params;
      const { condition, stepIndex, responseTime, ...surveyData } = req.body;
      
      // 설문 응답 유효성 검사
      const validatedSurvey = surveyQuestionSchema.parse(surveyData);
      
      const response = {
        ...validatedSurvey,
        condition: condition as ExplanationType,
        stepIndex,
        responseTime,
        timestamp: new Date().toISOString()
      };
      
      await storage.addSurveyResponse(id, response);
      console.log(`📝 Survey response saved for experiment ${id}, condition: ${condition}`);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Survey response save failed:', error);
      res.status(400).json({ message: error.message || "설문 응답 저장 실패" });
    }
  });

  // 최종 페어 비교 결과 저장
  app.post("/api/experiment/:id/comparison", async (req, res) => {
    try {
      const { id } = req.params;
      const comparisonData = finalComparisonSchema.parse(req.body);
      
      await storage.updateFinalComparison(id, comparisonData);
      console.log(`🔄 Final comparison saved for experiment ${id}`);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Final comparison save failed:', error);
      res.status(400).json({ message: error.message || "최종 비교 저장 실패" });
    }
  });

  // 인구통계학적 정보 저장
  app.post("/api/experiment/:id/demographics", async (req, res) => {
    try {
      const { id } = req.params;
      const demographics = demographicsSchema.parse(req.body);
      
      await storage.updateDemographics(id, demographics);
      
      // 실험 완료 처리
      await storage.updateExperiment(id, { 
        completedAt: new Date(),
        currentStep: 7 // 완료 상태
      });
      
      console.log(`👥 Demographics saved and experiment ${id} completed`);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Demographics save failed:', error);
      res.status(400).json({ message: error.message || "인구통계 정보 저장 실패" });
    }
  });

  // 행동 추적 데이터 저장
  app.post("/api/experiment/:id/tracking", async (req, res) => {
    try {
      const { id } = req.params;
      const { trackingData } = req.body;
      
      await storage.addTrackingData(id, trackingData);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Tracking data save failed:', error);
      res.status(400).json({ message: error.message || "추적 데이터 저장 실패" });
    }
  });

  // 수신자 정보 업데이트
  app.patch("/api/experiment/:id/recipient", async (req, res) => {
    try {
      const { id } = req.params;
      const { friendName, friendAge, gender } = req.body;
      
      await storage.updateRecipientInfo(id, {
        friendName,
        friendAge,
        gender
      });
      
      console.log(`👤 Recipient info updated for experiment ${id}:`, { friendName, friendAge, gender });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Recipient info update failed:', error);
      res.status(400).json({ message: error.message || "수신자 정보 업데이트 실패" });
    }
  });

  // 클릭 이벤트 로깅
  app.post("/api/experiment/:id/click-event", async (req, res) => {
    try {
      const { id } = req.params;
      const { condition, event_type, sub_event } = req.body;
      
      const clickEvent = {
        condition,
        event_type,
        sub_event,
        timestamp: new Date().toISOString()
      };
      
      // buttonClicks 배열에 추가
      await storage.addTrackingData(id, {
        buttonClicks: [clickEvent]
      });
      
      console.log(`🖱️ Click event logged for experiment ${id}:`, clickEvent);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Click event save failed:', error);
      res.status(400).json({ message: error.message || "클릭 이벤트 저장 실패" });
    }
  });

  // 실험 데이터 조회
  app.get("/api/experiment/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const experiment = await storage.getExperiment(id);
      
      if (!experiment) {
        return res.status(404).json({ message: "실험을 찾을 수 없습니다" });
      }
      
      res.json(experiment);
    } catch (error: any) {
      console.error('❌ Experiment retrieval failed:', error);
      res.status(400).json({ message: error.message || "실험 데이터 조회 실패" });
    }
  });

  // 모든 실험 데이터 조회 (분석용)
  app.get("/api/experiments", async (req, res) => {
    try {
      const experiments = await storage.getAllExperiments();
      res.json(experiments);
    } catch (error: any) {
      console.error('❌ Experiments retrieval failed:', error);
      res.status(400).json({ message: error.message || "실험 목록 조회 실패" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}