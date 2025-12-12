/**
 * @file tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 검색창 UI를 제공하는 컴포넌트입니다.
 * 헤더와 메인 영역 모두에서 사용할 수 있으며, 크기를 조절할 수 있습니다.
 *
 * 주요 기능:
 * - 검색어 입력
 * - 엔터 키 또는 버튼 클릭으로 검색 실행
 * - 검색 중 로딩 스피너 표시
 * - URL 쿼리 파라미터와 동기화
 * - 검색어 초기화 기능
 *
 * @see {@link /docs/PRD.md} - MVP 2.3 키워드 검색
 * @see {@link /docs/DESIGN.md} - 검색창 디자인
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TourSearchProps {
  /** 검색창 크기 (small: 헤더용, large: 메인 영역용) */
  size?: "small" | "large";
  /** 초기 검색어 */
  initialKeyword?: string;
  /** 검색 실행 핸들러 (선택 사항, 없으면 URL 업데이트만) */
  onSearch?: (keyword: string) => void;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 검색 컴포넌트
 */
export default function TourSearch({
  size = "small",
  initialKeyword = "",
  onSearch,
  isLoading = false,
  className,
}: TourSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(initialKeyword || searchParams.get("keyword") || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const prevUrlKeywordRef = useRef<string>("");

  // URL 파라미터 변경 시 검색어 동기화 (외부에서 URL이 변경된 경우만)
  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";
    // URL의 keyword가 실제로 변경되었을 때만 state 업데이트
    // 이렇게 하면 사용자가 입력하는 동안에는 덮어쓰지 않음
    if (urlKeyword !== prevUrlKeywordRef.current) {
      prevUrlKeywordRef.current = urlKeyword;
      setKeyword(urlKeyword);
    }
  }, [searchParams]); // keyword를 의존성에서 제거하여 입력 중 덮어쓰기 방지

  // 검색 실행 함수
  const handleSearch = (searchKeyword: string) => {
    const trimmedKeyword = searchKeyword.trim();
    
    if (trimmedKeyword === "") {
      // 검색어가 비어있으면 keyword 파라미터 제거
      const params = new URLSearchParams(searchParams.toString());
      params.delete("keyword");
      params.delete("pageNo"); // 검색 변경 시 페이지 리셋
      router.push(`/?${params.toString()}`, { scroll: false });
      return;
    }

    // URL 업데이트
    const params = new URLSearchParams(searchParams.toString());
    params.set("keyword", trimmedKeyword);
    params.delete("pageNo"); // 검색 변경 시 페이지 리셋
    router.push(`/?${params.toString()}`, { scroll: false });

    // 커스텀 핸들러가 있으면 실행
    if (onSearch) {
      onSearch(trimmedKeyword);
    }
  };

  // 엔터 키 및 Esc 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(keyword);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleClear();
    }
  };

  // 검색 버튼 클릭
  const handleSearchClick = () => {
    handleSearch(keyword);
  };

  // 검색어 초기화
  const handleClear = () => {
    setKeyword("");
    inputRef.current?.focus();
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete("keyword");
    params.delete("pageNo");
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const isLarge = size === "large";
  const hasKeyword = keyword.trim().length > 0;

  return (
    <div
      className={cn(
        "relative flex items-center",
        isLarge ? "w-full max-w-2xl mx-auto" : "w-full max-w-xs",
        className
      )}
    >
      <div
        className={cn(
          "relative flex items-center w-full",
          isLarge
            ? "rounded-full border-2 border-border bg-background shadow-lg px-6 py-4"
            : "rounded-lg border border-border bg-background px-3 py-2"
        )}
      >
        <Search
          className={cn(
            "text-muted-foreground flex-shrink-0",
            isLarge ? "w-5 h-5 mr-3" : "w-4 h-4 mr-2"
          )}
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder={isLarge ? "관광지명, 주소, 설명으로 검색..." : "검색..."}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent",
            isLarge ? "text-base" : "text-sm",
            "placeholder:text-muted-foreground"
          )}
          aria-label="관광지 검색"
          disabled={isLoading}
        />
        {isLoading && (
          <Loader2
            className={cn(
              "text-muted-foreground animate-spin flex-shrink-0",
              isLarge ? "w-5 h-5 ml-2" : "w-4 h-4 ml-2"
            )}
            aria-hidden="true"
          />
        )}
        {hasKeyword && !isLoading && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className={cn(
              "h-auto w-auto p-0 hover:bg-transparent",
              isLarge ? "ml-2" : "ml-1"
            )}
            aria-label="검색어 초기화"
          >
            <X
              className={cn(
                "text-muted-foreground hover:text-foreground",
                isLarge ? "w-5 h-5" : "w-4 h-4"
              )}
            />
          </Button>
        )}
        {isLarge && (
          <Button
            onClick={handleSearchClick}
            disabled={isLoading || !hasKeyword}
            className={cn(
              "ml-3 rounded-full",
              isLarge ? "px-6 py-2" : "px-4 py-1"
            )}
            aria-label="검색 실행"
          >
            검색
          </Button>
        )}
      </div>
    </div>
  );
}


