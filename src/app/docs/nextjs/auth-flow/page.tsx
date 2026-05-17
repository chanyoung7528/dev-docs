import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function NextjsAuthFlowPage() {
  return (
    <DocLayout
      title="인증 흐름 (Auth Flow)"
      description="토큰 갱신, 인증 이벤트, AuthProvider의 동작 원리를 알아봅니다."
    >
      <h2>인증 흐름 전체 구조</h2>
      <CodeBlock
        language="plaintext"
        code={`[페이지 진입]
  ↓
AuthProvider: useGetMe() 쿼리 실행
  ↓
  ├── 성공 → 정상 렌더링
  └── 401 발생
        ↓
      API Client: refreshToken() 호출
        ↓
        ├── 갱신 성공 → 원래 요청 재시도 → 정상
        └── 갱신 실패
              ↓
            authEvents.emit('refresh-failed')
              ↓
            AuthProvider: 이벤트 수신
              ↓
            로그인 페이지로 리다이렉트`}
      />

      <h2>authEvents: 이벤트 기반 통신</h2>
      <p>
        API Client와 AuthProvider는 직접 import 관계가 아닌
        이벤트로 통신합니다. 이렇게 하면 순환 의존성을 방지합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 간단한 이벤트 버스
type AuthEvent = 'refresh-failed';
type Listener = (event: AuthEvent) => void;

const listeners = new Set<Listener>();

export const authEvents = {
  emit: (event: AuthEvent) => {
    listeners.forEach(fn => fn(event));
  },
  subscribe: (fn: Listener) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};`}
      />

      <h2>AuthProvider 구현</h2>
      <CodeBlock
        filename="AuthProvider.tsx"
        language="tsx"
        code={`export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const isRedirecting = useRef(false);

  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  // 포커스 시 토큰 유효성 검증
  useGetMe();

  // 갱신 실패 이벤트 구독
  useEffect(() => {
    const unsubscribe = authEvents.subscribe(event => {
      if (event !== 'refresh-failed') return;
      if (isRedirecting.current) return;  // 중복 리다이렉트 방지

      const currentPath = pathnameRef.current;
      const isPublic = AUTH_CONFIG.SKIP_REFRESH.PAGE_PATHS
        .some(p => currentPath.startsWith(p));

      if (isPublic) return;  // 공개 페이지에서는 무시

      isRedirecting.current = true;
      authCache.clear();
      router.replace('/member/login');

      setTimeout(() => {
        isRedirecting.current = false;
      }, 300);
    });

    return unsubscribe;
  }, [router]);

  return <>{children}</>;
}`}
        highlight={[10, 16, 22, 24, 25]}
      />

      <Callout variant="note" title="왜 useRef를 쓰나요?">
        <p>
          <code>pathnameRef</code>: useEffect 의존성에 pathname을 넣으면
          경로 변경마다 이벤트 구독이 재등록됩니다. ref로 최신값만 참조합니다.
          <br />
          <code>isRedirecting</code>: 동시에 여러 요청이 실패하면
          <code>router.replace</code>가 여러 번 호출됩니다. ref로 중복을 방지합니다.
        </p>
      </Callout>

      <h2>공개/비공개 경로 분리</h2>
      <CodeBlock
        language="tsx"
        code={`export const AUTH_CONFIG = {
  SKIP_REFRESH: {
    PAGE_PATHS: [
      '/member/login',
      '/member/signup',
      '/member/find',
      '/agreement',
      '/error',
    ],
  },
};

// 이 경로들에서는 토큰 갱신 실패해도 리다이렉트하지 않음`}
      />
    </DocLayout>
  );
}
