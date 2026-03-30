/** MVP 진단 요약 — 실제 API 응답 스키마로 교체 가능 */

export type DiagnosisResultKind = 'pest' | 'nutrient' | 'normal';

export interface DiagnosisResult {
  plantName: string;
  status: string;
  causes: string[];
  solutions: string[];
  /** 0~1 */
  confidence: number;
  detailHint?: DiagnosisResultKind;
}
