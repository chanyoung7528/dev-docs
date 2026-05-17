import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function AppBridgeSendPage() {
  return (
    <DocLayout
      title="송신: appBridge.send"
      description="웹에서 Flutter 앱으로 메시지를 보내는 방법입니다."
    >
      <h2>send 함수 구현</h2>
      <CodeBlock
        filename="native-bridge.ts"
        language="tsx"
        code={`function send<T = unknown>(action: BridgeActionType, payload?: T): void {
  if (typeof window === 'undefined') return;

  try {
    const message = JSON.stringify({ type: action, payload });

    if (window.FlutterWebView) {
      window.FlutterWebView.postMessage(message);
      logger.info(\`[Bridge/Send] \${action}\`, payload);
    } else {
      // 브라우저 개발 환경에서는 로그만 출력
      logger.debug(\`[Bridge/Mock] \${action} (FlutterWebView not found)\`, payload);
    }
  } catch (error) {
    logger.error(\`[Bridge/Serialize] \${action}\`, error);
  }
}`}
        highlight={[2, 5, 7, 8, 11, 12]}
      />

      <h2>call 함수 (결과 반환)</h2>
      <p>
        앱에서 결과를 받아야 하는 경우 <code>call</code>을 사용합니다.
        Promise를 반환하므로 async/await로 사용합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`async function call<T>(handler: string): Promise<T | null> {
  if (typeof window === 'undefined' || !window.WellfyApp) {
    logger.debug(\`[NativeBridge/Mock] \${handler}\`);
    return null;
  }

  try {
    const result = await window.WellfyApp.callHandler<T>(handler);
    logger.info(\`[NativeBridge] \${handler}\`, result);
    return result;
  } catch (error) {
    logger.error(\`[NativeBridge] \${handler}\`, error);
    return null;
  }
}`}
        highlight={[1, 2, 8]}
      />

      <h2>사용 예시</h2>
      <CodeBlock
        language="tsx"
        code={`// 외부 브라우저 열기
appBridge.send(BRIDGE_ACTION.OPEN_BROWSER, {
  url: 'https://example.com',
});

// 화면 이동 요청
appBridge.send(BRIDGE_ACTION.NAVIGATE, {
  route: '/health/checkup',
});

// 햅틱 피드백
appBridge.send(BRIDGE_ACTION.HAPTIC_FEEDBACK, {
  type: 'medium',
});

// 상태바 색상 변경
appBridge.send(BRIDGE_ACTION.SET_STATUS_BAR, {
  color: '#FFFFFF',
  isDark: true,
});

// 공유하기
appBridge.send(BRIDGE_ACTION.SHARE, {
  title: '건강검진 결과',
  text: '나의 건강 점수는 85점입니다.',
});`}
      />

      <h2>appBridge 객체</h2>
      <CodeBlock
        language="tsx"
        code={`// 모든 기능을 하나의 객체로 내보내기
export const appBridge = {
  send,
  call,
  downloadFile,
};

// 사용
import { appBridge } from '@shared/utils/native-bridge';

appBridge.send(BRIDGE_ACTION.NAVIGATE, { route: '/home' });
const deviceInfo = await appBridge.call<DeviceInfo>('GetDeviceInfo');`}
      />

      <Callout variant="tip">
        <p>
          개발 환경(브라우저)에서는 <code>FlutterWebView</code>가 없으므로
          mock 로그가 출력됩니다. 실제 동작을 확인하려면 Flutter 앱 내에서
          테스트해야 합니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
