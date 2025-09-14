import OpenAI from "openai";
import type { FriendPersona, Product, Explanations } from "@shared/schema";
import promptTemplates from "../config/promptTemplates.json";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GPT-5 응답에서 텍스트 추출
function getResponseText(response: any): string {
  try {
    // GPT-5의 새로운 응답 구조: output_text 필드 확인
    if (response?.output_text) {
      return response.output_text.trim();
    }

    // output 배열에서 message 타입 찾기
    if (response?.output && Array.isArray(response.output)) {
      const messageOutput = response.output.find(
        (item: any) => item.type === "message",
      );
      if (messageOutput?.content?.[0]?.text) {
        return messageOutput.content[0].text.trim();
      }
    }

    // 기존 구조들도 지원
    if (response?.choices?.[0]?.message?.content) {
      return response.choices[0].message.content.trim();
    }

    if (response?.output?.content) {
      return response.output.content.trim();
    }

    if (typeof response === "string") {
      return response.trim();
    }

    console.log(
      "⚠️  응답 형태를 인식할 수 없음:",
      JSON.stringify(response, null, 2),
    );
    return "";
  } catch (error) {
    console.error("응답 파싱 오류:", error);
    return "";
  }
}

// 프롬프트 템플릿을 JSON에서 로드하여 인덱스 생성
const PROMPT_TEMPLATES = promptTemplates.prompt_templates.reduce(
  (acc, template) => {
    acc[template.mode] = template;
    return acc;
  },
  {} as Record<string, (typeof promptTemplates.prompt_templates)[0]>,
);

// 프롬프트 템플릿 내보내기 함수
export function getPromptTemplates() {
  return promptTemplates.prompt_templates;
}

export async function generateExplanations(
  persona: FriendPersona,
  product: Product,
): Promise<Explanations> {
  const startTime = Date.now();
  console.log(`[AI 응답] 설명 생성 시작 - ${new Date().toLocaleTimeString()}`);

  try {
    // 간단한 제품 기능 중심 설명
    const informationPrompt = `
    다음 지침에 따라 설명을 작성하라:
    1. 반드시 JSON 형식으로만 출력하라. 키는 "explanation" 하나만 포함한다.
    2. 설명 길이는 한국어 기준 180 ~ 200자로 제한한다.
    3. 모든 문장은 반드시 "~습니다"로 끝낸다.
    4. 제품의 기능 관련 단어는 <strong>태그</strong>로 감싼다.
    5. 설명은 객관적이고 중립적으로 작성한다.

    입력 정보:
    - 제품명: ${product.name}
    - 주요 기능(상위 3개): ${product.features.slice(0, 3).join(", ")}
    `;

    // 간단한 Profile 기반 설명
    const dataPrompt = `
    다음 지침에 따라 설명을 작성하라:
    1. 반드시 JSON 형식으로만 출력하라. 키는 "explanation" 하나만 포함한다.
    2. 설명 길이는 한국어 기준 200~250자로 제한한다.
    3. 모든 문장은 반드시 "~습니다"로 끝낸다.
    4. 나이, 성별, 행동 지표 등은 <strong>태그</strong>로 감싼다.
    5. 반드시 입력된 정확한 성별과 연령대를 사용하라.
    6. 해당 연령/성별 그룹의 구매 통계(%)를 포함하라.

    입력 정보:
    - 제품명: ${product.name}
    - 주요 기능(상위 3개): ${product.features.slice(0, 3).join(", ")}
    - 수신자 성별: ${persona.gender} (반드시 이 성별 기준으로 작성)
    - 수신자 연령대: ${persona.age}대 (반드시 이 연령대 기준으로 작성)
    - 수신자 이름: ${persona.name}

    중요: ${persona.gender} ${persona.age}대와 동일한 성별/연령대의 사용자 통계만 언급하라.
`;

    // 간단한 맥락 기반 설명
    const emotionalPrompt = `
    다음 지침에 따라 설명을 작성하라:
    1. 반드시 JSON 형식으로만 출력하라. 키는 "explanation" 하나만 포함한다.
    2. 설명 길이는 한국어 기준 200~250자로 제한한다.
    3. 반드시 3문장으로 작성한다.
    4. 모든 문장은 반드시 "~습니다"로 끝낸다.
    5. <strong>태그</strong>는 정확히 4개의 핵심 단어에만 사용한다.
    6. 굵게 표시할 4개 단어는 선물 의도와 관련된 가장 중요한 키워드를 선택한다.
    7. 나머지 단어들은 굵게 표시하지 않는다.

    입력 정보:
    - 선물 이유: ${persona.emotionalState}
    - 제품명: ${product.name}
    - 주요 기능: ${product.features.join(", ")}

    중요: <strong>태그</strong>를 정확히 4개만 사용하라.
`;

    // 3개의 AI 설명을 병렬로 생성 (GPT-5)
    const [infoResponse, dataResponse, emotionalResponse] = await Promise.all([
      openai.responses.create({
        model: "gpt-5",
        input: informationPrompt,
        reasoning: {
          effort: "minimal" as any,
        },
      }),
      openai.responses.create({
        model: "gpt-5",
        input: dataPrompt,
        reasoning: {
          effort: "minimal" as any,
        },
      }),
      openai.responses.create({
        model: "gpt-5",
        input: emotionalPrompt,
        reasoning: {
          effort: "minimal" as any,
        },
      }),
    ]);

    // GPT-5 응답 파싱 (JSON 형태인 경우에만 파싱)
    const infoText = getResponseText(infoResponse);
    const dataText = getResponseText(dataResponse);
    const emotionalText = getResponseText(emotionalResponse);

    const infoResult = infoText ? JSON.parse(infoText) : {};
    const dataResult = dataText ? JSON.parse(dataText) : {};
    const emotionalResult = emotionalText ? JSON.parse(emotionalText) : {};

    return {
      featureFocused: infoResult.explanation || "제품 기능 중심 설명입니다.",
      profileBased: dataResult.explanation || "Profile 기반 설명입니다.",
      contextBased: emotionalResult.explanation || "맥락 기반 설명입니다.",
    };
  } catch (error) {
    console.error("Explanations generation error:", error);
    throw new Error("설명 생성에 실패했습니다.");
  }
}

