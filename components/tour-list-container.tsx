/**
 * @file tour-list-container.tsx
 * @description 관광지 목록 컨테이너 (무한 스크롤)
 *
 * 무한 스크롤 로직을 처리하는 Client Component입니다.
 * Server Component에서 초기 데이터를 받아서 무한 스크롤을 구현합니다.
 *
 * 주요 기능:
 * - 초기 데이터 표시
 * - 무한 스크롤로 추가 페이지 로드
 * - 누적된 목록 관리
 * - 필터/검색 변경 시 리셋
 *
 * @see {@link /docs/PRD.md} - 페이지네이션 요구사항
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import TourListInfinite from "@/components/tour-list-infinite";
import TourMapView from "@/components/tour-map-view";
import {
  getAreaBasedListWithPagination,
  searchKeywordWithPagination,
} from "@/lib/api/tour-api";
import type { TourItem } from "@/lib/types/tour";

interface TourListContainerProps {
  /** 초기 관광지 목록 */
  initialTours: TourItem[];
  /** 초기 페이지네이션 메타데이터 */
  initialPagination: {
    pageNo: number;
    numOfRows: number;
    totalCount: number;
    totalPages: number;
  };
  /** 초기 에러 상태 */
  initialError?: Error | null;
  /** 검색 키워드 */
  searchKeyword?: string;
  /** 지역 코드 */
  areaCode?: string;
  /** 콘텐츠 타입 ID */
  contentTypeId?: string;
  /** 정렬 타입 */
  sort?: string;
}

/**
 * 관광지 목록 컨테이너 컴포넌트
 */
/**
 * 정렬 함수
 */
function sortTours(tours: TourItem[], sortType: string): TourItem[] {
  const sorted = [...tours];

  switch (sortType) {
    case "name":
      // 이름순 (가나다순)
      sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
      break;
    case "latest":
    default:
      // 최신순 (modifiedtime 기준, 내림차순)
      sorted.sort((a, b) => {
        const timeA = a.modifiedtime ? parseInt(a.modifiedtime) : 0;
        const timeB = b.modifiedtime ? parseInt(b.modifiedtime) : 0;
        return timeB - timeA;
      });
      break;
  }

  return sorted;
}

export default function TourListContainer({
  initialTours,
  initialPagination,
  initialError,
  searchKeyword,
  areaCode,
  contentTypeId,
  sort = "latest",
}: TourListContainerProps) {
  const searchParams = useSearchParams();
  const [tours, setTours] = useState<TourItem[]>(initialTours);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(initialError || null);
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();

  // 필터/검색 변경 시 목록 리셋
  useEffect(() => {
    const sortedTours = sortTours(initialTours, sort);
    setTours(sortedTours);
    setPagination(initialPagination);
    setError(initialError || null);
    setSelectedTourId(undefined);
  }, [initialTours, initialPagination, initialError, sort, searchParams.toString()]);

  // 다음 페이지 로드 함수
  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoading || pagination.pageNo >= pagination.totalPages) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextPageNo = pagination.pageNo + 1;
      let result;

      if (searchKeyword && searchKeyword.trim().length > 0) {
        // 검색 모드
        result = await searchKeywordWithPagination({
          keyword: searchKeyword.trim(),
          areaCode,
          contentTypeId,
          numOfRows: pagination.numOfRows,
          pageNo: nextPageNo,
        });
      } else {
        // 일반 모드
        result = await getAreaBasedListWithPagination({
          areaCode,
          contentTypeId,
          numOfRows: pagination.numOfRows,
          pageNo: nextPageNo,
        });
      }

      // 누적된 목록에 새 항목 추가 (정렬 적용)
      const sortedNewItems = sortTours(result.items, sort);
      setTours((prev) => {
        const combined = [...prev, ...sortedNewItems];
        return sortTours(combined, sort); // 전체 목록 재정렬
      });
      setPagination(result.pagination);
    } catch (err: unknown) {
      let error: Error;
      if (err instanceof Error) {
        error = err;
      } else {
        const errorMessage = err ? String(err) : 'Unknown error';
        error = new Error(errorMessage);
      }
      setError(error);
      console.error("다음 페이지 로드 실패:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    pagination,
    searchKeyword,
    areaCode,
    contentTypeId,
    sort,
  ]);

  // 재시도 함수
  const handleRetry = useCallback(() => {
    setError(null);
    loadMore();
  }, [loadMore]);

  // 관광지 클릭 핸들러
  const handleTourClick = useCallback((tourId: string) => {
    setSelectedTourId(tourId);
  }, []);

  const hasMore = pagination.pageNo < pagination.totalPages;

  return (
    <TourMapView
      tours={tours}
      error={error}
      searchKeyword={searchKeyword}
      selectedTourId={selectedTourId}
      onTourClick={handleTourClick}
      loadMore={loadMore}
      hasMore={hasMore}
      isLoading={isLoading}
      onRetry={handleRetry}
    />
  );
}

