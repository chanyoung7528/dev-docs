import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function DiscriminatedUnionsPage() {
  return (
    <DocLayout
      title="Discriminated Union"
      description="공통 판별자(discriminant) 속성으로 유니온 타입을 안전하게 분기하는 패턴입니다."
    >
      <h2>기본 개념</h2>
      <p>
        Discriminated Union(판별 유니온)은 모든 멤버가 공통된 리터럴 속성을
        가지는 유니온 타입입니다. 이 공통 속성(판별자)으로{" "}
        <code>switch</code>나 <code>if</code>를 사용하면 TypeScript가
        자동으로 타입을 좁혀줍니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`// 'status' 속성이 판별자(discriminant)
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// 각 상태에서 접근 가능한 속성이 다름
function render(state: RequestState<User>) {
  switch (state.status) {
    case 'idle':
      return <p>검색어를 입력하세요</p>;
    case 'loading':
      return <Spinner />;
    case 'success':
      return <UserCard user={state.data} />;   // data 접근 가능 ✅
    case 'error':
      return <ErrorMsg message={state.error} />; // error 접근 가능 ✅
  }
}`}
        highlight={[2, 10, 16, 18]}
      />

      <Callout variant="note">
        <p>
          핵심: <code>success</code> 상태에서만 <code>data</code>가 존재하고,{" "}
          <code>error</code> 상태에서만 <code>error</code>가 존재합니다.
          TypeScript가 이를 컴파일 타임에 보장합니다.
        </p>
      </Callout>

      <h2>실무 패턴: API 응답 처리</h2>

      <CodeBlock
        filename="useApi.ts"
        language="typescript"
        code={`type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; updatedAt: Date }
  | { status: 'error'; error: string; retryCount: number };

function useFundDetail(fundId: string) {
  const [state, setState] = useState<AsyncState<Fund>>({ status: 'idle' });

  const fetchFund = async () => {
    setState({ status: 'loading' });

    try {
      const data = await api.getFund(fundId);
      setState({ status: 'success', data, updatedAt: new Date() });
    } catch (e) {
      setState({
        status: 'error',
        error: e instanceof Error ? e.message : '알 수 없는 오류',
        retryCount: state.status === 'error' ? state.retryCount + 1 : 0,
      });
    }
  };

  return { state, fetchFund };
}`}
        highlight={[1, 11, 15, 17]}
      />

      <h2>액션 패턴 (Reducer)</h2>
      <p>
        <code>useReducer</code>에서 액션 타입을 Discriminated Union으로
        정의하면, 각 액션의 payload 타입이 자동으로 좁혀집니다.
      </p>

      <CodeBlock
        filename="reducer.ts"
        language="typescript"
        code={`// 'type' 속성이 판별자
type FundAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_FUNDS'; payload: Fund[] }
  | { type: 'ADD_FUND'; payload: Fund }
  | { type: 'DELETE_FUND'; payload: { id: string } }
  | { type: 'SET_ERROR'; payload: string };

interface FundState {
  funds: Fund[];
  loading: boolean;
  error: string | null;
}

function fundReducer(state: FundState, action: FundAction): FundState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_FUNDS':
      // action.payload는 Fund[] ✅
      return { ...state, funds: action.payload, loading: false };
    case 'ADD_FUND':
      // action.payload는 Fund ✅
      return { ...state, funds: [...state.funds, action.payload] };
    case 'DELETE_FUND':
      // action.payload는 { id: string } ✅
      return {
        ...state,
        funds: state.funds.filter(f => f.id !== action.payload.id),
      };
    case 'SET_ERROR':
      // action.payload는 string ✅
      return { ...state, error: action.payload, loading: false };
  }
}`}
        highlight={[2, 16, 21, 24, 27, 33]}
      />

      <h2>이벤트 시스템</h2>

      <CodeBlock
        filename="events.ts"
        language="typescript"
        code={`// 브릿지 메시지 이벤트 시스템
type NativeEvent =
  | { type: 'TOKEN_REFRESH'; payload: { token: string; expiresIn: number } }
  | { type: 'PUSH_RECEIVED'; payload: { title: string; body: string; deepLink?: string } }
  | { type: 'BIOMETRIC_RESULT'; payload: { success: boolean; errorCode?: string } }
  | { type: 'APP_STATE'; payload: { state: 'foreground' | 'background' } };

// 특정 이벤트 타입의 payload만 추출
type EventPayload<T extends NativeEvent['type']> =
  Extract<NativeEvent, { type: T }>['payload'];

// EventPayload<'TOKEN_REFRESH'> → { token: string; expiresIn: number }
// EventPayload<'BIOMETRIC_RESULT'> → { success: boolean; errorCode?: string }

// 타입 안전한 이벤트 핸들러
function onNativeEvent<T extends NativeEvent['type']>(
  type: T,
  handler: (payload: EventPayload<T>) => void
) {
  window.addEventListener('message', (event) => {
    if (event.data?.type === type) {
      handler(event.data.payload);
    }
  });
}

// 사용 — payload 타입이 자동 추론됨
onNativeEvent('TOKEN_REFRESH', (payload) => {
  setToken(payload.token);       // string ✅
  setExpiry(payload.expiresIn);  // number ✅
});

onNativeEvent('BIOMETRIC_RESULT', (payload) => {
  if (payload.success) {
    proceedToNext();
  } else {
    showError(payload.errorCode); // string | undefined ✅
  }
});`}
        highlight={[9, 10, 16, 29, 34]}
      />

      <h2>exhaustive check (누락 방지)</h2>
      <p>
        <code>never</code> 타입을 활용하면 switch에서 모든 케이스를 처리했는지
        컴파일 타임에 검증할 수 있습니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`type Status = 'active' | 'inactive' | 'pending';

function getStatusLabel(status: Status): string {
  switch (status) {
    case 'active':
      return '활성';
    case 'inactive':
      return '비활성';
    case 'pending':
      return '대기중';
    default:
      // 모든 케이스를 처리했다면 여기 도달 불가 (never)
      const _exhaustive: never = status;
      return _exhaustive;
  }
}

// 나중에 Status에 'deleted'를 추가하면?
// type Status = 'active' | 'inactive' | 'pending' | 'deleted';
// → case 'deleted'가 없으므로 컴파일 에러 발생!
// → switch 누락을 컴파일 타임에 잡아줌`}
        highlight={[13, 14]}
      />

      <Callout variant="warning">
        <p>
          새로운 상태/액션을 추가했을 때 <strong>모든 분기 처리가 누락 없는지</strong>를
          컴파일러가 잡아줍니다. 금융 시스템처럼 상태 분기가 중요한 곳에서 필수 패턴입니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
