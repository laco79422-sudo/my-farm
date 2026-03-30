import { useMemo } from 'react';
import type { SalesRecord } from '../../types/farmHub';
import { getMarketplaceListings } from '../../stores/useFarmHubStore';
import { useFarmHubStore } from '../../stores/useFarmHubStore';
import './myFarm.css';

type Props = {
  ownerUid: string | null;
  sales: SalesRecord[];
  listingsTick: number;
};

export function SalesHistorySection({ ownerUid, sales, listingsTick }: Props) {
  const markSoldOut = useFarmHubStore((s) => s.markListingSoldOut);
  const mine = useMemo(() => {
    if (!ownerUid) return [];
    return getMarketplaceListings().filter((l) => l.ownerUid === ownerUid);
  }, [ownerUid, listingsTick]);

  return (
    <section className="my-farm-section" id="farm-sales">
      <h2 className="my-farm-section__title">SalesHistory · 판매 내역</h2>
      <p className="muted my-farm-section__lead">판매 중 · 품절 · 완료 기록입니다.</p>
      <h3 className="muted" style={{ fontSize: '0.8rem', margin: '0.75rem 0 0.35rem' }}>
        등록 상품
      </h3>
      {mine.length === 0 ? (
        <p className="muted" style={{ fontSize: '0.85rem' }}>
          등록된 상품이 없습니다.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {mine.map((l) => (
            <li key={l.id} className="card" style={{ padding: '0.65rem', marginBottom: 8 }}>
              <strong>{l.productName}</strong>{' '}
              <span className="chip" style={{ fontSize: '0.68rem' }}>
                {l.status === 'on_sale' ? '판매 중' : l.status === 'sold_out' ? '품절' : l.status}
              </span>
              <p className="muted" style={{ fontSize: '0.78rem', margin: '0.25rem 0 0' }}>
                {l.grams}g · {l.priceWon.toLocaleString()}원 · {l.city}/{l.district}
              </p>
              {l.status === 'on_sale' ? (
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ marginTop: 6, fontSize: '0.78rem' }}
                  onClick={() => markSoldOut(l.id)}
                >
                  판매 완료 처리
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <h3 className="muted" style={{ fontSize: '0.8rem', margin: '1rem 0 0.35rem' }}>
        완료 거래
      </h3>
      {sales.length === 0 ? (
        <p className="muted" style={{ fontSize: '0.85rem' }}>
          없음
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sales.map((s) => (
            <li key={s.id} className="muted" style={{ fontSize: '0.8rem', marginBottom: 6 }}>
              {s.completedAt.slice(0, 10)} · {s.grams}g · {s.priceWon.toLocaleString()}원
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
