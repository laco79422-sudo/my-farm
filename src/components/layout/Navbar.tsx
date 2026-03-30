import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCartStore } from '../../stores/useCartStore';
import { useFarmHubStore } from '../../stores/useFarmHubStore';
import {
  getLocalFoodVendorFromStorage,
  useLocalFoodVendorStore,
} from '../../stores/useLocalFoodVendorStore';
import { signOutUser } from '../../services/authService';
import { getAuthDisplayName } from '../../utils/authDisplay';
import { computeFarmerRankDashboard, RANK_STEPS } from '../../utils/farmerRankProgress';
import { isFirebaseConfigured } from '../../firebase';
import { LeftNav } from './nav/LeftNav';
import { RightActions } from './nav/RightActions';
import './Navbar.css';
import './nav/navActions.css';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, isLoggedIn, isInitialized, user, mockUser, pointsLabel, sessionUid } = useAuth();
  const navigate = useNavigate();
  const lines = useCartStore((s) => s.lines);
  const cartCount = lines.reduce((a, l) => a + l.qty, 0);

  const hydrateHub = useFarmHubStore((s) => s.hydrate);
  const hubPlants = useFarmHubStore((s) => s.plants);
  const hubLogs = useFarmHubStore((s) => s.logs);
  const hubProfile = useFarmHubStore((s) => s.profile);
  const hubSales = useFarmHubStore((s) => s.sales);
  const vendorTick = useLocalFoodVendorStore((s) => s.tick);

  useEffect(() => {
    if (sessionUid) hydrateHub(sessionUid);
  }, [sessionUid, hydrateHub]);

  const navRankLabel = useMemo(() => {
    if (!isLoggedIn || !sessionUid) return profile?.grade ?? '초급 농부';
    const isV = Boolean(getLocalFoodVendorFromStorage(sessionUid));
    const d = computeFarmerRankDashboard({
      plants: hubPlants,
      logs: hubLogs,
      profile: hubProfile,
      sales: hubSales,
      isLocalVendor: isV,
    });
    return RANK_STEPS[d.currentIndex].fullLabel;
  }, [isLoggedIn, sessionUid, profile?.grade, hubPlants, hubLogs, hubProfile, hubSales, vendorTick]);

  const grade = navRankLabel;
  const displayName = getAuthDisplayName(profile, user, mockUser);

  async function handleLogout() {
    try {
      if (isFirebaseConfigured()) await signOutUser();
    } catch {
      /* */
    }
    navigate('/');
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  function go(path: string) {
    navigate(path);
    closeMobile();
  }

  return (
    <header className="nav">
      <div className="nav__inner">
        <div className="nav__travel">
          <LeftNav onNavigate={closeMobile} />
        </div>

        <div className="nav__right-cluster">
          <div className="nav-desktop-status">
            <RightActions
              pointsLabel={pointsLabel}
              grade={grade}
              cartCount={cartCount}
              isInitialized={isInitialized}
              isLoggedIn={isLoggedIn}
              displayName={displayName}
              onLogout={handleLogout}
              onPointsClick={() => {
                navigate(isLoggedIn ? '/points' : '/login');
              }}
              onRankClick={() => {
                navigate(isLoggedIn ? '/farmer-rank' : '/login');
              }}
              onCartClick={() => {
                navigate('/cart');
              }}
              onNavigate={closeMobile}
            />
          </div>
          <button
            type="button"
            className="nav__menu-toggle"
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <div
        className={'nav__mobile' + (mobileOpen ? ' nav__mobile--open' : '')}
        id="mobile-nav"
        role="dialog"
        aria-label="모바일 상태·프로필 메뉴"
        aria-modal="true"
      >
        <p className="nav-drawer__section-title">상태</p>
        <button
          type="button"
          className="nav-drawer__row"
          disabled={!isInitialized}
          onClick={() => go(isLoggedIn ? '/points' : '/login')}
        >
          <span className="nav-drawer__row-icon" aria-hidden>
            ✦
          </span>
          <span className="nav-drawer__row-label">포인트</span>
          <span className="nav-drawer__row-value">{pointsLabel}</span>
        </button>
        <button
          type="button"
          className="nav-drawer__row"
          onClick={() => go(isLoggedIn ? '/farmer-rank' : '/login')}
        >
          <span className="nav-drawer__row-icon" aria-hidden>
            ⭐
          </span>
          <span className="nav-drawer__row-label">농부 등급</span>
          <span className="nav-drawer__row-value nav-drawer__row-value--mint">{grade}</span>
        </button>
        <button type="button" className="nav-drawer__row" onClick={() => go('/cart')}>
          <span className="nav-drawer__row-icon" aria-hidden>
            🛒
          </span>
          <span className="nav-drawer__row-label">장바구니</span>
          <span className="nav-drawer__row-value">
            {cartCount > 0 ? `${cartCount}개` : '비어 있음'}
          </span>
        </button>

        <p className="nav-drawer__section-title nav-drawer__section-title--spaced">프로필</p>
        {isInitialized && isLoggedIn ? (
          <>
            <p className="nav-drawer__name">{displayName.trim() || '사용자'}</p>
            <button type="button" className="nav-drawer__link" onClick={() => go('/account')}>
              내 정보
            </button>
            <button type="button" className="nav-drawer__link" onClick={() => go('/settings')}>
              설정
            </button>
            <button
              type="button"
              className="nav-drawer__link nav-drawer__link--danger"
              onClick={() => {
                void handleLogout();
                closeMobile();
              }}
            >
              로그아웃
            </button>
          </>
        ) : isInitialized ? (
          <>
            <NavLink to="/login" className="nav-drawer__link nav-drawer__link--block" onClick={closeMobile}>
              로그인
            </NavLink>
            <NavLink to="/signup" className="nav-drawer__link nav-drawer__link--block" onClick={closeMobile}>
              회원가입
            </NavLink>
          </>
        ) : (
          <p className="muted nav-drawer__hint">세션 확인 중…</p>
        )}

        <div className="nav-drawer__extra">
          <NavLink to="/farmers?tab=community" className="nav-drawer__extra-link" onClick={closeMobile}>
            커뮤니티
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export { Navbar as Header };
