import { Navigate } from 'react-router-dom';

/** 판매 등록은 수확 시 자동 · MyShop에서 수동 보완 */
export function SellPage() {
  return <Navigate to="/my-farm#farm-myshop" replace />;
}
