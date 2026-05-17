import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ReactCustomHooksPage() {
  return (
    <DocLayout
      title="커스텀 훅"
      description="반복되는 로직을 재사용 가능한 Hook으로 추출하는 패턴입니다."
    >
      <h2>커스텀 훅이란?</h2>
      <p>
        <code>use</code>로 시작하는 함수로, 다른 Hook들을 조합하여 재사용 가능한
        로직을 만듭니다. 컴포넌트에서 로직을 분리하여 관심사를 분리합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 규칙: use로 시작해야 함
function useMyHook() {     // O
function myHook() {        // X - Hook 규칙 적용 안 됨
function UseMyHook() {     // X - 컴포넌트로 인식

// 다른 Hook을 조합
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue(prev => !prev);
  return [value, toggle] as const;
}`}
        highlight={[7, 8, 9, 10]}
      />

      <h2>실전 패턴 1: Intersection Observer</h2>
      <p>
        프로젝트에서 무한 스크롤, 지연 로딩에 사용하는 핵심 Hook입니다.
      </p>

      <CodeBlock
        filename="useIntersectionObserver.ts"
        language="tsx"
        code={`export function useIntersectionObserver({
  enabled = true,
  onIntersect,
  root,
  rootMargin = '0px',
  threshold = 1.0,
}: UseIntersectionObserverProps = {}): UseIntersectionObserverReturn {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Why: 인라인 콜백 시 observer 재생성 방지
  const callbackRef = useRef(onIntersect);
  useEffect(() => { callbackRef.current = onIntersect; }, [onIntersect]);

  useEffect(() => {
    if (!enabled) return;
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry) return;
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && callbackRef.current) {
          callbackRef.current();
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);
    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [enabled, root, rootMargin, threshold]);

  return { targetRef, isIntersecting };
}`}
        highlight={[12, 13, 16, 32, 33, 34, 35]}
      />

      <h3>무한 스크롤에서 사용</h3>
      <CodeBlock
        filename="usePostInfinite.ts"
        language="tsx"
        code={`export function usePostInfinite(options: UsePostInfiniteOptions) {
  const { bbId, ...rest } = options;
  const params = { ...DEFAULT_OPTIONS, ...rest };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery(boardQueries.postCursorList(bbId, params));

  const { targetRef: sentinelRef } = useIntersectionObserver({
    enabled: hasNextPage && !isFetchingNextPage,
    onIntersect: () => fetchNextPage(),
    rootMargin: '200px',
  });

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  return { posts, isPending, hasNextPage, isFetchingNextPage, sentinelRef };
}

// 사용
function PostList() {
  const { posts, sentinelRef } = usePostInfinite({ bbId: 'notice' });

  return (
    <div>
      {posts.map(post => <PostItem key={post.bbcSeqNo} post={post} />)}
      <div ref={sentinelRef} /> {/* 감시 대상 */}
    </div>
  );
}`}
        highlight={[8, 9, 10, 11, 26]}
      />

      <h2>실전 패턴 2: Promise 기반 전역 UI</h2>
      <p>
        Store + Hook + Provider 패턴으로 전역 Alert/Confirm을 관리합니다.
      </p>

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
}`}
      />

      <h2>커스텀 훅 설계 원칙</h2>
      <ul>
        <li>
          <strong>단일 책임</strong>: 하나의 관심사만 다루세요.
          <code>useAuth</code>가 토스트까지 관리하면 안 됩니다.
        </li>
        <li>
          <strong>인터페이스 설계</strong>: 반환값은 사용하는 쪽이 필요한 것만
          노출하세요.
        </li>
        <li>
          <strong>callbackRef 패턴</strong>: 콜백을 의존성에서 제외해야 할 때
          <code>useRef</code>에 저장하세요.
        </li>
      </ul>

      <Callout variant="tip">
        <p>
          같은 로직이 2곳 이상에서 반복되면 커스텀 훅 추출을 고려하세요.
          단, 1곳에서만 사용되는 로직은 해당 컴포넌트에 두는 것이 낫습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
