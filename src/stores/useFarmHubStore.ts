import { create } from 'zustand';
import type {
  DailyLogEntry,
  FarmProfile,
  GrowPlant,
  HarvestSnapshot,
  MarketListing,
  SalesRecord,
} from '../types/farmHub';
import { getCatalogProduct } from '../data/catalogProducts';
import { computeHarvestWeightG, inferRatesFromLogs } from '../utils/harvestCalculator';
import { computeActualHarvestGramsMvp } from '../utils/harvestMvp';
import { validateNewListing } from '../utils/salesLimits';
import { buildListingTrustSnapshot } from '../utils/localFoodTrust';
import {
  getLocalFoodVendorFromStorage,
  useLocalFoodVendorStore,
} from './useLocalFoodVendorStore';

/** 개인상점 등록 입력 — 서버가 부여하는 필드·신뢰 스냅샷 제외 */
export type PublishMarketListingInput = Omit<
  MarketListing,
  'id' | 'createdAt' | 'status' | 'ownerUid' | 'trust' | 'farmerTierAtListing'
>;

const LS_PROFILE = (uid: string) => `farmhub_profile_${uid}`;
const LS_PLANTS = (uid: string) => `farmhub_plants_${uid}`;
const LS_LOGS = (uid: string) => `farmhub_logs_${uid}`;
const LS_SALES = (uid: string) => `farmhub_sales_${uid}`;
const LS_MARKET_GLOBAL = 'farmhub_market_listings_v1';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readGlobalListings(): MarketListing[] {
  return safeParse<MarketListing[]>(localStorage.getItem(LS_MARKET_GLOBAL), []);
}

function writeGlobalListings(list: MarketListing[]): void {
  try {
    localStorage.setItem(LS_MARKET_GLOBAL, JSON.stringify(list));
  } catch {
    /* quota */
  }
}

function listingGramsByPlant(listings: MarketListing[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const l of listings) {
    if (l.status === 'cancelled') continue;
    m[l.plantId] = (m[l.plantId] ?? 0) + l.grams;
  }
  return m;
}

function normalizeGrowPlant(p: GrowPlant, listAlloc: Record<string, number>): GrowPlant {
  const fromList = listAlloc[p.id] ?? 0;
  let soldTotalG = p.soldTotalG ?? 0;
  if (soldTotalG <= 0 && fromList > 0) soldTotalG = fromList;

  let actualHarvestTotalG = p.actualHarvestTotalG ?? null;
  if (actualHarvestTotalG == null && p.harvest?.totalGrams != null) {
    actualHarvestTotalG = Math.round(p.harvest.totalGrams);
  }

  let status: GrowPlant['status'] = p.status;
  if (status !== 'growing' && status !== 'harvest_ready' && status !== 'harvested') {
    status = 'growing';
  }

  return { ...p, soldTotalG, actualHarvestTotalG, status };
}

interface FarmHubState {
  ownerUid: string | null;
  profile: FarmProfile | null;
  plants: GrowPlant[];
  logs: DailyLogEntry[];
  sales: SalesRecord[];
  /** 글로벌 마켓 LS 변경 시 UI 갱신용 */
  listingsTick: number;

  hydrate: (uid: string) => void;
  clearLocal: () => void;
  saveProfile: (p: Omit<FarmProfile, 'ownerUid' | 'updatedAt'> & Partial<Pick<FarmProfile, 'updatedAt'>>) => void;
  addPlant: (input: {
    name: string;
    seedCount: number;
    growEnvironment: GrowPlant['growEnvironment'];
    growMethod: GrowPlant['growMethod'];
    productId?: string | null;
    expectedYieldMinG?: number;
    expectedYieldMaxG?: number;
    regrow?: boolean;
    regrowInfoText?: string | null;
  }) => void;
  addDailyLog: (input: Omit<DailyLogEntry, 'id' | 'createdAt' | 'ownerUid'>) => void;
  completeHarvest: (plantId: string, avgWeightGramsPerSeed?: number) => { ok: boolean; error?: string };
  publishListing: (input: PublishMarketListingInput) => { ok: boolean; error?: string };
  markListingSoldOut: (listingId: string) => void;
  /** 품절 시 자동: 남은 수량 0이면 */
  refreshListingStatuses: () => void;
  getListingsForOwner: () => MarketListing[];
}

