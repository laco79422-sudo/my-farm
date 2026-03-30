type Props = {
  onClick: () => void;
};

/** 좁은 화면에서는 💰, 넓으면 '충전' — CSS로 전환 */
export function ChargeButton({ onClick }: Props) {
  return (
    <button
      type="button"
      className="nav-action nav-action--charge"
      onClick={onClick}
      title="포인트 충전 · 상점"
      aria-label="포인트 충전 · 상점"
    >
      <span className="nav-charge__compact" aria-hidden>
        💰
      </span>
      <span className="nav-charge__full">충전</span>
    </button>
  );
}
