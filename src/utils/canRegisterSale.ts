import type { GrowPlant } from '../types/farmHub';
import { remainingSellableGramsFromPlant } from './salesLimits';

export const MIN_SALE_REGISTER_GRAMS = 200;

export function canRegisterSale(
  plant: GrowPlant,
  registerWeightG: number,
): { ok: boolean; message: string } {
  if (plant.status !== 'harvested' && plant.status !== 'harvest_ready') {
    return {
      ok: false,
      message: '수확이 완료된 작물만 판매 등록할 수 있습니다.',
    };
  }
  if (plant.actualHarvestTotalG == null) {
    return { ok: false, message: '아직 수확이 완료되지 않았습니다' };
  }
  if (!Number.isFinite(registerWeightG) || registerWeightG <= 0) {
    return { ok: false, message: '판매 무게를 올바르게 입력해 주세요.' };
  }
  if (registerWeightG < MIN_SALE_REGISTER_GRAMS) {
    return { ok: false, message: '최소 판매 등록량은 200g입니다' };
  }
  const remaining = remainingSellableGramsFromPlant(plant);
  if (registerWeightG > remaining + 1e-6) {
    return { ok: false, message: '남은 판매 가능 수량을 초과했습니다' };
  }
  return { ok: true, message: '' };
}
