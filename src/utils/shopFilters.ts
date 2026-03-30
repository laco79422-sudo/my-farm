import type { ShopItem } from '../types';
import type { ShopDisplayCategory } from '../data/shopCategories';

export function matchesDisplayCategory(item: ShopItem, cat: ShopDisplayCategory): boolean {
  switch (cat) {
    case '씨앗':
      return item.category === '씨앗';
    case '키트':
      return item.category === '키트';
    case '용기':
      return item.category === '용기';
    case '영양제':
      return item.category === '배양액';
    case '장비':
      return item.category === '농기구';
    case '자동화':
      return item.category === 'IoT 부품';
    default:
      return true;
  }
}

export function matchesSearchQuery(item: ShopItem, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  const parts = [
    item.name,
    item.shortDesc,
    item.growPeriodOrUse,
    item.category,
    item.difficulty,
    item.difficultyLabel,
    item.optimalTemperature,
    item.regrow != null ? (item.regrow ? '재수확' : '') : '',
    item.germinationPeriod,
    item.harvestPeriod,
    item.recommendedGrowMethod,
    item.expectedYieldGrams,
    item.kitIncludes,
    ...(item.tags ?? []),
    ...(item.recommendUiTags ?? []),
    ...(item.cropTags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return parts.includes(t);
}

export function matchesCropFilter(item: ShopItem, crop: string): boolean {
  if (crop === '전체') return true;
  return item.cropTags?.includes(crop) ?? true;
}

export function matchesProblemFilter(item: ShopItem, prob: string): boolean {
  if (prob === '전체') return true;
  if (!item.problemTags?.length) return true;
  return item.problemTags.includes(prob as '영양' | '병해' | '환경' | '일반');
}
