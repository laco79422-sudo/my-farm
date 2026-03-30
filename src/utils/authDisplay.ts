import type { User } from 'firebase/auth';
import type { UserDoc } from '../types';
import type { MockAuthUser } from '../types/mockAuth';

/** 헤더·홈 등에서 동일한 표시 이름 계산 */
export function getAuthDisplayName(
  profile: UserDoc | null,
  user: User | null,
  mockUser?: MockAuthUser | null,
): string {
  return (
    profile?.name?.trim() ||
    profile?.displayName?.trim() ||
    profile?.nickname?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.split('@')[0]?.trim() ||
    mockUser?.displayName?.trim() ||
    mockUser?.email?.split('@')[0]?.trim() ||
    ''
  );
}
