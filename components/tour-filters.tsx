/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 정렬 옵션을 선택할 수 있는 필터 컴포넌트입니다.
 * 필터 상태는 URL 쿼리 파라미터와 동기화되어 공유 가능한 URL을 제공합니다.
 *
 * 구성 요소:
 * - 지역 필터 (시/도 선택)
 * - 관광 타입 필터 (단일 선택)
 * - 정렬 옵션 (최신순, 이름순)
 * - 필터 초기화 버튼
 *
 * @see {@link /docs/PRD.md} - MVP 2.1 필터 요구사항
 * @see {@link /docs/DESIGN.md} - 필터 UI 디자인
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { MapPin, Tag, ArrowUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTENT_TYPE } from "@/lib/types/tour";
import type { AreaCode } from "@/lib/types/tour";

interface TourFiltersProps {
  /** 지역 코드 목록 */
  areaCodes: AreaCode[];
  /** 로딩 상태 */
  isLoading?: boolean;
}

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
 * Content Type ID와 한글 이름 매핑
 */
const CONTENT_TYPE_OPTIONS = [
  { value: CONTENT_TYPE.TOURIST_SPOT, label: "관광지" },
  { value: CONTENT_TYPE.CULTURAL_FACILITY, label: "문화시설" },
  { value: CONTENT_TYPE.FESTIVAL, label: "축제/행사" },
  { value: CONTENT_TYPE.TRAVEL_COURSE, label: "여행코스" },
  { value: CONTENT_TYPE.LEISURE_SPORTS, label: "레포츠" },
  { value: CONTENT_TYPE.ACCOMMODATION, label: "숙박" },
  { value: CONTENT_TYPE.SHOPPING, label: "쇼핑" },
  { value: CONTENT_TYPE.RESTAURANT, label: "음식점" },
] as const;

/**
 * 정렬 옵션
 */
const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "name", label: "이름순" },
] as const;

/**
 * 관광지 필터 컴포넌트
 */
export default function TourFilters({ areaCodes, isLoading }: TourFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 현재 필터 값 읽기 (빈 문자열 대신 undefined 사용)
  const currentAreaCode = searchParams.get("areaCode") || undefined;
  const currentContentTypeId = searchParams.get("contentTypeId") || undefined;
  const currentSort = searchParams.get("sort") || "latest";

  // 필터 변경 핸들러
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // "all" 값은 필터 제거 (전체 선택)
      if (value && value !== "" && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // pageNo는 필터 변경 시 1로 리셋
      params.delete("pageNo");

      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // 필터 초기화
  const resetFilters = useCallback(() => {
    router.push("/", { scroll: false });
  }, [router]);

  // 필터가 하나라도 적용되어 있는지 확인
  const hasActiveFilters = Boolean(currentAreaCode || currentContentTypeId);

  return (
    <div className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* 필터 그룹 */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* 지역 필터 */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Select
                value={currentAreaCode || "all"}
                onValueChange={(value) => updateFilter("areaCode", value)}
                disabled={isLoading}
              >
                <SelectTrigger 
                  className="w-[140px] md:w-[160px]"
                  aria-label="지역 선택"
                >
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {areaCodes.map((area) => (
                    <SelectItem key={area.code} value={area.code}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 관광 타입 필터 */}
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Select
                value={currentContentTypeId || "all"}
                onValueChange={(value) => updateFilter("contentTypeId", value)}
                disabled={isLoading}
              >
                <SelectTrigger 
                  className="w-[140px] md:w-[160px]"
                  aria-label="관광 타입 선택"
                >
                  <SelectValue placeholder="타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {CONTENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 정렬 옵션 */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Select
                value={currentSort}
                onValueChange={(value) => updateFilter("sort", value)}
                disabled={isLoading}
              >
                <SelectTrigger 
                  className="w-[120px] md:w-[140px]"
                  aria-label="정렬 옵션 선택"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 필터 초기화 버튼 */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-2"
              disabled={isLoading}
              aria-label="필터 초기화"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              필터 초기화
            </Button>
          )}
        </div>

        {/* 선택된 필터 표시 (선택 사항) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
            {currentAreaCode && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                <MapPin className="w-3 h-3" />
                {areaCodes.find((a) => a.code === currentAreaCode)?.name || "지역"}
              </div>
            )}
            {currentContentTypeId && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                <Tag className="w-3 h-3" />
                {getContentTypeName(currentContentTypeId)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

