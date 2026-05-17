import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function SwiperLazyPage() {
  return (
    <DocLayout
      title="Swiper + Lazy Fetching"
      description="데이터 차트에서 Swiper 페이지네이션과 지연 데이터 로딩을 조합한 패턴입니다."
    >
      <h2>문제</h2>
      <p>
        건강 데이터 차트에서 30일치 이상의 데이터를 한 화면에 표시하면
        가독성이 떨어집니다. Swiper로 페이지를 나누되, 최신 데이터부터
        보여주고 이전 데이터는 스와이프로 접근하게 합니다.
      </p>

      <h2>ChartSwiper 컴포넌트</h2>
      <CodeBlock
        filename="ChartSwiper.tsx"
        language="tsx"
        code={`import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

interface ChartSwiperProps<T> {
  data: T[];
  pageSize?: number;
  renderChart: (pageData: T[], pageIndex: number) => React.ReactNode;
}

export function ChartSwiper<T>({
  data,
  pageSize = 5,
  renderChart,
}: ChartSwiperProps<T>) {
  const pages = chunkChartData(data, pageSize);

  // 데이터가 1페이지 이하면 Swiper 불필요
  if (pages.length <= 1) {
    return <div className={styles.wrapper}>{renderChart(data, 0)}</div>;
  }

  return (
    <Swiper
      modules={[Pagination]}
      slidesPerView={1}
      initialSlide={pages.length - 1}  // 최신 데이터(마지막 페이지)부터 표시
      touchStartPreventDefault={false}  // Why: Recharts 클릭 이벤트 방해 방지
      pagination={{
        clickable: true,
        dynamicBullets: true,
        dynamicMainBullets: 3,
      }}
    >
      {pages.map((pageData, idx) => (
        <SwiperSlide key={idx} className={styles.slide}>
          {renderChart(pageData, idx)}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}`}
        highlight={[7, 15, 18, 26, 27, 36]}
      />

      <Callout variant="note" title="pageIndex가 필요한 이유">
        <p>
          Recharts에서 SVG gradient ID가 동일하면 충돌합니다.
          <code>pageIndex</code>를 gradient ID에 포함시켜 페이지별로 고유하게 만듭니다.
        </p>
      </Callout>

      <h2>데이터 청크 함수</h2>
      <CodeBlock
        language="tsx"
        code={`function chunkChartData<T>(data: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < data.length; i += size) {
    chunks.push(data.slice(i, i + size));
  }
  return chunks;
}

// 예시: 14일 데이터, pageSize=5
// → [[1,2,3,4,5], [6,7,8,9,10], [11,12,13,14]]
// → initialSlide=2 (마지막 페이지부터 시작)`}
      />

      <h2>차트 타입별 조건부 렌더링</h2>
      <CodeBlock
        filename="useMetricChartContent.tsx"
        language="tsx"
        code={`export function useMetricChartContent(detail: MetricDetail) {
  const { graphType, data, goodRanges, unit } = detail;

  // 차트 타입에 따라 다른 컴포넌트 반환
  switch (graphType) {
    case GraphType.B:  // 이중 라인 (혈압 등)
      return (
        <ChartSwiper
          data={data}
          pageSize={5}
          renderChart={(pageData, idx) => (
            <ChartDualLine
              data={pageData}
              ranges={goodRanges}
              gradientId={\`dual-\${idx}\`}
            />
          )}
        />
      );

    case GraphType.D:  // 막대 차트 (걸음수 등)
      return (
        <ChartSwiper
          data={insertWeeklyGaps(data)}  // 주간 갭 삽입
          pageSize={7}
          renderChart={(pageData, idx) => (
            <ChartBar data={pageData} unit={unit} />
          )}
        />
      );

    case GraphType.C_AREA:  // 영역 차트
      return (
        <ChartSwiper
          data={data}
          renderChart={(pageData) => (
            <ChartArea data={pageData} ranges={goodRanges} />
          )}
        />
      );

    default:
      return null;
  }
}`}
        highlight={[5, 8, 9, 10, 22, 23, 24]}
      />

      <h2>Lazy Data Fetching과 조합</h2>
      <p>
        차트 데이터는 탭/기간 전환 시 enabled 옵션으로 지연 로딩합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`export function useGetMsmtDetail(
  params: MsmtDetailRequest,
  enabled: boolean
) {
  return useQuery({
    ...dataQueries.metric(params),
    enabled,  // 탭이 활성화될 때만 fetch
  });
}

// select에서 데이터 변환
metric: (params) => queryOptions({
  queryKey: [...dataQueries.all(), 'metric', params],
  queryFn: () => dataApi.getMsmtDetail(params),
  select: response => {
    const sorted = sortByKey(response.data.data);
    const isDual = MESURE_CHART_TYPE[params.mesureCode] === GraphType.B;

    return {
      ...response.data,
      data: sorted,
      singleData: isDual ? [] : toSingleData(sorted),
      dualData: isDual ? toDualData(sorted) : [],
    };
  },
})`}
        highlight={[7, 15, 16, 17, 21, 22]}
      />
    </DocLayout>
  );
}
