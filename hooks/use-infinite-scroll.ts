/**
 * @file use-infinite-scroll.ts
 * @description 무한 스크롤 훅
 *
 * Intersection Observer API를 사용하여 무한 스크롤 기능을 제공하는 커스텀 훅입니다.
 * 하단 감지 요소(sentinel)가 뷰포트에 진입하면 다음 페이지를 자동으로 로드합니다.
 *
 * 주요 기능:
 * - Intersection Observer를 통한 하단 감지
 * - 자동 다음 페이지 로드
 * - 로딩 상태 관리
 * - 에러 상태 관리
 *
 * @see {@link /docs/PRD.md} - 페이지네이션 요구사항
 */

import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  /** 다음 페이지 로드 함수 */
  loadMore: () => Promise<void>;
  /** 더 불러올 데이터가 있는지 */
  hasMore: boolean;
  /** 로딩 중인지 */
  isLoading: boolean;
  /** 루트 요소 (기본값: null = viewport) */
  root?: Element | null;
  /** 루트 마진 (기본값: "100px") */
  rootMargin?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

interface UseInfiniteScrollReturn {
  /** 하단 감지 요소에 연결할 ref */
  sentinelRef: React.RefObject<HTMLDivElement>;
}

/**
 * 무한 스크롤 훅
 *
 * @example
 * ```tsx
 * const { sentinelRef } = useInfiniteScroll({
 *   loadMore: async () => {
 *     const nextPage = await fetchNextPage();
 *     setItems(prev => [...prev, ...nextPage]);
 *   },
 *   hasMore: currentPage < totalPages,
 *   isLoading: loading,
 * });
 *
 * return (
 *   <div>
 *     {items.map(...)}
 *     <div ref={sentinelRef}>
 *       {isLoading && <LoadingSpinner />}
 *     </div>
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll({
  loadMore,
  hasMore,
  isLoading,
  root = null,
  rootMargin = "100px",
  disabled = false,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef(false);

  // 로드 함수를 메모이제이션
  const handleLoadMore = useCallback(async () => {
    // 이미 로딩 중이거나 더 불러올 데이터가 없으면 중단
    if (isLoadingRef.current || !hasMore || isLoading || disabled) {
      return;
    }

    try {
      isLoadingRef.current = true;
      await loadMore();
    } catch (error) {
      console.error("무한 스크롤 로드 실패:", error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [loadMore, hasMore, isLoading, disabled]);

  // Intersection Observer 설정
  useEffect(() => {
    // 비활성화되어 있으면 Observer 생성하지 않음
    if (disabled || !hasMore) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    // 기존 Observer 정리
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 새로운 Observer 생성
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // 감지 요소가 뷰포트에 진입하고, 로딩 중이 아니며, 더 불러올 데이터가 있을 때
        if (entry.isIntersecting && !isLoadingRef.current && hasMore && !isLoading) {
          handleLoadMore();
        }
      },
      {
        root,
        rootMargin,
        threshold: 0.1, // 10% 이상 보이면 트리거
      }
    );

    // 감지 요소 관찰 시작
    observerRef.current.observe(sentinel);

    // cleanup 함수
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [handleLoadMore, hasMore, isLoading, disabled, root, rootMargin]);

  return {
    sentinelRef,
  };
}






