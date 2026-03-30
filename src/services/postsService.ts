/**
 * Firestore posts 컬렉션 — content, uid, createdAt
 */
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';
import type { PostDoc } from '../types';
import { getFirestoreDb, isFirebaseConfigured } from '../firebase';

function db() {
  const d = getFirestoreDb();
  if (!d || !isFirebaseConfigured()) throw new Error('Firestore를 사용할 수 없습니다.');
  return d;
}

export async function createPost(content: string, uid: string): Promise<string> {
  const text = content.trim();
  if (!text) throw new Error('내용을 입력하세요.');
  const ref = await addDoc(collection(db(), 'posts'), {
    content: text,
    uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** 최대 max개, 최신순 */
export async function listPosts(max = 50): Promise<PostDoc[]> {
  const q = query(collection(db(), 'posts'), orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      postId: d.id,
      content: String(data.content ?? ''),
      uid: String(data.uid ?? ''),
      createdAt: data.createdAt,
    } as PostDoc;
  });
}
