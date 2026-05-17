import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function JsxPage() {
  return (
    <DocLayout
      title="JSX 이해하기"
      description="JSX는 JavaScript를 확장한 문법으로, React에서 UI를 표현하는 방식입니다."
    >
      <h2>JSX란?</h2>
      <p>
        JSX는 JavaScript XML의 약자로, JavaScript 안에서 HTML과 유사한 마크업을
        작성할 수 있게 해주는 문법 확장입니다. 브라우저가 직접 이해할 수 있는
        문법은 아니며, Babel 같은 트랜스파일러가{" "}
        <code>React.createElement()</code> 호출로 변환합니다.
      </p>

      <CodeBlock
        filename="App.tsx"
        language="tsx"
        code={`// JSX 문법
function App() {
  return <h1>Hello, World!</h1>;
}

// 위 코드는 아래로 변환됩니다
function App() {
  return React.createElement('h1', null, 'Hello, World!');
}`}
        highlight={[3, 8]}
      />

      <Callout variant="note">
        <p>
          React 17부터는 새로운 JSX Transform 덕분에{" "}
          <code>import React from &quot;react&quot;</code>를 명시적으로 작성하지
          않아도 됩니다.
        </p>
      </Callout>

      <h2>JSX 규칙</h2>

      <h3>1. 단일 루트 요소 반환</h3>
      <p>
        JSX에서는 반드시 하나의 루트 요소만 반환해야 합니다. 여러 요소를 반환하고
        싶다면 <code>&lt;div&gt;</code> 또는 <code>&lt;Fragment&gt;</code>로
        감싸야 합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// Fragment를 사용한 다중 요소 반환
function Profile() {
  return (
    <>
      <h1>김철수</h1>
      <p>프론트엔드 개발자</p>
    </>
  );
}`}
      />

      <h3>2. 모든 태그는 닫아야 한다</h3>
      <p>
        HTML에서는 <code>&lt;img&gt;</code>, <code>&lt;br&gt;</code> 같은 태그를
        닫지 않아도 되지만, JSX에서는 모든 태그를 반드시 닫아야 합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// HTML
<img src="photo.jpg">
<br>

// JSX - 반드시 닫아야 함
<img src="photo.jpg" />
<br />`}
      />

      <h3>3. camelCase 속성명</h3>
      <p>
        JSX에서는 HTML 속성을 camelCase로 작성합니다. <code>class</code>는{" "}
        <code>className</code>, <code>for</code>는 <code>htmlFor</code>가
        됩니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// HTML
<div class="container" tabindex="0">
  <label for="name">이름</label>
</div>

// JSX
<div className="container" tabIndex={0}>
  <label htmlFor="name">이름</label>
</div>`}
        highlight={[7, 8]}
      />

      <h2>JSX에서 JavaScript 표현식 사용</h2>
      <p>
        중괄호 <code>{"{}"}</code>를 사용하면 JSX 안에서 JavaScript 표현식을
        사용할 수 있습니다. 변수, 함수 호출, 삼항 연산자 등 모든 유효한
        JavaScript 표현식이 가능합니다.
      </p>

      <CodeBlock
        filename="Greeting.tsx"
        language="tsx"
        code={`function Greeting({ name }: { name: string }) {
  const hour = new Date().getHours();
  const isEvening = hour >= 18;

  return (
    <div>
      <h1>{isEvening ? '좋은 저녁이에요' : '안녕하세요'}, {name}님!</h1>
      <p>현재 시각: {hour}시</p>
    </div>
  );
}`}
        highlight={[7, 8]}
      />

      <Callout variant="warning">
        <p>
          JSX 중괄호 안에는 <strong>표현식(expression)</strong>만 사용할 수
          있습니다. <code>if</code>, <code>for</code> 같은{" "}
          <strong>문(statement)</strong>은 사용할 수 없습니다.
        </p>
      </Callout>

      <h2>스타일 적용</h2>
      <p>
        인라인 스타일은 문자열이 아니라 객체로 전달합니다. CSS 속성명은
        camelCase로 작성합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 인라인 스타일 (객체)
<div style={{ backgroundColor: '#f0f0f0', padding: '16px' }}>
  스타일 적용
</div>

// CSS Modules 사용 (권장)
import styles from './Card.module.css';

<div className={styles.card}>
  CSS Modules
</div>`}
      />

      <Callout variant="tip">
        <p>
          인라인 스타일보다는 <strong>CSS Modules</strong>를 사용하는 것을
          권장합니다. 스코프가 자동으로 격리되어 클래스명 충돌을 방지할 수
          있습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
