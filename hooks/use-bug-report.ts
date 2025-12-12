/**
 * @file use-bug-report.ts
 * @description 자동 버그 리포트 훅
 *
 * 에러 발생 시 자동으로 버그 리포트를 제출하는 훅입니다.
 * React Error Boundary나 전역 에러 핸들러에서 사용할 수 있습니다.
 *
 * 주요 기능:
 * - 에러 발생 시 자동으로 버그 리포트 제출
 * - 현재 페이지 URL, 사용자 에이전트 자동 수집
 * - 에러 스택 자동 포함
 * - 중복 제출 방지
 */

"use client";

import { useCallback, useRef } from "react";
import { submitBugReport } from "@/lib/api/bug-report-api";
import { toast } from "sonner";

interface UseBugReportOptions {
  /**
   * 자동 제출 활성화 여부 (기본값: true)
   */
  autoSubmit?: boolean;
  /**
   * 에러 발생 시 토스트 메시지 표시 여부 (기본값: true)
   */
  showToast?: boolean;
}

/**
 * 자동 버그 리포트 훅
 * 
 * @param options - 훅 옵션
 * @returns 버그 리포트 제출 함수
 */
export function useBugReport(options: UseBugReportOptions = {}) {
  const { autoSubmit = true, showToast = true } = options;
  const reportedErrors = useRef<Set<string>>(new Set());

  /**
   * 에러를 버그 리포트로 제출
   * 
   * @param error - 에러 객체
   * @param context - 추가 컨텍스트 정보
   */
  const reportError = useCallback(
    async (
      error: Error,
      context?: {
        title?: string;
        description?: string;
        additionalInfo?: Record<string, unknown>;
      }
    ) => {
      // 중복 제출 방지 (같은 에러 메시지는 한 번만 제출)
      const errorKey = `${error.message}-${error.stack?.slice(0, 100)}`;
      if (reportedErrors.current.has(errorKey)) {
        return;
      }
      reportedErrors.current.add(errorKey);

      // 최대 10개까지만 저장 (메모리 관리)
      if (reportedErrors.current.size > 10) {
        const firstKey = reportedErrors.current.values().next().value;
        reportedErrors.current.delete(firstKey);
      }

      try {
        // 현재 페이지 URL과 사용자 에이전트 수집
        const pageUrl = typeof window !== "undefined" ? window.location.href : undefined;
        const userAgent = typeof window !== "undefined" ? navigator.userAgent : undefined;

        // 버그 리포트 제출
        const result = await submitBugReport({
          title: context?.title || `자동 리포트: ${error.name || "Error"}`,
          description:
            context?.description ||
            `에러가 자동으로 감지되어 리포트되었습니다.\n\n에러 메시지: ${error.message}\n\n${
              context?.additionalInfo
                ? `추가 정보:\n${JSON.stringify(context.additionalInfo, null, 2)}\n\n`
                : ""
            }재현 방법: 위의 에러가 발생한 상황을 설명해주세요.`,
          pageUrl,
          userAgent,
          errorStack: error.stack || undefined,
        });

        if (result.success) {
          if (showToast) {
            toast.success("버그가 자동으로 리포트되었습니다.");
          }
        } else {
          if (showToast) {
            toast.error("버그 리포트 제출에 실패했습니다.");
          }
        }
      } catch (reportError) {
        console.error("[useBugReport] 버그 리포트 제출 에러:", reportError);
        if (showToast) {
          toast.error("버그 리포트 제출 중 오류가 발생했습니다.");
        }
      }
    },
    [showToast]
  );

  /**
   * 전역 에러 핸들러 설정
   */
  const setupGlobalErrorHandler = useCallback(() => {
    if (typeof window === "undefined" || !autoSubmit) {
      return;
    }

    // 전역 에러 핸들러
    const handleError = (event: ErrorEvent) => {
      const error = new Error(event.message);
      error.stack = event.error?.stack;
      reportError(error, {
        title: "전역 에러 감지",
        description: "브라우저에서 전역 에러가 발생했습니다.",
      });
    };

    // Promise rejection 핸들러
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
      reportError(error, {
        title: "Promise Rejection 감지",
        description: "처리되지 않은 Promise rejection이 발생했습니다.",
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    // 클린업 함수 반환
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [autoSubmit, reportError]);

  return {
    reportError,
    setupGlobalErrorHandler,
  };
}

