import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { MyFarmPage } from '../pages/MyFarmPage';
import { DiagnosisPage } from '../pages/DiagnosisPage';
import { DiagnosisResultPage } from '../pages/DiagnosisResultPage';
import { FarmRecordDetailPage } from '../pages/FarmRecordDetailPage';
import { PointsDetailPage } from '../pages/PointsDetailPage';
import { ShopPage } from '../pages/ShopPage';
import { SellPage } from '../pages/SellPage';
import { FarmersPage } from '../pages/FarmersPage';
import { FarmerPublicProfilePage } from '../pages/FarmerPublicProfilePage';
import { LocalFoodPage } from '../pages/LocalFoodPage';
import { FarmerRankPage } from '../pages/FarmerRankPage';
import { CommunityPage } from '../pages/CommunityPage';
import { SimplePostsPage } from '../pages/SimplePostsPage';
import { CartPage } from '../pages/CartPage';
import { AccountInfoPage } from '../pages/AccountInfoPage';
import { SettingsPage } from '../pages/SettingsPage';
import { PartnerCenterPage } from '../pages/PartnerCenterPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'my-farm', element: <MyFarmPage /> },
      { path: 'my-farm/:id', element: <FarmRecordDetailPage /> },
      { path: 'diagnosis', element: <DiagnosisPage /> },
      { path: 'diagnosis/result', element: <DiagnosisResultPage /> },
      {
        path: 'pests',
        element: <Navigate to="/diagnosis/result" replace />,
      },
      {
        path: 'nutrient',
        element: <Navigate to="/diagnosis/result" replace />,
      },
      {
        path: 'encyclopedia',
        element: <Navigate to="/diagnosis/result" replace />,
      },
      { path: 'points', element: <PointsDetailPage /> },
      {
        path: 'guide',
        element: <Navigate to="/" replace />,
      },
      { path: 'shop', element: <ShopPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'account', element: <AccountInfoPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'partner-center', element: <PartnerCenterPage /> },
      { path: 'sell', element: <SellPage /> },
      { path: 'farmers/f/:ownerUid', element: <FarmerPublicProfilePage /> },
      { path: 'farmers', element: <FarmersPage /> },
      { path: 'local-food', element: <LocalFoodPage /> },
      { path: 'farmer-rank', element: <FarmerRankPage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'posts', element: <SimplePostsPage /> },
    ],
  },
]);
