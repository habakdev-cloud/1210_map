-- =====================================================
-- 마이그레이션: 버그 리포트 테이블 생성
-- 작성일: 2025-12-12
-- 설명: 사용자 버그 리포트를 수집하는 테이블
--       - 버그 제목, 설명, 페이지 URL, 사용자 에이전트, 에러 스택 포함
--       - 스크린샷 URL (Supabase Storage, 선택 사항)
--       - 상태 관리 (pending, in_progress, resolved)
--       - 인증된 사용자 또는 익명 사용자 모두 제출 가능
--       - RLS 비활성화 (개발 환경)
-- =====================================================

-- =====================================================
-- bug_reports 테이블 (버그 리포트)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    page_url TEXT,
    user_agent TEXT,
    error_stack TEXT,
    screenshot_url TEXT, -- Supabase Storage URL
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.bug_reports OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON public.bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports(created_at DESC);

-- Row Level Security (RLS) 비활성화
ALTER TABLE public.bug_reports DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.bug_reports TO anon;
GRANT ALL ON TABLE public.bug_reports TO authenticated;
GRANT ALL ON TABLE public.bug_reports TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.bug_reports IS '버그 리포트 정보 - 사용자가 발견한 버그를 보고';
COMMENT ON COLUMN public.bug_reports.user_id IS 'users 테이블의 사용자 ID (익명 사용자는 NULL)';
COMMENT ON COLUMN public.bug_reports.title IS '버그 제목';
COMMENT ON COLUMN public.bug_reports.description IS '버그 설명';
COMMENT ON COLUMN public.bug_reports.page_url IS '버그가 발생한 페이지 URL';
COMMENT ON COLUMN public.bug_reports.user_agent IS '사용자 에이전트 (브라우저 정보)';
COMMENT ON COLUMN public.bug_reports.error_stack IS '에러 스택 트레이스 (있는 경우)';
COMMENT ON COLUMN public.bug_reports.screenshot_url IS '스크린샷 URL (Supabase Storage, 선택 사항)';
COMMENT ON COLUMN public.bug_reports.status IS '버그 상태: pending(대기), in_progress(진행 중), resolved(해결됨)';

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ 버그 리포트 테이블 마이그레이션 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 테이블:';
    RAISE NOTICE '   bug_reports (버그 리포트)';
    RAISE NOTICE '';
    RAISE NOTICE '🔓 RLS: 비활성화 (DISABLE ROW LEVEL SECURITY)';
    RAISE NOTICE '🔑 인덱스: bug_reports(user_id, status, created_at)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 버그 리포트 추가 (인증된 사용자)';
    RAISE NOTICE '   INSERT INTO bug_reports (user_id, title, description, page_url, user_agent)';
    RAISE NOTICE '   VALUES (''user-uuid'', ''버그 제목'', ''버그 설명'', ''/places/123'', ''Mozilla/5.0...'');';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 버그 리포트 추가 (익명 사용자)';
    RAISE NOTICE '   INSERT INTO bug_reports (title, description, page_url)';
    RAISE NOTICE '   VALUES (''버그 제목'', ''버그 설명'', ''/places/123'');';
END $$;

