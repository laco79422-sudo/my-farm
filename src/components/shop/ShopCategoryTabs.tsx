import { SHOP_DISPLAY_CATEGORIES, type ShopDisplayCategory } from '../../data/shopCategories';
import './ShopCategoryTabs.css';

export { SHOP_DISPLAY_CATEGORIES, type ShopDisplayCategory };

type Props = {
  value: ShopDisplayCategory;
  onChange: (c: ShopDisplayCategory) => void;
};

export function ShopCategoryTabs({ value, onChange }: Props) {
  return (
    <div className="shop-category-tabs" role="tablist" aria-label="상점 카테고리">
      {SHOP_DISPLAY_CATEGORIES.map((c) => (
        <button
          key={c}
          type="button"
          role="tab"
          aria-selected={value === c}
          className={'shop-category-tabs__btn' + (value === c ? ' shop-category-tabs__btn--active' : '')}
          onClick={() => onChange(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
