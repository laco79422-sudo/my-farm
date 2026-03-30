/**
 * 농부 등급 — 운영 시 생산량·기록·판매·리뷰로 산출 (현재는 구조·라벨만 정의)
 */
export type FarmerGradeTier = '새싹' | '성장' | '수확' | '로컬' | '유통';

export type GradeCriteria = {
  /** 누적 생산량(kg) 가중 */
  productionKg: number;
  /** 진단·일지 등 기록 건수 */
  recordCount: number;
  /** /sell 등 판매 완료 횟수 */
  salesCount: number;
  /** 평균 리뷰 (0~5) */
  reviewScore: number;
};

/** TODO: 백엔드 집계 후 computeFarmerGrade(criteria)로 대체 */
export function computeFarmerGradePlaceholder(_c: Partial<GradeCriteria>): FarmerGradeTier {
  return '새싹';
}

export const GRADE_ORDER: FarmerGradeTier[] = ['새싹', '성장', '수확', '로컬', '유통'];

export const GRADE_DESCRIPTIONS: Record<FarmerGradeTier, string> = {
  새싹: '첫 기록·첫 진단을 시작한 단계',
  성장: '기록이 쌓이고 재배가 안정된 단계',
  수확: '꾸준한 생산·진단 이력이 있는 단계',
  로컬: '지역 판매·커뮤니티 활동이 인정되는 단계',
  유통: '다수 거래·높은 신뢰도가 요구되는 단계',
};
