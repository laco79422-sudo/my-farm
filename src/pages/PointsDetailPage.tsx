import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isFirebaseConfigured } from '../firebase';
import { POINT_RULES } from '../services/pointService';
import { chargeDemoPoint, loadPointState, type PointLedgerItem } from '../services/pointLedger';
import { listPointLogsForUser, type PointLogRow } from '../services/pointLogService';
import { usePointLedgerStore } from '../stores/usePointLedgerStore';
import './PointsDetailPage.css';

const POLICY_ROWS: { label: string; points: string }[] = [
  { label: '회원가입', points: `+${POINT_RULES.signup}P` },
  { label: '첫 작물 등록', points: `+${POINT_RULES.firstPlant}P` },
  { label: '생산일지 1회', points: `+${POINT_RULES.dailyLog}P` },
  { label: '병충해 진단 1회', points: `+${POINT_RULES.diagnosis}P` },
  { label: '리워드 광고 시청', points: `+${POINT_RULES.rewardAd}P` },
  { label: '커뮤니티 글', points: `+${POINT_RULES.communityPost}P` },
  { label: '로컬푸드점 개설', points: `-${POINT_RULES.localFoodShopOpen}P` },
];

const CHARGE_AMOUNTS = [1000, 3000, 5000] as const;

function formatLedgerAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export function PointsDetailPage() {
  const { isLoggedIn, isInitialized, resolvedPoints, sessionUid } = useAuth();
  const ledgerRev = usePointLedgerStore((s) => s.rev);
  const isDemoLedger = isLoggedIn && !isFirebaseConfigured() && Boolean(sessionUid);

  const [fireRows, setFireRows] = useState<PointLogRow[]>([]);
  const [fireLoading, setFireLoading] = useState(false);

  const loadFireLogs = useCallback(async () => {
    if (!sessionUid || !isFirebaseConfigured()) {
      setFireRows([]);
      return;
    }
    setFireLoading(true);
    const r = await listPointLogsForUser(sessionUid);
    setFireRows(r);
    setFireLoading(false);
  }, [sessionUid]);

  useEffect(() => {
    void loadFireLogs();
  }, [loadFireLogs]);

  const demoState = useMemo(() => {
    if (!isDemoLedger || !sessionUid) return null;
    return loadPointState(sessionUid);
  }, [isDemoLedger, sessionUid, ledgerRev]);

  const [chargeErr, setChargeErr] = useState<string | null>(null);

  function onDemoCharge(amount: number) {
    if (!sessionUid || !demoState) return;
    setChargeErr(null);
    const r = chargeDemoPoint(sessionUid, amount);
    if (!r.ok) setChargeErr(r.error);
  }

  const earnedFs = useMemo(() => fireRows.filter((r) => r.kind === 'earn'), [fireRows]);
  const spentFs = useMemo(() => fireRows.filter((r) => r.kind === 'spend'), [fireRows]);

  const renderEarnRow = (r: PointLedgerItem) => (
    <li key={r.id} className="points-detail__row">
      <span className="points-detail__reason">{r.label}</span>
      <span className="points-detail__delta points-detail__delta--plus">+{r.amount.toLocaleString('ko-KR')}P</span>
      <span className="muted points-detail__at">{formatLedgerAt(r.createdAt)}</span>
    </li>
  );

  const renderSpendRow = (r: PointLedgerItem) => (
    <li key={r.id} className="points-detail__row">
      <span className="points-detail__reason">{r.label}</span>
      <span className="points-detail__delta points-detail__delta--minus">
        -{r.amount.toLocaleString('ko-KR')}P
      </span>
      <span className="muted points-detail__at">{formatLedgerAt(r.createdAt)}</span>
    </li>
  );

  const demoDone = Boolean(demoState?.hasUsedDemoCharge);
  const demoBalance = demoState?.currentPoint ?? null;

  return (
    <div className="page-shell points-detail">
      <h1 className="section-title">포인트</h1>
      <p className="muted points-detail__lead">
        {isDemoLedger
          ? '데모 모드에서 충전·적립·사용 내역이 기기에 저장됩니다.'
          : '적립·사용 내역과 정책 안내입니다.'}
      </p>

      {!isInitialized ? (
        <p className="muted">확인 중…</p>
      ) : !isLoggedIn ? (
        <div className="card points-detail__card">
          <p className="muted" style={{ margin: 0 }}>
            로그인 후 잔액과 내역을 확인할 수 있습니다.
          </p>
          <Link to="/login" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            로그인
          </Link>
        </div>
      ) : isDemoLedger && sessionUid && demoState ? (
        <>
          <section className="card points-detail__card points-detail__charge-section" aria-label="포인트 충전">
            <h2 className="points-detail__h2">포인트 충전</h2>
            <p className="muted points-detail__body points-detail__charge-hint">데모 충전은 1회만 가능합니다.</p>
            {chargeErr ? (
              <p className="points-detail__charge-err" role="alert">
                {chargeErr}
              </p>
            ) : null}
            <div className="points-detail__charge-grid">
              {CHARGE_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="points-detail__charge-card"
                  disabled={demoDone}
                  onClick={() => onDemoCharge(amt)}
                >
                  <span className="points-detail__charge-card-amount">
                    {demoDone ? '데모 충전 완료' : `+${amt.toLocaleString('ko-KR')}P 체험 충전`}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="card points-detail__card points-detail__balance" aria-label="현재 포인트">
            <h2 className="points-detail__h2">현재 포인트</h2>
            <p className="points-detail__balance-val">
              {demoBalance === null ? '…' : `${demoBalance.toLocaleString('ko-KR')}P`}
            </p>
          </section>

          <section className="card points-detail__card" aria-label="획득 내역">
            <h2 className="points-detail__h2">획득 내역</h2>
            {demoState.earnHistory.length === 0 ? (
              <p className="muted">아직 획득 기록이 없습니다.</p>
            ) : (
              <ul className="points-detail__list">{demoState.earnHistory.map(renderEarnRow)}</ul>
            )}
          </section>

          <section className="card points-detail__card" aria-label="사용 내역">
            <h2 className="points-detail__h2">사용 내역</h2>
            {demoState.spendHistory.length === 0 ? (
              <p className="muted">아직 사용 기록이 없습니다.</p>
            ) : (
              <ul className="points-detail__list">{demoState.spendHistory.map(renderSpendRow)}</ul>
            )}
          </section>

          <section className="card points-detail__card" aria-label="포인트 정책 요약">
            <h2 className="points-detail__h2">획득·차감 기준 (요약)</h2>
            <table className="points-detail__table">
              <tbody>
                {POLICY_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td className="points-detail__table-pts">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card points-detail__card points-detail__howto" aria-label="충전 방법 안내">
            <h2 className="points-detail__h2">충전 방법 안내</h2>
            <p className="muted points-detail__body">
              위 체험 충전은 로컬 테스트용이며, 실제 서비스에서는 결제 수단 연동 후 같은 화면에서 충전할 수 있도록 확장할 수
              있습니다. 장바구니 결제·로컬푸드점 개설 등 포인트 사용 시 사용 내역에 자동으로 남습니다.
            </p>
          </section>
        </>
      ) : (
        <>
          <section className="card points-detail__card points-detail__howto" aria-label="포인트 충전">
            <h2 className="points-detail__h2">포인트 충전</h2>
            <p className="muted points-detail__body">
              Firebase 연동 모드에서는 포인트가 서버(Firestore)와 동기화됩니다. 데모용 로컬 충전은 Firebase 미연결 시에만
              사용할 수 있습니다.
            </p>
          </section>

          <section className="card points-detail__card points-detail__balance" aria-label="현재 포인트">
            <h2 className="points-detail__h2">현재 포인트</h2>
            <p className="points-detail__balance-val">
              {resolvedPoints === null ? '…' : `${resolvedPoints.toLocaleString('ko-KR')}P`}
            </p>
          </section>

          <section className="card points-detail__card" aria-label="획득 내역">
            <h2 className="points-detail__h2">획득 내역</h2>
            {fireLoading ? (
              <p className="muted">불러오는 중…</p>
            ) : earnedFs.length === 0 ? (
              <p className="muted">아직 획득 기록이 없습니다.</p>
            ) : (
              <ul className="points-detail__list">
                {earnedFs.map((r) => (
                  <li key={r.id} className="points-detail__row">
                    <span className="points-detail__reason">{r.description ?? r.reason}</span>
                    <span className="points-detail__delta points-detail__delta--plus">
                      +{r.delta.toLocaleString('ko-KR')}P
                    </span>
                    <span className="muted points-detail__at">{r.atLabel}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card points-detail__card" aria-label="사용 내역">
            <h2 className="points-detail__h2">사용 내역</h2>
            {fireLoading ? (
              <p className="muted">불러오는 중…</p>
            ) : spentFs.length === 0 ? (
              <p className="muted">아직 사용 기록이 없습니다.</p>
            ) : (
              <ul className="points-detail__list">
                {spentFs.map((r) => (
                  <li key={r.id} className="points-detail__row">
                    <span className="points-detail__reason">{r.description ?? r.reason}</span>
                    <span className="points-detail__delta points-detail__delta--minus">
                      {r.delta.toLocaleString('ko-KR')}P
                    </span>
                    <span className="muted points-detail__at">{r.atLabel}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card points-detail__card" aria-label="포인트 정책 요약">
            <h2 className="points-detail__h2">획득·차감 기준 (요약)</h2>
            <table className="points-detail__table">
              <tbody>
                {POLICY_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td className="points-detail__table-pts">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card points-detail__card points-detail__howto" aria-label="충전 방법 안내">
            <h2 className="points-detail__h2">충전 방법 안내</h2>
            <p className="muted points-detail__body">
              유료 충전·결제 연동 후 앱 내에서 포인트를 구매할 수 있습니다. 지금은 가입·재배·일지·진단 등으로 포인트를 모을
              수 있습니다.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
