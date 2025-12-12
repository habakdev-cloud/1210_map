/**
 * @file sentry.edge.config.ts
 * @description Sentry Edge Runtime 설정
 *
 * Edge Runtime에서 발생하는 에러를 캡처하고 Sentry로 전송합니다.
 * 환경변수 NEXT_PUBLIC_SENTRY_DSN이 없으면 Sentry를 비활성화합니다.
 */

import * as Sentry from "@sentry/nextjs";

// Sentry DSN이 없으면 초기화하지 않음
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // 환경 설정
    environment: process.env.NODE_ENV || "development",
    
    // 샘플링 비율
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}

