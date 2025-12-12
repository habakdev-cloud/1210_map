import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { clerkLocalization } from "@/lib/clerk/localization";
import { Toaster } from "@/components/ui/sonner";
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * 사이트 기본 URL 가져오기
 * 환경변수 NEXT_PUBLIC_SITE_URL이 있으면 사용, 없으면 동적 생성
 */
function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  // 프로덕션 환경에서는 실제 도메인 사용 권장
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // 개발 환경 기본값
  return "http://localhost:3000";
}

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "My Trip - 한국 관광지 정보 서비스",
    template: "%s | My Trip",
  },
  description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 검색 서비스",
  keywords: ["관광지", "여행", "한국", "관광 정보", "My Trip"],
  authors: [{ name: "My Trip" }],
  creator: "My Trip",
  publisher: "My Trip",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "My Trip",
    title: "My Trip - 한국 관광지 정보 서비스",
    description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 검색 서비스",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "My Trip - 한국 관광지 정보 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Trip - 한국 관광지 정보 서비스",
    description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 검색 서비스",
    images: ["/og-image.png"],
    creator: "@mytrip", // 실제 Twitter 계정이 있으면 업데이트
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Google Search Console, Naver Search Advisor 등 검증 코드 추가 가능
    // google: "your-google-verification-code",
    // other: {
    //   "naver-site-verification": "your-naver-verification-code",
    // },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang="ko" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SyncUserProvider>
              <WebVitalsReporter />
              <Navbar />
              {children}
              <Footer />
              <Toaster />
            </SyncUserProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
