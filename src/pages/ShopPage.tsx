import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShopCategoryTabs,
  SHOP_DISPLAY_CATEGORIES,
  type ShopDisplayCategory,
} from '../components/shop/ShopCategoryTabs';
import { dummyShopItems } from '../data/dummyShop';
import { ProductRequestForm } from '../components/shop/ProductRequestForm';
import { RequestHandlersPanel } from '../components/shop/RequestHandlersPanel';
import { ProductList } from '../components/shop/ProductList';
import { ShopCartPanel } from '../components/shop/ShopCartPanel';
import { ShopRecommendationRails } from '../components/shop/ShopRecommendationRails';
import { matchesDisplayCategory, matchesSearchQuery } from '../utils/shopFilters';
import { useProductRequestStore } from '../stores/useProductRequestStore';
import './ShopPage.css';

type ShopSection = 'browse' | 'request' | 'handlers';

function sortShopItems<T extends { listPriority?: number; name: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const pa = a.listPriority ?? 500;
    const pb = b.listPriority ?? 500;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name, 'ko');
  });
}

function parseSection(view: string | null): ShopSection {
  if (view === 'request') return 'request';
  if (view === 'handlers' || view === 'progress') return 'handlers';
  return 'browse';
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [section, setSection] = useState<ShopSection>(() => parseSection(searchParams.get('view')));
  const hydrateRequests = useProductRequestStore((s) => s.hydrate);

  useEffect(() => {
    hydrateRequests();
  }, [hydrateRequests]);

  useEffect(() => {
    const v = searchParams.get('view');
    if (v === 'progress') {
      const p = new URLSearchParams(searchParams);
      p.set('view', 'handlers');
      setSearchParams(p, { replace: true });
      setSection('handlers');
      return;
    }
    setSection(parseSection(v));
  }, [searchParams, setSearchParams]);

  const setShopSection = (next: ShopSection) => {
    setSection(next);
    const p = new URLSearchParams(searchParams);
    if (next === 'browse') {
      p.delete('view');
    } else {
      p.set('view', next);
    }
    setSearchParams(p, { replace: true });
  };

  const [tab, setTab] = useState<ShopDisplayCategory>('씨앗');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat && (SHOP_DISPLAY_CATEGORIES as readonly string[]).includes(cat)) {
      setTab(cat as ShopDisplayCategory);
    }
  }, [searchParams]);

  const allSorted = useMemo(() => sortShopItems([...dummyShopItems]), []);

  const items = useMemo(() => {
    return allSorted.filter(
      (i) => matchesDisplayCategory(i, tab) && matchesSearchQuery(i, search),
    );
  }, [allSorted, tab, search]);

  return (
    <div className="page-shell shop-page">
      <header className="shop-page__header">
        <div>
          <h1 className="section-title">상점</h1>
          {section === 'browse' ? (
            <p className="muted shop-page__lead">
              초보용 씨앗·스타터 키트부터 포인트로 담고, 바로 재배를 이어갈 수 있습니다. (결제 연동 전 · 장바구니 확인용)
            </p>
          ) : section === 'request' ? (
            <p className="muted shop-page__lead">
              함께 채워 나갈 상품을 의뢰하고, 담당 진행자와 보상 구조를 확인하세요.
            </p>
          ) : (
            <p className="muted shop-page__lead">
              열린 의뢰에 지원하고, 의뢰자가 진행자를 선택한 뒤 함께 상품을 완성합니다.
            </p>
          )}
        </div>
      </header>

      <div className="shop-page__section-tabs" role="tablist" aria-label="상점 메뉴">
        <button
          type="button"
          role="tab"
          aria-selected={section === 'browse'}
          className={
            'shop-page__section-tab' + (section === 'browse' ? ' shop-page__section-tab--on' : '')
          }
          onClick={() => setShopSection('browse')}
        >
          상품 둘러보기
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={section === 'request'}
          className={
            'shop-page__section-tab' + (section === 'request' ? ' shop-page__section-tab--on' : '')
          }
          onClick={() => setShopSection('request')}
        >
          상품 의뢰
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={section === 'handlers'}
          className={
            'shop-page__section-tab' + (section === 'handlers' ? ' shop-page__section-tab--on' : '')
          }
          onClick={() => setShopSection('handlers')}
        >
          의뢰 진행자
        </button>
      </div>

      {section === 'browse' ? (
        <>
          <ShopRecommendationRails allItems={allSorted} />
          <ShopCartPanel />
          <div className="shop-page__search-block">
            <label className="shop-page__search-label" htmlFor="shop-search">
              상품 검색
            </label>
            <input
              id="shop-search"
              type="search"
              className="shop-page__search-input"
              placeholder="이름·태그·용도로 검색…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
          </div>
          <ShopCategoryTabs value={tab} onChange={setTab} />
          <h2 className="shop-page__list-heading">상품 목록</h2>
          <ProductList items={items} />
        </>
      ) : null}

      {section === 'request' ? (
        <div className="shop-page__request-wrap" style={{ marginTop: '1rem' }}>
          <ProductRequestForm />
        </div>
      ) : null}

      {section === 'handlers' ? (
        <div style={{ marginTop: '1rem' }}>
          <RequestHandlersPanel />
        </div>
      ) : null}
    </div>
  );
}
