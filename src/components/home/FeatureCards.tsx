import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: 'AI 식물 진단',
    desc: '이미지 기반 이름·병해충 후보와 관리 가이드',
    to: '/diagnosis',
    icon: '🤖',
  },
  { title: '내 농장', desc: '작물 카드·수확 예정·빈 상태 UX', to: '/my-farm', icon: '🏡' },
  { title: '생산일지', desc: '날짜별 썸네일·타임라인·포인트', to: '/my-farm', icon: '📔' },
  { title: '상점', desc: '포인트로 씨앗·도구·배양액 구매', to: '/shop', icon: '🛒' },
  {
    title: '상품 의뢰',
    desc: '필요 물품 요청·보상·진행자',
    to: '/shop?view=request',
    icon: '📦',
  },
  {
    title: '지역·로컬푸드',
    desc: '시·구별 농부 상품과 인증 로컬푸드',
    to: '/farmers?tab=region',
    icon: '🥬',
  },
  { title: '커뮤니티', desc: '후기·질문·게시글 (농부들 탭)', to: '/farmers?tab=community', icon: '💬' },
];

export function FeatureCards() {
  return (
    <section id="features" style={{ marginTop: 'var(--space-section)' }}>
      <h2 className="section-title">주요 기능 7가지</h2>
      <div className="grid-cards cols-4">
        {FEATURES.map((f) => (
          <Link key={f.title} to={f.to} className="card" style={{ display: 'block' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{f.icon}</div>
            <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', color: 'var(--color-text)' }}>
              {f.title}
            </h3>
            <p className="muted" style={{ margin: 0 }}>
              {f.desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
