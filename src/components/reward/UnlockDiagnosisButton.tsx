import './rewardAd.css';

type Props = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** 기본: 광고 보고 진단 열기 */
  label?: string;
};

export function UnlockDiagnosisButton({
  onClick,
  disabled,
  loading,
  label = '광고 보고 진단 열기',
}: Props) {
  return (
    <button
      type="button"
      className="reward-unlock-btn"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? '분석 준비 중…' : label}
    </button>
  );
}
