/**
 * 상점·재배·수확 연동용 통합 상품 스키마
 * (씨앗 키트 + 스타터 키트 등 구매 가능 SKU)
 */
export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  difficulty: string;
  germinationDays: string;
  harvestDays: string;
  optimalTemperature: string;
  expectedYieldMinG: number;
  expectedYieldMaxG: number;
  regrow: boolean;
  regrowInfo?: string;
};

/** @alias Product */
export type CatalogProduct = Product;
