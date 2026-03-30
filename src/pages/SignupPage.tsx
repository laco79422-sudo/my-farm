import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpWithEmail } from '../services/authService';
import { isFirebaseConfigured } from '../firebase';

export function SignupPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!isFirebaseConfigured()) {
      setError('Firebase .env 설정이 필요합니다.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    try {
      await signUpWithEmail(email, password, nickname);
      navigate('/my-farm', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 실패');
    }
  }

  return (
    <div className="page-shell" style={{ maxWidth: 420 }}>
      <h1 className="section-title">회원가입</h1>
      <p className="muted">가입 시 1000P와 초급 농부 등급으로 시작합니다.</p>
      <form className="card" onSubmit={onSubmit} style={{ marginTop: '1.25rem' }}>
        <label className="muted" style={{ display: 'block', marginBottom: 4 }}>
          닉네임
        </label>
        <input
          required
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={inp}
          placeholder="예: 들판지기"
        />
        <label className="muted" style={{ display: 'block', marginTop: 12, marginBottom: 4 }}>
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
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inp}
        />
        {error && (
          <p style={{ color: '#fca5a5', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>
        )}
        <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: '1rem' }}>
          가입하기
        </button>
      </form>
      <p className="muted" style={{ marginTop: '1rem' }}>
        이미 계정이 있나요? <Link to="/login">로그인</Link>
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
