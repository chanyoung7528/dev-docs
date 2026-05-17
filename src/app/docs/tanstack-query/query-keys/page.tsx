import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function TanstackQueryQueryKeysPage() {
  return (
    <DocLayout
      title="Query Keys"
      description="쿼리를 식별하고 캐시를 관리하는 핵심 개념입니다."
    >
      <h2>Query Key란?</h2>
      <p>
        Query Key는 각 쿼리를 고유하게 식별하는 배열입니다.
        같은 Key를 가진 쿼리는 캐시를 공유하고, Key가 변경되면 새로운 쿼리로
        취급됩니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 기본 형태
useQuery({ queryKey: ['todos'], queryFn: fetchTodos });

// 파라미터 포함
useQuery({ queryKey: ['todo', todoId], queryFn: () => fetchTodo(todoId) });

// 필터 포함
useQuery({
  queryKey: ['todos', { status: 'done', page: 1 }],
  queryFn: () => fetchTodos({ status: 'done', page: 1 }),
});`}
      />

      <h2>실전 패턴: Key Factory</h2>
      <p>
        프로젝트에서는 Query Key를 팩토리 함수로 관리합니다.
        계층 구조로 정의하여 관련 쿼리를 일괄 무효화할 수 있습니다.
      </p>

      <CodeBlock
        filename="agreement.queries.ts"
        language="tsx"
        code={`const agreementKeys = {
  all: () => ['agreement'] as const,
  list: () => [...agreementKeys.all(), 'list'] as const,
  myConsents: () => [...agreementKeys.all(), 'myConsents'] as const,
  detail: (agrmNo: string, verNo?: string) =>
    [...agreementKeys.all(), 'detail', agrmNo, verNo] as const,
  versions: (agrmNo: string) =>
    [...agreementKeys.all(), 'versions', agrmNo] as const,
};

// 계층 구조:
// ['agreement']                           ← all
// ['agreement', 'list']                   ← list
// ['agreement', 'myConsents']             ← myConsents
// ['agreement', 'detail', '001', '1']     ← detail
// ['agreement', 'versions', '001']        ← versions`}
        highlight={[1, 2, 3, 4]}
      />

      <h2>Key 계층의 장점: 일괄 무효화</h2>
      <CodeBlock
        language="tsx"
        code={`// 특정 상세 쿼리만 무효화
queryClient.invalidateQueries({
  queryKey: agreementKeys.detail('001'),
});

// 모든 agreement 관련 쿼리 한번에 무효화
queryClient.invalidateQueries({
  queryKey: agreementKeys.all(),
});
// → list, myConsents, detail, versions 모두 무효화됨!`}
        highlight={[8, 9]}
      />

      <Callout variant="note">
        <p>
          <code>invalidateQueries</code>는 prefix 매칭입니다.{" "}
          <code>[&apos;agreement&apos;]</code>로 무효화하면{" "}
          <code>[&apos;agreement&apos;, &apos;list&apos;]</code>,{" "}
          <code>[&apos;agreement&apos;, &apos;detail&apos;, ...]</code> 등
          모든 하위 쿼리가 무효화됩니다.
        </p>
      </Callout>

      <h2>queryOptions와 조합</h2>
      <p>
        <code>queryOptions</code>로 Key, 함수, 옵션을 하나로 묶으면
        타입 안전하게 재사용할 수 있습니다.
      </p>

      <CodeBlock
        filename="board.queries.ts"
        language="tsx"
        code={`export const boardQueries = {
  posts: (bbId: BoardId) =>
    queryOptions({
      queryKey: [...boardKeys.all(), bbId, 'posts'] as const,
      queryFn: () => boardApi.getPostList(bbId),
      select: response => response.data,
    }),

  postDetail: (bbId: BoardId, bbcSeqNo: number) =>
    queryOptions({
      queryKey: [...boardKeys.all(), bbId, 'detail', bbcSeqNo] as const,
      queryFn: () => boardApi.getPostDetail(bbId, bbcSeqNo),
      select: response => response.data,
    }),
};

// 어디서든 동일한 Key + 설정으로 사용
const { data } = useQuery(boardQueries.posts('notice'));
const { data: detail } = useQuery(boardQueries.postDetail('notice', 123));`}
        highlight={[3, 4, 5, 6, 18, 19]}
      />

      <h2>Key 설계 규칙</h2>
      <ul>
        <li>
          <strong>도메인 → 엔티티 → 식별자</strong> 순서로 구성
        </li>
        <li>
          <code>as const</code>로 리터럴 타입 보장
        </li>
        <li>
          팩토리 함수로 정의하여 오타 방지 + 자동완성
        </li>
        <li>
          <code>queries.ts</code> 파일에 Key + queryOptions를 함께 관리
        </li>
      </ul>
    </DocLayout>
  );
}
