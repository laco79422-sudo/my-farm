import type { MarketListing } from '../types/farmHub';
import type { ShopItem } from '../types';

/** 장바구니(포인트 단위)와 호환되는 형태로 농부 마켓 상품을 변환 */
export function marketListingToShopItem(l: MarketListing): ShopItem {
  const pts = Math.max(1, Math.round(l.priceWon / 10));
  return {
    id: `market:${l.id}`,
    name: l.productName,
    category: '농부마켓',
    pricePoints: pts,
    imageUrl:
      l.imageDataUrl ||
      'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200&q=70',
    growPeriodOrUse: `${l.city} ${l.district} · ${l.farmerName} · ${l.farmName}`,
    shortDesc: `${l.grams}g · ${l.status === 'on_sale' ? '판매 중' : '품절'}`,
    referencePriceWon: l.priceWon,
    tags: l.localFoodCertified ? ['로컬푸드'] : undefined,
  };
}
