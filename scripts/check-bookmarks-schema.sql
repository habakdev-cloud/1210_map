-- =====================================================
-- 북마크 스키마 확인 SQL 쿼리
-- =====================================================
-- Supabase Dashboard → SQL Editor에서 실행하세요.
-- 이 쿼리들은 bookmarks 테이블의 설정을 확인합니다.
-- =====================================================

-- 1. 테이블 존재 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'bookmarks'
) as table_exists;

-- 2. 테이블 스키마 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookmarks'
ORDER BY ordinal_position;

-- 3. PRIMARY KEY 확인
SELECT
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'bookmarks';

-- 4. UNIQUE 제약 조건 확인
SELECT
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'bookmarks';

-- 5. FOREIGN KEY 확인
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
  AND rc.constraint_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'bookmarks'
  AND kcu.column_name = 'user_id';

-- 6. 인덱스 확인
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'bookmarks'
  AND indexname LIKE 'idx_bookmarks%'
ORDER BY indexname;

-- 7. RLS 상태 확인
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'bookmarks';

-- 8. users 테이블과의 관계 확인 (데이터 샘플)
SELECT
  b.id,
  b.user_id,
  b.content_id,
  b.created_at,
  u.clerk_id,
  u.name
FROM bookmarks b
LEFT JOIN users u ON b.user_id = u.id
LIMIT 5;


