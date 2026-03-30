import { create } from 'zustand';
import { POINT_RULES } from '../services/pointService';
import type { LocalFoodVendor } from '../types/localFood';

const LS = 'localfood_vendors_v1';

function readAll(): Record<string, LocalFoodVendor> {
  try {
    const raw = localStorage.getItem(LS);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LocalFoodVendor>;
  } catch {
    return {};
  }
}

function writeAll(m: Record<string, LocalFoodVendor>): void {
  try {
    localStorage.setItem(LS, JSON.stringify(m));
  } catch {
    /* */
  }
}

export function getLocalFoodVendorFromStorage(uid: string): LocalFoodVendor | null {
  return readAll()[uid] ?? null;
}

interface LocalFoodVendorState {
  tick: number;
  enroll: (params: {
    uid: string;
    currentPoints: number | null;
    eligibilityMet: boolean;
  }) => { ok: boolean; error?: string };
  /** 입점 직후 포인트 차감 실패 시 롤백 */
  removeVendor: (uid: string) => void;
  touchActivity: (uid: string) => void;
  updateReviewAvg: (uid: string, avg: number) => void;
}

export const useLocalFoodVendorStore = create<LocalFoodVendorState>((set) => ({
  tick: 0,

  enroll: ({ uid, currentPoints, eligibilityMet }) => {
    if (!uid) return { ok: false, error: '로그인이 필요합니다.' };
    const all = readAll();
    if (all[uid]) return { ok: false, error: '이미 로컬푸드점에 입점한 상태입니다.' };
    if (!eligibilityMet) return { ok: false, error: '입점 조건을 모두 충족해야 합니다.' };
    const cost = POINT_RULES.localFoodShopOpen;
    if (currentPoints !== null && currentPoints < cost) {
      return { ok: false, error: `개설에 ${cost}P가 필요합니다.` };
    }
    const now = new Date().toISOString();
    all[uid] = {
      ownerUid: uid,
      enrolledAt: now,
      openingFeePoints: cost,
      lastActivityAt: now,
      reviewAvg: 4.2,
    };
    writeAll(all);
    // TODO: Firebase applyPointChange({ delta: -cost, reason: 'local_food_enroll', ... })
    set((s) => ({ tick: s.tick + 1 }));
    return { ok: true };
  },

  removeVendor: (uid) => {
    const all = readAll();
    if (!all[uid]) return;
    delete all[uid];
    writeAll(all);
    set((s) => ({ tick: s.tick + 1 }));
  },

  touchActivity: (uid) => {
    const all = readAll();
    if (!all[uid]) return;
    all[uid] = { ...all[uid], lastActivityAt: new Date().toISOString() };
    writeAll(all);
    set((s) => ({ tick: s.tick + 1 }));
  },

  updateReviewAvg: (uid, avg) => {
    const all = readAll();
    if (!all[uid]) return;
    all[uid] = { ...all[uid], reviewAvg: avg };
    writeAll(all);
    set((s) => ({ tick: s.tick + 1 }));
  },
}));
