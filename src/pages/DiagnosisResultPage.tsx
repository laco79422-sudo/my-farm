import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiagnosisResultCard } from '../components/diagnosis/DiagnosisResultCard';
import { DiagnosisKnowledgeSection } from '../components/diagnosis/DiagnosisKnowledgeSection';
import { RecommendedProducts } from '../components/shop/RecommendedProducts';
import { DiagnosisRecommendedSeeds } from '../components/shop/DiagnosisRecommendedSeeds';
import { SaveResultButton } from '../components/diagnosis/SaveResultButton';
import { Button } from '../components/common/Button';
import { useDiagnosisStore } from '../stores/useDiagnosisStore';
import { useFarmStore } from '../stores/useFarmStore';

export function DiagnosisResultPage() {
  const navigate = useNavigate();
  const result = useDiagnosisStore((s) => s.diagnosisResult);
  const previewDataUrl = useDiagnosisStore((s) => s.previewDataUrl);
  const uploadedImageObjectUrl = useDiagnosisStore((s) => s.uploadedImageObjectUrl);
  const hydrateFromStorage = useDiagnosisStore((s) => s.hydrateFromStorage);
  const reset = useDiagnosisStore((s) => s.reset);
  const saveError = useFarmStore((s) => s.saveError);

  useEffect(() => {
    hydrateFromStorage();
    useFarmStore.getState().setSaveError(null);
  }, [hydrateFromStorage]);

  const imageUrl = previewDataUrl ?? uploadedImageObjectUrl;
  const imageForSave = previewDataUrl ?? uploadedImageObjectUrl;

  if (!result) {
    return (
      <div className="page-shell">
        <h1 className="section-title">진단 결과</h1>
        <p className="muted">표시할 진단 결과가 없습니다. 먼저 사진을 올려 진단을 진행해 주세요.</p>
        <Button variant="primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
          홈에서 사진 촬영하기
        </Button>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <h1 className="section-title">진단 결과</h1>

      <DiagnosisResultCard result={result} imageUrl={imageUrl} />

      <DiagnosisKnowledgeSection result={result} />

      <DiagnosisRecommendedSeeds
        plantName={result.plantName}
        detailHint={result.detailHint}
        status={result.status}
        maxItems={3}
      />

      <RecommendedProducts
        status={result.status}
        plantName={result.plantName}
        detailHint={result.detailHint}
        variant="result"
        maxItems={3}
        sectionTitle="케어·도구 추천"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1rem' }}>
        <SaveResultButton result={result} imageDataUrl={imageForSave} />
        {saveError ? (
          <p style={{ color: '#fca5a5', fontSize: '0.88rem', margin: 0 }}>{saveError}</p>
        ) : null}
        <Button variant="ghost" fullWidth onClick={() => navigate('/my-farm')}>
          내 농장으로 이동
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            reset();
            navigate('/diagnosis', { replace: true });
          }}
        >
          다시 진단하기
        </Button>
      </div>
    </div>
  );
}
