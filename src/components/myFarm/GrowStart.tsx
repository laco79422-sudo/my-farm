import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GrowEnvironment, GrowMethod } from '../../types/farmHub';
import { catalogProducts, getCatalogProduct } from '../../data/catalogProducts';
import { useFarmHubStore } from '../../stores/useFarmHubStore';
import { useToastStore } from '../../stores/useToastStore';
import './myFarm.css';

type GrowLocationState = {
  prefillCropName?: string;
  prefillProductId?: string;
  scrollToGrow?: boolean;
};

export function GrowStart() {
  const location = useLocation();
  const navigate = useNavigate();
  const addPlant = useFarmHubStore((s) => s.addPlant);
  const profile = useFarmHubStore((s) => s.profile);
  const showToast = useToastStore((s) => s.show);
  const [name, setName] = useState('');
  const [productId, setProductId] = useState('');
  const [seedCount, setSeedCount] = useState(4);
  const [env, setEnv] = useState<GrowEnvironment>(profile?.growEnvironment ?? 'garden');
  const [method, setMethod] = useState<GrowMethod>(profile?.growMethod ?? 'soil');

  useEffect(() => {
    if (!profile) return;
    setEnv(profile.growEnvironment);
    setMethod(profile.growMethod);
  }, [profile]);

  useEffect(() => {
    const st = location.state as GrowLocationState | null;
    if (!st?.prefillCropName?.trim() && !st?.prefillProductId) return;
    if (st.prefillProductId) {
      setProductId(st.prefillProductId);
      const pr = getCatalogProduct(st.prefillProductId);
      if (pr) setName(pr.name.replace(/\s*키트\s*$/, '').trim());
    } else if (st.prefillCropName?.trim()) {
      setName(st.prefillCropName.trim());
    }
    if (st.scrollToGrow) {
      requestAnimationFrame(() => {
        document.getElementById('farm-grow')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.key, location.pathname, location.state, navigate]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addPlant({
      name: name.trim(),
      seedCount: Math.max(1, seedCount),
      growEnvironment: env,
      growMethod: method,
      productId: productId || null,
    });
    showToast('재배가 시작되었습니다.');
    setName('');
  }

  return (
    <section className="my-farm-section" id="farm-grow">
      <h2 className="my-farm-section__title">GrowStart · 재배 시작</h2>
      <form onSubmit={onSubmit} className="my-farm-section__lead" style={{ margin: 0 }}>
        <label className="muted" style={{ display: 'block', fontSize: '0.75rem', marginBottom: 4 }}>
          상점 상품 연결 (선택)
        </label>
        <select
          className="my-farm-input"
          value={productId}
          onChange={(e) => {
            const id = e.target.value;
            setProductId(id);
            const pr = id ? getCatalogProduct(id) : undefined;
            if (pr) setName(pr.name.replace(/\s*키트\s*$/, '').trim());
          }}
          style={{ marginBottom: 10 }}
        >
          <option value="">없음 — 직접 입력 (예상 수확량 미연동)</option>
          {catalogProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.expectedYieldMinG}~{p.expectedYieldMaxG}g)
            </option>
          ))}
        </select>
        <label className="muted" style={{ display: 'block', fontSize: '0.75rem', marginBottom: 4 }}>
          작물/품종명
        </label>
        <input
          className="my-farm-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 버터헤드 상추"
          required
        />
        <label className="muted" style={{ display: 'block', fontSize: '0.75rem', marginTop: 10, marginBottom: 4 }}>
          식재 수(씨앗/모종)
        </label>
        <input
          type="number"
          min={1}
          className="my-farm-input"
          value={seedCount}
          onChange={(e) => setSeedCount(Number(e.target.value))}
        />
        <p className="muted" style={{ fontSize: '0.75rem', margin: '10px 0 6px' }}>
          환경
        </p>
        <div className="my-farm-grid-2" style={{ marginBottom: 8 }}>
          {(
            [
              ['urban', '도시형'],
              ['garden', '텃밭형'],
              ['factory', '공장형'],
            ] as const
          ).map(([v, label]) => (
            <label key={v} className="my-farm-radio">
              <input type="radio" name="env" checked={env === v} onChange={() => setEnv(v)} />
              {label}
            </label>
          ))}
        </div>
        <p className="muted" style={{ fontSize: '0.75rem', margin: '6px 0' }}>
          재배 방식
        </p>
        <div className="my-farm-grid-2">
          <label className="my-farm-radio">
            <input type="radio" name="meth" checked={method === 'hydro'} onChange={() => setMethod('hydro')} />
            수경재배
          </label>
          <label className="my-farm-radio">
            <input type="radio" name="meth" checked={method === 'soil'} onChange={() => setMethod('soil')} />
            토양재배
          </label>
        </div>
        <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 12 }}>
          재배 시작
        </button>
      </form>
      <style>{`
        .my-farm-input {
          width: 100%;
          padding: 0.5rem 0.6rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          background: var(--color-bg-elevated);
          color: var(--color-text);
          box-sizing: border-box;
        }
        .my-farm-radio {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          padding: 0.4rem 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          cursor: pointer;
        }
      `}</style>
    </section>
  );
}
