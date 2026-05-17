import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ReactUseEffectPage() {
  return (
    <DocLayout
      title="useEffect"
      description="컴포넌트를 외부 시스템과 동기화하는 Hook입니다."
    >
      <h2>useEffect란?</h2>
      <p>
        <code>useEffect</code>는 렌더링 이후에 실행되는 부수 효과(side effect)를
        처리합니다. API 호출, DOM 조작, 이벤트 리스너 등록 등 렌더링과 직접
        관련 없는 작업에 사용합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`useEffect(() => {
  // 부수 효과 실행

  return () => {
    // 정리(cleanup) 함수 - 컴포넌트 언마운트 또는 의존성 변경 시 실행
  };
}, [dependency1, dependency2]); // 의존성 배열`}
      />

      <h2>의존성 배열</h2>
      <table>
        <thead>
          <tr>
            <th>형태</th>
            <th>실행 시점</th>
            <th>사용 사례</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>[a, b]</code></td>
            <td>a 또는 b가 변경될 때</td>
            <td>특정 값에 반응</td>
          </tr>
          <tr>
            <td><code>[]</code></td>
            <td>마운트 시 1번만</td>
            <td>초기 설정</td>
          </tr>
          <tr>
            <td>생략</td>
            <td>매 렌더링마다</td>
            <td>거의 사용 안 함</td>
          </tr>
        </tbody>
      </table>

      <h2>실전 패턴: 이벤트 리스너 등록/해제</h2>
      <p>
        프로젝트에서 Flutter WebView의 네이티브 메시지를 수신하는 Hook입니다.
        <code>callbackRef</code> 패턴을 사용하여 콜백이 변경되어도
        리스너를 재등록하지 않습니다.
      </p>

      <CodeBlock
        filename="useNativeMessage.ts"
        language="tsx"
        code={`export function useNativeMessage<T = unknown>(
  action: BridgeActionType,
  callback: (payload: T) => void
) {
  // Why: 인라인 콜백 시 리스너 재등록 방지
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    function handler(event: MessageEvent) {
      try {
        const data = typeof event.data === 'string'
          ? JSON.parse(event.data)
          : event.data;

        if (data && data.type === action) {
          callbackRef.current(data.payload as T);
        }
      } catch {
        // 파싱 실패 무시
      }
    }

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [action]); // action만 의존성 - callback 변경 시 재등록 불필요
}`}
        highlight={[6, 7, 8, 9, 27, 28]}
      />

      <Callout variant="note" title="callbackRef 패턴">
        <p>
          콜백 함수를 <code>useRef</code>에 저장하고 매 렌더링마다 업데이트하면,
          <code>useEffect</code>의 의존성에서 콜백을 제외할 수 있습니다.
          이벤트 리스너를 불필요하게 해제/재등록하는 것을 방지합니다.
        </p>
      </Callout>

      <h2>cleanup 함수의 중요성</h2>
      <p>
        이벤트 리스너, 타이머, 구독 등은 반드시 cleanup에서 정리해야 합니다.
        그렇지 않으면 메모리 누수가 발생합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 타이머 정리
useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1);
  }, 1000);

  return () => clearInterval(id);
}, []);

// 구독 정리
useEffect(() => {
  const unsubscribe = eventEmitter.subscribe('event', handler);
  return () => unsubscribe();
}, []);`}
        highlight={[7, 13]}
      />

      <h2>useEffect를 사용하지 말아야 할 때</h2>
      <Callout variant="warning">
        <p>
          다음 경우에는 useEffect 대신 다른 방법을 사용하세요:
        </p>
      </Callout>
      <ul>
        <li>
          <strong>데이터 페칭</strong> → TanStack Query 사용
        </li>
        <li>
          <strong>이벤트에 반응</strong> → 이벤트 핸들러에서 직접 처리
        </li>
        <li>
          <strong>파생 상태 계산</strong> → 렌더링 중 직접 계산 (변수 또는 useMemo)
        </li>
        <li>
          <strong>props 변경에 반응</strong> → 렌더링 중 직접 계산
        </li>
      </ul>

      <CodeBlock
        language="tsx"
        code={`// 나쁜 예: useEffect로 파생 상태 계산
const [items, setItems] = useState([]);
const [filteredItems, setFilteredItems] = useState([]);

useEffect(() => {
  setFilteredItems(items.filter(i => i.active));
}, [items]);

// 좋은 예: 렌더링 중 직접 계산
const [items, setItems] = useState([]);
const filteredItems = items.filter(i => i.active);`}
        highlight={[11]}
      />
    </DocLayout>
  );
}
