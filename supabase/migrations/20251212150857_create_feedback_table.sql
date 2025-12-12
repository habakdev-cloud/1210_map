-- =====================================================
-- 마이그레이션: 피드백 테이블 생성
-- 작성일: 2025-12-12
-- 설명: 사용자 피드백을 수집하는 테이블
--       - 일반 피드백, 기능 제안, 개선 사항 수집
--       - 인증된 사용자 또는 익명 사용자 모두 제출 가능
--       - RLS 비활성화 (개발 환경)
-- =====================================================

-- =====================================================
-- feedback 테이블 (사용자 피드백)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('general', 'feature', 'improvement')),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.feedback OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON public.feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Row Level Security (RLS) 비활성화
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.feedback TO anon;
GRANT ALL ON TABLE public.feedback TO authenticated;
GRANT ALL ON TABLE public.feedback TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.feedback IS '사용자 피드백 정보 - 일반 피드백, 기능 제안, 개선 사항';
COMMENT ON COLUMN public.feedback.user_id IS 'users 테이블의 사용자 ID (익명 사용자는 NULL)';
COMMENT ON COLUMN public.feedback.type IS '피드백 타입: general(일반), feature(기능 제안), improvement(개선 사항)';
COMMENT ON COLUMN public.feedback.content IS '피드백 내용';
COMMENT ON COLUMN public.feedback.rating IS '평점 (1-5, 선택 사항)';

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ 피드백 테이블 마이그레이션 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 테이블:';
    RAISE NOTICE '   feedback (사용자 피드백)';
    RAISE NOTICE '';
    RAISE NOTICE '🔓 RLS: 비활성화 (DISABLE ROW LEVEL SECURITY)';
    RAISE NOTICE '🔑 인덱스: feedback(user_id, type, created_at)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 피드백 추가 (인증된 사용자)';
    RAISE NOTICE '   INSERT INTO feedback (user_id, type, content, rating)';
    RAISE NOTICE '   VALUES (''user-uuid'', ''feature'', ''새로운 기능을 제안합니다'', 5);';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 피드백 추가 (익명 사용자)';
    RAISE NOTICE '   INSERT INTO feedback (type, content)';
    RAISE NOTICE '   VALUES (''general'', ''좋은 서비스입니다'');';
END $$;

