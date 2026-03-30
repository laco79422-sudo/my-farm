import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { create } from 'zustand';
import { getFirebaseAuth, getFirestoreDb, isFirebaseConfigured } from '../firebase';
import type { UserDoc } from '../types';
import { normalizeUserDocFromFirestore } from '../utils/userProfile';
import type { MockAuthUser } from '../types/mockAuth';

interface AuthState {
  firebaseUser: User | null;
  profile: UserDoc | null;
  /** 초기 Auth 상태 확인 전 */
  loading: boolean;
  /** 로그인됨 + Firestore users 문서 첫 스냅샷 대기 */
  profileLoading: boolean;
  /** Firebase 미설정 시 로컬 데모 세션 */
  mockUser: MockAuthUser | null;
  mockPointsRev: number;
  setFirebaseUser: (u: User | null) => void;
  setProfile: (p: UserDoc | null) => void;
  setLoading: (v: boolean) => void;
  setProfileLoading: (v: boolean) => void;
  setMockUser: (u: MockAuthUser | null) => void;
  bumpMockPointsRev: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  profile: null,
  loading: true,
  profileLoading: false,
  mockUser: null,
  mockPointsRev: 0,
  setFirebaseUser: (u) => set({ firebaseUser: u }),
  setProfile: (p) => set({ profile: p }),
  setLoading: (v) => set({ loading: v }),
  setProfileLoading: (v) => set({ profileLoading: v }),
  setMockUser: (u) => set({ mockUser: u }),
  bumpMockPointsRev: () => set((s) => ({ mockPointsRev: s.mockPointsRev + 1 })),
}));

let unsubscribeUserDoc: (() => void) | null = null;

function clearUserDocListener() {
  if (unsubscribeUserDoc) {
    unsubscribeUserDoc();
    unsubscribeUserDoc = null;
  }
}

/**
 * 앱 시작 시 한 번 호출 — onAuthStateChanged + users/{uid} 조회
 *
 * (과거 UI가 0P → "—" → 빈칸처럼 보이던 이유 — Navbar.tsx 상단 주석과 함께 참고)
 * 1) 0P: profile이 비어 있거나 points가 숫자로 인식되지 않아 formatPoints(0)에 가까운 상태였음
 * 2) "—": 비로그인 분기 또는 profile이 null인데 로그인으로 간주되는 순간·문자(유니코드 대시) 표시
 * 3) 헤더가 비어 보임: CSS에서 .nav__points가 768px 미만에서 display:none 이라 모바일 상단 바에는 포인트가 안 보였음
 */
export function subscribeAuth(): () => void {
  if (!isFirebaseConfigured()) {
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setProfileLoading(false);
    return () => undefined;
  }
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();
  if (!auth || !db) {
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setProfileLoading(false);
    return () => undefined;
  }

  const unsubAuth = onAuthStateChanged(auth, (user) => {
    clearUserDocListener();
    useAuthStore.getState().setProfile(null);
    useAuthStore.getState().setFirebaseUser(user);

    if (!user) {
      useAuthStore.getState().setProfile(null);
      useAuthStore.getState().setProfileLoading(false);
      useAuthStore.getState().setLoading(false);
      return;
    }

    useAuthStore.getState().setProfileLoading(true);
    const userRef = doc(db, 'users', user.uid);

    let firstSyncDone = false;
    function finishFirstSync() {
      if (firstSyncDone) return;
      firstSyncDone = true;
      useAuthStore.getState().setProfileLoading(false);
      useAuthStore.getState().setLoading(false);
    }

    /** 로그인 직후·새로고침 시 첫 데이터를 빠르게 채우기 위해 getDoc 병행 (onSnapshot과 동일 문서) */
    void getDoc(userRef)
      .then((snap) => {
        if (snap.exists()) {
          useAuthStore
            .getState()
            .setProfile(normalizeUserDocFromFirestore(snap.data(), user.uid, user));
        } else {
          useAuthStore.getState().setProfile(null);
        }
      })
      .catch(() => {
        /* 권한 오류 등은 onSnapshot 에러에서도 처리 */
      })
      .finally(() => {
        finishFirstSync();
      });

    unsubscribeUserDoc = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const normalized = normalizeUserDocFromFirestore(snap.data(), user.uid, user);
          useAuthStore.getState().setProfile(normalized);
        } else {
          useAuthStore.getState().setProfile(null);
        }
        finishFirstSync();
      },
      () => {
        useAuthStore.getState().setProfile(null);
        finishFirstSync();
      },
    );
  });

  return () => {
    clearUserDocListener();
    unsubAuth();
  };
}
