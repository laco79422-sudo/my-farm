import type { GrowEnvironment, GrowMethod } from '../types/farmHub';

export type HarvestInput = {
  seedCount: number;
  /** 종자 1단위당 평균 수확 무게(g) — 작물 테이블에서 조회 가정 */
  avgWeightGramsPerSeed: number;
  /** 생존율 0~1 */
  survivalRate: number;
  growEnvironment: GrowEnvironment;
  growMethod: GrowMethod;
  /** 상태 계수 0~1 (스트레스 많을수록 낮음) */
  statusFactor: number;
};

const ENV_BONUS: Record<GrowEnvironment, number> = {
  urban: 0.95,
  garden: 1,
  factory: 1.06,
};

const METHOD_FACTOR: Record<GrowMethod, number> = {
  hydro: 1.04,
  soil: 1,
};

/**
 * HarvestWeight(g) = seedCount × avgWeight × survivalRate × envBonus × statusFactor × methodFactor
 * (요구사항에 method가 없어 growMethod를 보조 계수로만 곱함 — 백엔드 스펙에 맞게 조정 가능)
 */
export function computeHarvestWeightG(input: HarvestInput): {
  totalGrams: number;
  envBonus: number;
  methodFactor: number;
  expectedGrams: number;
} {
  const envBonus = ENV_BONUS[input.growEnvironment];
  const methodFactor = METHOD_FACTOR[input.growMethod];
  const clampedSurvival = Math.min(1, Math.max(0, input.survivalRate));
  const clampedStatus = Math.min(1, Math.max(0.5, input.statusFactor));
  const base =
    input.seedCount *
    input.avgWeightGramsPerSeed *
    clampedSurvival *
    envBonus *
    clampedStatus *
    methodFactor;
  const totalGrams = Math.round(base);
  const expectedGrams = Math.round(
    input.seedCount * input.avgWeightGramsPerSeed * envBonus * methodFactor,
  );
  return { totalGrams, envBonus, methodFactor, expectedGrams };
}

/** 일지 기반 생존율·상태 계수 추정 (MVP 휴리스틱) */
export function inferRatesFromLogs(
  logs: { statusCheck: 'good' | 'ok' | 'stress' }[],
): { survivalRate: number; statusFactor: number } {
  if (logs.length === 0) return { survivalRate: 0.88, statusFactor: 0.95 };
  let stress = 0;
  let good = 0;
  for (const l of logs) {
    if (l.statusCheck === 'stress') stress += 1;
    if (l.statusCheck === 'good') good += 1;
  }
  const stressRatio = stress / logs.length;
  const survivalRate = Math.min(0.98, Math.max(0.65, 0.92 - stressRatio * 0.25));
  const statusFactor = Math.min(1, Math.max(0.55, 1 - stressRatio * 0.35));
  return { survivalRate, statusFactor };
}