export const useFarmHubStore = create<FarmHubState>((set, get) => ({
  ownerUid: null,
  profile: null,
  plants: [],
  logs: [],
  sales: [],
  listingsTick: 0,

  hydrate: (uid) => {
    if (!uid) {
      set({ ownerUid: null, profile: null, plants: [], logs: [], sales: [] });
      return;
    }
    const profile = safeParse<FarmProfile | null>(localStorage.getItem(LS_PROFILE(uid)), null);
    const rawPlants = safeParse<GrowPlant[]>(localStorage.getItem(LS_PLANTS(uid)), []);
    const logs = safeParse<DailyLogEntry[]>(localStorage.getItem(LS_LOGS(uid)), []);
    const sales = safeParse<SalesRecord[]>(localStorage.getItem(LS_SALES(uid)), []);
    const listAlloc = listingGramsByPlant(readGlobalListings());
    const plants = rawPlants.map((p) => normalizeGrowPlant(p, listAlloc));
    try {
      localStorage.setItem(LS_PLANTS(uid), JSON.stringify(plants));
    } catch {
      /* */
    }
    set({ ownerUid: uid, profile: profile && profile.ownerUid === uid ? profile : null, plants, logs, sales });
  },

  clearLocal: () => set({ ownerUid: null, profile: null, plants: [], logs: [], sales: [] }),

  saveProfile: (p) => {
    const uid = get().ownerUid;
    if (!uid) return;
    const next: FarmProfile = {
      ...p,
      ownerUid: uid,
      updatedAt: p.updatedAt ?? new Date().toISOString(),
    };
    try {
      localStorage.setItem(LS_PROFILE(uid), JSON.stringify(next));
    } catch {
      /* */
    }
    set({ profile: next });
  },

  addPlant: (input) => {
    const uid = get().ownerUid;
    if (!uid) return;
    const cat = input.productId ? getCatalogProduct(input.productId) : undefined;
    const plant: GrowPlant = {
      id: `plant_${Date.now()}`,
      name: input.name,
      ownerUid: uid,
      seedCount: input.seedCount,
      growEnvironment: input.growEnvironment,
      growMethod: input.growMethod,
      status: 'growing',
      startedAt: new Date().toISOString(),
      productId: input.productId != null && input.productId !== '' ? input.productId : (cat?.id ?? null),
      expectedYieldMinG: cat?.expectedYieldMinG ?? input.expectedYieldMinG,
      expectedYieldMaxG: cat?.expectedYieldMaxG ?? input.expectedYieldMaxG,
      regrow: cat?.regrow ?? input.regrow,
      regrowInfoText: cat?.regrowInfo ?? input.regrowInfoText ?? null,
      actualHarvestTotalG: null,
      soldTotalG: 0,
    };
    const plants = [...get().plants, plant];
    try {
      localStorage.setItem(LS_PLANTS(uid), JSON.stringify(plants));
    } catch {
      /* */
    }
    set({ plants });
  },

  addDailyLog: (input) => {
    const uid = get().ownerUid;
    if (!uid) return;
    const log: DailyLogEntry = {
      ...input,
      id: `log_${Date.now()}`,
      ownerUid: uid,
      createdAt: new Date().toISOString(),
    };
    const logs = [...get().logs, log];
    try {
      localStorage.setItem(LS_LOGS(uid), JSON.stringify(logs));
    } catch {
      /* */
    }
    set({ logs });
  },

  completeHarvest: (plantId, avgWeightGramsPerSeed = 42) => {
    const uid = get().ownerUid;
    if (!uid) return { ok: false, error: '로그인이 필요합니다.' };
    const plant = get().plants.find((p) => p.id === plantId);
    if (!plant) return { ok: false, error: '작물을 찾을 수 없습니다.' };
    if (plant.status === 'harvested') return { ok: false, error: '이미 수확 완료입니다.' };

    const minG = plant.expectedYieldMinG;
    const maxG = plant.expectedYieldMaxG;
    const hasCatalogRange =
      minG != null &&
      maxG != null &&
      Number.isFinite(minG) &&
      Number.isFinite(maxG) &&
      minG > 0 &&
      maxG > 0;

    let totalGrams: number;
    let harvest: HarvestSnapshot;

    if (hasCatalogRange) {
      totalGrams = computeActualHarvestGramsMvp(minG, maxG);
      const mid = (minG + maxG) / 2;
      harvest = {
        totalGrams,
        survivalRate: 1,
        avgWeightPerUnitGrams: totalGrams / Math.max(1, plant.seedCount),
        expectedGrams: mid,
        seedCount: plant.seedCount,
        envBonus: 1,
        methodFactor: 1,
        statusFactor: 1,
        harvestedAt: new Date().toISOString(),
      };
    } else {
      const plantLogs = get().logs.filter((l) => l.plantId === plantId);
      const { survivalRate, statusFactor } = inferRatesFromLogs(plantLogs);
      const calc = computeHarvestWeightG({
        seedCount: plant.seedCount,
        avgWeightGramsPerSeed,
        survivalRate,
        growEnvironment: plant.growEnvironment,
        growMethod: plant.growMethod,
        statusFactor,
      });
      totalGrams = calc.totalGrams;
      harvest = {
        totalGrams,
        survivalRate,
        avgWeightPerUnitGrams: avgWeightGramsPerSeed,
        expectedGrams: calc.expectedGrams,
        seedCount: plant.seedCount,
        envBonus: calc.envBonus,
        methodFactor: calc.methodFactor,
        statusFactor,
        harvestedAt: new Date().toISOString(),
      };
    }

    const plants = get().plants.map((p) =>
      p.id === plantId
        ? {
            ...p,
            status: 'harvested' as const,
            harvest,
            actualHarvestTotalG: totalGrams,
            soldTotalG: p.soldTotalG ?? 0,
          }
        : p,
    );
    try {
      localStorage.setItem(LS_PLANTS(uid), JSON.stringify(plants));
    } catch {
      /* */
    }
    set({ plants });
    return { ok: true };
  },

  publishListing: (input) => {
    const uid = get().ownerUid;
    if (!uid) return { ok: false, error: '로그인이 필요합니다.' };
    const plant = get().plants.find((p) => p.id === input.plantId);
    if (!plant) return { ok: false, error: '작물을 찾을 수 없습니다.' };
    const wantCert = Boolean(input.localFoodCertified);
    const hasPremium =
      Boolean(input.bundleOffer) || Boolean(input.preorder) || Boolean(input.subscription);
    if (wantCert || hasPremium) {
      const vendor = getLocalFoodVendorFromStorage(uid);
      if (!vendor) {
        return {
          ok: false,
          error: wantCert
            ? '로컬푸드점 입점을 먼저 완료한 뒤 인증 상품으로 등록할 수 있습니다.'
            : '묶음·예약·정기 판매는 입점 농부만 사용할 수 있습니다.',
        };
      }
    }
    const allListings = readGlobalListings();
    const v = validateNewListing(plant, input.grams, allListings);
    if (!v.ok) return { ok: false, error: v.reason };

    let trust: MarketListing['trust'];
    let farmerTierAtListing: MarketListing['farmerTierAtListing'];
    if (wantCert) {
      const vendor = getLocalFoodVendorFromStorage(uid)!;
      trust = buildListingTrustSnapshot({
        plants: get().plants,
        logs: get().logs,
        sales: get().sales,
        reviewAvg: vendor.reviewAvg,
        lastVendorActivityAt: vendor.lastActivityAt,
        tier: 'local_vendor',
      });
      farmerTierAtListing = 'local_vendor';
      useLocalFoodVendorStore.getState().touchActivity(uid);
    }

    const listing: MarketListing = {
      ...input,
      id: `lst_${Date.now()}`,
      ownerUid: uid,
      status: 'on_sale',
      createdAt: new Date().toISOString(),
      localFoodCertified: wantCert ? true : undefined,
      trust,
      farmerTierAtListing,
      bundleOffer: hasPremium ? input.bundleOffer : undefined,
      preorder: hasPremium ? input.preorder : undefined,
      subscription: hasPremium ? input.subscription : undefined,
    };
    const next = [listing, ...allListings];
    writeGlobalListings(next);

    const plantsNext = get().plants.map((p) =>
      p.id === input.plantId ? { ...p, soldTotalG: (p.soldTotalG ?? 0) + input.grams } : p,
    );
    try {
      localStorage.setItem(LS_PLANTS(uid), JSON.stringify(plantsNext));
    } catch {
      /* */
    }

    set((s) => ({ plants: plantsNext, listingsTick: s.listingsTick + 1 }));
    return { ok: true };
  },

  markListingSoldOut: (listingId) => {
    const all = readGlobalListings();
    const next = all.map((l) => (l.id === listingId ? { ...l, status: 'sold_out' as const } : l));
    writeGlobalListings(next);
    set((s) => ({ listingsTick: s.listingsTick + 1 }));
    const uid = get().ownerUid;
    const listing = all.find((l) => l.id === listingId);
    if (listing && uid && listing.ownerUid === uid) {
      const rec: SalesRecord = {
        id: `sale_${Date.now()}`,
        listingId,
        plantId: listing.plantId,
        ownerUid: uid,
        grams: listing.grams,
        priceWon: listing.priceWon,
        completedAt: new Date().toISOString(),
        state: 'completed',
      };
      const sales = [...get().sales, rec];
      try {
        localStorage.setItem(LS_SALES(uid), JSON.stringify(sales));
      } catch {
        /* */
      }
      set({ sales });
    }
  },

  /** 추후: 구매 확정 시 품절 처리. 현재는 수동 「판매 완료」만 사용 */
  refreshListingStatuses: () => {},

  getListingsForOwner: () => {
    const uid = get().ownerUid;
    if (!uid) return [];
    return readGlobalListings().filter((l) => l.ownerUid === uid);
  },
}));

export function getMarketplaceListings(): MarketListing[] {
  return readGlobalListings();
}
