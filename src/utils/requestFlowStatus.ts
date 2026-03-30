/** 상점 상품 의뢰 — 클라이언트 진행 상태 (지원·선택·등록·판매) */
export type RequestFlowStatus = 'recruiting' | 'in_progress' | 'registered' | 'selling' | 'rejected';

export function normalizeRequestFlowStatus(raw: string): RequestFlowStatus {
  switch (raw) {
    case 'recruiting':
    case 'in_progress':
    case 'registered':
    case 'selling':
    case 'rejected':
      return raw;
    case 'pending':
      return 'recruiting';
    case 'reviewing':
      return 'in_progress';
    case 'approved':
      return 'registered';
    default:
      return 'recruiting';
  }
}
