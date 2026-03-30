import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getMarketplaceListings } from '../stores/useFarmHubStore';
import { seedGlobalMarketIfEmpty } from '../data/seedMarketListings';
import type { MarketListing } from '../types/farmHub';
import { MarketplaceProductCard } from '../components/farmers/MarketplaceProductCard';
import { FarmersCommunityPanel } from '../components/farmers/FarmersCommunityPanel';
import '../components/farmers/farmersMarket.css';

type MainTab = 'all' | 'region' | 'community';

const CROPS = ['전체', '상추', '토마토', '루꼴라', '기타'] as const;
const SORTS = ['최신순', '인기순', '가격순'] as const;

function localDiscoveryScore(l: MarketListing): number {
  if (!l.localFoodCertified || !l.trust) return 0;
  const t = l.trust;
  return 100 * t.exposureBoost + 25 * t.logRate + 15 * t.salesSuccessRate;
}

function popularityScore(l: MarketListing): number {
  const t = l.trust;
  const review = t ? t.reviewAvg * 20 : 0;
  const saleBoost = l.status === 'on_sale' ? 15 : 0;
  const local = l.localFoodCertified ? 10 : 0;
  const trustBonus = t ? (t.salesSuccessRate + t.logRate) * 10 : 0;
  return review + saleBoost + local + trustBonus;
}

