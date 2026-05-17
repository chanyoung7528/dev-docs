import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function TanstackQueryInfiniteQueriesPage() {
  return (
    <DocLayout
      title="무한 스크롤"
      description="useInfiniteQuery와 Intersection Observer를 조합한 무한 스크롤 구현입니다."
    >
      <h2>useInfiniteQuery 기본</h2>
      <p>
        페이지네이션과 달리 이전 데이터를 유지하면서 다음 데이터를 추가로
        불러옵니다. 각 &quot;페이지&quot;의 데이터가 <code>pages</code> 배열에
        순서대로 저장됩니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`const {
  data,          // { pages: [...], pageParams: [...] }
  fetchNextPage, // 다음 페이지 로드 함수
  hasNextPage,   // 다음 페이지 존재 여부
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['posts', boardId],
  queryFn: ({ pageParam }) => api.getPosts({ cursor: pageParam }),
  initialPageParam: undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});

// pages를 평탄화하여 사용
const allPosts = data?.pages.flatMap(page => page.posts) ?? [];`}
        highlight={[8, 10, 14]}
      />

      <h2>실전 적용: 커서 기반 무한 스크롤</h2>
      <p>
        프로젝트에서 게시판의 커서 기반 무한 스크롤 구현입니다.
        <code>infiniteQueryOptions</code>로 쿼리 설정을 분리하고,
        <code>useIntersectionObserver</code>와 조합합니다.
      </p>

      <CodeBlock
        filename="board.queries.ts"
        language="tsx"
        code={`export const boardQueries = {
  postCursorList: (bbId: BoardId, params: Omit<PostCursorListRequest, 'cursor'>) =>
    infiniteQueryOptions({
      queryKey: [...boardKeys.posts(bbId), 'cursor', params] as const,
      queryFn: ({ pageParam }) =>
        boardApi.getPostCursorList(bbId, {
          ...params,
          cursor: pageParam,
        }),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: lastPage => lastPage.data.nextCursor ?? undefined,
      select: data => ({
        ...data,
        pages: data.pages.map(page => page.data),
      }),
      maxPages: 10,  // 메모리 최적화: 최대 10페이지만 유지
    }),
};`}
        highlight={[10, 11, 12, 13, 14, 16]}
      />

      <h3>무한 스크롤 Hook</h3>
      <CodeBlock
        filename="usePostInfinite.ts"
        language="tsx"
        code={`// 커서 기반 중복 제거
function deduplicate(posts: PostCursorItem[]): PostCursorItem[] {
  return [...new Map(posts.map(post => [post.bbcSeqNo, post])).values()];
}

export function usePostInfinite(options: UsePostInfiniteOptions) {
  const { bbId, ...rest } = options;
  const params = { ...DEFAULT_OPTIONS, ...rest };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery(boardQueries.postCursorList(bbId, params));

  // Intersection Observer로 자동 다음 페이지 로드
  const { targetRef: sentinelRef } = useIntersectionObserver({
    enabled: hasNextPage && !isFetchingNextPage,
    onIntersect: () => fetchNextPage(),
    root: typeof document !== 'undefined'
      ? document.getElementById('root')
      : null,
    rootMargin: '200px',  // 200px 전에 미리 로드
  });

  const posts = deduplicate(data?.pages.flatMap(page => page.posts) ?? []);

  return { posts, isPending, hasNextPage, isFetchingNextPage, sentinelRef };
}`}
        highlight={[2, 3, 14, 15, 16, 20]}
      />

      <Callout variant="note" title="중복 제거가 필요한 이유">
        <p>
          커서 기반 페이지네이션에서 새 항목이 추가되면 경계에 있는 항목이
          중복될 수 있습니다. Map을 사용하여 ID 기준으로 중복을 제거합니다.
        </p>
      </Callout>

      <h3>컴포넌트에서 사용</h3>
      <CodeBlock
        filename="BoardList.tsx"
        language="tsx"
        code={`function BoardList({ bbId }: { bbId: BoardId }) {
  const { posts, isPending, sentinelRef } = usePostInfinite({ bbId });

  if (isPending) return <PostSkeleton />;
  if (posts.length === 0) return <EmptyState />;

  return (
    <div className={styles.list}>
      {posts.map(post => (
        <PostItem key={post.bbcSeqNo} post={post} />
      ))}
      {/* 이 div가 화면에 보이면 다음 페이지 자동 로드 */}
      <div ref={sentinelRef} className={styles.sentinel} />
    </div>
  );
}`}
        highlight={[2, 13]}
      />

      <h2>주요 옵션</h2>
      <table>
        <thead>
          <tr>
            <th>옵션</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>initialPageParam</code></td>
            <td>첫 페이지의 pageParam 값</td>
          </tr>
          <tr>
            <td><code>getNextPageParam</code></td>
            <td>다음 페이지 파라미터 결정 (undefined 반환 시 끝)</td>
          </tr>
          <tr>
            <td><code>maxPages</code></td>
            <td>메모리에 유지할 최대 페이지 수</td>
          </tr>
          <tr>
            <td><code>select</code></td>
            <td>전체 data 구조 변환</td>
          </tr>
        </tbody>
      </table>
    </DocLayout>
  );
}
