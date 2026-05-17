import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function DomainLayerPage() {
  return (
    <DocLayout
      title="Domain Layer 구조"
      description="도메인별 데이터 레이어를 체계적으로 구성하는 방법입니다."
    >
      <h2>도메인 폴더 구조</h2>
      <p>
        각 도메인(board, member, data 등)은 동일한 파일 구조를 따릅니다.
        데이터 페칭, 타입, 스키마, 상태를 한 곳에 모아 응집도를 높입니다.
      </p>

      <CodeBlock
        language="plaintext"
        code={`src/domains/board/
├── index.ts              # 배럴 export
├── board.api.ts          # API 엔드포인트 함수
├── board.queries.ts      # TanStack Query options + hooks
├── board.schema.ts       # Zod 유효성 검사 스키마
├── board.store.ts        # Zustand 스토어 (선택)
├── board.types.ts        # Entity/DTO 타입 정의
└── types/                # 추가 타입 (필요시)
    └── post.types.ts`}
      />

      <h2>각 파일의 역할</h2>

      <h3>1. types.ts - 타입 정의</h3>
      <CodeBlock
        language="tsx"
        code={`// Entity: 도메인 모델 → interface
interface Post {
  bbcSeqNo: number;
  bbcTtl: string;
  bbcCont: string;
  createdAt: string;
}

// DTO: API 요청/응답 → type
type PostCursorListRequest = {
  cursor?: number;
  pageSize: number;
  searchKeyword?: string;
};

type PostCursorListResponse = {
  posts: PostCursorItem[];
  nextCursor: number | null;
  totalCount: number;
};`}
        highlight={[2, 11]}
      />

      <Callout variant="note" title="interface vs type">
        <p>
          프로젝트 규칙: <strong>Entity와 Props</strong>는{" "}
          <code>interface</code>, <strong>DTO와 Params</strong>는{" "}
          <code>type</code>으로 정의합니다.
        </p>
      </Callout>

      <h3>2. api.ts - API 함수</h3>
      <CodeBlock
        language="tsx"
        code={`import { client } from '@shared/api/client';

export const boardApi = {
  getMeta: (bbId: BoardId) =>
    client.get<ApiResponse<BoardMeta>>(\`/api/board/\${bbId}/meta\`),

  getPostList: (bbId: BoardId) =>
    client.get<ApiResponse<Post[]>>(\`/api/board/\${bbId}/posts\`),

  getPostCursorList: (bbId: BoardId, params: PostCursorListRequest) =>
    client.get<ApiResponse<PostCursorListResponse>>(
      \`/api/board/\${bbId}/posts/cursor\`,
      { params }
    ),

  createPost: (bbId: BoardId, data: CreatePostDto) =>
    client.post<ApiResponse<void>>(\`/api/board/\${bbId}/posts\`, data),
};`}
      />

      <h3>3. queries.ts - TanStack Query</h3>
      <CodeBlock
        language="tsx"
        code={`const boardKeys = {
  all: () => ['board'] as const,
  meta: (bbId: BoardId) => [...boardKeys.all(), 'meta', bbId] as const,
  posts: (bbId: BoardId) => [...boardKeys.all(), bbId, 'posts'] as const,
};

export const boardQueries = {
  meta: (bbId: BoardId) =>
    queryOptions({
      queryKey: boardKeys.meta(bbId),
      queryFn: () => boardApi.getMeta(bbId),
      select: response => response.data,
      staleTime: STALE_TIME.META,
    }),

  postCursorList: (bbId: BoardId, params: Omit<PostCursorListRequest, 'cursor'>) =>
    infiniteQueryOptions({
      queryKey: [...boardKeys.posts(bbId), 'cursor', params] as const,
      queryFn: ({ pageParam }) =>
        boardApi.getPostCursorList(bbId, { ...params, cursor: pageParam }),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: lastPage => lastPage.data.nextCursor ?? undefined,
      select: data => ({
        ...data,
        pages: data.pages.map(page => page.data),
      }),
      maxPages: 10,
    }),
};`}
      />

      <h2>의존성 방향</h2>
      <CodeBlock
        language="plaintext"
        code={`app → features → domains → shared

features/mypage/
  └── hooks/usePostInfinite.ts
        └── import { boardQueries } from '@domains/board'
              └── import { boardApi } from './board.api'
                    └── import { client } from '@shared/api/client'`}
      />

      <Callout variant="warning">
        <p>
          역방향 의존 금지: domains가 features를 import하거나,
          shared가 domains를 import하면 안 됩니다.
          같은 레이어 간 의존도 금지합니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
