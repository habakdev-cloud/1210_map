/**
 * @file error.tsx
 * @description 세그먼트별 에러 바운더리
 *
 * Next.js App Router의 세그먼트별 에러 바운더리입니다.
 * 이 파일은 자식 세그먼트에서 발생한 에러를 캐치하여 사용자에게 표시합니다.
 *
 * 주요 기능:
 * - 에러 발생 시 자동으로 이 컴포넌트가 렌더링됨
 * - 에러 정보 로깅 (개발 환경)
 * - 사용자 친화적인 에러 메시지 표시
 * - 재시도 기능 (reset 함수)
 * - 홈으로 돌아가기 버튼
 *
 * @see {@link /docs/PRD.md} - Phase 6 최적화 & 배포
 * @see {@link /components/ui/error.tsx} - 에러 UI 컴포넌트
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 세그먼트별 에러 바운더리 컴포넌트
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (개발 환경에서 상세 정보 표시)
    if (process.env.NODE_ENV === "development") {
      console.error("에러 발생:", {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      });
    } else {
      // 프로덕션 환경에서는 최소한의 로깅
      console.error("에러 발생:", error.message);
    }

    // TODO: 프로덕션 환경에서 에러 모니터링 서비스로 전송 (Sentry 등)
  }, [error]);

  // 에러 타입에 따른 메시지 결정
  const getErrorMessage = () => {
    if (error.message.includes("Rate Limit") || error.message.includes("429")) {
      return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
    }
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "네트워크 연결을 확인해주세요.";
    }
    if (error.message.includes("404") || error.message.includes("Not Found")) {
      return "요청한 데이터를 찾을 수 없습니다.";
    }
    return "예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  };

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[600px] rounded-lg border border-destructive/50 bg-destructive/10 p-12">
          {/* 에러 아이콘 */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/20 mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>

          {/* 제목 */}
          <h1 className="text-3xl md:text-4xl font-bold text-destructive mb-4">
            오류가 발생했습니다
          </h1>

          {/* 에러 메시지 */}
          <div className="space-y-2 mb-8 text-center max-w-md">
            <p className="text-base text-muted-foreground">
              {getErrorMessage()}
            </p>
            {process.env.NODE_ENV === "development" && error.message && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                  상세 정보 (개발 모드)
                </summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-w-md">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button onClick={reset} size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

