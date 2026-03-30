import type { MarketProductDoc } from '../../types';
import './MarketProductCard.css';

interface Props {
  product: MarketProductDoc;
  onBuy: (p: MarketProductDoc) => void;
}

export function MarketProductCard({ product, onBuy }: Props) {
  const rating = product.rating ?? 4.5;
  const reviews = product.reviewCount ?? 12;
  const origin = product.origin ?? '국내산';
  const ship = product.shippingNote ?? '지역 직거래 · 당일/익일 출고';

  return (
    <article className="market-card">
      <div className="market-card__media">
        {product.badge && <span className="market-card__badge">{product.badge}</span>}
        <img src={product.imageUrl} alt="" className="market-card__img" />
      </div>

      <div className="market-card__body">
        <p className="market-card__farm">
          <span className="market-card__farm-icon" aria-hidden>
            🚜
          </span>
          {product.farmName}
        </p>
        <h3 className="market-card__title">{product.name}</h3>

        <div className="market-card__meta">
          <span className="market-card__qty">{product.quantityLabel}</span>
          <span className="market-card__origin">{origin}</span>
        </div>

        <div className="market-card__rating" aria-label={`평점 ${rating}점`}>
          <span className="market-card__stars">{'★'.repeat(Math.floor(rating))}</span>
          <span className="market-card__rating-num">{rating.toFixed(1)}</span>
          <span className="market-card__reviews">({reviews})</span>
        </div>

        <p className="market-card__ship">{ship}</p>

        <div className="market-card__buy-row">
          <div className="market-card__price-block">
            <span className="market-card__price-label">판매가</span>
            <p className="market-card__price">
              <strong>{product.price.toLocaleString('ko-KR')}</strong>
              <span className="market-card__won">원</span>
            </p>
          </div>
          <button type="button" className="market-card__buy btn btn--primary" onClick={() => onBuy(product)}>
            구매하기
          </button>
        </div>
      </div>
    </article>
  );
}
