/**
 * @file tour-map-view.tsx
 * @description 관광지 목록 및 지도 통합 뷰
 *
 * 관광지 목록과 네이버 지도를 통합하여 표시하는 컴포넌트입니다.
 * 데스크톱에서는 분할 레이아웃, 모바일에서는 탭 전환을 제공합니다.
 *
 * 주요 기능:
 * - 리스트-지도 양방향 연동
 * - 반응형 레이아웃 (데스크톱: 분할, 모바일: 탭)
 * - 선택된 관광지 강조
 *
 * @see {@link /docs/PRD.md} - MVP 2.2 네이버 지도 연동
 * @see {@link /docs/DESIGN.md} - 레이아웃 디자인
 */

"use client";

import { useState, useEffect } from "react";
import { List, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import TourList from "@/components/tour-list";
import TourListInfinite from "@/components/tour-list-infinite";
import NaverMap from "@/components/naver-map";
import type { TourItem } from "@/lib/types/tour";

interface TourMapViewProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 에러 상태 */
  error?: Error | null;
  /** 검색 키워드 (검색 모드일 때) */
  searchKeyword?: string;
  /** 선택된 관광지 ID */
  selectedTourId?: string;
  /** 관광지 클릭 핸들러 */
  onTourClick?: (tourId: string) => void;
  /** 다음 페이지 로드 함수 (무한 스크롤용) */
  loadMore?: () => Promise<void>;
  /** 더 불러올 데이터가 있는지 (무한 스크롤용) */
  hasMore?: boolean;
  /** 로딩 중인지 (무한 스크롤용) */
  isLoading?: boolean;
  /** 재시도 함수 */
  onRetry?: () => void;
}

type ViewMode = "list" | "map" | "split";

/**
 * 관광지 목록 및 지도 통합 뷰 컴포넌트
 */
export default function TourMapView({
  tours,
  error,
  searchKeyword,
  selectedTourId: externalSelectedTourId,
  onTourClick: externalOnTourClick,
  loadMore,
  hasMore = false,
  isLoading = false,
  onRetry,
}: TourMapViewProps) {
  const [internalSelectedTourId, setInternalSelectedTourId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [mapType, setMapType] = useState<"normal" | "satellite">("normal");
  const [isMobile, setIsMobile] = useState(false);

  // 외부에서 전달된 selectedTourId 우선 사용
  const selectedTourId = externalSelectedTourId ?? internalSelectedTourId;

  // 화면 크기 감지 및 기본 뷰 모드 설정
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // 모바일로 전환 시 split 모드에서 list 모드로 변경
      if (mobile && viewMode === "split") {
        setViewMode("list");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [viewMode]);

  // 마커 클릭 핸들러
  const handleMarkerClick = (tourId: string) => {
    if (externalOnTourClick) {
      externalOnTourClick(tourId);
    } else {
      setInternalSelectedTourId(tourId);
    }
    // 모바일에서 지도 뷰로 전환
    if (window.innerWidth < 1024 && viewMode === "list") {
      setViewMode("map");
    }
  };

  // 카드 클릭 핸들러 (TourList에서 사용)
  const handleTourClick = (tourId: string) => {
    if (externalOnTourClick) {
      externalOnTourClick(tourId);
    } else {
      setInternalSelectedTourId(tourId);
    }
    // 모바일에서 지도 뷰로 전환
    if (typeof window !== "undefined" && window.innerWidth < 1024 && viewMode === "list") {
      setViewMode("map");
    }
  };


  return (
    <div className="w-full">
      {/* 모바일 탭 전환 UI */}
      {isMobile && (
        <div className="flex items-center gap-2 mb-4 border-b border-border" role="tablist" aria-label="뷰 모드 선택">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            aria-label="목록 보기"
            aria-pressed={viewMode === "list"}
            role="tab"
          >
            <List className="w-4 h-4 mr-2" aria-hidden="true" />
            목록
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "ghost"}
            onClick={() => setViewMode("map")}
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            aria-label="지도 보기"
            aria-pressed={viewMode === "map"}
            role="tab"
          >
            <MapIcon className="w-4 h-4 mr-2" aria-hidden="true" />
            지도
          </Button>
        </div>
      )}

      {/* 데스크톱: 분할 레이아웃, 모바일: 탭 전환 */}
      <div
        className={`${
          isMobile
            ? "w-full"
            : viewMode === "split"
              ? "grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
              : viewMode === "list"
                ? "w-full"
                : "w-full"
        }`}
      >
        {/* 목록 뷰 */}
        {(viewMode === "list" || viewMode === "split") && (
          <div
            className={`${
              isMobile && viewMode === "map" ? "hidden" : ""
            } ${viewMode === "split" ? "lg:overflow-y-auto lg:max-h-[600px]" : ""}`}
          >
            {loadMore && hasMore !== undefined ? (
              // 무한 스크롤 모드
              <TourListInfinite
                initialTours={tours}
                loadMore={loadMore}
                hasMore={hasMore}
                isLoading={isLoading}
                error={error}
                onRetry={onRetry}
                selectedTourId={selectedTourId}
                onTourClick={handleTourClick}
                searchKeyword={searchKeyword}
              />
            ) : (
              // 일반 모드
              <TourList
                tours={tours}
                error={error}
                selectedTourId={selectedTourId}
                onTourClick={handleTourClick}
                searchKeyword={searchKeyword}
              />
            )}
          </div>
        )}

        {/* 지도 뷰 */}
        {(viewMode === "map" || viewMode === "split") && (
          <div
            className={`${
              isMobile && viewMode === "list" ? "hidden" : ""
            } ${viewMode === "split" ? "sticky top-4" : ""}`}
          >
            <NaverMap
              tours={tours}
              selectedTourId={selectedTourId}
              onMarkerClick={handleMarkerClick}
              mapType={mapType}
              onMapTypeChange={setMapType}
            />
          </div>
        )}
      </div>
    </div>
  );
}

