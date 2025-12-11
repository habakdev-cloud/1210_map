/**
 * @file app/bookmarks/page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 페이지입니다.
 * 인증된 사용자만 접근 가능하며, 로그인하지 않은 경우 로그인 페이지로 리다이렉트합니다.
 *
 * 주요 기능:
 * - 북마크 목록 조회
 * - 북마크된 관광지 상세 정보 표시
 * - 빈 상태 처리
 * - 로딩 상태 표시
 *
 * @see {@link /docs/PRD.md} - Phase 5 북마크 페이지
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getUserBookmarks } from "@/lib/api/supabase-api";
import { getDetailCommon } from "@/lib/api/tour-api";
import TourList from "@/components/tour-list";
import { Skeleton } from "@/components/ui/skeleton";
import type { TourItem } from "@/lib/types/tour";

/**
 * TourDetail을 TourItem으로 변환
 * 북마크 페이지에서 TourList 컴포넌트를 사용하기 위해 필요
 */
function convertDetailToItem(detail: {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  mapx: string;
  mapy: string;
  firstimage?: string;
  firstimage2?: string;
  tel?: string;
}): TourItem {
  return {
    contentid: detail.contentid,
    contenttypeid: detail.contenttypeid,
    title: detail.title,
    addr1: detail.addr1,
    addr2: detail.addr2,
    areacode: "", // TourDetail에는 areacode가 없으므로 빈 문자열
    mapx: detail.mapx,
    mapy: detail.mapy,
    firstimage: detail.firstimage,
    firstimage2: detail.firstimage2,
    tel: detail.tel,
    modifiedtime: new Date().toISOString(), // TourDetail에는 modifiedtime이 없으므로 현재 시간 사용
  };
}

/**
 * 북마크 목록 조회 및 표시
 */
async function BookmarksList() {
  // 북마크 목록 조회
  const contentIds = await getUserBookmarks();

  if (contentIds.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">북마크한 관광지가 없습니다</h3>
        <p className="text-muted-foreground">
          관광지 상세 페이지에서 북마크를 추가해보세요.
        </p>
      </div>
    );
  }

  // 각 contentId에 대해 상세 정보 조회 (병렬 처리)
  const tourDetails = await Promise.allSettled(
    contentIds.map((contentId) => getDetailCommon({ contentId }))
  );

  // 성공한 결과만 필터링 및 변환
  const tours: TourItem[] = tourDetails
    .filter((result) => result.status === "fulfilled" && result.value !== null)
    .map((result) => {
      const detail = (result as PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof getDetailCommon>>>>).value;
      return convertDetailToItem(detail);
    });

  if (tours.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          북마크한 관광지 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6">
        총 {tours.length}개의 북마크된 관광지
      </p>
      <TourList tours={tours} />
    </div>
  );
}

/**
 * 북마크 페이지 로딩 스켈레톤
 */
function BookmarksSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * 북마크 페이지 컴포넌트
 */
export default async function BookmarksPage() {
  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">내 북마크</h1>
        <Suspense fallback={<BookmarksSkeleton />}>
          <BookmarksList />
        </Suspense>
      </div>
    </main>
  );
}



