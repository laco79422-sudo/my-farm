import { useNavigate } from 'react-router-dom';
import { prefersCameraCapture } from '../../utils/device';
import '../plant/plantComponents.css';
import '../../pages/HomePage.css';

export function HeroDiagnosis() {
  const navigate = useNavigate();
  const useCam = prefersCameraCapture();

  return (
    <section className="home-diagnosis-card" aria-labelledby="hero-diagnosis-title">
      <h2 id="hero-diagnosis-title">사진 한 장으로 식물 상태를 진단하세요</h2>
      <p>
        식물 이름을 확인하고, 병충해 가능성이나 영양결핍 여부를 분석한 뒤 내 농장에 저장할 수 있습니다.
      </p>

      <button
        type="button"
        className="home-primary-btn plant-camera-entry"
        onClick={() => navigate(`/diagnosis?source=${useCam ? 'camera' : 'album'}`)}
      >
        사진 찍고 진단하기
      </button>

      <button
        type="button"
        className="home-secondary-btn plant-camera-entry"
        onClick={() => navigate('/diagnosis?source=album')}
      >
        앨범에서 사진 선택
      </button>

      <div className="home-sub-links">
        <button
          type="button"
          className="home-sub-links__btn"
          onClick={() => navigate('/diagnosis?hint=yellow')}
        >
          증상으로 먼저 확인하기
        </button>
      </div>

      <p className="home-hero-foot muted" style={{ marginTop: '1rem', fontSize: '0.82rem', lineHeight: 1.55 }}>
        비회원도 결과 확인 가능 · 로그인하면 내 농장에 저장됩니다
      </p>
    </section>
  );
}
