/**
 * @file feedback-api.ts
 * @description 피드백 관련 API 함수
 *
 * 사용자 피드백을 수집하는 Server Actions를 제공합니다.
 * 인증된 사용자 또는 익명 사용자 모두 피드백을 제출할 수 있습니다.
 *
 * 주요 기능:
 * - 피드백 제출 (submitFeedback)
 *
 * @see {@link /supabase/migrations/20251212150857_create_feedback_table.sql} - 피드백 테이블 스키마
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

/**
 * 피드백 타입
 */
export type FeedbackType = "general" | "feature" | "improvement";

/**
 * 피드백 제출 데이터
 */
export interface FeedbackData {
  type: FeedbackType;
  content: string;
  rating?: number; // 1-5 (선택 사항)
}

/**
 * 피드백 제출 결과
 */
export interface FeedbackResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Clerk User ID로 Supabase User ID 조회
 * 
 * @param clerkUserId - Clerk 사용자 ID
 * @returns Supabase User ID 또는 null
 */
async function getSupabaseUserId(
  clerkUserId: string
): Promise<string | null> {
  try {
    const supabase = await createClerkSupabaseClient();
    
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (error) {
      console.error("[getSupabaseUserId] 사용자 조회 실패:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("[getSupabaseUserId] 에러:", error);
    return null;
  }
}

/**
 * 피드백 제출
 * 
 * 인증된 사용자 또는 익명 사용자 모두 피드백을 제출할 수 있습니다.
 * 
 * @param feedbackData - 피드백 데이터
 * @returns 피드백 제출 결과
 */
export async function submitFeedback(
  feedbackData: FeedbackData
): Promise<FeedbackResult> {
  try {
    // 입력 검증
    if (!feedbackData.type || !feedbackData.content) {
      return {
        success: false,
        error: "피드백 타입과 내용은 필수입니다.",
      };
    }

    if (feedbackData.content.trim().length === 0) {
      return {
        success: false,
        error: "피드백 내용을 입력해주세요.",
      };
    }

    if (feedbackData.content.length > 5000) {
      return {
        success: false,
        error: "피드백 내용은 5000자 이하여야 합니다.",
      };
    }

    if (feedbackData.rating && (feedbackData.rating < 1 || feedbackData.rating > 5)) {
      return {
        success: false,
        error: "평점은 1-5 사이의 값이어야 합니다.",
      };
    }

    // Supabase 클라이언트 생성
    const supabase = await createClerkSupabaseClient();

    // 인증된 사용자인지 확인
    const { userId } = await auth();
    let user_id: string | null = null;

    if (userId) {
      // Supabase User ID 조회
      user_id = await getSupabaseUserId(userId);
      // 사용자가 없어도 익명으로 제출 가능
    }

    // 피드백 제출
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        user_id,
        type: feedbackData.type,
        content: feedbackData.content.trim(),
        rating: feedbackData.rating || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[submitFeedback] 피드백 제출 실패:", error);
      return {
        success: false,
        error: "피드백 제출에 실패했습니다. 잠시 후 다시 시도해주세요.",
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error("[submitFeedback] 에러:", error);
    return {
      success: false,
      error: "예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

