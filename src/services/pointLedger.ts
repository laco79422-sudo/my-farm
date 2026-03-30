/**
 * 데모·테스트용 포인트 원장 (localStorage)
 * — 계정(uid)별 currentPoint / 획득·사용 내역 / 데모 충전 1회 제한
 */
import { usePointLedgerStore } from '../stores/usePointLedgerStore';

export type PointLedgerItem = {
  id: string;
  type: 'charge' | 'earn' | 'spend';
  label: string;
  amount: number;
  createdAt: string;
};

export type PointState = {
  currentPoint: number;
  earnHistory: PointLedgerItem[];
  spendHistory: PointLedgerItem[];
  hasUsedDemoCharge: boolean;
};

const LEDGER_KEY = 'myfarm_point_ledger_v1';
/** 요구사항 예시 키 — { [uid]: true } */
export const DEMO_CHARGE_FLAG_KEY = 'myfarm_has_used_demo_charge';

export const DEFAULT_POINT_STATE: PointState = {
  currentPoint: 1000,
  earnHistory: [],
  spendHistory: [],
  hasUsedDemoCharge: false,
};

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function readAllLedgers(): Record<string, PointState> {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== 'object') return {};
    return p as Record<string, PointState>;
  } catch {
    return {};
  }
}

function writeAllLedgers(data: Record<string, PointState>): void {
  try {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(data));
  } catch {
    /* */
  }
}

function readDemoChargeFlags(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(DEMO_CHARGE_FLAG_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== 'object') return {};
    return p as Record<string, boolean>;
  } catch {
    return {};
  }
}

function writeDemoChargeFlag(uid: string, used: boolean): void {
  try {
    const flags = readDemoChargeFlags();
    flags[uid] = used;
    localStorage.setItem(DEMO_CHARGE_FLAG_KEY, JSON.stringify(flags));
  } catch {
    /* */
  }
}

function bumpUi(): void {
  usePointLedgerStore.getState().bump();
}

export function loadPointState(uid: string): PointState {
  const all = readAllLedgers();
  const fromLedger = all[uid];
  const flags = readDemoChargeFlags();
  const fromFlag = Boolean(flags[uid]);

  if (!fromLedger) {
    return {
      ...DEFAULT_POINT_STATE,
      hasUsedDemoCharge: fromFlag,
    };
  }

  return {
    ...DEFAULT_POINT_STATE,
    ...fromLedger,
    earnHistory: Array.isArray(fromLedger.earnHistory) ? fromLedger.earnHistory : [],
    spendHistory: Array.isArray(fromLedger.spendHistory) ? fromLedger.spendHistory : [],
    hasUsedDemoCharge: Boolean(fromLedger.hasUsedDemoCharge) || fromFlag,
  };
}

export function savePointState(uid: string, state: PointState): void {
  const all = readAllLedgers();
  all[uid] = state;
  writeAllLedgers(all);
  writeDemoChargeFlag(uid, state.hasUsedDemoCharge);
  bumpUi();
}

/** 획득 내역(충전·적립) — 앞쪽에 추가, 잔액 증가 */
export function addEarnHistory(uid: string, label: string, amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) return;
  const state = loadPointState(uid);
  const item: PointLedgerItem = {
    id: newId('earn'),
    type: 'earn',
    label,
    amount,
    createdAt: new Date().toISOString(),
  };
  savePointState(uid, {
    ...state,
    currentPoint: state.currentPoint + amount,
    earnHistory: [item, ...state.earnHistory],
  });
}

/** 사용 내역만 앞쪽에 추가 (잔액은 변경하지 않음) */
export function addSpendHistory(uid: string, label: string, amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) return;
  const state = loadPointState(uid);
  const item: PointLedgerItem = {
    id: newId('use'),
    type: 'spend',
    label,
    amount,
    createdAt: new Date().toISOString(),
  };
  savePointState(uid, {
    ...state,
    spendHistory: [item, ...state.spendHistory],
  });
}

export function spendPoint(
  uid: string,
  label: string,
  amount: number,
): { ok: true } | { ok: false; error: string } {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
    return { ok: false, error: '잘못된 사용 금액입니다.' };
  }
  const state = loadPointState(uid);
  if (state.currentPoint < amount) {
    return { ok: false, error: '포인트가 부족합니다.' };
  }
  const item: PointLedgerItem = {
    id: newId('use'),
    type: 'spend',
    label,
    amount,
    createdAt: new Date().toISOString(),
  };
  savePointState(uid, {
    ...state,
    currentPoint: state.currentPoint - amount,
    spendHistory: [item, ...state.spendHistory],
  });
  return { ok: true };
}

/** 데모 충전 1회 — 성공 시 획득 내역에 type charge · "데모 충전" */
export function chargeDemoPoint(
  uid: string,
  amount: number,
): { ok: true } | { ok: false; error: string } {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
    return { ok: false, error: '잘못된 충전 금액입니다.' };
  }
  const state = loadPointState(uid);
  if (state.hasUsedDemoCharge) {
    return { ok: false, error: '데모 충전은 1회만 가능합니다.' };
  }
  const item: PointLedgerItem = {
    id: newId('earn'),
    type: 'charge',
    label: '데모 충전',
    amount,
    createdAt: new Date().toISOString(),
  };
  savePointState(uid, {
    ...state,
    currentPoint: state.currentPoint + amount,
    earnHistory: [item, ...state.earnHistory],
    hasUsedDemoCharge: true,
  });
  return { ok: true };
}
