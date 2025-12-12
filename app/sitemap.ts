/**
 * @file sitemap.ts
 * @description 동적 Sitemap 생성
 *
 * Next.js 15의 sitemap API를 사용하여 동적 sitemap을 생성합니다.
 * 정적 페이지와 관광지 상세페이지를 포함합니다.
 *
 * 주요 기능:
 * - 정적 페이지 포함 (/, /stats, /bookmarks)
 * - 동적 관광지 상세페이지 포함 (API 조회)
 * - 최근 업데이트된 관광지 우선 포함
 * - 각 페이지의 priority 및 changeFrequency 설정
 * - 캐싱 전략 적용 (revalidate: 86400 = 24시간)
 *
 * @see {@link /docs/PRD.md} - 페이지 구조 참고
 * @see {@link /lib/api/tour-api.ts} - 관광지 목록 조회 API
 */

import type { MetadataRoute } from "next";
import { getAreaBasedList } from "@/lib/api/tour-api";

/**
 * 사이트 기본 URL 가져오기
 */
function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * 관광지 목록 조회 (최근 업데이트된 관광지 우선)
 * 
 * API Rate Limit을 고려하여 최대 개수를 제한합니다.
 * 최근 업데이트된 관광지를 우선적으로 포함합니다.
 */
async function getTourItemsForSitemap(): Promise<
  Array<{
    url: string;
    lastModified: Date;
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
    priority: number;
  }>
> {
  const siteUrl = getSiteUrl();
  const maxItems = 1000; // 최대 1000개 관광지 포함 (Rate Limit 고려)
  const itemsPerPage = 100; // 페이지당 100개 조회
  const maxPages = Math.ceil(maxItems / itemsPerPage);

  try {
    const allItems: Array<{
      contentId: string;
      modifiedtime: string;
    }> = [];

    // 여러 페이지를 조회하여 최근 업데이트된 관광지 수집
    for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
      try {
        const items = await getAreaBasedList({
          numOfRows: itemsPerPage,
          pageNo,
        });

        if (items.length === 0) {
          break; // 더 이상 데이터가 없으면 중단
        }

        // contentId와 modifiedtime만 추출
        const extractedItems = items
          .filter((item) => item.contentid && item.modifiedtime)
          .map((item) => ({
            contentId: item.contentid,
            modifiedtime: item.modifiedtime,
          }));

        allItems.push(...extractedItems);

        // 최대 개수에 도달하면 중단
        if (allItems.length >= maxItems) {
          break;
        }

        // Rate Limit 방지를 위한 짧은 대기 (선택적)
        if (pageNo < maxPages && pageNo % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Sitemap: 페이지 ${pageNo} 조회 실패:`, error);
        // 개별 페이지 실패는 무시하고 계속 진행
        break;
      }
    }

    // modifiedtime 기준으로 정렬 (최신순)
    allItems.sort((a, b) => {
      const dateA = new Date(a.modifiedtime).getTime();
      const dateB = new Date(b.modifiedtime).getTime();
      return dateB - dateA; // 내림차순
    });

    // 최대 개수로 제한
    const limitedItems = allItems.slice(0, maxItems);

    // sitemap 형식으로 변환
    return limitedItems.map((item) => {
      // modifiedtime을 안전하게 Date 객체로 변환
      let lastModified: Date;
      try {
        const date = new Date(item.modifiedtime);
        // 유효한 날짜인지 확인
        if (isNaN(date.getTime())) {
          lastModified = new Date(); // 유효하지 않으면 현재 날짜 사용
        } else {
          lastModified = date;
        }
      } catch {
        lastModified = new Date(); // 에러 발생 시 현재 날짜 사용
      }

      return {
        url: `${siteUrl}/places/${item.contentId}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      };
    });
  } catch (error) {
    console.error("Sitemap: 관광지 목록 조회 실패:", error);
    // API 실패 시 빈 배열 반환 (정적 페이지만 포함)
    return [];
  }
}

/**
 * 동적 Sitemap 생성
 * 
 * Next.js 15의 MetadataRoute.Sitemap 타입을 사용합니다.
 * 24시간마다 재생성됩니다 (revalidate: 86400).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/stats`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/bookmarks`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // 동적 관광지 상세페이지
  const tourPages = await getTourItemsForSitemap();

  // 정적 페이지와 동적 페이지 결합
  return [...staticPages, ...tourPages];
}

// ISR 설정: 24시간마다 재생성
export const revalidate = 86400; // 24시간

