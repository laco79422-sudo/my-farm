import type { GrowPlant, MarketListing } from '../types/farmHub';
import { canRegisterSale } from './canRegisterSale';

export type ListingValidation =
  | { ok: true }
  | { ok: false; reason: string };

/** 실제 수확량 기준 남은 판매 가능 g (soldTotalG 누적 차감) */
export function remainingSellableGramsFromPlant(plant: GrowPlant): number {
  if (plant.actualHarvestTotalG == null) return 0;
  const sold = plant.soldTotalG ?? 0;
  return Math.max(0, plant.actualHarvestTotalG - sold);
}

/**
 * @deprecated `remainingSellableGramsFromPlant` 사용 권장
 * (기존 코드 호환: harvest 스냅샷만 있는 작물)
 */
export function remainingSellableGrams(plant: GrowPlant, existingListings: MarketListing[]): number {
  if (plant.actualHarvestTotalG != null) {
    return remainingSellableGramsFromPlant(plant);
  }
  if (plant.status !== 'harvested' || !plant.harvest) return 0;
  const maxGrams = plant.harvest.totalGrams;
  const allocated = existingListings
    .filter((l) => l.plantId === plant.id && l.status !== 'cancelled')
    .reduce((a, l) => a + l.grams, 0);
  return Math.max(0, maxGrams - allocated);
}

/**
 * 판매 등록 검증 — 실제 수확량·최소 200g·남은 수량
 */
export function validateNewListing(
  plant: GrowPlant,
  requestGrams: number,
  _existingListings: MarketListing[],
): ListingValidation {
  const c = canRegisterSale(plant, requestGrams);
  if (!c.ok) return { ok: false, reason: c.message };
  return { ok: true };
}

export function shouldAutoSoldOut(plant: GrowPlant, listings: MarketListing[]): boolean {
  return remainingSellableGrams(plant, listings) <= 0 && plant.status === 'harvested';
}

export function getRemainingSellableForUi(plant: GrowPlant, listings: MarketListing[]): number {
  if (plant.actualHarvestTotalG != null) return remainingSellableGramsFromPlant(plant);
  return remainingSellableGrams(plant, listings);
}
