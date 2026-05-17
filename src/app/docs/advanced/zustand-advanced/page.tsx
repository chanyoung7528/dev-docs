import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ZustandAdvancedPage() {
  return (
    <DocLayout
      title="Zustand 고급 패턴"
      description="devtools, persist, 선택적 구독 등 Zustand 심화 패턴입니다."
    >
      <h2>devtools 미들웨어</h2>
      <p>
        Redux DevTools에서 Zustand 상태를 디버깅할 수 있습니다.
        각 액션에 이름을 붙여 추적합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useAlertStore = create<AlertStore>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      options: {},
      queue: [],

      open: (options, resolve) =>
        set(
          state => ({/* ... */}),
          undefined,
          'open'       // DevTools에 표시될 액션 이름
        ),

      next: () =>
        set(
          state => ({/* ... */}),
          undefined,
          'next'       // 액션 이름
        ),
    }),
    {
      name: 'AlertStore',     // DevTools에 표시될 스토어 이름
      enabled: isDebug,       // 프로덕션에서 비활성화
    }
  )
);`}
        highlight={[5, 15, 23, 27, 28]}
      />

      <h2>persist: 선택적 영속화</h2>
      <p>
        게시판 폼에서 작성 중인 내용을 sessionStorage에 저장합니다.
        단, 첨부파일(Blob)은 직렬화할 수 없으므로 제외합니다.
      </p>

      <CodeBlock
        filename="board.store.ts"
        language="tsx"
        code={`import { persist, createJSONStorage } from 'zustand/middleware';

export const useBoardStore = create<BoardStore>()(
  persist(
    (set) => ({
      postFormData: {
        bbcTtl: '',
        bbcCont: '',
        tempFiles: [],  // Blob 포함 → 직렬화 불가
      },

      setFormField: (field, value) =>
        set(state => ({
          postFormData: { ...state.postFormData, [field]: value },
        })),

      resetForm: () =>
        set({ postFormData: { bbcTtl: '', bbcCont: '', tempFiles: [] } }),
    }),
    {
      name: 'board-storage',
      storage: createJSONStorage(() => sessionStorage),

      // 텍스트 필드만 선택적으로 저장 (파일 제외)
      partialize: (state): PersistedState => ({
        postFormData: {
          bbcTtl: state.postFormData.bbcTtl,
          bbcCont: state.postFormData.bbcCont,
          // tempFiles 제외!
        },
      }),

      // 복원 시 커스텀 병합 (기본값과 저장된 값 합치기)
      merge: (persisted, current) => ({
        ...current,
        postFormData: {
          ...current.postFormData,
          ...(persisted as PersistedState).postFormData,
        },
      }),
    }
  )
);`}
        highlight={[22, 25, 26, 27, 28, 34, 35, 36, 37, 38]}
      />

      <Callout variant="note" title="partialize vs merge">
        <p>
          <code>partialize</code>: 어떤 값을 저장할지 선택합니다 (직렬화 시).
          <br />
          <code>merge</code>: 저장된 값을 현재 상태에 어떻게 합칠지 정의합니다
          (역직렬화 시).
        </p>
      </Callout>

      <h2>선택적 구독 (Selector)</h2>
      <p>
        Store의 특정 값만 구독하면 해당 값이 변경될 때만 리렌더링됩니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 나쁨: 전체 스토어 구독 → 모든 변경에 리렌더링
const store = useAlertStore();

// 좋음: 필요한 값만 구독
const isOpen = useAlertStore(s => s.isOpen);
const options = useAlertStore(s => s.options);

// 좋음: 여러 값을 하나의 selector로
const { isOpen, options } = useAlertStore(
  s => ({ isOpen: s.isOpen, options: s.options })
);

// 컴포넌트 외부에서 상태 읽기 (구독 없이)
const { resolve } = useAlertStore.getState();`}
        highlight={[5, 6, 9, 10, 14]}
      />

      <h2>Store + Hook + Provider 3파일 패턴</h2>
      <CodeBlock
        language="plaintext"
        code={`shared/stores/alert.store.ts    → Zustand Store (상태 + 액션)
shared/hooks/useAlert.ts        → Hook (Promise API 래퍼)
shared/providers/AlertProvider.tsx → Provider (UI 렌더링)`}
      />

      <table>
        <thead>
          <tr>
            <th>파일</th>
            <th>역할</th>
            <th>의존성</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Store</td>
            <td>순수 상태 관리</td>
            <td>없음</td>
          </tr>
          <tr>
            <td>Hook</td>
            <td>컴포넌트에서 사용하는 API</td>
            <td>Store</td>
          </tr>
          <tr>
            <td>Provider</td>
            <td>Store 구독 + UI 렌더링</td>
            <td>Store + UI 컴포넌트</td>
          </tr>
        </tbody>
      </table>
    </DocLayout>
  );
}
