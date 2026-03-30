import { create } from 'zustand';
import type { FarmDiagnosisRecord } from '../types/farmDiagnosisRecord';

function recordsKey(ownerUid: string): string {
  return `myfarm_diagnosis_records_${ownerUid}`;
}

export function loadFarmRecordsFromStorage(ownerUid: string): FarmDiagnosisRecord[] {
  try {
    const raw = localStorage.getItem(recordsKey(ownerUid));
    if (!raw) return [];
    const arr = JSON.parse(raw) as FarmDiagnosisRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persistRecords(ownerUid: string, records: FarmDiagnosisRecord[]): void {
  try {
    localStorage.setItem(recordsKey(ownerUid), JSON.stringify(records));
  } catch {
    /* quota */
  }
}

interface FarmState {
  savedRecords: FarmDiagnosisRecord[];
  activeOwnerUid: string | null;
  saveLoading: boolean;
  saveError: string | null;
  loadForUser: (uid: string) => void;
  addRecord: (r: FarmDiagnosisRecord) => void;
  setSaveLoading: (v: boolean) => void;
  setSaveError: (e: string | null) => void;
  getById: (id: string) => FarmDiagnosisRecord | undefined;
}

export const useFarmStore = create<FarmState>((set, get) => ({
  savedRecords: [],
  activeOwnerUid: null,
  saveLoading: false,
  saveError: null,

  loadForUser: (uid) => {
    if (!uid) {
      set({ savedRecords: [], activeOwnerUid: null });
      return;
    }
    const list = loadFarmRecordsFromStorage(uid);
    set({ savedRecords: list, activeOwnerUid: uid });
  },

  addRecord: (r) => {
    const uid = r.ownerUid;
    const existing = loadFarmRecordsFromStorage(uid);
    const next = [r, ...existing.filter((x) => x.id !== r.id)].sort((a, b) =>
      a.savedAt < b.savedAt ? 1 : -1,
    );
    persistRecords(uid, next);
    set((state) => {
      if (state.activeOwnerUid !== uid && state.activeOwnerUid !== null) {
        return {};
      }
      return { savedRecords: next, activeOwnerUid: uid };
    });
  },

  setSaveLoading: (v) => set({ saveLoading: v }),

  setSaveError: (e) => set({ saveError: e }),

  getById: (id) => get().savedRecords.find((x) => x.id === id),
}));
