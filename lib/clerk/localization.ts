import { koKR } from "@clerk/localizations";

/**
 * Clerk 한국어 로컬라이제이션 설정
 *
 * 기본 koKR 로컬라이제이션을 확장하여 커스텀 메시지를 추가할 수 있습니다.
 * 
 * @see {@link https://clerk.com/docs/guides/customizing-clerk/localization Clerk 공식 문서}
 * 
 * @example
 * ```tsx
 * import { clerkLocalization } from '@/lib/clerk/localization';
 * 
 * <ClerkProvider localization={clerkLocalization}>
 *   ...
 * </ClerkProvider>
 * ```
 */
export const clerkLocalization = {
  ...koKR,
  
  // 필요시 커스텀 메시지 추가
  // 예: Sign Up 서브타이틀 커스터마이징
  // signUp: {
  //   ...koKR.signUp,
  //   start: {
  //     ...koKR.signUp?.start,
  //     subtitle: "{{applicationName}}에 접근하려면",
  //   },
  // },
  
  // 에러 메시지 커스터마이징
  unstable__errors: {
    ...koKR.unstable__errors,
    // 필요시 한국어 에러 메시지 커스터마이징
    // 예시:
    // not_allowed_access: "접근이 허용되지 않은 이메일 도메인입니다. 관리자에게 문의하세요.",
  },
};

