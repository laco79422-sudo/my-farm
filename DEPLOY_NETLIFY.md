# Netlify 배포 (나만의 농장)

## 준비

- Node 18+ 권장
- `npm run build`가 로컬에서 성공해야 합니다.

## 배포 옵션 A: Git 연동 (권장)

1. GitHub/GitLab/Bitbucket에 저장소를 푸시합니다.
2. [Netlify](https://www.netlify.com/) → **Add new site** → **Import an existing project**
3. 저장소를 연결한 뒤 설정:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. **Environment variables**에 Firebase `VITE_FIREBASE_*` 6개를 모두 등록합니다. (로컬 `.env`와 동일한 이름)
5. **Deploy site**

이후 `main` 브랜치 푸시마다 자동 빌드됩니다.

## 배포 옵션 B: CLI

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

## SPA 라우팅

- `public/_redirects`에 `/* /index.html 200` 규칙이 있어 직접 URL 접속 시에도 React 라우터가 동작합니다.
- `netlify.toml`에도 동일한 리다이렉트가 있어 중복 정의됩니다(둘 중 하나만 써도 됨).

## 빌드 실패 시

- `VITE_*` 변수가 빌드 시점에 없으면 Firebase 초기화가 스킵됩니다. 배포 환경 변수를 확인하세요.
- TypeScript 오류는 `npm run build`에서 `tsc`로 걸립니다. 로컬에서 먼저 해결하세요.
