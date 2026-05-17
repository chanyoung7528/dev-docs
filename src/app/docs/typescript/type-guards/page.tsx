import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function TypeGuardsPage() {
  return (
    <DocLayout
      title="타입 가드"
      description="런타임에서 타입을 좁혀(narrowing) 안전하게 값에 접근하는 패턴입니다."
    >
      <h2>typeof 가드</h2>
      <p>
        원시 타입(<code>string</code>, <code>number</code>,{" "}
        <code>boolean</code>)을 구분할 때 사용합니다. 가장 기본적인 타입
        가드입니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`function format(value: string | number): string {
  if (typeof value === 'string') {
    return value.toUpperCase();  // string으로 좁혀짐
  }
  return value.toFixed(2);       // number로 좁혀짐
}

// 여러 타입 처리
function stringify(value: string | number | boolean | null): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return '';  // null
}`}
        highlight={[2, 5]}
      />

      <h2>in 연산자 가드</h2>
      <p>
        객체에 특정 속성이 있는지 확인하여 타입을 좁힙니다. 인터페이스 간
        구분에 유용합니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`interface Cat {
  name: string;
  meow: () => void;
}
interface Dog {
  name: string;
  bark: () => void;
}

function speak(animal: Cat | Dog) {
  if ('meow' in animal) {
    animal.meow();   // Cat으로 좁혀짐
  } else {
    animal.bark();   // Dog으로 좁혀짐
  }
}

// 실무: API 응답 분기
interface SuccessResponse { data: unknown; status: 'ok' }
interface ErrorResponse { error: string; code: number }

function handleResponse(res: SuccessResponse | ErrorResponse) {
  if ('error' in res) {
    console.error(res.error, res.code);  // ErrorResponse
  } else {
    processData(res.data);                // SuccessResponse
  }
}`}
        highlight={[11, 23]}
      />

      <h2>instanceof 가드</h2>
      <p>
        클래스 인스턴스를 구분할 때 사용합니다. Error 처리에서 자주 씁니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
  }
}

function handleError(error: unknown) {
  if (error instanceof ApiError) {
    // ApiError로 좁혀짐 — statusCode 접근 가능
    showToast(\`서버 오류 (\${error.statusCode}): \${error.message}\`);
  } else if (error instanceof ValidationError) {
    // ValidationError로 좁혀짐 — field 접근 가능
    highlightField(error.field);
  } else if (error instanceof Error) {
    showToast(error.message);
  } else {
    showToast('알 수 없는 오류가 발생했습니다');
  }
}`}
        highlight={[20, 23, 26]}
      />

      <h2>커스텀 타입 가드 (is 키워드)</h2>
      <p>
        <code>is</code> 키워드를 사용하면 함수의 반환값으로 타입을 좁힐 수
        있습니다. 복잡한 타입 분기에서 가장 강력한 패턴입니다.
      </p>

      <CodeBlock
        filename="type-guards.ts"
        language="typescript"
        code={`// 반환 타입이 'res is ApiError' — true면 ApiError로 좁혀짐
interface ApiError { code: number; message: string }
interface ApiSuccess<T> { data: T }
type ApiResponse<T> = ApiError | ApiSuccess<T>;

function isApiError(res: ApiResponse<unknown>): res is ApiError {
  return 'code' in res;
}

// 사용
async function fetchFund(id: string) {
  const res = await api.get<ApiResponse<Fund>>(\`/funds/\${id}\`);

  if (isApiError(res)) {
    showError(res.message);   // ApiError로 좁혀짐 ✅
    return null;
  }

  return res.data;             // ApiSuccess<Fund>로 좁혀짐 ✅
}`}
        highlight={[6, 14, 19]}
      />

      <Callout variant="warning">
        <p>
          커스텀 타입 가드의 <code>is</code> 반환 타입은 TypeScript에게
          &ldquo;내가 책임질게, 이 조건이 true면 이 타입이야&rdquo;라고
          알려주는 것입니다. <strong>잘못된 조건을 넣으면 런타임 오류</strong>가
          발생하니 조건을 정확하게 작성하세요.
        </p>
      </Callout>

      <h2>배열 필터링에서 타입 가드</h2>

      <CodeBlock
        language="typescript"
        code={`interface User { id: string; name: string }

// null/undefined 제거 — filter만 쓰면 타입이 안 좁혀짐
const users: (User | null)[] = [
  { id: '1', name: 'Kim' },
  null,
  { id: '2', name: 'Lee' },
];

// ❌ 타입이 (User | null)[] 그대로
const filtered1 = users.filter(user => user !== null);

// ✅ 타입 가드로 User[]로 좁혀짐
function isNotNull<T>(value: T | null | undefined): value is T {
  return value != null;
}
const filtered2 = users.filter(isNotNull);
// filtered2의 타입: User[] ✅`}
        highlight={[14, 15, 16, 17]}
      />

      <h2>실무 조합: 타입 가드 + switch</h2>

      <CodeBlock
        filename="event-handler.ts"
        language="typescript"
        code={`// 브릿지 메시지 타입 가드
type BridgeMessage =
  | { type: 'TOKEN_REFRESH'; payload: { token: string } }
  | { type: 'PUSH_RECEIVED'; payload: { title: string; body: string } }
  | { type: 'APP_STATE_CHANGE'; payload: { state: 'foreground' | 'background' } };

function isBridgeMessage(data: unknown): data is BridgeMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'payload' in data
  );
}

// 사용
window.addEventListener('message', (event) => {
  if (!isBridgeMessage(event.data)) return;

  // event.data가 BridgeMessage로 좁혀짐
  switch (event.data.type) {
    case 'TOKEN_REFRESH':
      setToken(event.data.payload.token);    // string ✅
      break;
    case 'PUSH_RECEIVED':
      showNotification(event.data.payload);  // { title, body } ✅
      break;
    case 'APP_STATE_CHANGE':
      handleAppState(event.data.payload.state);
      break;
  }
});`}
        highlight={[7, 18, 21]}
      />
    </DocLayout>
  );
}
