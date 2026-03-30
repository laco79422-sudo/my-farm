import { useMemo, useState } from 'react';
import type { GrowPlant } from '../../types/farmHub';
import {
  getMarketplaceListings,
  useFarmHubStore,
} from '../../stores/useFarmHubStore';
import { useToastStore } from '../../stores/useToastStore';
import { buildAutoListingAfterHarvest } from '../../utils/autoPublishAfterHarvest';
import { canRegisterSale, MIN_SALE_REGISTER_GRAMS } from '../../utils/canRegisterSale';
import { getRemainingSellableForUi } from '../../utils/salesLimits';
import './myFarm.css';

type Props = {
  plants: GrowPlant[];
};

export function HarvestSection({ plants }: Props) {
  const completeHarvest = useFarmHubStore((s) => s.completeHarvest);
  const publishListing = useFarmHubStore((s) => s.publishListing);
  const profile = useFarmHubStore((s) => s.profile);
  const listingsTick = useFarmHubStore((s) => s.listingsTick);
  const showToast = useToastStore((s) => s.show);
  const [avgG, setAvgG] = useState(42);
  const [customGByPlant, setCustomGByPlant] = useState<Record<string, string>>({});

  const allListings = useMemo(() => getMarketplaceListings(), [listingsTick]);

  const growing = plants.filter((p) => p.status === 'growing' || p.status === 'harvest_ready');
  const harvested = plants.filter((p) => p.status === 'harvested');

  function tryPublish(plant: GrowPlant, grams: number) {
    const c = canRegisterSale(plant, grams);
    if (!c.ok) {
      showToast(c.message);
      return;
    }
    if (!profile?.city?.trim() || !profile?.district?.trim()) {
      showToast('농장 정보에서 시/도·구를 먼저 입력해 주세요.');
      return;
    }
    if (!profile.farmerName?.trim() || !profile.farmName?.trim()) {
      showToast('농장 정보에서 농장명·이름을 입력해 주세요.');
      return;
    }
    const r = publishListing({
      plantId: plant.id,
      farmerName: profile.farmerName,
      farmName: profile.farmName,
      city: profile.city,
      district: profile.district,
      productName: plant.name,
      grams,
      priceWon: Math.max(3000, Math.round(grams * 12)),
      growMethod: plant.growMethod,
      harvestDate: (plant.harvest?.harvestedAt ?? new Date().toISOString()).slice(0, 10),
      fulfillment: 'pickup',
    });
    if (r.ok) showToast(`${grams}g 판매 등록되었습니다.`);
    else showToast(r.error ?? '등록 실패');
  }

  function onCustomSubmit(plant: GrowPlant) {
    const raw = customGByPlant[plant.id] ?? '';
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      showToast('숫자를 입력해 주세요.');
      return;
    }
    tryPublish(plant, Math.round(n));
  }

  return (
    <section className="my-farm-section" id="farm-harvest">
      <h2 className="my-farm-section__title">Harvest · 수확</h2>
      <p className="muted my-farm-section__lead">
        상점에서 연결한 작물은 예상 수확 범위를 바탕으로 실제 수확량이 정해집니다. 판매는 실제 수확량 안에서만, 최소{' '}
        {MIN_SALE_REGISTER_GRAMS}g 단위로 등록할 수 있습니다.
      </p>

      <label className="muted" style={{ fontSize: '0.75rem' }}>
        (자유 재배 작물용) 종자 1단위당 평균 수확 무게(g) — 상품 연동 작물에는 사용되지 않습니다.
        <input
          type="number"
          min={5}
          className="harvest-inp"
          value={avgG}
          onChange={(e) => setAvgG(Number(e.target.value))}
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>

      {growing.length === 0 ? (
        <p className="muted" style={{ marginTop: 10 }}>
          수확할 재배 중 작물이 없습니다.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
          {growing.map((p) => {
            const hasRange = p.expectedYieldMinG != null && p.expectedYieldMaxG != null;
            return (
              <li key={p.id} className="card" style={{ padding: '0.75rem', marginBottom: 8 }}>
                <strong>{p.name}</strong>
                {hasRange ? (
                  <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.8rem' }}>
                    예상 수확량: {p.expectedYieldMinG}~{p.expectedYieldMaxG}g
                  </p>
                ) : (
                  <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.78rem' }}>
                    상점 상품 미연동 — 아래 평균 무게로 수확량을 계산합니다.
                  </p>
                )}
                <button
                  type="button"
                  className="btn btn--lime"
                  style={{ width: '100%', marginTop: 8 }}
                  onClick={() => {
                    const r = completeHarvest(p.id, avgG);
                    if (!r.ok) {
                      showToast(r.error ?? '실패');
                      return;
                    }
                    const hub = useFarmHubStore.getState();
                    const plant = hub.plants.find((x) => x.id === p.id);
                    if (!plant?.harvest) {
                      showToast('수확이 완료되었습니다.');
                      return;
                    }
                    const payload = buildAutoListingAfterHarvest(
                      plant,
                      hub.profile,
                      getMarketplaceListings(),
                    );
                    if (!payload) {
                      showToast(
                        '수확 완료. 농장 정보를 입력한 뒤 아래에서 판매를 등록하거나, 잔여가 200g 미만이면 자동 등록을 건너뜁니다.',
                      );
                      return;
                    }
                    const pub = hub.publishListing(payload);
                    if (pub.ok) {
                      showToast('수확 완료 · 200g 판매 글이 자동 등록되었습니다.');
                    } else {
                      showToast(
                        pub.error ??
                          '수확은 완료되었으나 자동 판매 등록에 실패했습니다. 아래에서 수동 등록하세요.',
                      );
                    }
                  }}
                >
                  수확 완료 처리
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {harvested.map((p) => {
        const remaining = getRemainingSellableForUi(p, allListings);
        const sold = p.soldTotalG ?? 0;
        const actual = p.actualHarvestTotalG ?? p.harvest?.totalGrams ?? null;
        const expectedTxt =
          p.expectedYieldMinG != null && p.expectedYieldMaxG != null
            ? `${p.expectedYieldMinG}~${p.expectedYieldMaxG}g`
            : '—';

        return (
          <div key={p.id} className="card" style={{ marginTop: 10, padding: '0.85rem' }}>
            <strong>{p.name}</strong>
            <span className="chip" style={{ marginLeft: 8, fontSize: '0.7rem' }}>
              {remaining <= 0 ? '품절' : '판매 가능'}
            </span>
            <ul className="muted" style={{ fontSize: '0.8rem', margin: '0.5rem 0 0', paddingLeft: '1.1rem' }}>
              <li>예상 수확량: {expectedTxt}</li>
              <li>실제 수확량: {actual != null ? `${Math.round(actual)}g` : '—'}</li>
              <li>판매 등록 완료: {Math.round(sold)}g</li>
              <li>
                남은 판매 가능량:{' '}
                <strong style={{ color: 'var(--color-mint)' }}>{Math.round(remaining)}g</strong>
              </li>
              <li>최소 판매 등록량: {MIN_SALE_REGISTER_GRAMS}g</li>
            </ul>
            {p.harvest ? (
              <p className="muted" style={{ fontSize: '0.72rem', margin: '0.5rem 0 0' }}>
                (참고) 일지·환경 기반 스냅샷 총중: {Math.round(p.harvest.totalGrams)}g
              </p>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              <button
                type="button"
                className="btn btn--primary"
                disabled={remaining < MIN_SALE_REGISTER_GRAMS}
                onClick={() => tryPublish(p, MIN_SALE_REGISTER_GRAMS)}
              >
                {MIN_SALE_REGISTER_GRAMS}g 판매 등록
              </button>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="number"
                  className="harvest-inp"
                  style={{ flex: 1, minWidth: 120 }}
                  min={MIN_SALE_REGISTER_GRAMS}
                  max={remaining}
                  placeholder={`${MIN_SALE_REGISTER_GRAMS}g ~ ${Math.round(remaining)}g`}
                  value={customGByPlant[p.id] ?? ''}
                  onChange={(e) =>
                    setCustomGByPlant((m) => ({ ...m, [p.id]: e.target.value }))
                  }
                  disabled={remaining < MIN_SALE_REGISTER_GRAMS}
                />
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={remaining < MIN_SALE_REGISTER_GRAMS}
                  onClick={() => onCustomSubmit(p)}
                >
                  직접 입력 등록
                </button>
              </div>
              {remaining <= 0 ? (
                <p className="muted" style={{ margin: 0, fontSize: '0.78rem' }}>
                  품절 — 추가 판매 등록이 불가합니다.
                </p>
              ) : null}
            </div>
          </div>
        );
      })}

      <style>{`
        .harvest-inp {
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
