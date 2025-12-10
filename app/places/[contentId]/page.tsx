/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * 사용자가 관광지 카드를 클릭하면 이동하는 상세 정보 페이지입니다.
 * 한국관광공사 API의 detailCommon2를 사용하여 기본 정보를 표시합니다.
 *
 * 주요 기능:
 * - 동적 라우팅 (/places/[contentId])
 * - 기본 정보 표시 (이름, 이미지, 주소, 전화번호, 홈페이지, 개요)
 * - 에러 처리 (404, API 에러)
 * - 로딩 상태 (Suspense + Skeleton UI)
 *
 * @see {@link /docs/PRD.md} - MVP 2.4.1 기본 정보 섹션
 * @see {@link /docs/DESIGN.md} - 상세페이지 레이아웃
 */

import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDetailCommon, getDetailIntro } from "@/lib/api/tour-api";
import DetailInfo from "@/components/tour-detail/detail-info";
import DetailIntro from "@/components/tour-detail/detail-intro";
import { Skeleton } from "@/components/ui/skeleton";
import { Error } from "@/components/ui/error";

interface PlaceDetailPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function DetailPageSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* 이미지 스켈레톤 */}
      <Skeleton className="w-full h-[400px] md:h-[500px] rounded-xl" />

      {/* 제목 스켈레톤 */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>

      {/* 정보 카드 스켈레톤 */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * 관광지 상세페이지
 */
export default async function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  // Next.js 15: params는 Promise이므로 await 필요
  const { contentId } = await params;

  // contentId 유효성 검증
  if (!contentId || contentId.trim() === "") {
    notFound();
  }

  // API 호출
  let detail;
  let intro = null;
  let error: Error | null = null;

  try {
    detail = await getDetailCommon({ contentId });
    
    // 기본 정보가 있으면 운영 정보도 조회 (선택적)
    if (detail) {
      try {
        intro = await getDetailIntro({
          contentId,
          contentTypeId: detail.contenttypeid,
        });
      } catch (introError) {
        // 운영 정보 조회 실패는 무시 (선택적 섹션이므로)
        console.warn("운영 정보 조회 실패 (무시됨):", introError);
      }
    }
  } catch (err) {
    console.error("상세 정보 조회 실패:", err);
    error = err instanceof Error ? err : new Error(String(err));
  }

  // 데이터가 없으면 404
  if (!detail && !error) {
    notFound();
  }

  // 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Error
          message={error.message || "관광지 정보를 불러올 수 없습니다."}
          type="api"
        />
      </div>
    );
  }

  // 정상 데이터 표시
  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <Suspense fallback={<DetailPageSkeleton />}>
        <DetailInfo detail={detail!} />
        <DetailIntro intro={intro} />
      </Suspense>
    </main>
  );
}

