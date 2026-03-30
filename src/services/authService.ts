/**
 * Firebase Authentication — 이메일/비밀번호 · Google 로그인
 * users 컬렉션: uid, name, email, points (1000)
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, getFirebaseAuth, getFirestoreDb, isFirebaseConfigured, provider } from '../firebase';
import { signOutMock } from './mockAuthSession';

function ensureAuth() {
  const a = getFirebaseAuth();
  if (!a || !isFirebaseConfigured()) {
    throw new Error('Firebase가 설정되지 않았습니다. .env에 VITE_FIREBASE_* 값을 입력하세요.');
  }
  return a;
}

function ensureDb() {
  const db = getFirestoreDb();
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firestore를 사용할 수 없습니다. Firebase 설정을 확인하세요.');
  }
  return db;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  nickname: string,
): Promise<User> {
  const authInstance = ensureAuth();
  const db = ensureDb();
  const cred = await createUserWithEmailAndPassword(authInstance, email, password);
  await updateProfile(cred.user, { displayName: nickname });

  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    name: nickname,
    email: cred.user.email ?? email,
    points: 1000,
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const authInstance = ensureAuth();
  const db = ensureDb();
  const cred = await signInWithEmailAndPassword(authInstance, email, password);
  try {
    await updateDoc(doc(db, 'users', cred.user.uid), {
      email: cred.user.email ?? email,
      name: cred.user.displayName ?? cred.user.email?.split('@')[0] ?? '사용자',
    });
  } catch {
    /* 문서 없음 등 */
  }
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  if (!isFirebaseConfigured()) {
    signOutMock();
    return;
  }
  const authInstance = ensureAuth();
  await firebaseSignOut(authInstance);
}

/** Google 로그인 — signInWithPopup(auth, provider), 신규 시 users 저장 */
export async function signInWithGoogle(): Promise<User> {
  if (!isFirebaseConfigured() || !auth || !provider) {
    throw new Error('Google 로그인을 사용할 수 없습니다. Firebase 설정과 Google 로그인 제공자를 확인하세요.');
  }
  const db = ensureDb();
  const cred = await signInWithPopup(auth, provider);
  const u = cred.user;
  const ref = doc(db, 'users', u.uid);
  const snap = await getDoc(ref);

  const name = u.displayName?.trim() || u.email?.split('@')[0] || '사용자';

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: u.uid,
      name,
      email: u.email ?? '',
      points: 1000,
      createdAt: serverTimestamp(),
    });
  } else {
    try {
      await updateDoc(ref, {
        name,
        email: u.email ?? '',
      });
    } catch {
      /* */
    }
  }
  return u;
}
