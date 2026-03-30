import type { DiagnosisPipelineResult } from '../../types/diagnosisAnalysis';
import './DiagnosisPipelineResultCard.css';

type Props = {
  result: DiagnosisPipelineResult;
  previewUrl: string;
  /** true: 병해 일부·관리 요약만, 나머지 잠금 UI */
  locked?: boolean;
};

const PREVIEW_SYMPTOM_LEN = 110;

export function DiagnosisPipelineResultCard({ result, previewUrl, locked }: Props) {
  const img = previewUrl || result.imageUrl;
  const firstPest = result.diseaseCandidates[0];
  const restPests = result.diseaseCandidates.slice(1);
  const symptomPreview =
    locked && result.symptomDescription.length > PREVIEW_SYMPTOM_LEN
      ? `${result.symptomDescription.slice(0, PREVIEW_SYMPTOM_LEN)}…`
      : result.symptomDescription;

  return (
    <article className={'diag-result-card card' + (locked ? ' diag-result-card--locked' : '')}>
      <p className="chip" style={{ marginBottom: '0.75rem' }}>
        {locked ? '미리보기 · 광고 시청 후 전체 공개' : '병충해·영양결핍 진단 (참고용 · 확정 진단이 아닙니다)'}
      </p>
      <div className="diag-result-card__grid">
        {img ? (
          <img
            src={img}
            alt="분석에 사용한 이미지"
            className="diag-result-card__img"
          />
        ) : null}
        <div>
          <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.2rem' }}>{result.plantType}</h2>
          {result.scientificName ? (
            <p className="muted" style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontStyle: 'italic' }}>
              {result.scientificName}
            </p>
          ) : null}
          {result.oneLineSummary ? (
            <p className="muted" style={{ margin: '0 0 0.75rem', lineHeight: 1.55 }}>
              {result.oneLineSummary}
            </p>
          ) : null}
          <p className="muted" style={{ marginBottom: '0.75rem' }}>
            종합 신뢰도:{' '}
            <strong style={{ color: 'var(--color-mint)' }}>{result.confidence}%</strong>
          </p>

          {result.basicFeatures ? (
            <>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.35rem' }}>기본 특징</h3>
              <p className="muted" style={{ margin: '0 0 0.85rem' }}>
                {locked ? `${result.basicFeatures.slice(0, 80)}${result.basicFeatures.length > 80 ? '…' : ''}` : result.basicFeatures}
              </p>
            </>
          ) : null}

          {result.beginnerTips && result.beginnerTips.length > 0 ? (
            <>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.35rem' }}>초보자용 간단 관리 팁</h3>
              {locked ? (
                <p className="muted" style={{ margin: '0 0 0.85rem' }}>
                  {result.beginnerTips[0]}
                  {result.beginnerTips.length > 1 ? (
                    <span className="diag-result-card__blur-inline"> 외 {result.beginnerTips.length - 1}개</span>
                  ) : null}
                </p>
              ) : (
                <ul style={{ margin: '0 0 0.85rem', paddingLeft: '1.1rem' }}>
                  {result.beginnerTips.map((t) => (
                    <li key={t} className="muted" style={{ marginBottom: 4 }}>
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : null}

          <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.35rem' }}>병해·생리 후보</h3>
          <ul style={{ margin: '0 0 0.85rem', paddingLeft: '1.1rem' }}>
            {firstPest ? (
              <li style={{ marginBottom: 4 }}>
                {firstPest.name} <span className="muted">— {firstPest.confidence}%</span>
              </li>
            ) : null}
            {locked && restPests.length > 0 ? (
              <li className="muted diag-result-card__masked" aria-hidden>
                + {restPests.length}개 후보 잠김
              </li>
            ) : null}
            {!locked
              ? restPests.map((p) => (
                  <li key={p.name} style={{ marginBottom: 4 }}>
                    {p.name} <span className="muted">— {p.confidence}%</span>
                  </li>
                ))
              : null}
          </ul>

          <h3 style={{ fontSize: '0.95rem', margin: '1rem 0 0.35rem' }}>증상 설명</h3>
          <p className="muted" style={{ margin: '0 0 0.85rem' }}>
            {locked ? symptomPreview : result.symptomDescription}
          </p>

          <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.35rem' }}>관리·조치 가이드</h3>
          {locked ? (
            <div className="diag-result-card__lock-box">
              <p className="muted" style={{ margin: 0 }}>
                🔒 광고 시청 후 해결 방법·관리 방법 전체를 확인할 수 있습니다.
              </p>
            </div>
          ) : (
            <p className="muted" style={{ margin: 0 }}>
              {result.careGuide}
            </p>
          )}
        </div>
      </div>
      {locked ? <div className="diag-result-card__veil" aria-hidden /> : null}
    </article>
  );
}
