/**
 * Firestore CRUD 예시 — users, plants, diagnoses 등
 * 실제 화면은 더미 데이터와 병행하며, 연동 시 이 서비스를 호출하도록 확장합니다.
 */
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import type { DiagnosisDoc, PlantDoc, UserDoc } from '../types';
import { getFirestoreDb, isFirebaseConfigured } from '../firebase';

function db() {
  const d = getFirestoreDb();
  if (!d || !isFirebaseConfigured()) {
    throw new Error('Firestore를 사용할 수 없습니다.');
  }
  return d;
}

export async function fetchUserProfile(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db(), 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserDoc;
}

/** 진단 결과 저장 예시 */
export async function saveDiagnosisRecord(payload: Omit<DiagnosisDoc, 'diagnosisId' | 'createdAt'>) {
  const ref = await addDoc(collection(db(), 'diagnoses'), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** 작물 등록 예시 */
export async function createPlantDoc(payload: Omit<PlantDoc, 'plantId' | 'createdAt'>) {
  const ref = await addDoc(collection(db(), 'plants'), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** 사용자 포인트 필드 업데이트 예시 */
export async function updateUserPoints(uid: string, newPoints: number) {
  await updateDoc(doc(db(), 'users', uid), { points: newPoints });
}

/** 컬렉션 목록 조회 예시 (진단 이력) */
export async function listRecentDiagnoses(ownerUid: string, max = 10): Promise<DocumentData[]> {
  const q = query(
    collection(db(), 'diagnoses'),
    where('ownerUid', '==', ownerUid),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), diagnosisId: d.id }));
}
