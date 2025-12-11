/**
 * @file detail-recommendations.tsx
 * @description 관광지 추천 섹션 컴포넌트
 *
 * 같은 지역 또는 타입의 다른 관광지를 추천하는 섹션입니다.
 * 현재 관광지와 유사한 관광지를 표시하여 사용자의 탐색을 돕습니다.
 *
 * 주요 기능:
 * - 같은 지역 또는 타입의 다른 관광지 추천
 * - 현재 관광지 제외
 * - 최대 4-6개 추천 (카드 형태)
 * - 기존 TourCard 컴포넌트 재사용
 * - 로딩 상태 (Skeleton UI)
 * - 빈 상태 처리
 *
 * @see {@link /docs/PRD.md} - 추천 관광지 섹션 (선택 사항)
 * @see {@link /docs/DESIGN.md} - 상세페이지 레이아웃
 */

"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getAreaBasedList } from "@/lib/api/tour-api";
import TourCard from "@/components/tour-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TourItem, TourDetail } from "@/lib/types/tour";

interface DetailRecommendationsProps {
  /** 현재 관광지 정보 */
  detail: TourDetail;
}

/**
 * 관광지 추천 섹션 컴포넌트
 */
export default function DetailRecommendations({ detail }: DetailRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<TourItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 같은 타입의 관광지 조회 (지역 코드는 detailCommon2 응답에 없을 수 있음)
        const tours = await getAreaBasedList({
          contentTypeId: detail.contenttypeid,
          numOfRows: 10, // 더 많이 가져와서 필터링
          pageNo: 1,
        });

        // 현재 관광지 제외 및 최대 6개로 제한
        const filtered = tours
          .filter((tour) => tour.contentid !== detail.contentid)
          .slice(0, 6);

        setRecommendations(filtered);
      } catch (err) {
        console.error("추천 관광지 조회 실패:", err);
        setError("추천 관광지를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [detail.contentid, detail.contenttypeid]);

  // 로딩 중
  if (isLoading) {
    return (
      <section
        className="container max-w-7xl mx-auto px-4 py-8"
        aria-label="추천 관광지"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-foreground">이런 관광지도 추천해요</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <Skeleton className="w-full aspect-video" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 에러 발생
  if (error) {
    return null; // 에러 발생 시 섹션 숨김
  }

  // 추천 관광지가 없으면 섹션 숨김
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section
      className="container max-w-7xl mx-auto px-4 py-8"
      aria-label="추천 관광지"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-foreground">이런 관광지도 추천해요</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((tour) => (
            <TourCard key={tour.contentid} tour={tour} />
          ))}
        </div>
      </div>
    </section>
  );
}

