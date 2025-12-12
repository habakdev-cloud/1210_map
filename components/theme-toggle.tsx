/**
 * @file theme-toggle.tsx
 * @description 테마 전환 버튼 컴포넌트
 *
 * 사용자가 라이트/다크/시스템 모드를 선택할 수 있는 드롭다운 메뉴를 제공합니다.
 * next-themes의 useTheme 훅을 사용하여 테마를 관리합니다.
 *
 * 주요 기능:
 * - 라이트 모드 전환
 * - 다크 모드 전환
 * - 시스템 모드 (OS 설정 따름)
 * - 현재 선택된 테마 표시
 * - 접근성 지원 (ARIA 라벨, 키보드 네비게이션)
 *
 * @see {@link /docs/DESIGN.md} - 디자인 시스템
 */

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * 테마 전환 버튼 컴포넌트
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드 마운트 확인 (hydration mismatch 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 마운트 전에는 기본 아이콘 표시
  if (!mounted) {
    return (
      <div className="h-9 w-9 flex items-center justify-center">
        <Sun className="h-4 w-4" aria-hidden="true" />
      </div>
    );
  }

  // 현재 테마에 따른 아이콘 선택
  const getThemeIcon = () => {
    if (theme === "system") {
      return <Monitor className="h-4 w-4" aria-hidden="true" />;
    }
    if (resolvedTheme === "dark") {
      return <Moon className="h-4 w-4" aria-hidden="true" />;
    }
    return <Sun className="h-4 w-4" aria-hidden="true" />;
  };

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger
        className="w-9 h-9 p-0 border-0 focus:ring-2 focus:ring-ring"
        aria-label="테마 전환"
      >
        <div className="flex items-center justify-center">
          {getThemeIcon()}
        </div>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" aria-hidden="true" />
            <span>라이트</span>
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" aria-hidden="true" />
            <span>다크</span>
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" aria-hidden="true" />
            <span>시스템</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

