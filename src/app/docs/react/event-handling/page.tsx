import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ReactEventHandlingPage() {
  return (
    <DocLayout
      title="이벤트 처리"
      description="React에서 사용자 인터랙션을 처리하는 방법을 알아봅니다."
    >
      <h2>이벤트 핸들러 기본</h2>
      <p>
        React에서 이벤트 핸들러는 JSX에 함수를 전달하는 방식으로 등록합니다.
        HTML과 달리 camelCase로 작성하고, 문자열이 아닌 함수를 전달합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// HTML
<button onclick="handleClick()">클릭</button>

// React - 함수 참조를 전달
<button onClick={handleClick}>클릭</button>

// 인라인 화살표 함수 (인자가 필요한 경우)
<button onClick={() => handleDelete(id)}>삭제</button>`}
        highlight={[5, 8]}
      />

      <Callout variant="warning">
        <p>
          <code>onClick={'{handleClick()}'}</code>처럼 함수를 호출하면 안 됩니다.
          렌더링 시점에 즉시 실행됩니다.
          <code>onClick={'{handleClick}'}</code>처럼 함수 참조를 전달하세요.
        </p>
      </Callout>

      <h2>이벤트 타입</h2>
      <p>TypeScript에서는 이벤트 객체의 타입을 명시합니다.</p>

      <CodeBlock
        language="tsx"
        code={`function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value);
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  // 폼 제출 처리
}

function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'Enter') {
    // Enter 키 처리
  }
}`}
      />

      <h2>실전 패턴: 이벤트 전파 제어</h2>
      <p>
        프로젝트에서 약관 동의 항목을 구현할 때, 체크박스 클릭과 상세보기
        버튼 클릭이 겹치는 상황을 <code>stopPropagation</code>으로 해결했습니다.
      </p>

      <CodeBlock
        filename="AgreementItem.tsx"
        language="tsx"
        code={`function AgreementItem({ agreement, checked, onCheckedChange, onViewDetail }: AgreementItemProps) {
  const { agrmNo } = agreement;

  function handleCheckedChange(newChecked: boolean) {
    onCheckedChange(agrmNo, newChecked);
  }

  function handleDetailClick(e: React.MouseEvent) {
    e.stopPropagation();  // 부모의 체크 이벤트 전파 방지
    onViewDetail(agrmNo);
  }

  return (
    <div className={styles.item}>
      <Check checked={checked} onCheckedChange={handleCheckedChange} />
      <span className={styles.title}>{agreement.title}</span>
      <Button variant="ghost" onClick={handleDetailClick}>
        상세
      </Button>
    </div>
  );
}`}
        highlight={[8, 9]}
      />

      <Callout variant="note">
        <p>
          <code>stopPropagation()</code>은 이벤트가 부모 요소로 전파되는 것을
          막습니다. <code>preventDefault()</code>는 브라우저 기본 동작
          (폼 제출, 링크 이동 등)을 막습니다. 둘은 다른 개념입니다.
        </p>
      </Callout>

      <h2>이벤트 핸들러 네이밍 컨벤션</h2>
      <table>
        <thead>
          <tr>
            <th>위치</th>
            <th>접두사</th>
            <th>예시</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>핸들러 함수</td>
            <td><code>handle</code></td>
            <td><code>handleClick</code>, <code>handleSubmit</code></td>
          </tr>
          <tr>
            <td>Props 콜백</td>
            <td><code>on</code></td>
            <td><code>onClick</code>, <code>onSubmit</code></td>
          </tr>
        </tbody>
      </table>

      <CodeBlock
        language="tsx"
        code={`// 부모: on 접두사로 콜백 전달
<SearchBar onSearch={handleSearch} />

// 자식: handle 접두사로 내부 핸들러 정의
function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query);
  }
  // ...
}`}
      />
    </DocLayout>
  );
}
