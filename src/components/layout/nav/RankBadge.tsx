type Props = {
  label: string;
  /** true면 클릭 시 농부 등급 화면으로 이동 */
  interactive?: boolean;
  onClick?: () => void;
};

export function RankBadge({ label, interactive, onClick }: Props) {
  const title = `농부 등급: ${label}`;
  if (interactive && onClick) {
    return (
      <button
        type="button"
        className="nav-action nav-action--rank nav-action--rank-btn"
        title={title}
        aria-label={`${title}. 눌러서 상세 보기`}
        onClick={onClick}
      >
        {label}
      </button>
    );
  }
  return (
    <span className="nav-action nav-action--rank" title={title} role="status">
      {label}
    </span>
  );
}
