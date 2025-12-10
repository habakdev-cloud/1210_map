/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 전국 관광지 정보를 검색하고 조회할 수 있는 메인 페이지입니다.
 * 한국관광공사 API를 통해 관광지 목록을 가져와 카드 형태로 표시합니다.
 *
 * 레이아웃 구조:
 * - Hero Section
 * - 필터 컴포넌트
 * - Main Content Area (관광지 목록)
 * - Footer
 *
 * @see {@link /docs/PRD.md} - MVP 2.1 관광지 목록 + 필터
 * @see {@link /docs/DESIGN.md} - 디자인 시스템 및 레이아웃 참고
 */

import Footer from "@/components/Footer";
import TourFilters from "@/components/tour-filters";
import TourMapView from "@/components/tour-map-view";
import { getAreaBasedList, getAreaCode } from "@/lib/api/tour-api";
import type { TourItem } from "@/lib/types/tour";

interface HomeProps {
  searchParams: Promise<{
    areaCode?: string;
    contentTypeId?: string;
    sort?: string;
    pageNo?: string;
  }>;
}

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

export default async function Home({ searchParams }: HomeProps) {
  // URL 쿼리 파라미터 읽기 (Next.js 15 async)
  const params = await searchParams;
  const areaCode = params.areaCode || undefined;
  const contentTypeId = params.contentTypeId || undefined;
  const sort = params.sort || "latest";
  const pageNo = parseInt(params.pageNo || "1", 10);

  // 지역 코드 목록 조회 (시/도만)
  let areaCodes: Awaited<ReturnType<typeof getAreaCode>> = [];
  try {
    areaCodes = await getAreaCode();
  } catch (err) {
    console.error("지역코드 조회 실패:", err);
  }

  // 관광지 목록 조회
  let tours: TourItem[] = [];
  let error: Error | null = null;

  try {
    tours = await getAreaBasedList({
      areaCode,
      contentTypeId,
      numOfRows: 20, // PRD.md: 10-20개
      pageNo,
    });

    // 정렬 적용 (API가 정렬을 지원하지 않으므로 클라이언트 사이드 정렬)
    tours = sortTours(tours, sort);
  } catch (err) {
    console.error("관광지 목록 조회 실패:", err);
    error = err instanceof Error ? err : new Error(String(err));
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              한국의 아름다운 관광지를 탐험하세요
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              전국 각지의 관광지 정보를 검색하고, 지도에서 위치를 확인하며,
              상세 정보를 알아보세요.
            </p>
          </div>
        </div>
      </section>

      {/* 필터 영역 */}
      <TourFilters areaCodes={areaCodes} />

      {/* Main Content Area */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 pb-8">
        <div className="space-y-8">
          {/* 관광지 목록 및 지도 */}
          <TourMapView tours={tours} error={error} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
