/**
 * @file type-chart-wrapper.tsx
 * @description 타입별 분포 차트 래퍼 컴포넌트 (서버 컴포넌트)
 *
 * 서버에서 데이터를 가져와서 클라이언트 컴포넌트인 TypeChart에 전달합니다.
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 요구사항 (2.6.2절)
 */

import { getTypeStats } from "@/lib/api/stats-api";
import TypeChart from "./type-chart";
import ErrorRetryWrapper from "./error-retry-wrapper";

/**
 * 타입별 분포 차트 래퍼 컴포넌트 (서버 컴포넌트)
 *
 * 서버에서 타입별 통계 데이터를 가져와서 클라이언트 컴포넌트에 전달합니다.
 */
export default async function TypeChartWrapper() {
  try {
    const data = await getTypeStats();
    return <TypeChart data={data} />;
  } catch (error) {
    console.error("타입별 통계 데이터 로드 실패:", error);
    return (
      <ErrorRetryWrapper
        message="타입별 통계 데이터를 불러오는 중 오류가 발생했습니다."
        type="api"
      />
    );
  }
}

