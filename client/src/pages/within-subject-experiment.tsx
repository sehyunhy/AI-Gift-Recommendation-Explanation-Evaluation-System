import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { ExplanationDisplay } from '@/components/ExplanationDisplay';
import { SimpleExplanationDisplay } from '@/components/SimpleExplanationDisplay';
import { SurveyForm } from '@/components/SurveyForm';
import { ComparisonForm } from '@/components/ComparisonForm';
import { DemographicsForm } from '@/components/DemographicsForm';
import { useToast } from '@/hooks/use-toast';
import type { Experiment, ExplanationType } from '@shared/schema';

export function WithinSubjectExperimentPage() {
  const [, params] = useRoute('/experiment/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const experimentId = params?.id;

  const [currentStepState, setCurrentStepState] = useState(0);
  const [responseStartTime, setResponseStartTime] = useState<number | null>(null);
  const [experimentStartTime, setExperimentStartTime] = useState<number | null>(null);
  const [conditionStartTimes, setConditionStartTimes] = useState<{
    condition1: number | null;
    condition2: number | null;
    condition3: number | null;
  }>({ condition1: null, condition2: null, condition3: null });
  const [timingResults, setTimingResults] = useState<{
    pair: string;
    order: number;
    condition: string;
    decision_time_sec: number;
  }[]>([]);

  // 수신자 정보 state
  const [recipientInfo, setRecipientInfo] = useState({
    friendName: '',
    friendAge: '',
    gender: ''
  });

  // 실험 데이터 조회
  const { data: experiment, isLoading, refetch } = useQuery({
    queryKey: ['/api/experiment', experimentId],
    enabled: !!experimentId,
  });

  // 라틴 스퀘어 순서에서 현재 조건 가져오기
  const getCurrentCondition = (): ExplanationType | null => {
    if (!experiment?.experimentOrder?.sequence) return null;
    const stepToConditionIndex = {
      1: 0, // 첫 번째 설명
      3: 1, // 두 번째 설명  
      5: 2  // 세 번째 설명
    };
    const conditionIndex = stepToConditionIndex[currentStepState as keyof typeof stepToConditionIndex];
    return conditionIndex !== undefined ? experiment.experimentOrder.sequence[conditionIndex] : null;
  };

  // 단계 업데이트 mutation
  const updateStepMutation = useMutation({
    mutationFn: async (step: number) => {
      return await apiRequest('PATCH', `/api/experiment/${experimentId}/step`, { step });
    },
    onSuccess: () => {
      refetch();
    }
  });

  // 수신자 정보 업데이트 mutation
  const updateRecipientMutation = useMutation({
    mutationFn: async (data: { friendName: string; friendAge: number; gender: string }) => {
      return await apiRequest('PATCH', `/api/experiment/${experimentId}/recipient`, data);
    },
    onSuccess: () => {
      toast({ title: '수신자 정보가 저장되었습니다' });
      handleStartCondition(1);
    }
  });

  // 설문 응답 저장 mutation
  const saveSurveyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', `/api/experiment/${experimentId}/survey`, data);
    },
    onSuccess: () => {
      toast({ title: '응답이 저장되었습니다' });
      
      // 3조건 순차 실험: 설문 완료 후 다음 단계로 이동
      let nextStep: number;
      if (currentStepState === 2) {
        nextStep = 3; // 첫 번째 설문 → 두 번째 조건
      } else if (currentStepState === 4) {
        nextStep = 5; // 두 번째 설문 → 세 번째 조건
      } else { // currentStepState === 6
        nextStep = 7; // 세 번째 설문 → 최종 비교
      }
      
      setCurrentStepState(nextStep);
      updateStepMutation.mutate(nextStep);
    }
  });

  // 최종 비교 저장 mutation
  const saveComparisonMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', `/api/experiment/${experimentId}/comparison`, data);
    },
    onSuccess: () => {
      const nextStep = 8; // 최종 비교 → 인구통계 설문
      setCurrentStepState(nextStep);
      updateStepMutation.mutate(nextStep);
    }
  });

  // 인구통계 저장 mutation
  const saveDemographicsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', `/api/experiment/${experimentId}/demographics`, data);
    },
    onSuccess: () => {
      toast({ 
        title: '실험이 완료되었습니다!', 
        description: '참여해 주셔서 감사합니다.' 
      });
      setCurrentStepState(9); // 완료 상태
    }
  });

  useEffect(() => {
    if (experiment?.currentStep !== undefined) {
      setCurrentStepState(experiment.currentStep);
    }
  }, [experiment]);

  // 뒤로가기 방지
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      toast({
        title: '뒤로가기가 제한됩니다',
        description: '실험의 정확성을 위해 이전 단계로 돌아갈 수 없습니다.',
        variant: 'destructive'
      });
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [toast]);

  if (isLoading || !experiment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>실험을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  const experimentOrder = experiment.experimentOrder;
  const condition1 = experimentOrder.sequence[0]; // 첫 번째 조건
  const condition2 = experimentOrder.sequence[1]; // 두 번째 조건
  const condition3 = experimentOrder.sequence[2]; // 세 번째 조건
  
  const progressPercentage = Math.round((currentStepState / 9) * 100); // 0시작 + 3조건설문 + 1비교 + 1인구통계 + 1완료 = 9단계

  const handleSurveySubmit = (surveyData: any) => {
    const responseTime = responseStartTime ? Date.now() - responseStartTime : 0;
    let currentCondition: ExplanationType;
    let stepIndex: number;
    
    // 현재 단계에 따라 조건 결정
    if (currentStepState === 2) {
      currentCondition = condition1;
      stepIndex = 1;
    } else if (currentStepState === 4) {
      currentCondition = condition2;
      stepIndex = 2;
    } else { // currentStepState === 6
      currentCondition = condition3;
      stepIndex = 3;
    }
    
    // decision_time_sec 기록
    const conditionMapping = {
      featureFocused: 'A',
      profileBased: 'B', 
      contextBased: 'C'
    };
    
    const newTimingResult = {
      order: stepIndex,
      condition: conditionMapping[currentCondition as keyof typeof conditionMapping],
      decision_time_sec: Math.round((responseTime / 1000) * 10) / 10
    };
    
    setTimingResults(prev => [...prev, newTimingResult]);
    
    console.log('Decision Time Result:', newTimingResult);

    saveSurveyMutation.mutate({
      ...surveyData,
      condition: currentCondition,
      stepIndex,
      responseTime
    });
  };

  const handleStartCondition = (conditionIndex: number) => {
    const now = Date.now();
    setResponseStartTime(now);
    
    // 첫 번째 조건일 때 전체 실험 시작 시간 기록
    if (conditionIndex === 1 && !experimentStartTime) {
      setExperimentStartTime(now);
    }
    
    // 조건별 시작 시간 기록
    if (conditionIndex === 1) {
      setConditionStartTimes(prev => ({ ...prev, condition1: now }));
    } else if (conditionIndex === 2) {
      setConditionStartTimes(prev => ({ ...prev, condition2: now }));
    } else {
      setConditionStartTimes(prev => ({ ...prev, condition3: now }));
    }
    
    // 3단계 순차 실험: 조건1(단계1) → 조건2(단계3) → 조건3(단계5)
    const nextStep = conditionIndex === 1 ? 1 : conditionIndex === 2 ? 3 : 5;
    setCurrentStepState(nextStep);
    updateStepMutation.mutate(nextStep);
  };

  const handleComparisonSubmit = (comparisonData: any) => {
    // 전체 실험 완료 시간 계산
    const completionTime = experimentStartTime 
      ? Math.round(((Date.now() - experimentStartTime) / 1000) * 10) / 10 
      : 0;
    
    // 최종 결과 JSON 출력
    const finalResults = {
      timing_results: timingResults,
      completion_time_total_sec: completionTime,
      experiment_metadata: {
        experiment_id: experimentId,
        order_type: experimentOrder.orderType,
        sequence: experimentOrder.sequence
      }
    };
    
    console.log('Final Experiment Results:', JSON.stringify(finalResults, null, 2));
    
    saveComparisonMutation.mutate(comparisonData);
  };

  const handleDemographicsSubmit = (demographics: any) => {
    saveDemographicsMutation.mutate(demographics);
  };

  // 클릭 이벤트 로깅 함수
  const handleEventLog = async (condition: ExplanationType, eventData: {
    event_type: 'click_info_menu' | 'click_action_menu' | 'click_regenerate';
    sub_event?: 'spec' | 'review' | 'compare' | 'wishlist' | 'cart' | 'share' | 'purchase' | 'regenerate';
  }) => {
    try {
      await fetch(`/api/experiment/${experimentId}/click-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          condition,
          ...eventData
        })
      });
    } catch (error) {
      console.error('클릭 이벤트 로깅 실패:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 진행률 표시 */}
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold">AI 선물 추천 설명 비교 실험</h1>
            <span className="text-sm text-gray-600">{progressPercentage}% 완료</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Step 0: 간단한 실험 참여 감사 메시지 */}
        {currentStepState === 0 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🎁</span>
              </div>
              <CardTitle className="text-2xl font-bold">AI 선물 추천 설명 비교 실험</CardTitle>
              <p className="text-gray-600 mt-2">소요 시간: 약 8-10분</p>
            </CardHeader>
            <CardContent>
              <Card className="border-blue-100 bg-blue-50">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-4">실험 참여에 감사드립니다!</h3>
                  
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-500">•</span>
                      <span>세 가지 AI 설명 방식을 순서대로 보여드립니다</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-500">•</span>
                      <span>각 설명을 본 후 간단한 설문에 응답해 주세요</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-500">•</span>
                      <span>마지막에 세 설명을 비교하여 선호도를 선택해 주세요</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-500">•</span>
                      <span>모든 응답은 익명으로 처리됩니다</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-8">
                <Button 
                  onClick={() => {
                    setExperimentStartTime(Date.now());
                    updateStepMutation.mutate(1);
                  }}
                  className="w-full"
                  size="lg"
                  disabled={updateStepMutation.isPending}
                >
                  {updateStepMutation.isPending ? '시작 중...' : '실험 시작하기'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Step 1: 첫 번째 조건 제시 */}
        {currentStepState === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>설명 1/3</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">다음 설명을 주의 깊게 읽어보세요:</p>
                <ExplanationDisplay
                  type={condition1}
                  explanation={experiment.explanations[condition1]}
                  product={{
                    name: experiment.productName,
                    price: experiment.productPrice,
                    features: experiment.productFeatures,
                    description: experiment.productDescription,
                    imageUrl: experiment.productImageUrl
                  }}
                  persona={{
                    name: experiment.friendName,
                    age: experiment.friendAge,
                    gender: experiment.gender,
                    priceRange: experiment.priceRange,
                    emotionalState: experiment.emotionalState
                  }}
                  experimentId={experimentId!}
                  onEventLog={(eventData) => handleEventLog(condition1, eventData)}
                />
                <Button 
                  onClick={() => {
                    setResponseStartTime(Date.now());
                    setCurrentStepState(2);
                    updateStepMutation.mutate(2);
                  }}
                  className="w-full mt-6"
                  size="lg"
                >
                  설문 응답하기
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: 첫 번째 설문 */}
        {currentStepState === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 추천 이유만 간단히 */}
            <Card>
              <CardHeader>
                <CardTitle>추천 이유 확인</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">방금 본 추천 이유를 참고하여 설문에 답해주세요:</p>
                <SimpleExplanationDisplay
                  type={condition1}
                  explanation={experiment.explanations[condition1]}
                  persona={{
                    name: experiment.friendName,
                    age: experiment.friendAge,
                    gender: experiment.gender,
                    priceRange: experiment.priceRange,
                    emotionalState: experiment.emotionalState
                  }}
                />
              </CardContent>
            </Card>
            
            {/* 오른쪽: 설문 */}
            <div>
              <SurveyForm 
                onSubmit={handleSurveySubmit}
                conditionNumber={1}
                isLoading={saveSurveyMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Step 3: 두 번째 조건 제시 */}
        {currentStepState === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>설명 2/3</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">두 번째 설명을 주의 깊게 읽어보세요:</p>
                <ExplanationDisplay
                  type={condition2}
                  explanation={experiment.explanations[condition2]}
                  product={{
                    name: experiment.productName,
                    price: experiment.productPrice,
                    features: experiment.productFeatures,
                    description: experiment.productDescription,
                    imageUrl: experiment.productImageUrl
                  }}
                  persona={{
                    name: experiment.friendName,
                    age: experiment.friendAge,
                    gender: experiment.gender,
                    priceRange: experiment.priceRange,
                    emotionalState: experiment.emotionalState
                  }}
                  experimentId={experimentId!}
                  onEventLog={(eventData) => handleEventLog(condition2, eventData)}
                />
                <Button 
                  onClick={() => {
                    setResponseStartTime(Date.now());
                    setCurrentStepState(4);
                    updateStepMutation.mutate(4);
                  }}
                  className="w-full mt-6"
                  size="lg"
                >
                  설문 응답하기
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: 두 번째 설문 */}
        {currentStepState === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 추천 이유만 간단히 */}
            <Card>
              <CardHeader>
                <CardTitle>추천 이유 확인</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">방금 본 추천 이유를 참고하여 설문에 답해주세요:</p>
                <SimpleExplanationDisplay
                  type={condition2}
                  explanation={experiment.explanations[condition2]}
                  persona={{
                    name: experiment.friendName,
                    age: experiment.friendAge,
                    gender: experiment.gender,
                    priceRange: experiment.priceRange,
                    emotionalState: experiment.emotionalState
                  }}
                />
              </CardContent>
            </Card>
            
            {/* 오른쪽: 설문 */}
            <div>
              <SurveyForm 
                onSubmit={handleSurveySubmit}
                conditionNumber={2}
                isLoading={saveSurveyMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Step 5: 세 번째 조건 제시 */}
        {currentStepState === 5 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>설명 3/3</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">마지막 세 번째 설명을 주의 깊게 읽어보세요:</p>
                <ExplanationDisplay
                  type={condition3}
                  explanation={experiment.explanations[condition3]}
                  product={{
                    name: experiment.productName,
                    price: experiment.productPrice,
                    features: experiment.productFeatures,
                    description: experiment.productDescription,
                    imageUrl: experiment.productImageUrl
                  }}
                  persona={{
                    name: experiment.friendName,
                    age: experiment.friendAge,
                    gender: experiment.gender,
                    priceRange: experiment.priceRange,
                    emotionalState: experiment.emotionalState
                  }}
                  experimentId={experimentId!}
                  onEventLog={(eventData) => handleEventLog(condition3, eventData)}
                />
                <Button 
                  onClick={() => {
                    setResponseStartTime(Date.now());
                    setCurrentStepState(6);
                    updateStepMutation.mutate(6);
                  }}
                  className="w-full mt-6"
                  size="lg"
                >
                  설문 응답하기
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 6: 세 번째 설문 */}
        {currentStepState === 6 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 추천 이유만 간단히 */}
            <Card>
              <CardHeader>
                <CardTitle>추천 이유 확인</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">방금 본 추천 이유를 참고하여 설문에 답해주세요:</p>
                <SimpleExplanationDisplay
                  type={condition3}
                  explanation={experiment.explanations[condition3]}
                  persona={{
                    name: experiment.friendName,
                    age: experiment.friendAge,
                    gender: experiment.gender,
                    priceRange: experiment.priceRange,
                    emotionalState: experiment.emotionalState
                  }}
                />
              </CardContent>
            </Card>
            
            {/* 오른쪽: 설문 */}
            <div>
              <SurveyForm 
                onSubmit={handleSurveySubmit}
                conditionNumber={3}
                isLoading={saveSurveyMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Step 7: 최종 비교 설문 (경험한 순서대로 표시) */}
        {currentStepState === 7 && (
          <ComparisonForm
            condition1={condition1}
            condition2={condition2}
            condition3={condition3}
            explanation1={experiment.explanations[condition1]}
            explanation2={experiment.explanations[condition2]}
            explanation3={experiment.explanations[condition3]}
            onSubmit={handleComparisonSubmit}
            isLoading={saveComparisonMutation.isPending}
          />
        )}

        {/* Step 8: 인구통계학적 설문 */}
        {currentStepState === 8 && (
          <DemographicsForm
            onSubmit={handleDemographicsSubmit}
            isLoading={saveDemographicsMutation.isPending}
          />
        )}

        {/* Step 9: 완료 */}
        {currentStepState === 9 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-green-600">실험 완료!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-6xl">🎉</div>
              <p className="text-lg font-medium">실험에 참여해 주셔서 감사합니다!</p>
              <p className="text-gray-600">
                귀하의 소중한 의견이 AI 추천 시스템 개선에 큰 도움이 됩니다.
              </p>
              <Button 
                onClick={() => setLocation('/')}
                className="mt-6"
              >
                홈으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}