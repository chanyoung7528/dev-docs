import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function React19FormVsRhfPage() {
  return (
    <DocLayout
      title="React 19 Form vs RHF + Zod"
      description="React 19의 useActionState, useFormStatus, use와 react-hook-form + Zod의 비교 분석입니다."
    >
      <h2>React 19에서 추가된 폼 관련 기능</h2>

      <CodeBlock
        language="text"
        code={`React 19 새 API:
1. useActionState   — 폼 액션의 상태 관리 (이전 useFormState)
2. useFormStatus    — 폼 제출 중 pending 상태
3. <form action>    — Server Action 직접 연결
4. useOptimistic    — 낙관적 업데이트
5. use()            — Promise/Context를 컴포넌트에서 직접 사용`}
      />

      <h2>React 19 네이티브 폼</h2>

      <CodeBlock
        filename="React19Form.tsx"
        language="tsx"
        code={`'use server';

// Server Action (서버에서 실행)
async function createUser(prevState: FormState, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // 서버 측 검증
  if (!name || name.length < 2) {
    return { error: '이름은 2자 이상이어야 합니다', success: false };
  }
  if (!email?.includes('@')) {
    return { error: '올바른 이메일을 입력하세요', success: false };
  }

  // DB 저장
  await db.user.create({ data: { name, email } });
  return { error: null, success: true };
}`}
        highlight={[4, 9, 10, 12, 13]}
      />

      <CodeBlock
        filename="SignupForm.tsx"
        language="tsx"
        code={`'use client';
import { useActionState, useOptimistic } from 'react';

function SignupForm() {
  // useActionState: 액션 결과를 상태로 관리
  const [state, formAction, isPending] = useActionState(createUser, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="email" type="email" required />

      {state.error && <p className="error">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}

// useFormStatus: 부모 <form>의 pending 상태를 자식에서 감지
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? '처리 중...' : '가입하기'}
    </button>
  );
}`}
        highlight={[6, 7, 8, 12, 25, 26]}
      />

      <h2>RHF + Zod로 같은 것 구현</h2>

      <CodeBlock
        filename="SignupFormRHF.tsx"
        language="tsx"
        code={`'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  email: z.string().email('올바른 이메일을 입력하세요'),
});

type FormData = z.infer<typeof schema>;

function SignupFormRHF() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: FormData) => {
    await createUser(data); // Server Action 또는 API 호출
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <p className="error">{errors.name.message}</p>}

      <input {...register('email')} />
      {errors.email && <p className="error">{errors.email.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '처리 중...' : '가입하기'}
      </button>
    </form>
  );
}`}
        highlight={[6, 7, 8, 19, 20, 29, 30, 31, 32, 33]}
      />

      <h2>비교 분석</h2>

      <CodeBlock
        language="text"
        code={`┌──────────────────────┬──────────────────────┬──────────────────────┐
│       기준           │   React 19 네이티브    │    RHF + Zod         │
├──────────────────────┼──────────────────────┼──────────────────────┤
│ 검증 위치            │ 서버 (Server Action)  │ 클라이언트 (실시간)    │
│ 실시간 피드백        │ ❌ 제출 후에만 에러    │ ✅ 입력 중 즉시 피드백 │
│ 필드별 에러          │ 직접 구현 필요         │ ✅ 자동 (필드별 매핑)  │
│ 타입 안전성          │ FormData (any)        │ ✅ Zod infer 자동추론  │
│ 복잡한 검증          │ 서버 로직 직접 작성    │ ✅ refine, superRefine │
│ 교차 필드 검증       │ 직접 구현             │ ✅ .refine() 한 줄     │
│ 비동기 검증          │ ✅ 서버에서 자연스럽게 │ setError로 수동       │
│ 번들 사이즈          │ 0 KB (내장)           │ ~15 KB (RHF + Zod)    │
│ Server Component     │ ✅ 완전 지원          │ ❌ Client 전용        │
│ Progressive Enhancement│ ✅ JS 없어도 동작   │ ❌ JS 필수            │
│ 스텝 폼             │ 직접 구현 필요         │ ✅ 패턴 확립됨        │
│ 동적 필드 추가/삭제  │ 매우 복잡             │ ✅ useFieldArray      │
│ 성능 (리렌더)       │ 제출 시 1회           │ ✅ 필드 단위 구독      │
│ DevTools            │ ❌ 없음               │ ✅ RHF DevTools        │
│ 학습 곡선           │ 낮음 (HTML 기본)       │ 중간 (API 학습 필요)   │
└──────────────────────┴──────────────────────┴──────────────────────┘`}
      />

      <h2>언제 뭘 쓸까?</h2>

      <CodeBlock
        language="text"
        code={`React 19 네이티브가 적합한 경우:
─────────────────────────────────
• 간단한 폼 (로그인, 검색, 피드백)
• Server Action으로 DB 직접 조작 (풀스택)
• JS 비활성화 환경 지원 필요
• 번들 사이즈 최소화
• SSR 중심 앱

RHF + Zod가 적합한 경우 (대부분의 실무):
─────────────────────────────────
• 복잡한 폼 (회원가입 5단계, 주문서)
• 실시간 유효성 피드백 필수
• 교차 필드 검증 (비밀번호 확인, 날짜 범위)
• 동적 필드 (추가/삭제)
• 중복 확인 등 비동기 검증 + 실시간 피드백 조합
• 타입 안전성 중요 (금융 시스템)
• 기존 REST API 연동 (Server Action 아닌 경우)

실무 결론:
─────────────────────────────────
• 하이브리드 앱 (WebView) → RHF + Zod (Server Action 못 씀)
• Next.js 풀스택 (SSR) → 간단한 건 React 19, 복잡한 건 RHF + Zod
• 금융권 → RHF + Zod (실시간 검증 + 타입 안전성 필수)`}
      />

      <Callout variant="warning">
        <p>
          <strong>하이브리드 앱(WebView)에서는 Server Action을 쓸 수 없습니다.</strong>{" "}
          Static Export로 빌드하면 서버가 없기 때문입니다.
          한화자산운용의 PINE 앱이 하이브리드라면 RHF + Zod가 사실상 표준입니다.
        </p>
      </Callout>

      <h2>하이브리드: React 19 + RHF + Zod 조합</h2>
      <p>
        둘을 같이 쓸 수도 있습니다. React 19의 <code>useOptimistic</code>,
        <code>use()</code>는 폼과 무관하게 유용합니다.
      </p>

      <CodeBlock
        filename="hybrid-approach.tsx"
        language="tsx"
        code={`'use client';
import { useOptimistic } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// 폼 검증: RHF + Zod (실시간 피드백)
const form = useForm({
  resolver: zodResolver(commentSchema),
  mode: 'onChange',
});

// 낙관적 업데이트: React 19 (즉시 UI 반영)
const [optimisticComments, addOptimistic] = useOptimistic(
  comments,
  (state, newComment: Comment) => [...state, newComment]
);

const onSubmit = async (data: CommentForm) => {
  // 1. 즉시 UI에 반영 (낙관적)
  addOptimistic({ ...data, id: 'temp', createdAt: new Date() });

  // 2. 서버에 저장
  await api.createComment(data);

  // 3. 실패 시 자동 롤백 (optimistic이 원본으로 돌아감)
};`}
        highlight={[7, 8, 9, 13, 14, 15, 20, 21]}
      />

      <h2>React 19 use() Hook</h2>

      <CodeBlock
        filename="use-hook.tsx"
        language="tsx"
        code={`import { use, Suspense } from 'react';

// use(): Promise를 컴포넌트에서 직접 await
// (Suspense와 함께 사용)
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);  // Promise가 resolve될 때까지 Suspense

  return <div>{user.name}</div>;
}

// 사용
function Page({ userId }: { userId: string }) {
  // Promise를 생성하되 await하지 않음
  const userPromise = fetchUser(userId);

  return (
    <Suspense fallback={<Skeleton />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}

// use()로 Context 읽기 (조건부 가능!)
function Component() {
  if (someCondition) {
    const theme = use(ThemeContext);  // 조건부 OK (useContext는 안 됨)
    return <div style={{ color: theme.primary }}>...</div>;
  }
  return <div>other</div>;
}

// TanStack Query와의 비교:
// use()는 단순 fetch + Suspense
// TanStack Query는 캐싱, 리페치, 에러 바운더리, staleTime 등
// → 복잡한 데이터 페칭에는 여전히 TanStack Query가 유리`}
        highlight={[5, 6, 14, 17, 18, 26, 27]}
      />

      <Callout variant="tip">
        <p>
          <strong>정리:</strong> React 19의 새 API는 &ldquo;프레임워크가
          더 많은 걸 해주는&rdquo; 방향입니다. 하지만 금융 하이브리드 앱처럼
          클라이언트 중심 + 복잡한 폼이면 RHF + Zod가 여전히 최선입니다.
          use()와 useOptimistic은 폼과 별개로 활용하세요.
        </p>
      </Callout>
    </DocLayout>
  );
}
