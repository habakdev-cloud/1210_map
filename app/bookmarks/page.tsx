/**
 * @file app/bookmarks/page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 페이지입니다.
 * 인증된 사용자만 접근 가능하며, 로그인하지 않은 경우 로그인 페이지로 리다이렉트합니다.
 *
 * 주요 기능:
 * - 인증 확인 및 리다이렉트
 * - 북마크 목록 표시 (BookmarkList 컴포넌트)
 * - 로딩 상태 표시
 *
 * @see {@link /docs/PRD.md} - Phase 5 북마크 페이지
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import BookmarkList from "@/components/bookmarks/bookmark-list";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 북마크 페이지 로딩 스켈레톤
 */
function BookmarksSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * 북마크 페이지 컴포넌트
 */
export default async function BookmarksPage() {
  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">내 북마크</h1>
        <Suspense fallback={<BookmarksSkeleton />}>
          <BookmarkList />
        </Suspense>
      </div>
    </main>
  );
}



