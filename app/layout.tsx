import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { clerkLocalization } from "@/lib/clerk/localization";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Trip - 한국 관광지 정보 서비스",
  description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 검색 서비스",
  keywords: ["관광지", "여행", "한국", "관광 정보", "My Trip"],
  openGraph: {
    title: "My Trip - 한국 관광지 정보 서비스",
    description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 검색 서비스",
    type: "website",
    locale: "ko_KR",
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
              <Navbar />
              {children}
              <Toaster />
            </SyncUserProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
