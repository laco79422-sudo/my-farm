import { Link } from 'react-router-dom';

type Props = {
  title: string;
  description?: string;
};

/** /pests, /nutrient 등 2차 기능용 플레이스홀더 — TODO: 실제 콘텐츠·API 연동 */
export function FeaturePlaceholderPage({ title, description }: Props) {
  return (
    <div className="page-shell">
      <h1 className="section-title">{title}</h1>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        {description ?? '이 메뉴는 추후 상세 기능과 연결될 예정입니다. 지금은 사진 진단 흐름을 먼저 이용해 주세요.'}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
        <Link to="/diagnosis" className="btn btn--primary">
          진단하러 가기
        </Link>
        <Link to="/" className="btn btn--ghost">
          홈
        </Link>
      </div>
    </div>
  );
}
