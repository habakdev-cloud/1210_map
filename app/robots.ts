/**
 * @file robots.ts
 * @description Robots.txt 생성
 *
 * Next.js 15의 robots API를 사용하여 검색 엔진 크롤러를 위한 robots.txt를 생성합니다.
 *
 * 주요 기능:
 * - 기본 크롤링 규칙 설정
 * - API 라우트 제외
 * - 인증 페이지 제외 (선택적)
 * - Sitemap URL 포함
 *
 * @see {@link /docs/PRD.md} - 페이지 구조 참고
 */

import type { MetadataRoute } from "next";

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
 * Robots.txt 생성
 * 
 * Next.js 15의 MetadataRoute.Robots 타입을 사용합니다.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/", // API 라우트 제외
          "/auth/", // 인증 페이지 제외 (Clerk 인증 페이지)
          "/sign-in", // 로그인 페이지
          "/sign-up", // 회원가입 페이지
          "/_next/", // Next.js 내부 파일
          "/storage-test", // 테스트 페이지 (개발용)
          "/auth-test", // 테스트 페이지 (개발용)
        ],
      },
      // Googlebot에 대한 특별 규칙 (선택적)
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/auth/", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

