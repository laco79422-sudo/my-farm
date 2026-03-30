/** 내 농장 허브 — 재배·일지·수확·판매·지역 (MVP 로컬 / 추후 Firestore 단일 스키마로 확장) */

export type GrowEnvironment = 'urban' | 'garden' | 'factory';
export type GrowMethod = 'hydro' | 'soil';

export interface FarmRegion {
  city: string;
  district: string;
}

export interface FarmProfile extends FarmRegion {
  farmName: string;
  farmerName: string;
  growEnvironment: GrowEnvironment;
  growMethod: GrowMethod;
  ownerUid: string;
  updatedAt: string;
}

export type PlantGrowStatus = 'growing' | 'harvest_ready' | 'harvested';

/** 내 농장 재배 작물 (구매 상품 연동·수확·판매 한도) */
export interface GrowPlant {
  id: string;
  name: string;
  ownerUid: string;
  /** 식재 시 심은 씨앗/모종 수 */
  seedCount: number;
  growEnvironment: GrowEnvironment;
  growMethod: GrowMethod;
  status: PlantGrowStatus;
  startedAt: string;
  /** 상점 `Product.id` 와 연결 (없으면 자유 입력 작물) */
  productId?: string | null;
  /** 예상 수확량 하한·상한(g) — 상품 연동 시 */
  expectedYieldMinG?: number;
  expectedYieldMaxG?: number;
  regrow?: boolean;
  regrowInfoText?: string | null;
  /** 수확 완료 후 확정 실제 총 수확량(g) */
  actualHarvestTotalG?: number | null;
  /** 판매 등록으로 소진한 누적 g */
  soldTotalG?: number;
  /** 수확 완료 시 채움 (기존 계산 스냅샷·호환) */
  harvest?: HarvestSnapshot;
}

/** 문서·도메인 별칭 */
export type FarmPlant = GrowPlant;

export interface DailyLogEntry {
  id: string;
  plantId: string;
  ownerUid: string;
  date: string;
  watered: boolean;
  statusCheck: 'good' | 'ok' | 'stress';
  memo: string;
  photoDataUrl?: string;
  createdAt: string;
}

export type TimelineEntryType = 'growth' | 'log' | 'harvest' | 'sale';

export interface TimelineEntry {
  id: string;
  plantId: string;
  date: string;
  type: TimelineEntryType;
  title: string;
  detail?: string;
}

/** 수확 스냅샷 (계산 결과 저장) */
export interface HarvestSnapshot {
  totalGrams: number;
  survivalRate: number;
  avgWeightPerUnitGrams: number;
  expectedGrams: number;
  seedCount: number;
  envBonus: number;
  /** 수경/토양 보조 계수 */
  methodFactor: number;
  statusFactor: number;
  harvestedAt: string;
}

export type ListingStatus = 'on_sale' | 'sold_out' | 'cancelled';
export type FulfillmentType = 'pickup' | 'delivery';

/** 로컬푸드 인증 상품에 부착되는 신뢰 스냅샷 (등록 시점) */
export interface ListingTrustSnapshot {
  logRate: number;
  survivalRateAvg: number;
  reviewAvg: number;
  salesSuccessRate: number;
  farmerGradeLabel: string;
  /** 강등·비활동 시 노출 계수 (1=정상, 1 미만이면 감소) */
  exposureBoost: number;
}

export type FarmerTierLevel = 'general' | 'growth' | 'local_vendor';

/** 개인상점·농부들 탐색 공통 상품 레코드 */
export interface MarketListing {
  id: string;
  plantId: string;
  ownerUid: string;
  farmerName: string;
  farmName: string;
  city: string;
  district: string;
  productName: string;
  /** 이번 등록 판매 무게 g */
  grams: number;
  priceWon: number;
  imageDataUrl?: string;
  growMethod: GrowMethod;
  harvestDate: string;
  status: ListingStatus;
  fulfillment: FulfillmentType;
  createdAt: string;
  /** 검증 입점 농부만 true — 지역 상단·인증 마크 등 */
  localFoodCertified?: boolean;
  trust?: ListingTrustSnapshot;
  farmerTierAtListing?: FarmerTierLevel;
  /** 차별화 기능 플래그 (MVP) */
  bundleOffer?: boolean;
  preorder?: boolean;
  subscription?: boolean;
}

export interface SalesRecord {
  id: string;
  listingId: string;
  plantId: string;
  ownerUid: string;
  grams: number;
  priceWon: number;
  completedAt: string;
  state: 'completed' | 'pending';
}
