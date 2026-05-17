import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function AppBridgeArchitecturePage() {
  return (
    <DocLayout
      title="브릿지 아키텍처"
      description="Flutter WebView와 웹 간의 통신 구조를 이해합니다."
    >
      <h2>하이브리드 앱 구조</h2>
      <p>
        Wellfy는 Flutter 앱 안에 WebView로 웹을 띄우는 하이브리드 구조입니다.
        웹에서 네이티브 기능(카메라, 생체인증, 본인인증 등)이 필요할 때
        브릿지를 통해 통신합니다.
      </p>

      <CodeBlock
        language="plaintext"
        code={`┌──────────────────────────────────┐
│  Flutter App (Native)            │
│  ┌────────────────────────────┐  │
│  │  WebView                   │  │
│  │  ┌──────────────────────┐  │  │
│  │  │  Next.js (Web)       │  │  │
│  │  │                      │  │  │
│  │  │  appBridge.send() ──────→ FlutterWebView.postMessage()
│  │  │                      │  │  │
│  │  │  useNativeMessage() ←────── window.postMessage()
│  │  │                      │  │  │
│  │  └──────────────────────┘  │  │
│  └────────────────────────────┘  │
│  WellfyApp.callHandler() ←──────── 동기 호출 (결과 반환)
└──────────────────────────────────┘`}
      />

      <h2>통신 방식 3가지</h2>
      <table>
        <thead>
          <tr>
            <th>방식</th>
            <th>방향</th>
            <th>특징</th>
            <th>사용 예</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>appBridge.send()</code></td>
            <td>웹 → 앱</td>
            <td>Fire & Forget</td>
            <td>화면 이동, 설정 변경</td>
          </tr>
          <tr>
            <td><code>useNativeMessage()</code></td>
            <td>앱 → 웹</td>
            <td>이벤트 수신</td>
            <td>본인인증 결과, 푸시 알림</td>
          </tr>
          <tr>
            <td><code>appBridge.call()</code></td>
            <td>웹 → 앱 → 웹</td>
            <td>Promise 반환</td>
            <td>디바이스 정보, 파일 다운로드</td>
          </tr>
        </tbody>
      </table>

      <h2>BRIDGE_ACTION 상수</h2>
      <p>
        모든 브릿지 액션은 상수로 정의하여 타입 안전성을 보장합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`export const BRIDGE_ACTION = {
  // 웹 → 앱 (send)
  NAVIGATE: 'navigate',
  OPEN_BROWSER: 'openBrowser',
  SET_STATUS_BAR: 'setStatusBar',
  HAPTIC_FEEDBACK: 'hapticFeedback',
  SHARE: 'share',
  LOGOUT: 'logout',

  // 앱 → 웹 (receive)
  NICE_AUTH_RESULT: 'niceAuthResult',
  PUSH_NOTIFICATION: 'pushNotification',
  APP_STATE_CHANGE: 'appStateChange',
  BIOMETRIC_RESULT: 'biometricResult',
} as const;

type BridgeActionType = typeof BRIDGE_ACTION[keyof typeof BRIDGE_ACTION];`}
        highlight={[1, 10, 17]}
      />

      <h2>Window 타입 확장</h2>
      <CodeBlock
        language="tsx"
        code={`// global.d.ts
declare global {
  interface Window {
    FlutterWebView?: {
      postMessage: (message: string) => void;
    };
    WellfyApp?: {
      callHandler: <T>(handler: string, ...args: unknown[]) => Promise<T>;
    };
  }
}`}
      />

      <Callout variant="warning">
        <p>
          브릿지 코드에서는 항상 <code>typeof window !== &apos;undefined&apos;</code>와
          <code>window.FlutterWebView</code> 존재 여부를 확인하세요.
          SSR 빌드 시점이나 일반 브라우저에서는 존재하지 않습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
