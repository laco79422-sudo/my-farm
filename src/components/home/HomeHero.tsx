import { Link } from 'react-router-dom';

export function HomeHero() {
  return (
    <section className="card" style={{ overflow: 'hidden', padding: 0 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 0,
        }}
      >
        <div style={{ padding: '2rem clamp(1rem, 4vw, 1.75rem)' }}>
          <p className="chip" style={{ marginBottom: '0.75rem' }}>
            식물 진단 · 생산일지 · 포인트 농장
          </p>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              lineHeight: 1.2,
              margin: '0 0 0.75rem',
              letterSpacing: '-0.03em',
            }}
          >
            사진 한 장으로 시작하는
            <br />
            <span style={{ color: 'var(--color-mint)' }}>나만의 농장</span>
          </h1>
          <p className="muted" style={{ maxWidth: 520, marginBottom: '1.5rem' }}>
            업로드만 하면 식물 이름과 병충해 후보를 확인하고, 일지와 포인트로 성장을 기록하세요.
            모바일·PC 모두 최적화된 반응형 UI입니다.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            <Link to="/my-farm" className="btn btn--primary">
              농장 시작하기
            </Link>
            <Link to="/diagnosis" className="btn btn--lime">
              AI 진단 바로가기
            </Link>
            <a href="#how" className="btn btn--ghost">
              이용방법 보기
            </a>
          </div>
        </div>
        <div
          style={{
            minHeight: 200,
            background:
              'linear-gradient(135deg, rgba(94,234,212,0.18), rgba(190,242,100,0.1)), url(https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden
        />
      </div>
    </section>
  );
}
