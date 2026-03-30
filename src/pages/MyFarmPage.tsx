import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFarmStore } from '../stores/useFarmStore';
import { useFarmHubStore } from '../stores/useFarmHubStore';
import { MyFarmDiagnosisEntry } from '../components/myFarm/MyFarmDiagnosisEntry';
import { FarmSummary } from '../components/myFarm/FarmSummary';
import { ShopEntry } from '../components/myFarm/ShopEntry';
import { GrowStart } from '../components/myFarm/GrowStart';
import { PlantListSection } from '../components/myFarm/PlantListSection';
import { DailyLogSection } from '../components/myFarm/DailyLogSection';
import { TimelineSection } from '../components/myFarm/TimelineSection';
import { HarvestSection } from '../components/myFarm/HarvestSection';
import { MyShopSection } from '../components/myFarm/MyShopSection';
import { SalesHistorySection } from '../components/myFarm/SalesHistorySection';
import { FarmInfoSection } from '../components/myFarm/FarmInfoSection';
import { FarmRecordCard } from '../components/farm/FarmRecordCard';
import { RecommendedProducts } from '../components/shop/RecommendedProducts';
import { EmptyFarmState } from '../components/farm/EmptyFarmState';
import { LoginPromptCard } from '../components/auth/LoginPromptCard';
import '../components/myFarm/myFarm.css';

export function MyFarmPage() {
  const { sessionUid, isLoggedIn, isInitialized } = useAuth();
  const savedRecords = useFarmStore((s) => s.savedRecords);
  const loadForUser = useFarmStore((s) => s.loadForUser);

  const hydrate = useFarmHubStore((s) => s.hydrate);
  const clearLocal = useFarmHubStore((s) => s.clearLocal);
  const profile = useFarmHubStore((s) => s.profile);
  const plants = useFarmHubStore((s) => s.plants);
  const logs = useFarmHubStore((s) => s.logs);
  const sales = useFarmHubStore((s) => s.sales);
  const listingsTick = useFarmHubStore((s) => s.listingsTick);

  useEffect(() => {
    loadForUser(sessionUid ?? '');
  }, [sessionUid, loadForUser]);

  useEffect(() => {
    if (sessionUid) hydrate(sessionUid);
    else clearLocal();
  }, [sessionUid, hydrate, clearLocal]);

  return (
    <div className="page-shell">
      <h1 className="section-title">내 농장</h1>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        사진 진단 → 저장 → 재배 → 일지 → 수확(판매 자동 등록) → 농부들·상점 순으로 이어집니다.
      </p>

      <MyFarmDiagnosisEntry />

      <div className="my-farm-anchor-nav" aria-label="섹션 이동">
        <a href="#farm-flow-diagnosis">진단</a>
        <a href="#farm-summary">요약</a>
        <a href="#farm-grow">재배</a>
        <a href="#farm-harvest">수확</a>
        <a href="#farm-myshop">상점</a>
        <a href="#farm-info">정보</a>
        <a href="#farm-records">기록</a>
      </div>

      {!isInitialized ? (
        <p className="muted" style={{ marginTop: '1rem' }}>
          세션 확인 중…
        </p>
      ) : !isLoggedIn ? (
        <LoginPromptCard title="로그인 후 재배·판매 흐름을 이용할 수 있습니다">
          <p style={{ margin: 0 }}>비회원은 진단만 저장·열람이 제한될 수 있습니다.</p>
        </LoginPromptCard>
      ) : (
        <div className="my-farm-flow">
          <FarmSummary profile={profile} plants={plants} logs={logs} />
          <ShopEntry />
          <GrowStart />
          <PlantListSection plants={plants} logs={logs} />
          <DailyLogSection plants={plants} logs={logs} />
          <TimelineSection plants={plants} logs={logs} />
          <HarvestSection plants={plants} />
          <MyShopSection profile={profile} plants={plants} listingsTick={listingsTick} />
          <SalesHistorySection ownerUid={sessionUid} sales={sales} listingsTick={listingsTick} />
          <FarmInfoSection profile={profile} />
        </div>
      )}

      <section className="my-farm-section" id="farm-records" style={{ marginTop: '1.5rem' }}>
        <h2 className="my-farm-section__title">저장한 진단 기록</h2>
        <p className="muted my-farm-section__lead">
          위 <strong>사진 진단</strong>에서 새로 분석한 뒤 저장한 기록입니다.
        </p>
        {!isLoggedIn ? null : savedRecords.length === 0 ? (
          <EmptyFarmState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {savedRecords.map((r) => (
              <div key={r.id}>
                <FarmRecordCard record={r} />
                <div style={{ marginTop: 8 }}>
                  <RecommendedProducts
                    status={r.status}
                    plantName={r.plantName}
                    variant="farm"
                    maxItems={2}
                    sectionTitle="이 작물에 필요한 추천"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
