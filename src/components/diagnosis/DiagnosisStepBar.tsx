import type { AnalysisStatus } from '../../types/diagnosisAnalysis';
import './DiagnosisStepBar.css';

const LABELS = ['업로드', '식물 여부', '식물 종류', '병해·영양', '결과'] as const;

function stepFromStatus(status: AnalysisStatus): number {
  switch (status) {
    case 'uploading':
      return 1;
    case 'checking':
      return 2;
    case 'identifying':
      return 3;
    case 'diagnosing':
      return 4;
    case 'done':
      return 5;
    default:
      return 0;
  }
}

type Props = {
  status: AnalysisStatus;
  taskId: string | null;
};

export function DiagnosisStepBar({ status, taskId }: Props) {
  const current = stepFromStatus(status);
  const busy = current >= 1 && current <= 4 && status !== 'done' && status !== 'error';

  return (
    <div className="diag-steps" role="status" aria-live="polite" aria-atomic="true" aria-label="분석 진행 단계">
      {taskId ? (
        <p className="diag-steps__task muted" style={{ margin: '0 0 0.5rem', fontSize: '0.75rem' }}>
          작업 ID:{' '}
          <code className="diag-steps__code" title={taskId}>
            {taskId.slice(0, 8)}…
          </code>
        </p>
      ) : null}
      <ol className="diag-steps__list">
        {LABELS.map((label, i) => {
          const n = i + 1;
          const isDone = status === 'done' || current > n;
          const isCurrent = status === 'done' ? n === 5 : current === n && current > 0;
          return (
            <li
              key={label}
              className={
                'diag-steps__item' +
                (isDone ? ' diag-steps__item--done' : '') +
                (isCurrent ? ' diag-steps__item--current' : '')
              }
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="diag-steps__num" aria-hidden>
                {n}
              </span>
              <span className="diag-steps__label">{label}</span>
            </li>
          );
        })}
      </ol>
      {busy ? (
        <p className="diag-steps__hint muted" style={{ margin: '0.75rem 0 0', fontSize: '0.85rem' }}>
          {status === 'uploading' && '이미지를 준비하는 중…'}
          {status === 'checking' && '식물 이미지인지 확인하는 중…'}
          {status === 'identifying' && '식물 종류를 인식하는 중…'}
          {status === 'diagnosing' && '병해·영양결핍 후보를 분석하는 중…'}
        </p>
      ) : null}
    </div>
  );
}
