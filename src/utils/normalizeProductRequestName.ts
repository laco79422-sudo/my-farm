/** 의뢰 상품명 중복 판별용 정규화 */
export function normalizeProductRequestName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[·•]/g, ' ');
}
