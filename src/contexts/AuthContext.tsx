import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { subscribeAuth, useAuthStore } from '../stores/useAuthStore';
import type { UserDoc } from '../types';
import type { MockAuthUser } from '../types/mockAuth';
import { formatPoints } from '../utils/format';
import { coercePointsFromFirestore } from '../utils/userProfile';
import { isFirebaseConfigured } from '../firebase';
import { readMockUserFromStorage } from '../services/mockAuthSession';
import { loadPointState } from '../services/pointLedger';
import { usePointLedgerStore } from '../stores/usePointLedgerStore';

export type AuthContextValue = {
  /** Firebase Auth 사용자 (세션은 Firebase가 관리, localStorage 직접 사용 안 함) */
  user: User | null;
  /** Firebase 미연결 시 로컬 데모 로그인 */
  mockUser: MockAuthUser | null;
  /** 저장·기록 owner 식별자 (Firebase uid 또는 데모 uid) */
  sessionUid: string | null;
  profile: UserDoc | null;
  /** 첫 onAuthStateChanged(+초기 프로필 동기화) 완료 전 */
  loading: boolean;
  /** loading이 false이면 인증 초기화 완료 — UI 분기에 사용 */
  isInitialized: boolean;
  profileLoading: boolean;
  isLoggedIn: boolean;
  /** JWT 등 — Firebase Web SDK는 주로 내부 저장소 사용, 필요 시 확장 */
  token: string | null;
  /** 헤더·모바일 메뉴 공통 — '...' | '—' | '1234P' */
  pointsLabel: string;
  /** 로그인 후 Firestore 동기화 완료 시 points 숫자 (미로그인·로딩 중은 null) */
  resolvedPoints: number | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unsub = subscribeAuth();
    return unsub;
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured()) return;
    const m = readMockUserFromStorage();
    if (m) useAuthStore.getState().setMockUser(m);
  }, []);

  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const mockUser = useAuthStore((s) => s.mockUser);
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);
  const profileLoading = useAuthStore((s) => s.profileLoading);
  const mockPointsRev = useAuthStore((s) => s.mockPointsRev);
  const pointLedgerRev = usePointLedgerStore((s) => s.rev);

  const value = useMemo<AuthContextValue>(() => {
    const isInitialized = !loading;
    const firebaseLoggedIn = Boolean(firebaseUser);
    const demoLoggedIn = !isFirebaseConfigured() && Boolean(mockUser);
    const loggedIn = firebaseLoggedIn || demoLoggedIn;
    const sessionUid = firebaseUser?.uid ?? mockUser?.uid ?? null;
    const token =
      firebaseLoggedIn ? null : demoLoggedIn ? 'mock-token' : null;
    const syncing = loading || (firebaseLoggedIn && profileLoading);

    let pointsLabel = '...';
    let resolvedPoints: number | null = null;

    if (!loading && !loggedIn) {
      pointsLabel = '—';
      resolvedPoints = null;
    } else if (loggedIn && !syncing) {
      const num = profile
        ? coercePointsFromFirestore(profile as unknown as Record<string, unknown>)
        : demoLoggedIn && sessionUid
          ? loadPointState(sessionUid).currentPoint
          : 0;
      pointsLabel = formatPoints(num);
      resolvedPoints = num;
    } else if (loggedIn && syncing) {
      pointsLabel = '...';
      resolvedPoints = null;
    }

    return {
      user: firebaseUser,
      mockUser,
      sessionUid,
      profile,
      loading,
      isInitialized,
      profileLoading,
      isLoggedIn: loggedIn,
      token,
      pointsLabel,
      resolvedPoints,
    };
  }, [firebaseUser, mockUser, profile, loading, profileLoading, mockPointsRev, pointLedgerRev]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** 전역 인증·프로필 (헤더·각 페이지 공통) */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
