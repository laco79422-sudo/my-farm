import { POINT_RULES } from '../services/pointService';

export function categoryRewardSummary(category: string): string {
  const pts =
    category === '씨앗'
      ? POINT_RULES.productRequestSeed
      : category === '용기'
        ? POINT_RULES.productRequestVessel
        : POINT_RULES.productRequestOther;
  return `초기 최대 ${pts}P + 판매 보너스`;
}

export function categoryDisplayLabel(category: string): string {
  if (category === '배양액') return '영양제';
  if (category === '농기구') return '장비';
  if (category === 'IoT 부품') return '자동화';
  return category;
}

export function anonymizeUid(uid: string): string {
  if (uid.startsWith('sample_')) {
    const m = uid.match(/sample_farmer(?:_(\d+))?/);
    if (m) return m[1] ? `데모 의뢰자 ${m[1]}` : '데모 의뢰자';
  }
  if (uid.startsWith('demo_')) return '데모 진행자';
  if (uid.length <= 6) return `이용자 ${uid}`;
  return `이용자 ···${uid.slice(-4)}`;
}
