import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getExplanationConfig } from "@/utils/latinSquare";
import { ShoppingCart, Heart, RotateCcw } from "lucide-react";
import type { Product } from "@shared/schema";
import type { ExplanationType } from "@/types/experiment";
import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExplanationCardProps {
  product: Product;
  explanation: string;
  type: ExplanationType;
  isActive?: boolean;
  cardId?: string;
  sessionId?: string;
}

export default function ExplanationCard({ product, explanation, type, isActive = false, cardId = "", sessionId }: ExplanationCardProps) {
  const config = getExplanationConfig(type);
  const { toast } = useToast();
  const explanationRef = useRef<HTMLDivElement>(null);
  const dwellStartTime = useRef<number | null>(null);
  const scrollStopTimer = useRef<NodeJS.Timeout | null>(null);
  const isFirstInteraction = useRef(true);
  const sessionStartTime = useRef(Date.now());
  
  // 각 카드별 독립적인 상태
  const [actions, setActions] = useState({
    cartClicked: false,
    wishlistClicked: false,
    regenerationCount: 0
  });
  
  // 트래킹 데이터 상태
  const [trackingData, setTrackingData] = useState<{
    dwellTimes: Array<{
      explanationType: 'featureFocused' | 'profileBased' | 'contextBased';
      startTime: string;
      endTime: string;
      duration: number;
    }>;
    scrollPatterns: Array<{
      scrollY: number;
      timestamp: string;
      stopDuration: number;
    }>;
    firstInteraction: {
      type: 'mouseenter' | 'mousedown' | 'click';
      target: string;
      explanationType?: 'featureFocused' | 'profileBased' | 'contextBased';
      timestamp: string;
      coordinates: { x: number; y: number };
    } | null;
    buttonClickStats: {
      cartClicks: number;
      wishlistClicks: number;
      regenerateClicks: number;
      totalClicks: number;
    };
    sessionDuration: {
      startTime: string;
      endTime: string | null;
      totalDuration: number | null;
    };
  }>({
    dwellTimes: [],
    scrollPatterns: [],
    firstInteraction: null,
    buttonClickStats: { cartClicks: 0, wishlistClicks: 0, regenerateClicks: 0, totalClicks: 0 },
    sessionDuration: { startTime: new Date().toISOString(), endTime: null, totalDuration: null }
  });

  // DB에 액션 저장하는 mutation
  const saveActionMutation = useMutation({
    mutationFn: async (action: { type: string; explanationType: ExplanationType }) => {
      console.log('💾 Attempting to save action:', { sessionId, action });
      if (!sessionId) {
        console.error('❌ No sessionId available for action save');
        return;
      }
      return await apiRequest("POST", "/api/experiment/action", {
        sessionId,
        actionType: action.type,
        explanationType: action.explanationType,
        timestamp: new Date().toISOString()
      });
    },
    onError: (error) => {
      console.error('액션 저장 실패:', error);
    }
  });
  
  // 트래킹 데이터 저장 mutation
  const saveTrackingMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('📊 Attempting to save tracking data:', { sessionId, data });
      if (!sessionId) {
        console.error('❌ No sessionId available for tracking save');
        return;
      }
      return await apiRequest("POST", "/api/experiment/tracking", {
        sessionId,
        trackingData: data
      });
    },
    onError: (error) => {
      console.error('트래킹 저장 실패:', error);
    }
  });

  // 트래킹 이벤트 핸들러
  const handleMouseEnter = () => {
    console.log('🎯 Mouse entered explanation card');
    dwellStartTime.current = Date.now();
    
    // 3. 첫 시선 위치 기록
    if (isFirstInteraction.current && !trackingData.firstInteraction) {
      const firstInteraction = {
        type: 'mouseenter' as const,
        target: 'explanation-card',
        explanationType: type,
        timestamp: new Date().toISOString(),
        coordinates: { x: 0, y: 0 }
      };
      console.log('👁️ First interaction recorded:', firstInteraction);
      setTrackingData(prev => ({ 
        ...prev, 
        firstInteraction 
      }));
      isFirstInteraction.current = false;
    }
  };
  
  const handleMouseLeave = () => {
    console.log('🏃 Mouse left explanation card');
    if (dwellStartTime.current) {
      const duration = Date.now() - dwellStartTime.current;
      const dwellTime = {
        explanationType: type,
        startTime: new Date(dwellStartTime.current).toISOString(),
        endTime: new Date().toISOString(),
        duration
      };
      console.log('⏱️ Dwell time recorded:', dwellTime);
      setTrackingData(prev => ({
        ...prev,
        dwellTimes: [...prev.dwellTimes, dwellTime]
      }));
      dwellStartTime.current = null;
    }
  };
  
  const handleScroll = () => {
    console.log('📜 Scroll detected at:', window.scrollY);
    if (scrollStopTimer.current) {
      clearTimeout(scrollStopTimer.current);
    }
    
    scrollStopTimer.current = setTimeout(() => {
      const scrollPattern = {
        scrollY: window.scrollY,
        timestamp: new Date().toISOString(),
        stopDuration: 1000 // 1초 이상 정지
      };
      console.log('🛑 Scroll stop recorded:', scrollPattern);
      setTrackingData(prev => ({
        ...prev,
        scrollPatterns: [...prev.scrollPatterns, scrollPattern]
      }));
    }, 1000);
  };
  
  const handleActionClick = (action: 'cart' | 'wishlist' | 'regenerate') => {
    // UI 상태 업데이트
    switch (action) {
      case 'cart':
        setActions(prev => ({ ...prev, cartClicked: true }));
        toast({ title: "장바구니에 추가됨", description: "제품이 장바구니에 저장되었습니다." });
        setTrackingData(prev => {
          const newStats = {
            ...prev.buttonClickStats,
            cartClicks: prev.buttonClickStats.cartClicks + 1,
            totalClicks: prev.buttonClickStats.totalClicks + 1
          };
          console.log('🛒 Cart click - updating buttonClickStats:', newStats);
          return {
            ...prev,
            buttonClickStats: newStats
          };
        });
        break;
      case 'wishlist':
        setActions(prev => ({ ...prev, wishlistClicked: true }));
        toast({ title: "찜 목록에 추가됨", description: "제품이 찜 목록에 저장되었습니다." });
        setTrackingData(prev => {
          const newStats = {
            ...prev.buttonClickStats,
            wishlistClicks: prev.buttonClickStats.wishlistClicks + 1,
            totalClicks: prev.buttonClickStats.totalClicks + 1
          };
          console.log('❤️ Wishlist click - updating buttonClickStats:', newStats);
          return {
            ...prev,
            buttonClickStats: newStats
          };
        });
        break;
      case 'regenerate':
        setActions(prev => ({ ...prev, regenerationCount: prev.regenerationCount + 1 }));
        toast({ title: "설명 재생성 요청", description: "새로운 설명을 생성하고 있습니다." });
        setTrackingData(prev => {
          const newStats = {
            ...prev.buttonClickStats,
            regenerateClicks: prev.buttonClickStats.regenerateClicks + 1,
            totalClicks: prev.buttonClickStats.totalClicks + 1
          };
          console.log('🔄 Regenerate click - updating buttonClickStats:', newStats);
          return {
            ...prev,
            buttonClickStats: newStats
          };
        });
        break;
    }
    
    // DB에 액션 저장
    saveActionMutation.mutate({
      type: action,
      explanationType: type
    });
  };
  
  // 이벤트 리스너 등록
  useEffect(() => {
    console.log('🛠️ Setting up event listeners');
    
    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 카드 요소에 대한 추가적인 이벤트 리스너
    const cardElement = explanationRef.current;
    if (cardElement) {
      cardElement.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // 5. 전체 체류 시간 초기화
    setTrackingData(prev => ({
      ...prev,
      sessionDuration: {
        startTime: new Date(sessionStartTime.current).toISOString(),
        endTime: null,
        totalDuration: null
      }
    }));
    
    return () => {
      console.log('🧹 Cleaning up event listeners');
      window.removeEventListener('scroll', handleScroll);
      if (cardElement) {
        cardElement.removeEventListener('scroll', handleScroll);
      }
      if (scrollStopTimer.current) {
        clearTimeout(scrollStopTimer.current);
      }
      
      // 컴포넌트 언마운트 시 체류 시간 계산
      const totalDuration = Date.now() - sessionStartTime.current;
      const finalTrackingData = {
        ...trackingData,
        sessionDuration: {
          startTime: new Date(sessionStartTime.current).toISOString(),
          endTime: new Date().toISOString(),
          totalDuration
        }
      };
      
      // 트래킹 데이터 저장
      if (sessionId) {
        saveTrackingMutation.mutate(finalTrackingData);
      }
    };
  }, []);
  
  // 트래킹 데이터 업데이트 시 저장 (debounce 적용)
  useEffect(() => {
    console.log('🔍 TrackingData changed:', {
      buttonClickStats: trackingData.buttonClickStats,
      dwellTimesLength: trackingData.dwellTimes.length,
      scrollPatternsLength: trackingData.scrollPatterns.length,
      firstInteraction: trackingData.firstInteraction
    });
    
    if (trackingData.buttonClickStats.totalClicks > 0 || trackingData.dwellTimes.length > 0 || trackingData.scrollPatterns.length > 0) {
      console.log('🔥 Sending tracking data to server:', trackingData);
      const timer = setTimeout(() => {
        saveTrackingMutation.mutate(trackingData);
      }, 500); // 500ms debounce
      return () => clearTimeout(timer);
    }
  }, [trackingData]);

  const getBorderColor = (type: ExplanationType): string => {
    switch (type) {
      case 'featureFocused': return 'border-gray-500';
      case 'profileBased': return 'border-blue-500';
      case 'contextBased': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <Card 
      className={`border-2 ${getBorderColor(type)} bg-white shadow-lg`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={explanationRef}
      data-testid={`explanation-card-${type}`}
    >
      <CardContent className="p-6">
        {/* 헤더: 크게 표시된 라벨 */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">{config.fullLabel}</h2>
        </div>

        {/* 2열 구조: 좌측 이미지, 우측 텍스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 좌측: 제품 이미지 */}
          <div className="flex justify-center items-center">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-64 h-64 object-cover rounded-lg border border-gray-200 shadow-sm"
              onError={(e) => {
                console.error('Image failed to load:', product.imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* 우측: 제품 정보 + 설명 */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{product.name}</h3>
              <p className="text-2xl font-semibold text-primary mb-4">₩{product.price.toLocaleString()}</p>

              {/* AI 설명 */}
              <div 
                className="bg-gray-50 rounded-lg p-4 mb-4"
                data-testid={`explanation-text-${type}`}
              >
                <h4 className="font-semibold mb-2 text-sm text-gray-700">추천 이유</h4>
                <div 
                  className="text-sm leading-relaxed text-gray-800"
                  dangerouslySetInnerHTML={{ 
                    __html: explanation
                      .replace(/(\d+[,원만]+|\d+시간|\d+마이크|ANC|ENC|USB-C|EQ|IPX\d|블루투스 \d\.\d)/g, '<strong>$1</strong>')
                      .replace(/(액티브 노이즈 캔슬링|통화 노이즈 리덕션|저지연 모드|터치 컨트롤|급속 충전|아치 서포트|충격 흡수|방수|논슬립|폴더블)/g, '<strong>$1</strong>')
                      .replace(/(\d+세 [남여]성|만족도 \d+%|재구매 의향 \d+%)/g, '<strong>$1</strong>')
                  }}
                />
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => handleActionClick('cart')}
                className={`flex-1 ${actions.cartClicked ? 'bg-green-600 hover:bg-green-700' : ''}`}
                variant={actions.cartClicked ? 'default' : 'outline'}
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                장바구니
              </Button>
              
              <Button
                onClick={() => handleActionClick('wishlist')}
                className={`flex-1 ${actions.wishlistClicked ? 'bg-pink-600 hover:bg-pink-700' : ''}`}
                variant={actions.wishlistClicked ? 'default' : 'outline'}
                size="sm"
              >
                <Heart className="w-4 h-4 mr-2" />
                찜
              </Button>
              
              <Button
                onClick={() => handleActionClick('regenerate')}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                재생성
                {actions.regenerationCount > 0 && (
                  <span className="ml-1 text-xs">({actions.regenerationCount})</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}