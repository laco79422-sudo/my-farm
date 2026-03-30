type Props = {
  count: number;
  onClick: () => void;
};

export function CartButton({ count, onClick }: Props) {
  return (
    <button
      type="button"
      className="nav-action nav-action--cart"
      onClick={onClick}
      aria-label={count > 0 ? `장바구니, 상품 ${count}개` : '장바구니'}
    >
      <span className="nav-action__icon" aria-hidden>
        🛒
      </span>
      <span className="nav-action__cart-label">장바구니</span>
      {count > 0 && (
        <span className="nav-action__badge" aria-hidden>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
