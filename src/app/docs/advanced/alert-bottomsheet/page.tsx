import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function AlertBottomSheetPage() {
  return (
    <DocLayout
      title="Alert 큐 & BottomSheet 패턴"
      description="Promise 기반 명령형 Alert/Confirm과 오버레이 z-index 관리 패턴입니다."
    >
      <h2>문제</h2>
      <p>
        Alert/Confirm은 컴포넌트에서 &ldquo;결과를 기다리는&rdquo; 형태로
        사용하고 싶지만, React에서는 모달이 선언적입니다. 또한 Alert가 연속으로
        여러 개 호출되면 하나만 보여야 하고, 이전 것이 닫힌 후 다음 것이
        나타나야 합니다.
      </p>

      <h2>Alert Store — 큐 기반</h2>

      <CodeBlock
        filename="alert.store.ts"
        language="typescript"
        code={`import { create } from 'zustand';

interface AlertOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

type ResolveCallback = (result: boolean) => void;

interface QueueItem {
  options: AlertOptions;
  resolve: ResolveCallback;
}

interface AlertStore {
  isOpen: boolean;
  options: AlertOptions;
  resolve: ResolveCallback | null;
  queue: QueueItem[];
  open: (options: AlertOptions, resolve: ResolveCallback) => void;
  next: () => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  options: { message: '' },
  resolve: null,
  queue: [],
};

export const useAlertStore = create<AlertStore>()((set, get) => ({
  ...initialState,

  open: (options, resolve) =>
    set((state) => {
      // 이미 열려있으면 큐에 추가
      if (state.isOpen) {
        return { queue: [...state.queue, { options, resolve }] };
      }
      // 바로 표시
      return { isOpen: true, options, resolve };
    }),

  next: () =>
    set((state) => {
      const [head, ...rest] = state.queue;
      if (head) {
        // 큐에서 다음 알럿 표시
        return { isOpen: true, options: head.options, resolve: head.resolve, queue: rest };
      }
      // 큐 비어있으면 닫기
      return { isOpen: false, resolve: null };
    }),

  reset: () => {
    const { resolve, queue } = get();
    // 모든 대기 중인 알럿에 false 응답
    resolve?.(false);
    queue.forEach(item => item.resolve(false));
    set(initialState);
  },
}));`}
        highlight={[40, 41, 42, 43, 49, 50, 51, 60, 61, 62]}
      />

      <h2>useAlert Hook — Promise 기반 API</h2>

      <CodeBlock
        filename="useAlert.ts"
        language="typescript"
        code={`export function useAlert() {
  const open = useAlertStore(s => s.open);

  // 단순 알림 (확인 버튼만)
  function alert(options: AlertOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      open(options, resolve);
    });
  }

  // 확인/취소 선택
  function confirm(options: AlertOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      open({ showCancel: true, ...options }, resolve);
    });
  }

  return { alert, confirm };
}

// 사용법 — async/await로 동기적 코드처럼!
async function handleDelete(id: string) {
  const confirmed = await confirm({
    title: '삭제 확인',
    message: '정말 삭제하시겠습니까?',
  });

  if (!confirmed) return; // 취소 시 여기서 리턴

  await api.delete(id);
  showToast('삭제되었습니다');
}`}
        highlight={[5, 6, 7, 12, 13, 14, 23, 24, 25, 28]}
      />

      <Callout variant="note">
        <p>
          핵심: <code>new Promise</code>의 <code>resolve</code>를 Zustand
          store에 저장합니다. Alert 컴포넌트에서 버튼 클릭 시{" "}
          <code>resolve(true/false)</code>를 호출하면, await하던 곳에서
          결과를 받습니다.
        </p>
      </Callout>

      <h2>Alert 컴포넌트</h2>

      <CodeBlock
        filename="AlertDialog.tsx"
        language="tsx"
        code={`export function AlertDialog() {
  const { isOpen, options, resolve } = useAlertStore();
  const next = useAlertStore(s => s.next);

  const handleConfirm = () => {
    resolve?.(true);  // Promise resolve
    next();           // 큐에서 다음 알럿
  };

  const handleCancel = () => {
    resolve?.(false);
    next();
  };

  return (
    <Dialog open={isOpen} onClose={handleCancel}>
      {options.title && <Dialog.Title>{options.title}</Dialog.Title>}
      <Dialog.Description>{options.message}</Dialog.Description>
      <Dialog.Actions>
        {options.showCancel && (
          <Button variant="secondary" onClick={handleCancel}>
            {options.cancelText ?? '취소'}
          </Button>
        )}
        <Button onClick={handleConfirm}>
          {options.confirmText ?? '확인'}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}

// 이 컴포넌트는 앱 루트에 한 번만 배치
// <App> → <AlertDialog /> (항상 렌더링)`}
        highlight={[5, 6, 7, 10, 11, 12]}
      />

      <h2>BottomSheet — 오버레이 z-index 관리</h2>

      <CodeBlock
        filename="useBottomSheet.ts"
        language="typescript"
        code={`// 오버레이 스택 관리: Alert, BottomSheet, Popup 간 z-index 충돌 방지
let overlayStack: string[] = [];
let currentZIndex = 1000;

function pushOverlay(type: string): number {
  overlayStack.push(type);
  currentZIndex += 10;
  return currentZIndex;
}

function popOverlay(type: string) {
  const idx = overlayStack.lastIndexOf(type);
  if (idx !== -1) overlayStack.splice(idx, 1);
  currentZIndex = 1000 + overlayStack.length * 10;
}

export function useBottomSheet() {
  const storeOpen = useBottomSheetStore(s => s.open);
  const storeClose = useBottomSheetStore(s => s.close);

  function open(options: BottomSheetOptions) {
    const isReplacing = useBottomSheetStore.getState().isOpen;
    if (isReplacing) popOverlay('bottomsheet');

    const zIndex = pushOverlay('bottomsheet');
    storeOpen(options, zIndex);

    if (!isReplacing) {
      // 모바일 백버튼으로 닫기 지원
      pushHistoryMarker('BOTTOM_SHEET');
    }
  }

  function close() {
    popOverlay('bottomsheet');
    storeClose();
    popHistoryMarker('BOTTOM_SHEET');
  }

  return { open, close };
}

// 사용
const { open } = useBottomSheet();
open({
  title: '정렬 기준',
  content: <SortOptions />,
  onConfirm: (selected) => handleSort(selected),
});`}
        highlight={[5, 6, 7, 8, 24, 25, 29, 30]}
      />

      <h2>BottomSheet — 비동기 confirm 처리</h2>

      <CodeBlock
        filename="BottomSheet.tsx"
        language="tsx"
        code={`// onConfirm이 Promise를 반환하면 자동으로 로딩 표시
async function handleConfirm() {
  if (!onConfirm) {
    onClose();
    return;
  }

  const result = onConfirm();

  // 동기 결과면 바로 닫기
  if (!(result instanceof Promise)) {
    onClose();
    return;
  }

  // 비동기 결과면 로딩 표시
  setLoading(true);
  try {
    await result;
    onClose();
  } finally {
    setLoading(false);
  }
}

// 확인 버튼 누르면 → API 호출 완료까지 로딩 → 자동 닫기`}
        highlight={[8, 11, 12, 17, 18, 19, 20]}
      />

      <Callout variant="tip">
        <p>
          <strong>패턴 요약:</strong> Zustand store로 전역 단일 인스턴스를
          관리하고, Promise로 명령형 API를 제공하고, 큐로 순차 표시하고,
          오버레이 스택으로 z-index 충돌을 방지합니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
