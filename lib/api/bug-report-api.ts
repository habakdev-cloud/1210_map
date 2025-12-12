/**
 * @file bug-report-api.ts
 * @description 버그 리포트 관련 API 함수
 *
 * 사용자 버그 리포트를 수집하는 Server Actions를 제공합니다.
 * 인증된 사용자 또는 익명 사용자 모두 버그 리포트를 제출할 수 있습니다.
 *
 * 주요 기능:
 * - 버그 리포트 제출 (submitBugReport)
 *
 * @see {@link /supabase/migrations/20251212151231_create_bug_reports_table.sql} - 버그 리포트 테이블 스키마
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

/**
 * 버그 리포트 제출 데이터
 */
export interface BugReportData {
  title: string;
  description: string;
  pageUrl?: string;
  userAgent?: string;
  errorStack?: string;
  screenshotUrl?: string;
}

/**
 * 버그 리포트 제출 결과
 */
export interface BugReportResult {
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
 * 버그 리포트 제출
 * 
 * 인증된 사용자 또는 익명 사용자 모두 버그 리포트를 제출할 수 있습니다.
 * 
 * @param bugReportData - 버그 리포트 데이터
 * @returns 버그 리포트 제출 결과
 */
export async function submitBugReport(
  bugReportData: BugReportData
): Promise<BugReportResult> {
  try {
    // 입력 검증
    if (!bugReportData.title || !bugReportData.description) {
      return {
        success: false,
        error: "버그 제목과 설명은 필수입니다.",
      };
    }

    if (bugReportData.title.trim().length === 0) {
      return {
        success: false,
        error: "버그 제목을 입력해주세요.",
      };
    }

    if (bugReportData.description.trim().length === 0) {
      return {
        success: false,
        error: "버그 설명을 입력해주세요.",
      };
    }

    if (bugReportData.title.length > 200) {
      return {
        success: false,
        error: "버그 제목은 200자 이하여야 합니다.",
      };
    }

    if (bugReportData.description.length > 10000) {
      return {
        success: false,
        error: "버그 설명은 10000자 이하여야 합니다.",
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

    // 버그 리포트 제출
    const { data, error } = await supabase
      .from("bug_reports")
      .insert({
        user_id,
        title: bugReportData.title.trim(),
        description: bugReportData.description.trim(),
        page_url: bugReportData.pageUrl || null,
        user_agent: bugReportData.userAgent || null,
        error_stack: bugReportData.errorStack || null,
        screenshot_url: bugReportData.screenshotUrl || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[submitBugReport] 버그 리포트 제출 실패:", error);
      return {
        success: false,
        error: "버그 리포트 제출에 실패했습니다. 잠시 후 다시 시도해주세요.",
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error("[submitBugReport] 에러:", error);
    return {
      success: false,
      error: "예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

