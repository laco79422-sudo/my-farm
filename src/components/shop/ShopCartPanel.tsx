import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { isFirebaseConfigured } from '../../firebase';
import { loadPointState, spendPoint } from '../../services/pointLedger';
import { useCartStore } from '../../stores/useCartStore';
import { useToastStore } from '../../stores/useToastStore';
import './ShopCartPanel.css';

export function ShopCartPanel() {
  const { sessionUid, isLoggedIn } = useAuth();
  const showToast = useToastStore((s) => s.show);
  const lines = useCartStore((s) => s.lines);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const [paying, setPaying] = useState(false);
  const totalPts = lines.reduce((a, l) => a + l.item.pricePoints * l.qty, 0);
  const demoCheckout = !isFirebaseConfigured() && isLoggedIn && Boolean(sessionUid);

  function checkoutDemo() {
    if (!sessionUid || lines.length === 0) return;
    const bal = loadPointState(sessionUid).currentPoint;
    if (bal < totalPts) {
      showToast('포인트가 부족합니다.');
      return;
    }
    setPaying(true);
    try {
      for (const l of lines) {
        const cost = l.item.pricePoints * l.qty;
        const label = l.qty > 1 ? `${l.item.name} ×${l.qty} 구매` : `${l.item.name} 구매`;
        const r = spendPoint(sessionUid, label, cost);
        if (!r.ok) {
          showToast(r.error);
          return;
        }
      }
      clear();
      showToast('포인트로 결제했습니다. (데모)');
    } finally {
      setPaying(false);
    }
  }

  if (lines.length === 0) {
    return (
      <aside className="shop-cart-panel shop-cart-panel--empty" aria-label="장바구니">
        <h2 className="shop-cart-panel__title">장바구니</h2>
        <p className="muted shop-cart-panel__empty-msg">담긴 상품이 없습니다. 카드에서 담기를 눌러 보세요.</p>
      </aside>
    );
  }

  return (
    <aside className="shop-cart-panel" aria-label="장바구니">
      <h2 className="shop-cart-panel__title">장바구니</h2>
      <ul className="shop-cart-panel__list">
        {lines.map((l) => (
          <li key={l.item.id} className="shop-cart-panel__line">
            <div>
              <span className="shop-cart-panel__name">{l.item.name}</span>
              <span className="muted shop-cart-panel__meta">
                {l.qty}개 · {(l.item.pricePoints * l.qty).toLocaleString('ko-KR')}P
              </span>
            </div>
            <button type="button" className="shop-cart-panel__rm" onClick={() => remove(l.item.id)}>
              빼기
            </button>
          </li>
        ))}
      </ul>
      <p className="shop-cart-panel__total">
        합계 <strong>{totalPts.toLocaleString('ko-KR')}P</strong>
      </p>
      <div className="shop-cart-panel__actions">
        {demoCheckout ? (
          <button
            type="button"
            className="btn btn--primary shop-cart-panel__checkout"
            disabled={paying}
            onClick={() => checkoutDemo()}
          >
            {paying ? '처리 중…' : '포인트로 결제 (데모)'}
          </button>
        ) : (
          <button type="button" className="btn btn--primary shop-cart-panel__checkout" disabled>
            주문·결제는 준비 중
          </button>
        )}
        <button type="button" className="btn btn--ghost" onClick={() => clear()}>
          비우기
        </button>
      </div>
    </aside>
  );
}
