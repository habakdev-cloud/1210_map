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
 * 
 * @param clerkUserId - Clerk 사용자 ID
 * @param retryCount - 재시도 횟수 (기본값: 1)
 * @returns Supabase User ID 또는 null
 */
async function getSupabaseUserId(
  clerkUserId: string,
  retryCount: number = 1
): Promise<string | null> {
  try {
    // Supabase 클라이언트 생성 (에러 처리 강화)
    let supabase;
    try {
      supabase = await createClerkSupabaseClient();
    } catch (clientError) {
      console.error(
        `[getSupabaseUserId] Supabase 클라이언트 생성 실패:`,
        {
          clerkUserId,
          error: clientError instanceof Error ? clientError.message : String(clientError),
          stack: clientError instanceof Error ? clientError.stack : undefined,
        }
      );
      return null;
    }
    
    // 먼저 사용자 조회
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    // 사용자가 없으면 동기화 시도
    if (error && error.code === "PGRST116") {
      console.log(
        `[getSupabaseUserId] 사용자가 Supabase에 없음, 동기화 시도: ${clerkUserId}`
      );
      
      try {
        // 동기화 API 호출 (서버 사이드에서 직접 동기화)
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(clerkUserId);

        if (!clerkUser) {
          console.error(
            `[getSupabaseUserId] Clerk에서 사용자 정보를 찾을 수 없음: ${clerkUserId}`
          );
          return null;
        }

        // Service Role 클라이언트로 직접 동기화
        const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
        const serviceSupabase = getServiceRoleClient();

        const userName =
          clerkUser.fullName ||
          clerkUser.username ||
          clerkUser.emailAddresses[0]?.emailAddress ||
          "Unknown";

        const { data: syncedData, error: syncError } = await serviceSupabase
          .from("users")
          .upsert(
            {
              clerk_id: clerkUser.id,
              name: userName,
            },
            {
              onConflict: "clerk_id",
            }
          )
          .select()
          .single();

        if (syncError) {
          console.error(
            `[getSupabaseUserId] 사용자 동기화 실패:`,
            {
              clerkUserId,
              error: syncError.message,
              code: syncError.code,
              details: syncError.details,
            }
          );
          
          // 재시도 로직 (최대 1회)
          if (retryCount > 0) {
            console.log(
              `[getSupabaseUserId] 재시도 중... (남은 횟수: ${retryCount - 1})`
            );
            // 500ms 대기 후 재시도
            await new Promise((resolve) => setTimeout(resolve, 500));
            return getSupabaseUserId(clerkUserId, retryCount - 1);
          }
          
          return null;
        }

        if (!syncedData?.id) {
          console.error(
            `[getSupabaseUserId] 동기화 후에도 사용자 ID를 찾을 수 없음: ${clerkUserId}`
          );
          return null;
        }

        console.log(
          `[getSupabaseUserId] 사용자 동기화 성공: ${clerkUserId} -> ${syncedData.id}`
        );
        return syncedData.id;
      } catch (syncErr) {
        console.error(
          `[getSupabaseUserId] 사용자 동기화 중 예외 발생:`,
          {
            clerkUserId,
            error: syncErr instanceof Error ? syncErr.message : String(syncErr),
            stack: syncErr instanceof Error ? syncErr.stack : undefined,
          }
        );
        return null;
      }
    }

    if (error) {
      console.error(
        `[getSupabaseUserId] Supabase User ID 조회 실패:`,
        {
          clerkUserId,
          error: error.message,
          code: error.code,
          details: error.details,
        }
      );
      return null;
    }

    if (!data?.id) {
      console.error(
        `[getSupabaseUserId] 조회 결과에 사용자 ID가 없음: ${clerkUserId}`
      );
      return null;
    }

    return data.id;
  } catch (error) {
    // 에러 객체의 모든 속성을 로깅
    const errorDetails: Record<string, unknown> = {
      clerkUserId,
    };

    if (error instanceof Error) {
      errorDetails.error = error.message;
      errorDetails.name = error.name;
      errorDetails.stack = error.stack;
      // Error 객체의 모든 속성 추가
      Object.keys(error).forEach((key) => {
        if (!["message", "name", "stack"].includes(key)) {
          errorDetails[key] = (error as Record<string, unknown>)[key];
        }
      });
    } else {
      errorDetails.error = String(error);
      errorDetails.type = typeof error;
      // 일반 객체인 경우 모든 속성 추가
      if (error && typeof error === "object") {
        Object.keys(error).forEach((key) => {
          errorDetails[key] = (error as Record<string, unknown>)[key];
        });
      }
    }

    console.error(
      `[getSupabaseUserId] Supabase User ID 조회 중 예외 발생:`,
      errorDetails
    );
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
 * @returns 북마크된 콘텐츠 ID와 생성일시 배열 (최신순)
 */
export async function getUserBookmarks(): Promise<
  Array<{ content_id: string; created_at: string }>
> {
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

    // 북마크 목록 조회 (created_at 포함)
    const supabase = await createClerkSupabaseClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .select("content_id, created_at")
      .eq("user_id", supabaseUserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("북마크 목록 조회 실패:", error);
      return [];
    }

    return (
      data?.map((item) => ({
        content_id: item.content_id,
        created_at: item.created_at,
      })) || []
    );
  } catch (error) {
    console.error("북마크 목록 조회 중 에러:", error);
    return [];
  }
}

/**
 * 북마크 일괄 삭제
 * @param contentIds 삭제할 콘텐츠 ID 배열
 * @returns 성공 여부 및 삭제된 개수
 */
export async function removeBookmarks(contentIds: string[]): Promise<{
  success: boolean;
  error?: string;
  deletedCount?: number;
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

    // 빈 배열 체크
    if (!contentIds || contentIds.length === 0) {
      return {
        success: false,
        error: "삭제할 북마크를 선택해주세요.",
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

    // 북마크 일괄 삭제
    const supabase = await createClerkSupabaseClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", supabaseUserId)
      .in("content_id", contentIds)
      .select();

    if (error) {
      console.error("북마크 일괄 삭제 실패:", error);
      return {
        success: false,
        error: "북마크 삭제에 실패했습니다.",
      };
    }

    const deletedCount = data?.length || 0;

    return {
      success: true,
      deletedCount,
    };
  } catch (error) {
    console.error("북마크 일괄 삭제 중 에러:", error);
    return {
      success: false,
      error: "북마크 삭제 중 오류가 발생했습니다.",
    };
  }
}

