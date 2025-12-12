"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, BarChart3, Bookmark, Menu, ArrowLeft } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import TourSearch from "@/components/tour-search";
import { ThemeToggle } from "@/components/theme-toggle";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDetailPage, setIsDetailPage] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const navLinks = [
    { href: "/", label: "홈", icon: Home },
    { href: "/stats", label: "통계", icon: BarChart3 },
  ];

  const isActive = (href: string) => pathname === href;
  
  // 클라이언트 사이드 마운트 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 상세페이지 여부 확인 (/places/[contentId])
  // 클라이언트 사이드에서만 확인하여 hydration mismatch 방지
  useEffect(() => {
    setIsDetailPage(pathname?.startsWith("/places/") ?? false);
  }, [pathname]);

  // 모바일 메뉴 Esc 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* 왼쪽: 뒤로가기 버튼 또는 로고 */}
        <div className="flex items-center gap-4">
          {isDetailPage && isMounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="flex-shrink-0"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
          )}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              My Trip
            </span>
          </Link>
        </div>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden md:flex items-center gap-6" aria-label="메인 네비게이션">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {isMounted && <Icon className="h-4 w-4" aria-hidden="true" />}
                {link.label}
              </Link>
            );
          })}
          <SignedIn>
            <Link
              href="/bookmarks"
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                isActive("/bookmarks")
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
              aria-current={isActive("/bookmarks") ? "page" : undefined}
            >
              {isMounted && <Bookmark className="h-4 w-4" aria-hidden="true" />}
              북마크
            </Link>
          </SignedIn>
        </nav>

        {/* 오른쪽 메뉴 */}
        <div className="flex items-center gap-4">
          {/* 헤더 검색창 (데스크톱만 표시) */}
          <div className="hidden lg:block">
            <Suspense fallback={<div className="w-48 h-9" />}>
              <TourSearch size="small" />
            </Suspense>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm">로그인</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* 모바일 햄버거 메뉴 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴 토글"
          >
            {isMounted && <Menu className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t bg-background" aria-label="모바일 네비게이션">
          <div className="container px-4 py-4 space-y-2">
            {/* 모바일 검색창 */}
            <div className="mb-4">
              <Suspense fallback={<div className="w-full h-9" />}>
                <TourSearch size="small" />
              </Suspense>
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {isMounted && <Icon className="h-5 w-5" aria-hidden="true" />}
                  {link.label}
                </Link>
              );
            })}
            <SignedIn>
              <Link
                href="/bookmarks"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive("/bookmarks")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent"
                )}
                aria-current={isActive("/bookmarks") ? "page" : undefined}
              >
                {isMounted && <Bookmark className="h-5 w-5" aria-hidden="true" />}
                북마크
              </Link>
            </SignedIn>
            {/* 모바일 테마 전환 */}
            <div className="flex items-center justify-between px-3 py-2 border-t mt-2 pt-2">
              <span className="text-sm font-medium text-muted-foreground">테마</span>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
