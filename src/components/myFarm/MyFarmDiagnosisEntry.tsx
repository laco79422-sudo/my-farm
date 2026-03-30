import { useNavigate } from 'react-router-dom';
import { prefersCameraCapture } from '../../utils/device';
import './myFarm.css';

/** 내 농장 상단 — 사진 진단 진입 (전역 메뉴에서 분리) */
export function MyFarmDiagnosisEntry() {
  const navigate = useNavigate();
  const useCam = prefersCameraCapture();

  return (
    <section className="my-farm-section my-farm-diagnosis-entry" id="farm-flow-diagnosis">
      <h2 className="my-farm-section__title">사진 진단</h2>
      <p className="muted my-farm-section__lead">
        식물 사진으로 상태를 확인한 뒤, 결과를 내 농장에 저장하고 재배 흐름으로 이어갑니다.
      </p>
      <div className="my-farm-diagnosis-entry__actions">
        <button
          type="button"
          className="btn btn--primary my-farm-diagnosis-entry__primary"
          onClick={() => navigate(`/diagnosis?source=${useCam ? 'camera' : 'album'}`)}
        >
          사진으로 진단하기
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => navigate('/diagnosis?source=album')}
        >
          앨범에서 선택
        </button>
      </div>
      <style>{`
        .my-farm-diagnosis-entry__actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        @media (min-width: 480px) {
          .my-farm-diagnosis-entry__actions {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
          }
        }
        .my-farm-diagnosis-entry__primary {
          min-height: 48px;
          font-weight: 800;
        }
      `}</style>
    </section>
  );
}
