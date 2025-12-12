/**
 * @file offline/page.tsx
 * @description 오프라인 페이지
 *
 * 네트워크 연결이 없을 때 표시되는 오프라인 페이지입니다.
 * Service Worker가 오프라인 상태를 감지하면 이 페이지를 표시합니다.
 *
 * 주요 기능:
 * - 오프라인 상태 안내 메시지
 * - 재시도 버튼
 * - 캐시된 데이터 사용 안내
 *
 * @see {@link /docs/PRD.md} - Phase 6 최적화 & 배포
 * @see {@link /docs/DESIGN.md} - 오프라인 페이지 디자인 가이드
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * 오프라인 페이지 컴포넌트
 */
export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);

  // 온라인 상태 확인
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // 초기 상태 확인
    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 온라인 상태가 되면 자동으로 새로고침
  useEffect(() => {
    if (isOnline) {
      router.refresh();
    }
  }, [isOnline, router]);

  const handleRetry = () => {
    if (navigator.onLine) {
      router.refresh();
    } else {
      // 오프라인 상태이면 페이지 새로고침
      window.location.reload();
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[600px] rounded-lg border border-dashed border-border p-12">
          {/* 오프라인 아이콘 */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <WifiOff className="w-10 h-10 text-muted-foreground" />
          </div>

          {/* 제목 */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            오프라인 상태
          </h1>

          {/* 메시지 */}
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            인터넷 연결을 확인해주세요
          </h2>
          <p className="text-muted-foreground text-center mb-4 max-w-md">
            현재 인터넷에 연결되어 있지 않습니다.
            <br />
            네트워크 연결을 확인한 후 다시 시도해주세요.
          </p>
          <p className="text-sm text-muted-foreground text-center mb-8 max-w-md">
            일부 캐시된 콘텐츠는 오프라인에서도 사용할 수 있습니다.
          </p>

          {/* 상태 표시 */}
          {isOnline ? (
            <div className="mb-6 px-4 py-2 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
              연결이 복구되었습니다. 페이지를 새로고침합니다...
            </div>
          ) : (
            <div className="mb-6 px-4 py-2 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm">
              오프라인 상태입니다.
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button onClick={handleRetry} size="lg" disabled={!isOnline}>
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

