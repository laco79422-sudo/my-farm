import { NavLink } from 'react-router-dom';
import './MobileBottomNav.css';

const TABS = [
  { to: '/my-farm', label: '내 농장', icon: '🌾' },
  { to: '/farmers', label: '농부들', icon: '👥' },
  { to: '/shop', label: '상점', icon: '🏪' },
  { to: '/account', label: '내 정보', icon: '👤' },
] as const;

type Props = {
  visible: boolean;
};

/** 모바일 전용 하단 탭 — 데스크톱에서는 숨김 */
export function MobileBottomNav({ visible }: Props) {
  if (!visible) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="주요 메뉴">
      {TABS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            'mobile-bottom-nav__tab' + (isActive ? ' mobile-bottom-nav__tab--active' : '')
          }
        >
          <span className="mobile-bottom-nav__icon" aria-hidden>
            {icon}
          </span>
          <span className="mobile-bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
