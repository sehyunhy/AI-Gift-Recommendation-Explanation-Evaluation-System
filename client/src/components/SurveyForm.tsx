import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SurveyFormProps {
  onSubmit: (data: any) => void;
  conditionNumber: number;
  isLoading: boolean;
}

interface SurveyData {
  // MC1: 설명 유형 인식 (단일 선택)
  mc1_explanationType: "feature" | "profile" | "intent" | "";
  // 설명 이해도 (4문항)
  comprehension1: number;
  comprehension2: number;
  comprehension3: number;
  comprehension4: number;
  // 정보 과부하 (4문항)
  overload1: number;
  overload2: number;
  overload3: number;
  overload4: number;
  // 제품-상황 적합성 (3문항)
  perceivedFit1: number;
  perceivedFit2: number;
  perceivedFit3: number;
  // 구매 의도 (3문항)
  purchaseIntent1: number;
  purchaseIntent2: number;
  purchaseIntent3: number;
}

const initialData: SurveyData = {
  // MC1: 설명 유형 인식
  mc1_explanationType: "",
  // 설명 이해도
  comprehension1: 0,
  comprehension2: 0,
  comprehension3: 0,
  comprehension4: 0,
  // 정보 과부하
  overload1: 0,
  overload2: 0,
  overload3: 0,
  overload4: 0,
  // 제품-상황 적합성
  perceivedFit1: 0,
  perceivedFit2: 0,
  perceivedFit3: 0,
  // 구매 의도
  purchaseIntent1: 0,
  purchaseIntent2: 0,
  purchaseIntent3: 0,
};

export function SurveyForm({
  onSubmit,
  conditionNumber,
  isLoading,
}: SurveyFormProps) {
  const [data, setData] = useState<SurveyData>(initialData);

  const questions = [
    {
      category: "MC1. 설명 유형 인식",
      description: "다음 각 문항 중 어떤 설명인지 골라주세요(중복 불가)",
      type: "radio",
      items: [
        {
          key: "feature",
          text: "방금 읽은 설명은 주로 제품의 기능/스펙 중심 설명이다.",
        },
        {
          key: "profile",
          text: "방금 읽은 설명은 통계적인 정보가 포함되어 있다.",
        },
        {
          key: "intent",
          text: "방금 읽은 설명은 선물 의도 정보가 포함되어 있다.",
        },
      ],
    },
    {
      category: "2-1) 설명 이해도 (Explanation Comprehension)",
      items: [
        { key: "comprehension1", text: "설명 내용을 명확히 이해할 수 있었다" },
        {
          key: "comprehension2",
          text: "설명과 제품 정보가 일관되었다고 느꼈다",
        },
        {
          key: "comprehension3",
          text: "설명에 구체적인 근거(수치, 사례, 기능 등)가 포함되어 있었다",
        },
        {
          key: "comprehension4",
          text: "설명만으로 충분히 이해할 수 있었고, 추가로 찾아볼 정보가 거의 없었다",
        },
      ],
    },
    {
      category: "2-2) 정보 과부하 (Information Overload)",
      items: [
        {
          key: "overload1",
          text: "이 설명을 이해하려면 정신적 노력이 많이 들었다",
        },
        {
          key: "overload2",
          text: "이 설명을 이해하기 위해 추가 노력(유사 제품 검색 혹은 새로운 제품 검색)이 필요했다",
        },
        {
          key: "overload3",
          text: "이 설명은 읽는 동안 답답하거나 짜증나는 느낌을 주었다",
        },
        { key: "overload4", text: "제시된 정보량이 과도했다" },
      ],
    },
    {
      category: "2-3) 제품–상황 적합성 (Perceived Fit)",
      items: [
        {
          key: "perceivedFit1",
          text: "이 제품은 수신자의 현재 상황이나 용도에 잘 어울린다고 생각된다",
        },
        {
          key: "perceivedFit2",
          text: "제품의 기능과 특성이 수신자의 필요를 충족한다고 느꼈다",
        },
        {
          key: "perceivedFit3",
          text: "이 선물은 수신자와의 관계 맥락을 고려했을 때 적절한 선택이라고 생각된다",
        },
      ],
    },
    {
      category: "3-1) 구매 의도 (Purchase Intention)",
      description:
        "설문은 추천 이유를 읽은 후  '누군가에게 선물을 준다'는 상황을 상상하며 답변하는 문항들입니다.",
      items: [
        {
          key: "purchaseIntent1",
          text: "이 제품을 선물로 구매할 의향이 있다.",
        },
        {
          key: "purchaseIntent2",
          text: "나는 가까운 시일 내에 이 제품을 선물로 구매할 가능성이 높다.",
        },
        {
          key: "purchaseIntent3",
          text: "유사한 상황이 생긴다면, 이 제품을 선물로 선택할 것이다.",
        },
      ],
    },
  ];

  const handleRatingChange = (key: keyof SurveyData, value: number) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    // MC1 단일 선택 확인
    if (!data.mc1_explanationType) {
      alert("MC1. 설명 유형 인식 에서 하나를 선택해주세요.");
      return;
    }

    // 나머지 모든 숭 항목이 응답되었는지 확인
    const numericValues = Object.entries(data)
      .filter(([key]) => key !== "mc1_explanationType")
      .map(([, value]) => value);

    const hasEmptyResponses = numericValues.some((value) => value === 0);
    if (hasEmptyResponses) {
      alert("모든 문항에 응답해주세요.");
      return;
    }

    onSubmit(data);
  };

  const ScaleButtons = ({
    questionKey,
    reverse = false,
  }: {
    questionKey: keyof SurveyData;
    reverse?: boolean;
  }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => handleRatingChange(questionKey, num)}
          className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
            data[questionKey] === num
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 max-h-screen overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle>설문 {conditionNumber}/2</CardTitle>
          <p className="text-sm text-gray-600">
            방금 본 설명에 대해 7점 척도로 평가해 주세요 (1: 전혀 그렇지 않다 ~
            7: 매우 그렇다)
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {questions.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {section.category}
                </h3>
                {section.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {section.description}
                  </p>
                )}
              </div>

              {/* MC1: 라디오 버튼 단일 선택 */}
              {section.type === "radio" ? (
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="mc1_explanationType"
                        value={item.key}
                        checked={data.mc1_explanationType === item.key}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            mc1_explanationType: e.target.value as any,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-base text-gray-700">
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                /* 기존 7점 스케일 */
                section.items.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <Label className="text-base flex items-center gap-2">
                      {item.text}
                      {(item as any).reverse && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                          (역채점)
                        </span>
                      )}
                    </Label>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 w-16">
                        전혀 그렇지
                        <br />
                        않다
                      </span>
                      <ScaleButtons
                        questionKey={item.key as keyof SurveyData}
                        reverse={(item as any).reverse}
                      />
                      <span className="text-xs text-gray-500 w-16">
                        매우
                        <br />
                        그렇다
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}

          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !data.mc1_explanationType ||
              Object.entries(data)
                .filter(([key]) => key !== "mc1_explanationType")
                .some(([, value]) => value === 0)
            }
            className="w-full"
            size="lg"
          >
            {isLoading ? "저장 중..." : "다음 단계로"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
