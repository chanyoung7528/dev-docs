import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function TanStackQueryIntroPage() {
  return (
    <DocLayout
      title="소개 & 설정"
      description="TanStack Query(React Query)는 서버 상태를 효율적으로 관리하는 라이브러리입니다."
    >
      <h2>왜 TanStack Query인가?</h2>
      <p>
        프론트엔드에서 다루는 상태는 크게 두 가지로 나뉩니다.
      </p>
      <ul>
        <li>
          <strong>클라이언트 상태</strong>: UI 토글, 폼 입력값, 모달 열림 여부
          등 브라우저에서만 존재하는 상태
        </li>
        <li>
          <strong>서버 상태</strong>: API에서 가져온 데이터. 다른 사용자와
          공유되며, 클라이언트는 &quot;스냅샷&quot;만 가지고 있음
        </li>
      </ul>
      <p>
        서버 상태는 클라이언트 상태와 본질적으로 다릅니다. 캐싱, 동기화,
        백그라운드 업데이트, stale 데이터 처리 등 복잡한 문제가 따릅니다.
        TanStack Query는 이 모든 것을 자동으로 처리합니다.
      </p>

      <Callout variant="note">
        <p>
          TanStack Query는 원래 React Query라는 이름이었습니다. v4부터 프레임워크
          비의존적으로 변경되며 TanStack Query로 이름이 바뀌었지만, React에서는
          여전히 <code>@tanstack/react-query</code>를 사용합니다.
        </p>
      </Callout>

      <h2>TanStack Query가 해결하는 문제</h2>
      <table>
        <thead>
          <tr>
            <th>문제</th>
            <th>직접 구현 시</th>
            <th>TanStack Query</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>캐싱</td>
            <td>상태 관리 라이브러리에 수동 저장</td>
            <td>자동 캐싱 + 캐시 무효화</td>
          </tr>
          <tr>
            <td>중복 요청 방지</td>
            <td>flag 변수로 관리</td>
            <td>같은 key 요청 자동 병합</td>
          </tr>
          <tr>
            <td>로딩/에러 상태</td>
            <td>매번 isLoading, error 상태 관리</td>
            <td>자동 제공</td>
          </tr>
          <tr>
            <td>백그라운드 동기화</td>
            <td>타이머 + 수동 refetch</td>
            <td>window focus, interval 자동 refetch</td>
          </tr>
          <tr>
            <td>페이지네이션</td>
            <td>복잡한 상태 로직</td>
            <td>전용 hooks 제공</td>
          </tr>
        </tbody>
      </table>

      <h2>설치 & 초기 설정</h2>

      <CodeBlock
        language="bash"
        code={`pnpm add @tanstack/react-query`}
      />

      <h3>QueryClient 설정</h3>
      <p>
        앱 전체에서 하나의 <code>QueryClient</code>를 공유합니다.
        기본 옵션을 여기서 설정합니다.
      </p>

      <CodeBlock
        filename="QueryProvider.tsx"
        language="tsx"
        code={`'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,        // 1분 동안 fresh
            gcTime: 5 * 60 * 1000,       // 5분 후 가비지 컬렉션
            retry: 1,                     // 실패 시 1회 재시도
            refetchOnWindowFocus: false,  // 윈도우 포커스 시 refetch 비활성화
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}`}
        highlight={[7, 11, 12, 13, 14]}
      />

      <Callout variant="warning">
        <p>
          <code>QueryClient</code>를 컴포넌트 바깥에서 생성하면 서버/클라이언트
          간 상태가 공유될 수 있습니다. 반드시{" "}
          <strong>useState 안에서 생성</strong>하세요.
        </p>
      </Callout>

      <h3>Layout에 Provider 추가</h3>

      <CodeBlock
        filename="layout.tsx"
        language="tsx"
        code={`import { QueryProvider } from './_providers/QueryProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}`}
      />

      <h2>핵심 개념</h2>

      <h3>staleTime vs gcTime</h3>
      <p>
        가장 혼동되는 두 가지 시간 설정입니다.
      </p>
      <ul>
        <li>
          <strong>staleTime</strong>: 데이터가 &quot;신선&quot;한 상태로 유지되는
          시간. 이 시간 동안은 refetch하지 않음
        </li>
        <li>
          <strong>gcTime</strong> (구 cacheTime): 비활성 쿼리가 메모리에 남아있는
          시간. 이 시간이 지나면 캐시에서 제거됨
        </li>
      </ul>

      <CodeBlock
        language="tsx"
        code={`// 예시: staleTime = 5분, gcTime = 10분
// 0분: API 호출 → 데이터 캐시됨 (fresh)
// 3분: 같은 쿼리 접근 → 캐시 반환 (아직 fresh)
// 6분: 같은 쿼리 접근 → 캐시 반환 + 백그라운드 refetch (stale)
// 컴포넌트 언마운트 후 10분 경과: 캐시에서 제거됨`}
      />

      <Callout variant="tip">
        <p>
          <code>staleTime: 0</code> (기본값)이면 매번 백그라운드에서 refetch합니다.
          자주 변하지 않는 데이터는 적절한 staleTime을 설정하면 불필요한
          네트워크 요청을 줄일 수 있습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
