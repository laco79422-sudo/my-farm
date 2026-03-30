import type { DailyLogEntry, FarmProfile, GrowPlant } from '../types/farmHub';

/** 입점 정책 상수 — 운영 시 원격 설정으로 교체 */
export const LOCAL_FOOD_RULES = {
  minCompletedGrows: 3,
  minLogRate: 0.7,
  minHarvestExperiences: 3,
  minAvgSurvivalRate: 0.8,
} as const;

export type EligibilityItem = {
  id: string;
  label: string;
  met: boolean;
  detail?: string;
};

function countCalendarDaysInclusive(startYmd: string, endYmd: string): number {
  const a = new Date(startYmd).getTime();
  const b = new Date(endYmd).getTime();
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

/** 작물별 재배 기간 대비 기록한 날 비율의 평균 */
export function computeAverageLogRate(plants: GrowPlant[], logs: DailyLogEntry[]): number {
  if (plants.length === 0) return 0;
  const today = new Date().toISOString().slice(0, 10);
  let sum = 0;
  for (const p of plants) {
    const start = p.startedAt.slice(0, 10);
    const end = p.harvest ? p.harvest.harvestedAt.slice(0, 10) : today;
    const days = countCalendarDaysInclusive(start, end);
    const logDates = new Set(
      logs
        .filter((l) => l.plantId === p.id && l.date >= start && l.date <= end)
        .map((l) => l.date),
    );
    sum += days > 0 ? logDates.size / days : 0;
  }
  return sum / plants.length;
}

export function computeAverageSurvivalHarvested(plants: GrowPlant[]): number {
  const hv = plants.filter((p) => p.harvest);
  if (hv.length === 0) return 0;
  return hv.reduce((a, p) => a + (p.harvest?.survivalRate ?? 0), 0) / hv.length;
}

export function isFarmProfileComplete(p: FarmProfile | null): boolean {
  if (!p) return false;
  return Boolean(
    p.city?.trim() &&
      p.district?.trim() &&
      p.farmName?.trim() &&
      p.farmerName?.trim(),
  );
}

export function computeLocalFoodEligibility(
  plants: GrowPlant[],
  logs: DailyLogEntry[],
  profile: FarmProfile | null,
): {
  items: EligibilityItem[];
  allMet: boolean;
  completedGrows: number;
  logRate: number;
  harvestCount: number;
  avgSurvival: number;
} {
  const harvested = plants.filter((p) => p.status === 'harvested');
  const completedGrows = harvested.length;
  const logRate = computeAverageLogRate(plants, logs);
  const harvestCount = harvested.length;
  const avgSurvival = computeAverageSurvivalHarvested(plants);

  const items: EligibilityItem[] = [
    {
      id: 'grow',
      label: '최소 재배 완료',
      met: completedGrows >= LOCAL_FOOD_RULES.minCompletedGrows,
      detail: `${completedGrows} / ${LOCAL_FOOD_RULES.minCompletedGrows}회`,
    },
    {
      id: 'log',
      label: '생산일지 기록률 70% 이상',
      met: logRate >= LOCAL_FOOD_RULES.minLogRate - 1e-6,
      detail: `${Math.round(logRate * 100)}%`,
    },
    {
      id: 'harvest',
      label: '수확 경험 3회 이상',
      met: harvestCount >= LOCAL_FOOD_RULES.minHarvestExperiences,
      detail: `${harvestCount}회`,
    },
    {
      id: 'survival',
      label: '평균 생존율 80% 이상',
      met:
        harvestCount === 0
          ? false
          : avgSurvival >= LOCAL_FOOD_RULES.minAvgSurvivalRate - 1e-6,
      detail: harvestCount === 0 ? '수확 데이터 없음' : `${Math.round(avgSurvival * 100)}%`,
    },
    {
      id: 'profile',
      label: '농장 정보 완성 (지역 포함)',
      met: isFarmProfileComplete(profile),
      detail: isFarmProfileComplete(profile) ? 'OK' : '시/도·구·이름 입력',
    },
  ];

  const allMet = items.every((i) => i.met);
  return { items, allMet, completedGrows, logRate, harvestCount, avgSurvival };
}
