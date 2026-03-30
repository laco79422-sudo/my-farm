import { checkIsPlantFromImageFile } from '../diagnosis/plantDetection';
import { DiagnosisPipelineErrorClass } from '../diagnosis/diagnosisPipeline';
import type { PlantIdentifyResult, IdentifyStep } from '../../types/plantIdentification';

const STEP_DELAY_MS = 380;

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

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const MOCK_PLANTS: Omit<PlantIdentifyResult, 'taskId' | 'imageUrl' | 'confidence'>[] = [
  {
    plantName: '로메인 상추',
    scientificName: 'Lactuca sativa var. longifolia',
    summary: '길쭉한 잎이 위로 자라는 샐러드용 상추입니다.',
    tips: ['통풍과 적당한 수분 유지가 중요합니다.', '잎이 연할수록 부드러운 식감입니다.'],
    similarPlants: ['버터헤드 상추', '적상추', '크림상추'],
  },
  {
    plantName: '방울토마토',
    scientificName: 'Solanum lycopersicum',
    summary: '작은 과실이 주렁주렁 열리는 토마토 품종입니다.',
    tips: ['하루 6시간 이상 햇빛을 받게 하세요.', '과습하면 과일이 터질 수 있습니다.'],
    similarPlants: ['대추방울토마토', '토마토', '방울토마토(적색)'],
  },
  {
    plantName: '오이',
    scientificName: 'Cucumis sativus',
    summary: '덩굴성으로 자라며 수분이 많은 과채류입니다.',
    tips: ['덩굴을 받침대에 올려 통풍을 확보하세요.', '잎이 커지면 순을 적당히 정리합니다.'],
    similarPlants: ['백오이', '가시오이', '노각오이'],
  },
  {
    plantName: '풋고추',
    scientificName: 'Capsicum annuum',
    summary: '매운맛이 강하지 않은 풋고추 품종이 많습니다.',
    tips: ['결과기에는 칼륨 비료를 보충하면 좋습니다.', '병해 방지를 위해 잎에 물이 고이지 않게 하세요.'],
    similarPlants: ['청양고추', '홍고추', '꽈리고추'],
  },
];

function pickMockPlant(file: File, taskId: string): Omit<PlantIdentifyResult, 'taskId' | 'imageUrl'> {
  const h = hashString(`${file.name}-${file.size}-${taskId}`) % MOCK_PLANTS.length;
  const base = MOCK_PLANTS[h] ?? MOCK_PLANTS[0]!;
  const confidence = 0.82 + (hashString(taskId) % 14) / 100;
  return {
    ...base,
    confidence: Math.min(0.96, Math.round(confidence * 100) / 100),
  };
}

function ensureDeadline(deadline: number): void {
  if (Date.now() > deadline) {
    throw new DiagnosisPipelineErrorClass('TIMEOUT', '분석 시간이 초과되었습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
  }
}

export interface IdentifyPlantOptions {
  taskId: string;
  file: File;
  previewObjectUrl: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  onStep?: (step: IdentifyStep) => void;
}

/**
 * 1단계: 식물 여부 확인 → 이름·학명·요약·유사 후보 (더미, 추후 API 교체)
 */
export async function identifyPlant(options: IdentifyPlantOptions): Promise<PlantIdentifyResult> {
  const { taskId, file, previewObjectUrl, signal, timeoutMs = 15_000, onStep } = options;
  const deadline = Date.now() + timeoutMs;

  const tick = async (step: IdentifyStep) => {
    ensureDeadline(deadline);
    onStep?.(step);
    await sleep(STEP_DELAY_MS, signal);
    ensureDeadline(deadline);
  };

  try {
    onStep?.('checking');
    await sleep(220, signal);
    ensureDeadline(deadline);

    let isPlant: boolean;
    try {
      isPlant = await checkIsPlantFromImageFile(file);
    } catch {
      throw new DiagnosisPipelineErrorClass('ANALYSIS_FAILED', '식물 여부 확인에 실패했습니다. 다른 사진으로 시도해 주세요.');
    }
    ensureDeadline(deadline);

    if (!isPlant) {
      throw new DiagnosisPipelineErrorClass(
        'NOT_PLANT',
        '식물로 인식되지 않는 이미지입니다. 잎·줄기·열매가 잘 보이게 다시 촬영해 주세요.',
      );
    }

    await tick('identifying');
    const picked = pickMockPlant(file, taskId);
    ensureDeadline(deadline);

    await tick('summarizing');

    return {
      taskId,
      imageUrl: previewObjectUrl,
      plantName: picked.plantName,
      scientificName: picked.scientificName,
      confidence: picked.confidence,
      summary: picked.summary,
      tips: picked.tips,
      similarPlants: picked.similarPlants,
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

/** 학명·요약 보강 (추후 별도 API 연동) */
export async function getPlantSummary(plantName: string): Promise<{ detail: string }> {
  await sleep(200);
  return {
    detail: `${plantName}은(는) 재배 환경에 따라 생장 속도가 달라질 수 있습니다. 햇빛·통풍·수분을 균형 있게 맞추세요.`,
  };
}
