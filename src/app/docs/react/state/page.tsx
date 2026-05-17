import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ReactStatePage() {
  return (
    <DocLayout
      title="State 관리"
      description="컴포넌트가 사용자 인터랙션에 반응하려면 State가 필요합니다."
    >
      <h2>State란?</h2>
      <p>
        State는 컴포넌트가 &quot;기억&quot;해야 하는 데이터입니다. Props가
        부모로부터 전달받는 읽기 전용 데이터라면, State는 컴포넌트 내부에서
        변경할 수 있는 데이터입니다.
      </p>
      <p>
        State가 변경되면 React는 해당 컴포넌트를 <strong>리렌더링</strong>
        합니다. 이것이 UI가 업데이트되는 핵심 메커니즘입니다.
      </p>

      <h2>클라이언트 상태 vs 서버 상태</h2>
      <p>프론트엔드에서 다루는 상태는 크게 두 가지로 나뉩니다.</p>

      <table>
        <thead>
          <tr>
            <th>구분</th>
            <th>클라이언트 상태</th>
            <th>서버 상태</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>소유자</td>
            <td>브라우저</td>
            <td>서버 (DB)</td>
          </tr>
          <tr>
            <td>예시</td>
            <td>모달 열림, 폼 입력, 테마</td>
            <td>유저 정보, 게시글 목록</td>
          </tr>
          <tr>
            <td>관리 도구</td>
            <td>useState, Zustand</td>
            <td>TanStack Query</td>
          </tr>
          <tr>
            <td>동기화</td>
            <td>필요 없음</td>
            <td>서버와 지속적으로 동기화 필요</td>
          </tr>
        </tbody>
      </table>

      <h3>실전 적용: Alert Store (Zustand)</h3>
      <p>
        프로젝트에서 전역 Alert/Confirm을 Zustand로 관리합니다.
        큐(queue) 패턴으로 여러 알림이 순차적으로 표시됩니다.
      </p>

      <CodeBlock
        filename="alert.store.ts"
        language="tsx"
        code={`export const useAlertStore = create<AlertStore>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      options: {},
      queue: [],
      resolve: null,

      open: (options, resolve) =>
        set(state => {
          // 이미 열려있으면 큐에 추가
          if (state.isOpen) {
            return { queue: [...state.queue, { options, resolve }] };
          }
          return { isOpen: true, options, resolve };
        }),

      next: () =>
        set(state => {
          const [head, ...rest] = state.queue;
          if (head) {
            return { isOpen: true, options: head.options, resolve: head.resolve, queue: rest };
          }
          return { isOpen: false, resolve: null };
        }),
    }),
    { name: 'AlertStore' }
  )
);`}
        highlight={[11, 12, 13]}
      />

      <h3>Promise 기반 Hook 래퍼</h3>
      <p>Store를 직접 사용하는 대신, Hook으로 감싸 Promise 기반 API를 제공합니다.</p>

      <CodeBlock
        filename="useAlert.ts"
        language="tsx"
        code={`export function useAlert() {
  const open = useAlertStore(s => s.open);

  function alert(options: AlertOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      open(options, resolve);
    });
  }

  function confirm(options: AlertOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      open({ showCancel: true, ...options }, resolve);
    });
  }

  return { alert, confirm };
}

// 사용 예시
const { confirm } = useAlert();

async function handleDelete() {
  const ok = await confirm({ title: '정말 삭제할까요?' });
  if (ok) deleteItem();
}`}
        highlight={[4, 5, 6, 23, 24]}
      />

      <Callout variant="tip">
        <p>
          이 패턴은 <strong>Store + Hook + Provider</strong> 3파일 구조입니다.
          Store가 상태를 관리하고, Hook이 편리한 API를 제공하고, Provider가
          Store를 구독하여 UI를 렌더링합니다.
        </p>
      </Callout>

      <h2>State 설계 원칙</h2>
      <ul>
        <li>
          <strong>최소한의 State</strong>: 다른 State나 Props에서 계산 가능한
          값은 State로 만들지 않습니다.
        </li>
        <li>
          <strong>적절한 위치</strong>: State를 사용하는 컴포넌트 중 가장 가까운
          공통 부모에 배치합니다.
        </li>
        <li>
          <strong>서버 상태 분리</strong>: API 데이터는 useState가 아닌 TanStack
          Query로 관리합니다.
        </li>
      </ul>
    </DocLayout>
  );
}
