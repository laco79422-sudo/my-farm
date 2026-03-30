import type { PlantDoc } from '../types';

/** 내 농장 더미 작물 */
export const dummyPlants: PlantDoc[] = [
  {
    plantId: 'p1',
    farmId: 'farm_demo',
    ownerUid: 'demo',
    name: '방울토마토',
    status: 'growing',
    startedAt: '2025-02-01',
    expectedHarvestAt: '2025-04-15',
    expectedYieldKg: 2.5,
    latestPhotoUrl:
      'https://images.unsplash.com/photo-1592841200221-a7b933ded94e?w=600&q=80',
    createdAt: '2025-02-01',
  },
  {
    plantId: 'p2',
    farmId: 'farm_demo',
    ownerUid: 'demo',
    name: '상추',
    status: 'ready',
    startedAt: '2025-02-20',
    expectedHarvestAt: '2025-03-28',
    expectedYieldKg: 1.2,
    latestPhotoUrl:
      'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&q=80',
    createdAt: '2025-02-20',
  },
];
