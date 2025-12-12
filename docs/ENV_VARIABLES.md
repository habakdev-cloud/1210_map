# 환경변수 목록 및 분류

## 개요

이 문서는 My Trip 프로젝트에서 사용하는 모든 환경변수를 분류하고 설명합니다.

## 환경변수 분류

### 필수 환경변수 (Required)

앱이 정상 작동하기 위해 반드시 설정해야 하는 환경변수입니다.

#### 한국관광공사 API
- **`NEXT_PUBLIC_TOUR_API_KEY`** (필수)
  - 용도: 한국관광공사 공공 API 인증 키
  - 사용 위치: `lib/api/tour-api.ts`
  - 클라이언트/서버 모두 사용 가능
  - 발급 방법: https://www.data.go.kr/data/15101578/openapi.do

- **`TOUR_API_KEY`** (선택, 서버 전용)
  - 용도: 서버 사이드에서 사용할 API 키 (보안 강화)
  - 사용 위치: `lib/api/tour-api.ts`
  - 우선순위: `TOUR_API_KEY`가 있으면 사용, 없으면 `NEXT_PUBLIC_TOUR_API_KEY` 사용
  - 참고: 서버 전용이므로 클라이언트에 노출되지 않음

#### 네이버 지도
- **`NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`** (필수)
  - 용도: 네이버 클라우드 플랫폼 Maps API 클라이언트 ID
  - 사용 위치: `components/naver-map.tsx`, `components/tour-detail/detail-map.tsx`
  - 발급 방법: https://www.ncloud.com/product/applicationService/maps
  - 참고: `NEXT_PUBLIC_` 접두사로 클라이언트에 노출됨 (공개되어도 안전)

#### Clerk 인증
- **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** (필수)
  - 용도: Clerk 인증 공개 키
  - 사용 위치: `app/layout.tsx` (ClerkProvider)
  - 클라이언트에 노출됨 (공개되어도 안전)

- **`CLERK_SECRET_KEY`** (필수, 서버 전용)
  - 용도: Clerk 인증 비밀 키
  - 사용 위치: Clerk 미들웨어, 서버 사이드 인증
  - 보안: 절대 클라이언트에 노출 금지

#### Supabase
- **`NEXT_PUBLIC_SUPABASE_URL`** (필수)
  - 용도: Supabase 프로젝트 URL
  - 사용 위치: `lib/supabase/*`
  - 클라이언트에 노출됨 (공개되어도 안전)

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (필수)
  - 용도: Supabase Anon 공개 키
  - 사용 위치: `lib/supabase/*`
  - 클라이언트에 노출됨 (공개되어도 안전, RLS 정책으로 보호)

- **`SUPABASE_SERVICE_ROLE_KEY`** (필수, 서버 전용)
  - 용도: Supabase Service Role 키 (RLS 우회)
  - 사용 위치: `lib/supabase/service-role.ts`
  - 보안: 절대 클라이언트에 노출 금지, 관리자 권한

### 선택적 환경변수 (Optional)

기본값이 있거나 선택적 기능을 위한 환경변수입니다.

#### 사이트 설정
- **`NEXT_PUBLIC_SITE_URL`** (선택)
  - 용도: 사이트 기본 URL (SEO, sitemap, robots.txt)
  - 사용 위치: `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`
  - 기본값: 없으면 동적 생성 (`VERCEL_URL` 또는 `localhost:3000`)
  - 예시: `https://my-trip.vercel.app`

#### Supabase Storage
- **`NEXT_PUBLIC_STORAGE_BUCKET`** (선택)
  - 용도: Supabase Storage 버킷명
  - 사용 위치: `app/storage-test/page.tsx`
  - 기본값: `"uploads"`

#### Clerk 설정
- **`NEXT_PUBLIC_CLERK_SIGN_IN_URL`** (선택)
  - 용도: Clerk 로그인 페이지 URL
  - 기본값: `"/sign-in"`

- **`NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`** (선택)
  - 용도: 로그인 후 리다이렉트 URL
  - 기본값: `"/"`

- **`NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`** (선택)
  - 용도: 회원가입 후 리다이렉트 URL
  - 기본값: `"/"`

### 자동 설정 환경변수 (Auto-configured)

Next.js 또는 배포 플랫폼에서 자동으로 설정되는 환경변수입니다.

- **`NODE_ENV`**
  - 용도: 실행 환경 구분 (`development`, `production`, `test`)
  - 설정: Next.js 자동 설정
  - 사용 위치: 여러 파일에서 개발/프로덕션 분기

- **`VERCEL_URL`**
  - 용도: Vercel 배포 시 자동 설정되는 배포 URL
  - 설정: Vercel 자동 설정
  - 사용 위치: `app/sitemap.ts`, `app/layout.tsx`, `app/robots.ts`

- **`ANALYZE`**
  - 용도: 번들 분석 도구 활성화
  - 설정: `ANALYZE=true pnpm build` 실행 시
  - 사용 위치: `next.config.ts`

## 보안 주의사항

### NEXT_PUBLIC_ 접두사

- `NEXT_PUBLIC_` 접두사가 있는 환경변수는 클라이언트 번들에 포함됩니다.
- 브라우저에서 `process.env.NEXT_PUBLIC_*`로 접근 가능합니다.
- 공개되어도 안전한 값만 사용해야 합니다 (예: 공개 API 키, 공개 URL).

### 서버 전용 키

다음 환경변수는 절대 클라이언트에 노출되어서는 안 됩니다:

- `CLERK_SECRET_KEY` - Clerk 비밀 키
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 관리자 키
- `TOUR_API_KEY` - 서버 전용 API 키 (선택)

### .gitignore 확인

`.env*` 파일이 `.gitignore`에 포함되어 있는지 확인하세요:

```gitignore
.env
.env.development*
.env.test*
.env.production*
.env.local*
```

## 환경변수 검증

프로덕션 배포 전 다음을 확인하세요:

1. 모든 필수 환경변수가 설정되었는지 확인
2. 서버 전용 키가 클라이언트 코드에 사용되지 않았는지 확인
3. `.env` 파일이 Git에 커밋되지 않았는지 확인

