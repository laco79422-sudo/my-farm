import type { DiagnosisDoc } from '../types';

/** MVP 더미 진단 결과 — 추후 API 응답 형태와 맞출 수 있음 */
export const dummyDiagnosisResult: Omit<DiagnosisDoc, 'diagnosisId' | 'ownerUid' | 'createdAt'> = {
  imageUrl: '',
  plantName: '방울토마토 (Solanum lycopersicum var. cerasiforme)',
  topPests: [
    { name: '흰가루병 (Oidium)', confidence: 87 },
    { name: '응애류', confidence: 62 },
    { name: '역병 (Phytophthora)', confidence: 34 },
  ],
  overallConfidence: 84,
  symptomDescription:
    '잎 표면에 흰색 가루 같은 곰팡이 균사가 관찰되며, 신초가 말림 증상이 동반됩니다. 습도가 높은 환경에서 흔합니다.',
  careGuide:
    '감염 잎은 제거 후 밀폐 비닐에 담아 폐기하세요. 유기농 살균제(황) 또는 친환경 제제를 이른 아침에 살포하고, 통풍·배수·햇빛을 개선하세요. 심한 경우 인근 작물로 확산을 막기 위해 격리를 권장합니다.',
};

export const dummyDiagnosisHistory: DiagnosisDoc[] = [
  {
    diagnosisId: 'd1',
    ownerUid: 'demo',
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a7b933ded94e?w=200&q=80',
    plantName: '방울토마토',
    topPests: [
      { name: '흰가루병', confidence: 82 },
      { name: '응애', confidence: 55 },
      { name: '세균성 반점병', confidence: 28 },
    ],
    overallConfidence: 82,
    symptomDescription: '잎에 백색 분말 패턴',
    careGuide: '통풍 개선, 살균 살포',
    createdAt: '2025-03-20',
  },
  {
    diagnosisId: 'd2',
    ownerUid: 'demo',
    imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200&q=80',
    plantName: '상추',
    topPests: [
      { name: '녹음병', confidence: 71 },
      { name: '총채벌레', confidence: 44 },
      { name: '바이러스병', confidence: 19 },
    ],
    overallConfidence: 71,
    symptomDescription: '잎 가장자리 황변',
    careGuide: '과습 방지, 배수 점검',
    createdAt: '2025-03-10',
  },
];
