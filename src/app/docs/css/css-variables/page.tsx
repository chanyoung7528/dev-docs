import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function CssCssVariablesPage() {
  return (
    <DocLayout
      title="CSS Variables"
      description="디자인 토큰을 CSS 변수로 관리하여 일관된 스타일을 유지하는 방법입니다."
    >
      <h2>CSS Variables란?</h2>
      <p>
        CSS Custom Properties(CSS Variables)는{" "}
        <code>--</code>로 시작하는 변수로, <code>var()</code> 함수로
        참조합니다. 런타임에 동적으로 변경 가능하며, 상속됩니다.
      </p>

      <CodeBlock
        language="css"
        code={`:root {
  /* 정의 */
  --primary: #087ea4;
  --radius-md: 8px;
  --font-size-base: 1rem;
}

.button {
  /* 사용 */
  background-color: var(--primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

/* 폴백 값 */
.card {
  color: var(--card-color, #333);  /* --card-color 없으면 #333 */
}`}
        highlight={[3, 4, 5, 10, 11, 12, 17]}
      />

      <h2>실전 적용: 디자인 토큰 체계</h2>
      <p>
        프로젝트에서는 색상, 간격, 보더, 폰트 등을{" "}
        CSS Variables로 정의합니다.
      </p>

      <CodeBlock
        filename="variables.scss"
        language="css"
        code={`:root {
  /* 색상 팔레트 */
  --gray-200: #e4e6eb;
  --gray-500: #99a1b3;
  --gray-700: #5e687e;
  --gray-900: #23272f;

  --comfy-green-900: #2b8a3e;
  --friendly-coral-900: #d1242f;
  --flow-green-500: #087ea4;

  --white: #ffffff;
  --red-800: #d1242f;

  /* 간격 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* z-index 계층 */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-toast: 700;
}`}
      />

      <h2>컴포넌트 레벨 변수</h2>
      <p>
        컴포넌트 내부에서만 사용하는 변수를 정의하여 스타일을 유연하게
        제어합니다.
      </p>

      <CodeBlock
        filename="Button.module.scss"
        language="css"
        code={`.root {
  /* 컴포넌트 레벨 변수 */
  --spinner-size: 1.4rem;

  border: 0.1rem solid var(--flow-green-500);
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &[data-loading]::after {
    width: var(--spinner-size);
    height: var(--spinner-size);
    /* 로딩 스피너 */
  }
}

/* 사이즈별 스피너 크기 조절 */
.sm { --spinner-size: 1.2rem; }
.md { --spinner-size: 1.4rem; }
.lg { --spinner-size: 1.8rem; }`}
        highlight={[3, 9, 10, 16, 17, 18]}
      />

      <h2>JavaScript에서 동적 변수</h2>
      <p>
        React 컴포넌트에서 CSS Variables를 동적으로 설정할 수 있습니다.
      </p>

      <CodeBlock
        filename="Button.tsx"
        language="tsx"
        code={`function Button({
  bgColor,
  fontColor,
  style,
  ...props
}: ButtonProps) {
  const hasCustomColor = Boolean(bgColor || fontColor);

  // CSS Variables를 인라인 스타일로 전달
  const customStyle = hasCustomColor
    ? {
        ...style,
        '--btn-bg-color': bgColor,
        '--btn-font-color': fontColor,
      } as React.CSSProperties
    : style;

  return (
    <button
      className={cn(styles.root, hasCustomColor && styles.custom)}
      style={customStyle}
      {...props}
    />
  );
}`}
        highlight={[12, 13, 14]}
      />

      <CodeBlock
        filename="Button.module.scss"
        language="css"
        code={`.custom {
  background-color: var(--btn-bg-color);
  color: var(--btn-font-color);
}`}
      />

      <h2>아이콘 크기 관리</h2>
      <CodeBlock
        language="css"
        code={`/* CSS Variable로 아이콘 크기 통일 */
.arrow {
  --size: 1.4rem;
  width: var(--size);
  height: var(--size);
  color: var(--gray-700);
}`}
      />

      <Callout variant="tip">
        <p>
          CSS Variables의 장점은 <strong>상속</strong>입니다. 부모에서 정의한
          변수를 자식에서 그대로 사용할 수 있고, 컴포넌트 단위로 오버라이드할
          수도 있습니다. 테마 전환에도 효과적입니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
