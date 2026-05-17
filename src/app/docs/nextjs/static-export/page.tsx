import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function NextjsStaticExportPage() {
  return (
    <DocLayout
      title="Static Export"
      description="서버 없이 정적 HTML로 빌드하는 Static Export 방식과 제약사항을 알아봅니다."
    >
      <h2>Static Export란?</h2>
      <p>
        <code>output: &apos;export&apos;</code> 설정으로 Next.js 앱을 정적 HTML/CSS/JS로
        빌드합니다. 서버 없이 CDN이나 WebView에서 바로 서빙할 수 있습니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',           // 정적 빌드
  trailingSlash: true,        // /about → /about/index.html
  images: { unoptimized: true }, // Image Optimization 비활성화
};`}
        highlight={[3]}
      />

      <h2>사용할 수 없는 기능</h2>
      <table>
        <thead>
          <tr>
            <th>기능</th>
            <th>이유</th>
            <th>대안</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Server Components (RSC)</td>
            <td>서버 필요</td>
            <td>Client Components + TanStack Query</td>
          </tr>
          <tr>
            <td>API Routes</td>
            <td>서버 필요</td>
            <td>외부 API 직접 호출</td>
          </tr>
          <tr>
            <td>Middleware</td>
            <td>서버 필요</td>
            <td>클라이언트 라우트 가드</td>
          </tr>
          <tr>
            <td>ISR / SSR</td>
            <td>서버 필요</td>
            <td>CSR + 캐싱</td>
          </tr>
          <tr>
            <td>Image Optimization</td>
            <td>서버 필요</td>
            <td>외부 CDN 또는 원본 사용</td>
          </tr>
        </tbody>
      </table>

      <h2>동적 라우트 처리</h2>
      <p>
        동적 라우트(<code>[slug]</code>)는{" "}
        <code>generateStaticParams</code>로 빌드 시점에 모든 경로를
        미리 생성해야 합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// app/board/[bbId]/page.tsx
export function generateStaticParams() {
  return [
    { bbId: 'notice' },
    { bbId: 'faq' },
    { bbId: 'event' },
  ];
}

export default function BoardPage({ params }: { params: { bbId: string } }) {
  return <BoardContent bbId={params.bbId} />;
}`}
        highlight={[2, 3, 4, 5, 6, 7]}
      />

      <h2>인증 처리 (Middleware 대안)</h2>
      <p>
        Middleware를 사용할 수 없으므로, 클라이언트에서 인증 상태를 확인합니다.
        AuthProvider가 토큰 갱신 실패 시 로그인 페이지로 리다이렉트합니다.
      </p>

      <CodeBlock
        filename="AuthProvider.tsx"
        language="tsx"
        code={`useEffect(() => {
  const unsubscribe = authEvents.subscribe(event => {
    if (event !== 'refresh-failed' || isRedirecting.current) return;

    const currentPath = pathnameRef.current;
    const isPublic = AUTH_CONFIG.SKIP_REFRESH.PAGE_PATHS
      .some(p => currentPath.startsWith(p));

    if (isPublic) return;

    isRedirecting.current = true;
    authCache.clear();
    router.replace('/member/login');

    setTimeout(() => {
      isRedirecting.current = false;
    }, 300);
  });

  return unsubscribe;
}, [router]);`}
        highlight={[2, 6, 7, 12, 13]}
      />

      <Callout variant="tip">
        <p>
          Static Export에서도 App Router의 레이아웃 중첩, 로딩 UI,
          에러 바운더리 등은 정상 동작합니다. 서버가 필요한 기능만 제한됩니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
