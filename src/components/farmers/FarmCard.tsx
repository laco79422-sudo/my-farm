import type { FarmerFarmCard } from '../../types';
import { formatDateLabel } from '../../utils/format';
import './FarmCard.css';

interface Props {
  farm: FarmerFarmCard;
  onSelect: (f: FarmerFarmCard) => void;
}

export function FarmCard({ farm, onSelect }: Props) {
  return (
    <article className="farm-card">
      <div className="farm-card__media">
        <img className="farm-card__img" src={farm.coverImageUrl} alt="" />
        <div className="farm-card__overlay">
          <button
            type="button"
            className="farm-card__detail-btn"
            onClick={() => onSelect(farm)}
          >
            상세보기
          </button>
        </div>
      </div>
      <div className="farm-card__body">
        <h3 className="farm-card__title">{farm.farmName}</h3>
        <p className="farm-card__meta">대표 작물: {farm.representativeCrop}</p>
        <p className="farm-card__foot">
          재배 중 {farm.activePlantCount}종 · 최근 활동 {formatDateLabel(farm.lastActivityAt)}
        </p>
      </div>
    </article>
  );
}
