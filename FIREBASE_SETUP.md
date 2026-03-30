# Firebase 설정 가이드 (초보자용)

이 문서는 **처음 Firebase를 쓰는 분**도 따라 할 수 있도록 단계를 나눴습니다.  
목표는 **웹 앱에 Firebase를 연결**하고, 이 프로젝트의 **`.env`** 에 값을 넣는 것입니다.

---

## 0. 전체 흐름 (한눈에)

1. Google 계정으로 [Firebase Console](https://console.firebase.google.com/) 접속  
2. **프로젝트 만들기** → **웹 앱 추가**  
3. 콘솔에서 **Authentication**, **Firestore**, **Storage** 켜기  
4. 콘솔에 보이는 **설정 값**을 복사해 프로젝트 루트의 **`.env`** 파일에 붙여넣기  
5. `npm run dev` 로 앱 실행 → 로그인·저장 테스트  

---

## 1. Firebase 프로젝트 만들기

1. [Firebase Console](https://console.firebase.google.com/) 접속  
2. **프로젝트 추가** 클릭  
3. 프로젝트 이름 입력 (예: `my-farm-app`)  
4. Google Analytics는 **사용해도 되고, 안 해도 됩니다** (처음엔 끄고 진행해도 무방)

---

## 2. 웹 앱 등록 및 설정 값 복사

1. 프로젝트 콘솔 **홈**에서 **웹 앱 추가** (`</>` 아이콘) 클릭  
2. 앱 닉네임 입력 후 **앱 등록**  
3. **Firebase SDK 추가** 단계에서 **구성**을 선택합니다.  
4. 표시되는 **firebaseConfig** 객체에 아래와 같은 값이 있습니다:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

이 값들이 곧 프로젝트의 **`.env`** 에 들어갑니다.

---

## 3. `.env` 파일 만들기

1. 프로젝트 **루트 폴더**( `package.json` 이 있는 곳)에 **`.env`** 파일을 만듭니다.  
2. **`.env.example`** 파일을 복사해 이름만 `.env` 로 바꾼 뒤, 아래처럼 채웁니다.

| .env 변수 | firebaseConfig 키 | 설명 |
|-----------|---------------------|------|
| `VITE_FIREBASE_API_KEY` | `apiKey` | API 키 |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` | 보통 `프로젝트ID.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` | 프로젝트 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` | Storage 버킷 주소 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | 발신자 ID |
| `VITE_FIREBASE_APP_ID` | `appId` | 앱 ID |

**중요:**

- 변수 이름은 **반드시 `VITE_` 로 시작**해야 Vite가 클라이언트에 넣어 줍니다.  
- 값 앞뒤에 **따옴표는 붙이지 않아도** 됩니다. (공백이나 특수문자가 없으면 `KEY=value` 형태로 충분)  
- `.env` 는 **Git에 커밋하지 마세요.** (이미 `.gitignore`에 포함)

**예시:**

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=my-farm.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-farm
VITE_FIREBASE_STORAGE_BUCKET=my-farm.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef
```

저장 후 **개발 서버를 껐다가 다시** `npm run dev` 하면 반영됩니다.

---

## 4. Authentication (이메일/비밀번호)

1. 콘솔 왼쪽 **Authentication** → **시작하기**  
2. **Sign-in method** 탭 → **이메일/비밀번호** → **사용 설정** → 저장  

이제 앱에서 회원가입·로그인 API를 호출할 수 있습니다.

---

## 5. Firestore Database

1. **Firestore Database** → **데이터베이스 만들기**  
2. 처음 시작은 **테스트 모드**로 만들어도 됩니다. (나중에 규칙을 `firestore.rules.example` 참고해 강화)  
3. **위치(region)** 는 가까운 리전(예: `asia-northeast3`)을 선택하세요.

---

## 6. Storage

1. **Storage** → **시작하기**  
2. 기본 보안 규칙으로 시작한 뒤, 배포 전 `storage.rules.example` 을 참고해 수정하세요.

---

## 7. 복합 인덱스 (진단 이력 쿼리)

앱에서 `diagnoses` 컬렉션에 대해 `ownerUid` + `createdAt` 순으로 조회합니다.  
처음 실행 시 콘솔에 **인덱스 생성 링크**가 뜨면, 링크를 눌러 **복합 인덱스**를 만들어 주세요.

---

## 8. 코드에서 Firebase가 쓰이는 위치

| 역할 | 파일 |
|------|------|
| 환경 변수 읽기 | `src/firebase/config.ts` |
| 앱 초기화 | `src/firebase/index.ts` |
| 회원가입·로그인 | `src/services/authService.ts` |
| Firestore 예시 | `src/services/firestoreService.ts` |
| 이미지 업로드 | `src/services/storageService.ts` |

---

## 9. 문제 해결

| 증상 | 확인할 것 |
|------|-----------|
| 상단에 노란 배너만 보임 | `.env` 가 없거나 `VITE_FIREBASE_API_KEY` 가 비어 있음 |
| 로그인 시 “Firebase가 설정되지 않았습니다” | `.env` 저장 후 서버 재시작 |
| Firestore 권한 오류 | 콘솔 규칙이 너무 엄격하거나, 테스트 모드 기간 만료 |
| Storage 업로드 실패 | Storage 생성 여부, 규칙, 버킷 이름 |

---

## 10. 다음 단계

- 보안: `firestore.rules.example`, `storage.rules.example` 를 적용하고 본인 서비스에 맞게 수정  
- 배포: Netlify **Environment variables** 에 로컬과 동일한 `VITE_*` 키를 등록  

추가로 `README.md` 의 **Netlify 배포**·**빌드** 절차를 함께 보시면 됩니다.
