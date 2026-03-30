import type { RequestFlowStatus } from './requestFlowStatus';

export function requestStatusDisplayLabel(status: RequestFlowStatus): string {
  switch (status) {
    case 'recruiting':
      return '모집중';
    case 'in_progress':
      return '진행중';
    case 'registered':
      return '등록완료';
    case 'selling':
      return '판매중';
    case 'rejected':
      return '반려';
    default:
      return String(status);
  }
}

export function requestStatusDisplayClass(status: RequestFlowStatus): string {
  switch (status) {
    case 'recruiting':
      return 'rh-activity__status--recruiting';
    case 'in_progress':
      return 'rh-activity__status--progress';
    case 'registered':
      return 'rh-activity__status--listed';
    case 'selling':
      return 'rh-activity__status--selling';
    case 'rejected':
      return 'rh-activity__status--muted';
    default:
      return 'rh-activity__status--muted';
  }
}
