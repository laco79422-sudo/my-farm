import type { DiagnosisResult } from '../../types/diagnosisResult';

const MOCK_DELAY_MS = 900;

/** 더미 진단 결과 — TODO: 실제 멀티파트 업로드 + 추론 API로 교체 */
const DEFAULT_MOCK: DiagnosisResult = {
  plantName: '상추',
  status: '질소 부족 의심',
  causes: ['영양액 농도 부족', 'pH 불균형', '생장기 영양 요구량 증가'],
  solutions: [
    '질소 비율이 포함된 영양제 보충',
    'pH 5.5~6.5 범위 점검',
    '3일 후 새잎 상태 다시 확인',
  ],
  confidence: 0.82,
  detailHint: 'nutrient',
};

function mockFromFileName(file: File): DiagnosisResult {
  const name = file.name.toLowerCase();
  if (name.includes('tomato') || name.includes('토마토')) {
    return {
      plantName: '토마토',
      status: '노균병 가능성',
      causes: ['다습한 환경', '잎 표면 결로 지속', '통풍 부족'],
      solutions: ['감염 잎 제거 후 소각', '잎에 물이 닿지 않게 관수', '실내 환기·간격 조절'],
      confidence: 0.76,
      detailHint: 'pest',
    };
  }
  return { ...DEFAULT_MOCK };
}

export async function analyzePlantImage(file: File): Promise<DiagnosisResult> {
  // TODO: const form = new FormData(); form.append('image', file); await fetch('/api/diagnose', { method: 'POST', body: form })
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  return mockFromFileName(file);
}
