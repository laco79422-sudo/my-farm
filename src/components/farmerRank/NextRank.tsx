import type { NextRankInfo } from '../../utils/farmerRankProgress';

type Props = {
  next: NextRankInfo | null;
};

export function NextRank({ next }: Props) {
  if (!next) {
    return (
      <section className="farmer-rank-card" aria-labelledby="fr-next-heading">
        <h2 id="fr-next-heading" className="farmer-rank-card__title">
          다음 등급
        </h2>
        <p className="muted" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
          축하합니다 — 현재 최고 단계(유통 농부)에 도달했습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="farmer-rank-card" aria-labelledby="fr-next-heading">
      <h2 id="fr-next-heading" className="farmer-rank-card__title">
        다음 등급
      </h2>
      <p className="fr-next__name">{next.fullLabel}</p>
      <p className="muted" style={{ fontSize: '0.78rem', margin: '0 0 0.5rem' }}>
        다음 단계 조건
      </p>
      <ul className="fr-next__list">
        {next.conditionLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
