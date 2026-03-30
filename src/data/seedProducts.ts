import type { ShopItem, ShopRecommendUiTag, SeedDifficulty } from '../types';
import { formatRegrowInfoText } from '../utils/regrowCopy';
import { unsplashPhoto } from './unsplashPhoto';

export interface SeedProductYield {
  total: number;
  min: number;
}

export interface SeedProduct {
  id: string;
  name: string;
  price: number;
  difficulty: string;
  germination: string;
  harvest: string;
  temperature: string;
  yield: SeedProductYield;
  regrow: boolean;
  regrowInfo: number[] | null;
  features: string[];
  category: string;
  order: number;
}

export const seedProducts: SeedProduct[] = [
  {
    id: 'sprouts',
    name: '새싹채소 키트',
    price: 200,
    difficulty: '매우 쉬움',
    germination: '1~2일',
    harvest: '5~7일',
    temperature: '18~22℃',
    yield: { total: 300, min: 200 },
    regrow: false,
    regrowInfo: null,
    features: ['가장 빠른 수확', '초보 성공률 최고', '물만 있어도 성장'],
    category: '씨앗',
    order: 1,
  },
  {
    id: 'microgreens',
    name: '마이크로그린 키트',
    price: 200,
    difficulty: '매우 쉬움',
    germination: '1~2일',
    harvest: '7~10일',
    temperature: '18~24℃',
    yield: { total: 300, min: 200 },
    regrow: false,
    regrowInfo: null,
    features: ['영양 밀도 높음', '빠른 성장', '샐러드 활용 최고'],
    category: '씨앗',
    order: 2,
  },
  {
    id: 'lettuce',
    name: '상추 키트',
    price: 200,
    difficulty: '매우 쉬움',
    germination: '2~4일',
    harvest: '25~30일',
    temperature: '15~20℃',
    yield: { total: 1200, min: 800 },
    regrow: true,
    regrowInfo: [400, 300, 200],
    features: ['가장 안정적인 작물', '재수확 가능', '샐러드 기본 재료'],
    category: '씨앗',
    order: 3,
  },
  {
    id: 'arugula',
    name: '루꼴라 키트',
    price: 200,
    difficulty: '쉬움',
    germination: '3~5일',
    harvest: '20~25일',
    temperature: '15~22℃',
    yield: { total: 800, min: 200 },
    regrow: true,
    regrowInfo: [400, 300],
    features: ['쌉싸름한 풍미', '빠른 성장', '고급 샐러드용'],
    category: '씨앗',
    order: 4,
  },
  {
    id: 'bokchoy',
    name: '청경채 키트',
    price: 200,
    difficulty: '쉬움',
    germination: '3~5일',
    harvest: '25~30일',
    temperature: '18~24℃',
    yield: { total: 900, min: 200 },
    regrow: true,
    regrowInfo: [400, 300],
    features: ['병충해 강함', '수경재배 적합', '아삭한 식감'],
    category: '씨앗',
    order: 5,
  },
  {
    id: 'basil',
    name: '바질 키트',
    price: 200,
    difficulty: '보통',
    germination: '3~5일',
    harvest: '30~40일',
    temperature: '20~28℃',
    yield: { total: 500, min: 200 },
    regrow: true,
    regrowInfo: [200, 150, 100],
    features: ['향이 강함', '지속 수확 가능', '판매 가치 높음'],
    category: '씨앗',
    order: 6,
  },
];

const KIT_IMAGES: Record<string, string> = {
  sprouts: unsplashPhoto('photo-1466637574441-749b8f19452f'),
  microgreens: unsplashPhoto('photo-1512621776951-a57141f2eefd'),
  lettuce: unsplashPhoto('photo-1622206151226-18ca2c9ab4a1'),
  arugula: unsplashPhoto('photo-1606787366850-de6330120b25'),
  bokchoy: unsplashPhoto('photo-1582515073490-dc0a5b2f0b5b'),
  basil: unsplashPhoto('photo-1592417817716-3994e4af2f7e'),
};

const RECOMMEND_UI_BY_ID: Record<string, ShopRecommendUiTag[]> = {
  sprouts: ['초보 추천', '빠른 성장'],
  microgreens: ['초보 추천', '빠른 성장'],
  lettuce: ['초보 추천', '인기'],
  arugula: ['초보 추천', '빠른 성장'],
  bokchoy: ['초보 추천', '인기'],
  basil: ['인기'],
};

const CROP_TAGS_BY_ID: Record<string, string[]> = {
  sprouts: ['새싹', '잎채소', '일반'],
  microgreens: ['마이크로그린', '잎채소', '일반'],
  lettuce: ['상추', '잎채소', '일반'],
  arugula: ['루꼴라', '잎채소', '일반'],
  bokchoy: ['청경채', '잎채소', '일반'],
  basil: ['바질', '허브', '일반'],
};

function toSeedDifficulty(label: string): SeedDifficulty {
  if (label.includes('보통')) return '중급';
  return '초급';
}

function growMethodLine(p: SeedProduct): string {
  if (p.regrow && p.regrowInfo?.length) {
    const parts = p.regrowInfo.map((g) => `${g}g`);
    return `재수확 가능 · 권장 분할 채취: ${parts.join(' → ')} (총 ${p.yield.total}g 내)`;
  }
  return '키트 가이드에 따라 관리 · 1회 채취 후 재파종 권장';
}

/** 상점·진단용 `ShopItem` 목록 */
export function seedProductsToShopItems(): ShopItem[] {
  return [...seedProducts]
    .sort((a, b) => a.order - b.order)
    .map((p) => {
      const recommendUiTags = RECOMMEND_UI_BY_ID[p.id] ?? ['초보 추천'];
      const growSummaryLine = `발아 ${p.germination} · 수확 ${p.harvest} · 적정 온도 ${p.temperature}`;
      const preset = p.name.replace(/\s*키트\s*$/, '');

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        pricePoints: p.price,
        imageUrl: KIT_IMAGES[p.id] ?? unsplashPhoto('photo-1540420773420-3366772f4999'),
        expectedYield: `예상 ${p.yield.min}~${p.yield.total}g (키트 기준)`,
        growPeriodOrUse: growSummaryLine,
        tags: [...p.features],
        recommendUiTags,
        difficulty: toSeedDifficulty(p.difficulty),
        difficultyLabel: p.difficulty,
        germinationPeriod: p.germination,
        harvestPeriod: p.harvest,
        optimalTemperature: p.temperature,
        recommendedGrowMethod: growMethodLine(p),
        expectedYieldGrams: `${p.yield.min}~${p.yield.total}g`,
        expectedYieldMinG: p.yield.min,
        expectedYieldMaxG: p.yield.total,
        regrowInfoText: formatRegrowInfoText(p.regrow, p.yield.total, p.regrowInfo),
        regrow: p.regrow,
        regrowHarvestGrams: p.regrowInfo,
        growStartPresetName: preset,
        listPriority: p.order,
        cropTags: CROP_TAGS_BY_ID[p.id] ?? ['일반'],
        problemTags: ['일반'],
        shortDesc: `${p.difficulty} · ${growSummaryLine}`,
      } satisfies ShopItem;
    });
}
