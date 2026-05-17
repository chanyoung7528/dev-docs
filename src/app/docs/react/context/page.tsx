import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ReactContextPage() {
  return (
    <DocLayout
      title="Context API"
      description="Props를 중간 컴포넌트를 거치지 않고 깊은 자식에게 전달하는 방법입니다."
    >
      <h2>Context란?</h2>
      <p>
        Context는 컴포넌트 트리 전체에 데이터를 전달하는 방법입니다.
        테마, 인증 정보, 언어 설정 등 많은 컴포넌트가 필요로 하는 데이터에
        적합합니다.
      </p>

      <h2>Props Drilling 문제</h2>
      <CodeBlock
        language="tsx"
        code={`// Props Drilling: 중간 컴포넌트가 사용하지 않는 prop을 전달
function App() {
  const [user, setUser] = useState(userData);
  return <Layout user={user} />;
}

function Layout({ user }) {
  return <Header user={user} />;  // Layout은 user를 사용 안 함
}

function Header({ user }) {
  return <Avatar user={user} />;  // Header도 user를 사용 안 함
}

function Avatar({ user }) {
  return <img src={user.avatar} />;  // 실제 사용하는 곳
}`}
      />

      <h2>Context로 해결</h2>
      <CodeBlock
        language="tsx"
        code={`import { createContext, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// 커스텀 Hook으로 안전하게 사용
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  }
  return context;
}

// Provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function login(credentials: LoginDto) {
    const result = await memberApi.login(credentials);
    setUser(result.data);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext value={{ user, login, logout }}>
      {children}
    </AuthContext>
  );
}

// 사용: 중간 컴포넌트 거치지 않고 직접 접근
function Avatar() {
  const { user } = useAuth();
  return <img src={user?.avatar} />;
}`}
        highlight={[12, 13, 14, 15, 16, 34, 42]}
      />

      <Callout variant="note">
        <p>
          React 19에서는 <code>{'<Context.Provider value={...}>'}</code> 대신
          <code>{'<Context value={...}>'}</code>로 직접 사용할 수 있습니다.
        </p>
      </Callout>

      <h2>실전 적용: Provider 구조</h2>
      <p>
        프로젝트에서는 AlertProvider처럼 Zustand Store를 구독하는 Provider
        패턴을 주로 사용합니다.
      </p>

      <CodeBlock
        filename="AlertProvider.tsx"
        language="tsx"
        code={`function AlertProviderContent() {
  const isOpen = useAlertStore(s => s.isOpen);
  const options = useAlertStore(s => s.options);
  const confirmedRef = useRef(false);

  function handleConfirm() {
    confirmedRef.current = true;
    return options.onConfirm?.();
  }

  function handleOpenChange(open: boolean) {
    if (open) return;
    const confirmed = confirmedRef.current;
    confirmedRef.current = false;
    const { resolve } = useAlertStore.getState();
    resolve?.(confirmed);
    useAlertStore.getState().next();
  }

  return (
    <Alert
      open={isOpen}
      onOpenChange={handleOpenChange}
      onConfirm={handleConfirm}
    />
  );
}

export function AlertProvider() {
  return (
    <Suspense fallback={null}>
      <AlertProviderContent />
    </Suspense>
  );
}`}
        highlight={[2, 3, 15, 16, 17]}
      />

      <h2>Context vs Zustand</h2>
      <table>
        <thead>
          <tr>
            <th>특성</th>
            <th>Context</th>
            <th>Zustand</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>리렌더링</td>
            <td>value 변경 시 모든 소비자 리렌더링</td>
            <td>선택적 구독 (selector)</td>
          </tr>
          <tr>
            <td>사용 범위</td>
            <td>Provider 하위 트리</td>
            <td>전역</td>
          </tr>
          <tr>
            <td>적합한 경우</td>
            <td>테마, 인증 등 드물게 변하는 값</td>
            <td>자주 변하는 전역 상태</td>
          </tr>
          <tr>
            <td>DevTools</td>
            <td>React DevTools</td>
            <td>전용 DevTools + 미들웨어</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="tip">
        <p>
          자주 변하는 전역 상태(모달, 토스트 등)는 <strong>Zustand</strong>,
          드물게 변하는 설정 값(테마, 로케일)은 <strong>Context</strong>가
          적합합니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
