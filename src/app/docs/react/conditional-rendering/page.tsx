import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ReactConditionalRenderingPage() {
  return (
    <DocLayout
      title="조건부 렌더링"
      description="조건에 따라 다른 UI를 표시하는 다양한 패턴을 알아봅니다."
    >
      <h2>if 문으로 분기</h2>
      <p>
        조건에 따라 완전히 다른 컴포넌트를 반환할 때 사용합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`function StatusBadge({ status }: { status: 'required' | 'optional' }) {
  if (status === 'required') {
    return <span className={styles.required}>필수</span>;
  }
  return <span className={styles.optional}>선택</span>;
}`}
      />

      <h2>삼항 연산자</h2>
      <p>JSX 안에서 조건에 따라 다른 요소를 표시할 때 사용합니다.</p>

      <CodeBlock
        language="tsx"
        code={`function Greeting({ isLoggedIn, name }: Props) {
  return (
    <div>
      {isLoggedIn
        ? <p>안녕하세요, {name}님!</p>
        : <p>로그인해주세요.</p>
      }
    </div>
  );
}`}
      />

      <h2>논리 AND (&&) 연산자</h2>
      <p>
        조건이 참일 때만 요소를 표시하고, 거짓이면 아무것도 표시하지 않을 때
        사용합니다.
      </p>

      <CodeBlock
        filename="Badge.tsx"
        language="tsx"
        code={`function Badge({ count, children }: BadgeProps) {
  return (
    <div className={styles.container}>
      {children}
      {count > 0 && (
        <span className={styles.badge}>{count}</span>
      )}
    </div>
  );
}`}
        highlight={[5, 6, 7]}
      />

      <Callout variant="danger">
        <p>
          <code>count && {'<Badge />'}</code>에서 count가 <code>0</code>이면
          화면에 <code>0</code>이 표시됩니다! 숫자 조건은 반드시{" "}
          <code>count &gt; 0 &&</code>처럼 boolean으로 변환하세요.
        </p>
      </Callout>

      <h2>실전 패턴: data-* 속성으로 조건부 스타일링</h2>
      <p>
        프로젝트에서는 조건부 className 대신 <code>data-*</code> 속성을
        활용합니다. CSS에서 속성 선택자로 스타일을 분기합니다.
      </p>

      <CodeBlock
        filename="Button.tsx"
        language="tsx"
        code={`function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={styles[variant]}
      disabled={isDisabled}
      data-loading={loading || undefined}
      data-full-width={fullWidth || undefined}
      {...props}
    >
      {children}
    </button>
  );
}`}
        highlight={[15, 16]}
      />

      <CodeBlock
        filename="Button.module.scss"
        language="css"
        code={`.primary {
  background: var(--flow-green-500);
  color: white;
}

/* data-* 속성으로 상태 스타일링 */
.primary[data-loading] {
  pointer-events: none;
}

.primary[data-full-width] {
  width: 100%;
}`}
        highlight={[7, 11]}
      />

      <Callout variant="tip">
        <p>
          <code>data-loading={'{loading || undefined}'}</code>에서{" "}
          <code>|| undefined</code>가 중요합니다.
          <code>false</code>를 전달하면 <code>data-loading=&quot;false&quot;</code>가
          렌더링되지만, <code>undefined</code>는 속성 자체가 제거됩니다.
        </p>
      </Callout>

      <h2>패턴 비교</h2>
      <table>
        <thead>
          <tr>
            <th>패턴</th>
            <th>적합한 상황</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>if/return</code></td>
            <td>완전히 다른 컴포넌트 반환</td>
          </tr>
          <tr>
            <td>삼항 연산자</td>
            <td>A 또는 B 중 하나를 표시</td>
          </tr>
          <tr>
            <td><code>&&</code></td>
            <td>조건 충족 시에만 표시</td>
          </tr>
          <tr>
            <td><code>data-*</code> 속성</td>
            <td>같은 요소의 스타일만 변경</td>
          </tr>
        </tbody>
      </table>
    </DocLayout>
  );
}
