import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Info, Zap, Check, ShoppingCart, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ExplanationType } from '@shared/schema';

interface ExplanationDisplayProps {
  type: ExplanationType;
  explanation: string;
  product: {
    name: string;
    price: number;
    features: string[];
    description: string;
    imageUrl: string;
  };
  persona: {
    name: string;
    age: number;
    gender: string;
    priceRange: string;
    emotionalState?: string;
  };
  experimentId: string;
  onEventLog?: (eventData: {
    event_type: 'click_info_menu' | 'click_action_menu' | 'click_regenerate';
    sub_event?: 'spec' | 'review' | 'compare' | 'wishlist' | 'cart' | 'share' | 'purchase' | 'regenerate';
  }) => void;
}

export function ExplanationDisplay({ 
  type, 
  explanation, 
  product, 
  persona,
  experimentId,
  onEventLog
}: ExplanationDisplayProps) {
  
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [buttonStates, setButtonStates] = useState({
    cart: { clicked: false, loading: false },
    purchase: { clicked: false, loading: false },
    regenerate: { clicked: false, loading: false }
  });
  const { toast } = useToast();
  
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

  const handleInfoClick = (subEvent: 'spec' | 'review' | 'compare') => {
    onEventLog?.({
      event_type: 'click_info_menu',
      sub_event: subEvent
    });
  };

  const handleActionClick = async (subEvent: 'low' | 'medium' | 'high') => {
    // 로딩 상태 시작
    setButtonStates(prev => ({
      ...prev,
      [subEvent]: { ...prev[subEvent as keyof typeof prev], loading: true }
    }));

    // 이벤트 로그
    onEventLog?.({
      event_type: 'click_action_menu',
      sub_event: subEvent
    });

    // 시뮬레이션: 실제 처리 시간
    await new Promise(resolve => setTimeout(resolve, 800));

    // 성공 상태로 변경
    setButtonStates(prev => ({
      ...prev,
      [subEvent]: { clicked: true, loading: false }
    }));

    // 토스트 메시지
    switch (subEvent) {
      case 'low':
        toast({ 
          title: "구매 의도: 낮음", 
          description: "응답이 기록되었습니다." 
        });
        break;
      case 'medium':
        toast({ 
          title: "구매 의도: 중간", 
          description: "응답이 기록되었습니다." 
        });
        break;
      case 'high':
        toast({ 
          title: "구매 의도: 높음", 
          description: "응답이 기록되었습니다." 
        });
        break;
    }
  };

  const handleRegenerateClick = () => {
    onEventLog?.({
      event_type: 'click_regenerate'
    });
  };

  // 제품별 맞춤 리뷰 생성
  const generateProductReviews = (productName: string) => {
    const reviews = {
      // 운동화/신발 관련
      '운동화': [
        { rating: '★★★★☆ 4.3/5', text: '쿠셔닝이 정말 좋고 오래 신어도 발이 편해요' },
        { rating: '★★★★★ 5/5', text: '디자인도 예쁘고 가볍고 통기성도 좋습니다' }
      ],
      '스니커즈': [
        { rating: '★★★★☆ 4.1/5', text: '일상용으로 신기 좋고 스타일이 깔끔해요' },
        { rating: '★★★★★ 5/5', text: '발목 지지력이 좋아서 운동할 때도 편합니다' }
      ],
      // 이어폰/헤드폰 관련
      '이어폰': [
        { rating: '★★★★☆ 4.2/5', text: '음질이 좋고 배터리도 오래 갑니다' },
        { rating: '★★★★★ 5/5', text: '노이즈 캔슬링 기능이 정말 좋아요' }
      ],
      '헤드폰': [
        { rating: '★★★★☆ 4.4/5', text: '음질이 선명하고 착용감이 편안합니다' },
        { rating: '★★★★★ 5/5', text: '무선 연결이 안정적이고 배터리 지속시간이 길어요' }
      ],
      // 의류 관련
      '후드티': [
        { rating: '★★★★☆ 4.0/5', text: '소재가 부드럽고 따뜻해서 겨울에 입기 좋아요' },
        { rating: '★★★★★ 5/5', text: '핏이 예쁘고 세탁해도 늘어나지 않습니다' }
      ],
      '맨투맨': [
        { rating: '★★★★☆ 4.2/5', text: '기본템으로 입기 좋고 색상도 예뻐요' },
        { rating: '★★★★★ 5/5', text: '두께가 적당하고 활동하기 편합니다' }
      ],
      // 가방 관련
      '백팩': [
        { rating: '★★★★☆ 4.1/5', text: '수납공간이 많고 메기 편해서 학교/직장용으로 좋아요' },
        { rating: '★★★★★ 5/5', text: '방수 기능이 있어서 비 올 때도 안심입니다' }
      ],
      '크로스백': [
        { rating: '★★★★☆ 4.3/5', text: '가볍고 간편해서 외출할 때 유용해요' },
        { rating: '★★★★★ 5/5', text: '크기가 적당하고 디자인이 심플해서 어디든 잘 어울립니다' }
      ]
    };

    // 제품명에서 키워드 찾기
    const productLower = productName.toLowerCase();
    let matchedKey = '';
    
    for (const key of Object.keys(reviews)) {
      if (productLower.includes(key) || productName.includes(key)) {
        matchedKey = key;
        break;
      }
    }

    // 매칭되는 리뷰가 없으면 일반적인 리뷰 반환
    if (!matchedKey) {
      return [
        { rating: '★★★★☆ 4.2/5', text: '품질이 좋고 가격 대비 만족스러워요' },
        { rating: '★★★★★ 5/5', text: '디자인이 예쁘고 실용적입니다' }
      ];
    }

    return reviews[matchedKey as keyof typeof reviews];
  };

  return (
    <Card 
      className={`border-2 ${getBorderColor(type)} bg-white shadow-lg`}
      data-testid={`explanation-card-${type}`}
    >
      <CardContent className="p-6">

        {/* 2컬럼 레이아웃: 좌측 제품정보, 우측 추천정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 좌측: 제품명 → 가격 → 이미지 */}
          <div className="space-y-4">
            {/* 제품 이름 */}
            <h3 className="text-xl font-bold text-neutral-900">{product.name}</h3>

            {/* 제품 가격 */}
            <p className="text-xl font-bold text-rose-600">₩{product.price.toLocaleString()}</p>

            {/* 제품 이미지 */}
            <div className="flex justify-start">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-64 h-64 object-cover rounded-xl border border-gray-200 shadow-sm"
                onError={(e) => {
                  console.error('Image failed to load:', product.imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* 우측: 친구정보 → 추천이유 */}
          <div className="space-y-4">
            {/* 선물 받을 친구 정보 */}
            <div className="bg-white border border-blue-200 rounded-xl p-4">
              <div className="font-medium text-blue-900 mb-1">선물 받을 친구</div>
              <div className="text-blue-800 text-sm">
                {persona.name}님 • {persona.age}세 {persona.gender}성 • {persona.priceRange}
                {persona.emotionalState && ` • ${persona.emotionalState}`}
              </div>
            </div>

            {/* 추천 이유 - 인지 강화 및 애니메이션 */}
            <div 
              className={`${getBackgroundColor(type)} border ${getBorderColor(type)} rounded-xl p-4 animate-in fade-in-50 slide-in-from-top-2 duration-500`}
              data-testid={`explanation-text-${type}`}
            >
              {/* 업데이트 배지 - pill 형태 */}
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full animate-in fade-in-50 slide-in-from-left-2 duration-700">
                  🆕 추천 이유가 업데이트되었습니다
                </span>
              </div>
              
              <h4 className="font-semibold mb-2 text-sm text-gray-700">추천 이유</h4>
              <div 
                className="text-base leading-relaxed text-gray-700"
                dangerouslySetInnerHTML={{ __html: explanation }}
              />
            </div>
          </div>
        </div>

        {/* 하단: 구매 의도 3단계 선택 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center mb-4">
            <h4 className="font-medium text-gray-800 mb-2">구매 의도</h4>
            <p className="text-sm text-gray-600">이 제품에 대한 구매 의도는 어느 정도인가요?</p>
          </div>
          <div className="flex justify-center gap-4">
            <Button 
              variant={buttonStates.cart.clicked ? "default" : "outline"}
              size="sm"
              className={`px-6 py-2 transition-all duration-300 ${
                buttonStates.cart.clicked 
                  ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200" 
                  : "text-gray-600 border-gray-300 hover:border-red-300 hover:bg-red-50"
              }`}
              onClick={() => handleActionClick('low')}
              disabled={buttonStates.cart.loading}
              data-testid={`button-low-intent-${type}`}
            >
              낮음
            </Button>

            <Button 
              variant={buttonStates.purchase.clicked ? "default" : "outline"}
              size="sm"
              className={`px-6 py-2 transition-all duration-300 ${
                buttonStates.purchase.clicked 
                  ? "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200" 
                  : "text-gray-600 border-gray-300 hover:border-yellow-300 hover:bg-yellow-50"
              }`}
              onClick={() => handleActionClick('medium')}
              disabled={buttonStates.purchase.loading}
              data-testid={`button-medium-intent-${type}`}
            >
              중간
            </Button>

            <Button 
              variant={buttonStates.regenerate.clicked ? "default" : "outline"}
              size="sm"
              className={`px-6 py-2 transition-all duration-300 ${
                buttonStates.regenerate.clicked 
                  ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200" 
                  : "text-gray-600 border-gray-300 hover:border-green-300 hover:bg-green-50"
              }`}
              onClick={() => handleActionClick('high')}
              disabled={buttonStates.regenerate.loading}
              data-testid={`button-high-intent-${type}`}
            >
              높음
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}