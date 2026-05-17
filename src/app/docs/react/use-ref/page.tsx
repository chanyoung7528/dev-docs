import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ReactUseRefPage() {
  return (
    <DocLayout
      title="useRef"
      description="렌더링을 트리거하지 않으면서 값을 유지하는 Hook입니다."
    >
      <h2>useRef란?</h2>
      <p>
        <code>useRef</code>는 렌더링 사이에 값을 유지하면서도 변경 시
        리렌더링을 발생시키지 않는 Hook입니다. 두 가지 주요 용도가 있습니다.
      </p>
      <ul>
        <li><strong>DOM 요소 접근</strong>: input focus, 스크롤 등</li>
        <li><strong>값 저장</strong>: 타이머 ID, 이전 값, 콜백 참조 등</li>
      </ul>

      <h2>DOM 요소 접근</h2>
      <CodeBlock
        language="tsx"
        code={`function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleButtonClick() {
    inputRef.current?.focus();
  }

  return (
    <div>
      <input ref={inputRef} placeholder="검색어 입력" />
      <button onClick={handleButtonClick}>검색</button>
    </div>
  );
}`}
        highlight={[2, 5, 10]}
      />

      <h2>실전 패턴: callbackRef로 이벤트 리스너 관리</h2>
      <p>
        프로젝트의 Bottom Sheet 드래그 구현에서 사용하는 고급 패턴입니다.
        <code>ref</code>에 함수를 전달하면 DOM 요소가 마운트/언마운트될 때
        호출됩니다.
      </p>

      <CodeBlock
        filename="useDragToClose.ts"
        language="tsx"
        code={`export function useDragToClose({ enabled, onClose }: UseDragToCloseOptions) {
  // Why: 인라인 콜백 시 리스너 재등록 방지
  const enabledRef = useRef(enabled);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const cleanupRef = useRef<(() => void) | null>(null);

  // callbackRef: DOM 요소가 마운트될 때 이벤트 등록
  function popupRef(popup: HTMLDivElement | null) {
    cleanupRef.current?.();  // 이전 리스너 정리
    cleanupRef.current = null;
    if (!popup) return;

    function handleTouchStart(e: TouchEvent) {
      if (!enabledRef.current) return;
      // 드래그 시작 로직...
    }

    popup.addEventListener('touchstart', handleTouchStart, { passive: true });
    cleanupRef.current = () => {
      popup.removeEventListener('touchstart', handleTouchStart);
    };
  }

  // 컴포넌트 언마운트 시 최종 정리
  useEffect(() => {
    return () => { cleanupRef.current?.(); };
  }, []);

  return { popupRef };
}

// 사용
<div ref={popupRef} className={styles.bottomSheet}>
  {children}
</div>`}
        highlight={[12, 13, 14, 22, 23, 24, 38]}
      />

      <Callout variant="note" title="callbackRef vs useRef">
        <p>
          <code>useRef</code>는 렌더링 후 DOM에 접근합니다.
          <code>callbackRef</code>는 DOM이 마운트되는 정확한 시점에 호출되므로,
          이벤트 리스너 등록 타이밍이 정확합니다.
          조건부로 렌더링되는 요소에 특히 유용합니다.
        </p>
      </Callout>

      <h2>값 저장용 useRef</h2>
      <p>
        이전 값을 기억하거나, 렌더링과 무관한 값을 저장할 때 사용합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 이전 값 추적
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// 확인 상태 추적 (리렌더링 없이)
function AlertProviderContent() {
  const confirmedRef = useRef(false);

  function handleConfirm() {
    confirmedRef.current = true;  // 리렌더링 발생 안 함
    return options.onConfirm?.();
  }

  function handleOpenChange(open: boolean) {
    if (open) return;
    const confirmed = confirmedRef.current;
    confirmedRef.current = false;
    resolve?.(confirmed);
  }
}`}
        highlight={[3, 14, 17]}
      />

      <h2>useState vs useRef</h2>
      <table>
        <thead>
          <tr>
            <th>특성</th>
            <th>useState</th>
            <th>useRef</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>변경 시 리렌더링</td>
            <td>O</td>
            <td>X</td>
          </tr>
          <tr>
            <td>값 유지</td>
            <td>O</td>
            <td>O</td>
          </tr>
          <tr>
            <td>렌더링에 반영</td>
            <td>O (화면에 표시)</td>
            <td>X (내부 로직용)</td>
          </tr>
          <tr>
            <td>사용 예</td>
            <td>카운터, 입력값</td>
            <td>타이머 ID, DOM 참조</td>
          </tr>
        </tbody>
      </table>
    </DocLayout>
  );
}
