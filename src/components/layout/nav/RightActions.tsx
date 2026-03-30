import { RankBadge } from './RankBadge';
import { CartButton } from './CartButton';
import { AuthMenu } from './AuthMenu';

type Props = {
  pointsLabel: string;
  grade: string;
  cartCount: number;
  isInitialized: boolean;
  isLoggedIn: boolean;
  displayName: string;
  onLogout: () => void;
  onPointsClick: () => void;
  onRankClick?: () => void;
  onCartClick: () => void;
  onNavigate?: () => void;
};

/**
 * 우측: 상태(포인트·등급·장바구니) + 개인(프로필 드롭다운)
 * 좌측 이동 메뉴와 DOM·시각적으로 분리됨.
 */
export function RightActions({
  pointsLabel,
  grade,
  cartCount,
  isInitialized,
  isLoggedIn,
  displayName,
  onLogout,
  onPointsClick,
  onRankClick,
  onCartClick,
  onNavigate,
}: Props) {
  return (
    <div className="nav-status" role="group" aria-label="상태 및 계정">
      <div className="nav-status__state" aria-label="상태">
        <button
          type="button"
          className="nav-action nav-action--points-btn"
          title={!isInitialized ? '확인 중' : isLoggedIn ? '포인트 상세' : '로그인 후 이용'}
          aria-label={!isInitialized ? '포인트 확인 중' : `포인트 ${pointsLabel}. 상세 보기`}
          disabled={!isInitialized}
          onClick={() => {
            onPointsClick();
            onNavigate?.();
          }}
        >
          <span aria-hidden>✦</span>
          <span>{pointsLabel}</span>
        </button>
        <RankBadge
          label={grade}
          interactive={Boolean(onRankClick)}
          onClick={
            onRankClick
              ? () => {
                  onRankClick();
                  onNavigate?.();
                }
              : undefined
          }
        />
        <CartButton
          count={cartCount}
          onClick={() => {
            onCartClick();
            onNavigate?.();
          }}
        />
      </div>
      <div className="nav-status__profile" aria-label="프로필">
        <AuthMenu
          isInitialized={isInitialized}
          isLoggedIn={isLoggedIn}
          displayName={displayName}
          onLogout={onLogout}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
