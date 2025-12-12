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
 * - Open Graph 메타태그 (SEO 최적화)
 *
 * @see {@link /docs/PRD.md} - MVP 2.4.1 기본 정보 섹션, MVP 2.4.5 공유 기능
 * @see {@link /docs/DESIGN.md} - 상세페이지 레이아웃
 */

import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  getDetailCommon,
  getDetailIntro,
  getDetailImage,
  getDetailPetTour,
} from "@/lib/api/tour-api";
import DetailInfo from "@/components/tour-detail/detail-info";
import DetailIntro from "@/components/tour-detail/detail-intro";
import DetailMap from "@/components/tour-detail/detail-map";
import DetailPetTour from "@/components/tour-detail/detail-pet-tour";
import DetailRecommendations from "@/components/tour-detail/detail-recommendations";
import { Skeleton } from "@/components/ui/skeleton";
import { Error as ErrorComponent } from "@/components/ui/error";

// 이미지 갤러리 컴포넌트를 동적 import로 로드 (swiper 라이브러리 크기 최적화)
const DetailGallery = dynamic(() => import("@/components/tour-detail/detail-gallery"), {
  loading: () => (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="w-full h-[400px] md:h-[500px] rounded-xl" />
    </div>
  ),
});

interface PlaceDetailPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * Open Graph 메타태그 생성
 * Next.js 15의 generateMetadata API 사용
 */
export async function generateMetadata({
  params,
}: PlaceDetailPageProps): Promise<Metadata> {
  const { contentId } = await params;

  try {
    // 관광지 기본 정보 조회
    const detail = await getDetailCommon({ contentId });

    if (!detail) {
      return {
        title: "관광지 정보를 찾을 수 없습니다",
        description: "요청하신 관광지 정보를 찾을 수 없습니다.",
      };
    }

    // 절대 URL 생성
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;
    const pageUrl = `${baseUrl}/places/${contentId}`;

    // 설명 텍스트 준비 (100자 이내)
    let description = detail.overview || `${detail.title} 관광지 정보`;
    if (description.length > 100) {
      description = description.substring(0, 97) + "...";
    }

    // 이미지 URL 준비
    const imageUrl = detail.firstimage || detail.firstimage2;
    const ogImage = imageUrl
      ? {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${detail.title} 대표 이미지`,
        }
      : undefined;

    return {
      title: `${detail.title} - My Trip`,
      description,
      openGraph: {
        title: detail.title,
        description,
        url: pageUrl,
        siteName: "My Trip",
        images: ogImage ? [ogImage] : [],
        locale: "ko_KR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: detail.title,
        description,
        images: ogImage ? [ogImage.url] : [],
      },
    };
  } catch (error) {
    console.error("메타데이터 생성 실패:", error);
    return {
      title: "관광지 정보 - My Trip",
      description:
        "한국관광공사 공공 API를 활용한 전국 관광지 정보 검색 서비스",
    };
  }
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
export default async function PlaceDetailPage({
  params,
}: PlaceDetailPageProps) {
  // Next.js 15: params는 Promise이므로 await 필요
  const { contentId } = await params;

  // contentId 유효성 검증
  if (!contentId || contentId.trim() === "") {
    notFound();
  }

  // API 호출
  let detail;
  let intro = null;
  let images = [];
  let petInfo = null;
  let error: Error | null = null;

  try {
    detail = await getDetailCommon({ contentId });

    // 기본 정보가 있으면 운영 정보, 이미지, 반려동물 정보도 조회 (선택적)
    if (detail) {
      // 병렬로 운영 정보, 이미지, 반려동물 정보 조회
      const [introResult, imagesResult, petInfoResult] =
        await Promise.allSettled([
          getDetailIntro({
            contentId,
            contentTypeId: detail.contenttypeid,
          }),
          getDetailImage({ contentId }),
          getDetailPetTour({ contentId }),
        ]);

      // 운영 정보 처리
      if (introResult.status === "fulfilled") {
        intro = introResult.value;
      } else {
        console.warn("운영 정보 조회 실패 (무시됨):", introResult.reason);
      }

      // 이미지 처리
      if (imagesResult.status === "fulfilled") {
        images = imagesResult.value;
      } else {
        console.warn("이미지 목록 조회 실패 (무시됨):", imagesResult.reason);
      }

      // 반려동물 정보 처리
      if (petInfoResult.status === "fulfilled") {
        petInfo = petInfoResult.value;
      } else {
        console.warn("반려동물 정보 조회 실패 (무시됨):", petInfoResult.reason);
      }
    }
  } catch (err: unknown) {
    console.error("상세 정보 조회 실패:", err);
    if (err instanceof Error) {
      error = err;
    } else {
      const errorMessage = err ? String(err) : "Unknown error";
      error = new Error(errorMessage);
    }
  }

  // 데이터가 없으면 404
  if (!detail && !error) {
    notFound();
  }

  // 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <ErrorComponent
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
        <DetailGallery images={images} title={detail!.title} />
        <DetailMap detail={detail!} />
        <DetailPetTour petInfo={petInfo} />
        <DetailRecommendations detail={detail!} />
      </Suspense>
    </main>
  );
}
