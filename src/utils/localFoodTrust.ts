import type { DailyLogEntry, GrowPlant, ListingTrustSnapshot, SalesRecord } from '../types/farmHub';
import type { FarmerTierLevel } from '../types/farmHub';
import {
  computeAverageLogRate,
  computeAverageSurvivalHarvested,
} from './localFoodEligibility';

/** 마지막 활동(등록 등) 이후 경과 일 — 강등·노출 감소 */
export function daysSinceIso(iso: string): number {
  const t = new Date(iso).getTime();
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

const INACTIVE_DAYS_SOFT = 21;
const INACTIVE_DAYS_HARD = 45;

export function computeExposureBoost(lastActivityAt: string): number {
  const d = daysSinceIso(lastActivityAt);
  if (d >= INACTIVE_DAYS_HARD) return 0.55;
  if (d >= INACTIVE_DAYS_SOFT) return 0.78;
  return 1;
}

export function computeFarmerTier(
  isLocalVendor: boolean,
  plants: GrowPlant[],
  logs: DailyLogEntry[],
): FarmerTierLevel {
  if (isLocalVendor) return 'local_vendor';
  const harvested = plants.filter((p) => p.status === 'harvested').length;
  const logRate = plants.length ? computeAverageLogRate(plants, logs) : 0;
  if (harvested >= 1 || logRate >= 0.4) return 'growth';
  return 'general';
}

export function farmerTierLabel(t: FarmerTierLevel): string {
  if (t === 'local_vendor') return '로컬푸드 입점';
  if (t === 'growth') return '성장 농부';
  return '일반 농부';
}

/** 판매 성공률: 완료 거래 / (완료 + 진행 중 가정) — MVP */
export function computeSalesSuccessRate(sales: SalesRecord[]): number {
  const done = sales.filter((s) => s.state === 'completed').length;
  if (done === 0) return 0.75;
  return Math.min(0.99, 0.7 + done * 0.02);
}

export function buildListingTrustSnapshot(params: {
  plants: GrowPlant[];
  logs: DailyLogEntry[];
  sales: SalesRecord[];
  /** 0~5, MVP 고정 또는 후기 API */
  reviewAvg: number;
  lastVendorActivityAt: string;
  tier: FarmerTierLevel;
}): ListingTrustSnapshot {
  const logRate = computeAverageLogRate(params.plants, params.logs);
  const survivalRateAvg = computeAverageSurvivalHarvested(params.plants);
  const salesSuccessRate = computeSalesSuccessRate(params.sales);
  const exposureBoost = computeExposureBoost(params.lastVendorActivityAt);
  return {
    logRate,
    survivalRateAvg: Number.isFinite(survivalRateAvg) ? survivalRateAvg : 0,
    reviewAvg: params.reviewAvg,
    salesSuccessRate,
    farmerGradeLabel: farmerTierLabel(params.tier),
    exposureBoost,
  };
}

/** 기록률 급락 시 등급 표시용 경고 (UI) */
export function isLogRateDemotionRisk(
  logRate: number,
  threshold = 0.5,
): boolean {
  return logRate < threshold;
}
