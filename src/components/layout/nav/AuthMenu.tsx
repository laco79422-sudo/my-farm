import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  isInitialized: boolean;
  isLoggedIn: boolean;
  displayName: string;
  onLogout: () => void;
  onNavigate?: () => void;
};

export function AuthMenu({ isInitialized, isLoggedIn, displayName, onLogout, onNavigate }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open || !menuRef.current) return;
    const first = menuRef.current.querySelector<HTMLElement>('[role="menuitem"]');
    window.requestAnimationFrame(() => first?.focus());
  }, [open]);

  const go = useCallback(
    (path: string) => {
      navigate(path);
      close();
      onNavigate?.();
    },
    [navigate, close, onNavigate],
  );

  const handleLogoutClick = useCallback(() => {
    close();
    onLogout();
    onNavigate?.();
  }, [close, onLogout, onNavigate]);

  if (!isInitialized) {
    return (
      <button
        type="button"
        className="nav-action nav-action--auth"
        disabled
        aria-busy="true"
        aria-label="로그인 상태 확인 중"
      >
        ···
      </button>
    );
  }

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        className="nav-action nav-action--auth nav-action--auth-login"
        onClick={() => {
          navigate('/login');
          onNavigate?.();
        }}
      >
        로그인
      </button>
    );
  }

  const name = displayName.trim() || '사용자';

  return (
    <div className="nav-auth__wrap" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className="nav-action nav-action--auth"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        id={`${menuId}-trigger`}
        onClick={() => setOpen((v) => !v)}
        title={`${name} 메뉴`}
        aria-label={`${name} 계정 메뉴`}
      >
        <span className="nav-auth__trigger-mobile" aria-hidden>
          👤
        </span>
        <span className="nav-auth__trigger-desktop">{name}</span>
        <span className="nav-auth__chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          className="nav-auth__dropdown"
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
        >
          <button type="button" role="menuitem" tabIndex={0} onClick={() => go('/account')}>
            내 정보
          </button>
          <button type="button" role="menuitem" tabIndex={0} onClick={() => go('/settings')}>
            설정
          </button>
          <button type="button" role="menuitem" tabIndex={0} onClick={handleLogoutClick}>
            로그아웃
          </button>
        </div>
      ) : null}
    </div>
  );
}
