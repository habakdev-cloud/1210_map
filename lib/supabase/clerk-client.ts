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

    return createBrowserClient(supabaseUrl, supabaseKey, {
      // Clerk 토큰을 Supabase 요청에 포함
      async accessToken() {
        try {
          return (await session?.getToken()) ?? null;
        } catch {
          return null;
        }
      },
    });
  }, [session]);

  return supabase;
}
