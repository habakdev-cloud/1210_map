-- ============================================
-- Clerk + Supabase RLS 정책 예제
-- ============================================
-- 
-- 이 파일은 Clerk와 Supabase 통합 시 사용할 수 있는
-- Row Level Security (RLS) 정책 예제입니다.
--
-- 사용 방법:
-- 1. 이 예제를 참고하여 자신의 테이블에 맞게 수정
-- 2. user_id 컬럼에 Clerk 사용자 ID 저장 (TEXT 타입)
-- 3. RLS 활성화 후 정책 적용
-- ============================================

-- ============================================
-- 예제 1: Tasks 테이블
-- ============================================

-- 테이블 생성
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 작업만 조회 가능
CREATE POLICY "User can view their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- INSERT 정책: 사용자는 자신의 작업만 생성 가능
CREATE POLICY "Users must insert their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- UPDATE 정책: 사용자는 자신의 작업만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- DELETE 정책: 사용자는 자신의 작업만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON tasks
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- ============================================
-- 예제 2: Posts 테이블 (공개 조회 가능, 작성자만 수정/삭제)
-- ============================================

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 공개된 게시글은 모든 인증된 사용자가 조회 가능
CREATE POLICY "Published posts are viewable by authenticated users"
ON posts
FOR SELECT
TO authenticated
USING (published = true);

-- SELECT 정책: 작성자는 자신의 게시글(공개/비공개 모두) 조회 가능
CREATE POLICY "Users can view their own posts"
ON posts
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- INSERT 정책: 인증된 사용자는 자신의 게시글 생성 가능
CREATE POLICY "Authenticated users can insert their own posts"
ON posts
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- UPDATE 정책: 작성자만 자신의 게시글 수정 가능
CREATE POLICY "Users can update their own posts"
ON posts
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- DELETE 정책: 작성자만 자신의 게시글 삭제 가능
CREATE POLICY "Users can delete their own posts"
ON posts
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- ============================================
-- 예제 3: Comments 테이블 (Posts와 연관)
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 게시글이 공개되어 있으면 댓글도 조회 가능
CREATE POLICY "Comments on published posts are viewable"
ON comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = comments.post_id
    AND posts.published = true
  )
);

-- SELECT 정책: 작성자는 자신의 댓글 조회 가능
CREATE POLICY "Users can view their own comments"
ON comments
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- INSERT 정책: 인증된 사용자는 댓글 작성 가능
CREATE POLICY "Authenticated users can insert comments"
ON comments
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- UPDATE 정책: 작성자만 자신의 댓글 수정 가능
CREATE POLICY "Users can update their own comments"
ON comments
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- DELETE 정책: 작성자만 자신의 댓글 삭제 가능
CREATE POLICY "Users can delete their own comments"
ON comments
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- ============================================
-- 예제 4: User Profiles (users 테이블과 연관)
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL UNIQUE REFERENCES users(clerk_id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 모든 인증된 사용자가 프로필 조회 가능
CREATE POLICY "Profiles are viewable by authenticated users"
ON user_profiles
FOR SELECT
TO authenticated
USING (true);

-- INSERT 정책: 사용자는 자신의 프로필만 생성 가능
CREATE POLICY "Users can insert their own profile"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = clerk_id
);

-- UPDATE 정책: 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update their own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = clerk_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = clerk_id
);

-- ============================================
-- 참고사항
-- ============================================
--
-- 1. user_id 컬럼 타입:
--    - Clerk 사용자 ID는 TEXT 타입입니다
--    - 기본값으로 `auth.jwt()->>'sub'`를 사용하면 자동으로 현재 사용자 ID가 저장됩니다
--
-- 2. RLS 정책 작성 시 주의사항:
--    - SELECT: USING 절만 사용
--    - INSERT: WITH CHECK 절만 사용
--    - UPDATE: USING과 WITH CHECK 모두 사용
--    - DELETE: USING 절만 사용
--
-- 3. 개발 환경에서 RLS 비활성화:
--    -- ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
--
-- 4. 프로덕션 배포 전:
--    - 모든 테이블에 RLS 활성화 확인
--    - 정책이 올바르게 작동하는지 테스트
--    - 여러 사용자 계정으로 데이터 격리 확인
--
-- ============================================


