import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMarketplaceListings } from '../stores/useFarmHubStore';
import { useCartStore } from '../stores/useCartStore';
import { seedGlobalMarketIfEmpty } from '../data/seedMarketListings';
import { dummyCommunityPosts } from '../data/dummyCommunity';
import { MarketplaceProductCard } from '../components/farmers/MarketplaceProductCard';
import { marketListingToShopItem } from '../utils/marketListingCart';
import { useToastStore } from '../stores/useToastStore';
import { formatDateLabel } from '../utils/format';
import '../components/farmers/farmersMarket.css';

export function FarmerPublicProfilePage() {
  const { ownerUid } = useParams<{ ownerUid: string }>();
  const navigate = useNavigate();
  const add = useCartStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);

  seedGlobalMarketIfEmpty();
  const listings = useMemo(() => {
    if (!ownerUid) return [];
    return getMarketplaceListings().filter((l) => l.ownerUid === ownerUid);
  }, [ownerUid]);

  const farmerPosts = useMemo(
    () => dummyCommunityPosts.filter((p) => p.authorUid === ownerUid),
    [ownerUid],
  );

  const head = listings[0];

  if (!ownerUid) {
    return (
      <div className="page-shell">
        <p className="muted">잘못된 경로입니다.</p>
        <Link to="/farmers">농부들로</Link>
      </div>
    );
  }

  if (!head && listings.length === 0) {
    return (
      <div className="page-shell">
        <h1 className="section-title">농부 정보</h1>
        <p className="muted">이 농부의 등록 상품이 아직 없습니다.</p>
        <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
          이전으로
        </button>{' '}
        <Link to="/farmers" className="btn btn--primary" style={{ display: 'inline-block' }}>
          농부들 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell farmer-public-profile">
      <nav className="farmer-public-profile__crumb muted" aria-label="이동 경로">
        <Link to="/farmers">농부들</Link>
        <span aria-hidden> / </span>
        <span>{head.farmerName}</span>
      </nav>

      <header className="farmer-public-profile__head card">
        <h1 className="section-title" style={{ marginBottom: '0.35rem' }}>
          {head.farmerName}
        </h1>
        <p className="muted" style={{ margin: 0 }}>
          {head.farmName} · {head.city} {head.district}
        </p>
        <p className="farmer-public-profile__flow muted" style={{ marginTop: '0.85rem', fontSize: '0.85rem' }}>
          <strong style={{ color: 'var(--color-mint)' }}>구매 흐름</strong> — 상품 확인 → 아래 후기·질문으로 신뢰 확인 →
          장바구니에 담기
        </p>
      </header>

      <section style={{ marginTop: '1.25rem' }}>
        <h2 className="farmer-public-profile__h2">판매 상품</h2>
        <div className="grid-cards cols-3" style={{ marginTop: '0.75rem' }}>
          {listings.map((l) => (
            <div key={l.id} className="farmer-public-profile__product">
              <MarketplaceProductCard listing={l} linkToProfile={false} />
              <button
                type="button"
                className="btn btn--primary farmer-public-profile__add"
                disabled={l.status !== 'on_sale'}
                onClick={() => {
                  add(marketListingToShopItem(l));
                  showToast('장바구니에 담았습니다.');
                }}
              >
                {l.status === 'on_sale' ? '장바구니에 담기' : '품절'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="farmer-public-profile__community card" style={{ marginTop: '1.5rem' }}>
        <h2 className="farmer-public-profile__h2">커뮤니티 · 후기·질문</h2>
        <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
          이 농부가 남긴 글입니다. 전체 소통은 농부들 &gt; 커뮤니티 탭에서 이어갈 수 있어요.
        </p>
        {farmerPosts.length > 0 ? (
          <ul className="farmer-public-profile__post-list">
            {farmerPosts.map((p) => (
              <li key={p.postId}>
                <span className="chip">{p.category}</span>
                <strong>{p.title}</strong>
                <span className="muted"> · {formatDateLabel(String(p.createdAt))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            아직 이 농부의 글이 없습니다.
          </p>
        )}
        <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link to="/farmers?tab=community" className="btn btn--ghost">
            커뮤니티 전체 보기
          </Link>
          <Link to="/cart" className="btn btn--primary">
            장바구니로 이동
          </Link>
        </div>
      </section>
    </div>
  );
}
