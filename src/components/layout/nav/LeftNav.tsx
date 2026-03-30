import { NavLink } from 'react-router-dom';
import './leftNavExtras.css';

/** 데스크톱 상단 — 로고 + 3링크 (포인트는 우측 클러스터) */
export const MAIN_NAV_LINKS = [
  { to: '/my-farm', label: '내 농장' },
  { to: '/farmers', label: '농부들' },
  { to: '/shop', label: '상점' },
] as const;

type Props = {
  onNavigate?: () => void;
};

export function LeftNav({ onNavigate }: Props) {
  return (
    <div className="nav__left-cluster">
      <NavLink to="/" className="nav__brand" onClick={onNavigate}>
        <span className="nav__brand-mark" aria-hidden>
          🌱
        </span>
        <span>나만의 농장</span>
      </NavLink>

      <nav className="nav__links" aria-label="이동 메뉴">
        {MAIN_NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 'nav__link' + (isActive ? ' nav__link--active' : '')}
            onClick={onNavigate}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
