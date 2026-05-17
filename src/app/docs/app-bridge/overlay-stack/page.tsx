import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function OverlayStackPage() {
  return (
    <DocLayout
      title="오버레이 z-index 관리"
      description="여러 오버레이가 동시에 열릴 때 z-index를 자동으로 관리하는 패턴입니다."
    >
      <h2>문제</h2>
      <p>
        Base UI의 Dialog.Portal은 <code>document.body</code>에 렌더링됩니다.
        CSS 상속을 받지 않으므로 z-index를 직접 관리해야 합니다.
        바텀시트 위에 Alert가 열리는 등 다중 오버레이 상황을 처리해야 합니다.
      </p>

      <h2>OverlayStack 유틸</h2>
      <CodeBlock
        filename="overlayStack.ts"
        language="tsx"
        code={`const BASE_Z = 1000;
const LAYER_STEP = 100;
const stack: OverlayType[] = [];

type OverlayType = 'bottomsheet' | 'alert' | 'popup' | 'toast';

// 오버레이 열릴 때: z-index 할당
export function pushOverlay(type: OverlayType): number {
  stack.push(type);
  return BASE_Z + (stack.length - 1) * LAYER_STEP;
  // 첫번째: 1000, 두번째: 1100, 세번째: 1200, ...
}

// 오버레이 닫힐 때: 스택에서 제거
export function popOverlay(type: OverlayType): void {
  const index = stack.lastIndexOf(type);
  if (index !== -1) {
    stack.splice(index, 1);
  }
}

// 현재 최상위 오버레이 확인
export function getTopOverlay(): OverlayType | null {
  return stack.length > 0 ? stack[stack.length - 1] : null;
}`}
        highlight={[1, 2, 8, 10, 11]}
      />

      <h2>사용 예시</h2>
      <CodeBlock
        language="tsx"
        code={`function BottomSheet({ open, onOpenChange, children }: Props) {
  const [zIndex, setZIndex] = useState(BASE_Z);

  useEffect(() => {
    if (open) {
      const z = pushOverlay('bottomsheet');
      setZIndex(z);
    } else {
      popOverlay('bottomsheet');
    }

    return () => popOverlay('bottomsheet');
  }, [open]);

  return (
    <Portal>
      <div style={{ zIndex }} className={styles.backdrop}>
        <div className={styles.sheet}>
          {children}
        </div>
      </div>
    </Portal>
  );
}`}
        highlight={[6, 9, 17]}
      />

      <h2>다중 오버레이 시나리오</h2>
      <CodeBlock
        language="plaintext"
        code={`[바텀시트 열림]     → z-index: 1000
  ↓
[Alert 열림]        → z-index: 1100  (바텀시트 위)
  ↓
[Alert 닫힘]        → stack에서 제거
  ↓
[Toast 표시]        → z-index: 1100  (바텀시트 위)
  ↓
[바텀시트 닫힘]     → stack 비어짐`}
      />

      <Callout variant="note">
        <p>
          <code>LAYER_STEP = 100</code>으로 여유를 두면 오버레이 내부의
          드롭다운 등에 중간 z-index(예: 1050)를 사용할 수 있습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
