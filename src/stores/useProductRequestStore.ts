import { create } from 'zustand';
import { normalizeProductRequestName } from '../utils/normalizeProductRequestName';
import {
  normalizeRequestFlowStatus,
  type RequestFlowStatus,
} from '../utils/requestFlowStatus';

const LS_KEY = 'shop_product_requests_v1';

export type { RequestFlowStatus };

export interface StoredProductRequest {
  id: string;
  requesterUid: string;
  /** 표시용 (없으면 UID 마스킹) */
  requesterLabel?: string;
  productName: string;
  productNameNormalized: string;
  category: string;
  description: string;
  reason: string;
  status: RequestFlowStatus;
  /** 진행 지원자 uid */
  applicantUids: string[];
  /** 의뢰자가 선택한 진행자 */
  selectedHandlerUid: string | null;
  createdAt: string;
  updatedAt: string;
}

type LegacyRow = {
  id: string;
  requesterUid: string;
  requesterLabel?: string;
  productName: string;
  productNameNormalized?: string;
  category: string;
  description: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  supporterUids?: string[];
  applicantUids?: string[];
  selectedHandlerUid?: string | null;
  handlerId?: string;
};

function safeParse(raw: string | null): LegacyRow[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? (v as LegacyRow[]) : [];
  } catch {
    return [];
  }
}

function writeLs(list: StoredProductRequest[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* */
  }
}

