import type { PlantDoc } from '../../types';
import { formatDateLabel } from '../../utils/format';

const STATUS_LABEL: Record<PlantDoc['status'], string> = {
  growing: '성장 중',
  ready: '수확 임박',
  harvested: '수확 완료',
};

interface Props {
  plant: PlantDoc;
  onOpen: (p: PlantDoc) => void;
}

export function PlantCard({ plant, onOpen }: Props) {
  return (
    <article className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => onOpen(plant)}
        style={{
          all: 'unset',
          cursor: 'pointer',
          display: 'block',
          width: '100%',
        }}
      >
        {plant.latestPhotoUrl && (
          <img
            src={plant.latestPhotoUrl}
            alt=""
            style={{ width: '100%', height: 160, objectFit: 'cover' }}
          />
        )}
        <div style={{ padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{plant.name}</h3>
            <span className="chip">{STATUS_LABEL[plant.status]}</span>
          </div>
          <p className="muted" style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
            시작 {formatDateLabel(String(plant.startedAt))} · 예상 수확{' '}
            {formatDateLabel(String(plant.expectedHarvestAt))}
          </p>
          <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
            예상 생산량 약 {plant.expectedYieldKg}kg
          </p>
        </div>
      </button>
    </article>
  );
}
