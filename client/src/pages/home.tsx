import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PersonaData {
  name: string;
  age: number;
  gender: '남' | '여' | '';
  priceRange: string;
  emotionalState: string;
}

export default function Home() {
  const [showConsentForm, setShowConsentForm] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [persona, setPersona] = useState<PersonaData>({
    name: '',
    age: 0,
    gender: '',
    priceRange: '3만원대', // 고정값
    emotionalState: ''
  });

  // 새로운 Within-subject 실험 시작
  const startExperimentMutation = useMutation({
    mutationFn: async (personaData: PersonaData) => {
      const response = await apiRequest('POST', '/api/experiment/start', personaData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: '실험이 시작됩니다!', 
        description: '잠시 후 첫 번째 설명을 보여드리겠습니다.' 
      });
      setLocation(`/experiment/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: '실험 시작 실패',
        description: error.message || '다시 시도해주세요.',
        variant: 'destructive'
      });
    }
  });

  const handleStartExperiment = () => {
    if (!persona.name || !persona.age || !persona.gender || !persona.emotionalState.trim()) {
      toast({
        title: '정보를 완성해주세요',
        description: '모든 필수 항목을 입력해주세요.',
        variant: 'destructive'
      });
      return;
    }

    startExperimentMutation.mutate(persona);
  };

  // 연구 실험 안내문 화면
  if (showConsentForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">LLM 기반 사용자 경험 실험에 관한 안내문</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 leading-relaxed">
              <div className="space-y-4">
                <p>안녕하세요, 본 연구는 <strong>생성형 AI(LLM) 기반 선물 추천 설명 방식</strong>이 사용자 경험(설명 이해도, 정보 과부하, 제품–상황 적합성, 구매 의도)에 미치는 영향을 탐구하기 위해 진행됩니다.</p>
                
                <p>참가자 여러분께서는 온라인 플랫폼을 통해 여러 유형의 설명을 확인하고 간단한 설문에 응답하게 됩니다. 실험은 약 15분 내외가 소요되며, 모든 응답은 익명으로 처리됩니다. 제공해주신 인적 사항은 연구 목적에 한해 활용되며, 외부로 절대 공개되지 않습니다.</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h3 className="font-bold text-lg text-blue-900 mb-3">실험 세부 내용</h3>
                <ul className="space-y-2 text-blue-800">
                  <li><strong>참여 절차</strong>: 온라인 접속 → 수신자 정보 입력→설명 확인 → 설문 응답</li>
                  <li><strong>소요 시간</strong>: 약 15분</li>
                  <li><strong>참가 보상</strong>:</li>
                  <ul className="ml-6 mt-2 space-y-1">
                    <li>• 실험 완료 시 <strong>1인당 10,000원</strong>의 소정의 사례비 지급</li>
                    <li>• 웹 실험과 인터뷰를 함께 진행 시 1인당 <strong>20,000원</strong>의 소정의 사례비 지급</li>
                    <li>• 지급은 실험 종료 후 연구자가 안내한 방식(계좌 이체 등)을 통해 제공</li>
                  </ul>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <h3 className="font-bold text-lg text-green-900 mb-3">연구 목적</h3>
                <p className="text-green-800">본 연구는 생성형 AI 기반 설명 방식이 사용자 인지적 경험과 구매 의도 형성에 어떤 차이를 만드는지 검증하여, 향후 AI 서비스의 UX 설계 및 사용자 신뢰 연구에 기여하고자 합니다.</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-3">연구자 정보</h3>
                <div className="text-gray-800 space-y-1">
                  <p><strong>소속</strong>: 한양대학교 기술경영전문대학원 기술경영학과 석사과정 재학</p>
                  <p><strong>지도교수</strong>: 한지은</p>
                  <p><strong>연구자</strong>: 이세현</p>
                  <p><strong>연락처</strong>: 010-5273-3248</p>
                  <p><strong>이메일</strong>: tpgus343@hanyang.ac.kr</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">참가해주시는 여러분의 귀중한 응답은 연구 목적 외의 용도로 사용되지 않으며, 연구 윤리 지침을 준수하여 철저히 관리됩니다.</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">연구에 도움을 주시는 모든 분들께 진심으로 감사드립니다.</p>
                <p className="text-sm font-medium text-gray-800">2025년 9월</p>
                <p className="text-sm font-medium text-gray-800">연구 책임자 이세현 드림</p>
              </div>
              
              <Button 
                onClick={() => setShowConsentForm(false)}
                className="w-full"
                size="lg"
              >
                참여하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 친구 정보 입력 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🎁</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI 선물 추천 설명 비교 실험</h1>
            <p className="text-gray-600 mt-2">소요 시간: 약 8-10분</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 실험 소개 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>실험 참여에 감사드립니다!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">실험 진행 방식</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• 세 가지 AI 설명 방식을 순서대로 보여드립니다</li>
                <li>• 각 설명을 본 후 간단한 설문에 응답해 주세요</li>
                <li>• 마지막에 세 설명을 비교하여 선호도를 선택해 주세요</li>
                <li>• 모든 응답은 익명으로 처리됩니다</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 친구 정보 입력 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>선물 받을 친구 정보</CardTitle>
            <p className="text-gray-600">AI가 개인화된 추천을 생성하기 위해 필요한 정보입니다.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 이름 */}
            <div>
              <Label htmlFor="name" className="text-base font-medium">친구 이름 *</Label>
              <Input
                id="name"
                value={persona.name}
                onChange={(e) => setPersona(prev => ({ ...prev, name: e.target.value }))}
                placeholder="예: 김민수"
                className="mt-2"
              />
            </div>

            {/* 나이 */}
            <div>
              <Label htmlFor="age" className="text-base font-medium">나이 *</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="100"
                value={persona.age || ''}
                onChange={(e) => setPersona(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                placeholder="예: 25"
                className="mt-2"
              />
            </div>

            {/* 성별 */}
            <div>
              <Label className="text-base font-medium">성별 *</Label>
              <Select 
                value={persona.gender} 
                onValueChange={(value) => setPersona(prev => ({ ...prev, gender: value as '남' | '여' }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="성별을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="남">남성</SelectItem>
                  <SelectItem value="여">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>


            {/* 예산 가격대 (고정값 표시) */}
            <div>
              <Label className="text-base font-medium">예산 가격대</Label>
              <div className="mt-2 p-3 bg-gray-100 rounded-md border">
                <span className="text-gray-700 font-medium">3만원대 (고정)</span>
              </div>
            </div>

            {/* 선물 의도 (필수) */}
            <div>
              <Label htmlFor="emotional-state" className="text-base font-medium">선물 의도 *</Label>
              <p className="text-sm text-gray-600 mt-1 mb-2">
                왜 이 사람에게 선물이 필요한지, 어떤 상황에서 떠올랐는지, 어떤 마음으로 주고 싶은지 구체적으로 적어주세요.
              </p>
              <Textarea
                id="emotional-state"
                value={persona.emotionalState}
                onChange={(e) => setPersona(prev => ({ ...prev, emotionalState: e.target.value }))}
                placeholder="예: 출퇴근할 때 이어폰 고장으로 인해서 불편함을 느끼는 것 같아서 새로운 무선 이어폰을 선물하고 싶다.."
                className="mt-2"
                rows={4}
              />
            </div>

            <Button 
              onClick={handleStartExperiment}
              disabled={startExperimentMutation.isPending || !persona.name || !persona.age || !persona.gender || !persona.emotionalState.trim()}
              className="w-full"
              size="lg"
            >
              {startExperimentMutation.isPending ? '실험 준비 중...' : '실험 시작하기'}
            </Button>
          </CardContent>
        </Card>

        {/* 기존 실험 접속 링크 */}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 text-sm">
            본 실험은 연구 목적으로 진행되며, 모든 응답은 익명으로 처리됩니다.
          </p>
        </div>
      </footer>
    </div>
  );
}