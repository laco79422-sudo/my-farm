import { useMemo } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { useToastStore } from '../../stores/useToastStore';
import { getRecommendedShopItems } from '../../data/recommendedCatalog';
import { usePointPurchaseFlow } from '../../hooks/usePointPurchaseFlow';
import { RewardAdModal } from '../reward/RewardAdModal';
import { ProductCard } from './ProductCard';
import { POINT_RULES } from '../../services/pointService';
import './RecommendedProducts.css';

type Props = {
  status: string;
  plantName?: string;
  detailHint?: 'pest' | 'nutrient' | 'normal';
  /** 진단 결과 카드용 강조 / 내 농장은 컴팩트 */
  variant?: 'result' | 'farm';
  maxItems?: number;
  sectionTitle?: string;
};

export function RecommendedProducts({
  status,
  plantName,
  detailHint,
  variant = 'result',
  maxItems = 3,
  sectionTitle = '이 문제를 해결하는 추천 제품',
}: Props) {
  const add = useCartStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);
  const { adOpen, setAdOpen, tryBuyWithPoints, handleAdCompleted } = usePointPurchaseFlow();

  const products = useMemo(
    () =>
      getRecommendedShopItems({
        status,
        plantName,
        detailHint,
        limit: maxItems,
      }),
    [status, plantName, detailHint, maxItems],
  );

  if (products.length === 0) return null;

  const cardVariant = variant === 'result' ? 'compact' : 'compact';
  const gridClass =
    variant === 'result' ? 'recommended-products__grid recommended-products__grid--result' : 'recommended-products__grid recommended-products__grid--farm';

  return (
    <section
      className={
        'recommended-products' + (variant === 'result' ? ' recommended-products--result' : '')
      }
      aria-labelledby="recommended-products-title"
    >
      <h2 id="recommended-products-title" className="recommended-products__title">
        {sectionTitle}
      </h2>
      <p className="recommended-products__sub muted">
        진단 상태에 맞춰 최대 {maxItems}개만 골랐습니다. (실제 결제·배송 연동 전)
      </p>

      <div className={gridClass}>
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            variant={cardVariant}
            onBuy={() =>
              tryBuyWithPoints(p, () => {
                add(p);
                showToast(`${p.name}을(를) 장바구니에 담았습니다.`);
              })
            }
            onAddCart={() => {
              add(p);
              showToast('장바구니에 추가했습니다.');
            }}
          />
        ))}
      </div>

      <RewardAdModal
        open={adOpen}
        onClose={() => setAdOpen(false)}
        onAdCompleted={() => {
          void handleAdCompleted().then(() => {
            showToast(`광고 시청 완료 · +${POINT_RULES.rewardAd}P (연동 시 적립)`);
          });
        }}
        adReady
      />
    </section>
  );
}
