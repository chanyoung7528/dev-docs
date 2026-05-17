import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function RechartsPage() {
  return (
    <DocLayout
      title="Recharts 커스텀 차트"
      description="Recharts를 활용한 건강 데이터 시각화 패턴입니다."
    >
      <h2>커스텀 차트 구성요소</h2>
      <p>
        프로젝트의 차트는 기본 Recharts 컴포넌트에 다음을 추가합니다:
      </p>
      <ul>
        <li>정상 범위 표시 (ReferenceArea)</li>
        <li>터치 포인트 하이라이트</li>
        <li>커스텀 X축 라벨 (날짜 포맷)</li>
        <li>커스텀 Tooltip (단위 포함)</li>
        <li>Gradient fill</li>
      </ul>

      <h2>이중 라인 차트 (혈압)</h2>
      <CodeBlock
        filename="ChartLine.tsx"
        language="tsx"
        code={`export function ChartDualLine({
  data,
  ranges,
  gradientId,
}: ChartDualLineProps) {
  // 터치 포인트 추적 (touch는 한 단계 뒤처지므로 ref 사용)
  const activeKeyRef = useRef<string | null>(null);

  // 정상 범위 + 데이터 최대값으로 Y축 범위 계산
  const yDomain = computeYDomain(data, ranges);
  const gridLines = computeGridLines(ranges, yDomain);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart
        data={data}
        onMouseDown={(e) => {
          // 즉각적인 포인트 선택 (touchstart)
          if (e?.activeLabel) activeKeyRef.current = e.activeLabel;
        }}
      >
        {/* 정상 범위 영역 표시 */}
        {ranges.map((range, i) => (
          <ReferenceArea
            key={i}
            y1={range.min}
            y2={range.max}
            fill="var(--comfy-green-100)"
            fillOpacity={0.3}
          />
        ))}

        {/* 이중 라인 */}
        <Line
          dataKey="systolic"
          stroke="var(--red-600)"
          dot={(props) => (
            <CustomDot
              {...props}
              isActive={props.payload.key === activeKeyRef.current}
            />
          )}
        />
        <Line
          dataKey="diastolic"
          stroke="var(--blue-600)"
          dot={(props) => (
            <CustomDot
              {...props}
              isActive={props.payload.key === activeKeyRef.current}
            />
          )}
        />

        {/* 커스텀 X축 */}
        <XAxis
          dataKey="date"
          tick={({ x, y, payload }) => (
            <text x={x} y={y + 16} textAnchor="middle" fontSize={11}
              fontWeight={payload.value === activeKeyRef.current ? 700 : 400}>
              {formatDate(payload.value)}
            </text>
          )}
        />

        <Tooltip content={<CustomTooltip unit="mmHg" />} />
      </LineChart>
    </ResponsiveContainer>
  );
}`}
        highlight={[7, 17, 18, 19, 24, 25, 26, 38, 39, 40, 56, 57, 58]}
      />

      <h2>커스텀 Dot 컴포넌트</h2>
      <CodeBlock
        language="tsx"
        code={`function CustomDot({ cx, cy, isActive, stroke }: CustomDotProps) {
  if (!isActive) {
    return <circle cx={cx} cy={cy} r={3} fill={stroke} />;
  }

  // 활성 포인트: 큰 원 + 외곽선
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="white" stroke={stroke} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={3} fill={stroke} />
    </g>
  );
}`}
      />

      <h2>Gradient Fill 패턴</h2>
      <CodeBlock
        language="tsx"
        code={`// pageIndex를 포함하여 gradient ID 충돌 방지
<defs>
  <linearGradient id={\`area-gradient-\${pageIndex}\`} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="var(--comfy-green-500)" stopOpacity={0.3} />
    <stop offset="100%" stopColor="var(--comfy-green-500)" stopOpacity={0.05} />
  </linearGradient>
</defs>

<Area
  dataKey="value"
  fill={\`url(#area-gradient-\${pageIndex})\`}
  stroke="var(--comfy-green-700)"
/>`}
        highlight={[2, 3, 11]}
      />

      <Callout variant="warning" title="Swiper + Recharts gradient 충돌">
        <p>
          Swiper의 각 슬라이드에서 같은 gradient ID를 사용하면
          첫 슬라이드의 gradient만 적용됩니다.
          반드시 <code>pageIndex</code>를 ID에 포함시키세요.
        </p>
      </Callout>

      <h2>주간 갭 삽입 (막대 차트)</h2>
      <CodeBlock
        language="tsx"
        code={`// 월간 뷰에서 주 단위 구분을 위해 빈 항목 삽입
function insertWeeklyGaps(data: ChartDataItem[]): ChartDataItem[] {
  const result: ChartDataItem[] = [];

  data.forEach((item, i) => {
    result.push(item);

    // 다음 항목과 주가 다르면 빈 항목 추가
    if (i < data.length - 1) {
      const currentWeek = getWeekNumber(item.date);
      const nextWeek = getWeekNumber(data[i + 1].date);
      if (currentWeek !== nextWeek) {
        result.push({ date: '', value: null }); // 빈 막대 → 시각적 구분
      }
    }
  });

  return result;
}`}
        highlight={[10, 11, 12, 13]}
      />
    </DocLayout>
  );
}
