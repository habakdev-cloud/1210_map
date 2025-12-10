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
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
