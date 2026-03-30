import './FlowSteps.css';

const STEPS = [
  { icon: '📷', title: '사진 업로드 또는 촬영', desc: '잎·줄기·열매가 선명하게 보이게 촬영합니다.' },
  { icon: '🌿', title: '식물/작물 이름 확인', desc: '품종 추정과 함께 기본 정보를 확인합니다.' },
  { icon: '🔬', title: '병충해 진단 결과', desc: '후보 TOP3와 신뢰도, 증상 설명을 제공합니다.' },
  { icon: '📝', title: '내 농장 일지 기록', desc: '날짜별 사진·메모로 성장 타임라인을 남깁니다.' },
  { icon: '✦', title: '포인트 획득', desc: '일지·진단·커뮤니티 활동으로 포인트를 모읍니다.' },
];

/** 홈 — 이용방법(서비스 흐름) 강조 섹션 */
export function FlowSteps() {
  return (
    <section id="how" className="flow-section" aria-labelledby="how-heading">
      <span className="flow-section__eyebrow">이용방법 · 5단계</span>
      <h2 id="how-heading" className="flow-section__title">
        처음 오셔도 바로 따라 할 수 있는 흐름
      </h2>
      <p className="flow-section__lead">
        <strong style={{ color: 'var(--color-text)' }}>사진 → 이름 → 병해충 → 일지 → 포인트</strong> 순서로 진행됩니다.
        아래 카드를 위에서부터 읽으면 서비스 구조를 3초 안에 파악할 수 있어요.
      </p>

      <div className="flow-steps">
        {STEPS.map((s, i) => (
          <article key={s.title} className="flow-step">
            <span className="flow-step__num">{i + 1}</span>
            <div className="flow-step__icon" aria-hidden>
              {s.icon}
            </div>
            <h3 className="flow-step__title">{s.title}</h3>
            <p className="flow-step__desc">{s.desc}</p>
          </article>
        ))}
      </div>

      <p className="flow-section__hint">
        <strong>팁:</strong> 식물 진단은 홈 상단 배너나 메뉴의 <strong>식물 진단소</strong>에서 언제든 다시 실행할 수
        있습니다. 진단 후에는 같은 사진으로 생산일지에 남겨 두면 나중에 비교하기 좋아요.
      </p>
    </section>
  );
}