// 제품 추천 생성 함수
export async function generateProductRecommendation(
  persona: FriendPersona,
): Promise<Product> {
  try {
    const recommendationPrompt = `${persona.age}세 ${persona.gender}성을 위한 3만원대 선물 추천.
선물 이유: ${persona.emotionalState}

JSON 응답 (가격은 반드시 30000-39999 범위):
{
  "name": "제품명",
  "price": 30000,
  "description": "간단한 설명",
  "features": ["기능1", "기능2", "기능3"]
}`;

    const response = await openai.responses.create({
      model: "gpt-5",
      input: recommendationPrompt,
      reasoning: {
        effort: "minimal" as any,
      },
    });

    const responseText = getResponseText(response);
    const result = JSON.parse(responseText);

    return {
      name: result.name,
      price: result.price,
      description: result.description,
      features: result.features,
      imageUrl: "",
    };
  } catch (error) {
    console.error("Product recommendation error:", error);
    throw new Error("제품 추천 생성에 실패했습니다.");
  }
}

// 공유 메시지 생성 함수
export async function generateShareMessage(
  persona: FriendPersona,
  product: Product,
  selectedExplanation: string,
): Promise<string> {
  try {
    const sharePrompt = `다음 정보를 바탕으로 선물 추천을 공유할 수 있는 짧은 메시지를 생성해주세요.

수신자: ${persona.name}
제품: ${product.name}
선택된 설명: ${selectedExplanation}

친근하고 자연스러운 톤으로 1-2문장 정도의 공유 메시지를 작성해주세요.

JSON 형식으로 응답:
{"message": "공유 메시지"}`;

    const response = await openai.responses.create({
      model: "gpt-5",
      input: sharePrompt,
      reasoning: {
        effort: "minimal" as any,
      },
    });

    const responseText = getResponseText(response);
    const result = JSON.parse(responseText);

    return result.message || "선물 추천을 공유합니다.";
  } catch (error) {
    console.error("Share message generation error:", error);
    return "선물 추천을 공유합니다.";
  }
}

// DALL·E 3 이미지 생성 함수
export async function generateProductImage(
  productName: string,
  productDescription: string,
  experimentId?: string,
): Promise<string> {
  try {
    console.log(`🎨 Starting image generation for: ${productName}`);
    console.log(`📝 Product description: ${productDescription}`);

    // GPT-5 제품명을 직접 영어로 번역하여 DALL-E에 전달
    const simpleTranslationPrompt = `Translate this Korean product name to English for image generation: "${productName}"

Return only the English product name, nothing else.`;

    const translationResponse = await openai.responses.create({
      model: "gpt-5",
      input: simpleTranslationPrompt,
      reasoning: {
        effort: "minimal" as any,
      },
    });

    const englishProductName =
      getResponseText(translationResponse) || productName;
    console.log(`🌐 Translated product name: ${englishProductName}`);

    // GPT-5 제품명만을 기반으로 한 직접적인 DALL-E 프롬프트
    const imagePrompt = `Professional product photography of ${englishProductName}. High-quality commercial product shot with clean white background, studio lighting, centered composition, no text or labels visible. Modern product photography style.`;

    console.log(`🎯 DALL·E prompt: ${imagePrompt}`);

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = imageResponse.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("DALL-E did not return an image URL");
    }

    console.log(`✅ Generated image URL: ${imageUrl}`);

    return imageUrl;
  } catch (error) {
    console.error(`❌ Image generation failed for ${productName}:`, error);
    throw new Error("이미지 생성에 실패했습니다.");
  }
}
