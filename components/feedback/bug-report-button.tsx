/**
 * @file bug-report-button.tsx
 * @description 버그 리포트 버튼 컴포넌트
 *
 * 버그 리포트 폼을 열기 위한 버튼 컴포넌트입니다.
 * 에러 페이지나 다른 곳에 통합하여 사용할 수 있습니다.
 */

"use client";

import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BugReportForm } from "./bug-report-form";

interface BugReportButtonProps {
  /**
   * 버튼 크기
   */
  size?: "default" | "sm" | "lg" | "icon";
  /**
   * 버튼 variant
   */
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 초기 에러 스택 (에러 바운더리에서 전달)
   */
  initialErrorStack?: string;
  /**
   * 초기 페이지 URL (에러 바운더리에서 전달)
   */
  initialPageUrl?: string;
}

/**
 * 버그 리포트 버튼 컴포넌트
 */
export function BugReportButton({
  size = "default",
  variant = "outline",
  className,
  initialErrorStack,
  initialPageUrl,
}: BugReportButtonProps) {
  return (
    <BugReportForm
      initialErrorStack={initialErrorStack}
      initialPageUrl={initialPageUrl}
      trigger={
        <Button
          size={size}
          variant={variant}
          className={className}
          aria-label="버그 리포트 제출"
        >
          <Bug className="w-4 h-4 mr-2" aria-hidden="true" />
          버그 리포트
        </Button>
      }
    />
  );
}

