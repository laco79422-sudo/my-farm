import { Fragment } from 'react';
import type { FarmerJourneyRankId } from '../../utils/farmerRankProgress';

type Step = {
  id: FarmerJourneyRankId;
  label: string;
  status: 'done' | 'current' | 'upcoming';
  isNext: boolean;
};

type Props = {
  steps: Step[];
};

export function RankProgressBar({ steps }: Props) {
  return (
    <section className="farmer-rank-card" aria-labelledby="fr-bar-heading">
      <h2 id="fr-bar-heading" className="farmer-rank-card__title">
        등급 진행
      </h2>
      <p className="muted" style={{ fontSize: '0.8rem', margin: '0 0 0.75rem', lineHeight: 1.45 }}>
        초급 → 성장 → 수확 → 로컬 → 유통 순으로 성장합니다. 강조된 칸이 현재 단계, 점선은 다음
        단계입니다.
      </p>
      <div className="fr-bar" role="list">
        <div className="fr-bar__track">
          {steps.map((s, i) => (
            <Fragment key={s.id}>
              <div
                role="listitem"
                className={
                  'fr-bar__segment' +
                  (s.status === 'done' ? ' fr-bar__segment--done' : '') +
                  (s.status === 'current' ? ' fr-bar__segment--current' : '') +
                  (s.isNext ? ' fr-bar__segment--next' : '')
                }
              >
                <span className="fr-bar__dot" aria-hidden />
                <span>{s.label}</span>
              </div>
              {i < steps.length - 1 ? (
                <span className="fr-bar__chev" aria-hidden>
                  →
                </span>
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
