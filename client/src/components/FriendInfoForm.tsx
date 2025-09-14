import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { friendPersonaSchema, type FriendPersona } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight } from "lucide-react";
import { PRICE_RANGES, GENDERS } from "@/types";

interface FriendInfoFormProps {
  onNext: (persona: FriendPersona) => void;
}

export default function FriendInfoForm({ onNext }: FriendInfoFormProps) {
  const form = useForm<FriendPersona>({
    resolver: zodResolver(friendPersonaSchema),
    defaultValues: {
      name: "",
      age: 0,
      gender: undefined,
      priceRange: "3만원대",
      emotionalState: "",
    },
  });

  const onSubmit = (data: FriendPersona) => {
    onNext(data);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-neutral-900 mb-4">누구에게 선물을 주고 싶나요?</h3>
        <p className="text-lg text-neutral-600">성향과 상황을 알려주시면, 더 의미있는 선물을 추천해드릴게요.</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800 text-sm leading-relaxed">
            <span className="font-medium">⏱️ 예상 소요시간:</span> AI 추천 생성 약 30초, 전체 과정 3-5분
          </p>
        </div>
      </div>

      <Card className="shadow-lg mb-6">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">이름</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="예: 지영이" 
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">나이</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="28" 
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">성별</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors">
                            <SelectValue placeholder="선택해주세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GENDERS.map((gender) => (
                            <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              {/* Price Range - Fixed to 3만원 */}
              <FormField
                control={form.control}
                name="priceRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">가격대</FormLabel>
                    <div className="px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700">
                      3만원대 (고정)
                    </div>
                  </FormItem>
                )}
              />

              {/* Emotional State */}
              <FormField
                control={form.control}
                name="emotionalState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">선물하려는 이유</FormLabel>
                    <div className="text-xs text-neutral-600 mb-2">
                      <p className="text-green-700">✓ 예시: "요즘 출퇴근할 때 이어폰이 고장 나서 불편해 보여서, 새로운 무선 이어폰을 선물하고 싶다."</p>
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="왜 이 사람에게 선물이 필요한지, 어떤 상황에서 떠올랐는지, 어떤 마음으로 주고 싶은지 구체적으로 적어주세요." 
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors h-28 resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  다음 단계로
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}