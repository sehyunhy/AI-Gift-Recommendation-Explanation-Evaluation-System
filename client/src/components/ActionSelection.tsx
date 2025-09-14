import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ShoppingBag, MessageCircle, Bookmark, Plus, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { StepData } from "@/types";

interface ActionSelectionProps {
  stepData: StepData;
  onBack: () => void;
  onStartNew: () => void;
  onShowSurvey: () => void;
}

export default function ActionSelection({ stepData, onBack, onStartNew, onShowSurvey }: ActionSelectionProps) {
  const [feedback, setFeedback] = useState({
    preferredExplanationType: "",
    comment: "",
    selectionReason: "",
    memorablePhrase: "",
  });
  const { toast } = useToast();

  const shareMessageMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/share-message", {
        persona: stepData.friendPersona,
        product: stepData.product,
        explanation: stepData.selectedExplanationContent,
      });
      return response.json();
    },
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.message);
      toast({
        title: "공유 메시지 생성 완료",
        description: "메시지가 클립보드에 복사되었습니다.",
      });
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      // Save complete recommendation with feedback
      await apiRequest("POST", "/api/recommendations", {
        friendName: stepData.friendPersona?.name,
        friendAge: stepData.friendPersona?.age,
        relationship: stepData.friendPersona?.relationship,
        occasion: stepData.friendPersona?.occasion,
        priceRange: stepData.friendPersona?.priceRange,
        emotionalState: stepData.friendPersona?.emotionalState,
        productName: stepData.product?.name,
        productPrice: stepData.product?.price,
        productFeatures: stepData.product?.features,
        explanations: {
          nonPersonalized: "Generated explanation 1",
          dataPersonalized: "Generated explanation 2", 
          meaningPersonalized: "Generated explanation 3",
        },
        selectedExplanationType: stepData.selectedExplanationType,
        selectedExplanationContent: stepData.selectedExplanationContent,
        feedback: {
          preferredExplanationType: parseInt(feedback.preferredExplanationType),
          comment: feedback.comment,
          selectionReason: feedback.selectionReason,
          memorablePhrase: feedback.memorablePhrase,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "피드백 제출 완료",
        description: "소중한 의견 감사합니다!",
      });
    },
  });

  const handlePurchase = () => {
    toast({
      title: "구매 페이지로 이동",
      description: "실제 구매 시스템과 연동됩니다.",
    });
  };

  const handleShare = () => {
    shareMessageMutation.mutate();
  };

  const handleFeedbackSubmit = () => {
    if (feedback.preferredExplanationType) {
      submitFeedbackMutation.mutate();
    } else {
      toast({
        title: "선호하는 설명 유형을 선택해주세요",
        variant: "destructive",
      });
    }
  };

  if (!stepData.friendPersona || !stepData.product) {
    return null;
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-neutral-900 mb-4">선물을 전달해보세요! 🎁</h3>
        <p className="text-lg text-neutral-600">선택하신 설명과 함께 선물을 어떻게 전달하실건가요?</p>
      </div>

      {/* Selected Product & Explanation Summary */}
      <Card className="shadow-lg p-6 mb-8">
        <div className="flex items-start space-x-4 mb-6">
          <img 
            src={stepData.product.imageUrl} 
            alt={stepData.product.name}
            className="w-24 h-24 object-cover rounded-xl flex-shrink-0" 
          />
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-neutral-900 mb-2">{stepData.product.name}</h4>
            <p className="text-neutral-600 mb-2">{stepData.friendPersona.name}님에게 전달할 선물</p>
            <span className="text-2xl font-bold text-primary">₩{stepData.product.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h5 className="font-semibold text-neutral-900 mb-2">선택한 설명</h5>
          <div className="bg-gray-50 rounded-xl p-4 text-neutral-700">
            {stepData.selectedExplanationContent}
          </div>
        </div>
      </Card>

      {/* Action Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Direct Purchase */}
        <Card className="bg-gradient-to-br from-primary to-pink-500 text-white p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h5 className="text-xl font-semibold">바로 선물하기</h5>
          </div>
          <p className="text-white/90 mb-4">선물을 구매해서 친구에게 직접 전달해보세요.</p>
          <Button 
            onClick={handlePurchase}
            className="w-full bg-white text-primary font-medium py-3 rounded-xl hover:bg-white/90 transition-colors"
          >
            구매하기
          </Button>
        </Card>

        {/* Share Message */}
        <Card className="bg-gradient-to-br from-secondary to-teal-500 text-white p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h5 className="text-xl font-semibold">메시지로 공유</h5>
          </div>
          <p className="text-white/90 mb-4">선물 추천과 설명을 카카오톡이나 문자로 공유하세요.</p>
          <Button 
            onClick={handleShare}
            disabled={shareMessageMutation.isPending}
            className="w-full bg-white text-secondary font-medium py-3 rounded-xl hover:bg-white/90 transition-colors"
          >
            {shareMessageMutation.isPending ? "생성 중..." : "공유하기"}
          </Button>
        </Card>
      </div>

      {/* Additional Options */}
      <Card className="shadow-lg p-6 mb-8">
        <h5 className="text-lg font-semibold text-neutral-900 mb-4">추가 옵션</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline"
            onClick={() => toast({ title: "저장 완료", description: "나중에 확인할 수 있습니다." })}
            className="flex flex-col items-center p-4 h-auto"
          >
            <Bookmark className="w-8 h-8 text-gray-600 mb-2" />
            <span className="text-sm text-gray-700 font-medium">나중을 위해 저장</span>
          </Button>
          
          <Button 
            onClick={onShowSurvey}
            className="flex flex-col items-center p-4 h-auto bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
          >
            <Star className="w-8 h-8 text-amber-600 mb-2" />
            <span className="text-sm font-medium">사후 설문 참여</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={onStartNew}
            className="flex flex-col items-center p-4 h-auto"
          >
            <Plus className="w-8 h-8 text-gray-600 mb-2" />
            <span className="text-sm text-gray-700 font-medium">새로운 추천 시작</span>
          </Button>
        </div>
      </Card>

      {/* Feedback Section */}
      <Card className="bg-gradient-to-r from-gray-50 to-white p-6">
        <h5 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-amber-500" />
          피드백을 남겨주세요
        </h5>
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-2">가장 공감되는 설명 유형은?</Label>
            <RadioGroup 
              value={feedback.preferredExplanationType} 
              onValueChange={(value) => setFeedback(prev => ({ ...prev, preferredExplanationType: value }))}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="feedback-1" />
                <Label htmlFor="feedback-1" className="text-sm text-neutral-700">정보 중심</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="feedback-2" />
                <Label htmlFor="feedback-2" className="text-sm text-neutral-700">데이터 기반</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="feedback-3" />
                <Label htmlFor="feedback-3" className="text-sm text-neutral-700">감정 맞춤</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-2">이 설명을 선택한 이유는?</Label>
            <Textarea 
              placeholder="예: 가장 진실한 느낌이었어요, 실용적인 정보가 도움이 되었어요, 감정적으로 공감되었어요" 
              value={feedback.selectionReason}
              onChange={(e) => setFeedback(prev => ({ ...prev, selectionReason: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors h-20 resize-none text-sm"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-2">기억에 남는 문구나 표현이 있나요?</Label>
            <Textarea 
              placeholder="선택한 설명에서 특히 인상 깊었던 문구를 적어주세요" 
              value={feedback.memorablePhrase}
              onChange={(e) => setFeedback(prev => ({ ...prev, memorablePhrase: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors h-16 resize-none text-sm"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-2">추가 의견</Label>
            <Textarea 
              placeholder="서비스에 대한 의견을 자유롭게 남겨주세요." 
              value={feedback.comment}
              onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors h-20 resize-none text-sm"
            />
          </div>
          
          <Button 
            onClick={handleFeedbackSubmit}
            disabled={submitFeedbackMutation.isPending}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
          >
            {submitFeedbackMutation.isPending ? "제출 중..." : "피드백 제출"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
