/**
 * 리워드 광고 정책 — localStorage (비로그인 포함 남용 방지)
 * - 연속 시청 쿨다운
 * - 포인트 지급: 하루 최대 3회 (광고 시청으로 전체 진단 열기는 쿨다운만 만족하면 가능)
 */

const LS_DAY = 'farm_reward_ad_day';
const LS_POINT_GRANTS = 'farm_reward_ad_point_grants';
const LS_LAST_AD_MS = 'farm_reward_ad_last_ms';

export const REWARD_AD_COOLDOWN_MS = 90_000;
export const REWARD_AD_DAILY_POINT_MAX = 3;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readDay(): string {
  try {
    return localStorage.getItem(LS_DAY) ?? '';
  } catch {
    return '';
  }
}

function ensureDay(): void {
  const d = todayKey();
  try {
    if (readDay() !== d) {
      localStorage.setItem(LS_DAY, d);
      localStorage.setItem(LS_POINT_GRANTS, '0');
    }
  } catch {
    /* */
  }
}

function getPointGrantsToday(): number {
  ensureDay();
  try {
    return Number.parseInt(localStorage.getItem(LS_POINT_GRANTS) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function getLastAdMs(): number {
  try {
    return Number.parseInt(localStorage.getItem(LS_LAST_AD_MS) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

export type RewardAdEligibility = {
  /** 쿨다운이 끝나 광고 시청 가능 */
  canWatch: boolean;
  cooldownRemainingMs: number;
  /** 오늘 포인트 지급에 사용한 횟수 (0~3) */
  pointGrantsToday: number;
  /** 이번 시청으로 포인트를 받을 수 있는지 */
  willEarnPoints: boolean;
};

export function getRewardAdEligibility(now = Date.now()): RewardAdEligibility {
  ensureDay();
  const last = getLastAdMs();
  const cooldownRemainingMs = last > 0 ? Math.max(0, REWARD_AD_COOLDOWN_MS - (now - last)) : 0;
  const canWatch = cooldownRemainingMs === 0;
  const pointGrantsToday = getPointGrantsToday();
  const willEarnPoints = pointGrantsToday < REWARD_AD_DAILY_POINT_MAX;

  return {
    canWatch,
    cooldownRemainingMs,
    pointGrantsToday,
    willEarnPoints,
  };
}

/**
 * 광고 시청 세션 완료 — 항상 쿨다운 갱신.
 * 포인트 지급에 성공한 경우에만 일일 횟수 증가.
 */
export function recordRewardAdSessionComplete(options: { pointsGranted: boolean }): void {
  const now = Date.now();
  try {
    ensureDay();
    localStorage.setItem(LS_LAST_AD_MS, String(now));
    if (options.pointsGranted) {
      const n = getPointGrantsToday();
      if (n < REWARD_AD_DAILY_POINT_MAX) {
        localStorage.setItem(LS_POINT_GRANTS, String(n + 1));
      }
    }
  } catch {
    /* */
  }
}
