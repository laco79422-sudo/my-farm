import type { ShopItem } from '../types';
import { dummyShopItems } from './dummyShop';

const byId = new Map(dummyShopItems.map((i) => [i.id, i]));

function pickIds(ids: string[]): ShopItem[] {
  const out: ShopItem[] = [];
  for (const id of ids) {
    const item = byId.get(id);
    if (item) out.push(item);
  }
  return out;
}

function uniqueIds(ids: string[]): string[] {
  const u: string[] = [];
  for (const id of ids) {
    if (!u.includes(id)) u.push(id);
  }
  return u;
}

/**
 * 진단 상태·힌트에 맞춰 케어·도구류 추천 (씨앗과 별도)
 */
export function getRecommendedShopItems(params: {
  status: string;
  plantName?: string;
  detailHint?: 'pest' | 'nutrient' | 'normal';
  limit?: number;
}): ShopItem[] {
  const limit = Math.min(params.limit ?? 3, 5);
  const status = params.status.toLowerCase();
  const plant = (params.plantName ?? '').toLowerCase();

  let ids: string[] = [];

  if (params.detailHint === 'nutrient' || status.includes('질소') || status.includes('영양')) {
    ids = ['rec-nitro-a', 'rec-balance-b', 's5'];
  } else if (
    params.detailHint === 'pest' ||
    status.includes('균') ||
    status.includes('병') ||
    status.includes('해충')
  ) {
    ids = ['rec-fungus-guard', 's4b', 's5'];
  } else {
    ids = ['s5', 's4', 'lettuce'];
  }

  if (plant.includes('토마토')) {
    if (params.detailHint === 'nutrient' || status.includes('질소')) {
      ids = ['rec-balance-b', 's5b', 'rec-nitro-a'];
    } else if (params.detailHint === 'pest') {
      ids = ['rec-fungus-guard', 's5b', 's4b'];
    } else {
      ids = ['s5b', 'rec-balance-b', 'kit-tomato-grow'];
    }
  }

  if (plant.includes('바질') || plant.includes('허브')) {
    ids = ['rec-balance-b', 'kit-basil-mini', 's3b'];
  }

  if (plant.includes('상추') || plant.includes('잎') || plant.includes('샐러드')) {
    if (params.detailHint === 'nutrient') {
      ids = ['rec-nitro-a', 'rec-balance-b', 's5'];
    } else if (params.detailHint === 'pest') {
      ids = ['rec-fungus-guard', 's5', 's4'];
    } else {
      ids = ['kit-lettuce-starter', 'rec-balance-b', 's3b'];
    }
  }

  return pickIds(uniqueIds(ids)).slice(0, limit);
}

/**
 * 진단 작물·상태에 맞춘 추천 씨앗·키트 (바로 담기·재배 연결용)
 */
export function getRecommendedSeedsForDiagnosis(params: {
  plantName?: string;
  detailHint?: 'pest' | 'nutrient' | 'normal';
  status?: string;
  limit?: number;
}): ShopItem[] {
  const limit = Math.min(Math.max(params.limit ?? 3, 1), 4);
  const plant = (params.plantName ?? '').toLowerCase();
  const status = (params.status ?? '').toLowerCase();

  let ids: string[] = ['sprouts', 'lettuce', 'kit-lettuce-starter'];

  if (plant.includes('토마토')) {
    ids = ['kit-tomato-grow', 's5b', 'rec-balance-b'];
  } else if (plant.includes('바질') || plant.includes('허브') || plant.includes('바실')) {
    ids = ['basil', 'kit-basil-mini', 'lettuce'];
  } else if (plant.includes('상추') || plant.includes('잎') || plant.includes('채소')) {
    ids = ['lettuce', 'kit-lettuce-starter', 'sprouts'];
  } else if (plant.includes('새싹') || plant.includes('발아')) {
    ids = ['sprouts', 'microgreens', 'kit-lettuce-starter'];
  } else if (plant.includes('루꼴라') || plant.includes('루콜라')) {
    ids = ['arugula', 'lettuce', 'microgreens'];
  } else if (plant.includes('청경') || plant.includes('청경채')) {
    ids = ['bokchoy', 'lettuce', 's5'];
  }

  if (
    (params.detailHint === 'nutrient' || status.includes('영양')) &&
    !plant.includes('토마토')
  ) {
    ids = ['lettuce', 'basil', 'kit-lettuce-starter'];
  }

  return pickIds(uniqueIds(ids)).slice(0, limit);
}
