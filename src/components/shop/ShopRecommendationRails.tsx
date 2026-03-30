import { useMemo } from 'react';
import type { ShopItem } from '../../types';
import { ProductCard } from './ProductCard';
import { useCartStore } from '../../stores/useCartStore';
import { useToastStore } from '../../stores/useToastStore';

function sortShopItems<T extends { listPriority?: number; name: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const pa = a.listPriority ?? 500;
    const pb = b.listPriority ?? 500;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name, 'ko');
  });
}

function pickBeginner(items: ShopItem[]): ShopItem[] {
  const hit = items.filter(
    (i) =>
      i.recommendUiTags?.includes('초보 추천') ||
      Boolean(i.tags?.some((t) => t.includes('초보'))),
  );
  return sortShopItems(hit).slice(0, 8);
}

function pickPopular(items: ShopItem[]): ShopItem[] {
  const tagged = items.filter((i) => i.recommendUiTags?.includes('인기'));
  const pool = tagged.length > 0 ? tagged : items;
  return sortShopItems(pool).slice(0, 8);
}

function pickSets(items: ShopItem[]): ShopItem[] {
  const kits = items.filter((i) => i.category === '키트');
  if (kits.length > 0) return sortShopItems(kits).slice(0, 8);
  const hit = items.filter(
    (i) => i.name.includes('세트') || Boolean(i.tags?.some((t) => t.includes('세트'))),
  );
  return sortShopItems(hit).slice(0, 8);
}

type RailProps = {
  title: string;
  subtitle?: string;
  items: ShopItem[];
};

function RecommendationRail({ title, subtitle, items }: RailProps) {
  const add = useCartStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);

  if (items.length === 0) return null;

  return (
    <div className="shop-rec__rail">
      <div className="shop-rec__rail-head">
        <h2 className="shop-rec__rail-title">{title}</h2>
        {subtitle ? <p className="shop-rec__rail-sub muted">{subtitle}</p> : null}
      </div>
      <div className="shop-rec__track" role="list">
        {items.map((item) => (
          <div key={item.id} className="shop-rec__cell" role="listitem">
            <ProductCard
              product={item}
              variant="shelf"
              onAddCart={() => {
                add(item);
                showToast('장바구니에 담았습니다.');
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type Props = {
  allItems: ShopItem[];
};

export function ShopRecommendationRails({ allItems }: Props) {
  const beginner = useMemo(() => pickBeginner(allItems), [allItems]);
  const popular = useMemo(() => pickPopular(allItems), [allItems]);
  const sets = useMemo(() => pickSets(allItems), [allItems]);

  return (
    <section className="shop-rec" aria-label="추천 상품">
      <RecommendationRail
        title="초보 추천 상품"
        subtitle="처음 키우기 좋은 씨앗·용기"
        items={beginner}
      />
      <RecommendationRail title="인기 상품" subtitle="지금 많이 찾는 품목" items={popular} />
      <RecommendationRail title="스타터 키트" subtitle="씨앗·용기·영양제를 한 번에" items={sets} />
    </section>
  );
}
