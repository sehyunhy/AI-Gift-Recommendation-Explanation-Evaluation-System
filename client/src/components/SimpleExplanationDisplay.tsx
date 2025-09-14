import { Card, CardContent } from '@/components/ui/card';
import type { ExplanationType } from '@shared/schema';

interface SimpleExplanationDisplayProps {
  type: ExplanationType;
  explanation: string;
  persona: {
    name: string;
    age: number;
    gender: string;
    priceRange: string;
    emotionalState?: string;
  };
}

export function SimpleExplanationDisplay({ 
  type, 
  explanation, 
  persona
}: SimpleExplanationDisplayProps) {
  
  const getTypeLabel = (type: ExplanationType): string => {
    switch (type) {
      case 'featureFocused': return '제품 기능 중심';
      case 'profileBased': return 'Profile 기반';
      case 'contextBased': return '맥락 기반';
      default: return '설명';
    }
  };

  const getBorderColor = (type: ExplanationType): string => {
    switch (type) {
      case 'featureFocused': return 'border-gray-500';
      case 'profileBased': return 'border-blue-500';
      case 'contextBased': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  const getBackgroundColor = (type: ExplanationType): string => {
    return 'bg-white';
  };

  return (
    <Card 
      className={`border-2 ${getBorderColor(type)} bg-white shadow-lg`}
      data-testid={`explanation-card-${type}`}
    >
      <CardContent className="p-6">
        {/* 선물 받을 친구 정보 */}
        <div className="bg-white border border-blue-200 rounded-xl p-4 mb-4">
          <div className="font-medium text-blue-900 mb-1">선물 받을 친구</div>
          <div className="text-blue-800 text-sm">
            {persona.name}님 • {persona.age}세 {persona.gender}성 • {persona.priceRange}
            {persona.emotionalState && ` • ${persona.emotionalState}`}
          </div>
        </div>

        {/* 추천 이유 텍스트만 표시 */}
        <div 
          className={`${getBackgroundColor(type)} border ${getBorderColor(type)} rounded-xl p-4`}
          data-testid={`explanation-text-${type}`}
        >
          <h4 className="font-semibold mb-3 text-base text-gray-800">추천 이유</h4>
          <div 
            className="text-base leading-relaxed text-gray-700"
            dangerouslySetInnerHTML={{ __html: explanation }}
          />
        </div>
      </CardContent>
    </Card>
  );
}