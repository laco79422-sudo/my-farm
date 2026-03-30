import { useState, useCallback, useEffect } from 'react';
import type { ShopItem } from '../../types';
import { SHOP_IMAGE_FALLBACK } from '../../data/seedCatalog';
import './ShopProductCard.css';

interface Props {
  item: ShopItem;
  onAdd: (item: ShopItem) => void;
}

function ProductImage({ src, name }: { src: string; name: string }) {
  const [current, setCurrent] = useState(src);
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    setCurrent(src);
    setTriedFallback(false);
  }, [src]);

  const onError = useCallback(() => {
    if (!triedFallback) {
      setTriedFallback(true);
      setCurrent(SHOP_IMAGE_FALLBACK);
    }
  }, [triedFallback]);

  return (
    <img
      src={current}
      alt={name}
      className="shop-card__img"
      loading="lazy"
      decoding="async"
      onError={onError}
    />
  );
}

export function ShopProductCard({ item, onAdd }: Props) {
  const periodLabel = item.growPeriodOrUse;
  const tags = item.tags ?? [];
  const uiTags = item.recommendUiTags ?? [];
  const isSeed = item.category === '씨앗';
  const isKit = item.category === '키트';
  const showGrowDetail = isSeed || isKit;

  const yieldRangeGg =
    item.expectedYieldMinG != null && item.expectedYieldMaxG != null
      ? `${item.expectedYieldMinG}~${item.expectedYieldMaxG}g`
      : (item.expectedYieldGrams ?? item.expectedYield ?? '—');

  return (
    <article className={'shop-card' + (showGrowDetail ? ' shop-card--seed' : '')}>
      <div className="shop-card__media">
        <ProductImage src={item.imageUrl || SHOP_IMAGE_FALLBACK} name={item.name} />
        {isSeed ? (
          <span className="shop-card__ribbon" aria-hidden>
            🌱 씨앗
          </span>
        ) : null}
        {isKit ? (
          <span className="shop-card__ribbon" aria-hidden>
            📦 스타터 키트
          </span>
        ) : null}
      </div>
      <div className="shop-card__body">
        <h3 className="shop-card__title">{item.name}</h3>

        {item.difficultyLabel || item.difficulty ? (
          <p className="shop-card__difficulty">
            <span className="shop-card__difficulty-label">난이도</span>
            {item.difficultyLabel ?? item.difficulty}
          </p>
        ) : null}

        {uiTags.length > 0 || tags.length > 0 ? (
          <ul className="shop-card__tags" aria-label="추천·태그">
            {uiTags.map((t) => (
              <li key={t} className="shop-card__tag shop-card__tag--ui">
                {t}
              </li>
            ))}
            {tags
              .filter((t) => !(uiTags as string[]).includes(t))
              .map((t) => (
                <li key={t} className="shop-card__tag">
                  {t}
                </li>
              ))}
          </ul>
        ) : null}

        {showGrowDetail ? (
          <dl className="shop-card__stats">
            {item.germinationPeriod ? (
              <div className="shop-card__stat">
                <dt>발아</dt>
                <dd>{item.germinationPeriod}</dd>
              </div>
            ) : null}
            {item.harvestPeriod ? (
              <div className="shop-card__stat">
                <dt>수확</dt>
                <dd>{item.harvestPeriod}</dd>
              </div>
            ) : null}
            {item.optimalTemperature ? (
              <div className="shop-card__stat">
                <dt>적정온도</dt>
                <dd>{item.optimalTemperature}</dd>
              </div>
            ) : null}
            <div className="shop-card__stat">
              <dt>예상 수확량</dt>
              <dd>{yieldRangeGg}</dd>
            </div>
            {item.regrow != null ? (
              <div className="shop-card__stat">
                <dt>재수확</dt>
                <dd>{item.regrow ? '가능' : '불가'}</dd>
              </div>
            ) : null}
            {item.regrowInfoText ? (
              <div className="shop-card__stat shop-card__stat--wide">
                <dt>재수확 안내</dt>
                <dd>{item.regrowInfoText}</dd>
              </div>
            ) : null}
            {item.recommendedGrowMethod ? (
              <div className="shop-card__stat shop-card__stat--wide">
                <dt>재배 안내</dt>
                <dd>{item.recommendedGrowMethod}</dd>
              </div>
            ) : null}
            <div className="shop-card__stat shop-card__stat--wide">
              <dt>한 줄 요약</dt>
              <dd>{periodLabel}</dd>
            </div>
          </dl>
        ) : (
          <dl className="shop-card__stats">
            <div className="shop-card__stat">
              <dt>용도</dt>
              <dd>{periodLabel}</dd>
            </div>
          </dl>
        )}

        <div className="shop-card__footer">
          <p className="shop-card__price">
            <span className="shop-card__price-label">가격</span>
            {item.pricePoints.toLocaleString('ko-KR')}
            <span className="shop-card__price-unit">P</span>
          </p>
          <button type="button" className="shop-card__cart btn btn--primary" onClick={() => onAdd(item)}>
            <span className="shop-card__cart-icon" aria-hidden>
              🛒
            </span>
            장바구니 담기
          </button>
        </div>
      </div>
    </article>
  );
}
