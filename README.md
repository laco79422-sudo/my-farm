# 나만의 농장 (웹 MVP) · my-farm

AI 기반 식물 진단과 재배 기록, 포인트 농장 플랫폼.  
식물·작물 사진으로 진단하고, 생산일지·포인트·상점·커뮤니티·로컬푸드까지 이어지는 **반응형 웹앱**입니다.  
**Vite + React 19 + TypeScript**이며, 데이터는 **Firebase**(Auth / Firestore / Storage)로 연동할 수 있습니다. Firebase를 넣지 않으면 **데모 모드**로 UI를 그대로 이용할 수 있습니다.

---

## 사전 준비

- **Node.js** 18 이상 (LTS 권장)
- **npm** (Node에 포함)
- (선택) **Firebase** 프로젝트 — [Firebase Console](https://console.firebase.google.com/)

```bash
node -v
npm -v
```

---

## 실행 방법

### 1) 의존성 설치

```bash
npm install
```

### 2) 로컬 개발 서버

```bash
npm run dev
```

브라우저에서 **http://localhost:5173** (또는 터미널에 표시된 주소)로 접속합니다.

### 3) 프로덕션 빌드

```bash
npm run build
```

- `tsc`로 타입 검사 후 `vite build`가 **`dist/`** 에 정적 파일을 생성합니다.
- 미리보기: `npm run preview`

---

## 환경 변수 (.env)

1. 프로젝트 루트의 **`.env.example`** 을 복사해 **`.env`** 파일을 만듭니다.
2. Firebase 콘솔의 웹 앱 구성 값을 아래 키에 맞게 채웁니다.

| 변수 | 설명 |
|------|------|
| `VITE_FIREBASE_API_KEY` | Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `xxx.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | 프로젝트 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage 버킷 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 발신자 ID |
| `VITE_FIREBASE_APP_ID` | 앱 ID |

- 이름은 반드시 **`VITE_` 접두사**여야 브라우저 번들에 포함됩니다.
- **`.env`는 Git에 커밋하지 마세요.** (`.gitignore`에 포함됨)
- **`.env.example`** 만 저장소에 올립니다. (비어 있는 템플릿)

Firebase 콘솔에서 **Authentication**(이메일·Google), **Firestore**, **Storage**를 켜는 단계는 **`FIREBASE_SETUP.md`** 를 참고하세요.

---

## Firebase 없이 실행할 때

6개 환경 변수가 비어 있거나 일부만 있으면 앱은 **Firebase를 초기화하지 않습니다.**  
화면 상단에 안내 배너가 보일 수 있으며, **로컬 데모 로그인·포인트 원장** 등으로 UI를 계속 사용할 수 있습니다. 앱이 빌드/실행 단계에서 중단되지 않도록 구성되어 있습니다.

---

## GitHub에 올리기 전 주의사항

**커밋하면 안 되는 것**

- **`.env`** — API 키·앱 ID 등 실제 비밀이 들어갑니다.
- **`node_modules/`** — `.gitignore`로 제외됩니다.
- **`dist/`** — Netlify가 빌드하므로 저장소에 넣을 필요 없습니다. (제외 권장)

**커밋해도 되는 것**

- **`.env.example`** — 변수 이름만 있는 템플릿
- **`public/_redirects`**, **`netlify.toml`** — 배포 설정

저장소를 처음 만든 뒤:

```bash
git init
git add .
git status   # .env 가 목록에 없는지 확인
git commit -m "Initial commit"
git remote add origin https://github.com/<계정>/<저장소>.git
git branch -M main
git push -u origin main
```

---

## Netlify + GitHub 연동 배포

### Netlify에 입력할 값

| 항목 | 값 |
|------|-----|
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

**이름 정리:** 소스 안의 정적 파일 폴더는 Vite 기준 영문 **`public/`** 입니다. Netlify **Publish directory**에는 빌드 출력인 **`dist`** 만 넣습니다. (UI에서 저장소·사이트를 “공개(Public)”로 둘 때의 **Public** 과, 폴더 이름 **public** 은 서로 다른 개념입니다.)

이 저장소의 **`netlify.toml`** 에도 동일한 설정이 들어 있어, 저장소 연결 시 자동으로 잡히는 경우가 많습니다.

### 환경 변수 (Netlify)

**Site configuration → Environment variables** 에 로컬 `.env`와 **동일한 이름**으로 다음을 등록합니다.

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

값을 바꾼 뒤에는 **재배포**해야 클라이언트 번들에 반영됩니다.

### SPA 라우팅

- **`public/_redirects`**: `/* /index.html 200` — Netlify가 `dist`에 복사합니다.
- **`netlify.toml`**: `[[redirects]]` 로 동일 규칙을 보강합니다.

### Google 로그인 (배포 후)

Firebase 콘솔 → **Authentication → Settings → Authorized domains** 에  
**`localhost`** 와 **Netlify 도메인**(`xxx.netlify.app` 등)을 추가하세요.

---

## 기술 스택

- React 19, TypeScript, Vite 8  
- React Router, Zustand  
- Firebase Auth / Firestore / Storage  
- PWA (`vite-plugin-pwa`)

---

## 추가 문서

| 파일 | 내용 |
|------|------|
| `FIREBASE_SETUP.md` | Firebase 프로젝트·규칙 설정 |
| `DEPLOY_NETLIFY.md` | Netlify 배포 보충 설명 |
| `FIRESTORE_SCHEMA.md` | 컬렉션 구조 참고 |

---

## 라이선스

개인·학습용 예시입니다. 필요에 따라 수정해 사용하세요.
