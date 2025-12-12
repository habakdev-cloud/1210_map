# 접근성 가이드

이 문서는 My Trip 프로젝트의 접근성 구현 가이드입니다.

## 목차

1. [ARIA 라벨 가이드](#aria-라벨-가이드)
2. [키보드 단축키](#키보드-단축키)
3. [색상 대비 기준](#색상-대비-기준)
4. [접근성 테스트](#접근성-테스트)

## ARIA 라벨 가이드

### 기본 원칙

- 모든 인터랙티브 요소에 명확한 `aria-label` 추가
- 아이콘 버튼은 `aria-hidden="true"` 설정
- 네비게이션 링크에 `aria-current="page"` 추가 (활성 링크)
- 폼 요소에 `aria-describedby` 연결 (에러 메시지 등)

### 구현된 ARIA 라벨

#### 네비게이션

- **메인 네비게이션**: `aria-label="메인 네비게이션"`
- **모바일 네비게이션**: `aria-label="모바일 네비게이션"`
- **활성 링크**: `aria-current="page"`

#### 버튼

- **뒤로가기 버튼**: `aria-label="뒤로가기"`
- **메뉴 토글 버튼**: `aria-label="메뉴 토글"`
- **테마 전환 버튼**: `aria-label="테마 전환"`
- **북마크 버튼**: `aria-label="북마크 추가"` / `aria-label="북마크 제거"`, `aria-pressed={isBookmarked}`
- **검색 버튼**: `aria-label="검색 실행"`
- **검색어 초기화 버튼**: `aria-label="검색어 초기화"`
- **필터 초기화 버튼**: `aria-label="필터 초기화"`
- **일괄 삭제 버튼**: `aria-label="선택한 N개 북마크 일괄 삭제"`

#### 폼 요소

- **검색 입력창**: `aria-label="관광지 검색"`
- **지역 선택**: `aria-label="지역 선택"`
- **관광 타입 선택**: `aria-label="관광 타입 선택"`
- **정렬 옵션 선택**: `aria-label="정렬 옵션 선택"`
- **전체 선택 체크박스**: `aria-label="전체 선택"`
- **개별 선택 체크박스**: `aria-label="{관광지명} 선택"`

#### 이미지 및 갤러리

- **이미지 버튼**: `aria-label="{이미지명} 전체화면 보기"`
- **이전 이미지 버튼**: `aria-label="이전 이미지"`
- **다음 이미지 버튼**: `aria-label="다음 이미지"`
- **이미지 갤러리**: `role="region"`, `aria-label="이미지 갤러리 (화살표 키로 네비게이션)"`

#### 차트

- **지역별 차트**: `role="region"`, `aria-label="지역별 관광지 분포 차트"`
- **타입별 차트**: `role="region"`, `aria-label="타입별 관광지 분포 차트"`

#### 링크 및 카드

- **관광지 카드**: `aria-label="{관광지명} 상세보기"`, `aria-current={isSelected ? "true" : undefined}`
- **주소 복사 버튼**: `aria-label="{주소} 주소 복사"`, `aria-pressed={addressCopied}`

## 키보드 단축키

### 전역 단축키

- **Tab**: 다음 포커스 가능한 요소로 이동
- **Shift + Tab**: 이전 포커스 가능한 요소로 이동
- **Enter / Space**: 버튼 또는 링크 활성화

### 페이지별 단축키

#### 홈페이지 (`/`)

- **Enter**: 검색 실행
- **Esc**: 검색어 초기화

#### 관광지 상세페이지 (`/places/[contentId]`)

- **화살표 키 (← →)**: 이미지 갤러리 네비게이션 (메인 갤러리 및 모달)
- **Esc**: 이미지 모달 닫기

#### 북마크 페이지 (`/bookmarks`)

- **Enter / Space**: 체크박스 선택/해제
- **Enter**: 정렬 옵션 선택

#### 모바일 메뉴

- **Esc**: 모바일 메뉴 닫기
- **Tab**: 메뉴 항목 간 이동

### 키보드 네비게이션 구현

#### 관광지 카드

```tsx
<Link
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // 클릭 동작 실행
    }
  }}
  tabIndex={0}
>
```

#### 검색창

```tsx
<Input
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleSearch(keyword);
    } else if (e.key === "Escape") {
      handleClear();
    }
  }}
/>
```

#### 이미지 갤러리

```tsx
<div
  onKeyDown={(e) => {
    if (e.key === "ArrowLeft") {
      swiperInstance.slidePrev();
    } else if (e.key === "ArrowRight") {
      swiperInstance.slideNext();
    }
  }}
  tabIndex={0}
>
```

## 색상 대비 기준

### WCAG AA 기준

- **일반 텍스트**: 4.5:1 대비율
- **큰 텍스트** (18pt 이상 또는 14pt 이상 굵은 글씨): 3:1 대비율
- **UI 컴포넌트** (버튼, 입력창 등): 3:1 대비율

### 주요 색상 조합

#### 라이트 모드

- **foreground / background**: `oklch(0.145 0 0)` / `oklch(1 0 0)` - 대비율 확인 필요
- **primary / primary-foreground**: `oklch(0.205 0 0)` / `oklch(0.985 0 0)` - 대비율 확인 필요
- **muted-foreground / muted**: `oklch(0.556 0 0)` / `oklch(0.97 0 0)` - 대비율 확인 필요

#### 다크 모드

- **foreground / background**: `oklch(0.985 0 0)` / `oklch(0.145 0 0)` - 대비율 확인 필요
- **primary / primary-foreground**: `oklch(0.922 0 0)` / `oklch(0.205 0 0)` - 대비율 확인 필요
- **muted-foreground / muted**: `oklch(0.708 0 0)` / `oklch(0.269 0 0)` - 대비율 확인 필요

### 색상 대비 확인 방법

1. **브라우저 개발자 도구** (Chrome DevTools)
   - Elements 탭에서 요소 선택
   - Computed 탭에서 실제 색상 값 확인
   - Lighthouse 탭에서 접근성 점수 확인

2. **온라인 도구**
   - [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
   - [Contrast Ratio](https://contrast-ratio.com/)

3. **자동화 도구**
   - Lighthouse (Chrome DevTools)
   - axe DevTools (브라우저 확장 프로그램)
   - eslint-plugin-jsx-a11y (코드 레벨 검사)

### 포커스 스타일

모든 인터랙티브 요소에 포커스 스타일이 적용되어 있습니다:

```css
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
```

## 접근성 테스트

### 테스트 체크리스트

#### 스크린 리더 테스트

- [ ] 모든 버튼과 링크가 스크린 리더로 읽힘
- [ ] 이미지에 적절한 alt 텍스트 제공
- [ ] 폼 요소에 라벨 연결
- [ ] 에러 메시지가 스크린 리더로 전달됨

#### 키보드 네비게이션 테스트

- [ ] Tab 키로 모든 인터랙티브 요소 접근 가능
- [ ] Enter/Space 키로 버튼/링크 활성화 가능
- [ ] Esc 키로 모달/메뉴 닫기 가능
- [ ] 화살표 키로 갤러리 네비게이션 가능
- [ ] 포커스 순서가 논리적임

#### 색상 대비 테스트

- [ ] 일반 텍스트 대비율 4.5:1 이상
- [ ] 큰 텍스트 대비율 3:1 이상
- [ ] UI 컴포넌트 대비율 3:1 이상
- [ ] 다크 모드에서도 기준 충족

#### Lighthouse 접근성 점수

- [ ] 접근성 점수 90점 이상
- [ ] 모든 자동 감지 항목 통과

### 테스트 도구

1. **Lighthouse** (Chrome DevTools)
   - 접근성 점수 측정
   - 자동 감지 항목 확인

2. **axe DevTools** (브라우저 확장 프로그램)
   - 실시간 접근성 검사
   - 상세한 문제점 보고

3. **스크린 리더**
   - NVDA (Windows)
   - VoiceOver (macOS/iOS)
   - JAWS (Windows)

4. **키보드 테스트**
   - Tab, Enter, Space, Esc 키 동작 확인
   - 포커스 순서 확인

## 참고 자료

- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM 접근성 가이드](https://webaim.org/)
- [MDN 접근성 가이드](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [ARIA 사양](https://www.w3.org/WAI-ARIA/)

