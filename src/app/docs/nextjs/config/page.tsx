import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function NextjsConfigPage() {
  return (
    <DocLayout
      title="next.config 설정"
      description="프로젝트의 Next.js 설정 파일을 분석하고 각 옵션의 역할을 알아봅니다."
    >
      <h2>프로젝트 next.config.ts</h2>
      <p>
        프로젝트는 Flutter WebView 안에서 동작하는 Static Export 앱입니다.
        서버 없이 동작하므로 RSC, API Routes, Middleware를 사용할 수 없습니다.
      </p>

      <CodeBlock
        filename="next.config.ts"
        language="tsx"
        code={`const nextConfig: NextConfig = {
  trailingSlash: true,           // /about/ 형태 URL (정적 파일 호환)
  images: { unoptimized: true }, // Static Export에서 Image Optimization 불가
  poweredByHeader: false,        // X-Powered-By 헤더 제거 (보안)
  compiler: {
    removeConsole: !isDebug      // 프로덕션에서 console.log 제거
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  sassOptions: {
    implementation: 'sass-embedded',  // 빠른 Sass 컴파일러
  },
};`}
        highlight={[2, 3, 6, 7, 11]}
      />

      <h2>React Compiler & 실험적 옵션</h2>
      <CodeBlock
        language="tsx"
        code={`{
  reactStrictMode: true,
  reactCompiler: true,        // React 19 Compiler 활성화
  typedRoutes: true,          // Link href 타입 체크
  experimental: {
    useLightningcss: true,    // 빠른 CSS 파서
    typedEnv: true,           // process.env 타입 체크
    optimizePackageImports: [ // 트리셰이킹 최적화
      '@tanstack/react-query',
      '@base-ui/react',
      'zustand',
      'react-hook-form',
      'zod',
      'recharts',
      'date-fns',
      'sonner',
    ],
    scrollRestoration: true,  // 뒤로가기 시 스크롤 복원
  },
}`}
        highlight={[3, 4, 6, 7, 8, 19]}
      />

      <Callout variant="note" title="React Compiler">
        <p>
          <code>reactCompiler: true</code>로 빌드 시 자동 메모이제이션이 적용됩니다.
          따라서 <code>memo</code>, <code>useCallback</code>,{" "}
          <code>useMemo</code>를 수동으로 작성하지 않습니다.
        </p>
      </Callout>

      <h2>SVG 아이콘 로더 (SVGR)</h2>
      <p>
        SVG 파일을 React 컴포넌트로 import하기 위한 Turbopack 설정입니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`turbopack: {
  rules: {
    '**/assets/icons/**/*.svg': {
      loaders: [{
        loader: '@svgr/webpack',
        options: {
          dimensions: false,      // width/height 제거
          typescript: true,       // .tsx 타입 생성
          svgo: true,             // SVG 최적화
          replaceAttrValues: {
            '#222': 'currentColor',    // 색상을 currentColor로
            '#222222': 'currentColor',
          },
          svgoConfig: {
            plugins: [{
              name: 'preset-default',
              params: { overrides: { removeViewBox: false } },
            }],
          },
        },
      }],
      as: '*.tsx',  // .tsx로 취급
    },
  },
}`}
        highlight={[3, 10, 11, 22]}
      />

      <h2>개발 API 프록시</h2>
      <p>
        개발 환경에서 CORS 문제를 해결하기 위해 API 프록시를 설정합니다.
        프로덕션에서는 Flutter가 직접 API를 호출하므로 불필요합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`async rewrites() {
  if (isDev && SERVER_CONFIG.API_TARGET_URL) {
    return [{
      source: '/api/proxy/:path*',
      destination: \`\${SERVER_CONFIG.API_TARGET_URL}/:path*\`,
    }];
  }
  return [];
}`}
        highlight={[4, 5]}
      />

      <Callout variant="warning">
        <p>
          <code>rewrites</code>는 <code>next dev</code>에서만 동작합니다.
          Static Export에서는 무시되므로 프로덕션에는 영향이 없습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
