import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ChartTouchInteractionPage() {
  return (
    <DocLayout
      title="차트 터치 인터랙션 패턴"
      description="Recharts에서 터치/클릭으로 데이터 포인트를 선택하고 상세 정보를 표시하는 ref 기반 패턴입니다."
    >
      <h2>문제</h2>
      <p>
        Recharts의 기본 Tooltip은 터치 디바이스에서 불안정하고,
        선택한 포인트의 상세 데이터를 차트 외부(카드, 요약 영역)에
        표시해야 하는 경우가 많습니다. Recharts 내부 상태와 React 상태의
        동기화 충돌도 발생합니다.
      </p>

      <h2>해결: ref 기반 터치 트래킹</h2>
      <p>
        Recharts의 <code>onMouseMove</code> 이벤트에서 <code>activeLabel</code>을
        읽되, <strong>useRef로 즉시 비교</strong>하여 불필요한 리렌더를 방지합니다.
        상태 업데이트는 실제 변경이 있을 때만 수행합니다.
      </p>

      <CodeBlock
        filename="ChartLine.tsx"
        language="tsx"
        code={`import { useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, ReferenceArea } from 'recharts';

interface ChartLineProps {
  data: ChartDualValueData[];
  goodRange?: { min: number; max: number };
  onPointClick?: (key: string) => void;
  selectedKey?: string | null;
}

export function ChartLine({ data, goodRange, onPointClick, selectedKey }: ChartLineProps) {
  // 핵심: ref로 현재 선택된 키를 추적 (리렌더 없이)
  const activeKeyRef = useRef<string | null>(null);

  const handleMouseMove = (state: any) => {
    const key = state?.activeLabel;
    // 같은 포인트를 다시 터치한 경우 무시
    if (key && activeKeyRef.current !== key) {
      activeKeyRef.current = key;
      onPointClick?.(key);  // 부모에게 선택 알림
    }
  };

  return (
    <LineChart
      data={data}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { activeKeyRef.current = null; }}
    >
      <XAxis dataKey="key" />
      <YAxis />

      {/* 정상 범위 배경 */}
      {goodRange && (
        <ReferenceArea
          y1={goodRange.min}
          y2={goodRange.max}
          fill="var(--color-good-range)"
          fillOpacity={0.1}
        />
      )}

      {/* 이중 라인 (수축기/이완기 혈압 등) */}
      <Line
        dataKey="primary"
        stroke="var(--color-primary)"
        dot={(props) => (
          <ChartDot
            {...props}
            isLatest={props.index === data.length - 1}
            isSelected={data[props.index]?.key === selectedKey}
          />
        )}
      />
      <Line
        dataKey="secondary"
        stroke="var(--color-secondary)"
        dot={(props) => (
          <ChartDot
            {...props}
            isLatest={props.index === data.length - 1}
            isSelected={data[props.index]?.key === selectedKey}
          />
        )}
      />
    </LineChart>
  );
}`}
        highlight={[13, 17, 18, 19, 20, 49, 50, 51]}
      />

      <Callout variant="note">
        <p>
          <strong>왜 useState 대신 useRef?</strong> Recharts의{" "}
          <code>onMouseMove</code>는 터치 드래그 중 초당 수십 번 호출됩니다.
          useState로 매번 상태를 업데이트하면 리렌더 폭탄이 됩니다.
          ref로 현재 값을 비교하고, 실제 변경 시에만 콜백을 호출합니다.
        </p>
      </Callout>

      <h2>커스텀 Dot 컴포넌트</h2>

      <CodeBlock
        filename="ChartDot.tsx"
        language="tsx"
        code={`interface ChartDotProps {
  cx: number;
  cy: number;
  isLatest: boolean;
  isSelected: boolean;
  color?: string;
}

// 일반 점: 작은 원
export function ChartDotRegular({ cx, cy }: ChartDotProps) {
  return <circle cx={cx} cy={cy} r={3} fill="var(--color-gray-300)" />;
}

// 최신/선택 점: 큰 원 + 흰색 중심 + 컬러 테두리
export function ChartDotLatest({ cx, cy, color = 'var(--color-primary)' }: ChartDotProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="white" />
      <circle cx={cx} cy={cy} r={6} fill="none" stroke={color} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={2} fill={color} />
    </g>
  );
}

// 조건부 렌더링
export function ChartDot(props: ChartDotProps) {
  if (props.isLatest || props.isSelected) {
    return <ChartDotLatest {...props} />;
  }
  return <ChartDotRegular {...props} />;
}`}
        highlight={[27, 28, 29]}
      />

      <h2>포인트 선택 훅 (usePointSelection)</h2>

      <CodeBlock
        filename="usePointSelection.ts"
        language="typescript"
        code={`interface PointSelectionReturn {
  selectedKey: string | null;
  onPointClick: (key: string) => void;
  measurement: MeasurementDetail | null;
  resetSelection: () => void;
}

export function usePointSelection(
  data: MeasurementDetail[] | undefined,
  defaultDisplay: string
): PointSelectionReturn {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // 선택된 포인트의 상세 데이터
  const measurement = useMemo(() => {
    if (!data?.length) return null;
    if (!selectedKey) return data[data.length - 1]; // 기본: 최신 데이터

    return data.find(d => d.key === selectedKey) ?? data[data.length - 1];
  }, [data, selectedKey]);

  const onPointClick = useCallback((key: string) => {
    setSelectedKey(prev => prev === key ? null : key); // 토글
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedKey(null);
  }, []);

  return { selectedKey, onPointClick, measurement, resetSelection };
}`}
        highlight={[12, 16, 17, 19, 23, 24]}
      />

      <h2>차트 카드 조합 (ChartCardShell)</h2>
      <p>
        Accordion으로 차트를 감싸서 접기/펼치기를 지원하고,
        펼칠 때 데이터를 지연 로딩합니다.
      </p>

      <CodeBlock
        filename="ChartCardShell.tsx"
        language="tsx"
        code={`interface ChartCardShellProps {
  header: React.ReactNode;
  chart: React.ReactNode;
  summary?: React.ReactNode;
  isEmpty?: boolean;
  defaultExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

export function ChartCardShell({
  header, chart, summary, isEmpty, defaultExpanded, onExpandChange
}: ChartCardShellProps) {
  // 빈 상태: 아코디언 없이 헤더 + CTA 버튼만
  if (isEmpty) {
    return (
      <div>
        {header}
        <ChartEmptyAction />
      </div>
    );
  }

  return (
    <Accordion.Root
      defaultValue={defaultExpanded ? [0] : []}
      onValueChange={(values) => onExpandChange?.(values.includes(0))}
    >
      <Accordion.Item value={0}>
        <Accordion.Header>
          <Accordion.Trigger>{header}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          {chart}
          {summary}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}

// 사용: onExpandChange에서 데이터 fetch를 트리거
// → 닫혀있을 때는 API 호출 안 함 (지연 로딩)`}
        highlight={[14, 26, 27]}
      />

      <Callout variant="tip">
        <p>
          <strong>패턴 요약:</strong> ref로 터치 추적 → 콜백으로 선택 전달 →
          커스텀 Dot으로 시각적 피드백 → Accordion으로 지연 로딩.
          이 조합이 모바일 차트 UX의 핵심입니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
