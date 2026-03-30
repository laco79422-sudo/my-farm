import { useAuthStore } from '../stores/useAuthStore';
import type { MockAuthUser } from '../types/mockAuth';

export const MOCK_AUTH_STORAGE_KEY = 'myfarm_mock_auth_v1';

export function readMockUserFromStorage(): MockAuthUser | null {
  try {
    const raw = localStorage.getItem(MOCK_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MockAuthUser;
    if (!parsed?.uid) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeMockUserToStorage(u: MockAuthUser): void {
  localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(u));
}

export function clearMockUserStorage(): void {
  localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
}

export function createDemoMockUser(): MockAuthUser {
  return {
    uid: 'demo_local_user',
    displayName: 'Google 사용자(데모)',
    email: 'demo@myfarm.local',
  };
}

export function signInWithGoogleMock(): MockAuthUser {
  const u = createDemoMockUser();
  writeMockUserToStorage(u);
  useAuthStore.getState().setMockUser(u);
  return u;
}

export function signOutMock(): void {
  clearMockUserStorage();
  useAuthStore.getState().setMockUser(null);
}
