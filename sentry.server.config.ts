/**
 * @file sentry.server.config.ts
 * @description Sentry 서버 사이드 설정
 *
 * 서버 사이드에서 발생하는 에러를 캡처하고 Sentry로 전송합니다.
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
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // 에러 필터링
    beforeSend(event, hint) {
      // 개발 환경에서는 일부 에러는 Sentry로 전송하지 않음
      if (process.env.NODE_ENV === "development") {
        const error = hint.originalException;
        if (error && typeof error === "object" && "message" in error) {
          const errorMessage = String(error.message);
          // 개발 모드 경고는 무시
          if (errorMessage.includes("Warning:")) {
            return null;
          }
        }
      }
      return event;
    },
  });
}

