import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function SelectTransformPage() {
  return (
    <DocLayout
      title="select 변환 패턴"
      description="TanStack Query의 select 옵션으로 서버 응답을 컴포넌트에 맞게 변환합니다."
    >
      <h2>select란?</h2>
      <p>
        <code>select</code>는 캐시된 원본 데이터를 컴포넌트가 필요한 형태로 변환합니다.
        원본 캐시는 유지되므로 다른 컴포넌트에서 다른 형태로 변환할 수 있습니다.
        TanStack Query가 <strong>자동 메모이제이션</strong>하므로 참조 안정성도 보장됩니다.
      </p>

      <h2>기본: API 응답 래퍼 제거</h2>
      <CodeBlock
        language="tsx"
        code={`// API 응답: { data: T, message: string, code: string }
// 컴포넌트에서는 data만 필요

queryOptions({
  queryKey: agreementKeys.list(),
  queryFn: () => agreementApi.getList(),
  select: response => response.data,  // ApiResponse → T
})`}
        highlight={[7]}
      />

      <h2>실전: 복잡한 데이터 변환</h2>
      <p>
        건강 측정 데이터에서 차트 타입에 따라 단일/이중 데이터로 분리합니다.
      </p>

      <CodeBlock
        filename="data.queries.ts"
        language="tsx"
        code={`metric: (params: MsmtDetailRequest) =>
  queryOptions({
    queryKey: [...dataQueries.all(), 'metric', params],
    queryFn: () => dataApi.getMsmtDetail(params),
    select: response => {
      // 1. 날짜순 정렬
      const sorted = sortByKey(response.data.data);
      const detail = { ...response.data, data: sorted };

      // 2. 차트 타입 판별
      const isDual = MESURE_CHART_TYPE[params.mesureCode] === GraphType.B;

      return {
        ...detail,
        // 3. 차트 타입에 맞는 데이터만 생성
        singleData: isDual ? [] : toSingleData(detail),
        dualData: isDual ? toDualData(detail) : [],
      };
    },
    staleTime: STALE_TIME.METRIC,
  })`}
        highlight={[5, 7, 11, 16, 17]}
      />

      <h2>Infinite Query의 select</h2>
      <p>
        무한 스크롤에서 중첩된 응답 구조를 평탄화합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 원본: pages[n] = ApiResponse<{ posts, nextCursor }>
// 변환: pages[n] = { posts, nextCursor }

postCursorList: (bbId, params) =>
  infiniteQueryOptions({
    queryKey: [...boardKeys.posts(bbId), 'cursor', params],
    queryFn: ({ pageParam }) =>
      boardApi.getPostCursorList(bbId, { ...params, cursor: pageParam }),
    select: data => ({
      ...data,
      pages: data.pages.map(page => page.data),  // ApiResponse 래퍼 제거
    }),
  })`}
        highlight={[9, 10, 11]}
      />

      <h2>select vs 컴포넌트 내 변환</h2>
      <table>
        <thead>
          <tr>
            <th>방식</th>
            <th>장점</th>
            <th>단점</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>select</code></td>
            <td>자동 메모이제이션, 캐시 분리</td>
            <td>쿼리 설정에 로직 추가</td>
          </tr>
          <tr>
            <td>컴포넌트 내</td>
            <td>단순, 직관적</td>
            <td>매 렌더링마다 재계산</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="tip">
        <p>
          <strong>API 응답 래퍼 제거</strong>와 <strong>데이터 정렬/필터</strong>는{" "}
          <code>select</code>에서 처리하세요. 단순 문자열 포맷이나 날짜 변환은
          컴포넌트에서 처리하는 것이 자연스럽습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
