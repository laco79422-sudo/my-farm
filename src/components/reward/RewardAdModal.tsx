import { useCallback, useEffect, useState } from 'react';
import { POINT_RULES } from '../../services/pointService';
import { getRewardAdEligibility, REWARD_AD_DAILY_POINT_MAX } from '../../services/rewardAdPolicy';
import './rewardAd.css';

const MOCK_AD_MS = 2600;

type Props = {
  open: boolean;
  onClose: () => void;
  /** 광고 시청 완료(데모: 타이머 종료) 시 */
  onAdCompleted: () => void;
  /** 진단 API 진행 중 */
  diagnosisLoading?: boolean;
  /** 미리보기용 진단 결과가 준비된 뒤에만 광고 시청 가능 */
  adReady?: boolean;
};

function formatCooldown(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}초`;
  return `${m}분 ${r}초`;
}

export function RewardAdModal({
  open,
  onClose,
  onAdCompleted,
  diagnosisLoading,
  adReady = true,
}: Props) {
  const [elig, setElig] = useState(() => getRewardAdEligibility());
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setWatching(false);
      setProgress(0);
      return;
    }
    setElig(getRewardAdEligibility());
    const t = window.setInterval(() => setElig(getRewardAdEligibility()), 1000);
    return () => window.clearInterval(t);
  }, [open]);

  const startMockAd = useCallback(() => {
    if (!adReady) return;
    const e = getRewardAdEligibility();
    if (!e.canWatch) return;
    setWatching(true);
    setProgress(0);
    const start = Date.now();
    const id = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / MOCK_AD_MS) * 100);
      setProgress(p);
      if (p >= 100) {
        window.clearInterval(id);
        setWatching(false);
        onAdCompleted();
      }
    }, 48);
  }, [onAdCompleted, adReady]);

  if (!open) return null;

  const pointsLeft = Math.max(0, REWARD_AD_DAILY_POINT_MAX - elig.pointGrantsToday);
  const pointsLine =
    pointsLeft > 0
      ? `오늘 포인트 받기 ${pointsLeft}회 남음 (+${POINT_RULES.rewardAd}P / 회)`
      : '오늘 포인트 지급 횟수를 모두 사용했어요. 시청해도 진단은 열립니다.';

  return (
    <div
      className="reward-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !watching) onClose();
      }}
    >
      <div className="reward-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="reward-modal-title" className="reward-modal__title">
          광고 시청 후 정확한 진단 결과 확인
        </h2>
        <p className="reward-modal__lead">
          광고 보고 병충해 분석 보기
          <br />
          시청 후 병해·영양결핍 후보 전체, 증상 설명, 관리 방법을 모두 확인할 수 있어요.
        </p>

        {diagnosisLoading || !adReady ? (
          <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
            진단 분석이 진행 중입니다… 준비가 되면 광고 시청 버튼이 활성화됩니다.
          </p>
        ) : null}

        <div className="reward-modal__mock" aria-hidden={!watching}>
          <span style={{ fontSize: '2rem' }}>📺</span>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {watching ? '광고 재생 중 (데모)' : '버튼을 누르면 짧은 광고가 재생됩니다'}
          </p>
          <div className="reward-modal__progress" aria-label="재생 진행률">
            <div className="reward-modal__progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <p className="reward-modal__hint" style={{ marginTop: 0 }}>
          {pointsLine}
        </p>

        {!elig.canWatch && !watching ? (
          <p className="reward-modal__hint" role="status">
            연속 시청 방지: {formatCooldown(elig.cooldownRemainingMs)} 후 다시 시도할 수 있어요.
          </p>
        ) : null}

        <div className="reward-modal__actions">
          <button
            type="button"
            className="btn btn--primary"
            style={{ width: '100%' }}
            disabled={watching || !elig.canWatch || !adReady}
            onClick={startMockAd}
          >
            {watching
              ? '재생 중…'
              : !adReady
                ? '진단 준비 중…'
                : elig.canWatch
                  ? '광고 보고 진단 열기'
                  : '쿨다운 중'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ width: '100%' }}
            disabled={watching}
            onClick={onClose}
          >
            나중에
          </button>
        </div>
      </div>
    </div>
  );
}
