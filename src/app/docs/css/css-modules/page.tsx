import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function CssCssModulesPage() {
  return (
    <DocLayout
      title="CSS Modules"
      description="클래스명 충돌 없이 스코프가 격리된 스타일링 방법입니다."
    >
      <h2>CSS Modules란?</h2>
      <p>
        CSS Modules는 CSS 파일의 클래스명을 자동으로 고유하게 변환하여
        다른 컴포넌트와의 스타일 충돌을 방지합니다. 파일명에{" "}
        <code>.module.css</code> 또는 <code>.module.scss</code>를 사용합니다.
      </p>

      <CodeBlock
        language="css"
        code={`/* Button.module.scss */
.root {
  padding: 12px 24px;
  border-radius: 8px;
}

/* 빌드 시 자동 변환 */
/* .Button_root_x7d3f { ... } */`}
      />

      <CodeBlock
        language="tsx"
        code={`import styles from './Button.module.scss';

function Button({ children }: ButtonProps) {
  return <button className={styles.root}>{children}</button>;
}

// 렌더링 결과: <button class="Button_root_x7d3f">클릭</button>`}
        highlight={[1, 4]}
      />

      <h2>프로젝트 규칙</h2>
      <ul>
        <li>Sass(.scss) + CSS Modules 조합 사용</li>
        <li>Tailwind 사용 금지</li>
        <li>CSS Variables로 디자인 토큰 관리</li>
        <li>상태 스타일링은 <code>data-*</code> 속성 사용</li>
      </ul>

      <h2>실전 패턴: Input 컴포넌트</h2>

      <CodeBlock
        filename="Input.module.scss"
        language="css"
        code={`.inputWrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.label {
  position: absolute;
  top: 1.2rem;
  left: 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--gray-700);
  transition: color 0.2s;

  /* data-* 속성으로 상태 스타일링 */
  &[data-success] {
    color: var(--gray-700);
  }

  &[data-error] {
    color: var(--red-800);
  }
}

.input {
  width: 100%;
  height: 7.4rem;
  color: var(--gray-900);
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 2rem 4.8rem 0.2rem 2rem;
  font-size: 1.6rem;
  transition: border-color 0.2s ease-in-out;

  &::placeholder {
    color: var(--gray-500);
  }

  &:focus {
    outline: none;
    border-color: var(--comfy-green-900);
  }

  &[data-error] {
    border-color: var(--red-800);
  }
}`}
        highlight={[17, 18, 21, 22, 43, 44]}
      />

      <h2>클래스명 조합</h2>

      <CodeBlock
        language="tsx"
        code={`// 단일 클래스
<div className={styles.card}>

// 여러 클래스 조합 (템플릿 리터럴)
<div className={\`\${styles.card} \${styles.active}\`}>

// cn/clsx 유틸리티 사용 (프로젝트 래퍼)
import { cn } from '@shared/utils/cn';

<div className={cn(styles.card, isActive && styles.active)}>

// 외부 className과 병합 (컴포넌트 Props)
import { mergeCN } from '@shared/utils/cn';

<div className={mergeCN(styles.root, className)}>
`}
        highlight={[10, 15]}
      />

      <h2>Sass 기능 활용</h2>

      <CodeBlock
        language="css"
        code={`/* 중첩 (Nesting) */
.card {
  padding: 16px;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  /* 자식 요소 */
  .title {
    font-size: 1.2rem;
    font-weight: 700;
  }

  /* data-* 상태 */
  &[data-selected] {
    border-color: var(--primary);
  }
}`}
      />

      <Callout variant="warning">
        <p>
          Sass의 <code>@extend</code>는 CSS Modules에서 예상대로 동작하지
          않을 수 있습니다. 대신 공통 클래스를 직접 적용하거나{" "}
          <code>@mixin</code>을 사용하세요.
        </p>
      </Callout>
    </DocLayout>
  );
}
