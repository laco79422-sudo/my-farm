import type { FarmProfile, GrowPlant, MarketListing } from '../types/farmHub';
import { getRemainingSellableForUi } from './salesLimits';
import type { PublishMarketListingInput } from '../stores/useFarmHubStore';
import { MIN_SALE_REGISTER_GRAMS } from './canRegisterSale';

/**
 * 수확 직후 자동 판매 등록용 페이로드.
 * 프로필·지역 미입력이거나 판매 가능량이 너무 적으면 null.
 */
export function buildAutoListingAfterHarvest(
  plant: GrowPlant,
  profile: FarmProfile | null,
  listings: MarketListing[],
): PublishMarketListingInput | null {
  if (!plant.harvest || plant.status !== 'harvested') return null;
  if (!profile?.city?.trim() || !profile.district?.trim()) return null;
  if (!profile.farmerName?.trim() || !profile.farmName?.trim()) return null;

  const remaining = getRemainingSellableForUi(plant, listings);
  if (remaining < MIN_SALE_REGISTER_GRAMS) return null;

  const grams = MIN_SALE_REGISTER_GRAMS;

  const priceWon = Math.max(3000, Math.round(grams * 12));

  return {
    plantId: plant.id,
    farmerName: profile.farmerName.trim(),
    farmName: profile.farmName.trim(),
    city: profile.city.trim(),
    district: profile.district.trim(),
    productName: plant.name,
    grams: Math.round(grams),
    priceWon,
    growMethod: plant.growMethod,
    harvestDate: plant.harvest.harvestedAt.slice(0, 10),
    fulfillment: 'pickup',
  };
}
