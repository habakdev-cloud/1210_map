import { createBrowserClient } from "@supabase/ssr";

/**
 * 공개 데이터용 Supabase 클라이언트 (Client Component용)
 *
 * 인증이 필요 없는 공개 데이터 조회용 클라이언트입니다.
 * Supabase 공식 Next.js 가이드 패턴을 따릅니다.
 *
 * @see {@link https://supabase.com/docs/guides/getting-started/quickstarts/nextjs Supabase 공식 Next.js 가이드}
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { supabase } from '@/lib/supabase/client';
 *
 * export default function PublicData() {
 *   // 공개 데이터만 조회 가능
 *   const { data } = await supabase.from('public_posts').select('*');
 * }
 * ```
 */
// 공개 데이터용 클라이언트 생성 (에러 처리 포함)
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

try {
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // 쿠키만 사용하도록 명시
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // 쿠키 설정은 브라우저에서 자동으로 처리됨
        },
      },
    }
  );
} catch (error) {
  // 스토리지 접근 에러를 무시하고 기본 클라이언트 생성
  console.warn(
    "[supabase client] 클라이언트 생성 중 에러 발생 (무시됨):",
    error instanceof Error ? error.message : String(error)
  );
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const supabase = supabaseInstance!;
