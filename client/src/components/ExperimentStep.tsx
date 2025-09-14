import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getExplanationConfig } from "@/utils/latinSquare";
import ExplanationCard from "./ExplanationCard";
import type { ExperimentSession, ExperimentResponse, ExplanationType } from "@/types/experiment";

interface ExperimentStepProps {
  session: ExperimentSession;
  onStepComplete: (response: ExperimentResponse) => void;
  onExperimentComplete: () => void;
}

export default function ExperimentStep({ session, onStepComplete, onExperimentComplete }: ExperimentStepProps) {
  const getExplanationByType = (type: ExplanationType): string => {
    switch (type) {
      case 'featureFocused': return session.explanations.featureFocused;
      case 'profileBased': return session.explanations.profileBased;
      case 'contextBased': return session.explanations.contextBased;
      default: return '';
    }
  };

  // 단일 설명만 표시 (order 배열에서 첫 번째 하나만)
  const selectedExplanationType = session.order[0];
  const selectedExplanation = getExplanationByType(selectedExplanationType);

  // 로딩 상태 체크
  if (!session.explanations.featureFocused || !selectedExplanationType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl mr-3">🎯</span>
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <p className="text-neutral-600 text-lg">AI가 설명을 준비하고 있습니다...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b shadow-sm py-6">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">선물 추천 설명</h1>
          <p className="text-lg text-neutral-600">아래 설명을 확인해주세요</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 단일 설명 */}
        <div className="mb-8">
          <ExplanationCard
            product={session.product}
            explanation={selectedExplanation}
            type={selectedExplanationType}
            isActive={true}
            sessionId={session.id}
          />
        </div>

        {/* 실험 종료 버튼 */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-4">설명을 확인하셨습니다</h3>
              <Button
                onClick={() => {
                  console.log('실험 종료 버튼 클릭');
                  onExperimentComplete();
                }}
                className="px-8 py-3 text-lg"
                size="lg"
              >
                실험을 종료하시겠습니까?
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}