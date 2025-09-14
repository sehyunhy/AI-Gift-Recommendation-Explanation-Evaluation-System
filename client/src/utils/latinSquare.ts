// 단일 설명 실험 시스템 
// 각 참가자는 A/B/C 중 1개만 보기 (1/3 랜덤 분배)

import type { ExplanationType, ExperimentPair, ExplanationTypeABC } from '@/types/experiment';
import { EXPLANATION_MAPPING } from '@/types/experiment';

// 3가지 설명 타입 (1/3 비율로 랜덤 배정)
const EXPLANATION_TYPES: ExplanationType[] = ['featureFocused', 'profileBased', 'contextBased'];

export function generateSingleExplanationType(): ExplanationType {
  const randomIndex = Math.floor(Math.random() * EXPLANATION_TYPES.length);
  return EXPLANATION_TYPES[randomIndex];
}

// 단일 설명 실험을 위한 새 함수
export function generateExperimentOrder(): ExplanationType[] {
  const selectedType = generateSingleExplanationType();
  return [selectedType]; // 1개만 반환
}

// 기존 페어 함수들은 호환성을 위해 유지 (사용 안 함)
export function generateExperimentPair(): ExperimentPair {
  const randomIndex = Math.floor(Math.random() * 3);
  return ['AB', 'AC', 'BC'][randomIndex] as ExperimentPair;
}

export function getExplanationTypesFromPair(pair: ExperimentPair): ExplanationType[] {
  const typeA = pair[0] as ExplanationTypeABC;
  const typeB = pair[1] as ExplanationTypeABC;
  
  return [
    EXPLANATION_MAPPING[typeA],
    EXPLANATION_MAPPING[typeB]
  ];
}

export function getExplanationConfig(type: ExplanationType) {
  const configs = {
    featureFocused: {
      label: 'A',
      fullLabel: 'A = 제품기능',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: 'A',
      tags: [],
      loadingMessage: 'A 설명을 준비 중입니다...'
    },
    profileBased: {
      label: 'B',
      fullLabel: 'B = Profile 중심',
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: 'B',
      tags: [],
      loadingMessage: 'B 설명을 준비 중입니다...'
    },
    contextBased: {
      label: 'C',
      fullLabel: 'C = 선물의도',
      color: 'bg-rose-100 text-rose-700 border-rose-300',
      icon: 'C',
      tags: [],
      loadingMessage: 'C 설명을 준비 중입니다...'
    }
  };
  
  return configs[type];
}