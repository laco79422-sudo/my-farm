import { useEffect, useState, type FormEvent } from 'react';
import type { DailyLogEntry, GrowPlant } from '../../types/farmHub';
import { useFarmHubStore } from '../../stores/useFarmHubStore';
import { useToastStore } from '../../stores/useToastStore';
import './myFarm.css';

type Props = {
  plants: GrowPlant[];
  logs: DailyLogEntry[];
};

export function DailyLogSection({ plants, logs }: Props) {
  const addDailyLog = useFarmHubStore((s) => s.addDailyLog);
  const showToast = useToastStore((s) => s.show);
  const growing = plants.filter((p) => p.status === 'growing' || p.status === 'harvest_ready');
  const [plantId, setPlantId] = useState(growing[0]?.id ?? '');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [watered, setWatered] = useState(true);
  const [statusCheck, setStatusCheck] = useState<'good' | 'ok' | 'stress'>('good');
  const [memo, setMemo] = useState('');

  const todayLogged =
    plantId && logs.some((l) => l.plantId === plantId && l.date === new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!plantId && growing[0]) setPlantId(growing[0].id);
  }, [growing, plantId]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!plantId) return;
    addDailyLog({ plantId, date, watered, statusCheck, memo });
    showToast('생산일지가 저장되었습니다. (하루 1회 권장)');
    setMemo('');
  }

  return (
    <section className="my-farm-section" id="farm-dailylog">
      <h2 className="my-farm-section__title">DailyLog · 생산일지</h2>
      <p className="muted my-farm-section__lead">
        하루 1회 기록을 권장합니다. 타임라인에 자동 반영됩니다.
        {todayLogged ? (
          <span style={{ color: 'var(--color-lime)' }}> · 오늘 이 작물은 이미 기록됨</span>
        ) : null}
      </p>
      {growing.length === 0 ? (
        <p className="muted">재배 중인 작물이 없습니다.</p>
      ) : (
        <form onSubmit={onSubmit}>
          <label className="muted" style={{ fontSize: '0.75rem' }}>
            작물
            <select
              className="my-farm-select"
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            >
              {growing.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="muted" style={{ fontSize: '0.75rem', display: 'block', marginTop: 10 }}>
            날짜
            <input
              type="date"
              className="my-farm-select"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: '0.85rem' }}>
            <input type="checkbox" checked={watered} onChange={(e) => setWatered(e.target.checked)} />
            물주기 완료
          </label>
          <p className="muted" style={{ fontSize: '0.75rem', margin: '10px 0 4px' }}>
            상태
          </p>
          <select
            className="my-farm-select"
            value={statusCheck}
            onChange={(e) => setStatusCheck(e.target.value as 'good' | 'ok' | 'stress')}
            style={{ width: '100%' }}
          >
            <option value="good">양호</option>
            <option value="ok">보통</option>
            <option value="stress">스트레스</option>
          </select>
          <label className="muted" style={{ fontSize: '0.75rem', display: 'block', marginTop: 10 }}>
            메모
            <textarea
              className="my-farm-select"
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 12 }}>
            기록 저장
          </button>
        </form>
      )}
      <style>{`
        .my-farm-select {
          padding: 0.5rem 0.6rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          background: var(--color-bg-elevated);
          color: var(--color-text);
          box-sizing: border-box;
        }
      `}</style>
    </section>
  );
}
