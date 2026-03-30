import { applyPointChange, POINT_RULES } from '../../services/pointService';
import { isFirebaseConfigured } from '../../firebase';

export type GrantRewardAdResult = {
  granted: boolean;
  newBalance: number;
  delta: number;
};

/**
 * 리워드 광고 시청 후 포인트 지급 (Firebase + 로그인 시에만)
 */
export async function grantRewardAdPoints(params: {
  uid: string;
  currentBalance: number;
}): Promise<GrantRewardAdResult> {
  const delta = POINT_RULES.rewardAd;
  const newBalance = params.currentBalance + delta;

  if (!isFirebaseConfigured()) {
    return { granted: false, newBalance: params.currentBalance, delta: 0 };
  }

  try {
    await applyPointChange({
      uid: params.uid,
      delta,
      reason: 'reward_ad',
      newBalance,
      description: '리워드 광고 시청',
    });
    return { granted: true, newBalance, delta };
  } catch {
    return { granted: false, newBalance: params.currentBalance, delta: 0 };
  }
}
