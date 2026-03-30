import { useEffect, useState, type FormEvent } from 'react';
import type { FarmProfile, GrowEnvironment, GrowMethod } from '../../types/farmHub';
import { useFarmHubStore } from '../../stores/useFarmHubStore';
import { useToastStore } from '../../stores/useToastStore';
import './myFarm.css';

type Props = {
  profile: FarmProfile | null;
};

export function FarmInfoSection({ profile }: Props) {
  const saveProfile = useFarmHubStore((s) => s.saveProfile);
  const showToast = useToastStore((s) => s.show);
  const [farmName, setFarmName] = useState(profile?.farmName ?? '');
  const [farmerName, setFarmerName] = useState(profile?.farmerName ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [district, setDistrict] = useState(profile?.district ?? '');
  const [env, setEnv] = useState<GrowEnvironment>(profile?.growEnvironment ?? 'garden');
  const [method, setMethod] = useState<GrowMethod>(profile?.growMethod ?? 'soil');

  useEffect(() => {
    if (!profile) return;
    setFarmName(profile.farmName);
    setFarmerName(profile.farmerName);
    setCity(profile.city);
    setDistrict(profile.district);
    setEnv(profile.growEnvironment);
    setMethod(profile.growMethod);
  }, [profile]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!city.trim() || !district.trim()) {
      showToast('시/도와 상세 지역(구)은 필수입니다.');
      return;
    }
    saveProfile({
      farmName: farmName.trim() || '내 농장',
      farmerName: farmerName.trim() || '농부',
      city: city.trim(),
      district: district.trim(),
      growEnvironment: env,
      growMethod: method,
    });
    showToast('농장 정보가 저장되었습니다.');
  }

  return (
    <section className="my-farm-section" id="farm-info">
      <h2 className="my-farm-section__title">FarmInfo · 농장 정보</h2>
      <p className="muted my-farm-section__lead">지역은 탐색·거래에 사용됩니다.</p>
      <form onSubmit={onSubmit}>
        <label className="muted fi-label">
          농장 이름
          <input className="fi-inp" value={farmName} onChange={(e) => setFarmName(e.target.value)} />
        </label>
        <label className="muted fi-label">
          농부 이름
          <input className="fi-inp" value={farmerName} onChange={(e) => setFarmerName(e.target.value)} />
        </label>
        <label className="muted fi-label">
          시/도 <span style={{ color: '#f87171' }}>*</span>
          <input className="fi-inp" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="서울" />
        </label>
        <label className="muted fi-label">
          구/시·군 <span style={{ color: '#f87171' }}>*</span>
          <input
            className="fi-inp"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
            placeholder="강동구"
          />
        </label>
        <p className="muted" style={{ fontSize: '0.75rem', margin: '10px 0 4px' }}>
          기본 재배 환경·방식 (재배 시작 시 기본값)
        </p>
        <div className="my-farm-grid-2">
          <select className="fi-inp" value={env} onChange={(e) => setEnv(e.target.value as GrowEnvironment)}>
            <option value="urban">도시형</option>
            <option value="garden">텃밭형</option>
            <option value="factory">공장형</option>
          </select>
          <select className="fi-inp" value={method} onChange={(e) => setMethod(e.target.value as GrowMethod)}>
            <option value="hydro">수경재배</option>
            <option value="soil">토양재배</option>
          </select>
        </div>
        <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 12 }}>
          저장
        </button>
      </form>
      <style>{`
        .fi-label {
          display: block;
          font-size: 0.75rem;
          margin-top: 10px;
        }
        .fi-inp {
          width: 100%;
          margin-top: 4px;
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
