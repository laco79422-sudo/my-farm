import type { FarmerFarmCard } from '../types';

export const dummyFarmerFarms: FarmerFarmCard[] = [
  {
    farmId: 'ff1',
    farmName: '햇살 텃밭',
    coverImageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&q=80',
    representativeCrop: '딸기',
    activePlantCount: 12,
    lastActivityAt: '2025-03-26',
  },
  {
    farmId: 'ff2',
    farmName: '바람 언덕 농장',
    coverImageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    representativeCrop: '토마토',
    activePlantCount: 8,
    lastActivityAt: '2025-03-25',
  },
  {
    farmId: 'ff3',
    farmName: '도시 옥상 팜',
    coverImageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    representativeCrop: '허브 믹스',
    activePlantCount: 24,
    lastActivityAt: '2025-03-24',
  },
];
