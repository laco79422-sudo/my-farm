import type { PlantIdentifyResult } from '../../types/plantIdentification';
import type { DiagnosisPipelineResult } from '../../types/diagnosisAnalysis';
import { runDiagnosePlantPipeline, type RunDiagnosePlantOptions } from '../diagnosis/diagnosisPipeline';

export type DiagnosePlantOptions = Omit<RunDiagnosePlantOptions, 'file' | 'plant'>;

/**
 * 2단계: 이미지 + 1단계 식물 정보로 병충해·영양결핍 진단
 * (내부적으로 runDiagnosePlantPipeline 호출)
 */
export async function diagnosePlant(
  file: File,
  plant: PlantIdentifyResult,
  options: DiagnosePlantOptions,
): Promise<DiagnosisPipelineResult> {
  return runDiagnosePlantPipeline({
    ...options,
    file,
    plant,
  });
}
