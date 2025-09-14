interface StepProgressProps {
  currentStep: number;
}

export default function StepProgress({ currentStep }: StepProgressProps) {
  const steps = currentStep === 5 ? [
    "정보 입력",
    "상품 추천", 
    "설명 비교",
    "선물하기",
    "설문 조사"
  ] : [
    "정보 입력",
    "상품 추천", 
    "설명 비교",
    "선물하기"
  ];

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">딱 맞는 선물 찾기</h2>
          <span className="text-sm text-neutral-600">{currentStep} / {steps.length}단계</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`flex-1 h-2 rounded-full transition-colors ${
                index + 1 <= currentStep ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-neutral-600 mt-2">
          {steps.map((step, index) => (
            <span key={index}>{step}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
