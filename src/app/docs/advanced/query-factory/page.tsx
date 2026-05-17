import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function QueryFactoryPage() {
  return (
    <DocLayout
      title="Query Factory 패턴"
      description="TanStack Query의 queryOptions/infiniteQueryOptions를 팩토리 패턴으로 관리하는 실무 구조입니다."
    >
      <h2>문제</h2>
      <p>
        TanStack Query를 사용하다 보면 queryKey, queryFn, staleTime 등이
        컴포넌트에 흩어집니다. 같은 API를 여러 곳에서 호출하면 queryKey 불일치,
        설정 중복이 발생합니다.
      </p>

      <h2>Query Factory 구조</h2>

      <CodeBlock
        filename="board.queries.ts"
        language="typescript"
        code={`import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { boardApi } from './board.api';
import { STALE_TIME } from '@/shared/constants';

export const boardQueries = {
  // 1단계: 기본 키
  all: () => ['board'] as const,

  // 2단계: 카테고리 키
  posts: (bbId: BoardId) => [...boardQueries.all(), 'posts', bbId] as const,

  // 3단계: queryOptions로 완전한 쿼리 정의
  meta: (bbId: BoardId) =>
    queryOptions({
      queryKey: [...boardQueries.all(), 'meta', bbId] as const,
      queryFn: () => boardApi.getMeta(bbId),
      select: (response) => response.data,
      staleTime: STALE_TIME.LONG,
    }),

  postDetail: (bbId: BoardId, postId: string) =>
    queryOptions({
      queryKey: [...boardQueries.posts(bbId), 'detail', postId] as const,
      queryFn: () => boardApi.getPostDetail(bbId, postId),
      select: (response) => response.data,
    }),

  // 4단계: infiniteQueryOptions
  postCursorList: (bbId: BoardId, params: PostListParams) =>
    infiniteQueryOptions({
      queryKey: [...boardQueries.posts(bbId), 'cursor', params] as const,
      queryFn: ({ pageParam }) =>
        boardApi.getPostCursorList(bbId, { ...params, cursor: pageParam }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
      select: (data) => ({
        ...data,
        pages: data.pages.map((page) => page.data),
      }),
      maxPages: 10,
    }),
} as const;`}
        highlight={[7, 10, 15, 17, 32, 33, 37, 38, 39]}
      />

      <Callout variant="note">
        <p>
          <code>as const</code>로 queryKey를 readonly 튜플로 만들면,
          invalidateQueries 시 타입 안전한 매칭이 가능합니다.
          <code>boardQueries.all()</code>로 전체 board 관련 캐시를 무효화할 수 있습니다.
        </p>
      </Callout>

      <h2>API Layer (단일 책임)</h2>

      <CodeBlock
        filename="board.api.ts"
        language="typescript"
        code={`import { apiClient } from '@/shared/api/client';
import type { ApiResponse, BoardMeta, PostListData } from './board.types';

const BASE_URL = '/api/board';

export const boardApi = {
  getMeta: (bbId: BoardId) =>
    apiClient.get<ApiResponse<BoardMeta>>(\`\${BASE_URL}/\${bbId}\`),

  getPostDetail: (bbId: BoardId, postId: string) =>
    apiClient.get<ApiResponse<PostDetail>>(\`\${BASE_URL}/\${bbId}/post/\${postId}\`),

  getPostCursorList: (bbId: BoardId, params: PostCursorListRequest) =>
    apiClient.post<ApiResponse<PostListData>>(\`\${BASE_URL}/\${bbId}/post/list\`, params),

  createPost: (bbId: BoardId, data: CreatePostRequest) =>
    apiClient.post<ApiResponse<Post>>(\`\${BASE_URL}/\${bbId}/post\`, data),

  uploadAttachment: (bbId: BoardId, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return apiClient.post<ApiResponse<UploadResult>>(
      \`\${BASE_URL}/attachment/upload\`,
      formData,
      { params: { bbId } },
    );
  },
} as const;

// API layer는 HTTP 요청만 담당
// 데이터 변환, 캐싱 전략은 queries layer에서`}
        highlight={[7, 8, 13, 14, 19, 20]}
      />

      <h2>컴포넌트에서 사용</h2>

      <CodeBlock
        filename="BoardPage.tsx"
        language="tsx"
        code={`import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardQueries } from '@/domains/board/board.queries';
import { boardApi } from '@/domains/board/board.api';

function BoardPage({ bbId }: { bbId: BoardId }) {
  const queryClient = useQueryClient();

  // 쿼리: 팩토리에서 가져오기만 하면 됨
  const { data: meta } = useQuery(boardQueries.meta(bbId));

  const {
    data,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(boardQueries.postCursorList(bbId, { pageSize: 30 }));

  // 뮤테이션: 성공 시 캐시 무효화
  const createPost = useMutation({
    mutationFn: (data: CreatePostRequest) => boardApi.createPost(bbId, data),
    onSuccess: () => {
      // 계층적 키로 관련 캐시만 무효화
      queryClient.invalidateQueries({ queryKey: boardQueries.posts(bbId) });
    },
  });

  // ...
}`}
        highlight={[9, 15, 22, 23]}
      />

      <h2>select에서 데이터 정규화</h2>

      <CodeBlock
        filename="data.queries.ts"
        language="typescript"
        code={`export const dataQueries = {
  page: (params: MsmtListRequest) =>
    queryOptions({
      queryKey: [...dataQueries.all(), 'page'] as const,
      queryFn: () => dataApi.getMsmtList(params),

      // API 응답 → UI가 바로 쓸 수 있는 형태로 변환
      select: (response) => ({
        ...response?.data,
        items: response?.data?.items
          .map((item) => ({
            ...item,
            // 표시용 값 포맷팅
            displayValue: displayValueFormatter(item),
            // 차트 타입 결정
            chartType: resolveChartType(item.mesureCode),
            // 라벨 오버라이드
            label: resolveLabel(item.mesureCode, item.label),
            // 판정 코드 정규화
            judgeCode: normalizeJudgeCode(item?.judgeCode),
          }))
          .filter((item) => isVisibleItem(item.mesureCode))
          .sort((a, b) => a.sortSeq - b.sortSeq),
      }),
    }),
} as const;

// 원칙: 컴포넌트에서 데이터 변환 하지 않기
// API 응답 → select에서 변환 → 컴포넌트는 그대로 사용`}
        highlight={[8, 14, 16, 18, 20, 22, 23]}
      />

      <h2>계층별 역할 정리</h2>

      <CodeBlock
        language="typescript"
        code={`// 디렉토리 구조
// domains/
//   board/
//     board.types.ts    ← 타입 정의 (API 요청/응답)
//     board.api.ts      ← HTTP 요청만 (apiClient 래퍼)
//     board.queries.ts  ← 캐싱 전략 + 데이터 변환 (queryOptions)
//     board.store.ts    ← 클라이언트 상태 (Zustand, 필요 시)

// 의존 방향: queries → api → apiClient
// 컴포넌트 → queries (직접 api 호출 X)`}
      />

      <Callout variant="tip">
        <p>
          <strong>이 패턴의 장점:</strong> queryKey 충돌 방지, staleTime/gcTime
          중앙 관리, select로 한 곳에서 데이터 정규화, invalidateQueries 시
          계층적 무효화 가능.
        </p>
      </Callout>
    </DocLayout>
  );
}
