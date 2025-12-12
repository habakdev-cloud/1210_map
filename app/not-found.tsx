/**
 * @file not-found.tsx
 * @description 404 Not Found 페이지
 *
 * 존재하지 않는 페이지에 접근했을 때 표시되는 404 페이지입니다.
 * notFound() 함수 호출 시 자동으로 이 컴포넌트가 렌더링됩니다.
 *
 * 주요 기능:
 * - 사용자 친화적인 404 메시지
 * - 홈으로 돌아가기 버튼
 * - 검색 링크 (선택 사항)
 *
 * @see {@link /docs/PRD.md} - Phase 6 최적화 & 배포
 * @see {@link /docs/DESIGN.md} - 404 페이지 디자인 가이드
 */

import Link from "next/link";
import { Home, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 Not Found 페이지 컴포넌트
 */
export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[600px] rounded-lg border border-dashed border-border p-12">
          {/* 404 아이콘 */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>

          {/* 제목 */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            404
          </h1>

          {/* 메시지 */}
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            <br />
            URL을 확인하시거나 홈으로 돌아가시기 바랍니다.
          </p>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <Search className="w-4 h-4 mr-2" />
                관광지 검색하기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

