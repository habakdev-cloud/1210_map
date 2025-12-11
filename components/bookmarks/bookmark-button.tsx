/**
 * @file bookmark-button.tsx
 * @description 관광지 상세페이지 북마크 버튼 컴포넌트
 *
 * 사용자가 관광지를 북마크(즐겨찾기)할 수 있는 기능을 제공합니다.
 * Supabase를 사용하여 북마크 정보를 저장하고, Clerk 인증을 확인합니다.
 *
 * 주요 기능:
 * - 북마크 상태 확인 (Supabase 조회)
 * - 북마크 추가/제거 기능
 * - 인증된 사용자 확인 (Clerk)
 * - 로그인하지 않은 경우 로그인 유도
 * - 로딩 상태 표시
 * - 에러 처리 및 토스트 메시지
 *
 * @see {@link /docs/PRD.md} - MVP 2.4.5 북마크 기능
 * @see {@link /docs/DESIGN.md} - 상세페이지 레이아웃
 */

"use client";

import { useState, useEffect } from "react";
import { Star, StarOff, Loader2 } from "lucide-react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getBookmark, addBookmark, removeBookmark } from "@/lib/api/supabase-api";

interface BookmarkButtonProps {
  /** 관광지 콘텐츠 ID */
  contentId: string;
  /** 버튼 크기 (기본값: "default") */
  size?: "default" | "sm" | "lg" | "icon";
  /** 버튼 variant (기본값: "outline") */
  variant?: "default" | "outline" | "ghost" | "link";
  /** 버튼 클래스명 */
  className?: string;
}

/**
 * 관광지 상세페이지 북마크 버튼 컴포넌트
 */
export default function BookmarkButton({
  contentId,
  size = "default",
  variant = "outline",
  className,
}: BookmarkButtonProps) {
  const { isLoaded, userId } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // 클라이언트 마운트 확인

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * 북마크 상태 조회
   */
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      if (!isLoaded) {
        return;
      }

      // 로그인하지 않은 경우
      if (!userId) {
        setIsBookmarked(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const bookmarked = await getBookmark(contentId);
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error("북마크 상태 조회 실패:", error);
        setIsBookmarked(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarkStatus();
  }, [contentId, isLoaded, userId]);

  // SSR과 CSR 초기 렌더를 동일하게 맞추기 위해 마운트 이전에는 기본 버튼을 고정 렌더
  if (!isMounted) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={className}
        aria-label="북마크"
      >
        <StarOff className="w-4 h-4 mr-2" aria-hidden="true" />
        북마크
      </Button>
    );
  }

  /**
   * 북마크 토글 (추가/제거)
   */
  const handleToggleBookmark = async () => {
    // 로그인하지 않은 경우
    if (!userId) {
      toast.info("북마크 기능을 사용하려면 로그인이 필요합니다.");
      return;
    }

    try {
      setIsToggling(true);

      if (isBookmarked) {
        // 북마크 제거
        const result = await removeBookmark(contentId);
        if (result.success) {
          setIsBookmarked(false);
          toast.success("북마크에서 제거되었습니다.");
        } else {
          toast.error(result.error || "북마크 제거에 실패했습니다.");
        }
      } else {
        // 북마크 추가
        const result = await addBookmark(contentId);
        if (result.success) {
          setIsBookmarked(true);
          toast.success("북마크에 추가되었습니다.");
        } else {
          // 중복 북마크인 경우는 이미 추가된 것으로 처리
          if (result.error?.includes("이미 북마크")) {
            setIsBookmarked(true);
            toast.info("이미 북마크된 관광지입니다.");
          } else {
            toast.error(result.error || "북마크 추가에 실패했습니다.");
          }
        }
      }
    } catch (error) {
      console.error("북마크 토글 실패:", error);
      toast.error("북마크 처리 중 오류가 발생했습니다.");
    } finally {
      setIsToggling(false);
    }
  };

  // 로딩 중
  if (!isLoaded || isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={className}
        aria-label="북마크 로딩 중"
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
        로딩 중
      </Button>
    );
  }

  // 로그인하지 않은 경우
  if (!userId) {
    return (
      <SignInButton mode="modal">
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label="로그인하여 북마크 추가"
        >
          <StarOff className="w-4 h-4 mr-2" aria-hidden="true" />
          북마크
        </Button>
      </SignInButton>
    );
  }

  // 북마크 버튼
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleBookmark}
      disabled={isToggling}
      className={className}
      aria-label={isBookmarked ? "북마크 제거" : "북마크 추가"}
      aria-pressed={isBookmarked}
    >
      {isToggling ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
          처리 중
        </>
      ) : isBookmarked ? (
        <>
          <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" aria-hidden="true" />
          북마크됨
        </>
      ) : (
        <>
          <StarOff className="w-4 h-4 mr-2" aria-hidden="true" />
          북마크
        </>
      )}
    </Button>
  );
}




