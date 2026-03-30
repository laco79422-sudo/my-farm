import type { DiagnosisResult } from './diagnosisResult';

/** 내 농장에 저장된 진단 기록 (로컬 MVP / 추후 Firestore 정렬) */
export interface FarmDiagnosisRecord {
  id: string;
  plantName: string;
  status: string;
  savedAt: string;
  imageUrl: string;
  causes: string[];
  solutions: string[];
  confidence: number;
  ownerUid: string;
}

export type SaveDiagnosisPayload = {
  result: DiagnosisResult;
  imageDataUrl: string;
  ownerUid: string;
};

/** 저장 API 입력 — 이미지는 data URL 또는 업로드된 URL */
export function recordFromPayload(p: SaveDiagnosisPayload, id: string): FarmDiagnosisRecord {
  return {
    id,
    plantName: p.result.plantName,
    status: p.result.status,
    savedAt: new Date().toISOString(),
    imageUrl: p.imageDataUrl,
    causes: p.result.causes,
    solutions: p.result.solutions,
    confidence: p.result.confidence,
    ownerUid: p.ownerUid,
  };
}
