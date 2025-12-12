/**
 * @file global-error.tsx
 * @description 전역 에러 바운더리
 *
 * Next.js App Router의 전역 에러 바운더리입니다.
 * root layout을 포함한 모든 에러를 캐치합니다.
 *
 * 주요 기능:
 * - root layout의 에러를 포함한 모든 에러 캐치
 * - html, body 태그 포함 필수 (root layout을 대체)
 * - 최소한의 UI만 제공 (ThemeProvider, ClerkProvider 등 사용 불가)
 * - 기본 스타일만 사용 (Tailwind CSS)
 *
 * 주의사항:
 * - root layout을 대체하므로 최소한의 컴포넌트만 사용
 * - 커스텀 Provider는 사용 불가
 * - 기본적인 에러 메시지와 재시도 버튼만 제공
 *
 * @see {@link /docs/PRD.md} - Phase 6 최적화 & 배포
 */

"use client";

import { useEffect } from "react";
import { BugReportButton } from "@/components/feedback/bug-report-button";
import * as Sentry from "@sentry/nextjs";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 전역 에러 바운더리 컴포넌트
 * html, body 태그를 포함해야 함 (root layout을 대체)
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 에러 로깅
    console.error("전역 에러 발생:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });

    // Sentry로 에러 전송 (환경변수가 있을 때만)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          errorBoundary: "global",
        },
        extra: {
          digest: error.digest,
        },
      });
    }
  }, [error]);

  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            {/* 에러 아이콘 */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* 제목 */}
            <h1 className="text-2xl font-bold text-foreground">
              예기치 않은 오류가 발생했습니다
            </h1>

            {/* 메시지 */}
            <p className="text-muted-foreground">
              애플리케이션에서 심각한 오류가 발생했습니다.
              <br />
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>

            {/* 재시도 버튼 */}
            <div className="flex flex-col gap-3">
              <button
                onClick={reset}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                다시 시도
              </button>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                홈으로 돌아가기
              </button>
              <div className="flex justify-center">
                <BugReportButton
                  size="lg"
                  variant="outline"
                  initialErrorStack={error.stack}
                  initialPageUrl={
                    typeof window !== "undefined"
                      ? window.location.href
                      : undefined
                  }
                />
              </div>
            </div>

            {/* 개발 환경에서만 상세 정보 표시 */}
            {process.env.NODE_ENV === "development" && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground mb-2">
                  상세 정보 (개발 모드)
                </summary>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto max-h-64">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
