import type { PlantIdentifyResult } from '../../types/plantIdentification';
import { UnlockDiagnosisButton } from '../reward/UnlockDiagnosisButton';
import './plantComponents.css';

type Props = {
  result: PlantIdentifyResult;
  /** 광고 모달 열기 (+ 진단 요청은 상위에서 분기) */
  onUnlock: () => void;
  unlockLoading?: boolean;
  unlockDisabled?: boolean;
  /** 진단 결과가 잠긴 채로만 있을 때: 모달만 다시 열기 */
  hasLockedDiagnosis?: boolean;
  /** 잠금 해제 완료 후 버튼 숨김 */
  hideUnlockButton?: boolean;
};

export function PlantIdentifyResultCard({
  result,
  onUnlock,
  unlockLoading,
  unlockDisabled,
  hasLockedDiagnosis,
  hideUnlockButton,
}: Props) {
  const pct = Math.round(result.confidence * 100);

  const label = hasLockedDiagnosis ? '광고 시청 후 전체 결과 보기' : '광고 보고 진단 열기';

  return (
    <article className="plant-id-card card">
      <p className="chip" style={{ marginBottom: '0.75rem' }}>
        식물 이름 찾기 결과 (참고용)
      </p>
      <h2 className="plant-id-card__title">{result.plantName}</h2>
      <p className="muted plant-id-card__sci">{result.scientificName}</p>
      <p className="muted" style={{ margin: '0.75rem 0', lineHeight: 1.55 }}>
        {result.summary}
      </p>
      <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
        일치 추정 <strong style={{ color: 'var(--color-mint)' }}>{pct}%</strong>
      </p>
      {result.similarPlants.length > 0 ? (
        <div className="plant-id-card__similar">
          <h3 className="plant-id-card__h3">유사 식물 후보</h3>
          <ul>
            {result.similarPlants.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasLockedDiagnosis ? (
        <p className="muted" style={{ margin: '1rem 0 0', fontSize: '0.85rem', lineHeight: 1.5 }}>
          아래 병충해 분석은 일부만 무료로 보여 드려요. 광고를 시청하면 후보 전체·관리 방법을 열 수 있어요.
        </p>
      ) : null}

      {!hideUnlockButton ? (
        <UnlockDiagnosisButton
          onClick={onUnlock}
          disabled={unlockDisabled}
          loading={unlockLoading}
          label={label}
        />
      ) : null}
    </article>
  );
}
