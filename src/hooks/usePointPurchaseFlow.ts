import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { grantRewardAdPoints } from '../components/reward/RewardPointHandler';
import { recordRewardAdSessionComplete } from '../services/rewardAdPolicy';
import { POINT_RULES } from '../services/pointService';
import { addEarnHistory, loadPointState } from '../services/pointLedger';
import { isFirebaseConfigured } from '../firebase';
import { useToastStore } from '../stores/useToastStore';
import type { ShopItem } from '../types';

/**
 * 포인트 기반 구매 시도 + 부족 시 리워드 광고 (진단 결과 이후 등)
 */
export function usePointPurchaseFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isInitialized, sessionUid, resolvedPoints } = useAuth();
  const [adOpen, setAdOpen] = useState(false);
  const [adBonusPoints, setAdBonusPoints] = useState(0);
  const [adCompleting, setAdCompleting] = useState(false);

  const demoLedgerBalance =
    isLoggedIn && !isFirebaseConfigured() && sessionUid ? loadPointState(sessionUid).currentPoint : null;
  const basePoints = demoLedgerBalance ?? resolvedPoints ?? 0;
  const effectiveBalance = basePoints + adBonusPoints;

  const tryRequireLogin = useCallback(() => {
    if (isLoggedIn) return true;
    navigate('/login', { state: { from: location.pathname } });
    return false;
  }, [isLoggedIn, navigate, location.pathname]);

  const canAfford = useCallback(
    (item: ShopItem) => effectiveBalance >= item.pricePoints,
    [effectiveBalance],
  );

  const tryBuyWithPoints = useCallback(
    (item: ShopItem, onAfford: () => void) => {
      if (!isInitialized) return;
      if (!tryRequireLogin()) return;
      if (isLoggedIn && isFirebaseConfigured() && resolvedPoints === null) {
        useToastStore.getState().show('포인트 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      if (!canAfford(item)) {
        setAdOpen(true);
        return;
      }
      onAfford();
    },
    [isInitialized, isLoggedIn, tryRequireLogin, canAfford, resolvedPoints],
  );

  const handleAdCompleted = useCallback(async () => {
    setAdCompleting(true);
    let granted = false;
    try {
      if (isFirebaseConfigured() && sessionUid != null && resolvedPoints !== null) {
        const r = await grantRewardAdPoints({
          uid: sessionUid,
          currentBalance: resolvedPoints,
        });
        granted = r.granted;
      }
      if (!granted) {
        if (!isFirebaseConfigured() && sessionUid) {
          addEarnHistory(sessionUid, '리워드 광고 시청', POINT_RULES.rewardAd);
          granted = true;
        } else {
          setAdBonusPoints((b) => b + POINT_RULES.rewardAd);
        }
      }
      recordRewardAdSessionComplete({ pointsGranted: granted });
    } finally {
      setAdCompleting(false);
      setAdOpen(false);
    }
  }, [sessionUid, resolvedPoints]);

  return {
    adOpen,
    setAdOpen,
    adCompleting,
    effectiveBalance,
    tryBuyWithPoints,
    handleAdCompleted,
    tryRequireLogin,
    canAfford,
  };
}
