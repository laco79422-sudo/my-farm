import type { DailyLogEntry, FarmProfile, GrowPlant, SalesRecord } from '../types/farmHub';
import {
  computeAverageLogRate,
  computeAverageSurvivalHarvested,
  computeLocalFoodEligibility,
  LOCAL_FOOD_RULES,
} from './localFoodEligibility';
/** 진행 바용 5단계 (UI 순서) */
export const RANK_STEPS = [
  { id: 'beginner', stepLabel: '초급', fullLabel: '초급 농부' },
  { id: 'growth', stepLabel: '성장', fullLabel: '성장 농부' },
  { id: 'harvest', stepLabel: '수확', fullLabel: '수확 농부' },
  { id: 'local', stepLabel: '로컬', fullLabel: '로컬 농부' },
  { id: 'distribution', stepLabel: '유통', fullLabel: '유통 농부' },
] as const;

export type FarmerJourneyRankId = (typeof RANK_STEPS)[number]['id'];

const GROWTH = {
  completedGrows: 3,
  logRate: LOCAL_FOOD_RULES.minLogRate,
  harvestCount: 1,
  survivalAvg: LOCAL_FOOD_RULES.minAvgSurvivalRate,
} as const;

const HARVEST_TIER = {
  ...GROWTH,
  harvestCount: LOCAL_FOOD_RULES.minHarvestExperiences,
} as const;

const DISTRIBUTION_MIN_SALES = 3;

export interface MetricProgress {
  id: string;
  label: string;
  current: number;
  target: number;
  ratio: number;
  unit: 'count' | 'percent';
}

