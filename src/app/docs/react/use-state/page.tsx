import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function UseStatePage() {
  return (
    <DocLayout
      title="useState"
      description="컴포넌트에 상태를 추가하는 가장 기본적인 Hook입니다."
    >
      <h2>기본 사용법</h2>
      <p>
        <code>useState</code>는 컴포넌트에 상태 변수를 추가합니다.
        배열 구조 분해를 통해 현재 상태 값과 상태를 업데이트하는 함수를
        받습니다.
      </p>

      <CodeBlock
        filename="Counter.tsx"
        language="tsx"
        code={`import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        증가
      </button>
    </div>
  );
}`}
        highlight={[4]}
      />

      <h2>타입 지정</h2>
      <p>
        TypeScript에서는 초기값으로 타입이 추론되지만,
        명시적으로 제네릭을 사용할 수도 있습니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 타입 자동 추론
const [name, setName] = useState('');         // string
const [count, setCount] = useState(0);        // number
const [isOpen, setIsOpen] = useState(false);  // boolean

// 명시적 타입 지정 (복잡한 타입)
interface User {
  id: number;
  name: string;
  email: string;
}

const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);`}
        highlight={[13, 14]}
      />

      <h2>상태 업데이트 패턴</h2>

      <h3>직접 값 전달</h3>
      <CodeBlock
        language="tsx"
        code={`setCount(5);          // 값을 직접 전달
setName('김철수');     // 새 값으로 교체`}
      />

      <h3>이전 상태 기반 업데이트 (함수형 업데이트)</h3>
      <p>
        이전 상태를 기반으로 새 상태를 계산할 때는 반드시 함수형 업데이트를
        사용하세요.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 이전 상태 기반 업데이트
setCount(prev => prev + 1);

// 여러 번 연속 호출할 때 차이
function handleTripleClick() {
  // 잘못된 방법: 마지막 값만 적용됨
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1); // count + 1 만 적용

  // 올바른 방법: 각각 이전 값 기반으로 증가
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  setCount(prev => prev + 1); // 3 증가
}`}
        highlight={[12, 13, 14]}
      />

      <Callout variant="warning">
        <p>
          이벤트 핸들러 안에서 같은 state를 여러 번 업데이트할 때는 반드시
          <strong> 함수형 업데이트</strong>를 사용하세요. 그렇지 않으면
          React의 배칭(batching) 때문에 마지막 호출만 적용됩니다.
        </p>
      </Callout>

      <h2>객체 & 배열 상태</h2>
      <p>
        React의 상태는 <strong>불변(immutable)</strong>으로 다뤄야 합니다.
        객체나 배열을 직접 수정하지 말고, 새로운 객체/배열을 만들어 전달하세요.
      </p>

      <CodeBlock
        filename="FormExample.tsx"
        language="tsx"
        code={`interface FormData {
  name: string;
  email: string;
  age: number;
}

function Form() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    age: 0,
  });

  // 객체 업데이트 - 스프레드 연산자 사용
  function handleNameChange(name: string) {
    setForm(prev => ({ ...prev, name }));
  }

  // 배열 추가
  const [tags, setTags] = useState<string[]>([]);

  function addTag(tag: string) {
    setTags(prev => [...prev, tag]);
  }

  // 배열에서 특정 항목 제거
  function removeTag(index: number) {
    setTags(prev => prev.filter((_, i) => i !== index));
  }

  // 배열의 특정 항목 수정
  function updateTag(index: number, value: string) {
    setTags(prev => prev.map((tag, i) => i === index ? value : tag));
  }
}`}
        highlight={[16, 23, 28, 33]}
      />

      <Callout variant="danger">
        <p>
          절대로 상태를 직접 변경하지 마세요!
        </p>
      </Callout>

      <CodeBlock
        language="tsx"
        code={`// 절대 하면 안 되는 것
form.name = '새 이름';          // 직접 변경
tags.push('새 태그');           // 직접 변경
setForm(form);                  // 같은 참조 전달

// 올바른 방법
setForm({ ...form, name: '새 이름' });
setTags([...tags, '새 태그']);`}
      />

      <h2>초기값으로 함수 전달 (Lazy Initialization)</h2>
      <p>
        초기값 계산이 비용이 큰 경우, 함수를 전달하면 첫 렌더링에서만 실행됩니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// 매 렌더링마다 실행됨 (비효율)
const [data, setData] = useState(expensiveComputation());

// 첫 렌더링에서만 실행됨 (효율적)
const [data, setData] = useState(() => expensiveComputation());

// 실제 사용 예시: localStorage에서 초기값 읽기
const [theme, setTheme] = useState(() => {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('theme') ?? 'light';
});`}
        highlight={[5]}
      />
    </DocLayout>
  );
}
