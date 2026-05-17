import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function GenericsPage() {
  return (
    <DocLayout
      title="제네릭"
      description="타입을 변수처럼 사용하여 재사용 가능한 컴포넌트와 함수를 만드는 핵심 패턴입니다."
    >
      <h2>기본 개념</h2>
      <p>
        제네릭은 타입을 <strong>매개변수</strong>로 받아서, 함수나 컴포넌트를
        다양한 타입에 대해 재사용할 수 있게 합니다. 꺾쇠 괄호{" "}
        <code>{"<T>"}</code> 안에 타입 변수를 선언합니다.
      </p>

      <CodeBlock
        filename="basics.ts"
        language="typescript"
        code={`// 제네릭 없이 — 타입별로 함수를 만들어야 함
function getFirstNumber(arr: number[]): number | undefined {
  return arr[0];
}
function getFirstString(arr: string[]): string | undefined {
  return arr[0];
}

// 제네릭으로 — 하나의 함수로 모든 타입 대응
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

getFirst<number>([1, 2, 3]);  // number
getFirst(['a', 'b']);          // string (타입 추론)`}
        highlight={[11]}
      />

      <h2>제약 조건 (extends)</h2>
      <p>
        <code>extends</code> 키워드로 제네릭에 들어올 수 있는 타입을
        제한합니다. 이를 통해 타입 안전성을 유지하면서도 유연한 함수를 작성할 수
        있습니다.
      </p>

      <CodeBlock
        filename="constraints.ts"
        language="typescript"
        code={`// T는 아무 타입이나 가능 → obj[key]가 안전하지 않음
// K를 T의 키로 제한하면 → 존재하는 키만 허용
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Kim', age: 30, email: 'kim@test.com' };

getProperty(user, 'name');   // string ✅
getProperty(user, 'age');    // number ✅
getProperty(user, 'phone');  // 컴파일 에러 ❌ — 'phone'은 keyof User가 아님`}
        highlight={[3, 11]}
      />

      <CodeBlock
        language="typescript"
        code={`// length 속성이 있는 타입만 받기
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(value: T): void {
  console.log(value.length);
}

logLength('hello');      // ✅ string은 length 있음
logLength([1, 2, 3]);   // ✅ 배열은 length 있음
logLength(123);          // ❌ number는 length 없음`}
        highlight={[6]}
      />

      <h2>컴포넌트 제네릭</h2>
      <p>
        React 컴포넌트에서 제네릭을 사용하면, 데이터 타입에 따라 자동으로
        props 타입이 추론되는 범용 컴포넌트를 만들 수 있습니다.
      </p>

      <CodeBlock
        filename="GenericList.tsx"
        language="tsx"
        code={`interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 사용 — User 타입이 자동 추론됨
interface User { id: string; name: string; age: number }

<List<User>
  items={users}
  renderItem={(user) => <span>{user.name} ({user.age})</span>}
  keyExtractor={(user) => user.id}
/>`}
        highlight={[1, 7, 20]}
      />

      <Callout variant="note">
        <p>
          실무에서 제네릭을 가장 많이 쓰는 곳: API 응답 래퍼, 공통 리스트/테이블
          컴포넌트, 커스텀 훅(<code>useQuery&lt;T&gt;</code>), 폼 핸들러 등.
        </p>
      </Callout>

      <h2>제네릭 기본값</h2>
      <p>
        제네릭에 기본 타입을 지정할 수 있습니다. 타입을 명시하지 않으면
        기본값이 사용됩니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`// API 응답 공통 래퍼
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message: string;
}

// T를 명시하지 않으면 unknown
const res1: ApiResponse = { data: 'anything', status: 200, message: 'ok' };

// T를 명시하면 해당 타입으로 좁혀짐
const res2: ApiResponse<User[]> = {
  data: [{ id: '1', name: 'Kim', age: 30 }],
  status: 200,
  message: 'ok',
};`}
        highlight={[2]}
      />

      <h2>여러 제네릭 조합</h2>

      <CodeBlock
        language="typescript"
        code={`// 실무: API 호출 함수 타입
async function apiCall<TRequest, TResponse>(
  url: string,
  body: TRequest
): Promise<TResponse> {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.json();
}

// 사용 — 요청/응답 타입이 모두 안전
interface CreateFundDTO { name: string; category: string }
interface Fund { id: string; name: string; category: string }

const fund = await apiCall<CreateFundDTO, Fund>(
  '/api/funds',
  { name: '성장 펀드', category: 'equity' }
);
// fund는 Fund 타입으로 추론됨`}
        highlight={[2, 17]}
      />
    </DocLayout>
  );
}
