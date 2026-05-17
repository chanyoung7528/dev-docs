import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function TanstackQueryErrorHandlingPage() {
  return (
    <DocLayout
      title="에러 & 로딩 처리"
      description="전역 에러 처리와 로딩 상태 관리 전략을 알아봅니다."
    >
      <h2>에러 처리 전략</h2>
      <p>
        프로젝트에서는 <strong>전역 처리</strong>와{" "}
        <strong>로컬 처리</strong>를 구분합니다.
      </p>

      <table>
        <thead>
          <tr>
            <th>구분</th>
            <th>처리 방식</th>
            <th>예시</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>전역</td>
            <td>QueryClient의 onError</td>
            <td>네트워크 오류, 500 에러</td>
          </tr>
          <tr>
            <td>로컬</td>
            <td>컴포넌트에서 직접 처리</td>
            <td>로그인 실패, 폼 유효성</td>
          </tr>
        </tbody>
      </table>

      <h2>실전 적용: Custom ApiError 클래스</h2>

      <CodeBlock
        filename="error.ts"
        language="tsx"
        code={`export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public data?: unknown,
    public retryAfterMs?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isRetriable(): boolean {
    if (this.isCancelled) return false;
    return this.status === 0 || this.status >= 500;
  }
}

// 타입 가드 함수
export function isRetriable(error: unknown): error is ApiError {
  return error instanceof ApiError && error.isRetriable;
}

export function isAuthError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.isAuthError;
}`}
        highlight={[13, 14, 17, 18, 19, 24, 25]}
      />

      <h2>전역 에러 처리</h2>
      <CodeBlock
        filename="QueryProvider.tsx"
        language="tsx"
        code={`const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (!isRetriable(error)) return false;
        return failureCount < 1;
      },
    },
    mutations: {
      onError: (error) => {
        // meta.skipGlobalError가 없으면 전역 토스트 표시
        if (error instanceof ApiError && !error.isCancelled) {
          toast.error(error.message);
        }
      },
    },
  },
});`}
        highlight={[4, 5, 6, 12, 13]}
      />

      <h2>로컬 에러 처리: meta.skipGlobalError</h2>
      <p>
        로그인처럼 로컬에서 에러를 직접 처리하는 경우,{" "}
        <code>meta.skipGlobalError</code>로 전역 토스트를 건너뜁니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 전역 토스트를 건너뛰고 로컬에서 처리
export function useLoginGeneral() {
  return useMutation({
    mutationFn: memberApi.loginGeneral,
    meta: { skipGlobalError: true },  // 전역 에러 핸들러 무시
  });
}

// 컴포넌트에서 직접 에러 처리
function LoginForm() {
  const { mutate, error } = useLoginGeneral();

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <p className={styles.error}>
          아이디 또는 비밀번호가 올바르지 않습니다.
        </p>
      )}
      {/* ... */}
    </form>
  );
}`}
        highlight={[5, 15, 16, 17, 18]}
      />

      <h2>재시도 전략: 지수 백오프</h2>
      <CodeBlock
        filename="error.ts"
        language="tsx"
        code={`export function getRetryDelay(failureCount: number, error?: unknown): number {
  // 서버가 Retry-After 헤더를 보낸 경우 존중
  if (error instanceof ApiError && typeof error.retryAfterMs === 'number') {
    return error.retryAfterMs;
  }
  // 지수 백오프: 1초, 2초, 4초, 8초... (최대 30초)
  return Math.min(1000 * 2 ** Math.max(0, failureCount), 30000);
}`}
        highlight={[3, 4, 7]}
      />

      <h2>로딩 상태 관리</h2>
      <CodeBlock
        language="tsx"
        code={`function PostList() {
  const { data, isPending, isFetching, error } = useQuery(boardQueries.posts('notice'));

  // isPending: 캐시 없이 최초 로딩 → 스켈레톤
  if (isPending) return <PostSkeleton count={5} />;

  // error: 에러 상태 → 에러 UI
  if (error) return <ErrorState onRetry={() => refetch()} />;

  // isFetching: 백그라운드 갱신 중 → 작은 인디케이터
  return (
    <div>
      {isFetching && <RefreshIndicator />}
      {data.map(post => (
        <PostItem key={post.bbcSeqNo} post={post} />
      ))}
    </div>
  );
}`}
        highlight={[4, 7, 13]}
      />

      <Callout variant="tip">
        <p>
          <code>isPending</code>은 최초 로딩에만 true입니다. 백그라운드
          refetch 중에는 false이므로 기존 데이터를 계속 표시하면서
          <code>isFetching</code>으로 작은 인디케이터만 보여주세요.
        </p>
      </Callout>
    </DocLayout>
  );
}
