import type { User } from 'firebase/auth';
import type { DocumentData } from 'firebase/firestore';
import type { UserDoc } from '../types';

/**
 * Firestore에서 points 필드 값을 숫자로 통일 (필드 누락·문자열·필드명 대소문자 차이 대응)
 */
export function coercePointsFromFirestore(data: Record<string, unknown>): number {
  const raw = data.points ?? data.Points;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const n = Number(raw.trim());
    if (Number.isFinite(n)) return n;
  }
  if (raw != null && typeof raw === 'object' && 'toNumber' in raw && typeof (raw as { toNumber: () => number }).toNumber === 'function') {
    try {
      const n = (raw as { toNumber: () => number }).toNumber();
      if (Number.isFinite(n)) return n;
    } catch {
      /* ignore */
    }
  }
  return 0;
}

/** Firestore users 문서 + Auth 사용자 정보를 UserDoc으로 정규화 */
export function normalizeUserDocFromFirestore(
  data: DocumentData,
  uid: string,
  firebaseUser: User | null,
): UserDoc {
  const r = data as Record<string, unknown>;
  const points = coercePointsFromFirestore(r);

  const email = (typeof r.email === 'string' && r.email) || firebaseUser?.email || '';

  const nameFromDoc =
    (typeof r.name === 'string' && r.name.trim()) ||
    (typeof r.displayName === 'string' && r.displayName.trim()) ||
    (typeof r.nickname === 'string' && r.nickname.trim()) ||
    '';

  return {
    uid: (typeof r.uid === 'string' && r.uid) || uid,
    email,
    name: nameFromDoc || undefined,
    points,
    displayName: typeof r.displayName === 'string' ? r.displayName : undefined,
    nickname: typeof r.nickname === 'string' ? r.nickname : undefined,
    grade: r.grade as UserDoc['grade'] | undefined,
    createdAt: r.createdAt as UserDoc['createdAt'],
    lastLoginAt: r.lastLoginAt as UserDoc['lastLoginAt'],
    photoURL:
      (typeof r.photoURL === 'string' && r.photoURL) ||
      firebaseUser?.photoURL ||
      undefined,
  };
}
