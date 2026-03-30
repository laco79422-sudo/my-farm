import type { FarmDiagnosisRecord } from '../../types/farmDiagnosisRecord';
import { recordFromPayload, type SaveDiagnosisPayload } from '../../types/farmDiagnosisRecord';
import { useFarmStore } from '../../stores/useFarmStore';

/**
 * 진단 결과를 내 농장에 저장 (MVP: Zustand + localStorage)
 * TODO: POST /api/farm/diagnosis-records — 서버에서 id·savedAt 발급 후 동기화
 */
export async function saveDiagnosisRecord(payload: SaveDiagnosisPayload): Promise<FarmDiagnosisRecord> {
  await new Promise((r) => setTimeout(r, 400));
  const id = `record_${Date.now()}`;
  const record = recordFromPayload(payload, id);
  useFarmStore.getState().addRecord(record);
  return record;
}
