import { Link } from 'react-router-dom';
import { ShopCartPanel } from '../components/shop/ShopCartPanel';
import '../components/shop/ShopCartPanel.css';

export function CartPage() {
  return (
    <div className="page-shell" style={{ maxWidth: 480 }}>
      <h1 className="section-title">장바구니</h1>
      <p className="muted" style={{ lineHeight: 1.55, marginBottom: '1rem' }}>
        상점에서 담은 상품입니다. 결제 연동 전까지는 목록 확인용입니다.
      </p>
      <ShopCartPanel />
      <p className="muted" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
        <Link to="/shop" style={{ color: 'var(--color-mint)', fontWeight: 700 }}>
          ← 상점으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