export interface NextRankInfo {
  id: FarmerJourneyRankId;
  fullLabel: string;
  shortLabel: string;
  conditionLines: string[];
  metrics: MetricProgress[];
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function countCompletedGrows(plants: GrowPlant[]): number {
  return plants.filter((p) => p.status === 'harvested').length;
}

function countHarvestExperiences(plants: GrowPlant[]): number {
  return plants.filter((p) => p.harvest).length;
}

function meetsGrowth(plants: GrowPlant[], logs: DailyLogEntry[]): boolean {
  const completed = countCompletedGrows(plants);
  const harvests = countHarvestExperiences(plants);
  const logRate = computeAverageLogRate(plants, logs);
  const survival = computeAverageSurvivalHarvested(plants);
  if (completed < GROWTH.completedGrows) return false;
  if (logRate + 1e-9 < GROWTH.logRate) return false;
  if (harvests < GROWTH.harvestCount) return false;
  if (harvests === 0) return false;
  return survival + 1e-9 >= GROWTH.survivalAvg;
}

function meetsHarvestTier(plants: GrowPlant[], logs: DailyLogEntry[]): boolean {
  if (!meetsGrowth(plants, logs)) return false;
  return countHarvestExperiences(plants) >= HARVEST_TIER.harvestCount;
}

function meetsLocal(
  plants: GrowPlant[],
  logs: DailyLogEntry[],
  profile: FarmProfile | null,
  isLocalVendor: boolean,
): boolean {
  if (isLocalVendor) return true;
  return computeLocalFoodEligibility(plants, logs, profile).allMet;
}

function meetsDistribution(isLocalVendor: boolean, sales: SalesRecord[]): boolean {
  if (!isLocalVendor) return false;
  const n = sales.filter((s) => s.state === 'completed').length;
  return n >= DISTRIBUTION_MIN_SALES;
}

function computeRankIndex(
  plants: GrowPlant[],
  logs: DailyLogEntry[],
  profile: FarmProfile | null,
  sales: SalesRecord[],
  isLocalVendor: boolean,
): number {
  if (meetsDistribution(isLocalVendor, sales)) return 4;
  if (meetsLocal(plants, logs, profile, isLocalVendor)) return 3;
  if (meetsHarvestTier(plants, logs)) return 2;
  if (meetsGrowth(plants, logs)) return 1;
  return 0;
}

function metricsTowardGrowth(plants: GrowPlant[], logs: DailyLogEntry[]): MetricProgress[] {
  const completed = countCompletedGrows(plants);
  const harvests = countHarvestExperiences(plants);
  const logRate = computeAverageLogRate(plants, logs);
  const survival = harvests > 0 ? computeAverageSurvivalHarvested(plants) : 0;
  return [
    {
      id: 'grows',
      label: '재배 완료',
      current: completed,
      target: GROWTH.completedGrows,
      ratio: clamp01(completed / GROWTH.completedGrows),
      unit: 'count',
    },
    {
      id: 'log',
      label: '생산일지 기록률',
      current: logRate,
      target: GROWTH.logRate,
      ratio: clamp01(logRate / GROWTH.logRate),
      unit: 'percent',
    },
    {
      id: 'harvest',
      label: '수확 경험',
      current: harvests,
      target: GROWTH.harvestCount,
      ratio: clamp01(harvests / GROWTH.harvestCount),
      unit: 'count',
    },
    {
      id: 'survival',
      label: '평균 생존율',
      current: survival,
      target: GROWTH.survivalAvg,
      ratio: harvests > 0 ? clamp01(survival / GROWTH.survivalAvg) : 0,
      unit: 'percent',
    },
  ];
}

function metricsTowardHarvestTier(plants: GrowPlant[], logs: DailyLogEntry[]): MetricProgress[] {
  const base = metricsTowardGrowth(plants, logs);
  const harvests = countHarvestExperiences(plants);
  return base.map((m) =>
    m.id === 'harvest'
      ? {
          ...m,
          target: HARVEST_TIER.harvestCount,
          ratio: clamp01(harvests / HARVEST_TIER.harvestCount),
        }
      : m,
  );
}

function metricsTowardLocal(
  plants: GrowPlant[],
  logs: DailyLogEntry[],
  profile: FarmProfile | null,
): MetricProgress[] {
  const e = computeLocalFoodEligibility(plants, logs, profile);
  const toRatio = (met: boolean, cur: number, tgt: number) =>
    tgt <= 0 ? 1 : clamp01(met ? 1 : cur / tgt);

  return [
    {
      id: 'grow',
      label: '재배 완료',
      current: e.completedGrows,
      target: LOCAL_FOOD_RULES.minCompletedGrows,
      ratio: toRatio(
        e.completedGrows >= LOCAL_FOOD_RULES.minCompletedGrows,
        e.completedGrows,
        LOCAL_FOOD_RULES.minCompletedGrows,
      ),
      unit: 'count',
    },
    {
      id: 'log',
      label: '생산일지 기록률',
      current: e.logRate,
      target: LOCAL_FOOD_RULES.minLogRate,
      ratio: clamp01(e.logRate / LOCAL_FOOD_RULES.minLogRate),
      unit: 'percent',
    },
    {
      id: 'harvest',
      label: '수확 경험',
      current: e.harvestCount,
      target: LOCAL_FOOD_RULES.minHarvestExperiences,
      ratio: toRatio(
        e.harvestCount >= LOCAL_FOOD_RULES.minHarvestExperiences,
        e.harvestCount,
        LOCAL_FOOD_RULES.minHarvestExperiences,
      ),
      unit: 'count',
    },
    {
      id: 'survival',
      label: '평균 생존율',
      current: e.avgSurvival,
      target: LOCAL_FOOD_RULES.minAvgSurvivalRate,
      ratio:
        e.harvestCount > 0
          ? clamp01(e.avgSurvival / LOCAL_FOOD_RULES.minAvgSurvivalRate)
          : 0,
      unit: 'percent',
    },
    {
      id: 'profile',
      label: '농장 정보(지역)',
      current: e.items.find((i) => i.id === 'profile')?.met ? 1 : 0,
      target: 1,
      ratio: e.items.find((i) => i.id === 'profile')?.met ? 1 : 0,
      unit: 'count',
    },
  ];
}

function metricsTowardDistribution(sales: SalesRecord[]): MetricProgress[] {
  const done = sales.filter((s) => s.state === 'completed').length;
  return [
    {
      id: 'sales',
      label: '판매 완료',
      current: done,
      target: DISTRIBUTION_MIN_SALES,
      ratio: clamp01(done / DISTRIBUTION_MIN_SALES),
      unit: 'count',
    },
  ];
}

function nextRankInfo(
  currentIndex: number,
  plants: GrowPlant[],
  logs: DailyLogEntry[],
  profile: FarmProfile | null,
  sales: SalesRecord[],
): NextRankInfo | null {
  if (currentIndex >= RANK_STEPS.length - 1) return null;
  const next = RANK_STEPS[currentIndex + 1];

  let metrics: MetricProgress[];
  let conditionLines: string[];

  switch (next.id) {
    case 'growth':
      metrics = metricsTowardGrowth(plants, logs);
      conditionLines = [
        `재배 완료 ${GROWTH.completedGrows}회`,
        `기록률 ${Math.round(GROWTH.logRate * 100)}%`,
        `수확 ${GROWTH.harvestCount}회`,
        `평균 생존율 ${Math.round(GROWTH.survivalAvg * 100)}%`,
      ];
      break;
    case 'harvest':
      metrics = metricsTowardHarvestTier(plants, logs);
      conditionLines = [
        '성장 농부 조건 유지',
        `수확 경험 ${HARVEST_TIER.harvestCount}회`,
        `평균 생존율 ${Math.round(HARVEST_TIER.survivalAvg * 100)}%`,
      ];
      break;
    case 'local':
      metrics = metricsTowardLocal(plants, logs, profile);
      conditionLines = [
        `재배 완료 ${LOCAL_FOOD_RULES.minCompletedGrows}회`,
        `기록률 ${Math.round(LOCAL_FOOD_RULES.minLogRate * 100)}%`,
        `수확 ${LOCAL_FOOD_RULES.minHarvestExperiences}회`,
        `평균 생존율 ${Math.round(LOCAL_FOOD_RULES.minAvgSurvivalRate * 100)}%`,
        '농장 정보(시·도·구) 완성',
      ];
      break;
    case 'distribution':
      metrics = metricsTowardDistribution(sales);
      conditionLines = [
        '로컬푸드점 입점 완료',
        `판매 완료 ${DISTRIBUTION_MIN_SALES}건 이상`,
      ];
      break;
    default:
      metrics = [];
      conditionLines = [];
  }

  return {
    id: next.id,
    fullLabel: next.fullLabel,
    shortLabel: next.stepLabel,
    conditionLines,
    metrics,
  };
}

export const NEXT_RANK_BENEFITS: Record<FarmerJourneyRankId, string[]> = {
  beginner: [],
  growth: ['개인상점 판매 등록 가능 범위 확대', '농부들 탐색 노출 기본 가중', '신뢰 지표(기록·생존) 반영 시작'],
  harvest: ['수확 실적 기반 신뢰도 상승', '상품 설명·수확일 강조 노출', '재구매·후기 연동 준비'],
  local: ['로컬푸드점 입점 자격 달성', '인증 마크·지역 우선 노출', '묶음·예약·정기 판매 옵션'],
  distribution: ['다채널 유통·거래 이력 강화', '우수 판매자 배지·추천 가중', '운영 데이터 리포트(예정)'],
};

export interface FarmerRankDashboard {
  currentIndex: number;
  currentFullLabel: string;
  currentShortLabel: string;
  stepBar: Array<{
    id: FarmerJourneyRankId;
    label: string;
    status: 'done' | 'current' | 'upcoming';
    isNext: boolean;
  }>;
  progressMetrics: MetricProgress[];
  nextRank: NextRankInfo | null;
  nextBenefits: string[];
  localFoodGoal: {
    title: string;
    subtitle: string;
    reached: boolean;
  };
}

export function computeFarmerRankDashboard(params: {
  plants: GrowPlant[];
  logs: DailyLogEntry[];
  profile: FarmProfile | null;
  sales: SalesRecord[];
  isLocalVendor: boolean;
}): FarmerRankDashboard {
  const { plants, logs, profile, sales, isLocalVendor } = params;
  const currentIndex = computeRankIndex(plants, logs, profile, sales, isLocalVendor);
  const cur = RANK_STEPS[currentIndex];

  const stepBar = RANK_STEPS.map((s, i) => ({
    id: s.id,
    label: s.stepLabel,
    status: (i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming') as
      | 'done'
      | 'current'
      | 'upcoming',
    isNext: i === currentIndex + 1,
  }));

  const nextRank = nextRankInfo(currentIndex, plants, logs, profile, sales);
  const progressMetrics = nextRank?.metrics ?? [];

  const eligibility = computeLocalFoodEligibility(plants, logs, profile);
  const localReached = eligibility.allMet || isLocalVendor;

  return {
    currentIndex,
    currentFullLabel: `${cur.fullLabel} (현재)`,
    currentShortLabel: cur.stepLabel,
    stepBar,
    progressMetrics,
    nextRank,
    nextBenefits: nextRank ? NEXT_RANK_BENEFITS[nextRank.id] : [],
    localFoodGoal: {
      title: '로컬푸드점 입점 가능',
      subtitle: localReached
        ? '입점 조건을 충족했습니다. 로컬푸드 메뉴에서 개설을 진행해 보세요.'
        : '수확·기록·생존율·프로필을 맞추면 로컬 단계와 입점으로 이어집니다.',
      reached: localReached,
    },
  };
}
