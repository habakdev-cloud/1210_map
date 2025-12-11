/**
 * @file stats-summary.tsx
 * @description 통계 요약 카드 컴포넌트
 *
 * 통계 대시보드에 통계 요약 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * 전체 관광지 수, Top 3 지역/타입, 마지막 업데이트 시간을 표시합니다.
 *
 * 주요 기능:
 * 1. 전체 관광지 수 표시
 * 2. Top 1 지역 표시 (카드 형태)
 * 3. Top 1 타입 표시 (카드 형태)
 * 4. 마지막 업데이트 시간 표시
 * 5. 로딩 상태 (Skeleton UI)
 * 6. 에러 처리
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 요구사항 (2.6절)
 * @see {@link /docs/DESIGN.md} - 디자인 시스템 가이드
 */

import { getStatsSummary } from "@/lib/api/stats-api";
import ErrorRetryWrapper from "./error-retry-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Tag, Clock, BarChart3 } from "lucide-react";

/**
 * 날짜 포맷팅 함수
 * Date 객체를 한국어 형식으로 포맷팅합니다.
 *
 * @param date - 포맷팅할 Date 객체
 * @returns 포맷팅된 날짜 문자열 (예: "2025.01.15 14:30")
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

/**
 * 통계 요약 카드 스켈레톤 컴포넌트
 */
function StatsSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="p-6 border border-border rounded-lg bg-card"
        >
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-1" />
          {index === 1 || index === 2 ? (
            <Skeleton className="h-4 w-20 mt-1" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

/**
 * 통계 요약 카드 컴포넌트
 *
 * Server Component로 구현되어 서버에서 데이터를 가져옵니다.
 * Suspense로 감싸서 사용하면 자동으로 로딩 상태가 처리됩니다.
 */
export default async function StatsSummary() {
  try {
    const summary = await getStatsSummary();

    // 전체 관광지 수 포맷팅 (천 단위 콤마)
    const formattedTotalCount = summary.totalCount.toLocaleString("ko-KR");

    // Top 1 지역 및 타입
    const topRegion = summary.topRegions[0];
    const topType = summary.topTypes[0];

    // 마지막 업데이트 시간 포맷팅
    const formattedLastUpdated = formatDate(summary.lastUpdated);

    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-label="통계 요약"
      >
        {/* 전체 관광지 수 카드 */}
        <div
          className="p-6 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
          aria-label={`전체 관광지 수: ${formattedTotalCount}개`}
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">전체 관광지 수</p>
          </div>
          <p className="text-2xl font-bold">{formattedTotalCount}</p>
        </div>

        {/* Top 1 지역 카드 */}
        <div
          className="p-6 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
          aria-label={`가장 많은 관광지 지역: ${topRegion?.name || "-"} (${topRegion?.count || 0}개)`}
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">가장 많은 관광지 지역</p>
          </div>
          <p className="text-2xl font-bold">{topRegion?.name || "-"}</p>
          {topRegion && (
            <p className="text-sm text-muted-foreground mt-1">
              {topRegion.count.toLocaleString("ko-KR")}개
            </p>
          )}
        </div>

        {/* Top 1 타입 카드 */}
        <div
          className="p-6 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
          aria-label={`가장 많은 관광지 타입: ${topType?.name || "-"} (${topType?.count || 0}개)`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">가장 많은 관광지 타입</p>
          </div>
          <p className="text-2xl font-bold">{topType?.name || "-"}</p>
          {topType && (
            <p className="text-sm text-muted-foreground mt-1">
              {topType.count.toLocaleString("ko-KR")}개
            </p>
          )}
        </div>

        {/* 마지막 업데이트 시간 카드 */}
        <div
          className="p-6 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
          aria-label={`마지막 업데이트: ${formattedLastUpdated}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">마지막 업데이트</p>
          </div>
          <p className="text-sm font-medium">{formattedLastUpdated}</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error("통계 요약 데이터 로드 실패:", error);
    return (
      <ErrorRetryWrapper
        message="통계 데이터를 불러오는 중 오류가 발생했습니다."
        type="api"
      />
    );
  }
}

/**
 * 통계 요약 카드 로딩 컴포넌트 (Suspense fallback용)
 * 
 * 이 컴포넌트는 StatsSummary 컴포넌트와 함께 export하여
 * Suspense의 fallback으로 사용할 수 있습니다.
 */
export { StatsSummarySkeleton };


