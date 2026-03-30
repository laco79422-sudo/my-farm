import { Link } from 'react-router-dom';
import type { FarmerTierLevel, MarketListing } from '../../types/farmHub';
import './farmersMarket.css';

type Props = {
  listing: MarketListing;
  distanceLabel?: string;
  /** false이면 카드가 프로필로 링크되지 않습니다 (프로필 페이지 내 상품 등) */
  linkToProfile?: boolean;
};

export function MarketplaceProductCard({
  listing,
  distanceLabel,
  linkToProfile = true,
}: Props) {
  const t = listing.trust;
  const grade =
    listing.farmerTierAtListing != null
      ? tierLabelKo(listing.farmerTierAtListing)
      : t?.farmerGradeLabel;
  const extras = [listing.bundleOffer && '묶음', listing.preorder && '예약', listing.subscription && '정기']
    .filter(Boolean)
    .join(' · ');

  const body = (
    <>
      {listing.localFoodCertified ? (
        <div className="mp-card__lf-ribbon" title="로컬푸드 인증">
          로컬푸드
        </div>
      ) : null}
      {listing.imageDataUrl ? (
        <img src={listing.imageDataUrl} alt="" className="mp-card__img" />
      ) : (
        <div className="mp-card__ph" aria-hidden>
          🌱
        </div>
      )}
      <div className="mp-card__body">
        <h3 className="mp-card__title">{listing.productName}</h3>
        <p className="mp-card__meta muted">
          {listing.grams}g · {listing.priceWon.toLocaleString('ko-KR')}원
        </p>
        <p className="mp-card__meta muted">
          {listing.farmerName} · {listing.city} {listing.district}
          {distanceLabel ? ` · ${distanceLabel}` : null}
        </p>
        {grade ? (
          <p className="mp-card__grade muted">농부 등급: {grade}</p>
        ) : null}
        {t ? (
          <p className="mp-card__trust muted">
            신뢰 · 기록 {pct(t.logRate)} · 생존 {pct(t.survivalRateAvg)} · 후기 {t.reviewAvg.toFixed(1)} ·
            판매 {pct(t.salesSuccessRate)}
            {t.exposureBoost < 0.999 ? ` · 노출 ${pct(t.exposureBoost)}` : null}
          </p>
        ) : null}
        {extras ? (
          <p className="mp-card__extras muted" style={{ fontSize: '0.72rem', margin: 0 }}>
            {extras}
          </p>
        ) : null}
        <p className="mp-card__badge">
          {listing.growMethod === 'hydro' ? '수경' : '토양'} ·{' '}
          {listing.fulfillment === 'pickup' ? '직접' : '배송'} ·{' '}
          {listing.status === 'on_sale' ? '판매중' : '품절'}
        </p>
        {linkToProfile ? (
          <p className="mp-card__flow-hint" aria-hidden>
            프로필 · 후기 확인 →
          </p>
        ) : null}
      </div>
    </>
  );

  if (linkToProfile) {
    return (
      <Link
        to={`/farmers/f/${listing.ownerUid}`}
        className="mp-card mp-card--link"
        aria-label={`${listing.farmerName} 농부 프로필 및 ${listing.productName}`}
      >
        {body}
      </Link>
    );
  }

  return <article className="mp-card">{body}</article>;
}

function pct(x: number): string {
  return `${Math.round(Math.min(1, Math.max(0, x)) * 100)}%`;
}

function tierLabelKo(tier: FarmerTierLevel): string {
  if (tier === 'local_vendor') return '로컬푸드 입점';
  if (tier === 'growth') return '성장 농부';
  return '일반 농부';
}
