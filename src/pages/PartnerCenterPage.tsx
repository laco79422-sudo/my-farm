import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useToastStore } from '../stores/useToastStore';
import {
  savePartnerInquiry,
  type PartnerTopic,
} from '../services/partnerInquiryService';
import './PartnerCenterPage.css';

const TOPICS: { id: PartnerTopic; title: string; desc: string }[] = [
  {
    id: 'listing',
    title: '상품 입점 문의',
    desc: '씨앗·용기 등 상점 등록 및 판매 연동',
  },
  {
    id: 'supply',
    title: '농약·영양제 공급 문의',
    desc: '방제·비료·액비 등 공급·등록 협의',
  },
  {
    id: 'equipment',
    title: '장비·자동화 시스템 문의',
    desc: '센서·관수·스마트팜 장비 제휴',
  },
  {
    id: 'ads',
    title: '광고·홍보 문의',
    desc: '노출·캠페인·브랜드 제휴',
  },
];

const PRODUCT_TYPE_OPTIONS = [
  { value: '', label: '선택' },
  { value: 'seed', label: '씨앗·모종' },
  { value: 'container', label: '용기·자재' },
  { value: 'pesticide', label: '농약·방제' },
  { value: 'nutrient', label: '영양제·배양액' },
  { value: 'equipment', label: '장비·IoT·자동화' },
  { value: 'ads', label: '광고·홍보·제휴' },
  { value: 'other', label: '기타' },
] as const;

function isPartnerTopic(v: string): v is PartnerTopic {
  return v === 'listing' || v === 'supply' || v === 'equipment' || v === 'ads';
}

export function PartnerCenterPage() {
  const showToast = useToastStore((s) => s.show);
  const [searchParams, setSearchParams] = useSearchParams();

  const topicFromUrl = searchParams.get('topic');
  const initialTopic: PartnerTopic =
    topicFromUrl && isPartnerTopic(topicFromUrl) ? topicFromUrl : 'listing';

  const [topic, setTopic] = useState<PartnerTopic>(initialTopic);

  useEffect(() => {
    const t = searchParams.get('topic');
    if (t && isPartnerTopic(t)) setTopic(t);
  }, [searchParams]);

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setTopicAndUrl = useCallback(
    (next: PartnerTopic) => {
      setTopic(next);
      const p = new URLSearchParams(searchParams);
      p.set('topic', next);
      setSearchParams(p, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const topicLabel = useMemo(
    () => TOPICS.find((t) => t.id === topic)?.title ?? '',
    [topic],
  );

  function resetForm() {
    setCompanyName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setProductCategory('');
    setMessage('');
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !phone.trim() || !email.trim()) {
      showToast('필수 항목을 모두 입력해 주세요.');
      return;
    }
    if (!productCategory) {
      showToast('상품 유형을 선택해 주세요.');
      return;
    }
    if (!message.trim()) {
      showToast('문의 내용을 입력해 주세요.');
      return;
    }

    const productLabel =
      PRODUCT_TYPE_OPTIONS.find((o) => o.value === productCategory)?.label ?? productCategory;

    setSubmitting(true);
    try {
      savePartnerInquiry({
        topic,
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        productCategory: productLabel,
        message: message.trim(),
      });
      showToast('문의가 접수되었습니다. 검토 후 연락드리겠습니다.');
      resetForm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell partner-center">
      <div className="partner-center__inner">
        <p className="partner-center__crumb muted">
          <Link to="/">홈</Link>
          <span aria-hidden> · </span>
          파트너 센터
        </p>

        <h1 className="section-title partner-center__title">파트너 센터</h1>
        <p className="muted partner-center__lead">
          씨앗·용기·농약·영양제·장비 등 비즈니스 파트너십을 위한 입점·공급·광고 문의를 받습니다.
        </p>

        <section className="partner-center__flow" aria-label="처리 흐름">
          <h2 className="partner-center__flow-title">처리 흐름</h2>
          <ol className="partner-center__flow-steps">
            <li>문의 접수</li>
            <li>관리자 검토</li>
            <li>승인 시 상품 등록</li>
            <li>상점 노출</li>
          </ol>
        </section>

        <section className="partner-center__topics" aria-labelledby="partner-topics-title">
          <h2 id="partner-topics-title" className="partner-center__section-title">
            문의 유형
          </h2>
          <div className="partner-center__topic-grid" role="tablist" aria-label="문의 유형 선택">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={topic === t.id}
                className={
                  'partner-center__topic-card' + (topic === t.id ? ' partner-center__topic-card--on' : '')
                }
                onClick={() => setTopicAndUrl(t.id)}
              >
                <span className="partner-center__topic-title">{t.title}</span>
                <span className="partner-center__topic-desc muted">{t.desc}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="partner-center__form-wrap" aria-labelledby="partner-form-title">
          <h2 id="partner-form-title" className="partner-center__section-title">
            문의 작성
          </h2>
          <p className="muted partner-center__form-topic">
            선택 유형: <strong>{topicLabel}</strong>
          </p>

          <form className="partner-center__form" onSubmit={onSubmit} noValidate>
            <label className="partner-center__field">
              <span className="partner-center__label">회사명 *</span>
              <input
                className="partner-center__input"
                name="companyName"
                autoComplete="organization"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="예: (주)그린팜"
                required
                maxLength={120}
              />
            </label>

            <label className="partner-center__field">
              <span className="partner-center__label">담당자 이름 *</span>
              <input
                className="partner-center__input"
                name="contactName"
                autoComplete="name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="실명 또는 성함"
                required
                maxLength={80}
              />
            </label>

            <label className="partner-center__field">
              <span className="partner-center__label">연락처 *</span>
              <input
                className="partner-center__input"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="휴대폰 또는 유선"
                required
                maxLength={40}
              />
            </label>

            <label className="partner-center__field">
              <span className="partner-center__label">이메일 *</span>
              <input
                className="partner-center__input"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                maxLength={120}
              />
            </label>

            <label className="partner-center__field">
              <span className="partner-center__label">상품 유형 *</span>
              <select
                className="partner-center__input partner-center__select"
                name="productCategory"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                required
                aria-label="상품 유형"
              >
                {PRODUCT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value || 'empty'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="partner-center__field">
              <span className="partner-center__label">문의 내용 *</span>
              <textarea
                className="partner-center__input partner-center__textarea"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="제안 상품·예상 물량·희망 일정 등을 간단히 적어 주세요."
                required
                rows={5}
                maxLength={4000}
              />
            </label>

            <Button type="submit" variant="primary" fullWidth disabled={submitting}>
              {submitting ? '접수 중…' : '문의 접수하기'}
            </Button>
          </form>
        </section>

        <aside className="partner-center__future muted" aria-label="향후 연동">
          <strong>향후 확장</strong>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', lineHeight: 1.55 }}>
            승인된 입점 상품은 상점 카탈로그와 연동하고, 광고·스폰서 상품 노출 등 수익 구조를 단계적으로
            확장할 수 있습니다.
          </p>
        </aside>
      </div>
    </div>
  );
}
