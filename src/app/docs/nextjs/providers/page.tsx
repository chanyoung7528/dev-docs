import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function NextjsProvidersPage() {
  return (
    <DocLayout
      title="Provider 구조"
      description="앱 전역 Provider의 조합 순서와 각 Provider의 역할을 알아봅니다."
    >
      <h2>Provider 조합 순서</h2>
      <p>
        Root Layout에서 Provider들을 중첩하여 전역 기능을 제공합니다.
        순서가 중요합니다 - 내부 Provider는 외부 Provider에 의존할 수 있습니다.
      </p>

      <CodeBlock
        filename="app/layout.tsx"
        language="tsx"
        code={`export default function RootLayout({ children }: { children: React.ReactNode }) {
  // DNS 사전 연결 (성능 최적화)
  if (preconnectUrl) {
    preconnect(preconnectUrl, { crossOrigin: 'use-credentials' });
    prefetchDNS(preconnectUrl);
  }

  return (
    <html lang="ko">
      <body className={cn(pretendard.variable, suite.variable)}>
        <div id="root">
          <NuqsAdapter>              {/* URL 상태 관리 */}
            <QueryProvider>           {/* TanStack Query */}
              <AuthProvider>          {/* 인증 상태 감시 */}
                <DeviceInfoProvider />{/* 디바이스 정보 수집 */}
                <GoBackProvider />    {/* 뒤로가기 제어 */}
                {children}
                <GlobalLoading />     {/* 전역 로딩 */}
                <ToastProvider />     {/* 토스트 알림 */}
                <AlertProvider />     {/* 모달 알림 */}
                <BottomSheetProvider />{/* 바텀시트 */}
                <PopupProvider />     {/* 전체 팝업 */}
              </AuthProvider>
            </QueryProvider>
          </NuqsAdapter>
        </div>
      </body>
    </html>
  );
}`}
        highlight={[12, 13, 14, 18, 19, 20, 21, 22]}
      />

      <h2>Provider 순서의 이유</h2>
      <table>
        <thead>
          <tr>
            <th>순서</th>
            <th>Provider</th>
            <th>의존성</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>NuqsAdapter</td>
            <td>없음 (URL 파싱)</td>
          </tr>
          <tr>
            <td>2</td>
            <td>QueryProvider</td>
            <td>없음 (캐시 인프라)</td>
          </tr>
          <tr>
            <td>3</td>
            <td>AuthProvider</td>
            <td>QueryProvider (useGetMe 쿼리)</td>
          </tr>
          <tr>
            <td>4+</td>
            <td>UI Providers</td>
            <td>AuthProvider 하위에서 동작</td>
          </tr>
        </tbody>
      </table>

      <h2>QueryProvider 상세</h2>
      <p>
        전역 에러 처리, 에러 중복 방지, 재시도 전략이 설정됩니다.
      </p>

      <CodeBlock
        filename="QueryProvider.tsx"
        language="tsx"
        code={`// 에러 중복 방지 (동시 요청 실패 시 토스트 1개만)
function isDuplicateError(message: string): boolean {
  const now = Date.now();
  if (lastError && lastError.message === message
      && now - lastError.time < ERROR_DEBOUNCE_TIME) {
    return true;
  }
  lastError = { message, time: now };
  return false;
}

const [queryClient] = useState(() =>
  createQueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) =>
          isRetriable(error) && failureCount < 2,
        retryDelay: getRetryDelay,     // 지수 백오프
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.skipGlobalError !== true
            && !isDuplicateError(error.message)) {
          handleGlobalError(error);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.meta?.skipGlobalError !== true
            && !isDuplicateError(error.message)) {
          handleGlobalError(error);
        }
      },
    }),
  })
);`}
        highlight={[2, 3, 4, 5, 22, 23, 24, 25, 26]}
      />

      <Callout variant="note" title="QueryCache vs defaultOptions">
        <p>
          <code>QueryCache.onError</code>는 모든 쿼리의 에러를 한 곳에서 처리합니다.
          <code>defaultOptions.queries.onError</code>는 deprecated 되었으므로
          QueryCache/MutationCache를 사용합니다.
        </p>
      </Callout>

      <h2>children 뒤에 오는 Provider들</h2>
      <p>
        ToastProvider, AlertProvider 등은 <code>children</code> 뒤에 배치합니다.
        이들은 Zustand Store를 구독하여 전역 UI를 렌더링하는 역할이므로
        페이지 콘텐츠 아래에 위치해도 됩니다.
      </p>
    </DocLayout>
  );
}
