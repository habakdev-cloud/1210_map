/**
 * @file check-bookmarks-schema.ts
 * @description 북마크 스키마 확인 스크립트
 *
 * Supabase 데이터베이스에서 bookmarks 테이블의 설정을 확인합니다.
 * 
 * 실행 방법:
 *   pnpm tsx scripts/check-bookmarks-schema.ts
 * 
 * 또는 tsx가 설치되지 않은 경우:
 *   npx tsx scripts/check-bookmarks-schema.ts
 */

import { verifyBookmarksSchema } from "../lib/utils/check-supabase-schema";

/**
 * 메인 실행 함수
 */
async function main() {
  console.log("=".repeat(60));
  console.log("🔍 Supabase 북마크 스키마 확인");
  console.log("=".repeat(60));
  console.log("");

  try {
    const result = await verifyBookmarksSchema();

    console.log("");
    console.log("=".repeat(60));
    console.log("📊 검증 결과");
    console.log("=".repeat(60));
    console.log("");

    // 결과 출력
    console.log(`테이블 존재: ${result.tableExists ? "✅" : "❌"}`);
    console.log(`스키마 유효: ${result.schemaValid ? "✅" : "❌"}`);
    console.log(`FOREIGN KEY: ${result.foreignKeyValid ? "✅" : "⚠️  (수동 확인 필요)"}`);
    console.log(`인덱스: ${result.indexesValid ? "✅" : "⚠️  (수동 확인 필요)"}`);
    console.log(`RLS 비활성화: ${result.rlsDisabled ? "✅" : "⚠️  (수동 확인 필요)"}`);

    if (result.details.tableSchema) {
      console.log("");
      console.log("📋 테이블 스키마:");
      console.log("   컬럼:");
      result.details.tableSchema.columns.forEach((col) => {
        console.log(
          `     - ${col.column_name} (${col.data_type}) ${
            col.is_nullable === "NO" ? "NOT NULL" : "NULL"
          }`
        );
      });
      if (result.details.tableSchema.primaryKey) {
        console.log(`   PRIMARY KEY: ${result.details.tableSchema.primaryKey}`);
      }
      if (result.details.tableSchema.uniqueConstraints.length > 0) {
        console.log(
          `   UNIQUE 제약 조건: ${result.details.tableSchema.uniqueConstraints.join(", ")}`
        );
      }
    }

    if (result.issues.length > 0) {
      console.log("");
      console.log("❌ 발견된 문제:");
      result.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    } else {
      console.log("");
      console.log("✅ 기본 검증 완료!");
      console.log("");
      console.log("⚠️  참고: FOREIGN KEY, 인덱스, RLS 상태는");
      console.log("   Supabase Dashboard의 SQL Editor에서 직접 확인해야 합니다.");
      console.log("   위에 출력된 SQL 쿼리를 복사하여 실행하세요.");
    }

    console.log("");
    console.log("=".repeat(60));
    console.log("");

    // 종료 코드
    process.exit(result.issues.length > 0 ? 1 : 0);
  } catch (error) {
    console.error("");
    console.error("❌ 에러 발생:");
    console.error(error);
    console.error("");
    process.exit(1);
  }
}

// 스크립트 실행
main();


