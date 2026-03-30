/** 식물 이름 찾기(1단계) 결과 — API/더미 공통 */
export interface PlantIdentifyResult {
  plantName: string;
  scientificName: string;
  /** 0~1 */
  confidence: number;
  summary: string;
  tips: string[];
  similarPlants: string[];
  taskId: string;
  /** 미리보기 object URL */
  imageUrl: string;
}

export type IdentifyStep = 'checking' | 'identifying' | 'summarizing';
