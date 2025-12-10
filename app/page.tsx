/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 전국 관광지 정보를 검색하고 조회할 수 있는 메인 페이지입니다.
 * Phase 2에서는 기본 레이아웃 구조만 설정하고,
 * 향후 관광지 목록, 필터, 지도 기능을 추가할 예정입니다.
 *
 * 레이아웃 구조:
 * - Hero Section (선택 사항)
 * - Main Content Area (관광지 목록/지도 영역)
 * - Footer
 *
 * @see {@link /docs/PRD.md} - MVP 2.1 관광지 목록 + 필터
 * @see {@link /docs/DESIGN.md} - 디자인 시스템 및 레이아웃 참고
 */

import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero Section (선택 사항) */}
      <section className="w-full py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              한국의 아름다운 관광지를 탐험하세요
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              전국 각지의 관광지 정보를 검색하고, 지도에서 위치를 확인하며,
              상세 정보를 알아보세요.
            </p>
            {/* 검색창 및 필터는 Phase 2 후반부에 구현 예정 */}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 pb-8">
        <div className="space-y-8">
          {/* 필터 영역 (Placeholder) - Phase 2 후반부에 구현 예정 */}
          <div className="border-b border-border pb-4">
            <p className="text-sm text-muted-foreground">
              필터 영역 (지역, 관광 타입, 정렬 옵션)이 여기에 표시됩니다.
            </p>
          </div>

          {/* 콘텐츠 영역 (Placeholder) */}
          <div className="min-h-[400px] flex items-center justify-center rounded-lg border border-dashed border-border">
            <div className="text-center space-y-4 p-8">
              <p className="text-lg font-medium text-foreground">
                관광지 목록이 여기에 표시됩니다
              </p>
              <p className="text-sm text-muted-foreground">
                Phase 2 후반부에 관광지 카드, 리스트, 지도가 추가될 예정입니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
