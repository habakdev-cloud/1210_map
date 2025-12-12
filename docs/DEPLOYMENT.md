# 배포 가이드

## 개요

My Trip 프로젝트를 프로덕션 환경에 배포하기 위한 가이드입니다. Vercel 배포를 기준으로 작성되었습니다.

## 사전 준비

### 1. 필수 서비스 계정 준비

다음 서비스의 계정과 API 키가 필요합니다:

- **한국관광공사 API**: https://www.data.go.kr/data/15101578/openapi.do
- **네이버 클라우드 플랫폼**: https://www.ncloud.com/product/applicationService/maps
- **Clerk**: https://clerk.com
- **Supabase**: https://supabase.com
- **Vercel**: https://vercel.com

### 2. 프로덕션 환경변수 준비

모든 필수 환경변수의 프로덕션 값을 준비하세요. 각 서비스의 대시보드에서 프로덕션 키를 발급받을 수 있습니다.

## Vercel 배포

### 1. Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. **"Add New..."** → **"Project"** 클릭
3. GitHub 저장소 연결 또는 직접 배포

### 2. 환경변수 설정

Vercel Dashboard → **Settings** → **Environment Variables**에서 다음 환경변수를 설정하세요:

#### 필수 환경변수

**한국관광공사 API**
```
NEXT_PUBLIC_TOUR_API_KEY=your_production_tour_api_key
TOUR_API_KEY=your_production_tour_api_key  # 선택사항
```

**네이버 지도**
```
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_production_naver_map_client_id
```

**Clerk**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
```

**Supabase**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

#### 선택적 환경변수

**사이트 URL**
```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

**Supabase Storage**
```
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

**Clerk 리다이렉트 URL**
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### 3. 환경별 설정

Vercel에서는 환경별로 환경변수를 설정할 수 있습니다:

- **Production**: 프로덕션 환경
- **Preview**: Pull Request 배포
- **Development**: 개발 브랜치 배포

각 환경에 맞는 키를 설정하세요 (예: Clerk의 경우 `pk_live_*`는 Production, `pk_test_*`는 Preview/Development).

### 4. 빌드 설정

Vercel은 Next.js 프로젝트를 자동으로 감지하므로 추가 설정이 필요 없습니다.

**빌드 명령어**: `pnpm build` (자동 감지)
**출력 디렉토리**: `.next` (자동 감지)

### 5. 배포 실행

1. **"Deploy"** 버튼 클릭
2. 빌드 로그 확인
3. 배포 완료 후 URL 확인

## 환경변수별 상세 가이드

### 한국관광공사 API 키

**발급 방법**:
1. https://www.data.go.kr/data/15101578/openapi.do 접속
2. "활용신청" 클릭
3. API 키 발급
4. 발급받은 키를 환경변수에 설정

**보안 주의사항**:
- API 키는 공개되어도 사용량 제한만 있으므로 상대적으로 안전
- 하지만 남용 방지를 위해 노출을 최소화하는 것이 좋음

### 네이버 지도 클라이언트 ID

**발급 방법**:
1. https://www.ncloud.com 접속 및 로그인
2. **Console** → **Services** → **AI·NAVER API** → **Maps**
3. **Application 등록** → **Web Dynamic Map** 선택
4. Client ID 발급
5. 발급받은 Client ID를 환경변수에 설정

**주의사항**:
- 신용카드 등록이 필요할 수 있음
- 월 10,000,000건 무료 제공
- 도메인 등록 필요 (Vercel 배포 후 도메인 등록)

### Clerk 인증 키

**발급 방법**:
1. https://clerk.com 접속 및 로그인
2. **Dashboard** → **API Keys**
3. **Publishable Key**와 **Secret Key** 복사
4. 환경변수에 설정

**보안 주의사항**:
- `CLERK_SECRET_KEY`는 절대 클라이언트에 노출 금지
- 프로덕션 환경에서는 `pk_live_*`, `sk_live_*` 사용
- 개발 환경에서는 `pk_test_*`, `sk_test_*` 사용

### Supabase 키

**발급 방법**:
1. https://supabase.com 접속 및 로그인
2. 프로젝트 선택
3. **Settings** → **API**
4. **Project URL**, **anon public**, **service_role secret** 복사
5. 환경변수에 설정

**보안 주의사항**:
- `SUPABASE_SERVICE_ROLE_KEY`는 RLS를 우회하는 관리자 키
- 절대 클라이언트에 노출 금지
- 공개 저장소에 커밋하지 마세요

## 배포 후 확인사항

### 1. 환경변수 검증

배포 후 다음을 확인하세요:

1. **홈페이지 동작 확인**: `/` 접속하여 관광지 목록 표시 확인
2. **지도 동작 확인**: 지도가 정상적으로 로드되는지 확인
3. **인증 동작 확인**: 로그인/회원가입 기능 확인
4. **북마크 기능 확인**: 로그인 후 북마크 추가/삭제 확인

### 2. 에러 로그 확인

Vercel Dashboard → **Deployments** → **Functions**에서 에러 로그를 확인하세요.

### 3. 성능 확인

- Lighthouse 점수 측정
- 페이지 로딩 속도 확인
- API 응답 시간 확인

## 보안 체크리스트

배포 전 다음 사항을 확인하세요:

- [ ] 모든 필수 환경변수가 설정되었는지 확인
- [ ] 서버 전용 키(`CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)가 클라이언트 코드에 사용되지 않았는지 확인
- [ ] `.env` 파일이 Git에 커밋되지 않았는지 확인
- [ ] `.gitignore`에 `.env*` 파일이 포함되어 있는지 확인
- [ ] 프로덕션 환경변수가 개발 키가 아닌 프로덕션 키인지 확인
- [ ] 네이버 지도 Client ID에 프로덕션 도메인이 등록되었는지 확인
- [ ] Clerk에서 프로덕션 도메인이 허용 목록에 추가되었는지 확인

## 문제 해결

### 환경변수가 인식되지 않는 경우

1. Vercel Dashboard에서 환경변수가 올바르게 설정되었는지 확인
2. 환경변수 이름에 오타가 없는지 확인
3. 배포를 다시 실행 (환경변수 변경 후 재배포 필요)

### API 키 관련 에러

1. API 키가 올바르게 발급되었는지 확인
2. API 키 사용량 제한에 도달하지 않았는지 확인
3. 네이버 지도의 경우 도메인이 등록되었는지 확인

### 인증 관련 에러

1. Clerk에서 도메인이 허용 목록에 추가되었는지 확인
2. Clerk 키가 프로덕션 키(`pk_live_*`)인지 확인
3. 리다이렉트 URL이 올바르게 설정되었는지 확인

## 추가 리소스

- [Next.js 배포 문서](https://nextjs.org/docs/deployment)
- [Vercel 환경변수 가이드](https://vercel.com/docs/projects/environment-variables)
- [Clerk 배포 가이드](https://clerk.com/docs/deployments/overview)
- [Supabase 프로덕션 가이드](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

