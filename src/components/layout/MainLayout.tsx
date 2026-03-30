import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';
import { CameraEntryButton } from '../plant/CameraEntryButton';
import { isFirebaseConfigured } from '../../firebase';
import '../../styles/layout.css';

export function MainLayout() {
  const showBanner = !isFirebaseConfigured();
  const { pathname } = useLocation();
  const showPlantFab = pathname !== '/login' && pathname !== '/signup';
  const hideMobileTabs = pathname === '/login' || pathname === '/signup';
  const showMobileTabs = !hideMobileTabs;

  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 1023px)').matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setIsMobileViewport(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const hideFloatingCameraOnHomeMobile = pathname === '/' && isMobileViewport;

  return (
    <div className={'app-layout' + (showMobileTabs ? ' app-layout--mobile-tabs' : '')}>
      <Navbar />
      {showBanner && (
        <div className="firebase-banner" role="status">
          Firebase 환경변수가 없습니다. 로그인·저장 기능을 쓰려면 .env에 VITE_FIREBASE_* 값을
          설정하세요. (로컬 UI는 그대로 확인 가능합니다)
        </div>
      )}
      <main className="app-main">
        <Outlet />
      </main>
      <MobileBottomNav visible={showMobileTabs} />
      {showPlantFab && !hideFloatingCameraOnHomeMobile ? (
        <CameraEntryButton variant="floating" />
      ) : null}
    </div>
  );
}
