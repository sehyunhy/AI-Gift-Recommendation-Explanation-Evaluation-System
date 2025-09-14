import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DemographicsFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

interface DemographicsData {
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
  phone: string;
  giftShoppingFrequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'always' | '';
  // 카카오톡 선물하기 관련 질문들
  priceImportance: number; // 1-7 척도
  qualityImportance: number; // 1-7 척도
  relationshipImportance: number; // 1-7 척도 (취향 적합성)
  relationshipIntimacy: number; // 1-7 척도 (관계 친밀도)
  hasUsedKakaoGift: boolean | null; // null, true, false
  giftSituations: string[]; // 복수 선택
  giftMindset: string; // 단일 선택
}

export function DemographicsForm({ onSubmit, isLoading }: DemographicsFormProps) {
  const [data, setData] = useState<DemographicsData>({
    age: 0,
    gender: '',
    phone: '',
    giftShoppingFrequency: '',
    priceImportance: 0,
    qualityImportance: 0,
    relationshipImportance: 0,
    relationshipIntimacy: 0,
    hasUsedKakaoGift: null,
    giftSituations: [],
    giftMindset: ''
  });

  const handleSubmit = () => {
    if (!data.age || data.age < 18 || !data.gender || !data.phone || !data.giftShoppingFrequency ||
        !data.priceImportance || !data.qualityImportance || !data.relationshipImportance ||
        !data.relationshipIntimacy || data.hasUsedKakaoGift === null || !data.giftMindset) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    // 카카오톡 선물하기 사용 경험이 있는 경우에만 상황 선택 필수
    if (data.hasUsedKakaoGift && data.giftSituations.length === 0) {
      alert('선물한 상황을 하나 이상 선택해주세요.');
      return;
    }

    onSubmit(data);
  };

  const toggleGiftSituation = (situation: string) => {
    setData(prev => ({
      ...prev,
      giftSituations: prev.giftSituations.includes(situation)
        ? prev.giftSituations.filter(s => s !== situation)
        : [...prev.giftSituations, situation]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>마지막 단계: 참가자 정보</CardTitle>
        <p className="text-gray-600">
          연구 사례비 지급을 위해 기본 인적사항을 수집합니다. <strong>모든 개인정보는 연구 목적으로만 활용되며, 암호화 처리됩니다.</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 나이 */}
        <div>
          <Label htmlFor="age" className="text-base font-medium">나이</Label>
          <Input
            id="age"
            type="number"
            min="18"
            max="100"
            value={data.age || ''}
            onChange={(e) => setData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
            className="mt-2"
            placeholder="예: 25"
          />
        </div>

        {/* 성별 */}
        <div>
          <Label className="text-base font-medium">성별</Label>
          <Select 
            value={data.gender} 
            onValueChange={(value) => setData(prev => ({ ...prev, gender: value as any }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="성별을 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">남성</SelectItem>
              <SelectItem value="female">여성</SelectItem>
              <SelectItem value="other">기타</SelectItem>
              <SelectItem value="prefer_not_to_say">응답하지 않음</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 전화번호 */}
        <div>
          <Label htmlFor="phone" className="text-base font-medium">전화번호</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-2"
            placeholder="예: 010-1234-5678"
            maxLength={15}
          />
          <p className="text-xs text-gray-500 mt-1">사례비 지급 목적으로만 사용됩니다</p>
        </div>

        {/* 선물 쇼핑 빈도 */}
        <div>
          <Label className="text-base font-medium">선물 쇼핑 빈도</Label>
          <Select 
            value={data.giftShoppingFrequency} 
            onValueChange={(value) => setData(prev => ({ ...prev, giftShoppingFrequency: value as any }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="선물을 사는 빈도를 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">전혀 안 함</SelectItem>
              <SelectItem value="rarely">거의 안 함 (연 1-2회)</SelectItem>
              <SelectItem value="sometimes">가끔 함 (월 1-2회)</SelectItem>
              <SelectItem value="often">자주 함 (주 1-2회)</SelectItem>
              <SelectItem value="always">매우 자주 함 (거의 매일)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 카카오톡 선물하기 관련 질문들 */}
        <div className="pt-6 border-t border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">카카오톡 선물하기 관련 질문</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              앞선 실험과는 별도로, 카카오톡 선물하기 경험에 대해 몇 가지 간단한 질문을 드리려고 합니다.<br/>
              깊이 생각하지 않으셔도 되고, 평소 떠오르는 생각을 편하게 답해 주시면 됩니다.<br/>
              모든 응답은 익명으로 처리되며, 연구 외의 목적으로 사용되지 않습니다.
            </p>
          </div>

          {/* 선물할 때 고려하는 요소 */}
          <div className="mb-8">
            <h4 className="font-medium mb-4">선물할 때 고려하는 요소</h4>
            <p className="text-sm text-gray-600 mb-4">
              카카오톡 선물하기를 사용할 때, 다음 요소들은 얼마나 중요하다고 생각하시나요?<br/>
              (1=전혀 중요하지 않다, 7=매우 중요하다)
            </p>

            {/* 가격 적절성 */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">가격 적절성: 예산에 맞는지</Label>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500">전혀 중요하지 않다</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <button
                      key={num}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                        data.priceImportance === num
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                      onClick={() => setData(prev => ({ ...prev, priceImportance: num }))}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-500">매우 중요하다</span>
              </div>
            </div>

            {/* 상품 품질 및 신뢰성 */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">상품 품질 및 신뢰성: 브랜드/리뷰에 대한 신뢰 여부</Label>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500">전혀 중요하지 않다</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <button
                      key={num}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                        data.qualityImportance === num
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                      onClick={() => setData(prev => ({ ...prev, qualityImportance: num }))}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-500">매우 중요하다</span>
              </div>
            </div>

            {/* 상대방과의 취향 적합성 */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">상대방과의 취향 적합성: 받는 사람의 상황·취향에 어울리는지</Label>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500">전혀 중요하지 않다</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <button
                      key={num}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                        data.relationshipImportance === num
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                      onClick={() => setData(prev => ({ ...prev, relationshipImportance: num }))}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-500">매우 중요하다</span>
              </div>
            </div>

            {/* 상대방과의 관계 친밀도 */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">상대방과의 관계 친밀도: 받는 사람과 나의 관계가 친밀한지</Label>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500">전혀 중요하지 않다</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <button
                      key={num}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                        data.relationshipIntimacy === num
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                      onClick={() => setData(prev => ({ ...prev, relationshipIntimacy: num }))}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-500">매우 중요하다</span>
              </div>
            </div>
          </div>

          {/* 최근 선물 경험 */}
          <div className="mb-6">
            <h4 className="font-medium mb-4">최근 선물 경험</h4>
            
            {/* 카카오톡 선물하기 사용 경험 */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">지난 1년 안에 카카오톡 선물하기를 사용한 적이 있습니까?</Label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded border transition-colors ${
                    data.hasUsedKakaoGift === true
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                  onClick={() => setData(prev => ({ ...prev, hasUsedKakaoGift: true, giftSituations: prev.hasUsedKakaoGift === true ? prev.giftSituations : [] }))}
                >
                  예
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded border transition-colors ${
                    data.hasUsedKakaoGift === false
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                  onClick={() => setData(prev => ({ ...prev, hasUsedKakaoGift: false, giftSituations: [] }))}
                >
                  아니오
                </button>
              </div>
            </div>

            {/* 선물 상황 (카카오톡 선물하기 사용 경험이 있는 경우에만 표시) */}
            {data.hasUsedKakaoGift === true && (
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">사용한 경우, 어떤 상황에서 선물을 하셨나요? (복수 선택 가능)</Label>
                <div className="space-y-2">
                  {[
                    { value: 'birthday', label: '생일' },
                    { value: 'anniversary', label: '기념일(결혼기념일, 연인 기념일 등)' },
                    { value: 'gratitude', label: '감사 인사(선물로 마음 표현)' },
                    { value: 'spontaneous', label: '즉흥적/가볍게(큰 이유 없이)' },
                    { value: 'other', label: '기타' }
                  ].map(situation => (
                    <label key={situation.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.giftSituations.includes(situation.value)}
                        onChange={() => toggleGiftSituation(situation.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm">{situation.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 선물할 때 주된 생각 */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">선물할 때 상대방을 떠올리며 주로 어떤 생각을 하셨나요? (하나 선택)</Label>
              <div className="space-y-2">
                {[
                  { value: 'practical', label: '"실용적으로 쓸 수 있으면 좋겠다"' },
                  { value: 'preference', label: '"상대방이 좋아할 만한 취향에 맞춰야겠다"' },
                  { value: 'special', label: '"특별한 느낌을 주고 싶다"' },
                  { value: 'budget', label: '"가격이 너무 부담되지 않게 해야겠다"' },
                  { value: 'convenient', label: '"그냥 편하게, 빠르게 보내자"' }
                ].map(mindset => (
                  <label key={mindset.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="giftMindset"
                      value={mindset.value}
                      checked={data.giftMindset === mindset.value}
                      onChange={(e) => setData(prev => ({ ...prev, giftMindset: e.target.value }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm">{mindset.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !data.age || !data.gender || !data.phone || !data.giftShoppingFrequency ||
                   !data.priceImportance || !data.qualityImportance || !data.relationshipImportance ||
                   data.hasUsedKakaoGift === null || !data.giftMindset ||
                   (data.hasUsedKakaoGift && data.giftSituations.length === 0)}
          className="w-full"
          size="lg"
        >
          {isLoading ? '제출 중...' : '실험 완료하기'}
        </Button>
      </CardContent>
    </Card>
  );
}