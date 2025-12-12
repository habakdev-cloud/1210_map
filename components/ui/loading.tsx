/**
 * @file loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 페이지 로딩, 버튼 로딩 상태 등에 사용되는 로딩 스피너 컴포넌트입니다.
 * lucide-react의 Loader2 아이콘을 사용하며, 크기 변형이 가능합니다.
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  /**
   * 로딩 스피너 크기
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 텍스트 표시 여부
   */
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function Loading({ size = "md", className, text }: LoadingProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

/**
 * 전체 페이지 로딩 컴포넌트
 */
export function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading size="lg" text="로딩 중..." />
    </div>
  );
}






