# Clerk + Supabase 통합 가이드

이 문서는 Clerk와 Supabase를 통합하는 방법을 설명합니다. 2025년 4월부터 권장되는 **네이티브 통합 방식**을 사용합니다.

## 📋 목차

1. [통합 개요](#통합-개요)
2. [Clerk Dashboard 설정](#clerk-dashboard-설정)
3. [Supabase Dashboard 설정](#supabase-dashboard-설정)
4. [코드 구현](#코드-구현)
5. [RLS 정책 설정](#rls-정책-설정)
6. [테스트 방법](#테스트-방법)

---

## 통합 개요

### 네이티브 통합의 장점

2025년 4월부터 Clerk는 JWT 템플릿 대신 **네이티브 Supabase 통합**을 권장합니다:

- ✅ 각 Supabase 요청마다 새 토큰을 가져올 필요 없음
- ✅ Supabase JWT Secret Key를 Clerk와 공유할 필요 없음
- ✅ 더 간단한 설정 및 유지보수

### 인증 흐름

1. 사용자가 Clerk를 통해 로그인
2. Clerk가 세션 토큰 생성 (자동으로 `"role": "authenticated"` 클레임 포함)
3. Supabase 클라이언트가 요청 시 Clerk 토큰을 헤더에 포함
4. Supabase가 Clerk 도메인을 통해 토큰 검증
5. RLS 정책이 `auth.jwt()->>'sub'`를 통해 Clerk 사용자 ID 확인

---

## Clerk Dashboard 설정

### 1단계: Supabase 통합 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 로그인
2. **Integrations** 메뉴로 이동
3. **Supabase** 통합 찾기
4. 또는 직접 URL로 이동: https://dashboard.clerk.com/setup/supabase

5. **"Activate Supabase integration"** 버튼 클릭
6. **Clerk domain** 복사 (예: `https://your-app-12.clerk.accounts.dev`)
   - 이 도메인은 다음 단계에서 사용합니다

> **참고**: 이 단계를 통해 Clerk 세션 토큰에 `"role": "authenticated"` 클레임이 자동으로 추가됩니다.

---

## Supabase Dashboard 설정

### 2단계: Clerk를 Third-Party Auth Provider로 추가

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Settings** → **Authentication** → **Providers**로 이동
4. 페이지 하단의 **"Third-Party Auth"** 섹션 찾기
5. **"Add Provider"** 또는 **"Enable Custom Access Token"** 클릭

6. 다음 정보 입력:

   - **Provider Name**: `Clerk` (또는 원하는 이름)
   - **Issuer URL** (또는 **JWT Issuer**): 
     ```
     https://your-app-12.clerk.accounts.dev
     ```
     (1단계에서 복사한 Clerk domain 사용)

   - **JWKS URI** (또는 **JWKS Endpoint**):
     ```
     https://your-app-12.clerk.accounts.dev/.well-known/jwks.json
     ```
     (Clerk domain 뒤에 `/.well-known/jwks.json` 추가)

7. **"Save"** 또는 **"Add Provider"** 클릭

> **참고**: Supabase는 이제 Clerk에서 발급한 JWT 토큰을 검증할 수 있습니다.

---

## 코드 구현

### Client Component에서 사용

Client Component에서는 `useClerkSupabaseClient()` 훅을 사용합니다:

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useUser } from '@clerk/nextjs';

export default function TasksPage() {
  const supabase = useClerkSupabaseClient();
  const { user } = useUser();

  // 사용자 데이터 조회
  const fetchTasks = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*');
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }
    
    return data;
  };

  return (
    <div>
      {/* 컴포넌트 내용 */}
    </div>
  );
}
```

### Server Component에서 사용

Server Component에서는 `createClerkSupabaseClient()` 함수를 사용합니다:

```tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function TasksPage() {
  const supabase = await createClerkSupabaseClient();
  
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    throw new Error('Failed to fetch tasks');
  }

  return (
    <div>
      {tasks?.map((task) => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

### Server Action에서 사용

Server Action에서도 동일한 함수를 사용합니다:

```ts
'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';

export async function createTask(name: string) {
  const supabase = await createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name });

  if (error) {
    throw new Error('Failed to create task');
  }

  return data;
}
```

---

## RLS 정책 설정

### 기본 원리

Clerk와 Supabase 통합 시, RLS 정책에서 `auth.jwt()->>'sub'`를 사용하여 Clerk 사용자 ID를 확인합니다.

### 예제: Tasks 테이블

#### 1. 테이블 생성

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

> **중요**: `user_id` 컬럼의 기본값으로 `auth.jwt()->>'sub'`를 사용하면 새 레코드 생성 시 자동으로 현재 사용자의 Clerk ID가 저장됩니다.

#### 2. RLS 활성화

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

#### 3. SELECT 정책 (조회)

사용자는 자신의 작업만 조회할 수 있습니다:

```sql
CREATE POLICY "User can view their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);
```

#### 4. INSERT 정책 (생성)

사용자는 자신의 작업만 생성할 수 있습니다:

```sql
CREATE POLICY "Users must insert their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);
```

#### 5. UPDATE 정책 (수정)

사용자는 자신의 작업만 수정할 수 있습니다:

```sql
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
```

#### 6. DELETE 정책 (삭제)

사용자는 자신의 작업만 삭제할 수 있습니다:

```sql
CREATE POLICY "Users can delete their own tasks"
ON tasks
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);
```

### 완성된 마이그레이션 예제

```sql
-- 테이블 생성
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책
CREATE POLICY "User can view their own tasks"
ON tasks FOR SELECT
TO authenticated
USING ((SELECT auth.jwt()->>'sub') = user_id);

-- INSERT 정책
CREATE POLICY "Users must insert their own tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

-- UPDATE 정책
CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
TO authenticated
USING ((SELECT auth.jwt()->>'sub') = user_id)
WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

-- DELETE 정책
CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
TO authenticated
USING ((SELECT auth.jwt()->>'sub') = user_id);
```

---

## 테스트 방법

### 1. 로그인 및 데이터 조회

1. 애플리케이션 실행 (`pnpm dev`)
2. Clerk를 통해 로그인
3. 데이터베이스에서 데이터 조회 테스트

### 2. 다른 사용자로 테스트

1. 로그아웃
2. 다른 계정으로 로그인
3. 이전 사용자의 데이터가 보이지 않는지 확인
4. 새 사용자의 데이터만 보이는지 확인

### 3. RLS 정책 확인

Supabase Dashboard의 **Authentication** → **Policies**에서:
- 정책이 올바르게 생성되었는지 확인
- 정책이 활성화되어 있는지 확인

---

## 문제 해결

### 문제: "Unauthorized" 에러 발생

**원인**: Clerk 통합이 제대로 설정되지 않았거나, RLS 정책이 잘못 설정됨

**해결 방법**:
1. Clerk Dashboard에서 Supabase 통합이 활성화되었는지 확인
2. Supabase Dashboard에서 Clerk Provider가 추가되었는지 확인
3. RLS 정책에서 `auth.jwt()->>'sub'` 사용을 확인
4. 환경 변수 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) 확인

### 문제: 토큰이 전달되지 않음

**원인**: 클라이언트 코드에서 `useClerkSupabaseClient()` 또는 `createClerkSupabaseClient()`를 사용하지 않음

**해결 방법**:
- 일반 Supabase 클라이언트 대신 Clerk 통합 클라이언트 사용 확인
- `lib/supabase/clerk-client.ts` 또는 `lib/supabase/server.ts`에서 제공하는 함수 사용

### 문제: RLS 정책이 작동하지 않음

**원인**: 
- RLS가 활성화되지 않음
- 정책의 USING/WITH CHECK 조건이 잘못됨

**해결 방법**:
1. `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;` 실행 확인
2. 정책에서 `(SELECT auth.jwt()->>'sub')` 사용 확인
3. `user_id` 컬럼 타입이 TEXT인지 확인 (Clerk ID는 텍스트 형식)

---

## 참고 자료

- [Clerk 공식 Supabase 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Third-Party Auth 문서](https://supabase.com/docs/guides/auth/third-party/overview)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

## 요약

✅ **Clerk Dashboard**: Supabase 통합 활성화  
✅ **Supabase Dashboard**: Clerk를 Third-Party Auth Provider로 추가  
✅ **코드**: `useClerkSupabaseClient()` (Client) / `createClerkSupabaseClient()` (Server) 사용  
✅ **RLS**: `auth.jwt()->>'sub'`로 Clerk 사용자 ID 확인  
✅ **테스트**: 여러 계정으로 데이터 격리 확인

이제 Clerk와 Supabase가 완전히 통합되었습니다! 🎉

