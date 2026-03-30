import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { saveDiagnosisRecord } from '../../services/farm/saveDiagnosisRecord';
import { useFarmStore } from '../../stores/useFarmStore';
import { useToastStore } from '../../stores/useToastStore';
import type { DiagnosisResult } from '../../types/diagnosisResult';

type Props = {
  result: DiagnosisResult;
  imageDataUrl: string | null;
  onSaved?: () => void;
};

export function SaveResultButton({ result, imageDataUrl, onSaved }: Props) {
  const navigate = useNavigate();
  const { isLoggedIn, isInitialized, sessionUid } = useAuth();
  const setSaveLoading = useFarmStore((s) => s.setSaveLoading);
  const setSaveError = useFarmStore((s) => s.setSaveError);
  const saveLoading = useFarmStore((s) => s.saveLoading);
  const showToast = useToastStore((s) => s.show);

  const img = imageDataUrl ?? '/vite.svg';

  async function save() {
    if (!sessionUid) return;
    setSaveError(null);
    setSaveLoading(true);
    try {
      await saveDiagnosisRecord({
        result,
        imageDataUrl: img,
        ownerUid: sessionUid,
      });
      showToast('내 농장에 저장되었습니다.');
      onSaved?.();
    } catch {
      setSaveError('저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSaveLoading(false);
    }
  }

  if (!isInitialized) {
    return (
      <Button fullWidth disabled>
        확인 중…
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button
        fullWidth
        variant="primary"
        onClick={() => {
          sessionStorage.setItem('myfarm_login_return', '/diagnosis/result');
          navigate('/login', { state: { from: '/diagnosis/result' } });
        }}
      >
        로그인하고 저장
      </Button>
    );
  }

  return (
    <Button fullWidth disabled={saveLoading} onClick={() => void save()}>
      {saveLoading ? '저장 중…' : '내 농장에 저장'}
    </Button>
  );
}
