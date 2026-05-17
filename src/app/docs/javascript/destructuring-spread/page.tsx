import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function DestructuringSpreadPage() {
  return (
    <DocLayout
      title="구조 분해 & 스프레드"
      description="객체와 배열에서 값을 추출하고, 불변성을 유지하며 업데이트하는 핵심 패턴입니다."
    >
      <h2>객체 구조 분해</h2>

      <CodeBlock
        language="typescript"
        code={`const user = { name: 'Kim', age: 30, email: 'kim@test.com', role: 'admin' };

// 기본 구조 분해
const { name, age } = user;
// name = 'Kim', age = 30

// 이름 변경 (별칭)
const { name: userName, age: userAge } = user;
// userName = 'Kim', userAge = 30

// 기본값 지정
const { nickname = '미설정' } = user;
// nickname = '미설정' (user에 nickname이 없으므로)

// 나머지 속성 (...rest)
const { name: n, ...rest } = user;
// n = 'Kim'
// rest = { age: 30, email: 'kim@test.com', role: 'admin' }`}
        highlight={[4, 8, 12, 16]}
      />

      <h2>배열 구조 분해</h2>

      <CodeBlock
        language="typescript"
        code={`const colors = ['red', 'green', 'blue', 'yellow'];

// 기본 배열 구조 분해
const [first, second] = colors;
// first = 'red', second = 'green'

// 특정 위치 건너뛰기
const [, , third] = colors;
// third = 'blue'

// 나머지 배열
const [head, ...tail] = colors;
// head = 'red'
// tail = ['green', 'blue', 'yellow']

// React의 useState가 배열 구조 분해를 쓰는 이유:
// 이름을 자유롭게 지을 수 있음
const [count, setCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);`}
        highlight={[4, 8, 12, 18, 19]}
      />

      <h2>함수 매개변수에서 구조 분해</h2>

      <CodeBlock
        language="typescript"
        code={`// Props 구조 분해 — React에서 가장 많이 쓰는 패턴
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick: () => void;
}

function Button({ label, variant = 'primary', disabled = false, onClick }: ButtonProps) {
  return (
    <button className={variant} disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
}

// 중첩 구조 분해
interface ApiResponse {
  data: { user: { name: string; profile: { avatar: string } } };
}

function processResponse({ data: { user: { name, profile: { avatar } } } }: ApiResponse) {
  console.log(name, avatar);
}`}
        highlight={[9, 22]}
      />

      <h2>스프레드 연산자 — 객체 복사 & 병합</h2>

      <CodeBlock
        language="typescript"
        code={`const defaults = { theme: 'light', lang: 'ko', fontSize: 14 };
const userPrefs = { theme: 'dark', fontSize: 16 };

// 객체 병합 (뒤의 값이 앞을 덮어씀)
const config = { ...defaults, ...userPrefs };
// { theme: 'dark', lang: 'ko', fontSize: 16 }

// 객체 복사 + 속성 추가/변경
const updatedUser = { ...user, name: 'Lee', updatedAt: new Date() };

// 조건부 속성 추가
const query = {
  page: 1,
  size: 10,
  ...(category && { category }),
  ...(search && { search }),
};
// category가 truthy면 { category: 'equity' } 병합, falsy면 아무것도 안 병합`}
        highlight={[5, 9, 14, 15]}
      />

      <Callout variant="warning">
        <p>
          스프레드 연산자는 <strong>얕은 복사(shallow copy)</strong>입니다.
          중첩 객체는 참조가 복사되므로, 중첩 객체를 변경하면 원본도 변경됩니다.
        </p>
      </Callout>

      <h2>React 상태 불변 업데이트 (가장 중요)</h2>
      <p>
        React에서 상태를 직접 변경하면 리렌더가 일어나지 않습니다.
        반드시 새 객체/배열을 만들어 전달해야 합니다.
      </p>

      <CodeBlock
        filename="immutable-update.ts"
        language="typescript"
        code={`// 객체 업데이트
setState(prev => ({ ...prev, name: 'New Name' }));

// 중첩 객체 업데이트 — 변경된 경로의 모든 레벨을 복사
setState(prev => ({
  ...prev,
  user: {
    ...prev.user,
    address: { ...prev.user.address, city: 'Seoul' },
  },
}));

// 배열: 추가
setItems(prev => [...prev, newItem]);

// 배열: 삭제 (특정 id)
setItems(prev => prev.filter(item => item.id !== targetId));

// 배열: 수정 (특정 id의 항목만 변경)
setItems(prev => prev.map(item =>
  item.id === targetId ? { ...item, name: 'updated' } : item
));

// 배열: 특정 위치에 삽입
setItems(prev => [
  ...prev.slice(0, index),
  newItem,
  ...prev.slice(index),
]);`}
        highlight={[2, 5, 14, 17, 20, 25]}
      />

      <Callout variant="note">
        <p>
          중첩이 깊어지면 <code>immer</code> 라이브러리를 고려하세요. Zustand의{" "}
          <code>immer</code> 미들웨어를 쓰면 <code>state.user.address.city = &apos;Seoul&apos;</code>처럼
          직접 변경 문법을 쓸 수 있습니다 (내부적으로 불변 업데이트 처리).
        </p>
      </Callout>
    </DocLayout>
  );
}
