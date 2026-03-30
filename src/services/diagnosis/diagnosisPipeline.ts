import type { DiagnosisErrorCode, DiagnosisPipelineResult } from '../../types/diagnosisAnalysis';
import type { PlantIdentifyResult } from '../../types/plantIdentification';

const STEP_DELAY_MS = 320;

export class DiagnosisPipelineErrorClass extends Error {
  constructor(
    public code: DiagnosisErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DiagnosisPipelineErrorClass';
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DiagnosisPipelineErrorClass('ABORTED', '분석이 취소되었습니다.'));
      return;
    }
    const t = window.setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(t);
      reject(new DiagnosisPipelineErrorClass('ABORTED', '분석이 취소되었습니다.'));
    });
  });
}

function mockDiseaseCandidates(plantName: string): { name: string; confidence: number }[] {
  const base = plantName.split(/\s/)[0] ?? '작물';
  return [
    { name: `${base} 흰가루병 의심`, confidence: 82 },
    { name: '응애·진딧물 피해', confidence: 58 },
    { name: '영양결핍(칼슘/질소)', confidence: 41 },
  ];
}

function ensureDeadline(deadline: number): void {
  if (Date.now() > deadline) {
    throw new DiagnosisPipelineErrorClass('TIMEOUT', '분석 시간이 초과되었습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
  }
}

export type DiagnoseStepCallback = (step: 'diagnosing') => void;

export interface RunDiagnosePlantOptions {
  taskId: string;
  file: File;
  previewObjectUrl: string;
  plant: PlantIdentifyResult;
  signal?: AbortSignal;
  timeoutMs?: number;
  onStep?: DiagnoseStepCallback;
}

/**
 * 2단계: 병충해·영양결핍 진단 (1단계 식물 식별 이후)
 * — 더미, 추후 API 스왑
 */
export async function runDiagnosePlantPipeline(options: RunDiagnosePlantOptions): Promise<DiagnosisPipelineResult> {
  const { taskId, previewObjectUrl, plant, signal, timeoutMs = 12_000, onStep } = options;
  const deadline = Date.now() + timeoutMs;

  try {
    onStep?.('diagnosing');
    await sleep(STEP_DELAY_MS, signal);
    ensureDeadline(deadline);
    await sleep(280, signal);
    ensureDeadline(deadline);

    const diseaseCandidates = mockDiseaseCandidates(plant.plantName);
    const confidence = Math.min(
      95,
      Math.round(diseaseCandidates.reduce((a, c) => a + c.confidence, 0) / diseaseCandidates.length) + 5,
    );

    const basicFeatures = `잎·줄기의 형태와 색을 기준으로 ${plant.plantName} 특성에 맞게 보입니다. (데모)`;

    return {
      taskId,
      plantType: plant.plantName,
      scientificName: plant.scientificName,
      oneLineSummary: plant.summary,
      basicFeatures,
      beginnerTips: plant.tips,
      diseaseCandidates,
      confidence,
      symptomDescription: `${plant.plantName}에서 잎 표면 이상과 색 변화가 감지되었습니다. (데모 병해·생리 분석)`,
      careGuide: [
        ...plant.tips,
        '통풍과 배수를 개선하고, 감염 의심 잎은 제거 후 밀봉 폐기하세요. 친환경 살균·살충제는 이른 아침에 살포하는 것이 좋습니다.',
      ].join(' '),
      imageUrl: previewObjectUrl,
    };
  } catch (e) {
    if (e instanceof DiagnosisPipelineErrorClass) throw e;
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new DiagnosisPipelineErrorClass('ABORTED', '분석이 취소되었습니다.');
    }
    throw new DiagnosisPipelineErrorClass(
      'NETWORK',
      '네트워크 또는 이미지 처리 중 오류가 발생했습니다. 연결을 확인한 뒤 다시 시도해 주세요.',
    );
  }
}

export function mapPipelineToFirestorePayload(result: DiagnosisPipelineResult) {
  return {
    plantName: result.plantType,
    topPests: result.diseaseCandidates,
    overallConfidence: result.confidence,
    symptomDescription: result.symptomDescription,
    careGuide: result.careGuide,
    imageUrl: result.imageUrl,
  };
}
