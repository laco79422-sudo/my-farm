import type { MetricProgress } from '../../utils/farmerRankProgress';

type Props = {
  metrics: MetricProgress[];
  emptyMessage?: string;
};

function formatValue(m: MetricProgress, value: number): string {
  if (m.unit === 'percent') {
    return `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;
  }
  return String(Math.round(value));
}

export function ProgressStatus({ metrics, emptyMessage }: Props) {
  if (metrics.length === 0) {
    return (
      <section className="farmer-rank-card" aria-labelledby="fr-prog-heading">
        <h2 id="fr-prog-heading" className="farmer-rank-card__title">
          진행 현황
        </h2>
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
          {emptyMessage ?? '표시할 진행 지표가 없습니다.'}
        </p>
      </section>
    );
  }

  return (
    <section className="farmer-rank-card" aria-labelledby="fr-prog-heading">
      <h2 id="fr-prog-heading" className="farmer-rank-card__title">
        진행 현황
      </h2>
      {metrics.map((m) => (
        <div key={m.id} className="fr-metric">
          <div className="fr-metric__row">
            <span className="fr-metric__label">{m.label}</span>
            <span className="fr-metric__nums">
              {formatValue(m, m.current)} / {formatValue(m, m.target)}
            </span>
          </div>
          <div className="fr-metric__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(m.ratio * 100)}>
            <div className="fr-metric__fill" style={{ width: `${Math.round(m.ratio * 100)}%` }} />
          </div>
        </div>
      ))}
    </section>
  );
}
