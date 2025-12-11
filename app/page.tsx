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
 * - 필터 기능 (지역, 관광 타입, 정렬)
 * - 관광지 상세 페이지 이동
 *
 * @see {@link /docs/PRD.md} - MVP 2.1 관광지 목록, MVP 2.2 네이버 지도 연동
 */

import { Suspense } from "react";
import {
  getAreaBasedListWithPagination,
  getAreaCode,
  searchKeywordWithPagination,
} from "@/lib/api/tour-api";
import TourListContainer from "@/components/tour-list-container";
import TourFilters from "@/components/tour-filters";
import TourSearch from "@/components/tour-search";
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
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // URL 쿼리 파라미터 읽기
  const params = await searchParams;
  const keyword = typeof params.keyword === "string" ? params.keyword : undefined;
  const areaCode = typeof params.areaCode === "string" ? params.areaCode : undefined;
  const contentTypeId =
    typeof params.contentTypeId === "string" ? params.contentTypeId : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "latest";

  let initialTours = [];
  let initialPagination = {
    pageNo: 1,
    numOfRows: 10,
    totalCount: 0,
    totalPages: 0,
  };
  let initialError: Error | null = null;
  let areaCodes: Array<{ code: string; name: string }> = [];

  try {
    // 지역 코드 목록 조회 (필터용)
    areaCodes = await getAreaCode();
  } catch (err: unknown) {
    console.error("지역 코드 조회 실패:", err);
    // 지역 코드 조회 실패해도 계속 진행
  }

  try {
    // 검색어가 있으면 검색 API, 없으면 일반 목록 API 사용
    let result;
    if (keyword && keyword.trim().length > 0) {
      // 검색 모드
      result = await searchKeywordWithPagination({
        keyword: keyword.trim(),
        areaCode,
        contentTypeId,
        numOfRows: 10,
        pageNo: 1,
      });
    } else {
      // 일반 모드
      result = await getAreaBasedListWithPagination({
        areaCode,
        contentTypeId,
        numOfRows: 10,
        pageNo: 1,
      });
    }

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
      {/* Hero Section */}
      <section className="container max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            한국의 아름다운 관광지를 탐험하세요
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            전국 관광지 정보를 한눈에 확인하고, 지도로 위치를 찾아보세요
          </p>
        </div>

        {/* 메인 영역 검색창 */}
        <div className="mt-8 md:mt-12">
          <Suspense fallback={<div className="h-14 w-full max-w-2xl mx-auto" />}>
            <TourSearch size="large" initialKeyword={keyword || ""} />
          </Suspense>
        </div>

        {/* 검색 결과 개수 표시 */}
        {keyword && keyword.trim().length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">&quot;{keyword}&quot;</span> 검색
              결과: {initialPagination.totalCount.toLocaleString()}개
            </p>
          </div>
        )}
      </section>

      {/* 필터 컴포넌트 (useSearchParams 사용하므로 Suspense 필요) */}
      <Suspense fallback={<div className="h-20 border-b border-border" />}>
        <TourFilters areaCodes={areaCodes} isLoading={false} />
      </Suspense>

      <Suspense fallback={<HomePageSkeleton />}>
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <TourListContainer
            initialTours={initialTours}
            initialPagination={initialPagination}
            initialError={initialError}
            searchKeyword={keyword}
            areaCode={areaCode}
            contentTypeId={contentTypeId}
            sort={sort}
          />
        </div>
      </Suspense>
    </main>
  );
}
