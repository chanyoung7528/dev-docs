import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function NativeBridgePatternPage() {
  return (
    <DocLayout
      title="네이티브 브릿지 실무 패턴"
      description="Flutter WebView와 웹 앱 간 양방향 통신의 실전 구현 패턴입니다."
    >
      <h2>아키텍처</h2>

      <CodeBlock
        language="text"
        code={`┌─────────────────────────────────┐
│     Flutter App Shell           │
│  ┌───────────────────────────┐  │
│  │       WebView             │  │
│  │  ┌─────────────────────┐  │  │
│  │  │   React/Next.js     │  │  │
│  │  │                     │  │  │
│  │  │   nativeBridge.send │──────→ FlutterWebView.postMessage
│  │  │   useNativeMessage  │←──────  window.postMessage
│  │  │   nativeBridge.call │──────→ WellfyApp.callHandler
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

2가지 통신 방식:
1. send (단방향): 웹 → 네이티브 알림 (응답 불필요)
2. call (양방향): 웹 → 네이티브 → 응답 반환 (Promise)`}
      />

      <h2>송신: nativeBridge.send</h2>

      <CodeBlock
        filename="native-bridge.ts"
        language="typescript"
        code={`// Window 타입 확장
declare global {
  interface Window {
    FlutterWebView?: {
      postMessage: (message: string) => void;
    };
    WellfyApp?: {
      callHandler<T>(handler: string, payload?: string): Promise<T>;
    };
  }
}

const BRIDGE_ACTION = {
  NAVIGATE: 'NAVIGATE',
  GO_BACK: 'GO_BACK',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  DOWNLOAD_FILE: 'DOWNLOAD_FILE',
} as const;

type BridgeActionType = typeof BRIDGE_ACTION[keyof typeof BRIDGE_ACTION];

// 단방향 송신 (응답 불필요)
function send<T = unknown>(action: BridgeActionType, payload?: T): void {
  if (typeof window === 'undefined') return; // SSR 방어

  try {
    const message = JSON.stringify({ type: action, payload });

    if (window.FlutterWebView) {
      window.FlutterWebView.postMessage(message);
    }
  } catch (error) {
    logger.error('[Bridge/Send]', error);
  }
}`}
        highlight={[24, 25, 28, 30, 31]}
      />

      <h2>호출: nativeBridge.call (Promise 반환)</h2>

      <CodeBlock
        language="typescript"
        code={`// 양방향 호출: 네이티브 함수 실행 후 결과 반환
async function call<T>(handler: string, payload?: unknown): Promise<T | null> {
  if (typeof window === 'undefined' || !window.WellfyApp) return null;

  try {
    const payloadStr = payload ? JSON.stringify(payload) : undefined;
    return await window.WellfyApp.callHandler<T>(handler, payloadStr);
  } catch (error) {
    logger.error('[Bridge/Call]', error);
    return null;
  }
}

// 공개 API
export const nativeBridge = {
  send,

  // 인증 관련
  notifyTokenExpired: () => send(BRIDGE_ACTION.TOKEN_EXPIRED),
  snsLogin: (provider: SnsProvider) => call<SnsLoginResult>(provider),

  // 디바이스 기능
  getHealthState: () => call<{ connected: boolean }>('GetHealthState'),
  connectHealth: () => call<{ connected: boolean }>('ConnectHealth'),

  // 파일 다운로드 (Base64 인코딩)
  downloadFile: async (blob: Blob, fileName: string) => {
    const buffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    send(BRIDGE_ACTION.DOWNLOAD_FILE, { fileName, data: base64, mimeType: blob.type });
  },

  // 네비게이션
  goBack: () => send(BRIDGE_ACTION.GO_BACK),
  navigate: (path: string) => send(BRIDGE_ACTION.NAVIGATE, { path }),
} as const;`}
        highlight={[2, 3, 7, 20, 21, 24, 25, 29, 30, 31]}
      />

      <h2>수신: useNativeMessage Hook</h2>

      <CodeBlock
        filename="useNativeMessage.ts"
        language="typescript"
        code={`export function useNativeMessage<T = unknown>(
  action: BridgeActionType,
  callback: (payload: T) => void
) {
  // callbackRef: 콜백이 바뀌어도 리스너 재등록 방지
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string'
          ? JSON.parse(event.data)
          : event.data;

        if (data?.type === action) {
          callbackRef.current(data.payload as T);
        }
      } catch {
        // 파싱 실패 무시 (다른 메시지일 수 있음)
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [action]); // action만 의존 → 리스너 안정적
}

// 사용
function TokenRefreshHandler() {
  useNativeMessage<{ token: string }>('TOKEN_REFRESH', (payload) => {
    setToken(payload.token);
  });

  return null; // UI 없음, 이벤트 리스너 역할만
}`}
        highlight={[6, 8, 9, 19, 20, 29, 34, 35]}
      />

      <Callout variant="warning">
        <p>
          <code>callbackRef</code> 패턴이 핵심입니다. 콜백이 매 렌더마다
          새로 생성되더라도 <code>addEventListener</code>/<code>removeEventListener</code>가
          재실행되지 않습니다. 의존성 배열에 callback을 넣으면 매 렌더마다
          리스너가 재등록되어 성능 문제가 발생합니다.
        </p>
      </Callout>

      <h2>실전 활용: 파일 다운로드</h2>

      <CodeBlock
        filename="useFileDownload.ts"
        language="typescript"
        code={`function useFileDownload() {
  const isNative = useIsNativeApp();

  async function download(url: string, fileName: string) {
    const response = await fetch(url);
    const blob = await response.blob();

    if (isNative) {
      // 네이티브: 브릿지로 Base64 전달 → 네이티브 다운로드
      await nativeBridge.downloadFile(blob, fileName);
    } else {
      // 웹: a 태그로 다운로드
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    }
  }

  return { download };
}

// WebView에서는 a.download가 동작하지 않는 경우가 많음
// → 네이티브 환경 감지 후 브릿지로 분기하는 것이 필수`}
        highlight={[8, 10, 12, 13, 14, 15, 16]}
      />

      <h2>환경 감지</h2>

      <CodeBlock
        language="typescript"
        code={`// 네이티브 앱 안에서 실행 중인지 감지
function useIsNativeApp(): boolean {
  return typeof window !== 'undefined' && !!window.FlutterWebView;
}

// User-Agent 기반 (대안)
function isNativeByUA(): boolean {
  return /WellfyApp/.test(navigator.userAgent);
}

// 사용
function ActionButton() {
  const isNative = useIsNativeApp();

  if (isNative) {
    return <Button onClick={() => nativeBridge.navigate('/native-page')}>이동</Button>;
  }

  return <Link href="/web-page">이동</Link>;
}`}
        highlight={[3, 8, 15, 16]}
      />
    </DocLayout>
  );
}
