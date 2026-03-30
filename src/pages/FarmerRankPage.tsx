import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFarmHubStore } from '../stores/useFarmHubStore';
import {
  getLocalFoodVendorFromStorage,
  useLocalFoodVendorStore,
} from '../stores/useLocalFoodVendorStore';
import { computeFarmerRankDashboard } from '../utils/farmerRankProgress';
import { CurrentRank } from '../components/farmerRank/CurrentRank';
import { RankProgressBar } from '../components/farmerRank/RankProgressBar';
import { ProgressStatus } from '../components/farmerRank/ProgressStatus';
import { NextRank } from '../components/farmerRank/NextRank';
import { RankBenefits } from '../components/farmerRank/RankBenefits';
import { LocalFoodGoal } from '../components/farmerRank/LocalFoodGoal';
import '../components/farmerRank/farmerRank.css';

export function FarmerRankPage() {
  const navigate = useNavigate();
  const { sessionUid, isLoggedIn, isInitialized } = useAuth();
  const hydrate = useFarmHubStore((s) => s.hydrate);
  const plants = useFarmHubStore((s) => s.plants);
  const logs = useFarmHubStore((s) => s.logs);
  const profile = useFarmHubStore((s) => s.profile);
  const sales = useFarmHubStore((s) => s.sales);
  const vendorTick = useLocalFoodVendorStore((s) => s.tick);

  useEffect(() => {
    if (sessionUid) hydrate(sessionUid);
  }, [sessionUid, hydrate]);

  const isLocalVendor = Boolean(sessionUid && getLocalFoodVendorFromStorage(sessionUid));

  const dashboard = useMemo(
    () =>
      computeFarmerRankDashboard({
        plants,
        logs,
        profile,
        sales,
        isLocalVendor,
      }),
    [plants, logs, profile, sales, isLocalVendor, vendorTick],
  );

  if (!isInitialized) {
    return (
      <div className="page-shell farmer-rank-page">
        <p className="muted">불러오는 중…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="page-shell farmer-rank-page">
        <div className="farmer-rank-card">
          <p className="muted" style={{ margin: 0 }}>
            등급·진행 정보를 보려면 로그인해 주세요.
          </p>
          <button type="button" className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/login')}>
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell farmer-rank-page">
      <div className="farmer-rank-page__back">
        <Link to="/my-farm" className="muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          ← 내 농장으로
        </Link>
      </div>
      <h1 className="section-title" style={{ marginBottom: '0.35rem' }}>
        농부 등급 시스템
      </h1>
      <p className="muted" style={{ fontSize: '0.88rem', lineHeight: 1.55, marginBottom: '1rem' }}>
        재배·일지·수확·판매 데이터를 바탕으로 현재 단계와 다음 목표를 안내합니다.
      </p>

      <CurrentRank
        label={dashboard.currentFullLabel}
        hint="아래 진행률은 ‘다음 등급’ 달성을 위해 채워야 하는 항목입니다."
      />
      <RankProgressBar steps={dashboard.stepBar} />
      <ProgressStatus
        metrics={dashboard.progressMetrics}
        emptyMessage="최고 단계입니다. 새로운 목표는 추후 업데이트됩니다."
      />
      <NextRank next={dashboard.nextRank} />
      <RankBenefits benefits={dashboard.nextBenefits} />
      <LocalFoodGoal
        title={dashboard.localFoodGoal.title}
        subtitle={dashboard.localFoodGoal.subtitle}
        reached={dashboard.localFoodGoal.reached}
      />
    </div>
  );
}
