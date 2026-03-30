import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { submitProductRequest } from '../../services/requestService';
import { isFirebaseConfigured } from '../../firebase';
import { useProductRequestStore, type StoredProductRequest } from '../../stores/useProductRequestStore';
import { useToastStore } from '../../stores/useToastStore';
import { POINT_RULES } from '../../services/pointService';
import { addEarnHistory } from '../../services/pointLedger';
import { requestStatusDisplayLabel } from '../../utils/requestStatusUi';
import { getAuthDisplayName } from '../../utils/authDisplay';
import './ProductRequestForm.css';

const REQUEST_CATEGORY_OPTIONS = [
  { value: '씨앗', label: '씨앗' },
  { value: '용기', label: '용기' },
  { value: '배양액', label: '영양제' },
  { value: '농기구', label: '장비' },
  { value: 'IoT 부품', label: '자동화' },
  { value: '기타', label: '기타' },
] as const;

function rewardPointsForCategory(category: string): number {
  if (category === '씨앗') return POINT_RULES.productRequestSeed;
  if (category === '용기') return POINT_RULES.productRequestVessel;
  return POINT_RULES.productRequestOther;
}

export function ProductRequestForm() {
  const { profile, user, mockUser, sessionUid, isLoggedIn, isInitialized } = useAuth();
  const findDuplicateByName = useProductRequestStore((s) => s.findDuplicateByName);
  const addRequest = useProductRequestStore((s) => s.addRequest);
  const applyAsHandler = useProductRequestStore((s) => s.applyAsHandler);
  const showToast = useToastStore((s) => s.show);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(REQUEST_CATEGORY_OPTIONS[0].value);
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');
  const [duplicateOf, setDuplicateOf] = useState<StoredProductRequest | null>(null);

  const requesterLabel = getAuthDisplayName(profile, user, mockUser) || '이용자';

  function clearDuplicate() {
    setDuplicateOf(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('idle');
    setMsg('');
    clearDuplicate();

    if (!isInitialized || !isLoggedIn || !sessionUid) {
      setStatus('err');
      setMsg('로그인 후 의뢰할 수 있습니다.');
      return;
    }

    const dup = findDuplicateByName(name.trim());
    if (dup) {
      setDuplicateOf(dup);
      return;
    }

    const pts = rewardPointsForCategory(category);
    const firebaseOk = isFirebaseConfigured() && Boolean(user);

    try {
      let id: string | undefined;
      if (firebaseOk) {
        id = await submitProductRequest({
          requesterUid: user!.uid,
          productName: name,
          category,
          description,
          reason,
        });
      }

      addRequest({
        id,
        requesterUid: sessionUid,
        requesterLabel,
        productName: name,
        category,
        description,
        reason,
      });

      if (!firebaseOk && mockUser) {
        addEarnHistory(sessionUid, '상품 의뢰 보상', pts);
        showToast(`의뢰가 등록되었습니다. 보상 ${pts}P가 지급되었습니다. (데모)`);
      } else if (firebaseOk) {
        showToast(`의뢰가 등록되었습니다. 검토 후 최대 ${pts}P 등 보상이 안내될 수 있습니다.`);
      } else {
        showToast('의뢰가 등록되었습니다.');
      }

      setStatus('ok');
      setMsg(
        firebaseOk
          ? '등록되었습니다. 의뢰 진행자 탭에서 진행자 지원을 받고, 상세에서 진행자를 선택하세요.'
          : '등록되었습니다. 의뢰 진행자 탭에서 지원을 받을 수 있습니다.',
      );
      setName('');
      setDescription('');
      setReason('');
    } catch (err) {
      setStatus('err');
      setMsg(err instanceof Error ? err.message : '저장 실패');
    }
  }

  function onSupportDuplicate() {
    if (!duplicateOf || !sessionUid) return;
    const r = applyAsHandler(duplicateOf.id, sessionUid);
    if (!r.ok) {
      showToast(r.error ?? '지원할 수 없습니다.');
      return;
    }
    showToast('지원이 완료되었습니다. 의뢰자가 진행자를 선택하면 등록이 시작됩니다.');
    clearDuplicate();
  }

  const isOwnDuplicate =
    duplicateOf && sessionUid ? duplicateOf.requesterUid === sessionUid : false;

  return (
    <div className="product-request-form">
      <div className="product-request-intro">
        <h2 className="product-request-intro__title">🌱 초기 농장을 함께 만들어주세요</h2>
        <p className="product-request-intro__p">
          현재 나만의 농장은
          <br />
          씨앗과 용기 등 기본 재배 상품을 준비 중입니다.
        </p>
        <p className="product-request-intro__p">필요한 상품이 있다면 의뢰해주세요.</p>
        <div className="product-request-intro__reward">
          <p className="product-request-intro__reward-title">🎁 의뢰 보상</p>
          <ul>
            <li>씨앗: {POINT_RULES.productRequestSeed}P 지급</li>
            <li>용기: {POINT_RULES.productRequestVessel}P 지급</li>
          </ul>
        </div>
        <p className="product-request-intro__p" style={{ marginTop: '0.75rem' }}>
          의뢰 후 <strong>의뢰 진행자</strong> 메뉴에서 다른 이용자가 지원하고, 의뢰자가 진행자를 선택하면
          등록·판매로 이어집니다.
        </p>
        <p className="product-request-intro__p muted" style={{ fontSize: '0.82rem', marginTop: '0.65rem' }}>
          진행자는 등록 보상·판매 수익을, 의뢰자는 초기 포인트·판매 보너스를 받습니다. (정책 안내)
        </p>
      </div>

      <form className="card" onSubmit={onSubmit} style={{ padding: '1.15rem 1.2rem' }}>
        <h3 className="section-title" style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>
          의뢰 작성
        </h3>
        <p className="muted" style={{ marginTop: 0, fontSize: '0.85rem' }}>
          동일 상품명이 이미 있으면 새 의뢰 대신 지원할 수 있습니다.
        </p>

        <label className="shop-form-label" htmlFor="pr-name">
          상품명
        </label>
        <input
          id="pr-name"
          required
          className="shop-form-control"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearDuplicate();
          }}
          placeholder="예: 유기농 토마토 모종 트레이"
        />

        <label className="shop-form-label shop-form-label--spaced" htmlFor="pr-cat">
          카테고리
        </label>
        <select
          id="pr-cat"
          className="shop-form-control"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {REQUEST_CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <label className="shop-form-label shop-form-label--spaced" htmlFor="pr-desc">
          설명
        </label>
        <textarea
          id="pr-desc"
          required
          className="shop-form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="규격·수량·희망 시기 등"
        />

        <label className="shop-form-label shop-form-label--spaced" htmlFor="pr-reason">
          필요한 이유
        </label>
        <textarea
          id="pr-reason"
          required
          className="shop-form-control"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
        />

        <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.65rem' }}>
          이미지 첨부는 Storage 연동 후 추가할 수 있습니다.
        </p>

        {duplicateOf ? (
          <div className="product-request-form__duplicate">
            <p className="product-request-form__duplicate-msg">이미 의뢰된 상품입니다</p>
            <p className="muted" style={{ margin: '0 0 0.65rem', fontSize: '0.82rem' }}>
              「{duplicateOf.productName}」 · {requestStatusDisplayLabel(duplicateOf.status)} · 지원자{' '}
              {duplicateOf.applicantUids.length}명
            </p>
            {isOwnDuplicate ? (
              <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                직접 등록하신 의뢰입니다. 의뢰 진행자 탭에서 지원 현황과 선택을 진행해 주세요.
              </p>
            ) : (
              <div className="product-request-form__join-row">
                <button type="button" className="btn btn--primary" onClick={onSupportDuplicate}>
                  이 의뢰 진행하기
                </button>
                <button type="button" className="btn btn--ghost" onClick={clearDuplicate}>
                  닫기
                </button>
              </div>
            )}
          </div>
        ) : null}

        <button type="submit" className="btn btn--primary" style={{ marginTop: '1rem', width: '100%' }}>
          의뢰 보내기
        </button>
        {msg ? (
          <p style={{ marginTop: '0.75rem', color: status === 'ok' ? 'var(--color-mint)' : '#fca5a5' }}>
            {msg}
          </p>
        ) : null}
      </form>
    </div>
  );
}
