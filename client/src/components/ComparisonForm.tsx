import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ExplanationType } from '@shared/schema';

interface ComparisonFormProps {
  condition1: ExplanationType;
  condition2: ExplanationType;
  condition3: ExplanationType;
  explanation1: string;
  explanation2: string;
  explanation3: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

interface FinalEvaluationData {
  // [1] 조작점검
  differentInfoMethods: boolean | null;
  clearDifferences: boolean | null;
  
  // [2] 설명 유형 비교 평가
  mostComprehensible: ExplanationType | null;
  mostOverloaded: ExplanationType | null;
  personalPreference: ExplanationType | null;
  
  // [2-3] 설명 적합성 평가
  bestGiftAppropriatenessExplanation: ExplanationType | null;
}

export function ComparisonForm({ 
  condition1, 
  condition2, 
  condition3,
  explanation1, 
  explanation2, 
  explanation3,
  onSubmit, 
  isLoading 
}: ComparisonFormProps) {
  const [data, setData] = useState<FinalEvaluationData>({
    // [1] 조작점검
    differentInfoMethods: null,
    clearDifferences: null,
    
    // [2] 설명 유형 비교 평가
    mostComprehensible: null,
    mostOverloaded: null,
    personalPreference: null,
    
    // [2-3] 설명 적합성 평가
    bestGiftAppropriatenessExplanation: null,
  });

  const updateData = (field: keyof FinalEvaluationData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const getTypeLabel = (type: ExplanationType): string => {
    switch (type) {
      case 'featureFocused': return '기능 기반 설명';
      case 'profileBased': return '프로필 기반 설명';
      case 'contextBased': return '선물 의도 기반 설명';
      default: return '설명';
    }
  };

  const handleSubmit = () => {
    // 모든 필수 항목 체크
    if (data.differentInfoMethods === null || data.clearDifferences === null ||
        !data.mostComprehensible || !data.mostOverloaded || 
        !data.personalPreference || !data.bestGiftAppropriatenessExplanation) {
      alert('모든 항목을 완성해주세요.');
      return;
    }

    onSubmit(data);
  };

  const RatingScale = ({ value, onChange, label }: { value: number; onChange: (val: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-16">전혀 그렇지 않다</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`w-8 h-8 rounded-full border text-xs font-medium transition-colors ${
                value === num
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 w-16">매우 그렇다</span>
      </div>
    </div>
  );

  const RadioGroup = ({ value, onChange, options, label }: { 
    value: ExplanationType | null; 
    onChange: (val: ExplanationType) => void; 
    options: ExplanationType[];
    label: string;
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
            <input
              type="radio"
              checked={value === option}
              onChange={() => onChange(option)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">{getTypeLabel(option)}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const SelectionRadioGroup = ({ value, onChange, options, label }: { 
    value: ExplanationType | null; 
    onChange: (val: ExplanationType) => void; 
    options: { value: ExplanationType; label: string }[];
    label: string;
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
            <input
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 max-h-screen overflow-y-auto">
      {/* 경험한 설명 순서대로 다시 표시 */}
      <Card>
        <CardHeader>
          <CardTitle>📝 최종 평가 설문</CardTitle>
          <p className="text-gray-600">
            지금까지 경험하신 세 가지 설명을 다시 한번 확인해보세요.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 첫 번째 설명 */}
            <div className="border-2 rounded-lg p-5 bg-white" style={{borderColor: '#80CBC4'}}>
              <h4 className="font-semibold text-base mb-3 text-gray-800">{getTypeLabel(condition1)}</h4>
              <div 
                className="text-sm leading-relaxed text-gray-800"
                dangerouslySetInnerHTML={{ __html: explanation1 }}
              />
            </div>
            
            {/* 두 번째 설명 */}
            <div className="border-2 rounded-lg p-5 bg-white" style={{borderColor: '#FFCCBC'}}>
              <h4 className="font-semibold text-base mb-3 text-gray-800">{getTypeLabel(condition2)}</h4>
              <div 
                className="text-sm leading-relaxed text-gray-800"
                dangerouslySetInnerHTML={{ __html: explanation2 }}
              />
            </div>
            
            {/* 세 번째 설명 */}
            <div className="border-2 rounded-lg p-5 bg-white" style={{borderColor: '#C5E1A5'}}>
              <h4 className="font-semibold text-base mb-3 text-gray-800">{getTypeLabel(condition3)}</h4>
              <div 
                className="text-sm leading-relaxed text-gray-800"
                dangerouslySetInnerHTML={{ __html: explanation3 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>✅ [1] 조작점검 (Manipulation Check)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">세 가지 설명은 서로 다른 방식으로 정보를 제공한다고 느꼈다.</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                <input
                  type="radio"
                  checked={data.differentInfoMethods === true}
                  onChange={() => updateData('differentInfoMethods', true)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">예</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                <input
                  type="radio"
                  checked={data.differentInfoMethods === false}
                  onChange={() => updateData('differentInfoMethods', false)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">아니오</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">세 가지 설명 유형 간 차이가 명확하게 느껴졌다.</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                <input
                  type="radio"
                  checked={data.clearDifferences === true}
                  onChange={() => updateData('clearDifferences', true)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">예</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                <input
                  type="radio"
                  checked={data.clearDifferences === false}
                  onChange={() => updateData('clearDifferences', false)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">아니오</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>✅ [2] 설명 유형 비교 평가</CardTitle>
          <p className="text-gray-600">
            위에서 다시 확인하신 세 가지 설명 유형에 대해 다음 문항에 응답해 주세요. 각 문항에는 하나만 선택해 주세요.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={data.mostComprehensible}
            onChange={(val) => updateData('mostComprehensible', val)}
            options={[condition1, condition2, condition3]}
            label="가장 이해하기 쉬웠던 설명은 무엇이었나요?"
          />
          
          <RadioGroup
            value={data.mostOverloaded}
            onChange={(val) => updateData('mostOverloaded', val)}
            options={[condition1, condition2, condition3]}
            label="가장 정보가 과하다고 느꼈던 설명은 무엇이었나요?"
          />
          
          <RadioGroup
            value={data.bestGiftAppropriatenessExplanation}
            onChange={(val) => updateData('bestGiftAppropriatenessExplanation', val)}
            options={[condition1, condition2, condition3]}
            label='세 가지 설명 중, "이 제품이 선물로 잘 어울리겠다"라는 느낌을 가장 잘 전달한 설명은 무엇입니까?'
          />
          
          <RadioGroup
            value={data.personalPreference}
            onChange={(val) => updateData('personalPreference', val)}
            options={[condition1, condition2, condition3]}
            label="개인적으로 가장 선호하는 설명 방식은 무엇이었나요?"
          />
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? '제출 중...' : '설문 완료하기'}
        </Button>
      </div>
    </div>
  );
}