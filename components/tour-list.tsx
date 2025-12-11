/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 형태로 표시하는 컴포넌트입니다.
 * 로딩 상태, 빈 상태, 에러 상태를 모두 처리합니다.
 *
 * 구성 요소:
 * - 그리드 레이아웃 (반응형)
 * - 카드 목록 표시
 * - 로딩 상태 (Skeleton UI)
 * - 빈 상태 처리
 * - 에러 상태 처리
 *
 * @see {@link /docs/PRD.md} - MVP 2.1 관광지 목록
 * @see {@link /docs/DESIGN.md} - 디자인 시스템
 */

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Error } from "@/components/ui/error";
import TourCard from "@/components/tour-card";
import type { TourItem } from "@/lib/types/tour";
import { MapPin } from "lucide-react";

interface TourListProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 상태 */
  error?: Error | null;
  /** 재시도 함수 */
  onRetry?: () => void;
  /** 선택된 관광지 ID */
  selectedTourId?: string;
  /** 관광지 클릭 핸들러 */
  onTourClick?: (tourId: string) => void;
  /** 검색 키워드 (검색 모드일 때) */
  searchKeyword?: string;
}

/**
 * 관광지 카드 스켈레톤 컴포넌트
 */
function TourCardSkeleton() {
  return (
    <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
      {/* 이미지 스켈레톤 */}
      <Skeleton className="w-full aspect-video" />
      {/* 콘텐츠 스켈레톤 */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

/**
 * 관광지 목록 컴포넌트
 */
export default function TourList({
  tours,
  isLoading,
  error,
  onRetry,
  selectedTourId,
  onTourClick,
  searchKeyword,
}: TourListProps) {
  // 에러 상태
  if (error) {
    return (
      <Error
        message="관광지 정보를 불러오는 중 오류가 발생했습니다."
        onRetry={onRetry}
        type="api"
      />
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <TourCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 빈 상태
  if (tours.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border border-dashed border-border p-12">
        <MapPin className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {searchKeyword ? "검색 결과가 없습니다" : "관광지가 없습니다"}
        </h3>
        <p className="text-sm text-muted-foreground text-center">
          {searchKeyword ? (
            <>
              <span className="font-medium">&quot;{searchKeyword}&quot;</span>에 대한 검색 결과가 없습니다.
              <br />
              다른 검색어를 시도하거나 필터 옵션을 변경해보세요.
            </>
          ) : (
            "다른 필터 옵션을 선택하거나 검색어를 변경해보세요."
          )}
        </p>
      </div>
    );
  }

  // 목록 표시
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {tours.map((tour) => (
        <TourCard
          key={tour.contentid}
          tour={tour}
          isSelected={tour.contentid === selectedTourId}
          onClick={() => onTourClick?.(tour.contentid)}
        />
      ))}
    </div>
  );
}

