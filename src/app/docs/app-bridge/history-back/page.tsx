import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function HistoryBackPage() {
  return (
    <DocLayout
      title="히스토리 & 백버튼"
      description="Android 뒤로가기 버튼으로 오버레이를 닫는 히스토리 마커 패턴입니다."
    >
      <h2>문제</h2>
      <p>
        Android에서 뒤로가기 버튼을 누르면 WebView의{" "}
        <code>history.back()</code>이 호출됩니다. 바텀시트나 팝업이 열려있을 때
        페이지가 뒤로 가는 대신 오버레이가 닫혀야 자연스럽습니다.
      </p>

      <h2>히스토리 마커 패턴</h2>
      <p>
        오버레이를 열 때 <code>history.pushState</code>로 마커를 추가하고,
        뒤로가기 시 마커를 감지하여 오버레이를 닫습니다.
        URL은 변경되지 않습니다.
      </p>

      <CodeBlock
        filename="history-marker.ts"
        language="tsx"
        code={`export const BOTTOM_SHEET_HISTORY_MARKER = '__bottomsheet__';
export const POPUP_HISTORY_MARKER = '__popup__';

type HistoryMarker =
  | typeof BOTTOM_SHEET_HISTORY_MARKER
  | typeof POPUP_HISTORY_MARKER;

// 오버레이 열 때: 히스토리 항목 추가
export function pushHistoryMarker(marker: HistoryMarker): void {
  const currentState = (window.history.state ?? {}) as Record<string, unknown>;
  window.history.pushState(
    { ...currentState, [marker]: true },
    '',
    window.location.href  // URL 변경 없이 state만 추가
  );
}

// 오버레이 닫을 때: 히스토리 되돌리기
export function popHistoryMarker(marker: HistoryMarker): void {
  const currentState = (window.history.state ?? {}) as Record<string, unknown>;
  if (currentState[marker]) {
    window.history.back();
  }
}

// 현재 히스토리에 마커가 있는지 확인
export function hasHistoryMarker(marker: HistoryMarker): boolean {
  const currentState = (window.history.state ?? {}) as Record<string, unknown>;
  return Boolean(currentState[marker]);
}`}
        highlight={[9, 11, 12, 13, 14, 19, 21, 22]}
      />

      <h2>바텀시트에서 사용</h2>
      <CodeBlock
        language="tsx"
        code={`function BottomSheet({ open, onOpenChange, children }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      // 열릴 때 히스토리 마커 추가
      pushHistoryMarker(BOTTOM_SHEET_HISTORY_MARKER);
    }

    return () => {
      // 닫힐 때 히스토리 마커 제거
      popHistoryMarker(BOTTOM_SHEET_HISTORY_MARKER);
    };
  }, [open]);

  // 뒤로가기 감지 → 오버레이 닫기
  useEffect(() => {
    function handlePopState() {
      if (!hasHistoryMarker(BOTTOM_SHEET_HISTORY_MARKER) && open) {
        onOpenChange(false);
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [open, onOpenChange]);

  return (/* ... */);
}`}
        highlight={[5, 10, 17, 18]}
      />

      <h2>동작 흐름</h2>
      <CodeBlock
        language="plaintext"
        code={`[사용자] 바텀시트 열기
  ↓
history.pushState({ __bottomsheet__: true })
  ↓
[사용자] Android 뒤로가기 버튼
  ↓
popstate 이벤트 → __bottomsheet__ 없음 감지
  ↓
onOpenChange(false) → 바텀시트 닫힘
  ↓
[사용자] 다시 뒤로가기 → 실제 페이지 뒤로 이동`}
      />

      <Callout variant="tip">
        <p>
          이 패턴은 모달, 팝업, 바텀시트 등 모든 오버레이에 동일하게 적용됩니다.
          마커 상수만 다르게 정의하면 여러 오버레이를 동시에 관리할 수 있습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
