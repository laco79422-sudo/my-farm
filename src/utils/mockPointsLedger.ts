/** 데모 로그인 시 AuthContext 기본 1000P에 더하는 누적 조정 (차감은 음수) */
const LS = 'myfarm_mock_points_delta_v1';

function readMap(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(LS) || '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

export function getMockPointsDelta(uid: string): number {
  const m = readMap();
  const n = m[uid];
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

export function addMockPointsDelta(uid: string, delta: number): void {
  const m = readMap();
  m[uid] = (m[uid] ?? 0) + delta;
  try {
    localStorage.setItem(LS, JSON.stringify(m));
  } catch {
    /* */
  }
}
