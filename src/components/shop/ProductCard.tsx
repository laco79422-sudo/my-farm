import { useCallback, useEffect, useState } from 'react';
import type { ShopItem } from '../../types';
import { SHOP_IMAGE_FALLBACK } from '../../data/seedCatalog';
import './ProductCard.css';

export type ProductCardVariant = 'compact' | 'full' | 'shelf';

type Props = {
  product: ShopItem;
  variant?: ProductCardVariant;
  /** 구매(포인트 확인 후 장바구니 또는 광고 유도) */
  onBuy?: () => void;
  onAddCart?: () => void;
  buyDisabled?: boolean;
  cartDisabled?: boolean;
  buyLabel?: string;
};

export function ProductCard({
  product,
  variant = 'compact',
  onBuy,
  onAddCart,
  buyDisabled,
  cartDisabled,
  buyLabel = '구매하기',
}: Props) {
  const [src, setSrc] = useState(product.imageUrl || SHOP_IMAGE_FALLBACK);
  const [triedFb, setTriedFb] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    setSrc(product.imageUrl || SHOP_IMAGE_FALLBACK);
    setTriedFb(false);
  }, [product.imageUrl]);

  const onImgErr = useCallback(() => {
    if (!triedFb) {
      setTriedFb(true);
      setSrc(SHOP_IMAGE_FALLBACK);
    }
  }, [triedFb]);

  const desc = product.shortDesc ?? product.growPeriodOrUse;
  const won = product.referencePriceWon;
  const uiTags = product.recommendUiTags ?? [];
  const showSeedMeta = Boolean(
    product.germinationPeriod ||
      product.harvestPeriod ||
      product.recommendedGrowMethod ||
      product.expectedYieldGrams,
  );

  if (variant === 'shelf') {
    return (
      <article
        className="product-card product-card--shelf"
        aria-labelledby={`pc-${product.id}`}
      >
        <div className="product-card__img-wrap">
          <img
            src={src}
            alt=""
            className="product-card__img"
            loading="lazy"
            decoding="async"
            onError={onImgErr}
          />
        </div>
        {product.difficulty || uiTags.length > 0 ? (
          <div className="product-card__badges" aria-label="난이도·추천">
            {product.difficulty ? (
              <span className="product-card__badge product-card__badge--diff">{product.difficulty}</span>
            ) : null}
            {uiTags.map((t) => (
              <span key={t} className="product-card__badge product-card__badge--tag">
                {t}
              </span>
            ))}
          </div>
        ) : null}
        <h3 id={`pc-${product.id}`} className="product-card__title">
          {product.name}
        </h3>
        <div className="product-card__price-row product-card__price-row--shelf">
          <span className="product-card__points">{product.pricePoints.toLocaleString('ko-KR')}P</span>
        </div>
        {onAddCart ? (
          <div className="product-card__actions product-card__actions--shelf">
            <button type="button" className="btn btn--primary" disabled={cartDisabled} onClick={onAddCart}>
              장바구니
            </button>
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <article
      className={`product-card product-card--${variant}`.trim()}
      aria-labelledby={`pc-${product.id}`}
    >
      <div className="product-card__img-wrap">
        <img
          src={src}
          alt=""
          className="product-card__img"
          loading="lazy"
          decoding="async"
          onError={onImgErr}
        />
      </div>
      {product.difficulty || uiTags.length > 0 ? (
        <div className="product-card__badges" aria-label="난이도·추천">
          {product.difficulty ? (
            <span className="product-card__badge product-card__badge--diff">{product.difficulty}</span>
          ) : null}
          {uiTags.map((t) => (
            <span key={t} className="product-card__badge product-card__badge--tag">
              {t}
            </span>
          ))}
        </div>
      ) : null}
      <h3 id={`pc-${product.id}`} className="product-card__title">
        {product.name}
      </h3>
      {showSeedMeta && variant === 'compact' ? (
        <ul className="product-card__seed-meta">
          {product.germinationPeriod ? (
            <li>
              <span>발아</span> {product.germinationPeriod}
            </li>
          ) : null}
          {product.harvestPeriod ? (
            <li>
              <span>수확</span> {product.harvestPeriod}
            </li>
          ) : null}
          {product.expectedYieldGrams ? (
            <li>
              <span>예상</span> {product.expectedYieldGrams}
            </li>
          ) : null}
        </ul>
      ) : null}
      <p className="product-card__desc">{desc}</p>
      <div className="product-card__price-row">
        <span className="product-card__points">{product.pricePoints.toLocaleString('ko-KR')}P</span>
        {won != null ? (
          <span className="product-card__won">참고 ₩{won.toLocaleString('ko-KR')}</span>
        ) : null}
      </div>
      <p className="product-card__point-hint">{product.pricePoints.toLocaleString('ko-KR')}P 사용 가능</p>

      {variant === 'full' ? (
        <>
          <button
            type="button"
            className="product-card__detail-toggle"
            onClick={() => setDetailsOpen((v) => !v)}
            aria-expanded={detailsOpen}
          >
            {detailsOpen ? '상세 접기' : '상품 상세'}
          </button>
          {detailsOpen ? (
            <div className="product-card__detail-body">
              <p className="muted" style={{ margin: '0 0 0.65rem', fontSize: '0.82rem', lineHeight: 1.5 }}>
                {product.growPeriodOrUse}
                {product.tags?.length ? ` · 태그: ${product.tags.join(', ')}` : ''}
              </p>
              {onAddCart ? (
                <button type="button" className="btn btn--primary" disabled={cartDisabled} onClick={onAddCart}>
                  장바구니에 담기
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

      {onBuy || (onAddCart && variant !== 'full') ? (
        <div
          className={
            'product-card__actions' + (variant === 'compact' ? ' product-card__actions--stack' : '')
          }
        >
          {onBuy ? (
            <button type="button" className="btn btn--primary" disabled={buyDisabled} onClick={onBuy}>
              {buyLabel}
            </button>
          ) : null}
          {onAddCart && variant !== 'full' ? (
            <button type="button" className="btn btn--ghost" disabled={cartDisabled} onClick={onAddCart}>
              장바구니
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
