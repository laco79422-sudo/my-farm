import { create } from 'zustand';
import type { DiagnosisResult } from '../types/diagnosisResult';

const LS_KEY = 'myfarm_diagnosis_session_v1';
const MAX_IMAGE_CHARS = 120_000;

type PersistShape = {
  result: DiagnosisResult;
  imageDataUrl: string | null;
  savedAt: string;
};

function loadPersisted(): PersistShape | null {
  try {
    const raw = sessionStorage.getItem(LS_KEY) ?? localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistShape;
  } catch {
    return null;
  }
}

export function persistDiagnosisSession(result: DiagnosisResult, imageDataUrl: string | null): void {
  const shape: PersistShape = {
    result,
    imageDataUrl,
    savedAt: new Date().toISOString(),
  };
  const str = JSON.stringify(shape);
  try {
    if (str.length <= MAX_IMAGE_CHARS) {
      sessionStorage.setItem(LS_KEY, str);
    } else {
      const withoutImg: PersistShape = { ...shape, imageDataUrl: null };
      sessionStorage.setItem(LS_KEY, JSON.stringify(withoutImg));
    }
  } catch {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ ...shape, imageDataUrl: null } satisfies PersistShape),
      );
    } catch {
      /* ignore */
    }
  }
}

export function clearDiagnosisSessionStorage(): void {
  sessionStorage.removeItem(LS_KEY);
  localStorage.removeItem(LS_KEY);
}

export function hydrateDiagnosisFromStorage(): PersistShape | null {
  return loadPersisted();
}

interface DiagnosisState {
  uploadedImageObjectUrl: string | null;
  /** 미리보기용 (결과 페이지 새로고침 시 data URL) */
  previewDataUrl: string | null;
  diagnosisResult: DiagnosisResult | null;
  isLoading: boolean;
  error: string | null;
  setFromFile: (file: File | null) => void;
  setPreviewDataUrl: (url: string | null) => void;
  setResult: (r: DiagnosisResult | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
  /** 새로고침 후 복원 */
  hydrateFromStorage: () => void;
}

export const useDiagnosisStore = create<DiagnosisState>((set, get) => ({
  uploadedImageObjectUrl: null,
  previewDataUrl: null,
  diagnosisResult: null,
  isLoading: false,
  error: null,

  setFromFile: (file) => {
    const prev = get().uploadedImageObjectUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({
      uploadedImageObjectUrl: file ? URL.createObjectURL(file) : null,
      error: null,
    });
  },

  setPreviewDataUrl: (url) => set({ previewDataUrl: url }),

  setResult: (r) => set({ diagnosisResult: r }),

  setLoading: (v) => set({ isLoading: v }),

  setError: (e) => set({ error: e }),

  reset: () => {
    const prev = get().uploadedImageObjectUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({
      uploadedImageObjectUrl: null,
      previewDataUrl: null,
      diagnosisResult: null,
      isLoading: false,
      error: null,
    });
  },

  hydrateFromStorage: () => {
    const data = loadPersisted();
    if (!data?.result) return;
    set({
      diagnosisResult: data.result,
      previewDataUrl: data.imageDataUrl,
      uploadedImageObjectUrl: null,
    });
  },
}));
