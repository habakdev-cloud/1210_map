/**
 * @file stats-api.ts
 * @description 통계 데이터 수집 API
 *
 * 통계 대시보드에 필요한 데이터를 수집하는 함수들을 제공합니다.
 * 지역별/타입별 관광지 개수를 집계하고, 전체 통계 요약을 생성합니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수 집계
 * 2. 타입별 관광지 개수 집계
 * 3. 전체 통계 요약 생성
 *
 * 성능 최적화:
 * - 병렬 API 호출 (Promise.all)
 * - 최소 데이터 조회 (numOfRows: 1)
 * - 에러 처리 (개별 실패 시 해당 항목만 제외)
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 요구사항 (2.6절)
 */

import { getAreaCode, getAreaBasedListWithPagination } from "./tour-api";
import { CONTENT_TYPE } from "@/lib/types/tour";
import type { RegionStats, TypeStats, StatsSummary } from "@/lib/types/stats";

/**
 * Content Type ID를 한글 이름으로 변환
 */
function getContentTypeName(contentTypeId: string): string {
  switch (contentTypeId) {
    case CONTENT_TYPE.TOURIST_SPOT:
      return "관광지";
    case CONTENT_TYPE.CULTURAL_FACILITY:
      return "문화시설";
    case CONTENT_TYPE.FESTIVAL:
      return "축제/행사";
    case CONTENT_TYPE.TRAVEL_COURSE:
      return "여행코스";
    case CONTENT_TYPE.LEISURE_SPORTS:
      return "레포츠";
    case CONTENT_TYPE.ACCOMMODATION:
      return "숙박";
    case CONTENT_TYPE.SHOPPING:
      return "쇼핑";
    case CONTENT_TYPE.RESTAURANT:
      return "음식점";
    default:
      return "기타";
  }
}

/**
 * 딜레이 함수 (ms 단위)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 배열을 배치로 나누기
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 지역별 관광지 개수 집계
 *
 * 각 시/도별로 관광지 개수를 조회합니다.
 * 시/도 목록을 조회한 후, 각 지역별로 API를 호출하여 totalCount를 집계합니다.
 *
 * @returns 지역별 통계 정보 배열
 *
 * @example
 * ```ts
 * const regionStats = await getRegionStats();
 * // [{ code: "1", name: "서울", count: 1234 }, ...]
 * ```
 */
