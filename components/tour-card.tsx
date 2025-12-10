/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 개별 관광지 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * DESIGN.md의 카드 스타일과 PRD.md의 목록 표시 요구사항을 반영합니다.
 *
 * 구성 요소:
 * - 썸네일 이미지 (기본 이미지 fallback)
 * - 관광지명
 * - 주소 표시
 * - 관광 타입 뱃지
 * - 호버 효과 (scale, shadow)
 * - 클릭 시 상세페이지 이동
 *
 * @see {@link /docs/PRD.md} - MVP 2.1 목록 표시 정보
 * @see {@link /docs/DESIGN.md} - 카드 스타일 가이드
 */

"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useState } from "react";
import type { TourItem } from "@/lib/types/tour";
import { CONTENT_TYPE } from "@/lib/types/tour";

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

interface TourCardProps {
  tour: TourItem;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * 관광지 카드 컴포넌트
 */
export default function TourCard({ tour, isSelected = false, onClick }: TourCardProps) {
  const imageUrl = tour.firstimage || tour.firstimage2;
  const contentTypeName = getContentTypeName(tour.contenttypeid);
  const address = tour.addr2 ? `${tour.addr1} ${tour.addr2}` : tour.addr1;
  const [imageError, setImageError] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // onClick이 제공된 경우 기본 동작 방지하고 콜백 호출
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link
      href={`/places/${tour.contentid}`}
      onClick={handleClick}
      className={`group block bg-card rounded-xl shadow-md border overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer ${
        isSelected
          ? "border-primary shadow-lg ring-2 ring-primary/20"
          : "border-border"
      }`}
      aria-label={`${tour.title} 상세보기`}
      aria-current={isSelected ? "true" : undefined}
    >
      {/* 이미지 영역 */}
      <div className="relative w-full aspect-video overflow-hidden bg-muted">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            onError={() => setImageError(true)}
            suppressHydrationWarning
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground" aria-hidden="true">
            <MapPin className="w-12 h-12 opacity-50" />
          </div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-4 space-y-3">
        {/* 관광지명 */}
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors overflow-hidden text-ellipsis line-clamp-2">
          {tour.title}
        </h3>

        {/* 주소 */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{address}</span>
        </div>

        {/* 관광 타입 뱃지 */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {contentTypeName}
          </span>
        </div>
      </div>
    </Link>
  );
}

