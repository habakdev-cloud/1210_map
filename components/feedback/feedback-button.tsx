/**
 * @file feedback-button.tsx
 * @description 피드백 버튼 컴포넌트
 *
 * 피드백 폼을 열기 위한 버튼 컴포넌트입니다.
 * Footer나 Navbar에 통합하여 사용할 수 있습니다.
 */

"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "./feedback-form";

interface FeedbackButtonProps {
  /**
   * 버튼 크기
   */
  size?: "default" | "sm" | "lg" | "icon";
  /**
   * 버튼 variant
   */
  variant?: "default" | "outline" | "ghost" | "link";
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 피드백 버튼 컴포넌트
 */
export function FeedbackButton({
  size = "default",
  variant = "outline",
  className,
}: FeedbackButtonProps) {
  return (
    <FeedbackForm
      trigger={
        <Button
          size={size}
          variant={variant}
          className={className}
          aria-label="피드백 제출"
        >
          <MessageSquare className="w-4 h-4 mr-2" aria-hidden="true" />
          피드백
        </Button>
      }
    />
  );
}

