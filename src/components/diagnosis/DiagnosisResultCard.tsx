import type { DiagnosisResult } from '../../types/diagnosisResult';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

type Props = {
  result: DiagnosisResult;
  imageUrl: string | null;
};

export function DiagnosisResultCard({ result, imageUrl }: Props) {
  const pct = Math.round(result.confidence * 100);

  return (
    <Card style={{ padding: 'clamp(1rem, 3vw, 1.35rem)' }}>
      <Badge style={{ marginBottom: '0.85rem', display: 'inline-block' }}>
        AI 예측 결과이며 참고용입니다. 필요 시 추가 진단을 진행하세요.
      </Badge>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          style={{
            width: '100%',
            maxHeight: 240,
            objectFit: 'cover',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            marginBottom: '1rem',
          }}
        />
      ) : null}

      <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
        {result.plantName}
        <span className="muted" style={{ fontSize: '0.82rem', fontWeight: 500, marginLeft: 8 }}>
          (추정)
        </span>
      </h2>

      <p style={{ margin: '0 0 1rem', fontSize: '1.02rem', fontWeight: 600, color: 'var(--color-mint)' }}>
        {result.status}
      </p>

      <section style={{ marginBottom: '1rem' }}>
        <h3 className="muted" style={{ fontSize: '0.78rem', margin: '0 0 0.45rem', fontWeight: 700 }}>
          원인 후보
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.55, fontSize: '0.9rem' }}>
          {result.causes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h3 className="muted" style={{ fontSize: '0.78rem', margin: '0 0 0.45rem', fontWeight: 700 }}>
          해결 방법
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.55, fontSize: '0.9rem' }}>
          {result.solutions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
        참고 신뢰도: <strong style={{ color: 'var(--color-text)' }}>{pct}%</strong>
      </p>
    </Card>
  );
}
