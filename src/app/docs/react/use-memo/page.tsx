import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ReactUseMemoPage() {
  return (
    <DocLayout
      title="useMemo & useCallback"
      description="비용이 큰 계산을 캐싱하고, 함수 참조를 안정적으로 유지하는 Hook입니다."
    >
      <h2>useMemo</h2>
      <p>
        <code>useMemo</code>는 의존성이 변경되지 않으면 이전 계산 결과를
        재사용합니다. 비용이 큰 계산에만 사용하세요.
      </p>

      <CodeBlock
        language="tsx"
        code={`const filteredList = useMemo(() => {
  return items.filter(item => item.category === selectedCategory);
}, [items, selectedCategory]);

// selectedCategory가 변경되지 않으면 이전 결과 재사용`}
        highlight={[3]}
      />

      <h2>useCallback</h2>
      <p>
        <code>useCallback</code>은 함수의 참조를 캐싱합니다. 자식 컴포넌트에
        콜백을 전달할 때 불필요한 리렌더링을 방지합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// useCallback은 useMemo의 함수 전용 축약형
const handleClick = useCallback(() => {
  setCount(prev => prev + 1);
}, []);

// 위는 아래와 동일
const handleClick = useMemo(() => {
  return () => setCount(prev => prev + 1);
}, []);`}
      />

      <Callout variant="warning" title="React 19 + Compiler에서는?">
        <p>
          프로젝트는 <strong>React Compiler</strong>를 사용합니다.
          Compiler가 자동으로 메모이제이션을 처리하므로{" "}
          <code>useMemo</code>, <code>useCallback</code>, <code>memo</code>를
          수동으로 작성할 필요가 없습니다.
          개념은 알아두되, 프로젝트에서는 사용하지 않습니다.
        </p>
      </Callout>

      <h2>실전 패턴: 파생 상태 계산</h2>
      <p>
        프로젝트에서 폼 유효성 검사 결과를 파생 상태로 계산하는 예시입니다.
        React Compiler가 있으므로 useMemo 없이 직접 계산합니다.
      </p>

      <CodeBlock
        filename="useInputValidation.ts"
        language="tsx"
        code={`export function useInputValidation<T extends FieldValues>({
  name,
  control,
  validationRules = [],
}: UseInputValidationProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const { field, fieldState: { error } } = useController({ name, control });

  // 파생 상태: useMemo 없이 직접 계산
  // React Compiler가 자동으로 최적화
  const hasValue = String(field.value ?? '').length > 0;
  const hasError = !!error && isTouched;

  const ruleResults = validationRules.map(rule => ({
    ...rule,
    passed: rule.check(field.value ?? ''),
  }));

  const allRulesPassed = ruleResults.every(rule => rule.passed);

  return {
    field, error, isFocused, isTouched,
    hasValue, hasError, ruleResults, allRulesPassed,
  };
}`}
        highlight={[13, 14, 16, 17, 18, 19, 21]}
      />

      <h2>언제 사용해야 할까?</h2>
      <table>
        <thead>
          <tr>
            <th>상황</th>
            <th>필요?</th>
            <th>이유</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>React Compiler 사용 시</td>
            <td>불필요</td>
            <td>자동 메모이제이션</td>
          </tr>
          <tr>
            <td>간단한 계산</td>
            <td>불필요</td>
            <td>메모이제이션 오버헤드가 더 큼</td>
          </tr>
          <tr>
            <td>대량 데이터 필터/정렬</td>
            <td>고려</td>
            <td>O(n) 이상 계산 캐싱 효과</td>
          </tr>
          <tr>
            <td>참조 안정성 필요</td>
            <td>고려</td>
            <td>useEffect 의존성 등</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="tip">
        <p>
          <strong>성능 문제가 실제로 발생한 후에</strong> useMemo/useCallback을
          추가하세요. 섣부른 최적화는 코드 복잡도만 높이고 실제 효과는 미미합니다.
          React Compiler를 사용하면 대부분의 경우 자동으로 처리됩니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
