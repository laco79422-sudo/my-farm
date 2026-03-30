/** 로컬푸드점 입점 농부 프로필 (로컬 / 추후 users 확장 필드) */
export interface LocalFoodVendor {
  ownerUid: string;
  enrolledAt: string;
  openingFeePoints: number;
  lastActivityAt: string;
  /** 0~5 */
  reviewAvg: number;
}
