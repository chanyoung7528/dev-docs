import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ApiClientPatternPage() {
  return (
    <DocLayout
      title="API Client 고급 패턴"
      description="토큰 갱신 중복 방지, 타임아웃, Zod 검증, 비즈니스 에러 감지를 갖춘 프로덕션 API 클라이언트입니다."
    >
      <h2>핵심 기능</h2>
      <ul>
        <li>토큰 갱신 요청 중복 방지 (싱글턴 Promise)</li>
        <li>AbortSignal 기반 타임아웃</li>
        <li>Zod 스키마 런타임 응답 검증</li>
        <li>HTTP 200이지만 비즈니스 실패 감지 (<code>succeeded: false</code>)</li>
        <li>에러 분류 (Network / Timeout / Cancel / Schema / API)</li>
      </ul>

      <h2>토큰 갱신 중복 방지 (가장 중요)</h2>

      <CodeBlock
        filename="client.ts"
        language="typescript"
        code={`// 문제: 401 응답 시 여러 요청이 동시에 토큰 갱신을 시도
// → 서버에 갱신 요청이 N번 가고, 일부는 실패

// 해결: 단일 Promise 참조로 중복 방지
let refreshPromise: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  // 이미 갱신 중이면 기존 Promise 재사용
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      await request(AUTH_CONFIG.REFRESH_ENDPOINT, {
        method: 'POST',
        _isRetry: true, // 무한 루프 방지
      });
    } catch (error) {
      authEvents.emit('refresh-failed', { error });
      throw error;
    } finally {
      refreshPromise = null; // 완료 후 초기화
    }
  })();

  return refreshPromise;
}

// 요청 흐름:
// 1. 요청 A → 401 → refreshTokens() 호출 → refreshPromise 생성
// 2. 요청 B → 401 → refreshTokens() 호출 → 같은 refreshPromise 반환 (중복 X)
// 3. 갱신 완료 → refreshPromise = null
// 4. 요청 A, B 모두 새 토큰으로 재시도`}
        highlight={[4, 9, 14, 15, 20, 21]}
      />

      <h2>401 재시도 + 무한 루프 방지</h2>

      <CodeBlock
        filename="client.ts"
        language="typescript"
        code={`async function request<T>(path: string, options: InternalRequestOptions = {}): Promise<T> {
  const { _isRetry, skipAuth, schema, timeout } = options;

  // ... 요청 생성 ...

  const response = await fetch(url, fetchOptions);

  // 401 처리: 재시도가 아닐 때만
  if (response.status === 401 && !_isRetry && !shouldSkipTokenRefresh(path)) {
    try {
      await refreshTokens();
      // 새 토큰으로 재시도 (_isRetry: true로 무한 루프 방지)
      return request<T>(path, { ...options, _isRetry: true });
    } catch (refreshError) {
      // 네트워크 에러면 즉시 전파
      if (refreshError instanceof ApiError && refreshError.isNetworkError) {
        throw refreshError;
      }
      // 그 외: 원래 401 에러로 계속 처리
    }
  }

  if (!response.ok) {
    const errorData = await parseErrorResponse(response);
    throw new ApiError(response.status, errorData.code, errorData.message);
  }

  // ...
}`}
        highlight={[9, 12, 13, 16]}
      />

      <h2>비즈니스 에러 감지</h2>

      <CodeBlock
        language="typescript"
        code={`// 일부 API는 HTTP 200을 반환하지만 내부적으로 실패
// { succeeded: false, code: 'INSUFFICIENT_BALANCE', message: '잔액 부족' }

interface ApiResponse<T> {
  succeeded: boolean;
  code: string;
  message: string;
  data: T;
}

function isApiResponse(data: unknown): data is ApiResponse<unknown> {
  return typeof data === 'object' && data !== null && 'succeeded' in data;
}

// 요청 후 체크
const data = await parseResponse<T>(response);

if (isApiResponse(data) && !data.succeeded) {
  // HTTP는 200이지만 비즈니스 로직 실패
  throw new ApiError(response.status, data.code, data.message);
}

// UI에서는 동일하게 catch로 처리 가능`}
        highlight={[11, 12, 18, 19, 20]}
      />

      <h2>Zod 응답 검증</h2>

      <CodeBlock
        language="typescript"
        code={`import { z } from 'zod';

// 스키마 정의
const FundSchema = z.object({
  id: z.string(),
  name: z.string(),
  nav: z.number(),
  returnRate: z.number(),
});

// 요청 시 schema 옵션 전달
const fund = await apiClient.get('/api/funds/123', {
  schema: FundSchema,
});
// → 응답이 스키마에 맞지 않으면 ApiError('SCHEMA_ERROR') 발생

// 내부 구현
if (schema) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(500, 'SCHEMA_ERROR', 'Response validation failed');
  }
  return result.data as T;
}`}
        highlight={[12, 13, 19, 20, 21]}
      />

      <h2>에러 분류 (ApiError)</h2>

      <CodeBlock
        filename="error.ts"
        language="typescript"
        code={`export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public data?: unknown,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError() { return this.statusCode === 0 && this.code === 'NETWORK_ERROR'; }
  get isTimeout()      { return this.code === 'REQUEST_TIMEOUT'; }
  get isCancelled()    { return this.code === 'CANCELLED'; }
  get isSchemaError()  { return this.code === 'SCHEMA_ERROR'; }
  get isUnauthorized() { return this.statusCode === 401; }
}

// catch 블록에서 분기 처리
try {
  await apiClient.get('/api/data');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isNetworkError) showOfflineToast();
    else if (error.isTimeout) showRetryDialog();
    else if (error.isUnauthorized) redirectToLogin();
    else showErrorToast(error.message);
  }
}`}
        highlight={[13, 14, 15, 16, 17, 25, 26, 27, 28]}
      />

      <h2>타임아웃 처리</h2>

      <CodeBlock
        language="typescript"
        code={`// AbortSignal.timeout으로 요청 자동 취소
const timeoutSignal = AbortSignal.timeout(timeout ?? 30_000);

// 사용자 취소 시그널과 타임아웃 시그널 결합
function createSignal(
  userSignal?: AbortSignal,
  timeoutSignal?: AbortSignal
): AbortSignal | undefined {
  const signals = [userSignal, timeoutSignal].filter(Boolean) as AbortSignal[];

  if (signals.length === 0) return undefined;
  if (signals.length === 1) return signals[0];

  // AbortSignal.any 폴리필 (Safari < 17.4)
  if ('any' in AbortSignal) {
    return AbortSignal.any(signals);
  }

  // 폴리필: 수동으로 결합
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) { controller.abort(signal.reason); return controller.signal; }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}`}
        highlight={[2, 15, 16, 21, 22]}
      />

      <h2>공개 API</h2>

      <CodeBlock
        language="typescript"
        code={`export const apiClient = {
  get:    <T>(url: string, options?) => request<T>(url, { ...options, method: 'GET' }),
  post:   <T>(url: string, data?, options?) => request<T>(url, { ...options, method: 'POST', body: data }),
  put:    <T>(url: string, data?, options?) => request<T>(url, { ...options, method: 'PUT', body: data }),
  patch:  <T>(url: string, data?, options?) => request<T>(url, { ...options, method: 'PATCH', body: data }),
  delete: <T>(url: string, options?) => request<T>(url, { ...options, method: 'DELETE' }),
};

// 사용
const funds = await apiClient.get<Fund[]>('/api/funds');
const created = await apiClient.post<Fund>('/api/funds', { name: '성장 펀드' });`}
      />
    </DocLayout>
  );
}
