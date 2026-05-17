import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function SsgSeoPage() {
  return (
    <DocLayout
      title="SSG & SEO 최적화"
      description="Next.js Static Site Generation 설정과 검색 엔진 최적화의 핵심 개념입니다."
    >
      <h2>SSG vs SSR vs CSR</h2>

      <CodeBlock
        language="text"
        code={`┌────────┬──────────────────────┬──────────────────┬──────────────────┐
│        │      SSG             │      SSR          │      CSR         │
├────────┼──────────────────────┼──────────────────┼──────────────────┤
│ 빌드   │ HTML 미리 생성       │ 요청마다 생성     │ JS만 빌드       │
│ 서버   │ 필요 없음 (CDN)      │ Node.js 서버 필요 │ 필요 없음       │
│ 속도   │ 매우 빠름 (캐시)     │ 첫 로딩 느림      │ 첫 로딩 느림    │
│ SEO    │ ✅ 완벽              │ ✅ 완벽           │ ❌ 불리         │
│ 실시간 │ ❌ 빌드 시 데이터     │ ✅ 실시간         │ ✅ 실시간       │
│ 적합   │ 블로그, 문서, 랜딩    │ 대시보드, 쇼핑몰  │ SPA, 하이브리드 │
└────────┴──────────────────────┴──────────────────┴──────────────────┘

하이브리드 앱(WebView):
→ output: 'export' (Static Export) = SSG
→ 서버가 없으므로 SSR/Server Action 사용 불가
→ SEO 불필요 (WebView 내부이므로 크롤러 접근 X)`}
      />

      <h2>Static Export 설정</h2>

      <CodeBlock
        filename="next.config.ts"
        language="typescript"
        code={`import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',  // Static HTML Export

  // 이미지 최적화 비활성화 (서버 없음)
  images: {
    unoptimized: true,
  },

  // 빌드 결과물 경로 (기본: out/)
  distDir: 'dist',

  // trailing slash (정적 호스팅 호환)
  trailingSlash: true,

  // 기본 경로 (서브 디렉토리에 배포 시)
  // basePath: '/app',
};

export default nextConfig;`}
        highlight={[4, 7, 8, 15]}
      />

      <Callout variant="warning">
        <p>
          <code>output: &apos;export&apos;</code> 모드에서 사용 불가:
          Server Actions, Middleware, API Routes, 동적 라우트(generateStaticParams 없이),
          <code>revalidate</code>, <code>headers()</code>, <code>cookies()</code>.
        </p>
      </Callout>

      <h2>Static Export에서 동적 라우트</h2>

      <CodeBlock
        filename="app/posts/[id]/page.tsx"
        language="tsx"
        code={`// Static Export에서 동적 라우트를 쓰려면
// generateStaticParams로 빌드 시 모든 경로를 미리 생성해야 함

export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return posts.map((post: Post) => ({
    id: post.id,  // /posts/1, /posts/2, ... 각각 HTML 생성
  }));
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await fetch(\`https://api.example.com/posts/\${id}\`).then(r => r.json());

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}

// 주의: 빌드 시 존재하지 않는 경로는 404
// → 새 게시글이 추가되면 재빌드 필요`}
        highlight={[4, 5, 7, 8]}
      />

      <h2>SEO 메타데이터</h2>

      <CodeBlock
        filename="app/layout.tsx"
        language="tsx"
        code={`import type { Metadata } from 'next';

// 정적 메타데이터 (layout 또는 page에서 export)
export const metadata: Metadata = {
  // 기본 제목 템플릿
  title: {
    default: '한화자산운용',
    template: '%s | 한화자산운용',  // 하위 페이지: "펀드 목록 | 한화자산운용"
  },

  description: '한화자산운용의 펀드, ETF 투자 정보를 확인하세요.',

  // Open Graph (카카오톡, 페이스북 공유 시)
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://www.hanwhaam.com',
    siteName: '한화자산운용',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '한화자산운용',
      },
    ],
  },

  // 트위터 카드
  twitter: {
    card: 'summary_large_image',
    title: '한화자산운용',
    description: '펀드, ETF 투자 정보',
    images: ['/og-image.png'],
  },

  // 검색 엔진 설정
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },

  // 기타
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',  // Safe Area 지원
  },
  themeColor: '#ffffff',
};`}
        highlight={[4, 6, 7, 14, 19, 20, 21, 39, 40, 52, 53]}
      />

      <h2>동적 메타데이터 (페이지별)</h2>

      <CodeBlock
        filename="app/funds/[id]/page.tsx"
        language="tsx"
        code={`import type { Metadata } from 'next';

// 페이지 데이터 기반으로 동적 메타 생성
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const fund = await fetchFund(id);

  return {
    title: fund.name,  // "한화 글로벌 성장 펀드 | 한화자산운용"
    description: \`\${fund.name}의 수익률, NAV, 포트폴리오 정보를 확인하세요.\`,
    openGraph: {
      title: fund.name,
      description: \`수익률 \${fund.returnRate}% | 기준가 \${fund.nav}원\`,
      images: [fund.thumbnailUrl ?? '/og-default.png'],
    },
  };
}

export default async function FundPage({ params }: { params: Promise<{ id: string }> }) {
  // ...
}`}
        highlight={[4, 5, 6, 11, 12, 13, 14, 15]}
      />

      <h2>구조화 데이터 (JSON-LD)</h2>

      <CodeBlock
        filename="app/funds/[id]/page.tsx"
        language="tsx"
        code={`// 구글 검색 결과에 리치 스니펫(별점, 가격 등) 표시
export default async function FundPage({ params }) {
  const fund = await fetchFund(params.id);

  // JSON-LD 구조화 데이터
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: fund.name,
    description: fund.description,
    provider: {
      '@type': 'Organization',
      name: '한화자산운용',
    },
  };

  return (
    <>
      {/* Head에 JSON-LD 삽입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <h1>{fund.name}</h1>
        {/* ... */}
      </article>
    </>
  );
}`}
        highlight={[6, 7, 8, 20, 21, 22]}
      />

      <h2>sitemap.xml & robots.txt</h2>

      <CodeBlock
        filename="app/sitemap.ts"
        language="typescript"
        code={`import type { MetadataRoute } from 'next';

// Next.js가 자동으로 sitemap.xml 생성
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const funds = await fetchAllFunds();

  const fundUrls = funds.map((fund) => ({
    url: \`https://www.hanwhaam.com/funds/\${fund.id}\`,
    lastModified: fund.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://www.hanwhaam.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.hanwhaam.com/funds',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...fundUrls,
  ];
}`}
        highlight={[4, 7, 8, 9, 10]}
      />

      <CodeBlock
        filename="app/robots.ts"
        language="typescript"
        code={`import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://www.hanwhaam.com/sitemap.xml',
  };
}`}
      />

      <h2>이미지 최적화</h2>

      <CodeBlock
        filename="image-optimization.tsx"
        language="tsx"
        code={`import Image from 'next/image';

// next/image — SSR 모드에서 자동 최적화
// (Static Export에서는 unoptimized: true 필수)
<Image
  src="/hero.png"
  alt="메인 이미지"
  width={800}
  height={400}
  priority          // LCP 이미지: preload
  placeholder="blur" // 블러 프리로드 (정적 이미지만)
/>

// 외부 이미지 (next.config에 domains 설정 필요)
<Image
  src="https://cdn.example.com/fund-thumb.webp"
  alt="펀드 썸네일"
  width={300}
  height={200}
  loading="lazy"     // 뷰포트 밖: lazy load
/>

// Static Export에서는 일반 img 태그 + 직접 최적화
<img
  src="/images/hero.webp"
  alt="메인 이미지"
  width={800}
  height={400}
  loading="lazy"
  decoding="async"
/>

// SEO를 위한 이미지 alt 텍스트:
// ❌ alt=""  또는 alt="이미지"
// ✅ alt="한화 글로벌 성장 펀드 수익률 차트"
// → 검색 엔진이 이미지 내용을 이해`}
        highlight={[10, 11, 20, 29, 30]}
      />

      <h2>성능 체크리스트 (Core Web Vitals)</h2>

      <CodeBlock
        language="text"
        code={`SEO와 직결되는 Core Web Vitals:

1. LCP (Largest Contentful Paint) < 2.5초
   - 메인 이미지에 priority 속성
   - 폰트 preload
   - 서버 응답 빠르게 (CDN)

2. INP (Interaction to Next Paint) < 200ms
   - 무거운 JS 줄이기
   - React 렌더링 최적화
   - Web Worker 활용

3. CLS (Cumulative Layout Shift) < 0.1
   - 이미지에 width/height 명시
   - 폰트 font-display: swap + size-adjust
   - 동적 콘텐츠에 min-height 예약

SEO 기본 체크리스트:
□ title 태그: 60자 이내, 페이지별 고유
□ description: 155자 이내, 핵심 키워드 포함
□ h1 태그: 페이지당 1개
□ 이미지 alt: 내용 설명 (키워드 포함)
□ 시맨틱 HTML: header, main, nav, article, section
□ HTTPS 적용
□ 모바일 반응형
□ sitemap.xml 등록
□ robots.txt 설정
□ Open Graph 메타 태그 (SNS 공유)`}
      />

      <Callout variant="tip">
        <p>
          <strong>하이브리드 앱에서 SEO가 필요한가?</strong> WebView 내부 앱이면
          SEO는 불필요합니다. 하지만 같은 코드로 모바일 웹(m.hanwhaam.com)도
          서비스한다면 SSR + SEO가 필수입니다. 프로젝트 구조에 따라 판단하세요.
        </p>
      </Callout>
    </DocLayout>
  );
}
