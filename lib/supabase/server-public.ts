import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 공개 데이터용 Supabase 클라이언트 (Server Component용)
 *
 * 인증이 필요 없는 공개 데이터 조회용 서버 클라이언트입니다.
 * Supabase 공식 Next.js 가이드 패턴을 따릅니다.
 *
 * @see {@link https://supabase.com/docs/guides/getting-started/quickstarts/nextjs Supabase 공식 Next.js 가이드}
 *
 * @example
 * ```tsx
 * import { createPublicSupabaseClient } from '@/lib/supabase/server-public';
 *
 * export default async function PublicPage() {
 *   const supabase = await createPublicSupabaseClient();
 *   // 공개 데이터만 조회 가능
 *   const { data } = await supabase.from('public_posts').select('*');
 *   return <div>...</div>;
 * }
 * ```
 */
export async function createPublicSupabaseClient() {
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
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server Component에서는 쿠키 설정 불가 (정상)
          }
        });
      },
    },
  });
}


