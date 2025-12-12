# PWA 지원 가이드

## 개요

My Trip 서비스는 PWA(Progressive Web App)를 지원하여 사용자가 모바일에서 앱처럼 설치하고 사용할 수 있습니다.

## 구현된 기능

### 1. PWA Manifest

- **파일**: `app/manifest.ts`
- **기능**: 앱 이름, 아이콘, 테마 색상, 표시 모드 등 정의
- **접근**: `/manifest.json` 또는 `/manifest.webmanifest`

### 2. Service Worker

- **패키지**: `next-pwa`
- **설정**: `next.config.ts`
- **기능**:
  - 자동 Service Worker 생성 및 등록
  - 오프라인 지원
  - 캐싱 전략 구현

### 3. 캐싱 전략

#### 정적 자산 (Cache First)
- 폰트: 1년 캐시
- 이미지: 24시간 캐시
- CSS/JS: 24시간 캐시
- Next.js 정적 파일: 1년 캐시

#### API 응답 (Network First)
- 한국관광공사 API: 1시간 캐시, 네트워크 우선
- Cross-origin 요청: 1시간 캐시, 네트워크 우선

### 4. 오프라인 페이지

- **파일**: `app/offline/page.tsx`
- **기능**: 오프라인 상태 안내 및 재시도 버튼

## 테스트 방법

### 1. 개발 환경에서 테스트

**주의**: next-pwa는 개발 환경에서 비활성화되어 있습니다 (`disable: process.env.NODE_ENV === "development"`).

프로덕션 빌드로 테스트:

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

### 2. Service Worker 확인

1. 브라우저 개발자 도구 열기 (F12)
2. **Application** 탭 선택
3. **Service Workers** 섹션 확인
   - Service Worker가 등록되어 있는지 확인
   - 상태가 "activated"인지 확인

### 3. Manifest 확인

1. 브라우저 개발자 도구 열기 (F12)
2. **Application** 탭 선택
3. **Manifest** 섹션 확인
   - 앱 이름, 아이콘, 테마 색상 등 확인
   - 오류가 없는지 확인

### 4. 오프라인 모드 테스트

1. 브라우저 개발자 도구 열기 (F12)
2. **Network** 탭 선택
3. **Offline** 체크박스 선택 (또는 "Throttling" > "Offline")
4. 페이지 새로고침
5. 오프라인 페이지가 표시되는지 확인
6. 캐시된 콘텐츠가 표시되는지 확인

### 5. 모바일 설치 테스트

#### Android (Chrome)
1. Chrome 브라우저에서 사이트 접속
2. 메뉴 (⋮) > **"홈 화면에 추가"** 선택
3. 설치 확인 대화상자에서 **"추가"** 클릭
4. 홈 화면에 앱 아이콘 생성 확인
5. 앱 아이콘 클릭하여 앱처럼 실행되는지 확인

#### iOS (Safari)
1. Safari 브라우저에서 사이트 접속
2. 공유 버튼 (□↑) 클릭
3. **"홈 화면에 추가"** 선택
4. 이름 확인 후 **"추가"** 클릭
5. 홈 화면에 앱 아이콘 생성 확인
6. 앱 아이콘 클릭하여 앱처럼 실행되는지 확인

### 6. Lighthouse PWA 점수 확인

```bash
# Lighthouse CLI 사용 (선택 사항)
pnpm lighthouse http://localhost:3000 --view --only-categories=pwa
```

또는 Chrome DevTools의 Lighthouse 탭에서 PWA 카테고리를 선택하여 테스트

**확인 사항**:
- ✅ Manifest가 유효한지
- ✅ Service Worker가 등록되어 있는지
- ✅ HTTPS 사용 (프로덕션)
- ✅ 오프라인에서 동작하는지
- ✅ 적절한 아이콘 크기 제공

## 주의사항

### 1. HTTPS 필수

PWA는 프로덕션 환경에서 HTTPS가 필요합니다 (localhost는 예외).

### 2. 개발 환경

next-pwa는 개발 환경에서 비활성화되어 있습니다. 프로덕션 빌드로 테스트해야 합니다.

### 3. Service Worker 업데이트

Service Worker가 업데이트되면:
- `skipWaiting: true` 설정으로 자동 활성화
- 사용자가 페이지를 새로고침하면 새 버전 사용

### 4. 캐시 관리

- 오래된 캐시는 자동으로 정리됩니다
- `maxEntries`와 `maxAgeSeconds`로 캐시 크기 제한

### 5. API 캐싱

- 민감한 데이터는 캐싱하지 않도록 주의
- 한국관광공사 API는 Network First 전략 사용 (최신 데이터 우선)

## 문제 해결

### Service Worker가 등록되지 않는 경우

1. 프로덕션 빌드인지 확인 (`pnpm build && pnpm start`)
2. `public/sw.js` 파일이 생성되었는지 확인
3. 브라우저 콘솔에서 에러 확인
4. `next.config.ts`의 `disable` 옵션 확인

### Manifest가 인식되지 않는 경우

1. `app/manifest.ts` 파일이 올바른지 확인
2. 빌드 후 `/manifest.json` 접근 가능한지 확인
3. 브라우저 개발자 도구에서 Manifest 섹션 확인

### 오프라인 모드가 작동하지 않는 경우

1. Service Worker가 활성화되어 있는지 확인
2. 캐시된 콘텐츠가 있는지 확인
3. 네트워크 탭에서 오프라인 모드 활성화 확인

## 참고 자료

- [Next.js PWA Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest)
- [next-pwa GitHub](https://github.com/shadowwalker/next-pwa)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

