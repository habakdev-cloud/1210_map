/**
 * @file tour-list-infinite.tsx
 * @description 무한 스크롤 관광지 목록 컴포넌트
 *
 * 관광지 목록을 무한 스크롤 방식으로 표시하는 컴포넌트입니다.
 * Intersection Observer를 사용하여 하단에 도달하면 자동으로 다음 페이지를 로드합니다.
 *
 * 주요 기능:
 * - 무한 스크롤 (Intersection Observer)
 * - 하단 로딩 인디케이터
 * - 더 이상 데이터 없음 메시지
 * - 기존 TourList 컴포넌트 재사용
 *
 * @see {@link /docs/PRD.md} - 페이지네이션 요구사항
 * @see {@link /docs/DESIGN.md} - 무한 스크롤 디자인
 */

"use client";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import TourList from "@/components/tour-list";
import { Loader2 } from "lucide-react";
import type { TourItem } from "@/lib/types/tour";

interface TourListInfiniteProps {
  /** 초기 관광지 목록 */
  initialTours: TourItem[];
  /** 다음 페이지 로드 함수 */
  loadMore: () => Promise<void>;
  /** 더 불러올 데이터가 있는지 */
  hasMore: boolean;
  /** 로딩 중인지 */
  isLoading: boolean;
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
 * 무한 스크롤 관광지 목록 컴포넌트
 */
export default function TourListInfinite({
  initialTours,
  loadMore,
  hasMore,
  isLoading,
  error,
  onRetry,
  selectedTourId,
  onTourClick,
  searchKeyword,
}: TourListInfiniteProps) {
  // 무한 스크롤 훅
  const { sentinelRef } = useInfiniteScroll({
    loadMore: async () => {
      await loadMore();
    },
    hasMore,
    isLoading,
    disabled: !!error, // 에러가 있으면 비활성화
  });

  // 모든 관광지 목록 (초기 + 추가 로드된 항목들)
  // 이 컴포넌트는 부모 컴포넌트에서 누적된 목록을 받아야 함
  // 따라서 initialTours는 이미 누적된 목록으로 가정

  return (
    <div className="w-full">
      {/* 관광지 목록 */}
      <TourList
        tours={initialTours}
        error={error}
        onRetry={onRetry}
        selectedTourId={selectedTourId}
        onTourClick={onTourClick}
        searchKeyword={searchKeyword}
      />

      {/* 하단 감지 요소 및 로딩 인디케이터 */}
      {!error && (
        <div ref={sentinelRef} className="flex flex-col items-center justify-center py-8">
          {isLoading && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">더 많은 관광지를 불러오는 중...</p>
            </div>
          )}
          {!hasMore && initialTours.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">
                모든 관광지를 불러왔습니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

