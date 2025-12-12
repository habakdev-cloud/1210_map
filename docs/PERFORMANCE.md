# 성능 최적화 가이드

## Lighthouse 점수 측정

### 측정 방법

1. **프로덕션 빌드 실행**
   ```bash
   pnpm build
   pnpm start
   ```

2. **Lighthouse CLI로 측정**
   ```bash
   # Lighthouse CLI 설치 (전역)
   npm install -g lighthouse
   
   # 또는 npx 사용 (권장)
   npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html --view
   ```

3. **주요 페이지별 측정**
   - 홈페이지: `http://localhost:3000/`
   - 통계 페이지: `http://localhost:3000/stats`
   - 상세페이지: `http://localhost:3000/places/[contentId]` (실제 contentId 사용)

4. **브라우저 DevTools 사용**
   - Chrome DevTools > Lighthouse 탭
   - 프로덕션 빌드에서 측정 권장

### 목표 점수

- **Performance**: > 80
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90

### 측정 결과 기록

측정 후 다음 정보를 기록하세요:

- Performance 점수: ___
- 주요 개선 포인트:
  - ___
  - ___

## 번들 분석

### 번들 분석 실행

```bash
# @next/bundle-analyzer가 설정된 후
ANALYZE=true pnpm build
```

### 분석 결과 확인

- 브라우저에서 자동으로 번들 분석 리포트가 열립니다
- 각 청크의 크기와 의존성을 확인할 수 있습니다

## 성능 최적화 체크리스트

- [x] 이미지 최적화 (Next.js Image 컴포넌트 사용)
- [ ] 코드 분할 (동적 import 적용)
- [ ] 번들 크기 최적화
- [ ] API 캐싱 전략 개선
- [ ] Lighthouse 점수 측정 및 개선

