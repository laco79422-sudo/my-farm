/**
 * 포인트 증감 — users 문서 + point_logs 기록
 * MVP에서는 클라이언트에서 호출; 운영 시 Cloud Functions로 이전 권장
 */
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { PointReasonCode } from '../types';
import { getFirestoreDb, isFirebaseConfigured } from '../firebase';
import { coercePointsFromFirestore } from '../utils/userProfile';
import { addEarnHistory } from './pointLedger';

function db() {
  const d = getFirestoreDb();
  if (!d || !isFirebaseConfigured()) throw new Error('Firestore unavailable');
  return d;
}

export async function applyPointChange(params: {
  uid: string;
  delta: number;
  reason: PointReasonCode;
  description?: string;
  relatedId?: string;
  newBalance: number;
}): Promise<void> {
  const { uid, delta, reason, description, relatedId, newBalance } = params;
  await updateDoc(doc(db(), 'users', uid), { points: newBalance });
  await addDoc(collection(db(), 'point_logs'), {
    uid,
    delta,
    balanceAfter: newBalance,
    reason,
    description,
    relatedId,
    createdAt: serverTimestamp(),
  });
}

/** 규칙 상수 (UI/로직 공통) */
export const POINT_RULES = {
  signup: 1000,
  firstPlant: 200,
  dailyLog: 50,
  diagnosis: 20,
  /** 리워드 광고 시청 1회 (일 3회 제한은 별도 정책) */
  rewardAd: 100,
  communityPost: 30,
  /** 로컬푸드점 입점 개설 (자격 충족 후 1회) */
  localFoodShopOpen: 500,
  /** 상품 의뢰 접수 보상 (씨앗·용기 — 데모는 즉시 지급, Firebase는 정책 안내) */
  productRequestSeed: 200,
  productRequestVessel: 300,
  productRequestOther: 100,
} as const;

/** Firebase User·데모 세션 등 uid만 있으면 됨 */
export type PointActor = { uid: string } | null | undefined;

async function earnPointsForUser(
  uid: string,
  amount: number,
  reason: PointReasonCode,
  description: string,
): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
    throw new Error('잘못된 포인트 금액입니다.');
  }
  if (!isFirebaseConfigured()) {
    addEarnHistory(uid, description, amount);
    return;
  }
  const firestore = getFirestoreDb();
  if (!firestore) throw new Error('Firestore unavailable');
  const snap = await getDoc(doc(firestore, 'users', uid));
  const current = snap.exists()
    ? coercePointsFromFirestore(snap.data() as Record<string, unknown>)
    : 0;
  const newBalance = current + amount;
  await applyPointChange({ uid, delta: amount, reason, description, newBalance });
}

/** 유료 충전(데모: 즉시 지급, 운영 시 결제 연동 전까지 동일 API) */
export async function chargePoint(user: PointActor, amount: number): Promise<void> {
  const uid = user?.uid;
  if (!uid) throw new Error('로그인이 필요합니다.');
  await earnPointsForUser(uid, amount, 'charge', '포인트 충전');
}

/** 광고 시청 보상 — POINT_RULES.rewardAd 만큼 지급 */
export async function grantRewardAdPoints(user: PointActor): Promise<void> {
  const uid = user?.uid;
  if (!uid) throw new Error('로그인이 필요합니다.');
  await earnPointsForUser(uid, POINT_RULES.rewardAd, 'reward_ad', '광고 시청 보상');
}
