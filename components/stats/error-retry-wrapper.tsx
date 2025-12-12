/**
 * @file error-retry-wrapper.tsx
 * @description 에러 재시도 래퍼 컴포넌트
 *
 * 서버 컴포넌트에서 발생한 에러를 표시하고 재시도 기능을 제공하는 클라이언트 컴포넌트입니다.
 * router.refresh()를 사용하여 서버 컴포넌트를 재렌더링합니다.
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 요구사항 (2.6절)
 */

"use client";

import { useRouter } from "next/navigation";
import { Error } from "@/components/ui/error";

/**
 * 에러 재시도 래퍼 컴포넌트 Props
 */
interface ErrorRetryWrapperProps {
  /** 에러 메시지 */
  message: string;
  /** 에러 타입 */
  type?: "api" | "network" | "unknown";
}

/**
 * 에러 재시도 래퍼 컴포넌트
 *
 * 서버 컴포넌트에서 발생한 에러를 표시하고, 재시도 버튼을 제공합니다.
 * 재시도 버튼 클릭 시 router.refresh()를 호출하여 서버 컴포넌트를 재렌더링합니다.
 *
 * @param props - 컴포넌트 Props
 * @param props.message - 에러 메시지
 * @param props.type - 에러 타입 (기본값: "api")
 */
export default function ErrorRetryWrapper({
  message,
  type = "api",
}: ErrorRetryWrapperProps) {
  const router = useRouter();

  /**
   * 재시도 핸들러
   * router.refresh()를 호출하여 서버 컴포넌트를 재렌더링합니다.
   */
  const handleRetry = () => {
    router.refresh();
  };

  return (
    <div className="p-6 border border-border rounded-lg bg-card min-h-[400px] md:min-h-[500px] flex items-center justify-center">
      <Error message={message} type={type} onRetry={handleRetry} />
    </div>
  );
}


