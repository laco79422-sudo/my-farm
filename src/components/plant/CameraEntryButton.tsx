import { useNavigate } from 'react-router-dom';
import { prefersCameraCapture } from '../../utils/device';
import './plantComponents.css';

type Props = {
  /** 홈 인라인 버튼 vs 레이아웃 플로팅 */
  variant?: 'inline-primary' | 'inline-secondary' | 'floating';
  className?: string;
};

export function CameraEntryButton({ variant = 'inline-primary', className = '' }: Props) {
  const navigate = useNavigate();

  function go() {
    const source = prefersCameraCapture() ? 'camera' : 'album';
    navigate(`/diagnosis?source=${source}`);
  }

  if (variant === 'floating') {
    return (
      <button
        type="button"
        className={`plant-fab ${className}`.trim()}
        onClick={go}
        aria-label="사진으로 식물 진단 — 3초 진단 시작"
      >
        <span className="plant-fab__icon" aria-hidden>
          📸
        </span>
        <span className="plant-fab__text">3초 진단 시작</span>
      </button>
    );
  }

  const cls =
    variant === 'inline-primary'
      ? 'home-primary-btn plant-camera-entry'
      : 'home-secondary-btn plant-camera-entry';

  return (
    <button type="button" className={`${cls} ${className}`.trim()} onClick={go}>
      {variant === 'inline-primary' ? '📸 사진 찍고 식물 진단하기' : '🖼 앨범에서 사진 선택'}
    </button>
  );
}
