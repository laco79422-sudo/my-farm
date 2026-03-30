import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './myFarm.css';

export function ShopEntry() {
  const navigate = useNavigate();
  const { pointsLabel } = useAuth();

  return (
    <section className="my-farm-section" id="farm-shop">
      <h2 className="my-farm-section__title">ShopEntry · 상점 연결</h2>
      <p className="muted my-farm-section__lead">
        씨앗·용기를 구매한 뒤 아래에서 재배를 시작하세요. 포인트: <strong>{pointsLabel}</strong>
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/shop')}>
          씨앗 구매
        </button>
        <button type="button" className="btn btn--lime" onClick={() => navigate('/shop')}>
          용기 구매
        </button>
      </div>
    </section>
  );
}
