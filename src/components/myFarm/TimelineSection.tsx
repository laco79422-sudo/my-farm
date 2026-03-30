import { useMemo } from 'react';
import type { DailyLogEntry, GrowPlant } from '../../types/farmHub';
import { buildTimeline } from '../../utils/farmHubTimeline';
import './myFarm.css';

type Props = {
  plants: GrowPlant[];
  logs: DailyLogEntry[];
};

export function TimelineSection({ plants, logs }: Props) {
  const entries = useMemo(() => buildTimeline(plants, logs), [plants, logs]);

  return (
    <section className="my-farm-section" id="farm-timeline">
      <h2 className="my-farm-section__title">Timeline · 타임라인</h2>
      <p className="muted my-farm-section__lead">날짜별 자동 기록과 생산일지가 합쳐집니다.</p>
      {entries.length === 0 ? (
        <p className="muted">기록이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {entries.slice(0, 40).map((t) => (
            <li
              key={t.id}
              style={{
                borderLeft: '2px solid rgba(124,240,210,0.35)',
                padding: '0.5rem 0 0.5rem 0.75rem',
                marginBottom: 6,
              }}
            >
              <span className="muted" style={{ fontSize: '0.72rem' }}>
                {t.date}
              </span>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.title}</div>
              {t.detail ? (
                <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.78rem' }}>
                  {t.detail}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
