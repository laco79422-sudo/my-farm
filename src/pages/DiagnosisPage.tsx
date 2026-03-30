import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UploadCard } from '../components/diagnosis/UploadCard';
import { analyzePlantImage } from '../services/diagnosis/analyzePlantImage';
import {
  useDiagnosisStore,
  persistDiagnosisSession,
} from '../stores/useDiagnosisStore';
import { fileToResizedDataUrl } from '../utils/imageDataUrl';

const HINT_COPY: Record<string, string> = {
  pest: '병충해 확인: 잎 뒷면·해충이 보이도록 가깝게 찍어 주세요.',
  nutrient: '영양결핍: 새순과 아랫잎을 함께 담으면 비교에 도움이 됩니다.',
  yellow: '잎이 노랗게 변하는 증상을 중심으로 촬영해 주세요.',
  spots: '반점·무늬가 선명하게 보이게 찍어 주세요.',
  dry: '마른 부위와 주변 건강한 잎이 함께 보이면 좋습니다.',
  wilt: '줄기·잎 전체가 처진 모습이 드러나게 촬영해 주세요.',
};

export function DiagnosisPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);

  const uploadedImageObjectUrl = useDiagnosisStore((s) => s.uploadedImageObjectUrl);
  const isLoading = useDiagnosisStore((s) => s.isLoading);
  const error = useDiagnosisStore((s) => s.error);
  const setFromFile = useDiagnosisStore((s) => s.setFromFile);
  const setPreviewDataUrl = useDiagnosisStore((s) => s.setPreviewDataUrl);
  const setResult = useDiagnosisStore((s) => s.setResult);
  const setLoading = useDiagnosisStore((s) => s.setLoading);
  const setError = useDiagnosisStore((s) => s.setError);
  const reset = useDiagnosisStore((s) => s.reset);

  const hintKey = searchParams.get('hint') ?? '';
  const hintMessage = hintKey && HINT_COPY[hintKey] ? HINT_COPY[hintKey] : '';

  useEffect(() => {
    const source = searchParams.get('source');
    if (source !== 'camera' && source !== 'album') return;
    const t = window.setTimeout(() => {
      if (source === 'camera') cameraInputRef.current?.click();
      else galleryInputRef.current?.click();
    }, 0);
    return () => window.clearTimeout(t);
  }, [searchParams]);

  const runAnalysis = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      try {
        const [result, dataUrl] = await Promise.all([
          analyzePlantImage(file),
          fileToResizedDataUrl(file).catch(() => null),
        ]);
        setResult(result);
        setPreviewDataUrl(dataUrl);
        persistDiagnosisSession(result, dataUrl);
        navigate('/diagnosis/result', { replace: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : '진단에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [navigate, setError, setLoading, setPreviewDataUrl, setResult],
  );

  const onPick = useCallback(
    (file: File | null) => {
      if (!file) return;
      fileRef.current = file;
      setFromFile(file);
      void runAnalysis(file);
    },
    [runAnalysis, setFromFile],
  );

  const busy = isLoading;

  return (
    <div className="page-shell">
      <h1 className="section-title">진단</h1>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        식물 이름을 확인하고, 병충해 가능성이나 영양결핍 여부를 분석한 뒤 내 농장에 저장할 수 있습니다.
      </p>

      {hintMessage ? (
        <p className="chip" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
          {hintMessage}
        </p>
      ) : null}

      <UploadCard
        busy={busy}
        previewUrl={uploadedImageObjectUrl}
        cameraInputRef={cameraInputRef}
        galleryInputRef={galleryInputRef}
        onPick={onPick}
      />

      {busy ? (
        <p className="muted" style={{ marginTop: '1rem' }} role="status">
          이미지를 분석하는 중입니다…
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(248, 113, 113, 0.35)',
            background: 'rgba(248, 113, 113, 0.08)',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      ) : null}

      <p className="muted" style={{ marginTop: '1.25rem', fontSize: '0.82rem' }}>
        비회원도 결과 확인 가능 · 로그인하면 내 농장에 저장됩니다
      </p>

      <button
        type="button"
        className="btn btn--ghost"
        style={{ marginTop: '0.75rem' }}
        onClick={() => {
          reset();
          fileRef.current = null;
        }}
      >
        선택 초기화
      </button>
    </div>
  );
}
