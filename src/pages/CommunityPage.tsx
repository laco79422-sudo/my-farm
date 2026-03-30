import { Navigate } from 'react-router-dom';

/** 단일 메뉴 유지 — 커뮤니티는 농부들 페이지 안으로 통합됨 */
export function CommunityPage() {
  return <Navigate to="/farmers?tab=community" replace />;
}
