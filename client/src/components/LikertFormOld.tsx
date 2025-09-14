import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ExperimentResponse, ExplanationType } from "@/types/experiment";

interface LikertFormProps {
  explanationType: ExplanationType;
  stepIndex: number;
  onSubmit: (response: ExperimentResponse) => void;
}

export default function LikertForm({ explanationType, stepIndex, onSubmit }: LikertFormProps) {
  const [response, setResponse] = useState({
    trustCompetence: 0,
    trustBenevolence: 0,
    clarity: 0,
    empathy: 0,
    intentToGift: 0,
    satisfaction: 0,
    openFeedback: ""
  });

  const [startTime] = useState(Date.now());
  const [errors, setErrors] = useState<string[]>([]);

  const questions = [
    { key: 'trustCompetence', text: '이 설명은 전문적이고 신뢰할 만하다고 느껴졌습니다.' },
    { key: 'trustBenevolence', text: '이 설명은 수신자의 감정이나 선물하려는 이유를 고려한 것처럼 느껴졌습니다.' },
    { key: 'clarity', text: '이 설명은 추천의 이유를 명확하게 보여줍니다.' },
    { key: 'empathy', text: '이 설명은 감정적으로 공감되었습니다.' },
    { key: 'intentToGift', text: '이 설명을 보고 실제로 이 선물을 주고 싶다는 생각이 들었습니다.' },
    { key: 'satisfaction', text: '이 설명은 전반적으로 만족스러웠습니다.' }
  ];

  const handleSubmit = () => {
    const newErrors: string[] = [];
    questions.forEach(({ key }) => {
      if (!response[key as keyof typeof response]) {
        newErrors.push(key);
      }
    });

    setErrors(newErrors);

    if (newErrors.length === 0) {
      const experimentResponse: ExperimentResponse = {
        explanationType,
        stepIndex,
        trustCompetence: response.trustCompetence,
        trustBenevolence: response.trustBenevolence,
        clarity: response.clarity,
        empathy: response.empathy,
        intentToGift: response.intentToGift,
        satisfaction: response.satisfaction,
        openFeedback: response.openFeedback || undefined,
        responseTime: Date.now() - startTime
      };
      onSubmit(experimentResponse);
    }
  };

  const isFormValid = response.trustCompetence && response.trustBenevolence && response.clarity && 
                      response.empathy && response.intentToGift && response.satisfaction;

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-neutral-900 mb-4">이 설명에 대한 평가</h4>

          {/* Trust - Competence */}
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-3">
              이 설명은 전문적이고 신뢰할 만하다고 느껴졌습니다.
            </Label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">전혀 그렇지 않다</span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setResponse(prev => ({ ...prev, trustCompetence: value }))}
                    className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
                      response.trustCompetence === value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary/50'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500">매우 그렇다</span>
            </div>
          </div>

          {/* Trust - Benevolence */}
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-3">
              이 설명은 수신자의 감정이나 선물하려는 이유를 고려한 것처럼 느껴졌습니다.
            </Label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">전혀 그렇지 않다</span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setResponse(prev => ({ ...prev, trustBenevolence: value }))}
                    className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
                      response.trustBenevolence === value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary/50'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500">매우 그렇다</span>
            </div>
          </div>

          {/* Clarity (Transparency) */}
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-3">
              이 설명은 추천의 이유를 명확하게 보여줍니다.
            </Label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">전혀 그렇지 않다</span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setResponse(prev => ({ ...prev, clarity: value }))}
                    className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
                      response.clarity === value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary/50'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500">매우 그렇다</span>
            </div>
          </div>

          {/* Empathy */}
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-3">
              이 설명은 감정적으로 공감되었습니다.
            </Label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">전혀 그렇지 않다</span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setResponse(prev => ({ ...prev, empathy: value }))}
                    className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
                      response.empathy === value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary/50'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500">매우 그렇다</span>
            </div>
          </div>

          {/* Intent to Gift */}
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-3">
              이 설명을 보고 실제로 이 선물을 주고 싶다는 생각이 들었습니다.
            </Label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">전혀 그렇지 않다</span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setResponse(prev => ({ ...prev, intentToGift: value }))}
                    className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
                      response.intentToGift === value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary/50'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500">매우 그렇다</span>
            </div>
          </div>

          {/* Satisfaction */}
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-3">
              이 설명은 전반적으로 만족스러웠습니다.
            </Label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">전혀 그렇지 않다</span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setResponse(prev => ({ ...prev, satisfaction: value }))}
                    className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
                      response.satisfaction === value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary/50'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500">매우 그렇다</span>
            </div>
          </div>

          {/* 자유 응답 */}
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-2">
              좋았던 점이나 아쉬운 점을 자유롭게 적어주세요 (선택사항)
            </Label>
            <Textarea
              value={response.openFeedback}
              onChange={(e) => setResponse(prev => ({ ...prev, openFeedback: e.target.value }))}
              placeholder="이 설명에서 인상 깊었던 부분이나 개선할 점이 있다면 알려주세요"
              className="h-20 resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full py-3"
          >
            다음 설명 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}