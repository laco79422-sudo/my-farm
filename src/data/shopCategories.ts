export const SHOP_DISPLAY_CATEGORIES = ['씨앗', '키트', '용기', '영양제', '장비', '자동화'] as const;
export type ShopDisplayCategory = (typeof SHOP_DISPLAY_CATEGORIES)[number];
