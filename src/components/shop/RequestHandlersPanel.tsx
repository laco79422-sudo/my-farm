import { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProductRequestStore, type StoredProductRequest } from '../../stores/useProductRequestStore';
import { useToastStore } from '../../stores/useToastStore';
import {
  anonymizeUid,
  categoryDisplayLabel,
  categoryRewardSummary,
} from '../../utils/requestDisplay';
import {
  requestStatusDisplayClass,
  requestStatusDisplayLabel,
} from '../../utils/requestStatusUi';
import './RequestHandlersPanel.css';

const FLOW_ORDER: Record<StoredProductRequest['status'], number> = {
  recruiting: 0,
  in_progress: 1,
  registered: 2,
  selling: 3,
  rejected: 4,
};

function requesterName(r: StoredProductRequest): string {
  return (r.requesterLabel?.trim() || anonymizeUid(r.requesterUid)) as string;
}

export function RequestHandlersPanel() {
  const { sessionUid } = useAuth();
  const requests = useProductRequestStore((s) => s.requests);
  const applyAsHandler = useProductRequestStore((s) => s.applyAsHandler);
  const selectHandler = useProductRequestStore((s) => s.selectHandler);
  const showToast = useToastStore((s) => s.show);

  const [detailId, setDetailId] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...requests].sort((a, b) => {
        const d = FLOW_ORDER[a.status] - FLOW_ORDER[b.status];
        if (d !== 0) return d;
        return b.updatedAt.localeCompare(a.updatedAt);
      }),
    [requests],
  );

  const detail = detailId ? sorted.find((r) => r.id === detailId) ?? null : null;

  function onApply(r: StoredProductRequest) {
    if (!sessionUid) {
      showToast('로그인 후 지원할 수 있습니다.');
      return;
    }
    const res = applyAsHandler(r.id, sessionUid);
    if (!res.ok) {
      showToast(res.error ?? '지원할 수 없습니다.');
      return;
    }
    showToast('지원이 완료되었습니다.');
  }

  function onPick(applicantUid: string) {
    if (!detail || !sessionUid) return;
    const res = selectHandler(detail.id, sessionUid, applicantUid);
    if (!res.ok) {
      showToast(res.error ?? '선택할 수 없습니다.');
      return;
    }
    showToast('진행자를 선택했습니다. 등록을 진행해 주세요.');
  }

  if (detail) {
    const isRequester = sessionUid && detail.requesterUid === sessionUid;
    const canPick = isRequester && detail.status === 'recruiting' && detail.applicantUids.length > 0;

    return (
      <div className="rh-panel">
        <button type="button" className="btn btn--ghost rh-detail__back" onClick={() => setDetailId(null)}>
          ← 의뢰 목록
        </button>

        <article className="rh-detail card">
          <header className="rh-detail__head">
            <span className={'rh-detail__badge ' + requestStatusDisplayClass(detail.status)}>
              {requestStatusDisplayLabel(detail.status)}
            </span>
            <h2 className="rh-detail__title">{detail.productName}</h2>
            <p className="muted rh-detail__meta">
              요청자 <strong>{requesterName(detail)}</strong> · 분야{' '}
              <strong>{categoryDisplayLabel(detail.category)}</strong> · 보상{' '}
              <strong style={{ color: 'var(--color-lime)' }}>{categoryRewardSummary(detail.category)}</strong>
            </p>
          </header>

          <section className="rh-detail__section">
            <h3 className="rh-detail__h3">의뢰 정보</h3>
            <dl className="rh-detail__dl">
              <div>
                <dt>설명</dt>
                <dd>{detail.description}</dd>
              </div>
              <div>
                <dt>필요 이유</dt>
                <dd>{detail.reason}</dd>
              </div>
            </dl>
          </section>

          <section className="rh-detail__section">
            <h3 className="rh-detail__h3">지원자 목록 ({detail.applicantUids.length}명)</h3>
            {detail.applicantUids.length === 0 ? (
              <p className="muted" style={{ fontSize: '0.85rem' }}>
                아직 지원한 진행자가 없습니다.
              </p>
            ) : (
              <ul className="rh-detail__applicants">
                {detail.applicantUids.map((uid) => {
                  const me = sessionUid === uid;
                  return (
                    <li key={uid} className="rh-detail__applicant">
                      <div>
                        <span className="rh-detail__applicant-name">
                          {me ? '나 (내 계정)' : anonymizeUid(uid)}
                        </span>
                        {me ? <span className="rh-detail__chip">나</span> : null}
                      </div>
                      {canPick ? (
                        <button type="button" className="btn btn--primary rh-detail__pick" onClick={() => onPick(uid)}>
                          진행자 선택
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
            {!isRequester && detail.status === 'recruiting' ? (
              <p className="muted rh-detail__hint" style={{ fontSize: '0.8rem' }}>
                의뢰자만 지원자 중 한 명을 진행자로 선택할 수 있습니다.
              </p>
            ) : null}
          </section>

          <section className="rh-detail__rewards footnote muted card">
            <p className="rh-detail__rewards-title">보상 구조</p>
            <ul>
              <li>의뢰자 — 초기 포인트 + 판매 보너스</li>
              <li>진행자 — 등록 보상 + 판매 수익</li>
            </ul>
          </section>
        </article>
      </div>
    );
  }

  return (
    <div className="rh-panel">
      <header className="rh-panel__intro">
        <h2 className="section-title rh-panel__title">🌱 함께 만드는 농장</h2>
        <p className="muted rh-panel__lead">
          등록이 필요한 상품에 직접 지원할 수 있습니다.
          <br />
          선택된 진행자는 상품 등록을 진행하며,
          <br />
          판매 시 보상을 받게 됩니다.
        </p>
        <div className="rh-panel__rewards card">
          <p className="rh-panel__rewards-title">보상</p>
          <ul className="rh-panel__rewards-list muted">
            <li>
              <strong style={{ color: 'var(--color-mint)' }}>의뢰자</strong> — 초기 포인트 + 판매 보너스
            </li>
            <li>
              <strong style={{ color: 'var(--color-lime)' }}>진행자</strong> — 등록 보상 + 판매 수익
            </li>
          </ul>
        </div>
        <p className="muted rh-panel__status-hint" style={{ fontSize: '0.8rem' }}>
          단계: <strong>모집중</strong> → <strong>진행중</strong> → <strong>등록완료</strong> →{' '}
          <strong>판매중</strong>
        </p>
      </header>

      <ul className="rh-rec__list">
        {sorted.map((r) => {
          const applied = sessionUid ? r.applicantUids.includes(sessionUid) : false;
          const mine = sessionUid === r.requesterUid;

          return (
            <li key={r.id} className="rh-rec__item card">
              <div className="rh-rec__row-top">
                <span className={'rh-rec__status ' + requestStatusDisplayClass(r.status)}>
                  {requestStatusDisplayLabel(r.status)}
                </span>
                <button
                  type="button"
                  className="btn btn--ghost rh-rec__detail-btn"
                  onClick={() => setDetailId(r.id)}
                >
                  상세
                </button>
              </div>
              <h3 className="rh-rec__product">{r.productName}</h3>
              <dl className="rh-rec__dl">
                <div>
                  <dt>요청자</dt>
                  <dd>{requesterName(r)}</dd>
                </div>
                <div>
                  <dt>카테고리</dt>
                  <dd>{categoryDisplayLabel(r.category)}</dd>
                </div>
                <div>
                  <dt>보상</dt>
                  <dd className="rh-rec__reward">{categoryRewardSummary(r.category)}</dd>
                </div>
                <div>
                  <dt>지원자</dt>
                  <dd>{r.applicantUids.length}명</dd>
                </div>
              </dl>
              {r.status === 'recruiting' ? (
                mine ? (
                  <p className="muted rh-rec__note" style={{ fontSize: '0.82rem' }}>
                    내 의뢰입니다. 지원자를 확인하려면 상세를 열고 진행자를 선택하세요.
                  </p>
                ) : applied ? (
                  <button type="button" className="btn rh-rec__cta rh-rec__cta--done" disabled>
                    지원 완료
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--primary rh-rec__cta"
                    onClick={() => onApply(r)}
                  >
                    이 의뢰 진행하기
                  </button>
                )
              ) : (
                <button type="button" className="btn btn--ghost rh-rec__cta" onClick={() => setDetailId(r.id)}>
                  내용 보기
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
