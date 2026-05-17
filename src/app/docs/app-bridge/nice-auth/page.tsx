import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function NiceAuthPage() {
  return (
    <DocLayout
      title="NICE 본인인증"
      description="NICE 본인인증 연동 흐름과 브릿지 통신 패턴을 알아봅니다."
    >
      <h2>전체 흐름</h2>
      <CodeBlock
        language="plaintext"
        code={`1. [웹] 본인인증 버튼 클릭
   ↓
2. [웹 → 앱] appBridge.send(BRIDGE_ACTION.NICE_AUTH, { returnUrl })
   ↓
3. [앱] NICE SDK 호출 → 본인인증 화면 표시
   ↓
4. [사용자] 인증 완료 (이름, 전화번호, CI/DI 등)
   ↓
5. [앱 → 웹] window.postMessage({ type: 'niceAuthResult', payload })
   ↓
6. [웹] useNativeMessage로 결과 수신
   ↓
7. [웹] 서버에 CI/DI 전달하여 회원 매칭`}
      />

      <h2>구현 코드</h2>

      <h3>1. 인증 요청 (웹 → 앱)</h3>
      <CodeBlock
        language="tsx"
        code={`function handleRequestAuth() {
  appBridge.send(BRIDGE_ACTION.NICE_AUTH, {
    returnUrl: window.location.href,
    purpose: 'signup',  // 용도: signup, findId, findPassword
  });
}`}
      />

      <h3>2. 결과 수신 (앱 → 웹)</h3>
      <CodeBlock
        filename="useNiceAuth.ts"
        language="tsx"
        code={`interface NiceAuthResult {
  success: boolean;
  name?: string;
  phone?: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  ci?: string;       // 연계정보 (사용자 고유 식별)
  di?: string;       // 중복가입 확인정보
  errorCode?: string;
  errorMessage?: string;
}

export function useNiceAuth(
  onSuccess: (result: NiceAuthResult) => void,
  onError?: (error: string) => void
) {
  useNativeMessage<NiceAuthResult>(
    BRIDGE_ACTION.NICE_AUTH_RESULT,
    (payload) => {
      if (payload.success) {
        onSuccess(payload);
      } else {
        onError?.(payload.errorMessage ?? '본인인증에 실패했습니다.');
      }
    }
  );

  function requestAuth(purpose: 'signup' | 'findId' | 'findPassword') {
    appBridge.send(BRIDGE_ACTION.NICE_AUTH, { purpose });
  }

  return { requestAuth };
}`}
        highlight={[17, 18, 20, 21, 29]}
      />

      <h3>3. 페이지에서 사용</h3>
      <CodeBlock
        filename="SignupAuthStep.tsx"
        language="tsx"
        code={`function SignupAuthStep({ onComplete }: { onComplete: (ci: string) => void }) {
  const { alert } = useAlert();

  const { requestAuth } = useNiceAuth(
    async (result) => {
      // 인증 성공 → 서버에 CI로 회원 조회
      const { data } = await checkUserByCi(result.ci!);

      if (data.isExisting) {
        await alert({ title: '이미 가입된 회원입니다.' });
        return;
      }

      onComplete(result.ci!);
    },
    async (errorMessage) => {
      await alert({ title: '본인인증 실패', description: errorMessage });
    }
  );

  return (
    <div>
      <h2>본인인증이 필요합니다</h2>
      <p>안전한 서비스 이용을 위해 본인인증을 진행해주세요.</p>
      <Button onClick={() => requestAuth('signup')}>
        본인인증 하기
      </Button>
    </div>
  );
}`}
        highlight={[4, 5, 6, 7, 25, 26]}
      />

      <Callout variant="note" title="CI와 DI">
        <p>
          <strong>CI (연계정보)</strong>: 모든 서비스에서 동일한 사용자 고유 값.
          서비스 간 사용자 매칭에 사용합니다.
          <br />
          <strong>DI (중복가입확인정보)</strong>: 서비스별로 다른 값.
          같은 서비스 내 중복 가입 방지에 사용합니다.
        </p>
      </Callout>

      <h2>다른 본인인증 활용</h2>
      <table>
        <thead>
          <tr>
            <th>용도</th>
            <th>purpose</th>
            <th>인증 후 동작</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>회원가입</td>
            <td><code>signup</code></td>
            <td>CI로 기존 회원 조회 → 신규/기존 분기</td>
          </tr>
          <tr>
            <td>아이디 찾기</td>
            <td><code>findId</code></td>
            <td>CI로 가입된 아이디 조회</td>
          </tr>
          <tr>
            <td>비밀번호 찾기</td>
            <td><code>findPassword</code></td>
            <td>CI + 아이디로 본인 확인 → 비밀번호 재설정</td>
          </tr>
        </tbody>
      </table>
    </DocLayout>
  );
}
