type Props = {
  title: string;
  subtitle: string;
  reached: boolean;
};

export function LocalFoodGoal({ title, subtitle, reached }: Props) {
  return (
    <section
      className={'farmer-rank-card fr-goal' + (reached ? ' fr-goal--ok' : '')}
      aria-labelledby="fr-goal-heading"
    >
      <h2 id="fr-goal-heading" className="farmer-rank-card__title">
        로컬 목표
      </h2>
      <p className="fr-goal__title">{title}</p>
      <p className="fr-goal__sub muted">{subtitle}</p>
    </section>
  );
}
