import type { MarketListing } from '../types/farmHub';

const LS_KEY = 'farmhub_market_listings_v1';

/** 농부들 탐색 데모 — 로컬 마켓이 비었을 때 1회 시드 */
export const SEED_MARKET_LISTINGS: MarketListing[] = [
  {
    id: 'seed_lst_1',
    plantId: 'demo_p1',
    ownerUid: 'demo_farmer_1',
    farmerName: '김텃밭',
    farmName: '강동 미니팜',
    city: '서울',
    district: '강동구',
    productName: '로메인 상추',
    grams: 400,
    priceWon: 6000,
    growMethod: 'soil',
    harvestDate: '2026-03-20',
    status: 'on_sale',
    fulfillment: 'pickup',
    createdAt: '2026-03-21T10:00:00.000Z',
  },
  {
    id: 'seed_lst_2',
    plantId: 'demo_p2',
    ownerUid: 'demo_farmer_2',
    farmerName: '이수경',
    farmName: '스마트팜 A',
    city: '경기',
    district: '성남시',
    productName: '방울토마토',
    grams: 800,
    priceWon: 12000,
    growMethod: 'hydro',
    harvestDate: '2026-03-22',
    status: 'on_sale',
    fulfillment: 'delivery',
    createdAt: '2026-03-22T09:00:00.000Z',
  },
  {
    id: 'seed_lst_cert',
    plantId: 'demo_p_cert',
    ownerUid: 'demo_farmer_cert',
    farmerName: '박신뢰',
    farmName: '검증팜',
    city: '서울',
    district: '송파구',
    productName: '루꼴라',
    grams: 250,
    priceWon: 7500,
    growMethod: 'hydro',
    harvestDate: '2026-03-25',
    status: 'on_sale',
    fulfillment: 'pickup',
    createdAt: '2026-03-25T08:00:00.000Z',
    localFoodCertified: true,
    farmerTierAtListing: 'local_vendor',
    bundleOffer: true,
    preorder: false,
    subscription: true,
    trust: {
      logRate: 0.82,
      survivalRateAvg: 0.88,
      reviewAvg: 4.6,
      salesSuccessRate: 0.92,
      farmerGradeLabel: '로컬푸드 입점',
      exposureBoost: 1,
    },
  },
];

export function seedGlobalMarketIfEmpty(): void {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw && JSON.parse(raw).length > 0) return;
    localStorage.setItem(LS_KEY, JSON.stringify(SEED_MARKET_LISTINGS));
  } catch {
    /* */
  }
}
