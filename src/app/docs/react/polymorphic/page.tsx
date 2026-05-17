import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function PolymorphicPage() {
  return (
    <DocLayout
      title="Polymorphic 컴포넌트"
      description="하나의 컴포넌트가 다양한 HTML 요소로 렌더링되는 패턴입니다."
    >
      <h2>Polymorphic이란?</h2>
      <p>
        같은 Button 컴포넌트가 때로는 <code>&lt;button&gt;</code>,
        때로는 <code>&lt;a&gt;</code>, 때로는 <code>&lt;Link&gt;</code>로
        렌더링되어야 할 때 사용하는 패턴입니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 같은 Button이지만 다른 요소로 렌더링
<Button>일반 버튼</Button>                    {/* → <button> */}
<Button as="a" href="/about">링크 버튼</Button>  {/* → <a> */}
<Button as={Link} href="/home">라우터 링크</Button> {/* → <Link> */}`}
      />

      <h2>실전 적용: Button 컴포넌트</h2>
      <CodeBlock
        filename="Button.tsx"
        language="tsx"
        code={`export function Button({
  ref,
  as,           // 렌더링할 요소/컴포넌트
  className,
  style,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  bgColor,
  fontColor,
  children,
  disabled,
  type,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const baseClassName = cn(styles.root, styles[variant], styles[size]);

  const customStyle = bgColor || fontColor
    ? { ...style, '--btn-bg-color': bgColor, '--btn-font-color': fontColor }
    : style;

  const dataAttributes = {
    'data-full-width': (!fullWidth ? undefined : true),
    'data-loading': (loading || undefined),
  };

  const content = (
    <>
      {leftIcon && <span className={styles.iconWrapper}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={styles.iconWrapper}>{rightIcon}</span>}
    </>
  );

  // as가 있으면 해당 컴포넌트로 렌더링
  if (as) {
    const Component = as;
    return (
      <BaseButton
        disabled={isDisabled}
        focusableWhenDisabled={loading}
        render={
          <Component
            ref={ref}
            className={cn(baseClassName, className)}
            style={customStyle}
            {...dataAttributes}
            {...props}
          >
            {content}
          </Component>
        }
      />
    );
  }

  // 기본: <button>으로 렌더링
  return (
    <BaseButton
      ref={ref}
      type={type ?? 'button'}
      className={cn(baseClassName, className)}
      style={customStyle}
      disabled={isDisabled}
      {...dataAttributes}
      {...props}
    >
      {content}
    </BaseButton>
  );
}`}
        highlight={[3, 39, 40, 45, 46]}
      />

      <Callout variant="note" title="Base UI의 render prop">
        <p>
          Base UI의 <code>render</code> prop을 사용하면 내부 로직(접근성, 키보드 등)은
          유지하면서 렌더링할 요소만 교체할 수 있습니다.
        </p>
      </Callout>

      <h2>data-* 속성으로 상태 관리</h2>
      <CodeBlock
        language="tsx"
        code={`// boolean prop → data-* 속성
const dataAttributes = {
  'data-full-width': fullWidth || undefined,
  'data-loading': loading || undefined,
  'data-underline': underline || undefined,
};

// CSS에서 상태별 스타일링
// .root[data-loading] { pointer-events: none; }
// .root[data-full-width] { width: 100%; }`}
      />

      <h2>CSS Variables로 커스텀 컬러</h2>
      <CodeBlock
        language="tsx"
        code={`// 인라인 스타일로 CSS Variable 전달
const customStyle = hasCustomColor
  ? {
      ...style,
      '--btn-bg-color': bgColor,
      '--btn-font-color': fontColor,
    } as React.CSSProperties
  : style;`}
      />

      <CodeBlock
        language="css"
        code={`/* CSS에서 변수 사용 */
.custom {
  background-color: var(--btn-bg-color);
  color: var(--btn-font-color);
}`}
      />
    </DocLayout>
  );
}
