import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { FriendPersona, Product } from "@shared/schema";

interface ProductRecommendationProps {
  persona: FriendPersona;
  onNext: (product: Product) => void;
  onBack: () => void;
}

export default function ProductRecommendation({ persona, onNext, onBack }: ProductRecommendationProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const generateProductMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/recommendations/product", persona);
      return response.json();
    },
    onSuccess: (data: Product) => {
      setSelectedProduct(data);
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: "상품 추천 생성에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (selectedProduct) {
      onNext(selectedProduct);
    }
  };

  // Auto-generate on mount
  useState(() => {
    if (!selectedProduct && !generateProductMutation.isPending) {
      generateProductMutation.mutate();
    }
  });

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-neutral-900 mb-4">추천 선물을 확인해보세요</h3>
        <p className="text-lg text-neutral-600">AI가 {persona.name}님의 성향과 상황을 분석해서 선별한 선물입니다.</p>
      </div>

      {generateProductMutation.isPending && (
        <Card className="shadow-lg mb-6">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-neutral-600">AI가 최적의 선물을 찾고 있어요...</p>
          </CardContent>
        </Card>
      )}

      {selectedProduct && (
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <h4 className="text-2xl font-semibold text-neutral-900 mb-3">{selectedProduct.name}</h4>
            
            <div className="flex items-center space-x-4 mb-4">
              {selectedProduct.features.map((feature, index) => (
                <span 
                  key={index}
                  className={`font-medium px-3 py-1 rounded-full text-sm ${
                    index % 3 === 0 ? 'bg-secondary/20 text-secondary' :
                    index % 3 === 1 ? 'bg-accent/20 text-accent' :
                    'bg-primary/20 text-primary'
                  }`}
                >
                  {feature}
                </span>
              ))}
            </div>
            
            <p className="text-neutral-600 mb-4">{selectedProduct.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-neutral-900">₩{selectedProduct.price.toLocaleString()}</span>
              <span className="text-sm text-neutral-500">배송비 무료</span>
            </div>
          </CardContent>
        </Card>
      )}

      {generateProductMutation.isError && (
        <Card className="shadow-lg mb-6">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">상품 추천 생성에 실패했습니다.</p>
            <Button onClick={() => generateProductMutation.mutate()}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={onBack}
          className="border border-gray-300 text-neutral-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          이전으로
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!selectedProduct}
          className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          설명 생성하기
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
