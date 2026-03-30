/**
 * Firestore 및 앱 전역에서 사용하는 타입 정의
 * 컬렉션 경로: users/{uid}, farms/{farmId}, ...
 */

import type { Timestamp } from 'firebase/firestore';

/** Firebase Timestamp 또는 ISO 문자열 (더미/직렬화 호환) */
export type FireDate = Timestamp | string;

/** 사용자 등급 라벨 */
export type UserGrade = '초급 농부' | '중급 농부' | '고급 농부' | '마스터 농부';

/** users/{uid} — 기본 필드: uid, name, email, points */
export interface UserDoc {
  uid: string;
  email: string;
  name?: string;
  points: number;
  /** 이전 스키마 호환 */
  displayName?: string;
  nickname?: string;
  grade?: UserGrade;
  createdAt?: FireDate;
  lastLoginAt?: FireDate;
  photoURL?: string;
}

/** farms/{farmId} */
export interface FarmDoc {
  farmId: string;
  ownerUid: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  /** 대표 작물 이름 */
  representativeCrop?: string;
  createdAt: FireDate;
  updatedAt: FireDate;
}

/** 작물 상태 */
export type PlantStatus = 'growing' | 'ready' | 'harvested';

/** plants/{plantId} */
export interface PlantDoc {
  plantId: string;
  farmId: string;
  ownerUid: string;
  name: string;
  status: PlantStatus;
  startedAt: FireDate;
  expectedHarvestAt: FireDate;
  expectedYieldKg: number;
  latestPhotoUrl?: string;
  createdAt: FireDate;
}

/** daily_logs/{logId} — 생산일지 */
export interface DailyLogDoc {
  logId: string;
  plantId: string;
  farmId: string;
  ownerUid: string;
  date: FireDate; // 기록일 (자정 기준)
  memo: string;
  imageUrl: string;
  createdAt: FireDate;
  /** 일지 작성으로 포인트 지급 여부 */
  pointsGranted?: boolean;
}

/** 병충해 후보 */
export interface DiagnosisPestCandidate {
  name: string;
  confidence: number; // 0~100
}

/** diagnoses/{diagnosisId} */
export interface DiagnosisDoc {
  diagnosisId: string;
  ownerUid: string;
  imageUrl: string;
  plantName: string;
  /** 병충해 후보 TOP 3 */
  topPests: DiagnosisPestCandidate[];
  overallConfidence: number;
  symptomDescription: string;
  careGuide: string;
  createdAt: FireDate;
  /** Storage 경로 (추적용) */
  storagePath?: string;
}

/** market_products/{productId} — 로컬푸드 마켓 */
export interface MarketProductDoc {
  productId: string;
  farmId: string;
  sellerUid: string;
  farmName: string;
  name: string;
  category: '채소' | '과일' | '허브' | '기타';
  quantityLabel: string;
  price: number;
  imageUrl: string;
  createdAt: FireDate;
  /** UI용 배지: 당일수확, 무료배송 등 */
  badge?: string;
  /** 원산지·지역 */
  origin?: string;
  /** 평점 0~5 */
  rating?: number;
  /** 리뷰 수 */
  reviewCount?: number;
  /** 배송/픽업 안내 */
  shippingNote?: string;
}

/** posts/{postId} — 간단 텍스트 게시글 */
export interface PostDoc {
  postId: string;
  content: string;
  uid: string;
  createdAt: FireDate;
}

/** 커뮤니티 카테고리 */
export type CommunityCategory = '게시글' | '재배 팁' | '질문답변';

/** community_posts/{postId} */
export interface CommunityPostDoc {
  postId: string;
  authorUid: string;
  authorName: string;
  title: string;
  content: string;
  category: CommunityCategory;
  imageUrl?: string;
  commentCount: number;
  likeCount: number;
  createdAt: FireDate;
}

/** 포인트 변동 사유 코드 */
export type PointReasonCode =
  | 'signup'
  | 'first_plant'
  | 'daily_log'
  | 'diagnosis'
  | 'reward_ad'
  | 'community_post'
  | 'product_request'
  | 'purchase'
  | 'charge'
  | 'admin'
  | 'local_food_enroll'
  | 'other';

/** point_logs/{pointLogId} */
export interface PointLogDoc {
  pointLogId: string;
  uid: string;
  delta: number;
  balanceAfter: number;
  reason: PointReasonCode;
  description?: string;
  createdAt: FireDate;
  /** 관련 엔티티 (선택) */
  relatedId?: string;
}

/** 상품 의뢰 상태 */
export type ProductRequestStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'registered'
  /** 등록 후 상점·마켓에서 판매 중 */
  | 'selling';

/** requests/{requestId} */
export interface ProductRequestDoc {
  requestId: string;
  requesterUid: string;
  productName: string;
  category: string;
  description: string;
  reason: string;
  imageUrl?: string;
  status: ProductRequestStatus;
  createdAt: FireDate;
  updatedAt: FireDate;
}

/** 카드 상단 추천 배지 (초보·경험 유도용) */
export type ShopRecommendUiTag = '초보 추천' | '빠른 성장' | '인기';

/** 씨앗·키트 난이도 */
export type SeedDifficulty = '초급' | '중급' | '어려움';

/** 상점 상품 (정적/시드용 — market_products와 별개로 UI 시드 가능) */
export interface ShopItem {
  id: string;
  name: string;
  category: string;
  pricePoints: number;
  imageUrl: string;
  expectedYield?: string;
  growPeriodOrUse: string;
  /** 구매 유도 태그 (씨앗 등) */
  tags?: string[];
  /** 카드용 추천 배지 — 초보 추천 / 빠른 성장 / 인기 */
  recommendUiTags?: ShopRecommendUiTag[];
  /** 재배 난이도 (씨앗·키트) */
  difficulty?: SeedDifficulty;
  /** 난이도 원문 표기 (예: 매우 쉬움) */
  difficultyLabel?: string;
  /** 발아 기간 텍스트 */
  germinationPeriod?: string;
  /** 수확(또는 채취)까지 기간 */
  harvestPeriod?: string;
  /** 추천 재배 방식 */
  recommendedGrowMethod?: string;
  /** 예상 수확량 (g, 표시용 문구) */
  expectedYieldGrams?: string;
  /** 예상 수확량 하한(g) */
  expectedYieldMinG?: number;
  /** 예상 수확량 상한(g) */
  expectedYieldMaxG?: number;
  /** 재수확 설명 (카드용 문장) */
  regrowInfoText?: string;
  /** 적정 재배 온도 (표시용) */
  optimalTemperature?: string;
  /** 재수확 가능 여부 */
  regrow?: boolean;
  /** 재수확 시 권장 채취량(g) 분할 */
  regrowHarvestGrams?: number[] | null;
  /** 내 농장 재배 시작 폼에 넣을 작물명 */
  growStartPresetName?: string;
  /** 스타터 키트 구성 요약 */
  kitIncludes?: string;
  /** 추천 카드 한 줄 설명 */
  shortDesc?: string;
  /** 참고용 원화 표시 (결제 연동 전) */
  referencePriceWon?: number;
  /** 상점 필터: 문제 유형 */
  problemTags?: ('영양' | '병해' | '환경' | '일반')[];
  /** 상점 필터: 작물 */
  cropTags?: string[];
  /** 목록 정렬 — 낮을수록 위(샐러드 씨앗 우선 등) */
  listPriority?: number;
}

/** 더미 농부 농장 카드 */
export interface FarmerFarmCard {
  farmId: string;
  farmName: string;
  coverImageUrl: string;
  representativeCrop: string;
  activePlantCount: number;
  lastActivityAt: string;
}
