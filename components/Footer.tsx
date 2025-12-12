/**
 * @file Footer.tsx
 * @description 사이트 하단 푸터 컴포넌트
 *
 * 모든 페이지에서 공통으로 사용되는 푸터 컴포넌트입니다.
 * DESIGN.md의 디자인 시스템을 반영하여 구현되었습니다.
 *
 * 구성 요소:
 * - 저작권 표시: "My Trip © 2025"
 * - 링크: About, Contact (향후 구현 가능)
 * - API 제공 안내: "한국관광공사 API 제공"
 *
 * @see {@link /docs/DESIGN.md} - 디자인 시스템 참고
 */

import Link from "next/link";
import { FeedbackButton } from "@/components/feedback/feedback-button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          {/* 좌측: 저작권 */}
          <div className="text-sm text-muted-foreground">
            My Trip © {currentYear}
          </div>

          {/* 우측: 링크 및 API 제공 안내 */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm text-muted-foreground">
            {/* 링크 섹션 (향후 구현) */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* 피드백 버튼 */}
              <FeedbackButton size="sm" variant="outline" />
              
              {/* About, Contact 링크는 향후 구현 */}
              {/* <Link href="/about" className="hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link> */}
            </div>

            {/* API 제공 안내 */}
            <div className="text-center md:text-left">
              한국관광공사 API 제공
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}






