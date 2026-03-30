import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { FarmProfile, GrowPlant } from '../../types/farmHub';
import { getRemainingSellableForUi } from '../../utils/salesLimits';
import { MIN_SALE_REGISTER_GRAMS } from '../../utils/canRegisterSale';
import { useFarmHubStore, getMarketplaceListings } from '../../stores/useFarmHubStore';
import { useToastStore } from '../../stores/useToastStore';
import {
  getLocalFoodVendorFromStorage,
  useLocalFoodVendorStore,
} from '../../stores/useLocalFoodVendorStore';
import type { FulfillmentType } from '../../types/farmHub';
import './myFarm.css';

type Props = {
  profile: FarmProfile | null;
  plants: GrowPlant[];
  listingsTick: number;
};

export function MyShopSection({ profile, plants, listingsTick }: Props) {
  const publishListing = useFarmHubStore((s) => s.publishListing);
  const ownerUid = useFarmHubStore((s) => s.ownerUid);
  const vendorTick = useLocalFoodVendorStore((s) => s.tick);
  const showToast = useToastStore((s) => s.show);
  const [plantId, setPlantId] = useState('');
  const [grams, setGrams] = useState(MIN_SALE_REGISTER_GRAMS);
  const [price, setPrice] = useState(5000);
  const [fulfillment, setFulfillment] = useState<FulfillmentType>('pickup');
  const [localFoodCertified, setLocalFoodCertified] = useState(false);
  const [bundleOffer, setBundleOffer] = useState(false);
  const [preorder, setPreorder] = useState(false);
  const [subscription, setSubscription] = useState(false);

  const isVendor = Boolean(ownerUid && getLocalFoodVendorFromStorage(ownerUid));

  useEffect(() => {
    if (!isVendor) {
      setLocalFoodCertified(false);
      setBundleOffer(false);
      setPreorder(false);
      setSubscription(false);
    }
  }, [isVendor, vendorTick]);

  const allListings = useMemo(() => getMarketplaceListings(), [listingsTick]);
  const harvested = plants.filter((p) => p.status === 'harvested' && p.harvest);

  useEffect(() => {
    if (!plantId && harvested[0]) setPlantId(harvested[0].id);
  }, [harvested, plantId]);

  const selected = plants.find((p) => p.id === (plantId || harvested[0]?.id));
  const remaining = selected ? getRemainingSellableForUi(selected, allListings) : 0;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile?.city || !profile?.district) {
      showToast('농장 정보에서 시/도·구를 먼저 입력해 주세요.');
      return;
    }
    if (!selected?.harvest) return;
    const r = publishListing({
      plantId: selected.id,
      farmerName: profile.farmerName,
      farmName: profile.farmName,
      city: profile.city,
      district: profile.district,
      productName: selected.name,
      grams,
      priceWon: price,
      growMethod: selected.growMethod,
      harvestDate: selected.harvest.harvestedAt.slice(0, 10),
      fulfillment,
      localFoodCertified: isVendor && localFoodCertified,
      bundleOffer: isVendor && bundleOffer,
      preorder: isVendor && preorder,
      subscription: isVendor && subscription,
    });
    if (r.ok) showToast('농부들 목록에 등록되었습니다.');
    else showToast(r.error ?? '등록 실패');
  }

  return (
    <section className="my-farm-section" id="farm-myshop">
      <h2 className="my-farm-section__title">MyShop · 개인상점</h2>
      <p className="muted my-farm-section__lead">
        수확 완료 시 농장 정보가 갖춰져 있으면 판매 글이 자동 등록됩니다. 여기서는 수량·가격을 조정하거나 인증 옵션을
        켤 수 있습니다.
      </p>
      {harvested.length === 0 ? (
        <p className="muted">수확 완료된 작물이 없습니다.</p>
      ) : (
        <form onSubmit={onSubmit}>
          <label className="muted" style={{ fontSize: '0.75rem' }}>
            작물
            <select
              className="ms-inp"
              value={plantId || harvested[0]?.id || ''}
              onChange={(e) => setPlantId(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            >
              {harvested.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (총 {p.harvest ? Math.round(p.harvest.totalGrams) : 0}g)
                </option>
              ))}
            </select>
          </label>
          {selected?.harvest ? (
            <p className="muted" style={{ fontSize: '0.78rem', margin: '8px 0' }}>
              실제 수확 {selected.actualHarvestTotalG != null ? `${Math.round(selected.actualHarvestTotalG)}g` : `${Math.round(selected.harvest.totalGrams)}g`} ·
              판매 등록 누적 {Math.round(selected.soldTotalG ?? 0)}g · 잔여{' '}
              <strong style={{ color: 'var(--color-mint)' }}>{Math.round(remaining)}g</strong>
              {remaining < MIN_SALE_REGISTER_GRAMS ? ' (최소 등록량 미만)' : ''}
            </p>
          ) : null}
          <label className="muted" style={{ fontSize: '0.75rem', display: 'block', marginTop: 8 }}>
            등록 무게(g) — 최소 {MIN_SALE_REGISTER_GRAMS}g
            <input
              type="number"
              min={MIN_SALE_REGISTER_GRAMS}
              max={remaining > 0 ? remaining : undefined}
              className="ms-inp"
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <label className="muted" style={{ fontSize: '0.75rem', display: 'block', marginTop: 8 }}>
            가격(원)
            <input
              type="number"
              min={0}
              className="ms-inp"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <label className="muted" style={{ fontSize: '0.75rem', display: 'block', marginTop: 8 }}>
            수령
            <select
              className="ms-inp"
              value={fulfillment}
              onChange={(e) => setFulfillment(e.target.value as FulfillmentType)}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            >
              <option value="pickup">직접</option>
              <option value="delivery">배송</option>
            </select>
          </label>
          {isVendor ? (
            <fieldset
              className="muted"
              style={{
                marginTop: 12,
                padding: '0.5rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.75rem',
              }}
            >
              <legend style={{ padding: '0 0.35rem' }}>로컬푸드 입점 전용</legend>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <input
                  type="checkbox"
                  checked={localFoodCertified}
                  onChange={(e) => setLocalFoodCertified(e.target.checked)}
                />
                로컬푸드 인증 상품으로 등록 (신뢰 지표·마크)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <input
                  type="checkbox"
                  checked={bundleOffer}
                  onChange={(e) => setBundleOffer(e.target.checked)}
                />
                묶음 상품
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <input type="checkbox" checked={preorder} onChange={(e) => setPreorder(e.target.checked)} />
                예약 판매
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <input
                  type="checkbox"
                  checked={subscription}
                  onChange={(e) => setSubscription(e.target.checked)}
                />
                정기 판매(구독) 안내
              </label>
            </fieldset>
          ) : (
            <p className="muted" style={{ fontSize: '0.72rem', marginTop: 10, lineHeight: 1.5 }}>
              로컬푸드점 입점 후 인증 마크·묶음·예약·정기 판매 옵션을 사용할 수 있습니다.
            </p>
          )}
          <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 12 }}>
            판매 등록 (농부들 탐색 연동)
          </button>
        </form>
      )}
      <style>{`
        .ms-inp {
          padding: 0.5rem 0.6rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          background: var(--color-bg-elevated);
          color: var(--color-text);
          box-sizing: border-box;
        }
      `}</style>
    </section>
  );
}
