import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { DailyLogEntry, FarmProfile, GrowPlant } from '../../types/farmHub';
import './myFarm.css';

type Props = {
  profile: FarmProfile | null;
  plants: GrowPlant[];
  logs: DailyLogEntry[];
};

export function FarmSummary({ profile, plants, logs }: Props) {
  const { pointsLabel } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = useMemo(() => logs.filter((l) => l.date === today), [logs, today]);
  const todayStatus =
    todayLogs.length === 0
      ? '오늘 일지 없음'
      : todayLogs.some((l) => l.statusCheck === 'stress')
        ? '일부 작물 점검 필요'
        : '양호';

  return (
    <section className="my-farm-section" id="farm-summary">
      <h2 className="my-farm-section__title">FarmSummary · 요약</h2>
      <div className="my-farm-grid-2">
        <dl className="my-farm-stat">
          <dt>현재 작물 수</dt>
          <dd>{plants.length}종</dd>
        </dl>
        <dl className="my-farm-stat">
          <dt>총 포인트</dt>
          <dd>{pointsLabel}</dd>
        </dl>
        <dl className="my-farm-stat">
          <dt>오늘 상태</dt>
          <dd style={{ fontSize: '0.88rem' }}>{todayStatus}</dd>
        </dl>
        <dl className="my-farm-stat">
          <dt>지역</dt>
          <dd style={{ fontSize: '0.88rem' }}>
            {profile?.city && profile?.district
              ? `${profile.city} / ${profile.district}`
              : '미설정'}
          </dd>
        </dl>
      </div>
    </section>
  );
}
