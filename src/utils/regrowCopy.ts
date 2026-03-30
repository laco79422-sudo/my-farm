/** 재수확 안내 문구 (상점·카탈로그 공통) */
export function formatRegrowInfoText(
  regrow: boolean,
  totalG: number,
  parts: number[] | null,
): string | undefined {
  if (!regrow) return undefined;
  if (parts?.length) {
    return `총 수확량 범위 내에서 분할 수확 가능 (권장: ${parts.map((g) => `${g}g`).join(' → ')}, 합계 ≤ ${totalG}g)`;
  }
  return '총 수확량 범위 내에서만 분할 판매 가능';
}
