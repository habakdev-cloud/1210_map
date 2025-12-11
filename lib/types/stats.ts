/**
 * @file stats.ts
 * @description 통계 대시보드용 타입 정의
 *
 * 통계 대시보드에서 사용하는 데이터 구조를 정의합니다.
 * PRD.md의 2.6절 통계 대시보드 요구사항을 기반으로 작성되었습니다.
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 요구사항 (2.6절)
 */

/**
 * 지역별 통계 정보
 */
export interface RegionStats {
  /** 지역 코드 (예: "1" = 서울) */
  code: string;
  /** 지역명 (예: "서울") */
  name: string;
  /** 관광지 개수 */
  count: number;
}

/**
 * 관광 타입별 통계 정보
 */
export interface TypeStats {
  /** 콘텐츠 타입 ID (예: "12" = 관광지) */
  contentTypeId: string;
  /** 타입명 (한글, 예: "관광지") */
  name: string;
  /** 관광지 개수 */
  count: number;
}

/**
 * 통계 요약 정보
 */
export interface StatsSummary {
  /** 전체 관광지 수 */
  totalCount: number;
  /** Top 3 지역 (관광지 개수 기준 내림차순) */
  topRegions: RegionStats[];
  /** Top 3 타입 (관광지 개수 기준 내림차순) */
  topTypes: TypeStats[];
  /** 마지막 업데이트 시간 */
  lastUpdated: Date;
}


