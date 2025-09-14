import { useState } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ExperimentResponse, ExplanationType } from "@/types/experiment";

interface LikertFormProps {
  explanationType: ExplanationType;
  stepIndex: number;
  onSubmit: (response: ExperimentResponse) => void;
}

export default function LikertForm({ explanationType, stepIndex, onSubmit }: LikertFormProps) {
  // 스크롤 방지 전역 설정
  React.useEffect(() => {
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function() {
      // scrollIntoView 호출 차단
      return;
    };
    
    return () => {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    };
  }, []);
  const [response, setResponse] = useState({
    trustCompetence1: 0,
    trustCompetence2: 0,
    trustCompetence3: 0,
    trustCompetence4: 0,
    trustBenevolence1: 0,
    trustBenevolence2: 0,
    trustBenevolence3: 0,
    trustBenevolence4: 0,
    trustIntegrity1: 0,
    trustIntegrity2: 0,
    trustIntegrity3: 0,
    trustIntegrity4: 0,
    transparency1: 0,
    transparency2: 0,
    transparency3: 0,
    transparency4: 0,
    behavioral1: 0,
    behavioral2: 0,
    behavioral3: 0,
    openFeedback: ""
  });

  const [startTime] = useState(Date.now());
  const [errors, setErrors] = useState<string[]>([]);

  const questionGroups = [
    {
      title: '신뢰 - 역량',
      questions: [
        { key: 'trustCompetence1', text: '설명은 선물 받는 사람의 상황과 특징을 잘 반영했습니다.' },
        { key: 'trustCompetence2', text: '설명은 선물 대상자의 취향과 필요를 이해했다고 느꼈습니다.' },
        { key: 'trustCompetence3', text: '설명은 신뢰할 만한 근거에 기반해 있었습니다.' },
        { key: 'trustCompetence4', text: '설명은 전문성이 부족하다고 느꼈습니다.', reversed: true }
      ]
    },
    {
      title: '신뢰 - 선의',
      questions: [
        { key: 'trustBenevolence1', text: '설명은 제가 좋은 선물을 고를 수 있도록 돕는 태도를 보였습니다.' },
        { key: 'trustBenevolence2', text: '설명은 선물 받는 사람에게 실제 도움이 되려는 의도가 담겨 있었습니다.' },
        { key: 'trustBenevolence3', text: '설명은 저와 선물 받는 사람의 관심사와 상황을 고려했습니다.' },
        { key: 'trustBenevolence4', text: '설명은 제 이익보다는 시스템의 편의를 우선시했습니다.', reversed: true }
      ]
    },
    {
      title: '신뢰 - 진실성',
      questions: [
        { key: 'trustIntegrity1', text: '설명은 공정하고 편향 없이 제시되었습니다.' },
        { key: 'trustIntegrity2', text: '설명은 정직하고 투명하게 전달되었습니다.' },
        { key: 'trustIntegrity3', text: '설명은 과장이나 왜곡 없이 사실 그대로 제시되었습니다.' },
        { key: 'trustIntegrity4', text: '설명은 불확실한 부분을 숨겼습니다.', reversed: true }
      ]
    },
    {
      title: '투명성 - 이해가능성',
      questions: [
        { key: 'transparency1', text: '어떤 데이터와 근거가 사용되었는지 알 수 있었습니다.' },
        { key: 'transparency2', text: '추천이 어떻게 만들어졌는지 대략적으로 이해할 수 있었습니다.' },
        { key: 'transparency3', text: '데이터 출처(선물 이유, 선호, 유사 사용자 등)가 명확히 드러났습니다.' },
        { key: 'transparency4', text: '설명을 보고도 추천 근거를 이해하기 어려웠습니다.', reversed: true }
      ]
    },
    {
      title: '행동 의도',
      questions: [
        { key: 'behavioral1', text: '이 설명을 바탕으로, 해당 선물을 실제로 구매할 의향이 있습니다.' },
        { key: 'behavioral2', text: '이 설명을 바탕으로, 유사한 상황에서 이 시스템을 다시 이용할 것입니다.' },
        { key: 'behavioral3', text: '이 설명을 바탕으로, 이 추천을 다른 사람에게도 소개하고 싶습니다.' }
      ]
    }
  ];

  const allQuestions = questionGroups.flatMap(group => group.questions);

  const handleSubmit = () => {
    const newErrors: string[] = [];
    allQuestions.forEach(({ key }) => {
      if (!response[key as keyof typeof response]) {
        newErrors.push(key);
      }
    });

    setErrors(newErrors);

    if (newErrors.length === 0) {
      const experimentResponse: ExperimentResponse = {
        explanationType,
        stepIndex,
        trustCompetence1: response.trustCompetence1,
        trustCompetence2: response.trustCompetence2,
        trustCompetence3: response.trustCompetence3,
        trustCompetence4: response.trustCompetence4,
        trustBenevolence1: response.trustBenevolence1,
        trustBenevolence2: response.trustBenevolence2,
        trustBenevolence3: response.trustBenevolence3,
        trustBenevolence4: response.trustBenevolence4,
        trustIntegrity1: response.trustIntegrity1,
        trustIntegrity2: response.trustIntegrity2,
        trustIntegrity3: response.trustIntegrity3,
        trustIntegrity4: response.trustIntegrity4,
        transparency1: response.transparency1,
        transparency2: response.transparency2,
        transparency3: response.transparency3,
        transparency4: response.transparency4,
        behavioral1: response.behavioral1,
        behavioral2: response.behavioral2,
        behavioral3: response.behavioral3,
        openFeedback: response.openFeedback || undefined,
        responseTime: Date.now() - startTime
      };
      onSubmit(experimentResponse);
    }
  };

  return (
    <div className="space-y-6 overflow-visible w-full max-w-full p-2">
      {/* New CSS Variables - simplified */}
      <style>{`
        .q { 
          display: grid; 
          row-gap: 10px; 
        }
        
        .scale { 
          display: grid; 
          grid-template-columns: repeat(7, minmax(40px, 1fr)); 
          gap: 8px; 
          max-width: 420px;
          margin: 0 auto;
          width: 100%;
        }
        
        .dot { 
          aspect-ratio: 1/1; 
          min-width: 40px; 
          min-height: 40px;
          border-radius: 9999px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border: 2px solid #d1d5db;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          font-size: 15px;
          color: #374151;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .dot:hover {
          border-color: #ef4444;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .dot[data-checked="true"] {
          background-color: #ef4444;
          border-color: #ef4444;
          color: white;
          font-weight: 700;
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(239, 68, 68, 0.3);
        }
        
        .dot[data-error="true"] {
          border-color: #fca5a5;
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .question-text {
          word-break: keep-all;
          line-height: 1.5;
        }
        
        @media (max-width: 640px) {
          .scale {
            grid-template-columns: repeat(7, minmax(32px, 1fr));
            gap: 6px;
            max-width: 320px;
          }
          .dot {
            min-width: 32px;
            min-height: 32px;
            font-size: 13px;
          }
        }
        
        @media (max-width: 480px) {
          .scale {
            grid-template-columns: repeat(7, minmax(28px, 1fr));
            gap: 4px;
            max-width: 260px;
          }
          .dot {
            min-width: 28px;
            min-height: 28px;
            font-size: 12px;
          }
        }
        
        /* 스크롤 방지 - 강화 */
        .scale input:focus {
          outline: none !important;
          scroll-behavior: auto !important;
        }
        
        .scale label {
          scroll-margin: 0 !important;
          scroll-margin-top: 0 !important;
          scroll-margin-bottom: 0 !important;
        }
        
        /* 전체 스크롤 동작 억제 */
        .q input[type="radio"] {
          scroll-behavior: auto !important;
        }
        
        /* 포커스 시 스크롤 방지 */
        .q fieldset {
          scroll-margin: 0 !important;
        }
      `}</style>

      <h4 className="text-xl font-semibold text-neutral-900 mb-4">이 설명에 대한 평가</h4>
      
      <div id="scale-description" className="sr-only">
        7점 척도에서 1은 전혀 그렇지 않다, 7은 매우 그렇다를 의미합니다.
      </div>

      {questionGroups.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="space-y-6">
          {/* 그룹 제목 - 숨김 처리 */}
          <h5 className="sr-only">
            {group.title}
          </h5>
          
          {/* 그룹 내 질문들 */}
          {group.questions.map(({ key, text, reversed }, index) => {
            const hasError = errors.includes(key);
            return (
              <fieldset 
                key={`${explanationType}-${key}`}
                className={`q p-5 rounded-lg ${hasError ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}
              >
                {/* Question text - prioritized */}
                <legend className="question-text text-lg font-medium text-neutral-700 mb-3">
                  {text}
                  {hasError && <span className="text-red-600 ml-2">* 필수 응답</span>}
                </legend>
                
                {/* Horizontal labels - 중앙 정렬 및 줄임 */}
                <div className="flex justify-between text-sm text-slate-500 mb-3 max-w-[420px] mx-auto">
                  <span>전혀 그렇지 않다</span>
                  <span>매우 그렇다</span>
                </div>

                {/* Scale - below question text */}
                <div className="scale">
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <label
                      key={value}
                      htmlFor={`${explanationType}-${key}-${value}`}
                      className="dot"
                      data-checked={response[key as keyof typeof response] === value}
                      data-error={hasError}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setResponse(prev => ({ ...prev, [key]: value }));
                        setErrors(prev => prev.filter(err => err !== key));
                      }}
                    >
                      <input
                        type="radio"
                        id={`${explanationType}-${key}-${value}`}
                        name={`${explanationType}-${key}`}
                        value={value}
                        checked={response[key as keyof typeof response] === value}
                        onChange={() => {
                          // onChange는 label 클릭으로 처리됨
                        }}
                        onFocus={(e) => {
                          try {
                            e.target.blur();
                          } catch (err) {
                            // 에러 무시
                          }
                        }}
                        className="sr-only"
                        aria-describedby="scale-description"
                      />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}
        </div>
      ))}

      {/* Open feedback */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-neutral-700">
          추가 의견이 있으시면 자유롭게 적어주세요 (선택사항)
        </Label>
        <Textarea
          value={response.openFeedback}
          onChange={(e) => setResponse(prev => ({ ...prev, openFeedback: e.target.value }))}
          placeholder="이 설명에 대한 생각이나 개선 의견을 자유롭게 적어주세요..."
          className="h-20 resize-none"
        />
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">
            모든 문항에 응답해주세요. ({errors.length}개 문항 미응답)
          </p>
        </div>
      )}

      <Button 
        onClick={handleSubmit}
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3"
      >
        {stepIndex < 2 ? '다음 설명 평가하기' : '평가 완료'}
      </Button>
    </div>
  );
}