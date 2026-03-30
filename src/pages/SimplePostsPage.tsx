import { Navigate } from 'react-router-dom';

/** 게시판은 커뮤니티 탭으로 통합 */
export function SimplePostsPage() {
  return <Navigate to="/farmers?tab=community&view=board" replace />;
}
