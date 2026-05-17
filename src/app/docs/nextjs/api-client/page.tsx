import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function NextjsApiClientPage() {
  return (
    <DocLayout
      title="API Client 아키텍처"
      description="토큰 갱신, 재시도, 타임아웃을 포함한 HTTP 클라이언트 설계입니다."
    >
      <h2>전체 흐름</h2>
      <CodeBlock
        language="plaintext"
        code={`[컴포넌트] → useQuery/useMutation
  ↓
[domain.api.ts] → API 함수 호출
  ↓
[client.ts] → HTTP 요청
  ├── 타임아웃 처리 (AbortSignal)
  ├── 응답 파싱 (JSON/Text/Binary)
  ├── 401 → 토큰 갱신 → 재시도
  ├── 5xx → 재시도 (지수 백오프)
  └── 에러 → ApiError 생성 → throw`}
      />

      <h2>토큰 갱신 중복 방지</h2>
      <p>
        동시에 여러 요청이 401을 받을 때, 토큰 갱신은 한 번만 실행되어야 합니다.
        Promise 캐싱 패턴으로 해결합니다.
      </p>

      <CodeBlock
        filename="client.ts"
        language="tsx"
        code={`let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  // 이미 갱신 중이면 같은 Promise 반환 (중복 방지)
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;  // 완료 후 초기화
    }
  })();

  return refreshPromise;
}`}
        highlight={[5, 7, 17]}
      />

      <h2>401 재시도 로직</h2>
      <CodeBlock
        language="tsx"
        code={`async function request<T>(url: string, options: RequestOptions): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: options.skipAuth ? 'omit' : 'include',
  });

  if (response.status === 401 && !options._isRetry) {
    // 갱신 대상이 아닌 요청(예: refresh 자체)은 스킵
    if (shouldSkipTokenRefresh(url)) {
      throw new ApiError(401, 'UNAUTHORIZED', '인증이 필요합니다');
    }

    const refreshed = await refreshToken();

    if (refreshed) {
      // 갱신 성공 → 원래 요청 재시도 (_isRetry로 무한 루프 방지)
      return request(url, { ...options, _isRetry: true });
    }

    // 갱신 실패 → 로그인 페이지로
    authEvents.emit('refresh-failed');
    throw new ApiError(401, 'REFRESH_FAILED', '세션이 만료되었습니다');
  }

  // ...
}`}
        highlight={[7, 9, 16, 17, 21]}
      />

      <Callout variant="warning">
        <p>
          <code>_isRetry</code> 플래그가 없으면 갱신된 토큰도 만료됐을 때
          무한 루프에 빠집니다. 재시도는 반드시 1회만 허용하세요.
        </p>
      </Callout>

      <h2>타임아웃 처리</h2>
      <CodeBlock
        language="tsx"
        code={`function createTimeoutSignal(
  timeout: number,
  existingSignal?: AbortSignal
): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(timeout);

  if (existingSignal) {
    // AbortSignal.any: 둘 중 하나라도 abort되면 취소
    if ('any' in AbortSignal) {
      return AbortSignal.any([existingSignal, timeoutSignal]);
    }
    // Safari < 17.4 폴백
    const controller = new AbortController();
    existingSignal.addEventListener('abort', () => controller.abort());
    timeoutSignal.addEventListener('abort', () => controller.abort());
    return controller.signal;
  }

  return timeoutSignal;
}`}
        highlight={[5, 9, 13, 14, 15]}
      />

      <h2>Zod 런타임 검증</h2>
      <CodeBlock
        language="tsx"
        code={`// API 응답을 Zod 스키마로 런타임 검증
if (options.schema) {
  const result = options.schema.safeParse(data);
  if (!result.success) {
    logger.warn('API response validation failed', result.error);
    // 검증 실패해도 데이터는 반환 (로깅만)
  }
}`}
      />

      <Callout variant="tip">
        <p>
          API Client는 <code>shared/api/</code>에 위치합니다.
          각 도메인의 <code>*.api.ts</code>에서 이 Client를 사용하여
          엔드포인트별 함수를 정의합니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
