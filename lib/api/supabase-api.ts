/**
 * @file supabase-api.ts
 * @description Supabase 북마크 관련 API 함수
 *
 * 북마크 기능을 위한 Server Actions를 제공합니다.
 * Clerk 인증과 Supabase를 연동하여 사용자의 북마크를 관리합니다.
 *
 * 주요 기능:
 * - 북마크 조회 (getBookmark)
 * - 북마크 추가 (addBookmark)
 * - 북마크 제거 (removeBookmark)
 * - 사용자 북마크 목록 조회 (getUserBookmarks)
 *
 * @see {@link /docs/PRD.md} - MVP 2.4.5 북마크 기능
 * @see {@link /supabase/migrations/db.sql} - 북마크 테이블 스키마
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk User ID로 Supabase User ID 조회
 * 사용자가 없으면 자동으로 동기화를 시도합니다.
 */
async function getSupabaseUserId(clerkUserId: string): Promise<string | null> {
  try {
    const supabase = await createClerkSupabaseClient();
    
    // 먼저 사용자 조회
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    // 사용자가 없으면 동기화 시도
    if (error && error.code === "PGRST116") {
      console.log("사용자가 Supabase에 없음, 동기화 시도:", clerkUserId);
      
      try {
        // 동기화 API 호출 (서버 사이드에서 직접 동기화)
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(clerkUserId);

        if (clerkUser) {
          // Service Role 클라이언트로 직접 동기화
          const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
          const serviceSupabase = getServiceRoleClient();

          const { data: syncedData, error: syncError } = await serviceSupabase
            .from("users")
            .upsert(
              {
                clerk_id: clerkUser.id,
                name:
                  clerkUser.fullName ||
                  clerkUser.username ||
                  clerkUser.emailAddresses[0]?.emailAddress ||
                  "Unknown",
              },
              {
                onConflict: "clerk_id",
              }
            )
            .select()
            .single();

          if (syncError) {
            console.error("사용자 동기화 실패:", syncError);
            return null;
          }

          return syncedData?.id || null;
        }
      } catch (syncErr) {
        console.error("사용자 동기화 중 에러:", syncErr);
        return null;
      }
    }

    if (error) {
      console.error("Supabase User ID 조회 실패:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Supabase User ID 조회 중 에러:", error);
    return null;
  }
}

/**
 * 북마크 조회
 * @param contentId 관광지 콘텐츠 ID
 * @returns 북마크가 존재하면 true, 없으면 false
 */
export async function getBookmark(contentId: string): Promise<boolean> {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return false;
    }

    // Supabase User ID 조회
    const supabaseUserId = await getSupabaseUserId(userId);
    if (!supabaseUserId) {
      return false;
    }

    // 북마크 조회
    const supabase = await createClerkSupabaseClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", supabaseUserId)
      .eq("content_id", contentId)
      .single();

    if (error) {
      // 북마크가 없는 경우 (정상)
      if (error.code === "PGRST116") {
        return false;
      }
      console.error("북마크 조회 실패:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("북마크 조회 중 에러:", error);
    return false;
  }
}

/**
 * 북마크 추가
 * @param contentId 관광지 콘텐츠 ID
 * @returns 성공 여부
 */
export async function addBookmark(contentId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // Supabase User ID 조회
    const supabaseUserId = await getSupabaseUserId(userId);
    if (!supabaseUserId) {
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    // 북마크 추가
    const supabase = await createClerkSupabaseClient();
    const { error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: supabaseUserId,
        content_id: contentId,
      });

    if (error) {
      // 중복 북마크인 경우
      if (error.code === "23505") {
        return {
          success: false,
          error: "이미 북마크된 관광지입니다.",
        };
      }
      console.error("북마크 추가 실패:", error);
      return {
        success: false,
        error: "북마크 추가에 실패했습니다.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("북마크 추가 중 에러:", error);
    return {
      success: false,
      error: "북마크 추가 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 북마크 제거
 * @param contentId 관광지 콘텐츠 ID
 * @returns 성공 여부
 */
export async function removeBookmark(contentId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // Supabase User ID 조회
    const supabaseUserId = await getSupabaseUserId(userId);
    if (!supabaseUserId) {
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    // 북마크 제거
    const supabase = await createClerkSupabaseClient();
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", supabaseUserId)
      .eq("content_id", contentId);

    if (error) {
      console.error("북마크 제거 실패:", error);
      return {
        success: false,
        error: "북마크 제거에 실패했습니다.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("북마크 제거 중 에러:", error);
    return {
      success: false,
      error: "북마크 제거 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자 북마크 목록 조회
 * @returns 북마크된 콘텐츠 ID 배열 (최신순)
 */
export async function getUserBookmarks(): Promise<string[]> {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    // Supabase User ID 조회
    const supabaseUserId = await getSupabaseUserId(userId);
    if (!supabaseUserId) {
      return [];
    }

    // 북마크 목록 조회
    const supabase = await createClerkSupabaseClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .select("content_id")
      .eq("user_id", supabaseUserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("북마크 목록 조회 실패:", error);
      return [];
    }

    return data?.map((item) => item.content_id) || [];
  } catch (error) {
    console.error("북마크 목록 조회 중 에러:", error);
    return [];
  }
}

