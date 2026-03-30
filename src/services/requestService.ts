/**
 * 상품 의뢰(requests 컬렉션) 저장 예시
 */
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { ProductRequestStatus } from '../types';
import { getFirestoreDb, isFirebaseConfigured } from '../firebase';

export async function submitProductRequest(payload: {
  requesterUid: string;
  productName: string;
  category: string;
  description: string;
  reason: string;
  imageUrl?: string;
  status?: ProductRequestStatus;
}): Promise<string> {
  if (!isFirebaseConfigured() || !getFirestoreDb()) {
    throw new Error('Firebase가 설정되지 않았습니다.');
  }
  const db = getFirestoreDb()!;
  const ref = await addDoc(collection(db, 'requests'), {
    ...payload,
    status: payload.status ?? 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}
