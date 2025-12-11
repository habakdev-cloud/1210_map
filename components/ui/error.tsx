/**
 * @file error.tsx
 * @description 에러 메시지 컴포넌트
 *
 * API 에러, 네트워크 에러 등을 사용자 친화적으로 표시하는 컴포넌트입니다.
 * 재시도 버튼을 포함하여 사용자가 쉽게 에러를 복구할 수 있도록 합니다.
 */

"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorProps {
  /**
   * 에러 메시지
   */
  message: string;
  /**
   * 재시도 함수
   */
  onRetry?: () => void;
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 에러 타입
   */
  type?: "api" | "network" | "unknown";
}

const errorMessages = {
  api: "데이터를 불러오는 중 오류가 발생했습니다.",
  network: "네트워크 연결을 확인해주세요.",
  unknown: "알 수 없는 오류가 발생했습니다.",
};

export function Error({ message, onRetry, className, type = "unknown" }: ErrorProps) {
  const defaultMessage = errorMessages[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center",
        className
      )}
    >
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-destructive">오류 발생</h3>
        <p className="text-sm text-muted-foreground">
          {message || defaultMessage}
        </p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          다시 시도
        </Button>
      )}
    </div>
  );
}

/**
 * 인라인 에러 메시지 컴포넌트 (작은 에러 표시용)
 */
interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-destructive", className)}>
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}





