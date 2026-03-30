# Firestore 스키마 (MVP 기준)

TypeScript 인터페이스는 `src/types/index.ts`에 정의되어 있습니다.

---

## `users/{uid}`

| 필드 | 타입 | 설명 |
|------|------|------|
| `uid` | string | Auth UID |
| `email` | string | 이메일 |
| `nickname` | string | 표시 이름 |
| `grade` | string | 예: `초급 농부` |
| `points` | number | 현재 포인트 |
| `createdAt` | timestamp | 가입일 |
| `lastLoginAt` | timestamp | 마지막 로그인 |
| `photoURL` | string (optional) | 프로필 이미지 |

회원가입 시 `signUpWithEmail`에서 생성합니다.

---

## `farms/{farmId}`

| 필드 | 타입 | 설명 |
|------|------|------|
| `ownerUid` | string | 소유자 |
| `name` | string | 농장 이름 |
| `description` | string (optional) | 소개 |
| `coverImageUrl` | string (optional) | 대표 이미지 |
| `representativeCrop` | string (optional) | 대표 작물 |
| `createdAt` / `updatedAt` | timestamp | |

---

## `plants/{plantId}`

| 필드 | 타입 | 설명 |
|------|------|------|
| `farmId` | string | 소속 농장 |
| `ownerUid` | string | |
| `name` | string | 작물명 |
| `status` | string | `growing` \| `ready` \| `harvested` |
| `startedAt` | timestamp | 시작일 |
| `expectedHarvestAt` | timestamp | 예상 수확일 |
| `expectedYieldKg` | number | 예상 생산량(kg) |
| `latestPhotoUrl` | string (optional) | 최근 사진 |
| `createdAt` | timestamp | |

---

## `daily_logs/{logId}`

| 필드 | 타입 | 설명 |
|------|------|------|
| `plantId` | string | |
| `farmId` | string | |
| `ownerUid` | string | |
| `date` | timestamp | 기록일 |
| `memo` | string | 메모 |
| `imageUrl` | string | Storage URL |
| `pointsGranted` | boolean (optional) | 일지 포인트 지급 여부 |
| `createdAt` | timestamp | |

---

## `diagnoses/{diagnosisId}`

| 필드 | 타입 | 설명 |
|------|------|------|
| `ownerUid` | string | |
| `imageUrl` | string | |
| `plantName` | string | |
| `topPests` | array | `{ name, confidence }` 최대 3 |
| `overallConfidence` | number | 0~100 |
| `symptomDescription` | string | |
| `careGuide` | string | |
| `storagePath` | string (optional) | Storage 경로 |
| `createdAt` | timestamp | |

**인덱스:** `ownerUid` ASC + `createdAt` DESC (쿼리용)

---

## `market_products/{productId}`

로컬푸드 마켓 상품. 등록 UI 연동 시 사용.

---

## `community_posts/{postId}`

| 필드 | 타입 | 설명 |
|------|------|------|
| `authorUid` | string | |
| `authorName` | string | |
| `title` | string | |
| `content` | string | |
| `category` | string | `게시글` \| `재배 팁` \| `질문답변` |
| `imageUrl` | string (optional) | |
| `commentCount` / `likeCount` | number | |
| `createdAt` | timestamp | |

---

## `point_logs/{pointLogId}`

| 필드 | 타입 | 설명 |
|------|------|------|
| `uid` | string | |
| `delta` | number | 증감 |
| `balanceAfter` | number | 이후 잔액 |
| `reason` | string | `signup`, `daily_log`, `diagnosis` 등 |
| `description` | string (optional) | |
| `relatedId` | string (optional) | 관련 엔티티 ID |
| `createdAt` | timestamp | |

---

## `requests/{requestId}`

상품 의뢰.

| 필드 | 타입 | 설명 |
|------|------|------|
| `requesterUid` | string | |
| `productName` | string | |
| `category` | string | |
| `description` | string | |
| `reason` | string | 필수 이유 |
| `imageUrl` | string (optional) | |
| `status` | string | `pending` → `reviewing` → `approved` \| `rejected` → `registered` |
| `createdAt` / `updatedAt` | timestamp | |

---

## 포인트 규칙 (예시)

| 이벤트 | 포인트 |
|--------|--------|
| 회원가입 | +1000 |
| 첫 작물 등록 | +200 |
| 생산일지 | +50 |
| 진단 실행 | -20 (차감 시) 또는 +20 (설계에 따라) |
| 게시글 작성 | +30 |

`src/services/pointService.ts`의 `POINT_RULES` 참고.
