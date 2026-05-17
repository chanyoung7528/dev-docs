import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function TanstackQueryCachingPage() {
  return (
    <DocLayout
      title="캐싱 전략"
      description="TanStack Query의 캐싱 메커니즘과 효율적인 캐시 관리 방법을 알아봅니다."
    >
      <h2>캐시 라이프사이클</h2>
      <p>
        쿼리 데이터는 <strong>fresh → stale → inactive → gc</strong> 순서로
        상태가 변합니다.
      </p>

      <CodeBlock
        language="plaintext"
        code={`[컴포넌트 마운트] → API 호출 → 캐시 저장 (fresh)
        ↓ staleTime 경과
      (stale) → 백그라운드 refetch 트리거 가능
        ↓ 컴포넌트 언마운트
      (inactive) → 캐시는 유지
        ↓ gcTime 경과
      (garbage collected) → 캐시 삭제`}
      />

      <h2>staleTime 설정</h2>
      <p>데이터 성격에 따라 적절한 staleTime을 설정합니다.</p>

      <CodeBlock
        filename="QueryProvider.tsx"
        language="tsx"
        code={`// 프로젝트 전역 기본값
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1분
      gcTime: 5 * 60 * 1000,       // 5분
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 도메인별 staleTime 상수
export const STALE_TIME = {
  SHORT: 30 * 1000,       // 30초 - 자주 변하는 데이터
  MEDIUM: 60 * 1000,      // 1분 - 일반적인 데이터
  LONG: 5 * 60 * 1000,    // 5분 - 거의 안 변하는 데이터
  INFINITE: Infinity,     // 수동 무효화 전까지 유지
} as const;`}
        highlight={[5, 6, 15, 16, 17, 18]}
      />

      <h2>캐시 무효화</h2>
      <p>데이터 변경 후 관련 캐시를 무효화하여 최신 데이터를 가져옵니다.</p>

      <CodeBlock
        language="tsx"
        code={`// 1. invalidateQueries: stale 표시 + 활성 쿼리 refetch
queryClient.invalidateQueries({ queryKey: ['posts'] });

// 2. setQueryData: 캐시 직접 수정 (Optimistic Update)
queryClient.setQueryData(['posts'], (old) => {
  return old ? [...old, newPost] : [newPost];
});

// 3. resetQueries: 초기 상태로 리셋
queryClient.resetQueries({ queryKey: ['posts'] });

// 4. removeQueries: 캐시 완전 삭제
queryClient.removeQueries({ queryKey: ['posts'] });`}
      />

      <h2>실전 패턴: Mutation 후 캐시 관리</h2>

      <CodeBlock
        filename="agreement.queries.ts"
        language="tsx"
        code={`export function useUpdateConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agreementApi.updateConsent,
    onSuccess: () => {
      // 관련 쿼리만 정확하게 무효화
      queryClient.invalidateQueries({
        queryKey: agreementKeys.myConsents(),
      });
    },
  });
}

// vs 전체 무효화 (비추천)
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: agreementKeys.all(),  // 불필요한 쿼리까지 refetch
  });
}`}
        highlight={[8, 9]}
      />

      <Callout variant="tip">
        <p>
          무효화 범위는 최소한으로 유지하세요. 전체 도메인을 무효화하면
          불필요한 네트워크 요청이 발생합니다.
        </p>
      </Callout>

      <h2>prefetch로 UX 개선</h2>
      <CodeBlock
        language="tsx"
        code={`// 마우스 hover 시 미리 데이터 로드
function PostItem({ post }: { post: Post }) {
  const queryClient = useQueryClient();

  function handleHover() {
    queryClient.prefetchQuery(
      boardQueries.postDetail(post.bbId, post.bbcSeqNo)
    );
  }

  return (
    <Link
      href={'/posts/' + post.bbcSeqNo}
      onMouseEnter={handleHover}
    >
      {post.title}
    </Link>
  );
}`}
        highlight={[6, 7]}
      />
    </DocLayout>
  );
}
