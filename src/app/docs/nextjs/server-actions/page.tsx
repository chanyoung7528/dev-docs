import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ServerActionsPage() {
  return (
    <DocLayout
      title="Server Actions"
      description="Next.js의 Server Actions로 클라이언트에서 서버 함수를 직접 호출하는 패턴입니다."
    >
      <h2>Server Action이란?</h2>
      <p>
        <code>&apos;use server&apos;</code>로 선언된 async 함수는 서버에서만
        실행됩니다. 클라이언트에서 이 함수를 호출하면 자동으로 POST 요청이
        생성되어 서버로 전달됩니다. API Route를 별도로 만들 필요가 없습니다.
      </p>

      <h2>기본 사용법</h2>

      <CodeBlock
        filename="app/actions/post.ts"
        language="typescript"
        code={`'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요').max(200),
  content: z.string().optional(),
});

export async function createPost(formData: FormData) {
  // 1. 입력 검증
  const parsed = createPostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // 2. DB 저장
  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      authorId: 'current-user-id', // 실제: 세션에서 가져옴
    },
  });

  // 3. 캐시 무효화 (ISR 페이지 갱신)
  revalidatePath('/posts');

  return { data: post, error: null };
}

export async function deletePost(postId: string) {
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath('/posts');
}`}
        highlight={[1, 12, 14, 15, 24, 33]}
      />

      <h2>Server Component에서 사용 (form action)</h2>

      <CodeBlock
        filename="app/posts/new/page.tsx"
        language="tsx"
        code={`import { createPost } from '@/actions/post';

// Server Component — 'use client' 없음!
export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="제목" required />
      <textarea name="content" placeholder="내용" />
      <button type="submit">작성</button>
    </form>
  );
}

// JS가 비활성화되어도 동작 (Progressive Enhancement)
// 폼 제출 → 서버에서 createPost 실행 → 페이지 리프레시`}
        highlight={[6]}
      />

      <h2>Client Component에서 사용 (useActionState)</h2>

      <CodeBlock
        filename="PostForm.tsx"
        language="tsx"
        code={`'use client';
import { useActionState } from 'react';
import { createPost } from '@/actions/post';

interface FormState {
  error: Record<string, string[]> | null;
  data: Post | null;
}

export function PostForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      const result = await createPost(formData);
      return result;
    },
    { error: null, data: null }
  );

  return (
    <form action={formAction}>
      <input name="title" placeholder="제목" />
      {state.error?.title && (
        <p className="error">{state.error.title[0]}</p>
      )}

      <textarea name="content" placeholder="내용" />

      <button type="submit" disabled={isPending}>
        {isPending ? '저장 중...' : '작성'}
      </button>

      {state.data && <p>게시글이 작성되었습니다!</p>}
    </form>
  );
}`}
        highlight={[11, 12, 13, 20, 22, 23, 28, 29]}
      />

      <h2>Server Action에서 인증 확인</h2>

      <CodeBlock
        filename="actions/protected.ts"
        language="typescript"
        code={`'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// 인증이 필요한 액션
export async function updateProfile(formData: FormData) {
  // 1. 세션 확인
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return { error: '로그인이 필요합니다' };
  }

  const user = await verifyToken(token);
  if (!user) {
    return { error: '세션이 만료되었습니다' };
  }

  // 2. 권한 확인
  const existingProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  // 3. 업데이트
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      bio: formData.get('bio') as string,
      avatar: formData.get('avatar') as string,
    },
    create: {
      userId: user.id,
      bio: formData.get('bio') as string,
    },
  });

  revalidatePath('/profile');
  return { data: profile };
}`}
        highlight={[10, 11, 13, 14, 28, 29]}
      />

      <h2>Server Action vs API Route</h2>

      <CodeBlock
        language="text"
        code={`┌──────────────────┬──────────────────────┬──────────────────────┐
│      기준        │   Server Action       │    API Route          │
├──────────────────┼──────────────────────┼──────────────────────┤
│ 코드 위치        │ 컴포넌트 근처          │ app/api/** 별도 폴더  │
│ 호출 방법        │ form action / 직접호출 │ fetch('/api/...')     │
│ 타입 안전성      │ 함수 호출 → 자동 추론  │ 수동 타입 지정        │
│ Progressive Enh. │ ✅ JS 없이도 동작      │ ❌ JS 필수           │
│ 외부 클라이언트   │ ❌ 내부 전용           │ ✅ 모바일앱 등 가능   │
│ 캐시 무효화      │ revalidatePath 직접   │ 별도 구현 필요        │
│ 파일 업로드      │ FormData 지원         │ FormData 지원         │
│ 적합한 경우      │ 폼 제출, 데이터 변경   │ REST API, 외부 연동   │
└──────────────────┴──────────────────────┴──────────────────────┘

실무 가이드:
• 내부 데이터 변경 (CRUD) → Server Action
• 외부 클라이언트 (모바일앱, 외부 서비스) → API Route
• 하이브리드 앱 (WebView) → API Route (Static Export라면)
  또는 Server Action (SSR 모드라면)`}
      />

      <Callout variant="note">
        <p>
          Server Action은 <code>output: &apos;export&apos;</code> (Static Export) 모드에서는
          사용할 수 없습니다. 하이브리드 앱이 Static Export라면 API Route를
          별도 서버에 두거나, 기존 백엔드 API를 사용하세요.
        </p>
      </Callout>
    </DocLayout>
  );
}
