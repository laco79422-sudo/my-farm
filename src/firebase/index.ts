/**
 * Firebase 단일 초기화 (Vite 환경 변수만 사용 — 실제 키는 코드에 넣지 마세요)
 * 환경 변수가 비어 있으면 초기화를 건너뛰고, 앱은 데모 모드로 동작합니다.
 */
import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

function env(key: keyof ImportMetaEnv): string {
  const v = import.meta.env[key];
  return typeof v === 'string' ? v.trim() : '';
}

const firebaseConfig: FirebaseOptions = {
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('VITE_FIREBASE_APP_ID'),
};

/** 웹 앱에 필요한 6개 값이 모두 있을 때만 true (일부만 있으면 초기화하지 않음) */
export function isFirebaseConfigured(): boolean {
  return (
    Boolean(firebaseConfig.apiKey) &&
    Boolean(firebaseConfig.authDomain) &&
    Boolean(firebaseConfig.projectId) &&
    Boolean(firebaseConfig.storageBucket) &&
    Boolean(firebaseConfig.messagingSenderId) &&
    Boolean(firebaseConfig.appId)
  );
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let provider: GoogleAuthProvider | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, provider, db, storage, firebaseConfig };

export function getFirebaseApp(): FirebaseApp | undefined {
  return app;
}

export function getFirebaseAuth(): Auth | undefined {
  return auth;
}

export function getFirestoreDb(): Firestore | undefined {
  return db;
}

export function getFirebaseStorage(): FirebaseStorage | undefined {
  return storage;
}
