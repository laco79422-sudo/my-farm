/** 날짜/숫자 표시 유틸 */

export function formatPoints(n: number): string {
  return `${n.toLocaleString('ko-KR')}P`;
}

export function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** 썸네일·뱃지용 짧은 날짜 */
export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}
