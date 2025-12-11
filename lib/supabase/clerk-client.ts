"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useSession, useUser } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * Supabase 공식 Next.js 가이드 패턴을 따르면서 Clerk 인증을 통합했습니다.
 * - @supabase/ssr의 createBrowserClient 사용 (브라우저 최적화)
 * - Clerk 토큰을 accessToken 옵션으로 전달
 * - React Hook으로 제공되어 Client Component에서 사용
 *
 * @see {@link https://supabase.com/docs/guides/getting-started/quickstarts/nextjs Supabase 공식 Next.js 가이드}
 * @see {@link https://clerk.com/docs/guides/development/integrations/databases/supabase Clerk 공식 문서}
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 *
 * export default function MyComponent() {
 *   const supabase = useClerkSupabaseClient();
 *
 *   async function fetchData() {
 *     const { data } = await supabase.from('table').select('*');
 *     return data;
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient() {
  // Clerk 공식 문서 권장: useUser()로 사용자 로드 확인, useSession()으로 토큰 가져오기
  const { user } = useUser();
  const { session } = useSession();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    try {
      return createBrowserClient(supabaseUrl, supabaseKey, {
        // Clerk 토큰을 Supabase 요청에 포함
        async accessToken() {
          try {
            return (await session?.getToken()) ?? null;
          } catch {
            return null;
          }
        },
        // 쿠키만 사용하도록 명시 (localStorage 접근 방지)
        cookies: {
          getAll() {
            // 쿠키 읽기는 브라우저에서 자동으로 처리됨
            return [];
          },
          setAll() {
            // 쿠키 설정은 브라우저에서 자동으로 처리됨
            // 여기서는 아무 작업도 하지 않음
          },
        },
      });
    } catch (error) {
      // 스토리지 접근 에러를 무시하고 기본 클라이언트 반환
      console.warn(
        "[useClerkSupabaseClient] 클라이언트 생성 중 에러 발생 (무시됨):",
        error instanceof Error ? error.message : String(error)
      );
      
      // 에러가 발생해도 기본 클라이언트 반환 (쿠키는 여전히 작동)
      return createBrowserClient(supabaseUrl, supabaseKey, {
        async accessToken() {
          try {
            return (await session?.getToken()) ?? null;
          } catch {
            return null;
          }
        },
      });
    }
  }, [session]);

  return supabase;
}
