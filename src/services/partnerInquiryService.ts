const LS_KEY = 'farmhub_partner_inquiries_v1';

export type PartnerTopic = 'listing' | 'supply' | 'equipment' | 'ads';

export interface PartnerInquiryRecord {
  id: string;
  submittedAt: string;
  topic: PartnerTopic;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  productCategory: string;
  message: string;
}

export type PartnerInquiryPayload = Omit<PartnerInquiryRecord, 'id' | 'submittedAt'>;

export function savePartnerInquiry(payload: PartnerInquiryPayload): PartnerInquiryRecord {
  const record: PartnerInquiryRecord = {
    ...payload,
    id: `pi_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    submittedAt: new Date().toISOString(),
  };
  try {
    const raw = localStorage.getItem(LS_KEY);
    const prev: PartnerInquiryRecord[] = raw ? JSON.parse(raw) : [];
    prev.push(record);
    localStorage.setItem(LS_KEY, JSON.stringify(prev));
  } catch {
    /* 데모: 저장 실패 시에도 UI는 성공 처리 */
  }
  return record;
}
