/** MVP: 실제 수확량 = 예상 min~max 평균의 내림 */
export function computeActualHarvestGramsMvp(expectedYieldMinG: number, expectedYieldMaxG: number): number {
  const lo = Math.min(expectedYieldMinG, expectedYieldMaxG);
  const hi = Math.max(expectedYieldMinG, expectedYieldMaxG);
  return Math.floor((lo + hi) / 2);
}
