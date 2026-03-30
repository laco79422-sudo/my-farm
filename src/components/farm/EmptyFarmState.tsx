import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

export function EmptyFarmState() {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ marginTop: '1.5rem', textAlign: 'center', padding: '2.5rem 1rem' }}>
      <div style={{ fontSize: '2.75rem', marginBottom: '0.5rem' }} aria-hidden>
        🌾
      </div>
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.12rem' }}>아직 저장된 진단 기록이 없습니다.</h2>
      <p className="muted" style={{ maxWidth: 400, margin: '0 auto 1.1rem', fontSize: '0.88rem', lineHeight: 1.5 }}>
        사진으로 진단한 뒤 저장하면 여기에서 모아볼 수 있습니다.
      </p>
      <Button variant="primary" onClick={() => navigate('/')}>
        첫 진단 해보기
      </Button>
    </div>
  );
}
