type Props = {
  label: string;
  hint?: string;
};

export function CurrentRank({ label, hint }: Props) {
  return (
    <section className="farmer-rank-card fr-current" aria-labelledby="fr-current-heading">
      <h2 id="fr-current-heading" className="farmer-rank-card__title">
        현재 등급
      </h2>
      <p className="fr-current__label">{label}</p>
      {hint ? (
        <p className="fr-current__hint muted">{hint}</p>
      ) : null}
    </section>
  );
}
