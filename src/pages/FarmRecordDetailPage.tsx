import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DiagnosisResultCard } from '../components/diagnosis/DiagnosisResultCard';
import { Button } from '../components/common/Button';
import { useFarmStore, loadFarmRecordsFromStorage } from '../stores/useFarmStore';
import type { DiagnosisResult } from '../types/diagnosisResult';
import { formatDateLabel } from '../utils/format';

function loadRecordForUser(uid: string, id: string) {
  return loadFarmRecordsFromStorage(uid).find((r) => r.id === id);
}

export function FarmRecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sessionUid, isInitialized } = useAuth();
  const savedRecords = useFarmStore((s) => s.savedRecords);
  const loadForUser = useFarmStore((s) => s.loadForUser);

  useEffect(() => {
    if (sessionUid) loadForUser(sessionUid);
  }, [sessionUid, loadForUser]);

  const record = useMemo(() => {
    if (!id || !sessionUid) return undefined;
    return savedRecords.find((r) => r.id === id) ?? loadRecordForUser(sessionUid, id);
  }, [id, sessionUid, savedRecords]);

  const resultShape: DiagnosisResult | null = record
    ? {
        plantName: record.plantName,
        status: record.status,
        causes: record.causes,
        solutions: record.solutions,
        confidence: record.confidence,
      }
    : null;

  if (!isInitialized) {
    return (
      <div className="page-shell">
        <p className="muted">세션 확인 중…</p>
      </div>
    );
  }

  if (!sessionUid) {
    return (
      <div className="page-shell">
        <h1 className="section-title">저장된 진단</h1>
        <p className="muted">로그인 후 내 농장 기록을 확인할 수 있습니다.</p>
        <Button variant="primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/login', { state: { from: `/my-farm/${id}` } })}>
          로그인
        </Button>
      </div>
    );
  }

  if (!record || !resultShape) {
    return (
      <div className="page-shell">
        <h1 className="section-title">기록을 찾을 수 없습니다</h1>
        <p className="muted">삭제되었거나 잘못된 링크일 수 있습니다.</p>
        <Link to="/my-farm" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          내 농장으로
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <p className="muted" style={{ marginBottom: '0.5rem', fontSize: '0.82rem' }}>
        저장일 {formatDateLabel(record.savedAt)}
      </p>
      <DiagnosisResultCard result={resultShape} imageUrl={record.imageUrl} />
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button variant="ghost" onClick={() => navigate('/my-farm')}>
          목록으로
        </Button>
        <Button variant="primary" onClick={() => navigate('/diagnosis')}>
          새 진단 시작
        </Button>
      </div>
    </div>
  );
}
