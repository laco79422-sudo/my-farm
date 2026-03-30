import { Link } from 'react-router-dom';
import './HomeDiagnosisCta.css';

/** 홈 — AI 식물 진단 바로가기 */
export function HomeDiagnosisCta() {
  return (
    <section className="diag-cta" aria-label="AI 식물 진단 바로가기">
      <div className="diag-cta__content">
        <div className="diag-cta__badge">핵심 기능</div>
        <h2 className="diag-cta__title">AI 식물·병해충 진단</h2>
        <p className="diag-cta__desc">
          잎 사진만 올리면 작물 이름과 병해충 후보, 관리 가이드를 카드로 확인합니다. (MVP는 더미 결과 · 구조는 API
          연결 준비됨)
        </p>
        <div className="diag-cta__actions">
          <Link to="/diagnosis" className="btn btn--primary diag-cta__btn-main">
            지금 진단하기
          </Link>
          <a href="#features" className="btn btn--ghost">
            다른 기능 보기
          </a>
        </div>
      </div>
      <div className="diag-cta__visual" aria-hidden>
        <span className="diag-cta__emoji">🌿</span>
        <span className="diag-cta__emoji diag-cta__emoji--2">🔬</span>
      </div>
    </section>
  );
}
