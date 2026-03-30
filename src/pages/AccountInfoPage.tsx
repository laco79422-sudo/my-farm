import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAuthDisplayName } from '../utils/authDisplay';

/** 프로필 메뉴 「내 정보」 — 농장 허브로 안내 */
export function AccountInfoPage() {
  const { user, mockUser, profile, isLoggedIn, isInitialized } = useAuth();
  const name = getAuthDisplayName(profile, user, mockUser);

  if (!isInitialized) {
    return (
      <div className="page-shell">
        <p className="muted">확인 중…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="page-shell">
        <p className="muted">로그인이 필요합니다.</p>
        <Link to="/login" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          로그인
        </Link>
        <p className="muted" style={{ marginTop: '1.5rem', fontSize: '0.85rem', lineHeight: 1.55 }}>
          <Link to="/partner-center">파트너 센터</Link>
          <span> — 비즈니스 입점·공급·광고 문의 (로그인 불필요)</span>
        </p>
      </div>
    );
  }

  return (
    <div className="page-shell" style={{ maxWidth: '36rem' }}>
      <h1 className="section-title">내 정보</h1>
      <div className="card" style={{ padding: '1rem 1.1rem' }}>
        <p style={{ margin: '0 0 0.35rem', fontWeight: 800 }}>표시 이름</p>
        <p className="muted" style={{ margin: 0 }}>
          {name.trim() || '사용자'}
        </p>
        {profile?.email ? (
          <>
            <p style={{ margin: '1rem 0 0.35rem', fontWeight: 800 }}>이메일</p>
            <p className="muted" style={{ margin: 0 }}>
              {profile.email}
            </p>
          </>
        ) : null}
      </div>
      <p className="muted" style={{ marginTop: '1rem', fontSize: '0.88rem', lineHeight: 1.55 }}>
        재배·농장 프로필·판매 정보는 <Link to="/my-farm">내 농장</Link>에서 관리합니다.
      </p>
      <div className="card" style={{ padding: '1rem 1.1rem', marginTop: '1rem' }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem' }}>파트너 센터</p>
        <p className="muted" style={{ margin: '0.35rem 0 0.75rem', fontSize: '0.82rem', lineHeight: 1.5 }}>
          업체 입점·농약·영양제·장비·광고 등 비즈니스 문의
        </p>
        <Link to="/partner-center" className="btn btn--ghost" style={{ display: 'inline-block' }}>
          파트너 센터 열기
        </Link>
      </div>
    </div>
  );
}
