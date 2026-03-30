import { useNavigate } from 'react-router-dom';
import '../../pages/HomePage.css';

const SYMPTOMS: { label: string; hint: string }[] = [
  { label: '잎이 노래요', hint: 'yellow' },
  { label: '반점이 있어요', hint: 'spots' },
  { label: '잎이 말라요', hint: 'dry' },
  { label: '줄기가 처져요', hint: 'wilt' },
];

export function SymptomQuickChips() {
  const navigate = useNavigate();

  return (
    <section className="home-quick-symptoms" aria-labelledby="symptoms-title">
      <h3 id="symptoms-title">많이 찾는 증상</h3>
      <div className="home-symptom-list">
        {SYMPTOMS.map((s) => (
          <button key={s.hint} type="button" onClick={() => navigate(`/diagnosis?hint=${s.hint}`)}>
            {s.label}
          </button>
        ))}
      </div>
    </section>
  );
}
