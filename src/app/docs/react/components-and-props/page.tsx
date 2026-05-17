import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ComponentsAndPropsPage() {
  return (
    <DocLayout
      title="컴포넌트와 Props"
      description="컴포넌트는 UI를 독립적이고 재사용 가능한 조각으로 나눈 것입니다."
    >
      <h2>컴포넌트란?</h2>
      <p>
        React에서 컴포넌트는 UI의 독립적인 조각입니다. 버튼, 카드, 폼 등
        화면의 모든 요소를 컴포넌트로 만들 수 있습니다. 컴포넌트는 JavaScript
        함수로 정의하며, JSX를 반환합니다.
      </p>

      <CodeBlock
        filename="Button.tsx"
        language="tsx"
        code={`interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function Button({ label, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button
      className={styles[variant]}
      onClick={onClick}
    >
      {label}
    </button>
  );
}`}
        highlight={[1, 7]}
      />

      <h2>Props</h2>
      <p>
        Props(Properties)는 부모 컴포넌트가 자식 컴포넌트에 전달하는 데이터입니다.
        함수의 인자와 같은 개념으로, 컴포넌트를 재사용 가능하게 만들어줍니다.
      </p>

      <h3>Props 타입 정의</h3>
      <p>
        TypeScript에서는 <code>interface</code>로 Props의 타입을 명시합니다.
        선택적 속성은 <code>?</code>를 붙여 표현합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`interface CardProps {
  title: string;
  description?: string;        // 선택적 prop
  children: React.ReactNode;   // 자식 요소
}

function Card({ title, description, children }: CardProps) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <div>{children}</div>
    </div>
  );
}

// 사용
<Card title="공지사항" description="중요한 안내">
  <p>내용이 여기에 들어갑니다.</p>
</Card>`}
      />

      <Callout variant="note">
        <p>
          Props는 <strong>읽기 전용(read-only)</strong>입니다. 자식 컴포넌트에서
          Props를 직접 수정해서는 안 됩니다. 데이터를 변경하려면 State를
          사용하세요.
        </p>
      </Callout>

      <h2>children Props</h2>
      <p>
        <code>children</code>은 특별한 prop으로, 컴포넌트 태그 사이에 넣은
        내용이 전달됩니다. 레이아웃이나 래퍼 컴포넌트를 만들 때 자주 사용합니다.
      </p>

      <CodeBlock
        filename="Layout.tsx"
        language="tsx"
        code={`interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <header>헤더</header>
      <main>{children}</main>
      <footer>푸터</footer>
    </div>
  );
}

// 사용
<Layout>
  <h1>페이지 제목</h1>
  <p>페이지 내용</p>
</Layout>`}
      />

      <h2>기본값 설정</h2>
      <p>
        구조 분해 할당에서 기본값을 지정하면 prop이 전달되지 않았을 때 사용할
        값을 설정할 수 있습니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`interface AvatarProps {
  src?: string;
  size?: number;
  alt?: string;
}

function Avatar({
  src = '/default-avatar.png',
  size = 40,
  alt = '프로필 이미지',
}: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
    />
  );
}`}
        highlight={[8, 9, 10]}
      />

      <Callout variant="tip">
        <p>
          컴포넌트는 <strong>하나의 역할</strong>만 수행하도록 설계하세요.
          너무 많은 props가 필요하다면 컴포넌트를 더 작은 단위로 분리하는 것을
          고려해보세요.
        </p>
      </Callout>
    </DocLayout>
  );
}
