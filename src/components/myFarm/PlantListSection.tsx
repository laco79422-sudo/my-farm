import type { DailyLogEntry, GrowPlant } from '../../types/farmHub';
import './myFarm.css';

function daysSince(iso: string): number {
  const a = new Date(iso.slice(0, 10)).getTime();
  const b = new Date().setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((b - a) / 86400000));
}

type Props = {
  plants: GrowPlant[];
  logs: DailyLogEntry[];
};

export function PlantListSection({ plants, logs }: Props) {
  return (
    <section className="my-farm-section" id="farm-plants">
      <h2 className="my-farm-section__title">PlantList · 내 작물</h2>
      {plants.length === 0 ? (
        <p className="muted my-farm-section__lead" style={{ margin: 0 }}>
          아직 작물이 없습니다. 재배 시작으로 추가하세요.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {plants.map((p) => {
            const last = logs
              .filter((l) => l.plantId === p.id)
              .sort((a, b) => b.date.localeCompare(a.date))[0];
            return (
              <li
                key={p.id}
                className="card"
                style={{ padding: '0.75rem', border: '1px solid var(--color-border)' }}
              >
                <strong>{p.name}</strong>
                <span className="chip" style={{ marginLeft: 8, fontSize: '0.7rem' }}>
                  {p.status === 'harvested'
                    ? '수확 완료'
                    : p.status === 'harvest_ready'
                      ? '수확 준비'
                      : '재배 중'}
                </span>
                <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.8rem' }}>
                  재배 {daysSince(p.startedAt)}일차 · 최근 기록:{' '}
                  {last ? last.date : '없음'}
                  {p.expectedYieldMinG != null && p.expectedYieldMaxG != null ? (
                    <>
                      {' '}
                      · 예상 수확량 {p.expectedYieldMinG}~{p.expectedYieldMaxG}g
                    </>
                  ) : null}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
