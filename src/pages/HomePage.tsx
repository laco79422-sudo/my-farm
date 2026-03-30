import { Link, useNavigate } from 'react-router-dom';
import { prefersCameraCapture } from '../utils/device';
import './HomePage.css';

export function HomePage() {
  const navigate = useNavigate();
  const useCam = prefersCameraCapture();

  return (
    <div className="home-wrap home-wrap--flow page-home">
      <div className="home-inner home-inner--flow">
        <p className="muted home-flow__tagline" style={{ margin: '0 0 1rem', textAlign: 'center', fontSize: '0.92rem' }}>
          사진 한 장으로 시작하는 재배·판매·구매 흐름
        </p>

        <section className="home-flow-hero" aria-labelledby="home-flow-title">
          <h1 id="home-flow-title" className="home-flow-hero__title">
            식물 사진 촬영
          </h1>
          <p className="home-flow-hero__desc muted">
            병충해·영양 상태를 확인하고, 내 농장에 저장한 뒤 재배·수확·판매로 이어집니다.
          </p>
          <button
            type="button"
            className="home-flow-hero__camera-btn"
            onClick={() => navigate(`/diagnosis?source=${useCam ? 'camera' : 'album'}`)}
          >
            <span className="home-flow-hero__camera-icon" aria-hidden>
              📸
            </span>
            사진 찍고 식물 진단하기
          </button>
          <button
            type="button"
            className="home-flow-hero__secondary"
            onClick={() => navigate('/diagnosis?source=album')}
          >
            앨범에서 선택
          </button>
        </section>

        <footer className="home-flow-foot">
          <h2 className="home-flow-foot__h">이용 방법</h2>
          <ol className="home-flow-foot__steps">
            <li>홈에서 사진으로 진단</li>
            <li>결과 확인 후 내 농장에 저장</li>
            <li>내 농장에서 재배 · 일지 · 수확</li>
            <li>수확 시 판매 글 자동 등록 → 농부들에서 노출</li>
            <li>상점에서 씨앗·자재 구매</li>
          </ol>
          <p className="muted home-flow-foot__hint">
            메뉴는 <strong>내 농장 · 농부들 · 상점 · 포인트</strong>만 유지했습니다. 병충해·영양·도감은{' '}
            <strong>진단 결과 화면</strong>에서 안내합니다.
          </p>
          <p className="home-flow-foot__partner muted">
            <Link to="/partner-center" className="home-flow-foot__partner-link">
              파트너 센터
            </Link>
            <span className="home-flow-foot__partner-desc">
              {' '}
              — 씨앗·자재·농약·장비 등 <strong>입점·공급·광고</strong> 문의
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}
