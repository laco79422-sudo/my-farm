/** Unsplash 정적 이미지 URL (상점·씨앗 카드 공통) */
export function unsplashPhoto(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?w=800&q=85&auto=format&fit=crop&fm=webp`;
}

export const SHOP_IMAGE_FALLBACK = unsplashPhoto('photo-1540420773420-3366772f4999');