export function FarmersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tick, setTick] = useState(0);

  const tabParam = searchParams.get('tab');
  const mainTab: MainTab =
    tabParam === 'region' || tabParam === 'community' ? tabParam : 'all';

  const setMainTab = useCallback(
    (next: MainTab) => {
      const nextParams = new URLSearchParams(searchParams);
      if (next === 'all') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', next);
      }
      if (next !== 'community') {
        nextParams.delete('view');
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const [crop, setCrop] = useState<string>('전체');
  const [method, setMethod] = useState<string>('전체');
  const [status, setStatus] = useState<string>('전체');
  const [sort, setSort] = useState<string>('최신순');
  const [province, setProvince] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [localFoodOnly, setLocalFoodOnly] = useState(false);

  useEffect(() => {
    seedGlobalMarketIfEmpty();
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener('focus', bump);
    return () => window.removeEventListener('focus', bump);
  }, []);

  const raw = useMemo(() => getMarketplaceListings(), [tick]);

  const provinces = useMemo(() => {
    const s = new Set(raw.map((l) => l.city));
    return [...s].sort((a, b) => a.localeCompare(b, 'ko'));
  }, [raw]);

  const districtsInProvince = useMemo(() => {
    if (!province) return [];
    const s = new Set(raw.filter((l) => l.city === province).map((l) => l.district));
    return [...s].sort((a, b) => a.localeCompare(b, 'ko'));
  }, [raw, province]);

  useEffect(() => {
    if (district && !districtsInProvince.includes(district)) {
      setDistrict('');
    }
  }, [district, districtsInProvince]);

  const filtered = useMemo(() => {
    let list = [...raw];

    if (mainTab === 'region') {
      if (!province) {
        return [];
      }
      list = list.filter((l) => l.city === province);
      if (district) {
        list = list.filter((l) => l.district === district);
      }
      if (localFoodOnly) {
        list = list.filter((l) => l.localFoodCertified);
      }
    }

    if (crop !== '전체' && crop !== '기타') {
      list = list.filter((l) => l.productName.includes(crop));
    }
    if (method !== '전체') {
      list = list.filter((l) => l.growMethod === method);
    }
    if (status !== '전체') {
      list = list.filter((l) => l.status === status);
    }

    const byDiscovery = (a: MarketListing, b: MarketListing) => {
      const d = localDiscoveryScore(b) - localDiscoveryScore(a);
      if (d !== 0) return d;
      return 0;
    };

    if (sort === '최신순') {
      list.sort((a, b) => {
        const d = byDiscovery(a, b);
        if (d !== 0) return d;
        return b.createdAt.localeCompare(a.createdAt);
      });
    } else if (sort === '가격순') {
      list.sort((a, b) => {
        const d = byDiscovery(a, b);
        if (d !== 0) return d;
        return a.priceWon - b.priceWon;
      });
    } else {
      list.sort((a, b) => {
        const d = byDiscovery(a, b);
        if (d !== 0) return d;
        return popularityScore(b) - popularityScore(a);
      });
    }

    return list;
  }, [raw, mainTab, province, district, localFoodOnly, crop, method, status, sort]);

  const farmerCount = useMemo(() => new Set(raw.map((l) => l.ownerUid)).size, [raw]);

  const showMarketToolbar = mainTab === 'all' || mainTab === 'region';

  return (
    <div className="page-shell farmers-page">
      <h1 className="section-title">농부들</h1>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        시장 탐색·<strong style={{ color: 'var(--color-mint)' }}>지역·로컬푸드</strong>·
        <strong style={{ color: 'var(--color-mint)' }}>커뮤니티</strong>를 한 흐름으로 연결했습니다. 상품을 눌러
        농부 프로필에서 후기를 확인한 뒤 장바구니로 이어가 보세요.
      </p>

      <div className="farmers-tabs farmers-tabs--main" role="tablist" aria-label="농부들 구역">
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === 'all'}
          className={'farmers-tabs__btn' + (mainTab === 'all' ? ' farmers-tabs__btn--on' : '')}
          onClick={() => setMainTab('all')}
        >
          전체
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === 'region'}
          className={'farmers-tabs__btn' + (mainTab === 'region' ? ' farmers-tabs__btn--on' : '')}
          onClick={() => setMainTab('region')}
        >
          지역
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === 'community'}
          className={'farmers-tabs__btn' + (mainTab === 'community' ? ' farmers-tabs__btn--on' : '')}
          onClick={() => setMainTab('community')}
        >
          커뮤니티
        </button>
      </div>

      {mainTab === 'all' ? (
        <p className="muted farmers-page__summary">
          모든 농부 상품 {raw.length}건 · 등록 농부 약 {farmerCount}명 (데모)
        </p>
      ) : null}

      {mainTab === 'region' ? (
        <div className="farmers-region-block">
          <p className="muted farmers-page__summary">
            시·도와 구·군을 고르면 그 지역 농부와 상품만 보입니다. 로컬푸드 인증 상품은 필터로만 모아 볼 수
            있어요.
          </p>
          <div className="farmers-region-select-row">
            <label>
              시·도
              <select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setDistrict('');
                }}
              >
                <option value="">선택</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label>
              구·군
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!province}
              >
                <option value="">{province ? '전체(구·군 미지정)' : '시·도를 먼저 선택'}</option>
                {districtsInProvince.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="farmers-local-only">
              <input
                type="checkbox"
                checked={localFoodOnly}
                onChange={(e) => setLocalFoodOnly(e.target.checked)}
              />
              로컬푸드 인증만
            </label>
          </div>
          <p className="muted" style={{ fontSize: '0.8rem', margin: '0 0 0.75rem' }}>
            농부로 로컬푸드 입점을 준비 중이면{' '}
            <Link to="/local-food" style={{ color: 'var(--color-mint)', fontWeight: 700 }}>
              입점 조건·개설
            </Link>
            페이지에서 확인할 수 있습니다.
          </p>
        </div>
      ) : null}

      {mainTab === 'community' ? <FarmersCommunityPanel /> : null}

      {showMarketToolbar ? (
        <div className="farmers-toolbar">
          <label>
            작물
            <select value={crop} onChange={(e) => setCrop(e.target.value)}>
              {CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            재배
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="전체">전체</option>
              <option value="hydro">수경</option>
              <option value="soil">토양</option>
            </select>
          </label>
          <label>
            상태
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="전체">전체</option>
              <option value="on_sale">판매 중</option>
              <option value="sold_out">품절</option>
            </select>
          </label>
          <label>
            정렬
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {mainTab !== 'community' ? (
        <>
          <div className="grid-cards cols-3">
            {filtered.map((l) => (
              <MarketplaceProductCard
                key={l.id}
                listing={l}
                distanceLabel={mainTab === 'region' && province ? '지역' : undefined}
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="muted" style={{ marginTop: '1rem' }}>
              {mainTab === 'region' && !province
                ? '시·도를 선택하면 해당 지역 상품이 표시됩니다.'
                : '표시할 상품이 없습니다. 내 농장에서 수확 후 개인상점에 등록해 보세요.'}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
