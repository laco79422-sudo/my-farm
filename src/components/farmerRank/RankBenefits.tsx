type Props = {
  benefits: string[];
};

export function RankBenefits({ benefits }: Props) {
  if (benefits.length === 0) {
    return null;
  }
  return (
    <section className="farmer-rank-card" aria-labelledby="fr-ben-heading">
      <h2 id="fr-ben-heading" className="farmer-rank-card__title">
        등급 혜택
      </h2>
      <p className="muted" style={{ fontSize: '0.78rem', margin: '0 0 0.5rem', lineHeight: 1.45 }}>
        다음 등급으로 올라가면 기대할 수 있는 혜택입니다.
      </p>
      <ul className="fr-benefits__list">
        {benefits.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </section>
  );
}
