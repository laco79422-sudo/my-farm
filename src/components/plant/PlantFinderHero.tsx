import { CameraEntryButton } from './CameraEntryButton';
import './plantComponents.css';

type Props = {
  /** 홈 카드 id (스크롤 앵커) */
  sectionId?: string;
};

export function PlantFinderHero({ sectionId = 'plant-finder-card' }: Props) {
  return (
    <section className="home-diagnosis-card" id={sectionId} aria-labelledby="plant-finder-title">
      <div className="home-badge">비회원 즉시 이용 가능</div>
      <h2 id="plant-finder-title">사진을 찍으면 식물의 이름을 알려줍니다</h2>
      <p>
        가입 없이 사진 한 장으로 식물 이름과 기본 정보를 먼저 확인하고,
        <br />
        필요하면 병충해 진단까지 이어서 진행할 수 있습니다.
      </p>
      <CameraEntryButton variant="inline-primary" />
      <CameraEntryButton variant="inline-secondary" />
      <div className="home-sub-links">
        <a href="#plant-finder-examples">식물 찾기 예시 보기</a>
        <a
          href="#home-login-cta"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('home-login-cta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        >
          이용방법
        </a>
      </div>
    </section>
  );
}
