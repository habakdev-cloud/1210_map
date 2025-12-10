# Supabase 연결 가이드

이 문서는 Supabase 공식 Next.js 가이드를 기반으로 작성되었습니다.

## 📋 목차

1. [Supabase 프로젝트 생성](#supabase-프로젝트-생성)
2. [환경 변수 설정](#환경-변수-설정)
3. [클라이언트 사용법](#클라이언트-사용법)
4. [데이터베이스 예제](#데이터베이스-예제)

---

## Supabase 프로젝트 생성

### 1. 프로젝트 생성

1. [database.new](https://database.new) 접속하여 새 Supabase 프로젝트 생성
2. 또는 [Supabase Dashboard](https://supabase.com/dashboard)에서 **"New Project"** 클릭
3. 프로젝트 정보 입력 후 생성 완료 대기 (~2분)

### 2. 샘플 데이터 생성

Supabase SQL Editor에서 다음 SQL을 실행하여 예제 테이블을 생성합니다:

```sql
-- 테이블 생성
create table instruments (
  id bigint primary key generated always as identity,
  name text not null
);

-- 샘플 데이터 삽입
insert into instruments (name) values
  ('violin'),
  ('viola'),
  ('cello');

-- Row Level Security 활성화
alter table instruments enable row level security;

-- 공개 읽기 정책 추가
create policy "public can read instruments"
on public.instruments
for select
to anon
using (true);
```

---

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정합니다:

```env
# Supabase 연결 정보
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Service Role Key (서버 사이드 전용, 클라이언트에 노출 금지!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 환경 변수 확인 방법

1. Supabase Dashboard → **Settings** → **API**
2. **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 복사
3. **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 복사
4. **service_role secret**: `SUPABASE_SERVICE_ROLE_KEY`에 복사 (서버 전용!)

> **⚠️ 주의**: `SUPABASE_SERVICE_ROLE_KEY`는 RLS를 우회하는 관리자 키입니다. 절대 클라이언트 코드나 공개 저장소에 노출하지 마세요!

---

## 클라이언트 사용법

이 프로젝트는 **Supabase 공식 Next.js 가이드**와 **Clerk 인증 통합**을 모두 지원합니다.

### 1. 공개 데이터 조회 (인증 불필요)

#### Server Component

```tsx
import { createPublicSupabaseClient } from '@/lib/supabase/server-public';
import { Suspense } from 'react';

async function InstrumentsData() {
  const supabase = await createPublicSupabaseClient();
  const { data: instruments } = await supabase.from('instruments').select();
  
  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading instruments...</div>}>
      <InstrumentsData />
    </Suspense>
  );
}
```

#### Client Component

```tsx
'use client';

import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function Instruments() {
  const [instruments, setInstruments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchInstruments() {
      const { data } = await supabase.from('instruments').select();
      if (data) setInstruments(data);
    }
    fetchInstruments();
  }, []);

  return (
    <div>
      {instruments.map((instrument) => (
        <div key={instrument.id}>{instrument.name}</div>
      ))}
    </div>
  );
}
```

### 2. Clerk 인증이 필요한 데이터 (RLS 보호)

#### Server Component

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

#### Client Component

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function TasksPage() {
  const supabase = useClerkSupabaseClient();
  const { user, isLoaded } = useUser();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function fetchTasks() {
      const { data } = await supabase.from('tasks').select();
      if (data) setTasks(data);
    }
    
    fetchTasks();
  }, [isLoaded, user, supabase]);

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

### 3. Server Action

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

## 데이터베이스 예제

### 테이블 생성 예제

```sql
-- Tasks 테이블 생성 (Clerk 인증 사용)
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
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
```

자세한 RLS 정책 예제는 [`supabase/migrations/example_rls_policies.sql`](../supabase/migrations/example_rls_policies.sql) 파일을 참고하세요.

---

## 클라이언트 타입

이 프로젝트에서는 다음 Supabase 클라이언트들을 제공합니다:

| 파일 | 용도 | 인증 |
|------|------|------|
| `lib/supabase/server.ts` | Server Component/Action | Clerk 인증 |
| `lib/supabase/clerk-client.ts` | Client Component | Clerk 인증 |
| `lib/supabase/server-public.ts` | Server Component | 없음 (공개 데이터) |
| `lib/supabase/client.ts` | Client Component | 없음 (공개 데이터) |
| `lib/supabase/service-role.ts` | 서버 전용 (API Routes) | Service Role (RLS 우회) |

---

## 참고 자료

- 📖 [Supabase 공식 Next.js 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- 📖 [Clerk + Supabase 통합 가이드](./CLERK_SUPABASE_INTEGRATION.md)
- 📖 [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- 📖 [Supabase SSR 문서](https://supabase.com/docs/reference/javascript/ssr/overview)

---

## 다음 단계

1. ✅ Supabase 프로젝트 생성
2. ✅ 환경 변수 설정
3. ✅ 데이터베이스 테이블 생성
4. 📝 RLS 정책 설정
5. 🚀 애플리케이션에서 데이터 조회

이제 Supabase가 프로젝트에 완전히 통합되었습니다! 🎉


