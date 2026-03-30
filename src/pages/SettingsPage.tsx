import { Link } from 'react-router-dom';

export function SettingsPage() {
  return (
    <div className="page-shell" style={{ maxWidth: '36rem' }}>
      <h1 className="section-title">설정</h1>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        알림, 테마, 계정·기기 연동 등은 추후 이 화면에서 다룰 예정입니다.
      </p>
      <p className="muted" style={{ marginTop: '1.25rem', fontSize: '0.88rem', lineHeight: 1.55 }}>
        <Link to="/partner-center">파트너 센터</Link>
        <span> — 비즈니스 입점·공급·광고 문의</span>
      </p>
    </div>
  );
}
