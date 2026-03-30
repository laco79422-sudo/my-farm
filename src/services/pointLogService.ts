import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { getFirestoreDb, isFirebaseConfigured } from '../firebase';

export type PointLogRow = {
  id: string;
  delta: number;
  balanceAfter: number;
  reason: string;
  description?: string;
  atLabel: string;
  /** 양수면 획득, 음수면 사용 */
  kind: 'earn' | 'spend';
};

function formatAt(ts: { seconds?: number } | null | undefined): string {
  if (!ts || typeof ts !== 'object') return '—';
  const sec = 'seconds' in ts && typeof ts.seconds === 'number' ? ts.seconds : null;
  if (sec == null) return '—';
  try {
    return new Date(sec * 1000).toLocaleString('ko-KR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

/** Firestore point_logs — 인덱스 없으면 빈 배열 */
export async function listPointLogsForUser(uid: string, max = 40): Promise<PointLogRow[]> {
  if (!isFirebaseConfigured()) return [];
  const db = getFirestoreDb();
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'point_logs'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(max),
    );
    const snap = await getDocs(q);
    const rows: PointLogRow[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const delta = typeof d.delta === 'number' ? d.delta : 0;
      const balanceAfter = typeof d.balanceAfter === 'number' ? d.balanceAfter : 0;
      rows.push({
        id: docSnap.id,
        delta,
        balanceAfter,
        reason: String(d.reason ?? 'other'),
        description: d.description ? String(d.description) : undefined,
        atLabel: formatAt(d.createdAt),
        kind: delta >= 0 ? 'earn' : 'spend',
      });
    });
    return rows;
  } catch {
    return [];
  }
}
