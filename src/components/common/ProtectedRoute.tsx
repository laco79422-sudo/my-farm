import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isFirebaseConfigured } from '../../firebase';

interface Props {
  children: React.ReactNode;
}

/** 로그인 필요 페이지 래퍼 — Firebase 미설정 시에는 MVP UI 확인을 위해 통과 */
export function ProtectedRoute({ children }: Props) {
  const { isLoggedIn, isInitialized } = useAuth();
  const location = useLocation();

  if (!isFirebaseConfigured()) {
    return <>{children}</>;
  }

  if (!isInitialized) {
    return (
      <div className="page-shell">
        <p className="muted">세션 확인 중…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
