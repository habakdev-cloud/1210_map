# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하는 방법을 설명합니다.

## 📋 목차

1. [기본 설정](#기본-설정)
2. [커스텀 메시지 추가](#커스텀-메시지-추가)
3. [에러 메시지 커스터마이징](#에러-메시지-커스터마이징)
4. [지원 언어](#지원-언어)

---

## 기본 설정

프로젝트에는 이미 한국어 로컬라이제이션이 적용되어 있습니다.

### 현재 설정

`app/layout.tsx`에서 `ClerkProvider`에 한국어 로컬라이제이션을 적용합니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { clerkLocalization } from "@/lib/clerk/localization";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 로컬라이제이션 파일

`lib/clerk/localization.ts` 파일에서 기본 `koKR` 로컬라이제이션을 사용합니다:

```ts
import { koKR } from "@clerk/localizations";

export const clerkLocalization = {
  ...koKR,
  // 커스텀 메시지 추가 가능
};
```

---

## 커스텀 메시지 추가

기본 한국어 번역을 확장하여 특정 메시지를 커스터마이징할 수 있습니다.

### Sign Up 서브타이틀 변경 예제

```ts
import { koKR } from "@clerk/localizations";

export const clerkLocalization = {
  ...koKR,
  signUp: {
    ...koKR.signUp,
    start: {
      ...koKR.signUp?.start,
      subtitle: "{{applicationName}}에 접근하려면",
    },
  },
};
```

### 버튼 텍스트 변경 예제

```ts
export const clerkLocalization = {
  ...koKR,
  formButtonPrimary: "시작하기",
  formButtonReset: "초기화",
};
```

---

## 에러 메시지 커스터마이징

`unstable__errors` 키를 사용하여 에러 메시지를 커스터마이징할 수 있습니다.

### 예제: 접근 거부 에러 메시지

```ts
import { koKR } from "@clerk/localizations";

export const clerkLocalization = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "접근이 허용되지 않은 이메일 도메인입니다. 관리자에게 문의하세요.",
  },
};
```

### 사용 가능한 에러 키

Clerk의 모든 에러 키 목록은 [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)에서 확인할 수 있습니다. `unstable__errors` 객체를 검색하여 사용 가능한 키를 찾으세요.

---

## 지원 언어

Clerk는 다음 언어를 지원합니다:

| 언어 | 언어 코드 | 키 |
|------|----------|-----|
| 한국어 | ko-KR | `koKR` |
| 영어 (US) | en-US | `enUS` |
| 영어 (GB) | en-GB | `enGB` |
| 일본어 | ja-JP | `jaJP` |
| 중국어 (간체) | zh-CN | `zhCN` |
| 중국어 (번체) | zh-TW | `zhTW` |
| 스페인어 | es-ES | `esES` |
| 프랑스어 | fr-FR | `frFR` |
| 독일어 | de-DE | `deDE` |
| ... | ... | ... |

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization#languages)를 참고하세요.

---

## 주의사항

### 실험적 기능

⚠️ **중요**: Clerk 로컬라이제이션 기능은 현재 **실험적(experimental)** 상태입니다. 예상치 못한 동작이 발생할 수 있으며, 문제가 발생하면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요.

### 적용 범위

로컬라이제이션은 다음에만 적용됩니다:

- ✅ **Clerk 컴포넌트**: SignIn, SignUp, UserButton 등 애플리케이션에 포함된 Clerk 컴포넌트
- ❌ **Clerk Account Portal**: 호스팅된 [Clerk Account Portal](https://clerk.com/docs/guides/customizing-clerk/account-portal)은 영어로 유지됩니다

---

## 참고 자료

- 📖 [Clerk 로컬라이제이션 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)
- 📦 [@clerk/localizations 패키지](https://www.npmjs.com/package/@clerk/localizations)
- 📝 [영어 로컬라이제이션 파일 (참고용)](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)

---

## 요약

✅ **기본 설정**: `lib/clerk/localization.ts`에서 `koKR` 사용  
✅ **커스터마이징**: 필요시 메시지 오버라이드 가능  
✅ **에러 메시지**: `unstable__errors` 키로 커스터마이징  
⚠️ **실험적 기능**: 프로덕션 사용 전 충분한 테스트 권장

이제 Clerk 컴포넌트가 한국어로 표시됩니다! 🎉


