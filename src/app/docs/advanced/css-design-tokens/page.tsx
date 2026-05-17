import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function CssDesignTokensPage() {
  return (
    <DocLayout
      title="CSS 디자인 토큰 & 실전 패턴"
      description="CSS Custom Properties 기반 디자인 토큰, 동적 폰트 스케일링, oklch, data-* 스타일링 등 프로덕션 패턴입니다."
    >
      <h2>디자인 토큰 구조</h2>
      <p>
        CSS Custom Properties로 색상, 타이포그래피, 간격, z-index를 중앙
        관리합니다. 원시 토큰 → 시맨틱 토큰 → 컴포넌트 변수 3계층으로
        구성합니다.
      </p>

      <h2>색상 토큰</h2>

      <CodeBlock
        filename="_color.scss"
        language="scss"
        code={`:root {
  /* ─── 원시 색상 (900~050 스케일) ─── */
  --comfy-green-900: #0a5c36;
  --comfy-green-700: #1a8a52;
  --comfy-green-500: #2db872;
  --comfy-green-300: #7ad4a8;
  --comfy-green-100: #c8eeda;
  --comfy-green-050: #eaf8f0;

  --friendly-coral-900: #c93d2a;
  --friendly-coral-500: #f06650;

  --gray-900: #1a1a1a;
  --gray-700: #4a4a4a;
  --gray-500: #8a8a8a;
  --gray-300: #c0c0c0;
  --gray-100: #e8e8e8;
  --gray-050: #f5f5f5;

  /* ─── 시맨틱 색상 (역할 기반) ─── */
  --color-text-primary: var(--gray-900);
  --color-text-secondary: var(--gray-500);
  --color-bg-primary: #ffffff;
  --color-border: var(--gray-100);

  /* ─── oklch 기반 투명도 (오버레이용) ─── */
  --dim-bk-60: oklch(from var(--black) l c h / 60%);
  --dim-bk-10: oklch(from var(--black) l c h / 10%);
  --dim-wh-65: oklch(from var(--white) l c h / 65%);

  /* ─── 그림자 (oklch + 투명도) ─── */
  --shadow-01: 0 1px 3px oklch(from var(--black) l c h / 8%);
  --shadow-02: 0 4px 12px oklch(from var(--black) l c h / 12%);
  --shadow-03: 0 8px 24px oklch(from var(--black) l c h / 16%);

  /* ─── 그라디언트 ─── */
  --gr001: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  --gr002: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}`}
        highlight={[20, 21, 22, 23, 26, 27, 28, 31, 32, 33]}
      />

      <Callout variant="note">
        <p>
          <code>oklch(from var(--black) l c h / 60%)</code>는 기존 색상에서
          알파값만 변경하는 최신 CSS 문법입니다. rgba보다 지각적으로 균일한
          색상 조절이 가능합니다.
        </p>
      </Callout>

      <h2>레이아웃 토큰</h2>

      <CodeBlock
        filename="_layout.scss"
        language="scss"
        code={`:root {
  /* ─── Safe Area (네이티브 앱 필수) ─── */
  --sat: env(safe-area-inset-top);
  --sar: env(safe-area-inset-right);
  --sab: env(safe-area-inset-bottom);
  --sal: env(safe-area-inset-left);

  /* ─── 레이아웃 높이 (Safe Area 포함) ─── */
  --height-header: calc(4.8rem + var(--sat));
  --height-tab-bar: calc(5.4rem + var(--sab));
  --height-content: calc(100dvh - var(--height-header));

  /* ─── Border Radius ─── */
  --radius-xl: 2.4rem;
  --radius-lg: 1.6rem;
  --radius-md: 1.2rem;
  --radius-sm: 0.8rem;
  --radius-xs: 0.4rem;

  /* ─── Z-index 체계 ─── */
  --z-base: 1;
  --z-sticky: 10;
  --z-header: 100;
  --z-tab-bar: 110;
  --z-popup: 150;
  --z-dropdown: 500;
  --z-modal: 1000;
  --z-overlay: 1500;
  --z-toast: 2000;
}`}
        highlight={[3, 4, 5, 6, 9, 10, 11, 21, 22, 23, 24, 25, 26, 27, 28, 29]}
      />

      <h2>동적 폰트 스케일링 (clamp 기반)</h2>
      <p>
        미디어 쿼리 없이 뷰포트 너비에 따라 폰트와 간격이 자동
        스케일됩니다. 디자인 기준 360px에서 rem 단위로 제작하고,
        280px~450px 범위에서 선형 보간합니다.
      </p>

      <CodeBlock
        filename="_mobile.scss"
        language="scss"
        code={`html {
  --design-width: 360;
  --min-width-px: 280;
  --max-width-px: 450;
  --container-max-width: 750px;

  /* 스케일 비율: 디자인 너비 기준 */
  --scale-factor: calc(10 / var(--design-width));

  /* rem 기반 min/max 폰트 사이즈 계산 */
  --min-font-size: calc(
    (var(--min-width-px) * var(--scale-factor) / 16) * 100%
  );
  --max-font-size: calc(
    (var(--max-width-px) * var(--scale-factor) / 16) * 100%
  );

  /* vw 기반 동적 사이즈 (max-width 제한) */
  --dynamic-font-size: calc(
    var(--scale-factor) * min(100vw, var(--container-max-width))
  );

  /* clamp로 min, dynamic, max 결합 */
  font-size: clamp(
    var(--min-font-size),
    var(--dynamic-font-size),
    var(--max-font-size)
  );
}

body {
  max-width: var(--container-max-width);
  margin-inline: auto;    /* 중앙 정렬 */
  min-height: 100dvh;     /* 동적 뷰포트 높이 */
  overscroll-behavior-y: contain; /* 당겨서 새로고침 방지 */
  -webkit-overflow-scrolling: touch; /* iOS 모멘텀 스크롤 */
}

/* 이 방식의 장점:
   - 모든 rem 값이 뷰포트에 비례하여 자동 스케일
   - 280px 이하, 450px 이상에서 고정 (깨지지 않음)
   - 디자인 시안(360px)에서 1rem = 10px로 매핑
   - 컴포넌트 코드에서는 그냥 rem만 쓰면 됨 */`}
        highlight={[8, 23, 24, 25, 26, 27, 33, 34]}
      />

      <Callout variant="warning">
        <p>
          <code>100dvh</code>는 모바일 브라우저에서 주소창 높이를
          동적으로 반영합니다. <code>100vh</code>는 주소창이 숨겨진
          상태 기준이라 스크롤 시 레이아웃이 밀립니다.
        </p>
      </Callout>

      <h2>data-* 속성 + :has() 스타일링</h2>
      <p>
        className 조합 대신 <code>data-*</code> 속성으로 상태를 전달하고,
        CSS 속성 선택자로 스타일을 제어합니다.
      </p>

      <CodeBlock
        filename="Button.module.scss"
        language="scss"
        code={`.root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

  /* 사이즈 variants */
  &.xl { height: 5.6rem; padding: 0 2.4rem; }
  &.lg { height: 4.8rem; padding: 0 2rem; }
  &.md { height: 4rem; padding: 0 1.6rem; }
  &.sm { height: 3.2rem; padding: 0 1.2rem; }

  /* 색상 variants */
  &.primary {
    background: var(--comfy-green-700);
    color: white;
    &:active { transform: scale(0.98); }
  }

  &.outline {
    background: transparent;
    border: 1px solid var(--color-border);
  }

  /* data-* 속성으로 상태 제어 (JS에서 boolean 전달) */
  &[data-full-width] { width: 100%; }
  &[data-loading] { opacity: 0.7; pointer-events: none; }

  /* 커스텀 색상 (CSS 변수 inline 주입) */
  &.custom {
    background: var(--btn-bg-color);
    color: var(--btn-font-color);
  }
}

/* :has() — 자식 상태로 부모 스타일링 */
.label {
  &:has(.root[data-disabled]) {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

/* 컴포넌트에서 사용 */
// <button
//   className={cn(styles.root, styles[variant], styles[size])}
//   style={{ '--btn-bg-color': bgColor } as CSSProperties}
//   data-full-width={fullWidth || undefined}
//   data-loading={loading || undefined}
// />`}
        highlight={[26, 27, 30, 31, 38, 39, 40, 41]}
      />

      <h2>의사 요소 활용 (Badge, Indicator)</h2>

      <CodeBlock
        filename="TabBar.module.scss"
        language="scss"
        code={`/* 배지: DOM 추가 없이 ::before로 표시 */
.tabItem {
  position: relative;

  &[data-badge]::before {
    content: '';
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    width: 0.6rem;
    aspect-ratio: 1/1;      /* 정사각형 보장 */
    border-radius: 50%;
    background-color: var(--friendly-coral-900);
  }
}

/* 점 구분자: 리스트 아이템 사이 */
.infoItem {
  & + &::before {
    content: '';
    display: inline-block;
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 50%;
    background: var(--gray-300);
    margin: 0 0.6rem;
    vertical-align: middle;
  }
}

/* 3D 플립 애니메이션 (탭 메뉴 진입) */
@keyframes flipIn {
  from { opacity: 0; transform: rotateX(-90deg); }
  to   { opacity: 1; transform: rotateX(0deg); }
}

.menuItem {
  animation: flipIn 0.4s ease forwards;
  /* 순차 지연: nth-child로 스태거 */
  &:nth-child(1) { animation-delay: 0.05s; }
  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.15s; }
}`}
        highlight={[5, 11, 20, 21, 32, 33, 38, 39, 40]}
      />

      <h2>애니메이션 패턴</h2>

      <CodeBlock
        filename="animations.scss"
        language="scss"
        code={`/* 스켈레톤 로딩 (시머 효과) */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-050) 25%,
    var(--gray-100) 50%,
    var(--gray-050) 75%
  );
  background-size: 400% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 아코디언 높이 전환 */
.accordionPanel {
  overflow: hidden;
  transition: height 0.3s cubic-bezier(0.87, 0, 0.13, 1);

  /* Base UI가 --accordion-panel-height를 자동 계산 */
  &[data-open] {
    height: var(--accordion-panel-height);
  }
  &[data-closed] {
    height: 0;
  }
}

/* 헤더 백드롭 블러 */
.header {
  position: sticky;
  top: 0;
  backdrop-filter: blur(16px);
  background: rgba(254, 247, 236, 0.8);
  z-index: var(--z-header);
}

/* 토스트 진입/퇴장 */
.toast {
  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: translateY(100%);
  }
}`}
        highlight={[9, 10, 20, 21, 34, 35, 41, 42, 43, 44]}
      />

      <h2>Safe Area + 하단 고정 버튼</h2>

      <CodeBlock
        language="scss"
        code={`/* 앱 레이아웃 */
.appLayout {
  padding-top: var(--sat);     /* 상단 노치 */
  padding-bottom: var(--sab);  /* 하단 홈바 */
  min-height: 100dvh;
}

/* 하단 고정 CTA (Safe Area 포함) */
.bottomAction {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.6rem;
  padding-bottom: calc(1.6rem + var(--sab)); /* 홈바 높이 추가 */
  background: var(--color-bg-primary);
  box-shadow: var(--shadow-02);
}

/* 헤더 높이 = 디자인 높이 + Safe Area */
.header {
  height: var(--height-header); /* calc(4.8rem + var(--sat)) */
  padding-top: var(--sat);
}

/* 스크롤 스냅 (가로 카드 캐러셀) */
.horizontalScroll {
  display: flex;
  gap: 1.2rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  > * {
    scroll-snap-align: start;
    flex-shrink: 0;
  }

  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}`}
        highlight={[3, 4, 15, 22, 23, 30, 31]}
      />

      <h2>차트 색상 토큰</h2>

      <CodeBlock
        filename="chart.constants.ts"
        language="typescript"
        code={`// CSS 변수에서 차트 색상을 런타임에 읽기 (fallback 지정)
function getCSSColor(varName: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback; // SSR 방어
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName).trim() || fallback;
}

// 건강 판정 코드별 색상
export const JUDGE_COLORS = {
  GOOD: getCSSColor('--color-judge-good', '#16a34a'),
  WARNING: getCSSColor('--color-judge-warning', '#f59e0b'),
  BAD: getCSSColor('--color-judge-bad', '#dc2626'),
  NONE: getCSSColor('--color-judge-none', '#6b7280'),
} as const;

// 차트에서는 CSS 변수 직접 참조도 가능
// <Line stroke="var(--comfy-green-700)" />
// → 테마 변경 시 차트 색상도 자동 변경`}
        highlight={[2, 3, 4, 5, 9, 10, 11, 12]}
      />

      <Callout variant="tip">
        <p>
          <strong>핵심 원칙 정리:</strong>
        </p>
        <p>
          &bull; 원시 값(#0a5c36) → CSS 변수에, 시맨틱 역할(--color-text-primary) → 원시 변수 참조<br />
          &bull; 상태 스타일링은 className 대신 <code>data-*</code> 속성 + CSS 속성 선택자<br />
          &bull; 동적 값(커스텀 색상)은 inline style로 CSS 변수 주입<br />
          &bull; clamp() + rem으로 미디어 쿼리 없이 반응형<br />
          &bull; Safe Area는 변수로 추상화하여 레이아웃 높이에 합산<br />
          &bull; oklch()로 지각적으로 균일한 투명도/그림자 제어
        </p>
      </Callout>
    </DocLayout>
  );
}
