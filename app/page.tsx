/**
 * @file page.tsx
 * @description 메인 페이지 - 관광지 목록 및 지도
 *
 * 한국관광공사 API를 사용하여 관광지 목록을 조회하고 표시합니다.
 * 관광지 목록과 네이버 지도를 통합하여 보여줍니다.
 *
 * 주요 기능:
 * - 관광지 목록 조회 및 표시
 * - 네이버 지도 연동
 * - 무한 스크롤
 * - 관광지 상세 페이지 이동
 *
 * @see {@link /docs/PRD.md} - MVP 2.1 관광지 목록, MVP 2.2 네이버 지도 연동
 */

import { Suspense } from "react";
import { getAreaBasedListWithPagination } from "@/lib/api/tour-api";
import TourListContainer from "@/components/tour-list-container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 로딩 스켈레톤 컴포넌트
 */
function HomePageSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    </div>
  );
}

/**
 * 메인 페이지 컴포넌트
 */
export default async function Home() {
  let initialTours = [];
  let initialPagination = {
    pageNo: 1,
    numOfRows: 10,
    totalCount: 0,
    totalPages: 0,
  };
  let initialError: Error | null = null;

  try {
    // 초기 관광지 목록 조회 (전국 관광지, 페이지당 10개)
    const result = await getAreaBasedListWithPagination({
      numOfRows: 10,
      pageNo: 1,
    });

    initialTours = result.items;
    initialPagination = result.pagination;
  } catch (err: unknown) {
    console.error("관광지 목록 조회 실패:", err);
    if (err instanceof Error) {
      initialError = err;
    } else {
      const errorMessage = err ? String(err) : "Unknown error";
      initialError = new Error(errorMessage);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <Suspense fallback={<HomePageSkeleton />}>
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <TourListContainer
            initialTours={initialTours}
            initialPagination={initialPagination}
            initialError={initialError}
          />
        </div>
      </Suspense>
    </main>
  );
}
