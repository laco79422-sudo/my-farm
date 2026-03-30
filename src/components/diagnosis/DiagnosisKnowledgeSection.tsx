import type { DiagnosisResult } from '../../types/diagnosisResult';

type Props = {
  result: DiagnosisResult;
};

/** 진단 결과 화면에서 병충해·영양·도감 안내 (별도 메뉴 없이 요약) */
export function DiagnosisKnowledgeSection({ result }: Props) {
  const plant = result.plantName || '작물';

  return (
    <section className="diag-know" aria-labelledby="diag-know-title">
      <h2 id="diag-know-title" className="diag-know__main-title">
        더 알아보기
      </h2>
      <p className="muted diag-know__lead">
        병충해·영양결핍·작물 정보는 진단 결과와 함께 이곳에서 요약해 드립니다.
      </p>

      <article className="diag-know__card" id="diag-know-pest">
        <h3 className="diag-know__title">병충해</h3>
        <p className="diag-know__body">
          {result.detailHint === 'pest'
            ? `${plant}에서 병해·충해 가능성이 제기되었습니다. 잎·줄기의 반점, 곰팡이, 벌레 자국을 며칠간 관찰하고, 주변 작물로의 확산을 막기 위해 격리·환기를 우선하세요.`
            : `${plant} 기준 일반 병충해 예방: 과습·밀식을 피하고, 아침에 잎에 물이 마르도록 환기하며, 이상 증상이 보이면 해당 부위만 먼저 제거합니다.`}
        </p>
      </article>

      <article className="diag-know__card" id="diag-know-nutrient">
        <h3 className="diag-know__title">영양결핍</h3>
        <p className="diag-know__body">
          {result.detailHint === 'nutrient'
            ? `영양 불균형이 의심됩니다. 잎색·맥·신장 부위를 기준으로 N(질소)·P·K·미량원소 중 무엇이 부족한지 구분한 뒤, 묽게 여러 번 나누어 시비하는 편이 안전합니다.`
            : `${plant} 재배 시 흔한 결핍: 하엽 황화는 질소·마그네슘, 맥 사이 황백은 마그네슘, 신장 굴곡·착색은 칼슘·붕소 등을 의심합니다. 진단 사진과 함께 단계적으로 시비량을 조절해 보세요.`}
        </p>
      </article>

      <article className="diag-know__card" id="diag-know-encyclo">
        <h3 className="diag-know__title">작물 도감</h3>
        <p className="diag-know__body">
          <strong>{plant}</strong>은(는) 광량·급수·배지/토양 EC에 따라 생장 속도가 달라집니다. 수확 목적이면 생육 단계별(발아→본엽→채대) 맞춤 급액과 간격을 기록해 두면 다음 작기에 그대로 재사용할 수 있습니다.
        </p>
      </article>

      <style>{`
        .diag-know {
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
        }
        .diag-know__main-title {
          margin: 0 0 0.35rem;
          font-size: 1rem;
          font-weight: 800;
        }
        .diag-know__lead {
          margin: 0 0 1rem;
          font-size: 0.85rem;
          line-height: 1.5;
        }
        .diag-know__card {
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          background: var(--color-bg-elevated);
          padding: 0.75rem 0.9rem;
          margin-bottom: 0.65rem;
        }
        .diag-know__title {
          margin: 0 0 0.35rem;
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--color-mint);
        }
        .diag-know__body {
          margin: 0;
          font-size: 0.82rem;
          line-height: 1.55;
          color: var(--color-text-muted);
        }
      `}</style>
    </section>
  );
}
