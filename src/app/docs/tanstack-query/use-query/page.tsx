import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function TanstackQueryUseQueryPage() {
  return (
    <DocLayout
      title="useQuery"
      description="서버에서 데이터를 가져오고 캐싱하는 핵심 Hook입니다."
    >
      <h2>기본 사용법</h2>
      <CodeBlock
        language="tsx"
        code={`import { useQuery } from '@tanstack/react-query';

function UserProfile({ userId }: { userId: string }) {
  const { data, isPending, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getProfile(userId),
  });

  if (isPending) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{data.name}</div>;
}`}
        highlight={[4, 5, 6]}
      />

      <h2>반환값</h2>
      <table>
        <thead>
          <tr>
            <th>속성</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>data</code></td>
            <td>성공 시 응답 데이터</td>
          </tr>
          <tr>
            <td><code>isPending</code></td>
            <td>최초 로딩 중 (캐시 없음)</td>
          </tr>
          <tr>
            <td><code>isFetching</code></td>
            <td>백그라운드 refetch 포함 모든 로딩</td>
          </tr>
          <tr>
            <td><code>error</code></td>
            <td>에러 객체</td>
          </tr>
          <tr>
            <td><code>isStale</code></td>
            <td>데이터가 stale 상태인지</td>
          </tr>
        </tbody>
      </table>

      <h2>실전 패턴: queryOptions + select</h2>
      <p>
        프로젝트에서는 <code>queryOptions</code>로 쿼리 설정을 분리하고,
        <code>select</code>로 응답 데이터를 가공합니다.
      </p>

      <CodeBlock
        filename="agreement.queries.ts"
        language="tsx"
        code={`import { queryOptions, useQuery } from '@tanstack/react-query';

const agreementKeys = {
  all: () => ['agreement'] as const,
  list: () => [...agreementKeys.all(), 'list'] as const,
  detail: (agrmNo: string) => [...agreementKeys.all(), 'detail', agrmNo] as const,
};

// queryOptions로 설정 분리 → 재사용 가능
export const agreementQueries = {
  list: () =>
    queryOptions({
      queryKey: agreementKeys.list(),
      queryFn: () => agreementApi.getList(),
      select: response => response.data,  // 응답에서 data만 추출
      staleTime: STALE_TIME.LONG,
    }),
};

// Hook에서 사용
export function useGetAgreementList() {
  return useQuery(agreementQueries.list());
}`}
        highlight={[12, 13, 14, 15, 16]}
      />

      <Callout variant="note">
        <p>
          <code>select</code>는 캐시된 데이터를 변환합니다. 원본 캐시는 유지되고,
          컴포넌트가 받는 데이터만 변환됩니다. API 응답의{" "}
          <code>{'{ data, message, code }'}</code> 래퍼에서{" "}
          <code>data</code>만 추출할 때 유용합니다.
        </p>
      </Callout>

      <h2>조건부 쿼리 (enabled)</h2>
      <p>
        <code>enabled</code> 옵션으로 특정 조건에서만 쿼리를 실행합니다.
        아코디언 열림, 탭 전환 등에서 지연 로딩에 사용합니다.
      </p>

      <CodeBlock
        filename="usePostDetail.ts"
        language="tsx"
        code={`export function usePostDetail({ bbId, bbcSeqNo, enabled }: UsePostDetailOptions) {
  return useQuery({
    ...boardQueries.postDetail(bbId, bbcSeqNo),
    enabled,
    // Why: 로컬 에러 UI에서 처리하므로 전역 Toast 중복 방지
    meta: { skipGlobalError: true },
  });
}

// 아코디언 열릴 때만 상세 데이터 로드
function PostAccordionItem({ post }: { post: Post }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data } = usePostDetail({
    bbId: post.bbId,
    bbcSeqNo: post.bbcSeqNo,
    enabled: isOpen,  // 아코디언 열릴 때만 fetch
  });

  return (
    <Accordion.Item>
      <Accordion.Trigger onClick={() => setIsOpen(true)}>
        {post.title}
      </Accordion.Trigger>
      <Accordion.Panel>
        {data ? <PostContent data={data} /> : <Skeleton />}
      </Accordion.Panel>
    </Accordion.Item>
  );
}`}
        highlight={[4, 18]}
      />

      <h2>주요 옵션</h2>
      <table>
        <thead>
          <tr>
            <th>옵션</th>
            <th>설명</th>
            <th>기본값</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>staleTime</code></td>
            <td>fresh 유지 시간</td>
            <td>0</td>
          </tr>
          <tr>
            <td><code>gcTime</code></td>
            <td>비활성 캐시 유지 시간</td>
            <td>5분</td>
          </tr>
          <tr>
            <td><code>enabled</code></td>
            <td>쿼리 실행 여부</td>
            <td>true</td>
          </tr>
          <tr>
            <td><code>retry</code></td>
            <td>실패 시 재시도 횟수</td>
            <td>3</td>
          </tr>
          <tr>
            <td><code>refetchOnWindowFocus</code></td>
            <td>창 포커스 시 refetch</td>
            <td>true</td>
          </tr>
          <tr>
            <td><code>select</code></td>
            <td>데이터 변환 함수</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>
    </DocLayout>
  );
}
