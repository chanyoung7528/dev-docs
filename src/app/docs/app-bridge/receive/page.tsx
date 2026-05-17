import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function AppBridgeReceivePage() {
  return (
    <DocLayout
      title="수신: useNativeMessage"
      description="Flutter 앱에서 웹으로 보내는 메시지를 수신하는 Hook입니다."
    >
      <h2>useNativeMessage 구현</h2>
      <CodeBlock
        filename="useNativeMessage.ts"
        language="tsx"
        code={`export function useNativeMessage<T = unknown>(
  action: BridgeActionType | (string & {}),
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
        logger.debug('[useNativeMessage] Failed to parse message data');
      }
    }

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [action]);
}`}
        highlight={[6, 7, 8, 14, 15, 18, 19, 25, 26]}
      />

      <h2>메시지 형식</h2>
      <p>
        Flutter에서 <code>window.postMessage()</code>로 보내는 메시지 형식입니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// Flutter → Web 메시지 형식
interface BridgeMessage<T = unknown> {
  type: string;      // BRIDGE_ACTION 상수와 매칭
  payload: T;        // 데이터
}

// 예시: NICE 본인인증 결과
{
  type: 'niceAuthResult',
  payload: {
    success: true,
    name: '김철수',
    phone: '010-1234-5678',
    ci: 'encrypted_ci_value',
    di: 'encrypted_di_value',
  }
}`}
      />

      <h2>사용 예시</h2>
      <CodeBlock
        language="tsx"
        code={`// 본인인증 결과 수신
function NiceAuthPage() {
  const [result, setResult] = useState<NiceAuthResult | null>(null);

  useNativeMessage<NiceAuthResult>(
    BRIDGE_ACTION.NICE_AUTH_RESULT,
    (payload) => {
      setResult(payload);
      if (payload.success) {
        handleAuthSuccess(payload);
      } else {
        handleAuthFailure(payload.errorMessage);
      }
    }
  );

  return <div>{/* UI */}</div>;
}

// 앱 상태 변화 수신 (foreground/background)
function useAppStateSync() {
  useNativeMessage<{ state: 'foreground' | 'background' }>(
    BRIDGE_ACTION.APP_STATE_CHANGE,
    ({ state }) => {
      if (state === 'foreground') {
        queryClient.refetchQueries();  // 포그라운드 복귀 시 데이터 갱신
      }
    }
  );
}`}
        highlight={[5, 6, 22, 23]}
      />

      <Callout variant="note" title="callbackRef 패턴의 중요성">
        <p>
          <code>useNativeMessage</code>의 콜백을 직접 useEffect 의존성에 넣으면,
          부모가 리렌더링될 때마다 리스너가 해제/재등록됩니다.
          <code>callbackRef</code>로 최신 콜백을 참조하되 리스너는 유지합니다.
        </p>
      </Callout>

      <h2>타입 안전한 사용</h2>
      <CodeBlock
        language="tsx"
        code={`// 각 액션별 payload 타입 정의
interface NiceAuthResult {
  success: boolean;
  name?: string;
  phone?: string;
  ci?: string;
  di?: string;
  errorMessage?: string;
}

interface PushNotificationPayload {
  title: string;
  body: string;
  route?: string;
}

// 제네릭으로 타입 안전하게 사용
useNativeMessage<NiceAuthResult>(BRIDGE_ACTION.NICE_AUTH_RESULT, (result) => {
  // result는 NiceAuthResult 타입
});`}
        highlight={[19]}
      />
    </DocLayout>
  );
}
