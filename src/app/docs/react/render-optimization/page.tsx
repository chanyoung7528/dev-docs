import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ReactRenderOptimizationPage() {
  return (
    <DocLayout
      title="렌더 최적화"
      description="React의 렌더링 과정을 이해하고 불필요한 리렌더링을 줄이는 방법을 알아봅니다."
    >
      <h2>React 렌더링 과정</h2>
      <ol>
        <li><strong>Trigger</strong>: State 변경 또는 부모 리렌더링</li>
        <li><strong>Render</strong>: 컴포넌트 함수 호출, Virtual DOM 생성</li>
        <li><strong>Commit</strong>: 실제 DOM 업데이트 (변경된 부분만)</li>
      </ol>
      <p>
        &quot;리렌더링&quot;은 컴포넌트 함수가 다시 호출되는 것이지,
        실제 DOM이 다시 그려지는 것이 아닙니다. React는 Virtual DOM을
        비교하여 변경된 부분만 실제 DOM에 반영합니다.
      </p>

      <h2>리렌더링이 발생하는 경우</h2>
      <ul>
        <li>컴포넌트의 State가 변경됨</li>
        <li>부모 컴포넌트가 리렌더링됨</li>
        <li>Context 값이 변경됨</li>
      </ul>

      <Callout variant="note">
        <p>
          Props가 변경되면 리렌더링된다고 흔히 알려져 있지만,
          정확히는 <strong>부모가 리렌더링되면 자식도 리렌더링</strong>됩니다.
          Props 변경 여부와 무관합니다 (memo 사용 시 제외).
        </p>
      </Callout>

      <h2>React Compiler (프로젝트 적용)</h2>
      <p>
        프로젝트에서는 <strong>React Compiler</strong>를 사용합니다.
        Compiler가 빌드 시점에 자동으로 메모이제이션을 적용하므로
        수동 최적화가 대부분 불필요합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// React Compiler 이전: 수동 최적화 필요
const MemoizedChild = memo(function Child({ name }: { name: string }) {
  return <div>{name}</div>;
});

const handleClick = useCallback(() => {
  // ...
}, []);

const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);

// React Compiler 이후: 자동 최적화
// memo, useCallback, useMemo 불필요
function Child({ name }: { name: string }) {
  return <div>{name}</div>;
}

function handleClick() {
  // ...
}

const expensiveValue = heavyComputation(data);`}
        highlight={[16, 17, 18]}
      />

      <Callout variant="warning">
        <p>
          프로젝트 규칙: <code>memo</code>, <code>useCallback</code>,{" "}
          <code>forwardRef</code>를 사용하지 않습니다.
          React Compiler가 자동으로 처리합니다.
        </p>
      </Callout>

      <h2>여전히 중요한 최적화</h2>
      <p>Compiler가 해결하지 못하는 구조적 최적화입니다.</p>

      <h3>1. State를 사용하는 컴포넌트로 내리기</h3>
      <CodeBlock
        language="tsx"
        code={`// 나쁨: 전체 페이지가 리렌더링
function Page() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <ExpensiveComponent />
      <button onClick={() => setIsOpen(true)}>열기</button>
      {isOpen && <Modal />}
    </div>
  );
}

// 좋음: State를 사용하는 부분만 분리
function Page() {
  return (
    <div>
      <ExpensiveComponent />
      <ModalTrigger />
    </div>
  );
}

function ModalTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>열기</button>
      {isOpen && <Modal />}
    </>
  );
}`}
        highlight={[14, 24]}
      />

      <h3>2. Zustand selector로 구독 최소화</h3>
      <CodeBlock
        language="tsx"
        code={`// 나쁨: store 전체 구독 → 어떤 값이든 변경되면 리렌더링
const store = useAlertStore();

// 좋음: 필요한 값만 구독
const isOpen = useAlertStore(s => s.isOpen);
const options = useAlertStore(s => s.options);`}
        highlight={[5, 6]}
      />

      <h3>3. children 패턴으로 리렌더링 격리</h3>
      <CodeBlock
        language="tsx"
        code={`// children은 부모에서 이미 생성된 React Element
// ScrollTracker가 리렌더링되어도 children은 영향 없음
function ScrollTracker({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    function handleScroll() { setScrollY(window.scrollY); }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      <header data-scrolled={scrollY > 0 || undefined}>헤더</header>
      {children}  {/* 리렌더링 안 됨 */}
    </div>
  );
}`}
        highlight={[15]}
      />
    </DocLayout>
  );
}
