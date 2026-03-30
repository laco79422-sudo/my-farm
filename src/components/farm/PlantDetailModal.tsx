import type { DailyLogDoc, PlantDoc } from '../../types';
import { JournalTimeline } from './JournalTimeline';

interface Props {
  plant: PlantDoc | null;
  logs: DailyLogDoc[];
  onClose: () => void;
}

export function PlantDetailModal({ plant, logs, onClose }: Props) {
  if (!plant) return null;

  const filtered = logs.filter((l) => l.plantId === plant.plantId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.65)',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
          <h2 style={{ margin: 0 }}>{plant.name} 상세</h2>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            닫기
          </button>
        </div>
        {plant.latestPhotoUrl && (
          <img
            src={plant.latestPhotoUrl}
            alt=""
            style={{
              width: '100%',
              borderRadius: 'var(--radius-md)',
              marginTop: '1rem',
              maxHeight: 220,
              objectFit: 'cover',
            }}
          />
        )}
        <div style={{ marginTop: '1rem' }}>
          {filtered.length === 0 ? (
            <p className="muted">아직 등록된 생산일지가 없습니다. 매일 사진과 메모를 남겨 보세요.</p>
          ) : (
            <JournalTimeline logs={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}
