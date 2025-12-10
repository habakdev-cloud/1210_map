import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component/Server Action용)
 *
 * Supabase 공식 Next.js 가이드 패턴을 따르면서 Clerk 인증을 통합했습니다.
 * - @supabase/ssr의 createServerClient 사용 (쿠키 기반 세션 관리)
 * - Clerk 토큰을 accessToken 옵션으로 전달
 * - Server Component와 Server Action에서 사용
 *
 * @see {@link https://supabase.com/docs/guides/getting-started/quickstarts/nextjs Supabase 공식 Next.js 가이드}
 * @see {@link https://clerk.com/docs/guides/development/integrations/databases/supabase Clerk 공식 문서}
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = await createClerkSupabaseClient();
 *   const { data } = await supabase.from('table').select('*');
 *   return <div>...</div>;
 * }
 * ```
 *
 * @example
 * ```ts
 * // Server Action
 * 'use server';
 *
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export async function addTask(name: string) {
 *   const supabase = await createClerkSupabaseClient();
 *   await supabase.from('tasks').insert({ name });
 * }
 * ```
 */
export async function createClerkSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Component에서는 읽기 전용이므로 경고만 발생
        // 실제 쿠키 설정은 Middleware나 Route Handler에서 처리
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server Component에서는 쿠키 설정 불가 (정상)
          }
        });
      },
    },
    // Clerk 토큰을 Supabase 요청에 포함
    async accessToken() {
      try {
        return (await auth()).getToken() ?? null;
      } catch {
        return null;
      }
    },
  });
}
