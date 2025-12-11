/**
 * @file share-button.tsx
 * @description 관광지 상세페이지 공유 버튼 컴포넌트
 *
 * 사용자가 관광지 상세페이지 URL을 복사할 수 있는 기능을 제공합니다.
 * 클립보드 API를 사용하여 URL을 복사하고, 복사 완료 토스트 메시지를 표시합니다.
 *
 * 주요 기능:
 * - URL 복사 기능 (클립보드 API)
 * - HTTPS 환경 확인 및 fallback 처리
 * - 복사 완료 토스트 메시지
 * - Share/Link 아이콘 버튼
 *
 * @see {@link /docs/PRD.md} - MVP 2.4.5 공유 기능
 * @see {@link /docs/DESIGN.md} - 상세페이지 레이아웃
 */

"use client";

import { useState } from "react";
import { Share2, Link, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
  /** 공유할 URL (기본값: 현재 페이지 URL) */
  url?: string;
  /** 버튼 크기 (기본값: "default") */
  size?: "default" | "sm" | "lg" | "icon";
  /** 버튼 variant (기본값: "outline") */
  variant?: "default" | "outline" | "ghost" | "link";
  /** 버튼 클래스명 */
  className?: string;
}

/**
 * 관광지 상세페이지 공유 버튼 컴포넌트
 */
export default function ShareButton({
  url,
  size = "default",
  variant = "outline",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  /**
   * URL 복사 기능
   */
  const handleShare = async () => {
    // URL 결정: prop으로 전달된 URL 또는 현재 페이지 URL
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    if (!shareUrl) {
      toast.error("공유할 URL을 찾을 수 없습니다.");
      return;
    }

    try {
      // HTTPS 환경 확인
      if (typeof window !== "undefined" && window.isSecureContext) {
        // 클립보드 API 사용 (최신 방법)
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("링크가 복사되었습니다.");
        setTimeout(() => setCopied(false), 2000);
      } else {
        // HTTPS가 아닌 경우 fallback (document.execCommand)
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand("copy");
          if (successful) {
            setCopied(true);
            toast.success("링크가 복사되었습니다.");
            setTimeout(() => setCopied(false), 2000);
          } else {
            throw new Error("복사 실패");
          }
        } catch (err) {
          throw err;
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error("URL 복사 실패:", err);
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
      aria-label={copied ? "링크가 복사되었습니다" : "링크 복사"}
      aria-pressed={copied}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" aria-hidden="true" />
          복사됨
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
          공유
        </>
      )}
    </Button>
  );
}


