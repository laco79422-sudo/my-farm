import type { ShopItem } from '../../types';
import { ProductCard, type ProductCardVariant } from './ProductCard';
import { ShopProductCard } from './ShopProductCard';
import { useCartStore } from '../../stores/useCartStore';
import { useToastStore } from '../../stores/useToastStore';

type Props = {
  items: ShopItem[];
  cardVariant?: ProductCardVariant;
  className?: string;
};

export function ProductList({ items, cardVariant = 'shelf', className }: Props) {
  const add = useCartStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);

  if (items.length === 0) {
    return (
      <p className="muted" style={{ marginTop: '1.25rem' }}>
        조건에 맞는 상품이 없습니다. 검색어나 카테고리를 바꿔 보세요.
      </p>
    );
  }

  return (
    <div className={'grid-cards cols-3 shop-page__grid ' + (className ?? '')} style={{ marginTop: '1.1rem' }}>
      {items.map((item) =>
        item.category === '씨앗' || item.category === '키트' ? (
          <ShopProductCard
            key={item.id}
            item={item}
            onAdd={() => {
              add(item);
              showToast('장바구니에 담았습니다.');
            }}
          />
        ) : (
          <ProductCard
            key={item.id}
            product={item}
            variant={cardVariant}
            onAddCart={() => {
              add(item);
              showToast('장바구니에 담았습니다.');
            }}
          />
        ),
      )}
    </div>
  );
}
