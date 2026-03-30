import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isFirebaseConfigured } from '../firebase';
import { applyPointChange, POINT_RULES } from '../services/pointService';
import { seedGlobalMarketIfEmpty } from '../data/seedMarketListings';
import { getMarketplaceListings, useFarmHubStore } from '../stores/useFarmHubStore';
import {
  getLocalFoodVendorFromStorage,
  useLocalFoodVendorStore,
} from '../stores/useLocalFoodVendorStore';
import { useToastStore } from '../stores/useToastStore';
import type { MarketListing } from '../types/farmHub';
import { computeLocalFoodEligibility, LOCAL_FOOD_RULES } from '../utils/localFoodEligibility';
import {
  computeFarmerTier,
  farmerTierLabel,
  isLogRateDemotionRisk,
} from '../utils/localFoodTrust';
import { spendPoint } from '../services/pointLedger';
import { MarketplaceProductCard } from '../components/farmers/MarketplaceProductCard';
import '../components/farmers/farmersMarket.css';
import './localFoodPage.css';

export function LocalFoodPage() {
  const { sessionUid, isLoggedIn, resolvedPoints, profile, mockUser, user } = useAuth();
  const showToast = useToastStore((s) => s.show);
  const hydrate = useFarmHubStore((s) => s.hydrate);
  const plants = useFarmHubStore((s) => s.plants);
  const logs = useFarmHubStore((s) => s.logs);
  const farmProfile = useFarmHubStore((s) => s.profile);
  const listingsTick = useFarmHubStore((s) => s.listingsTick);
  const vendorTick = useLocalFoodVendorStore((s) => s.tick);
  const enroll = useLocalFoodVendorStore((s) => s.enroll);
  const removeVendor = useLocalFoodVendorStore((s) => s.removeVendor);
  const [busy, setBusy] = useState(false);
  const [listTick, setListTick] = useState(0);

  useEffect(() => {
    if (sessionUid) hydrate(sessionUid);
  }, [sessionUid, hydrate]);

  useEffect(() => {
    seedGlobalMarketIfEmpty();
    setListTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const bump = () => setListTick((t) => t + 1);
    window.addEventListener('focus', bump);
    return () => window.removeEventListener('focus', bump);
  }, []);

  const eligibility = useMemo(
    () => computeLocalFoodEligibility(plants, logs, farmProfile),
    [plants, logs, farmProfile],
  );

  const vendor = sessionUid ? getLocalFoodVendorFromStorage(sessionUid) : null;
  const tier = computeFarmerTier(Boolean(vendor), plants, logs);
  const demotionHint =
    vendor && isLogRateDemotionRisk(eligibility.logRate, 0.55)
      ? '기록률이 낮아지면 노출·등급에 불리할 수 있습니다.'
      : null;

  const certifiedListings = useMemo(() => {
    const raw = getMarketplaceListings();
    return raw.filter((l) => l.localFoodCertified && l.trust);
  }, [listTick, listingsTick, vendorTick]);

  const onEnroll = useCallback(async () => {
    if (!sessionUid) {
      showToast('로그인이 필요합니다.');
      return;
    }
    if (resolvedPoints === null) {
      showToast('포인트 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    if (isFirebaseConfigured() && user && !profile) {
      showToast('프로필 동기화 후 다시 시도해 주세요.');
      return;
    }
    const cost = POINT_RULES.localFoodShopOpen;
    setBusy(true);
    try {
      const r = enroll({
        uid: sessionUid,
        currentPoints: resolvedPoints,
        eligibilityMet: eligibility.allMet,
      });
      if (!r.ok) {
        showToast(r.error ?? '입점에 실패했습니다.');
        return;
      }

      const firebaseOk = isFirebaseConfigured() && Boolean(user) && Boolean(profile);
      if (firebaseOk) {
        const nextBal = resolvedPoints - cost;
        try {
          await applyPointChange({
            uid: sessionUid,
            delta: -cost,
            reason: 'local_food_enroll',
            description: '로컬푸드점 개설',
            newBalance: nextBal,
          });
        } catch {
          removeVendor(sessionUid);
          showToast('포인트 차감에 실패해 입점이 취소되었습니다.');
          return;
        }
      } else if (!isFirebaseConfigured() && mockUser) {
        const spent = spendPoint(sessionUid, '로컬푸드점 개설', cost);
        if (!spent.ok) {
          removeVendor(sessionUid);
          showToast(spent.error);
          return;
        }
      }

      showToast(`로컬푸드점 입점이 완료되었습니다. (${cost}P 사용)`);
    } finally {
      setBusy(false);
    }
  }, [
    sessionUid,
    resolvedPoints,
    enroll,
    eligibility.allMet,
    showToast,
    user,
    profile,
    mockUser,
    removeVendor,
  ]);

  return (
    <div className="page-shell local-food-page">
      <h1 className="section-title">로컬푸드점</h1>
      <p className="muted local-food-page__lead">
        검증된 농부만 입점하는 신뢰 기반 채널입니다. 조건을 충족한 뒤 포인트로 개설하면 인증 마크·지역 우선
        노출·묶음·예약·정기 판매 등 확장 기능을 쓸 수 있습니다.
      </p>

      <section className="local-food-page__panel card">
        <h2 className="local-food-page__h2">농부 단계</h2>
        <ol className="local-food-page__steps muted">
          <li className={tier === 'general' ? 'local-food-page__step--on' : ''}>
            일반 농부 — 재배·일지 시작
          </li>
          <li
            className={
              tier === 'growth' || tier === 'local_vendor' ? 'local-food-page__step--on' : ''
            }
          >
            성장 농부 — 수확·기록 누적
          </li>
          <li className={tier === 'local_vendor' ? 'local-food-page__step--on' : ''}>
            로컬푸드점 입점 농부 — 조건 충족 후 개설
          </li>
        </ol>
        <p className="muted" style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>
          현재 표시 등급: <strong>{farmerTierLabel(tier)}</strong>
        </p>
        {demotionHint ? (
          <p className="local-food-page__warn" role="status">
            {demotionHint}
          </p>
        ) : null}
      </section>

      <section className="local-food-page__panel card">
        <h2 className="local-food-page__h2">입점 조건 (모두 충족 필요)</h2>
        <ul className="local-food-page__checklist">
          {eligibility.items.map((it) => (
            <li key={it.id} className={it.met ? 'local-food-page__check--ok' : ''}>
              <span className="local-food-page__mark" aria-hidden>
                {it.met ? '✔' : '○'}
              </span>
              <span>
                {it.label}
                {it.detail ? (
                  <span className="muted" style={{ fontSize: '0.78rem', marginLeft: 6 }}>
                    ({it.detail})
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
        <p className="muted" style={{ fontSize: '0.75rem', marginTop: '0.75rem' }}>
          정책: 재배 완료 {LOCAL_FOOD_RULES.minCompletedGrows}회 이상 · 기록률{' '}
          {Math.round(LOCAL_FOOD_RULES.minLogRate * 100)}% 이상 · 수확{' '}
          {LOCAL_FOOD_RULES.minHarvestExperiences}회 이상 · 평균 생존율{' '}
          {Math.round(LOCAL_FOOD_RULES.minAvgSurvivalRate * 100)}% 이상 · 농장 프로필(시·구) 완성
        </p>

        {eligibility.allMet && !vendor ? (
          <div className="local-food-page__enroll">
            <p className="muted" style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>
              입점 가능 상태입니다. 개설 비용 <strong>{POINT_RULES.localFoodShopOpen}P</strong>
            </p>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!isLoggedIn || busy || resolvedPoints === null}
              onClick={() => void onEnroll()}
            >
              {busy ? '처리 중…' : '포인트로 로컬푸드점 개설'}
            </button>
          </div>
        ) : null}

        {vendor ? (
          <p className="local-food-page__okmsg" role="status">
            ✔ 입점 완료 — 내 농장 MyShop에서 인증 상품·확장 옵션을 사용할 수 있습니다.
          </p>
        ) : null}
      </section>

      <section className="local-food-page__panel">
        <h2 className="local-food-page__h2">인증 상품</h2>
        <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          카드에 로컬푸드 인증·등급·지역·신뢰 지표(기록률·생존율·후기·판매 성공률)가 표시됩니다.
        </p>
        <div className="grid-cards cols-3">
          {certifiedListings.map((l: MarketListing) => (
            <MarketplaceProductCard key={l.id} listing={l} />
          ))}
        </div>
        {certifiedListings.length === 0 ? (
          <p className="muted">아직 인증 상품이 없습니다. 입점 후 MyShop에서 등록해 보세요.</p>
        ) : null}
      </section>
    </div>
  );
}