function migrateRow(r: LegacyRow): StoredProductRequest {
  const applicants = [
    ...new Set([...(r.applicantUids ?? []), ...(r.supporterUids ?? [])]),
  ];
  const status = normalizeRequestFlowStatus(r.status);
  let selected = r.selectedHandlerUid ?? null;
  if (!selected && (status === 'registered' || status === 'selling') && applicants.length > 0) {
    selected = applicants[0];
  }
  return {
    id: r.id,
    requesterUid: r.requesterUid,
    requesterLabel: r.requesterLabel,
    productName: r.productName,
    productNameNormalized:
      r.productNameNormalized ?? normalizeProductRequestName(r.productName),
    category: r.category,
    description: r.description,
    reason: r.reason,
    status,
    applicantUids: applicants,
    selectedHandlerUid: selected,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function seedDemoIfEmpty(): StoredProductRequest[] {
  const t = new Date().toISOString();
  return [
    {
      id: 'demo_req_1',
      requesterUid: 'sample_farmer',
      requesterLabel: '데모 의뢰자',
      productName: '찹상추 씨앗 (소포장)',
      productNameNormalized: normalizeProductRequestName('찹상추 씨앗 (소포장)'),
      category: '씨앗',
      description: '10g 내외 소포장 희망',
      reason: '가정 재배 입문자 수요',
      status: 'recruiting',
      applicantUids: ['demo_handler_01'],
      selectedHandlerUid: null,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'demo_req_2',
      requesterUid: 'sample_farmer_2',
      requesterLabel: '데모 의뢰자 2',
      productName: '깊은 화분 30cm',
      productNameNormalized: normalizeProductRequestName('깊은 화분 30cm'),
      category: '용기',
      description: '배수구 포함',
      reason: '뿌리 작물용',
      status: 'recruiting',
      applicantUids: [],
      selectedHandlerUid: null,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'demo_req_3',
      requesterUid: 'sample_farmer_3',
      requesterLabel: '데모 의뢰자 3',
      productName: '칼슘 보충액',
      productNameNormalized: normalizeProductRequestName('칼슘 보충액'),
      category: '배양액',
      description: '토마토용',
      reason: '골다공증 예방',
      status: 'registered',
      applicantUids: ['u1', 'u2'],
      selectedHandlerUid: 'u1',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'demo_req_4',
      requesterUid: 'sample_farmer_4',
      requesterLabel: '데모 의뢰자 4',
      productName: '미니 삽 세트',
      productNameNormalized: normalizeProductRequestName('미니 삽 세트'),
      category: '농기구',
      description: '3종 세트',
      reason: '텃밭 키트 구성',
      status: 'selling',
      applicantUids: ['u3', 'u4'],
      selectedHandlerUid: 'u3',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'demo_req_5',
      requesterUid: 'sample_farmer_5',
      requesterLabel: '데모 의뢰자 5',
      productName: '스마트 급수 타이머',
      productNameNormalized: normalizeProductRequestName('스마트 급수 타이머'),
      category: 'IoT 부품',
      description: '앱 연동 희망',
      reason: '출장 중 관리',
      status: 'in_progress',
      applicantUids: ['u5'],
      selectedHandlerUid: 'u5',
      createdAt: t,
      updatedAt: t,
    },
  ];
}

function readInitial(): StoredProductRequest[] {
  if (typeof localStorage === 'undefined') return seedDemoIfEmpty();
  const raw = safeParse(localStorage.getItem(LS_KEY));
  if (raw.length > 0) {
    const migrated = raw.map(migrateRow);
    writeLs(migrated);
    return migrated;
  }
  const seeded = seedDemoIfEmpty();
  writeLs(seeded);
  return seeded;
}

export type AddProductRequestInput = {
  id?: string;
  requesterUid: string;
  requesterLabel?: string;
  productName: string;
  category: string;
  description: string;
  reason: string;
  status?: RequestFlowStatus;
};

interface State {
  requests: StoredProductRequest[];
  hydrate: () => void;
  findDuplicateByName: (productName: string) => StoredProductRequest | undefined;
  addRequest: (r: AddProductRequestInput) => StoredProductRequest;
  applyAsHandler: (requestId: string, uid: string) => { ok: boolean; error?: string };
  selectHandler: (
    requestId: string,
    requesterUid: string,
    applicantUid: string,
  ) => { ok: boolean; error?: string };
}

export const useProductRequestStore = create<State>((set, get) => ({
  requests: typeof window !== 'undefined' ? readInitial() : [],

  hydrate: () => set({ requests: readInitial() }),

  findDuplicateByName: (productName: string) => {
    const key = normalizeProductRequestName(productName);
    if (!key) return undefined;
    return get().requests.find(
      (r) => r.productNameNormalized === key && r.status !== 'rejected',
    );
  },

  addRequest: (payload) => {
    const now = new Date().toISOString();
    const id = payload.id ?? `local_${Date.now()}`;
    const row: StoredProductRequest = {
      id,
      requesterUid: payload.requesterUid,
      requesterLabel: payload.requesterLabel,
      productName: payload.productName.trim(),
      productNameNormalized: normalizeProductRequestName(payload.productName),
      category: payload.category,
      description: payload.description,
      reason: payload.reason,
      status: payload.status ?? 'recruiting',
      applicantUids: [],
      selectedHandlerUid: null,
      createdAt: now,
      updatedAt: now,
    };
    const next = [row, ...get().requests];
    set({ requests: next });
    writeLs(next);
    return row;
  },

  applyAsHandler: (requestId, uid) => {
    if (!uid) return { ok: false, error: '로그인이 필요합니다.' };
    const list = get().requests;
    const idx = list.findIndex((r) => r.id === requestId);
    if (idx < 0) return { ok: false, error: '의뢰를 찾을 수 없습니다.' };
    const r = list[idx];
    if (r.requesterUid === uid) return { ok: false, error: '본인 의뢰에는 지원할 수 없습니다.' };
    if (r.status !== 'recruiting') return { ok: false, error: '모집이 종료된 의뢰입니다.' };
    if (r.applicantUids.includes(uid)) return { ok: false, error: '이미 지원하셨습니다.' };
    const nextRow: StoredProductRequest = {
      ...r,
      applicantUids: [...r.applicantUids, uid],
      updatedAt: new Date().toISOString(),
    };
    const next = [...list.slice(0, idx), nextRow, ...list.slice(idx + 1)];
    set({ requests: next });
    writeLs(next);
    return { ok: true };
  },

  selectHandler: (requestId, requesterUid, applicantUid) => {
    const list = get().requests;
    const idx = list.findIndex((r) => r.id === requestId);
    if (idx < 0) return { ok: false, error: '의뢰를 찾을 수 없습니다.' };
    const r = list[idx];
    if (r.requesterUid !== requesterUid) return { ok: false, error: '의뢰자만 선택할 수 있습니다.' };
    if (r.status !== 'recruiting') return { ok: false, error: '모집 중일 때만 선택할 수 있습니다.' };
    if (!r.applicantUids.includes(applicantUid))
      return { ok: false, error: '지원자 목록에 없는 이용자입니다.' };
    const nextRow: StoredProductRequest = {
      ...r,
      selectedHandlerUid: applicantUid,
      status: 'in_progress',
      updatedAt: new Date().toISOString(),
    };
    const next = [...list.slice(0, idx), nextRow, ...list.slice(idx + 1)];
    set({ requests: next });
    writeLs(next);
    return { ok: true };
  },
}));