export async function getRegionStats(): Promise<RegionStats[]> {
  try {
    console.group("📊 지역별 통계 수집 시작");

    // 시/도 목록 조회 (상위 지역 코드 없이 호출하면 시/도만 반환)
    const areaCodes = await getAreaCode();
    console.log(`✅ 시/도 목록 조회 완료: ${areaCodes.length}개`);

    // 배치 처리: 한 번에 3개씩 처리 (rate limit 방지)
    const BATCH_SIZE = 3;
    const BATCH_DELAY = 500; // 배치 간 딜레이 (ms)
    const batches = chunkArray(areaCodes, BATCH_SIZE);
    const allResults: (RegionStats | null)[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`  📦 배치 ${i + 1}/${batches.length} 처리 중... (${batch.length}개 지역)`);

      // 배치 내에서는 병렬 처리
      const batchPromises = batch.map(async (area): Promise<RegionStats | null> => {
        try {
          // numOfRows: 1로 최소한의 데이터만 조회 (totalCount만 필요)
          const result = await getAreaBasedListWithPagination({
            areaCode: area.code,
            numOfRows: 1,
            pageNo: 1,
          });

          const count = result.pagination.totalCount || 0;
          console.log(`    📍 ${area.name} (${area.code}): ${count}개`);

          return {
            code: area.code,
            name: area.name,
            count,
          };
        } catch (error) {
          // 개별 지역 조회 실패 시 해당 지역만 제외하고 계속 진행
          console.error(`    ❌ ${area.name} (${area.code}) 조회 실패:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      allResults.push(...batchResults);

      // 마지막 배치가 아니면 딜레이 추가
      if (i < batches.length - 1) {
        await delay(BATCH_DELAY);
      }
    }

    // null 값 제거 및 정렬 (개수 기준 내림차순)
    const stats = allResults
      .filter((stat): stat is RegionStats => stat !== null)
      .sort((a, b) => b.count - a.count);

    console.log(`✅ 지역별 통계 수집 완료: ${stats.length}개 지역`);
    console.groupEnd();

    return stats;
  } catch (error) {
    console.error("❌ 지역별 통계 수집 실패:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 타입별 관광지 개수 집계
 *
 * 각 콘텐츠 타입별로 관광지 개수를 조회합니다.
 * CONTENT_TYPE 상수에 정의된 모든 타입에 대해 병렬로 API를 호출합니다.
 *
 * @returns 타입별 통계 정보 배열
 *
 * @example
 * ```ts
 * const typeStats = await getTypeStats();
 * // [{ contentTypeId: "12", name: "관광지", count: 5678 }, ...]
 * ```
 */
export async function getTypeStats(): Promise<TypeStats[]> {
  try {
    console.group("📊 타입별 통계 수집 시작");

    // 모든 콘텐츠 타입 ID 목록
    const contentTypeIds = Object.values(CONTENT_TYPE);
    console.log(`✅ 타입 목록: ${contentTypeIds.length}개`);

    // 배치 처리: 한 번에 3개씩 처리 (rate limit 방지)
    const BATCH_SIZE = 3;
    const BATCH_DELAY = 500; // 배치 간 딜레이 (ms)
    const batches = chunkArray(contentTypeIds, BATCH_SIZE);
    const allResults: (TypeStats | null)[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`  📦 배치 ${i + 1}/${batches.length} 처리 중... (${batch.length}개 타입)`);

      // 배치 내에서는 병렬 처리
      const batchPromises = batch.map(async (contentTypeId): Promise<TypeStats | null> => {
        try {
          // numOfRows: 1로 최소한의 데이터만 조회 (totalCount만 필요)
          const result = await getAreaBasedListWithPagination({
            contentTypeId,
            numOfRows: 1,
            pageNo: 1,
          });

          const count = result.pagination.totalCount || 0;
          const name = getContentTypeName(contentTypeId);
          console.log(`    🎯 ${name} (${contentTypeId}): ${count}개`);

          return {
            contentTypeId,
            name,
            count,
          };
        } catch (error) {
          // 개별 타입 조회 실패 시 해당 타입만 제외하고 계속 진행
          console.error(`    ❌ 타입 ${contentTypeId} 조회 실패:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      allResults.push(...batchResults);

      // 마지막 배치가 아니면 딜레이 추가
      if (i < batches.length - 1) {
        await delay(BATCH_DELAY);
      }
    }

    // null 값 제거 및 정렬 (개수 기준 내림차순)
    const stats = allResults
      .filter((stat): stat is TypeStats => stat !== null)
      .sort((a, b) => b.count - a.count);

    console.log(`✅ 타입별 통계 수집 완료: ${stats.length}개 타입`);
    console.groupEnd();

    return stats;
  } catch (error) {
    console.error("❌ 타입별 통계 수집 실패:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 전체 통계 요약 정보 생성
 *
 * 지역별 통계, 타입별 통계, 전체 관광지 수를 병렬로 조회하여
 * 통계 요약 정보를 생성합니다.
 *
 * @returns 통계 요약 정보
 *
 * @example
 * ```ts
 * const summary = await getStatsSummary();
 * // {
 * //   totalCount: 12345,
 * //   topRegions: [{ code: "1", name: "서울", count: 1234 }, ...],
 * //   topTypes: [{ contentTypeId: "12", name: "관광지", count: 5678 }, ...],
 * //   lastUpdated: new Date()
 * // }
 * ```
 */
export async function getStatsSummary(): Promise<StatsSummary> {
  try {
    console.group("📊 통계 요약 수집 시작");

    // 지역별 통계, 타입별 통계, 전체 개수를 병렬로 조회
    const [regionStats, typeStats, totalResult] = await Promise.all([
      getRegionStats(),
      getTypeStats(),
      // 전체 관광지 수 조회 (areaCode, contentTypeId 없이)
      getAreaBasedListWithPagination({
        numOfRows: 1,
        pageNo: 1,
      }),
    ]);

    const totalCount = totalResult.pagination.totalCount || 0;
    console.log(`✅ 전체 관광지 수: ${totalCount}개`);

    // Top 3 지역 (이미 내림차순 정렬되어 있음)
    const topRegions = regionStats.slice(0, 3);
    console.log(`✅ Top 3 지역: ${topRegions.map((r) => r.name).join(", ")}`);

    // Top 3 타입 (이미 내림차순 정렬되어 있음)
    const topTypes = typeStats.slice(0, 3);
    console.log(`✅ Top 3 타입: ${topTypes.map((t) => t.name).join(", ")}`);

    const summary: StatsSummary = {
      totalCount,
      topRegions,
      topTypes,
      lastUpdated: new Date(),
    };

    console.log(`✅ 통계 요약 수집 완료`);
    console.groupEnd();

    return summary;
  } catch (error) {
    console.error("❌ 통계 요약 수집 실패:", error);
    console.groupEnd();
    throw error;
  }
}


