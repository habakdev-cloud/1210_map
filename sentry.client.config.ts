/**
 * @file sentry.client.config.ts
 * @description Sentry 클라이언트 사이드 설정
 *
 * 브라우저에서 발생하는 에러를 캡처하고 Sentry로 전송합니다.
 * 환경변수 NEXT_PUBLIC_SENTRY_DSN이 없으면 Sentry를 비활성화합니다.
 */

import * as Sentry from "@sentry/nextjs";

// Sentry DSN이 없으면 초기화하지 않음
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // 환경 설정
    environment: process.env.NODE_ENV || "development",
    
    // 샘플링 비율 (0.0 ~ 1.0)
    // 프로덕션에서는 0.1 (10%)로 설정하여 트래픽 제어
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // 세션 리플레이 설정 (선택 사항)
    replaysSessionSampleRate: 0.1, // 10%의 세션 리플레이
    replaysOnErrorSampleRate: 1.0, // 에러 발생 시 100% 리플레이
    
    // 에러 필터링 (개발 환경에서 콘솔 에러 무시)
    beforeSend(event, hint) {
      // 개발 환경에서는 콘솔 에러는 Sentry로 전송하지 않음
      if (process.env.NODE_ENV === "development") {
        const error = hint.originalException;
        if (error && typeof error === "object" && "message" in error) {
          const errorMessage = String(error.message);
          // React 개발 모드 경고는 무시
          if (errorMessage.includes("Warning:") || errorMessage.includes("ReactDOM")) {
            return null;
          }
        }
      }
      return event;
    },
    
    // 사용자 컨텍스트 (Clerk 사용자 정보 포함)
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false, // 텍스트 마스킹 비활성화 (개인정보 주의)
        blockAllMedia: false, // 미디어 블록 비활성화
      }),
    ],
  });
}

