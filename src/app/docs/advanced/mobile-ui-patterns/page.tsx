import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function MobileUiPatternsPage() {
  return (
    <DocLayout
      title="하이브리드 앱 모바일 UI 패턴"
      description="WebView 기반 하이브리드 앱에서 네이티브 느낌을 구현하는 핵심 UI 패턴 모음입니다."
    >
      <h2>모바일 앱 느낌의 핵심</h2>
      <p>
        웹뷰 앱이 &ldquo;웹 같다&rdquo;고 느껴지는 이유는 대부분 3가지입니다:
        스크롤이 뻑뻑함, 터치 반응이 느림, 레이아웃이 밀림.
        이 세 가지만 잡으면 네이티브와 구분이 어렵습니다.
      </p>

      <h2>1. 고정 헤더 + 스크롤 콘텐츠 + 하단 탭/CTA</h2>

      <CodeBlock
        filename="AppLayout.tsx"
        language="tsx"
        code={`export function AppLayout({ children, header, bottom }: AppLayoutProps) {
  return (
    <div className={styles.layout}>
      {header && <header className={styles.header}>{header}</header>}
      <main className={styles.content}>{children}</main>
      {bottom && <footer className={styles.bottom}>{bottom}</footer>}
    </div>
  );
}`}
      />

      <CodeBlock
        filename="AppLayout.module.scss"
        language="scss"
        code={`.layout {
  display: flex;
  flex-direction: column;
  height: 100dvh;  /* 동적 뷰포트 (주소창 고려) */
}

.header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  height: calc(4.8rem + var(--sat));
  padding-top: var(--sat);
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.85);
}

.content {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior-y: contain;  /* 당겨서 새로고침 방지 */
  -webkit-overflow-scrolling: touch;  /* iOS 모멘텀 스크롤 */
}

.bottom {
  flex-shrink: 0;
  padding: 1.2rem 1.6rem;
  padding-bottom: calc(1.2rem + var(--sab));  /* 홈바 여백 */
  background: white;
  box-shadow: 0 -1px 0 var(--gray-100);
}`}
        highlight={[4, 12, 13, 14, 15, 21, 22, 28]}
      />

      <h2>2. 터치 피드백 (네이티브 느낌의 핵심)</h2>

      <CodeBlock
        filename="touchable.module.scss"
        language="scss"
        code={`/* 터치 피드백 — :active 사용 */
.touchable {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;  /* 파란 하이라이트 제거 */
  transition: transform 0.1s ease, opacity 0.1s ease;

  &:active {
    transform: scale(0.97);  /* 살짝 줄어듦 */
    opacity: 0.7;
  }
}

/* 리스트 아이템 터치 (배경색 변경) */
.listItem {
  position: relative;
  transition: background-color 0.15s ease;

  &:active {
    background-color: var(--gray-050);
  }

  /* 또는 ::after 오버레이로 (기존 배경 유지) */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: transparent;
    transition: background 0.15s ease;
  }
  &:active::after {
    background: rgba(0, 0, 0, 0.05);
  }
}

/* 버튼 press 효과 */
.button {
  transition: transform 0.1s ease;
  &:active {
    transform: scale(0.98);
  }
  /* disabled면 효과 없음 */
  &[data-disabled] {
    pointer-events: none;
    opacity: 0.4;
  }
}`}
        highlight={[4, 7, 8, 9, 19, 20, 30, 31, 38, 39]}
      />

      <Callout variant="warning">
        <p>
          <code>-webkit-tap-highlight-color: transparent</code>를 전역으로
          설정하세요. iOS WebView에서 터치 시 나타나는 파란 하이라이트가
          &ldquo;웹 느낌&rdquo;의 가장 큰 원인입니다.
        </p>
      </Callout>

      <h2>3. Pull-to-Refresh 방지 + 바운스 제어</h2>

      <CodeBlock
        filename="globals.scss"
        language="scss"
        code={`/* 전역 설정 */
html, body {
  /* iOS 바운스 스크롤 방지 */
  overscroll-behavior: none;

  /* WebView에서 불필요한 동작 방지 */
  -webkit-touch-callout: none;  /* 길게 누르기 메뉴 */
  user-select: none;             /* 텍스트 선택 방지 */

  /* 텍스트 입력 필드는 선택 허용 */
  input, textarea {
    user-select: text;
    -webkit-user-select: text;
  }
}

/* 특정 영역만 스크롤 허용 */
.scrollArea {
  overflow-y: auto;
  overscroll-behavior-y: contain;  /* 내부 스크롤만, 부모 전파 X */
  -webkit-overflow-scrolling: touch;
}`}
        highlight={[4, 7, 8, 11, 12, 20, 21]}
      />

      <h2>4. 바텀 시트</h2>

      <CodeBlock
        filename="BottomSheet.module.scss"
        language="scss"
        code={`/* 바텀 시트 기본 구조 */
.overlay {
  position: fixed;
  inset: 0;
  background: var(--dim-bk-60);
  z-index: var(--z-modal);

  /* 진입 애니메이션 */
  animation: fadeIn 0.2s ease;
}

.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding-bottom: var(--sab);  /* Safe Area */
  z-index: calc(var(--z-modal) + 1);

  /* 슬라이드 업 */
  animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

/* 높이 variants */
.sheet[data-height='auto']  { max-height: 90dvh; }
.sheet[data-height='half']  { height: 50dvh; }
.sheet[data-height='full']  { height: calc(100dvh - var(--sat) - 2rem); }

/* 드래그 핸들 */
.handle {
  width: 3.6rem;
  height: 0.4rem;
  border-radius: 0.2rem;
  background: var(--gray-300);
  margin: 1.2rem auto;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}`}
        highlight={[12, 18, 19, 20, 23, 27, 28, 29]}
      />

      <h2>5. 네이티브 스타일 리스트</h2>

      <CodeBlock
        filename="ListItem.module.scss"
        language="scss"
        code={`/* 설정/메뉴 리스트 */
.listItem {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.6rem;
  min-height: 5.6rem;

  /* 하단 구분선 (마지막 제외) */
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 1.6rem;   /* 아이콘 안 잘리게 들여쓰기 */
    right: 0;
    height: 1px;
    background: var(--gray-100);
  }

  /* 우측 화살표 */
  &[data-has-arrow] {
    padding-right: 4rem;
    &::before {
      content: '';
      position: absolute;
      right: 1.6rem;
      width: 0.8rem;
      height: 0.8rem;
      border-right: 2px solid var(--gray-300);
      border-bottom: 2px solid var(--gray-300);
      transform: rotate(-45deg);
    }
  }
}

.listItemContent {
  flex: 1;
  min-width: 0;  /* 말줄임 작동을 위해 필수 */
}

.listItemTitle {
  font-size: 1.6rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.listItemSub {
  font-size: 1.3rem;
  color: var(--gray-500);
  margin-top: 0.2rem;
}`}
        highlight={[10, 14, 21, 22, 37]}
      />

      <h2>6. 토스트 메시지</h2>

      <CodeBlock
        filename="Toast.module.scss"
        language="scss"
        code={`.toast {
  position: fixed;
  bottom: calc(8rem + var(--sab));
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);

  max-width: calc(100% - 3.2rem);
  padding: 1.2rem 2rem;
  border-radius: var(--radius-md);
  background: var(--gray-900);
  color: white;
  font-size: 1.4rem;
  text-align: center;

  /* 등장 애니메이션 */
  animation:
    slideUpFade 0.3s ease,
    slideDownFade 0.3s ease 2.7s forwards;  /* 3초 후 퇴장 */
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@keyframes slideDownFade {
  from { opacity: 1; transform: translateX(-50%) translateY(0); }
  to   { opacity: 0; transform: translateX(-50%) translateY(20px); }
}`}
        highlight={[2, 3, 4, 17, 18, 19]}
      />

      <h2>7. 스켈레톤 로딩</h2>

      <CodeBlock
        filename="Skeleton.module.scss"
        language="scss"
        code={`.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-100) 25%,
    var(--gray-050) 50%,
    var(--gray-100) 75%
  );
  background-size: 400% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

/* 변형: 텍스트, 원형, 카드 */
.text   { height: 1.4rem; width: 60%; }
.circle { width: 4rem; height: 4rem; border-radius: 50%; }
.card   { height: 12rem; width: 100%; border-radius: var(--radius-lg); }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}`}
        highlight={[2, 3, 4, 5, 6, 8, 9]}
      />

      <CodeBlock
        filename="Skeleton.tsx"
        language="tsx"
        code={`interface SkeletonProps {
  variant?: 'text' | 'circle' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({ variant = 'text', width, height, count = 1 }: SkeletonProps) {
  const style = {
    ...(width && { width: typeof width === 'number' ? \`\${width}rem\` : width }),
    ...(height && { height: typeof height === 'number' ? \`\${height}rem\` : height }),
  };

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cn(styles.skeleton, styles[variant])}
          style={style}
        />
      ))}
    </>
  );
}

// 사용
<Skeleton variant="text" count={3} />
<Skeleton variant="circle" width={4} height={4} />
<Skeleton variant="card" height={12} />`}
        highlight={[8, 16, 17]}
      />

      <h2>8. 입력 필드 (모바일 최적화)</h2>

      <CodeBlock
        filename="Input.module.scss"
        language="scss"
        code={`.inputWrapper {
  position: relative;
}

.input {
  width: 100%;
  height: 5.6rem;
  padding: 2.4rem 1.6rem 0.8rem;  /* 라벨 공간 확보 */
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-size: 1.6rem;  /* iOS 16px 미만이면 자동 줌! */
  background: white;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: var(--comfy-green-700);
  }

  &[data-error] {
    border-color: var(--friendly-coral-900);
  }
}

/* 플로팅 라벨 */
.label {
  position: absolute;
  left: 1.6rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.6rem;
  color: var(--gray-500);
  transition: all 0.15s ease;
  pointer-events: none;

  /* 값이 있거나 포커스되면 위로 올라감 */
  .input:focus + &,
  .input:not(:placeholder-shown) + & {
    top: 1.2rem;
    transform: translateY(0);
    font-size: 1.2rem;
  }
}

.errorMessage {
  margin-top: 0.4rem;
  font-size: 1.2rem;
  color: var(--friendly-coral-900);
}`}
        highlight={[11, 36, 37, 38, 39, 40, 41]}
      />

      <Callout variant="danger">
        <p>
          iOS에서 <code>font-size</code>가 16px(1.6rem) 미만이면 입력 시
          <strong>자동 줌</strong>이 발생합니다. 입력 필드는 반드시 16px
          이상으로 설정하세요.
        </p>
      </Callout>

      <h2>9. 탭 바 (하단 내비게이션)</h2>

      <CodeBlock
        filename="TabBar.module.scss"
        language="scss"
        code={`.tabBar {
  display: flex;
  height: calc(5.4rem + var(--sab));
  padding-bottom: var(--sab);
  background: white;
  border-top: 1px solid var(--gray-100);
}

.tabItem {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  font-size: 1rem;
  color: var(--gray-500);
  -webkit-tap-highlight-color: transparent;

  /* 활성 탭 */
  &[data-active] {
    color: var(--gray-900);
  }

  /* 알림 뱃지 */
  &[data-badge]::after {
    content: '';
    position: absolute;
    top: 0.6rem;
    right: calc(50% - 1.2rem);
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--friendly-coral-900);
  }
}

.tabIcon {
  width: 2.4rem;
  height: 2.4rem;
}`}
        highlight={[2, 3, 21, 22, 26, 27]}
      />

      <h2>실전 체크리스트</h2>

      <CodeBlock
        language="text"
        code={`하이브리드 앱 UI 구현 시 반드시 확인:

□ Safe Area (노치/홈바)
  - 헤더: padding-top에 sat 포함
  - 하단 고정: padding-bottom에 sab 포함
  - 전체 레이아웃: 100dvh (vh 아닌 dvh)

□ 터치 최적화
  - -webkit-tap-highlight-color: transparent (전역)
  - :active 피드백 (scale 또는 opacity)
  - touch-action: manipulation (더블탭 줌 방지)
  - 최소 터치 영역: 44x44px

□ 스크롤
  - overscroll-behavior: contain (pull-to-refresh 방지)
  - -webkit-overflow-scrolling: touch (iOS)
  - 스크롤 영역에 momentum 스크롤

□ 입력 필드
  - font-size: 16px 이상 (iOS 자동 줌 방지)
  - autocomplete, inputmode 속성 설정
  - 가상 키보드 올라올 때 레이아웃 밀림 체크

□ 성능
  - 스켈레톤 로딩 (네이티브 앱처럼 즉시 구조 표시)
  - 이미지 lazy loading
  - 무거운 컴포넌트 dynamic import

□ 제스처 충돌
  - 좌우 스와이프: iOS 뒤로가기와 충돌 주의
  - Swiper touchStartPreventDefault: false`}
      />

      <Callout variant="tip">
        <p>
          <strong>네이티브 앱과 구별이 안 되는 웹뷰 앱의 비결:</strong>{" "}
          Safe Area + 터치 피드백 + 모멘텀 스크롤 + 스켈레톤 로딩.
          이 4가지만 제대로 하면 사용자는 네이티브인지 웹인지 모릅니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
