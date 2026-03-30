import { Link } from 'react-router-dom';
import type { FarmDiagnosisRecord } from '../../types/farmDiagnosisRecord';
import { Card } from '../common/Card';
import { formatDateLabel } from '../../utils/format';

type Props = {
  record: FarmDiagnosisRecord;
};

export function FarmRecordCard({ record }: Props) {
  return (
    <Card
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'stretch',
        padding: '1rem',
      }}
    >
      <img
        src={record.imageUrl}
        alt=""
        style={{
          width: 88,
          height: 88,
          objectFit: 'cover',
          borderRadius: 'var(--radius-sm)',
          flexShrink: 0,
          border: '1px solid var(--color-border)',
        }}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <strong style={{ fontSize: '1.05rem' }}>{record.plantName}</strong>
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.45 }}>
          최근 진단: {record.status}
        </p>
        <p className="muted" style={{ margin: 0, fontSize: '0.78rem' }}>
          저장 {formatDateLabel(record.savedAt)}
        </p>
        <Link
          to={`/my-farm/${record.id}`}
          className="btn btn--ghost"
          style={{
            marginTop: 8,
            display: 'block',
            textAlign: 'center',
            textDecoration: 'none',
          }}
        >
          상세 보기
        </Link>
      </div>
    </Card>
  );
}
