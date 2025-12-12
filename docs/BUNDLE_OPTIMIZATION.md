# 번들 최적화 가이드

## 사용하지 않는 의존성

### react-icons
- **상태**: 테스트 페이지에서만 사용 (`app/auth-test/page.tsx`, `app/storage-test/page.tsx`)
- **권장사항**: 프로덕션 코드에서는 `lucide-react`를 사용하므로, 테스트 페이지를 제거하거나 `lucide-react`로 마이그레이션 후 제거 가능
- **제거 명령**: `pnpm remove react-icons`

### tw-animate-css
- **상태**: `app/globals.css`에서 사용 중
- **권장사항**: 유지 (필수 의존성)

## 번들 분석 실행

```bash
# 번들 분석 실행
pnpm analyze

# 또는 직접 실행
ANALYZE=true pnpm build
```

분석 결과는 브라우저에서 자동으로 열립니다.

## 트리 쉐이킹 확인

### Named Import 사용 확인

모든 라이브러리에서 Named import를 사용하는지 확인:

```typescript
// ✅ 좋은 예: Named import
import { BarChart, Bar, XAxis, YAxis } from "recharts";

// ❌ 나쁜 예: Default import (전체 라이브러리 로드)
import Recharts from "recharts";
```

### 최적화된 Import 경로

일부 라이브러리는 서브 경로에서 import할 수 있습니다:

```typescript
// ✅ 좋은 예: 필요한 모듈만 import
import { format } from "date-fns/format";

// ❌ 나쁜 예: 전체 라이브러리 import
import { format } from "date-fns";
```

## 번들 크기 목표

- **초기 번들 (First Load JS)**: < 200KB
- **페이지별 청크**: < 100KB
- **공유 청크**: < 150KB

