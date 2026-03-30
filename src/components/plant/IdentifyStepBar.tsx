import type { IdentifyStep } from '../../types/plantIdentification';
import './plantComponents.css';

const STEPS: { key: IdentifyStep; label: string }[] = [
  { key: 'checking', label: '식물 여부' },
  { key: 'identifying', label: '이름 찾기' },
  { key: 'summarizing', label: '기본 정보' },
];

type Props = {
  step: IdentifyStep | null;
  taskId: string | null;
  busy: boolean;
};

function stepIndex(step: IdentifyStep | null): number {
  if (!step) return 0;
  const i = STEPS.findIndex((s) => s.key === step);
  return i >= 0 ? i + 1 : 0;
}

export function IdentifyStepBar({ step, taskId, busy }: Props) {
  const current = stepIndex(step);

  return (
    <div className="plant-steps" role="status" aria-live="polite" aria-atomic="true">
      {taskId ? (
        <p className="muted plant-steps__task" style={{ margin: '0 0 0.5rem', fontSize: '0.75rem' }}>
          작업 ID:{' '}
          <code title={taskId}>{taskId.slice(0, 8)}…</code>
        </p>
      ) : null}
      <ol className="plant-steps__list">
        {STEPS.map(({ key, label }, i) => {
          const n = i + 1;
          const isCurrent = busy && step === key;
          const isDone = busy && current > n;
          return (
            <li
              key={key}
              className={
                'plant-steps__item' +
                (isDone ? ' plant-steps__item--done' : '') +
                (isCurrent ? ' plant-steps__item--current' : '')
              }
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="plant-steps__num" aria-hidden>
                {n}
              </span>
              <span className="plant-steps__label">{label}</span>
            </li>
          );
        })}
      </ol>
      {busy && step ? (
        <p className="plant-steps__hint muted">
          {step === 'checking' && '식물 여부 확인 중…'}
          {step === 'identifying' && '식물 이름 찾는 중…'}
          {step === 'summarizing' && '기본 정보를 불러오는 중…'}
        </p>
      ) : null}
    </div>
  );
}
