import type { CatalogProduct } from '../types/productCatalog';
import { formatRegrowInfoText } from '../utils/regrowCopy';
import { seedProducts } from './seedProducts';

export function seedProductsToCatalog(): CatalogProduct[] {
  return seedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    difficulty: p.difficulty,
    germinationDays: p.germination,
    harvestDays: p.harvest,
    optimalTemperature: p.temperature,
    expectedYieldMinG: p.yield.min,
    expectedYieldMaxG: p.yield.total,
    regrow: p.regrow,
    regrowInfo: formatRegrowInfoText(p.regrow, p.yield.total, p.regrowInfo),
  }));
}

/** 스타터 키트 등 seedProducts 외 SKU */
export const KIT_CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'kit-lettuce-starter',
    name: '상추 스타터 키트',
    price: 520,
    category: '키트',
    difficulty: '매우 쉬움',
    germinationDays: '3~7일',
    harvestDays: '25~40일',
    optimalTemperature: '15~22℃',
    expectedYieldMinG: 200,
    expectedYieldMaxG: 400,
    regrow: true,
    regrowInfo: '총 수확량 범위 내에서 분할 수확·판매 가능',
  },
  {
    id: 'kit-basil-mini',
    name: '바질 미니 키트',
    price: 480,
    category: '키트',
    difficulty: '매우 쉬움',
    germinationDays: '5~14일',
    harvestDays: '40~55일',
    optimalTemperature: '18~26℃',
    expectedYieldMinG: 80,
    expectedYieldMaxG: 150,
    regrow: true,
    regrowInfo: '총 수확량 범위 내에서 분할 수확·판매 가능',
  },
  {
    id: 'kit-tomato-grow',
    name: '방울토마토 도전 키트',
    price: 720,
    category: '키트',
    difficulty: '보통',
    germinationDays: '5~10일',
    harvestDays: '70~90일',
    optimalTemperature: '20~28℃',
    expectedYieldMinG: 400,
    expectedYieldMaxG: 800,
    regrow: false,
    regrowInfo: undefined,
  },
];

export const catalogProducts: CatalogProduct[] = [
  ...seedProductsToCatalog(),
  ...KIT_CATALOG_PRODUCTS,
];

const byId = new Map(catalogProducts.map((p) => [p.id, p]));

export function getCatalogProduct(id: string): CatalogProduct | undefined {
  return byId.get(id);
}
