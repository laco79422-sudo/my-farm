import './plantComponents.css';

type Props = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function DiagnoseCTAButton({ onClick, disabled, loading }: Props) {
  return (
    <button
      type="button"
      className="btn btn--primary plant-diagnose-cta"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? '진단 준비 중…' : '이 식물 진단하기'}
    </button>
  );
}
