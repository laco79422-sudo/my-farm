/**
 * 카카오톡 인앱 브라우저: 쿠키/스토리지 제한으로 Firebase 로그인 세션이 유지되지 않는 경우가 많아
 * 본 화면을 띄우고 외부 브라우저 이용을 안내합니다.
 * (document.body.innerHTML 치환은 React 루트를 파괴하므로 별도 트리로 렌더링합니다.)
 */
export function isKakaoInAppBrowser(): boolean {
  return /KAKAOTALK/i.test(navigator.userAgent);
}

export function KakaoInAppBlock() {
  const href = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        textAlign: 'center',
        background: '#0c1524',
        color: '#e8eefc',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.25rem' }}>⚠️ 카카오톡에서는 로그인이 유지되지 않습니다</h2>
        <p style={{ margin: '0 0 1.25rem', color: 'rgba(232, 238, 252, 0.85)', fontSize: '0.95rem' }}>
          아래 버튼을 눌러 크롬에서 이용해주세요
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '12px 20px',
            background: '#4CAF50',
            color: 'white',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          👉 크롬으로 열기
        </a>
      </div>
    </div>
  );
}
