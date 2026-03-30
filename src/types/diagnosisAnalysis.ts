/** 클라이언트 AI 진단 파이프라인 — 상태·결과·오류 코드 */

export type AnalysisStatus =
  | 'idle'
  | 'uploading'
  | 'checking'
  | 'identifying'
  | 'summarizing'
  | 'diagnosing'
  | 'done'
  | 'error';

export type DiagnosisErrorCode = 'NOT_PLANT' | 'TIMEOUT' | 'NETWORK' | 'ANALYSIS_FAILED' | 'ABORTED';

export interface DiagnosisPipelineError {
  code: DiagnosisErrorCode;
  message: string;
}

/** 최종 결과 (API/더미 공통) — 2단계(병해 진단) 결과 */
export interface DiagnosisPipelineResult {
  plantType: string;
  scientificName?: string;
  oneLineSummary?: string;
  basicFeatures?: string;
  beginnerTips?: string[];
  diseaseCandidates: { name: string; confidence: number }[];
  /** 종합 신뢰도 0~100 */
  confidence: number;
  symptomDescription: string;
  careGuide: string;
  imageUrl: string;
  taskId: string;
}

/** 진행 중 작업(이미지)과 완료 결과 분리 저장용 */
export interface ActiveDiagnosisTask {
  taskId: string;
  status: AnalysisStatus;
  previewObjectUrl: string;
  fileName: string;
  startedAt: number;
}
