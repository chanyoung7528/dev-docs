import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function NextjsErrorSystemPage() {
  return (
    <DocLayout
      title="에러 처리 체계"
      description="ApiError 클래스, 전역/로컬 에러 분기, 재시도 전략의 전체 구조입니다."
    >
      <h2>에러 처리 3단계</h2>
      <CodeBlock
        language="plaintext"
        code={`1단계: API Client (shared/api/error.ts)
  → ApiError 클래스 생성, 에러 분류

2단계: QueryProvider (app/_providers/QueryProvider.tsx)
  → 전역 에러 핸들링, 토스트 표시

3단계: 컴포넌트 (features/*)
  → 로컬 에러 UI, meta.skipGlobalError`}
      />

      <h2>ApiError 클래스</h2>
      <CodeBlock
        filename="error.ts"
        language="tsx"
        code={`export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public data?: unknown,
    public originalError?: unknown,
    public retryAfterMs?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }

  // computed getters로 에러 분류
  get isCancelled(): boolean {
    return this.code === 'CANCELLED';
  }

  get isNetworkError(): boolean {
    return this.status === 0 && !this.isCancelled;
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isRetriable(): boolean {
    if (this.isCancelled) return false;
    return (
      this.status === 0 ||
      this.status === 408 ||  // Request Timeout
      this.status === 429 ||  // Too Many Requests
      this.status >= 500      // Server Error
    );
  }
}

// 타입 가드
export function isRetriable(error: unknown): error is ApiError {
  return error instanceof ApiError && error.isRetriable;
}`}
        highlight={[15, 16, 23, 24, 27, 28, 29, 30, 31, 32, 38, 39]}
      />

      <h2>전역 에러 핸들러</h2>
      <CodeBlock
        language="tsx"
        code={`function handleGlobalError(error: unknown): void {
  // 취소된 요청은 무시
  if (error instanceof ApiError && error.isCancelled) return;

  // ApiError가 아닌 경우
  if (!(error instanceof ApiError)) {
    logger.error('Unknown Error:', error);
    toast.error('알 수 없는 오류가 발생했습니다');
    return;
  }

  // 401은 AuthProvider가 처리
  if (error.status === 401) {
    logger.debug('Unauthorized (handled by AuthProvider)');
    return;
  }

  // 사용자에게 보여줄 메시지 생성
  const { title, description } = getUserMessage(error);
  toast.error(title, { description });
}`}
        highlight={[3, 13, 14, 19, 20]}
      />

      <h2>skipGlobalError 패턴</h2>
      <p>
        로컬에서 에러를 직접 처리하는 경우 전역 토스트를 건너뜁니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 로그인: 로컬 에러 UI로 처리
export function useLoginGeneral() {
  return useMutation({
    mutationFn: memberApi.loginGeneral,
    meta: { skipGlobalError: true },
  });
}

// 게시글 상세: 아코디언 내 로컬 에러 표시
export function usePostDetail({ bbId, bbcSeqNo, enabled }: Options) {
  return useQuery({
    ...boardQueries.postDetail(bbId, bbcSeqNo),
    enabled,
    meta: { skipGlobalError: true },
  });
}`}
        highlight={[5, 14]}
      />

      <h2>재시도: 지수 백오프</h2>
      <CodeBlock
        language="tsx"
        code={`export function getRetryDelay(failureCount: number, error?: unknown): number {
  // 서버가 Retry-After 헤더를 보낸 경우 해당 시간 사용
  if (error instanceof ApiError && typeof error.retryAfterMs === 'number') {
    return error.retryAfterMs;
  }

  // 지수 백오프: 1초 → 2초 → 4초 → 8초 (최대 30초)
  return Math.min(
    RETRY_CONFIG.BASE_DELAY_MS * 2 ** Math.max(0, failureCount),
    RETRY_CONFIG.MAX_DELAY_MS
  );
}

// 사용: QueryClient 설정
queries: {
  retry: (failureCount, error) => isRetriable(error) && failureCount < 2,
  retryDelay: getRetryDelay,
}`}
        highlight={[3, 4, 8, 9, 10, 16, 17]}
      />

      <Callout variant="tip">
        <p>
          에러 처리 흐름: <strong>ApiError 생성 → 재시도 판단 → 전역/로컬 분기 → UI 표시</strong>.
          새로운 에러 유형이 추가되면 ApiError의 getter만 수정하면 됩니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
