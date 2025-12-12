/**
 * @file manifest.ts
 * @description PWA Manifest 파일
 *
 * Next.js 15의 네이티브 PWA 지원을 사용하여 Web App Manifest를 정의합니다.
 * 사용자가 모바일에서 앱처럼 설치하고 사용할 수 있도록 설정합니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항
 * @see {@link /docs/DESIGN.md} - 디자인 가이드
 */

import type { MetadataRoute } from "next";

/**
 * 사이트 기본 URL 가져오기
 * manifest.ts는 서버 사이드에서 실행되므로 환경변수를 직접 사용
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
 * PWA Manifest 설정
 */
export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();

  return {
    name: "My Trip - 한국 관광지 정보 서비스",
    short_name: "My Trip",
    description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 검색 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait",
    scope: "/",
    categories: ["travel", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}

