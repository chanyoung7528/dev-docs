export interface NavItem {
  title: string;
  path: string;
  items?: NavItem[];
}

export interface ProjectNav {
  title: string;
  slug: string;
  description: string;
  categories: NavCategory[];
}

export interface NavCategory {
  title: string;
  items: NavItem[];
}

export const projects: ProjectNav[] = [
  {
    title: "React",
    slug: "react",
    description: "React 핵심 개념과 패턴",
    categories: [
      {
        title: "기초",
        items: [
          { title: "JSX 이해하기", path: "/docs/react/jsx" },
          { title: "컴포넌트와 Props", path: "/docs/react/components-and-props" },
          { title: "State 관리", path: "/docs/react/state" },
          { title: "이벤트 처리", path: "/docs/react/event-handling" },
          { title: "조건부 렌더링", path: "/docs/react/conditional-rendering" },
          { title: "리스트와 Key", path: "/docs/react/lists-and-keys" },
        ],
      },
      {
        title: "Hooks",
        items: [
          { title: "useState", path: "/docs/react/use-state" },
          { title: "useEffect", path: "/docs/react/use-effect" },
          { title: "useRef", path: "/docs/react/use-ref" },
          { title: "useMemo & useCallback", path: "/docs/react/use-memo" },
          { title: "커스텀 훅", path: "/docs/react/custom-hooks" },
        ],
      },
      {
        title: "고급 패턴",
        items: [
          { title: "Context API", path: "/docs/react/context" },
          { title: "Compound 컴포넌트", path: "/docs/react/compound-components" },
          { title: "렌더 최적화", path: "/docs/react/render-optimization" },
          { title: "Polymorphic 컴포넌트", path: "/docs/react/polymorphic" },
          { title: "Zod + react-hook-form", path: "/docs/react/form-validation" },
        ],
      },
    ],
  },
  {
    title: "Next.js",
    slug: "nextjs",
    description: "Next.js App Router & Static Export",
    categories: [
      {
        title: "프로젝트 설정",
        items: [
          { title: "next.config 설정", path: "/docs/nextjs/config" },
          { title: "Static Export", path: "/docs/nextjs/static-export" },
          { title: "Provider 구조", path: "/docs/nextjs/providers" },
        ],
      },
      {
        title: "심화",
        items: [
          { title: "API Client 아키텍처", path: "/docs/nextjs/api-client" },
          { title: "인증 흐름 (Auth Flow)", path: "/docs/nextjs/auth-flow" },
          { title: "에러 처리 체계", path: "/docs/nextjs/error-system" },
        ],
      },
    ],
  },
  {
    title: "App Bridge",
    slug: "app-bridge",
    description: "Flutter 하이브리드 앱 브릿지 통신",
    categories: [
      {
        title: "기초",
        items: [
          { title: "브릿지 아키텍처", path: "/docs/app-bridge/architecture" },
          { title: "송신: appBridge.send", path: "/docs/app-bridge/send" },
          { title: "수신: useNativeMessage", path: "/docs/app-bridge/receive" },
        ],
      },
      {
        title: "실전 활용",
        items: [
          { title: "NICE 본인인증", path: "/docs/app-bridge/nice-auth" },
          { title: "파일 다운로드", path: "/docs/app-bridge/file-download" },
          { title: "히스토리 & 백버튼", path: "/docs/app-bridge/history-back" },
          { title: "오버레이 z-index 관리", path: "/docs/app-bridge/overlay-stack" },
        ],
      },
    ],
  },
  {
    title: "TanStack Query",
    slug: "tanstack-query",
    description: "서버 상태 관리 라이브러리",
    categories: [
      {
        title: "기초",
        items: [
          { title: "소개 & 설정", path: "/docs/tanstack-query/introduction" },
          { title: "useQuery", path: "/docs/tanstack-query/use-query" },
          { title: "useMutation", path: "/docs/tanstack-query/use-mutation" },
          { title: "Query Keys", path: "/docs/tanstack-query/query-keys" },
        ],
      },
      {
        title: "심화",
        items: [
          { title: "캐싱 전략", path: "/docs/tanstack-query/caching" },
          { title: "무한 스크롤", path: "/docs/tanstack-query/infinite-queries" },
          { title: "Optimistic Updates", path: "/docs/tanstack-query/optimistic-updates" },
          { title: "에러 & 로딩 처리", path: "/docs/tanstack-query/error-handling" },
          { title: "select 변환 패턴", path: "/docs/tanstack-query/select-transform" },
        ],
      },
    ],
  },
  {
    title: "CSS",
    slug: "css",
    description: "CSS 핵심 개념과 레이아웃",
    categories: [
      {
        title: "레이아웃",
        items: [
          { title: "Flexbox", path: "/docs/css/flexbox" },
          { title: "Grid", path: "/docs/css/grid" },
          { title: "Position & z-index", path: "/docs/css/position-z-index" },
        ],
      },
      {
        title: "스타일링 기법",
        items: [
          { title: "CSS Modules", path: "/docs/css/css-modules" },
          { title: "CSS Variables", path: "/docs/css/css-variables" },
          { title: "반응형 디자인", path: "/docs/css/responsive" },
          { title: "애니메이션", path: "/docs/css/animation" },
          { title: "SVG 아이콘 시스템", path: "/docs/css/svg-icons" },
        ],
      },
    ],
  },
  {
    title: "심화 패턴",
    slug: "advanced",
    description: "프로젝트 아키텍처 & 심화 기법",
    categories: [
      {
        title: "데이터 시각화",
        items: [
          { title: "Swiper + Lazy Fetching", path: "/docs/advanced/swiper-lazy" },
          { title: "Recharts 커스텀 차트", path: "/docs/advanced/recharts" },
          {
            title: "차트 터치 인터랙션",
            path: "/docs/advanced/chart-touch-interaction",
          },
        ],
      },
      {
        title: "상태 관리 심화",
        items: [
          { title: "Zustand 고급 패턴", path: "/docs/advanced/zustand-advanced" },
          { title: "Domain Layer 구조", path: "/docs/advanced/domain-layer" },
          {
            title: "Alert 큐 & BottomSheet",
            path: "/docs/advanced/alert-bottomsheet",
          },
        ],
      },
      {
        title: "아키텍처 패턴",
        items: [
          {
            title: "API Client 고급 패턴",
            path: "/docs/advanced/api-client-pattern",
          },
          { title: "Query Factory", path: "/docs/advanced/query-factory" },
          {
            title: "네이티브 브릿지 실무",
            path: "/docs/advanced/native-bridge-pattern",
          },
          {
            title: "CSS 디자인 토큰 & 테마",
            path: "/docs/advanced/css-design-tokens",
          },
          {
            title: "폼 공통 설계 (RHF + Zod)",
            path: "/docs/advanced/form-architecture",
          },
        ],
      },
    ],
  },
  {
    title: "TypeScript",
    slug: "typescript",
    description: "TypeScript 실무 필수 패턴",
    categories: [
      {
        title: "타입 시스템",
        items: [
          { title: "제네릭", path: "/docs/typescript/generics" },
          { title: "유틸리티 타입", path: "/docs/typescript/utility-types" },
          { title: "타입 가드", path: "/docs/typescript/type-guards" },
          {
            title: "Discriminated Union",
            path: "/docs/typescript/discriminated-unions",
          },
        ],
      },
    ],
  },
  {
    title: "JavaScript ES6+",
    slug: "javascript",
    description: "모던 JavaScript 핵심 패턴",
    categories: [
      {
        title: "문법 & 패턴",
        items: [
          {
            title: "구조 분해 & 스프레드",
            path: "/docs/javascript/destructuring-spread",
          },
          { title: "배열 메서드 체이닝", path: "/docs/javascript/array-methods" },
          { title: "async / await", path: "/docs/javascript/async-await" },
          {
            title: "Optional Chaining & Nullish",
            path: "/docs/javascript/optional-chaining",
          },
        ],
      },
    ],
  },
  {
    title: "Git",
    slug: "git",
    description: "Git 실무 명령어 & 워크플로우",
    categories: [
      {
        title: "실무",
        items: [
          {
            title: "일상 워크플로우 & 복구",
            path: "/docs/git/daily-workflow",
          },
        ],
      },
    ],
  },
  {
    title: "Algorithm",
    slug: "algorithm",
    description: "프론트엔드 코딩 테스트 대비 알고리즘",
    categories: [
      {
        title: "자료구조 활용",
        items: [
          { title: "해시맵 (Map/Set)", path: "/docs/algorithm/hash-map" },
          { title: "스택 & 큐", path: "/docs/algorithm/stack-queue" },
        ],
      },
      {
        title: "탐색 & 정렬",
        items: [
          { title: "투 포인터", path: "/docs/algorithm/two-pointer" },
          { title: "슬라이딩 윈도우", path: "/docs/algorithm/sliding-window" },
          { title: "이분 탐색", path: "/docs/algorithm/binary-search" },
          { title: "정렬 알고리즘", path: "/docs/algorithm/sorting" },
        ],
      },
      {
        title: "그래프 & 트리",
        items: [
          { title: "BFS / DFS", path: "/docs/algorithm/bfs-dfs" },
        ],
      },
      {
        title: "최적화 전략",
        items: [
          { title: "그리디 (탐욕법)", path: "/docs/algorithm/greedy" },
          {
            title: "동적 프로그래밍 (DP)",
            path: "/docs/algorithm/dynamic-programming",
          },
        ],
      },
      {
        title: "프론트엔드 특화",
        items: [
          {
            title: "문자열 처리",
            path: "/docs/algorithm/string-manipulation",
          },
        ],
      },
    ],
  },
  {
    title: "Storybook",
    slug: "storybook",
    description: "컴포넌트 문서화 & 테스트",
    categories: [
      {
        title: "시작하기",
        items: [
          { title: "Storybook 소개", path: "/docs/storybook/introduction" },
          { title: "Story 작성법", path: "/docs/storybook/writing-stories" },
          { title: "Args & Controls", path: "/docs/storybook/args-and-controls" },
        ],
      },
      {
        title: "활용",
        items: [
          { title: "Addon 활용", path: "/docs/storybook/addons" },
          { title: "인터랙션 테스트", path: "/docs/storybook/interaction-testing" },
        ],
      },
    ],
  },
];

export function findProjectBySlug(slug: string): ProjectNav | undefined {
  return projects.find((p) => p.slug === slug);
}

export function findCurrentNavItem(
  path: string
): { project: ProjectNav; item: NavItem } | undefined {
  for (const project of projects) {
    for (const category of project.categories) {
      for (const item of category.items) {
        if (item.path === path) {
          return { project, item };
        }
      }
    }
  }
  return undefined;
}

export function findAdjacentItems(path: string): {
  prev: NavItem | null;
  next: NavItem | null;
} {
  const allItems = projects.flatMap((p) =>
    p.categories.flatMap((c) => c.items)
  );
  const index = allItems.findIndex((item) => item.path === path);

  return {
    prev: index > 0 ? allItems[index - 1] : null,
    next: index < allItems.length - 1 ? allItems[index + 1] : null,
  };
}
