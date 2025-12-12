/**
 * @file app/stats/page.tsx
 * @description 통계 대시보드 페이지
 *
 * 전국 관광지 데이터를 차트로 시각화하여 사용자가 한눈에 현황을 파악할 수 있는 통계 페이지입니다.
 *
 * 주요 기능:
 * - 통계 요약 카드 (전체 개수, Top 3 지역/타입)
 * - 지역별 관광지 분포 차트 (Bar Chart)
 * - 타입별 관광지 분포 차트 (Donut Chart)
 * - 반응형 디자인 (모바일 우선)
 *
 * @see {@link /docs/PRD.md} - MVP 2.6 통계 대시보드
 * @see {@link /docs/DESIGN.md} - 통계 페이지 레이아웃
 */

import { Suspense } from "react";
import dynamicImport from "next/dynamic";

/**
 * Route Segment Config: 동적 렌더링
 *
 * 통계 페이지는 빌드 시 렌더링하지 않고 런타임에만 렌더링합니다.
 * 빌드 시 많은 API 호출로 인한 Rate Limit을 방지하기 위해 동적 렌더링을 사용합니다.
 * 사용자가 페이지를 방문할 때만 API를 호출하여 데이터를 가져옵니다.
 */
export const dynamic = "force-dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import StatsSummary, {
  StatsSummarySkeleton,
} from "@/components/stats/stats-summary";
import { RegionChartSkeleton } from "@/components/stats/region-chart";
import { TypeChartSkeleton } from "@/components/stats/type-chart";

// 차트 컴포넌트를 동적 import로 로드 (recharts 라이브러리 크기 최적화)
const RegionChartWrapper = dynamicImport(
  () => import("@/components/stats/region-chart-wrapper"),
  {
    loading: () => <RegionChartSkeleton />,
  },
);

const TypeChartWrapper = dynamicImport(
  () => import("@/components/stats/type-chart-wrapper"),
  {
    loading: () => <TypeChartSkeleton />,
  },
);

/**
 * 로딩 스켈레톤 컴포넌트
 */
function StatsPageSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* 페이지 제목 스켈레톤 */}
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-6 w-96 max-w-full" />
      </div>

      {/* 통계 요약 카드 영역 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>

      {/* 지역별 분포 차트 영역 스켈레톤 */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>

      {/* 타입별 분포 차트 영역 스켈레톤 */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}

/**
 * 통계 대시보드 페이지 컴포넌트
 */
export default async function StatsPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">통계 대시보드</h1>
          <p className="text-lg text-muted-foreground">
            전국 관광지 현황을 한눈에 확인하세요
          </p>
        </div>

        <Suspense fallback={<StatsPageSkeleton />}>
          {/* 통계 요약 카드 영역 (상단) */}
          <section className="mb-8" aria-label="통계 요약">
            <Suspense fallback={<StatsSummarySkeleton />}>
              <StatsSummary />
            </Suspense>
          </section>

          {/* 지역별 분포 차트 영역 (중단) */}
          <section className="mb-8" aria-label="지역별 관광지 분포">
            <h2 className="text-2xl font-semibold mb-4">지역별 관광지 분포</h2>
            <Suspense fallback={<RegionChartSkeleton />}>
              <RegionChartWrapper />
            </Suspense>
          </section>

          {/* 타입별 분포 차트 영역 (하단) */}
          <section className="mb-8" aria-label="타입별 관광지 분포">
            <h2 className="text-2xl font-semibold mb-4">타입별 관광지 분포</h2>
            <Suspense fallback={<TypeChartSkeleton />}>
              <TypeChartWrapper />
            </Suspense>
          </section>
        </Suspense>
      </div>
    </main>
  );
}
