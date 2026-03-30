import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { useToastStore } from '../../stores/useToastStore';
import { getRecommendedSeedsForDiagnosis } from '../../data/recommendedCatalog';
import { usePointPurchaseFlow } from '../../hooks/usePointPurchaseFlow';
import { RewardAdModal } from '../reward/RewardAdModal';
import { POINT_RULES } from '../../services/pointService';
import { SHOP_IMAGE_FALLBACK } from '../../data/seedCatalog';
import type { ShopItem } from '../../types';
import './DiagnosisRecommendedSeeds.css';

type Props = {
  plantName?: string;
  detailHint?: 'pest' | 'nutrient' | 'normal';
  status?: string;
  maxItems?: number;
};

function SeedDiagnosisCard({
  item,
  onBuy,
  onAddCart,
  onAddAndGrow,
}: {
  item: ShopItem;
  onBuy: () => void;
  onAddCart: () => void;
  onAddAndGrow: () => void;
}) {
  const uiTags = item.recommendUiTags ?? [];
  const isKit = item.category === '키트';

  return (
    <article className="diag-seed-card">
      <div className="diag-seed-card__media">
        <img
          src={item.imageUrl || SHOP_IMAGE_FALLBACK}
          alt=""
          className="diag-seed-card__img"
          loading="lazy"
        />
        <span className="diag-seed-card__kind">{isKit ? '키트' : '씨앗'}</span>
      </div>
      <div className="diag-seed-card__body">
        <h3 className="diag-seed-card__title">{item.name}</h3>

        {item.difficultyLabel || item.difficulty ? (
          <p className="diag-seed-card__diff">
            <span className="diag-seed-card__diff-label">난이도</span>
            {item.difficultyLabel ?? item.difficulty}
          </p>
        ) : null}

        {uiTags.length > 0 ? (
          <ul className="diag-seed-card__tags" aria-label="추천 태그">
            {uiTags.map((t) => (
              <li key={t} className="diag-seed-card__tag">
                {t}
              </li>
            ))}
          </ul>
        ) : null}

        <dl className="diag-seed-card__meta">
          <div>
            <dt>발아</dt>
            <dd>{item.germinationPeriod ?? '—'}</dd>
          </div>
          <div>
            <dt>수확·채취</dt>
            <dd>{item.harvestPeriod ?? '—'}</dd>
          </div>
          <div>
            <dt>적정 온도</dt>
            <dd>{item.optimalTemperature ?? '—'}</dd>
          </div>
          <div className="diag-seed-card__meta-row--wide">
            <dt>추천 재배</dt>
            <dd>{item.recommendedGrowMethod ?? '—'}</dd>
          </div>
          <div>
            <dt>예상 수확</dt>
            <dd>{item.expectedYieldGrams ?? item.expectedYield ?? '—'}</dd>
          </div>
        </dl>

        {item.kitIncludes ? (
          <p className="diag-seed-card__kit muted">포함: {item.kitIncludes}</p>
        ) : null}

        <p className="diag-seed-card__price">
          {item.pricePoints.toLocaleString('ko-KR')}
          <span className="diag-seed-card__price-unit">P</span>
        </p>

        <div className="diag-seed-card__actions">
          <button type="button" className="btn btn--primary" onClick={onBuy}>
            포인트로 담기
          </button>
          <button type="button" className="btn btn--ghost" onClick={onAddCart}>
            장바구니
          </button>
          <button type="button" className="btn btn--secondary diag-seed-card__grow" onClick={onAddAndGrow}>
            담고 재배 시작
          </button>
        </div>
      </div>
    </article>
  );
}

export function DiagnosisRecommendedSeeds({
  plantName,
  detailHint,
  status,
  maxItems = 3,
}: Props) {
  const navigate = useNavigate();
  const add = useCartStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);
  const { adOpen, setAdOpen, tryBuyWithPoints, handleAdCompleted } = usePointPurchaseFlow();

  const items = useMemo(
    () =>
      getRecommendedSeedsForDiagnosis({
        plantName,
        detailHint,
        status,
        limit: maxItems,
      }),
    [plantName, detailHint, status, maxItems],
  );

  if (items.length === 0) return null;

  const addAndGrow = (item: ShopItem) => {
    add(item);
    showToast(`${item.name}을(를) 담았습니다. 재배 정보를 채워 주세요.`);
    navigate('/my-farm', {
      state: {
        prefillCropName: item.growStartPresetName ?? item.name.replace(/\s*씨앗\s*$/, '').replace(/\s*키트\s*$/, ''),
        prefillProductId:
          item.expectedYieldMinG != null && item.expectedYieldMaxG != null ? item.id : undefined,
        scrollToGrow: true,
      },
    });
  };

  return (
    <section className="diag-seed-section" aria-labelledby="diag-seed-title">
      <h2 id="diag-seed-title" className="diag-seed-section__title">
        진단에 맞는 추천 씨앗·키트
      </h2>
      <p className="diag-seed-section__sub muted">
        포인트로 담은 뒤 바로 재배를 시작할 수 있습니다. 초보는 상추·새싹·스타터 키트부터 추천합니다.
      </p>

      <div className="diag-seed-section__grid">
        {items.map((item) => (
          <SeedDiagnosisCard
            key={item.id}
            item={item}
            onBuy={() =>
              tryBuyWithPoints(item, () => {
                add(item);
                showToast(`${item.name}을(를) 장바구니에 담았습니다.`);
              })
            }
            onAddCart={() => {
              add(item);
              showToast('장바구니에 추가했습니다.');
            }}
            onAddAndGrow={() =>
              tryBuyWithPoints(item, () => {
                addAndGrow(item);
              })
            }
          />
        ))}
      </div>

      <p className="diag-seed-section__foot muted">
        <button type="button" className="diag-seed-section__link" onClick={() => navigate('/shop?cat=씨앗')}>
          상점에서 씨앗 전체 보기
        </button>
        {' · '}
        <button type="button" className="diag-seed-section__link" onClick={() => navigate('/shop?cat=키트')}>
          스타터 키트 보기
        </button>
      </p>

      <RewardAdModal
        open={adOpen}
        onClose={() => setAdOpen(false)}
        onAdCompleted={() => {
          void handleAdCompleted().then(() => {
            showToast(`광고 시청 완료 · +${POINT_RULES.rewardAd}P (연동 시 적립)`);
          });
        }}
        adReady
      />
    </section>
  );
}
