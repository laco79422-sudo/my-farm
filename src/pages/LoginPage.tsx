import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmail, signInWithGoogle } from '../services/authService';
import { signInWithGoogleMock } from '../services/mockAuthSession';
import { isFirebaseConfigured } from '../firebase';
import { SocialLoginButtons } from '../components/auth/SocialLoginButtons';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ??
    sessionStorage.getItem('myfarm_login_return') ??
    '/my-farm';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onGoogle() {
    setError('');
    setGoogleLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        signInWithGoogleMock();
        sessionStorage.removeItem('myfarm_login_return');
        navigate(from, { replace: true });
        return;
      }
      await signInWithGoogle();
      sessionStorage.removeItem('myfarm_login_return');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google 로그인 실패');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!isFirebaseConfigured()) {
      setError('데모 모드에서는 Google 로그인(데모)을 사용해 주세요.');
      return;
    }
    try {
      await signInWithEmail(email, password);
      sessionStorage.removeItem('myfarm_login_return');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 실패');
    }
  }

  return (
    <div className="page-shell" style={{ maxWidth: 420 }}>
      <h1 className="section-title">로그인</h1>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        로그인하면 진단 결과를 내 농장에 저장하고 기록을 관리할 수 있습니다.
      </p>

      <div className="card" style={{ marginTop: '1.25rem', padding: '1rem' }}>
        <SocialLoginButtons onGoogle={() => void onGoogle()} googleLoading={googleLoading} />
        {!isFirebaseConfigured() ? (
          <p className="muted" style={{ marginTop: '0.75rem', fontSize: '0.78rem', marginBottom: 0 }}>
            Firebase 미설정: Google 버튼은 로컬 데모 로그인으로 동작합니다.
          </p>
        ) : null}
      </div>

      {error ? (
        <p style={{ color: '#fca5a5', marginTop: '0.75rem', fontSize: '0.9rem', textAlign: 'center' }}>
          {error}
        </p>
      ) : null}

      {isFirebaseConfigured() ? (
        <>
          <p className="muted" style={{ textAlign: 'center', margin: '0.75rem 0' }}>
            또는 이메일로 로그인
          </p>

          <form className="card" onSubmit={onSubmit} style={{ marginTop: 0 }}>
            <label className="muted" style={{ display: 'block', marginBottom: 4 }}>
              이메일
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inp}
            />
            <label className="muted" style={{ display: 'block', marginTop: 12, marginBottom: 4 }}>
              비밀번호
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inp}
            />
            <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: '1rem' }}>
              로그인
            </button>
          </form>
        </>
      ) : null}

      <p className="muted" style={{ marginTop: '1rem' }}>
        계정이 없나요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  );
}

const inp: CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-elevated)',
  color: 'var(--color-text)',
  minHeight: 44,
};
