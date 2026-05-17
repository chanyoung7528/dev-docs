import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function OptionalChainingPage() {
  return (
    <DocLayout
      title="Optional Chaining & Nullish Coalescing"
      description="null/undefined를 안전하게 다루는 ?. 연산자와 ?? 연산자의 차이와 사용법입니다."
    >
      <h2>Optional Chaining (?.)</h2>
      <p>
        중간 경로에 <code>null</code> 또는 <code>undefined</code>가 있으면
        에러 대신 <code>undefined</code>를 반환합니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`interface User {
  name: string;
  address?: {
    city: string;
    zipCode?: string;
  };
  getProfile?: () => Profile;
}

const user: User = { name: 'Kim' };

// ❌ Optional chaining 없이 — 에러 발생
user.address.city;           // TypeError: Cannot read property 'city' of undefined

// ✅ Optional chaining — undefined 반환
user.address?.city;          // undefined (에러 안 남)
user.address?.zipCode;       // undefined

// 메서드 호출에도 사용
user.getProfile?.();         // undefined (함수가 없으면 호출 안 함)

// 배열 접근
const users: User[] | undefined = undefined;
users?.[0]?.name;            // undefined

// 깊은 중첩도 안전하게
const city = response?.data?.user?.address?.city; // undefined or string`}
        highlight={[16, 20, 24, 27]}
      />

      <h2>Nullish Coalescing (??)</h2>
      <p>
        왼쪽 값이 <code>null</code> 또는 <code>undefined</code>일 때만
        오른쪽 기본값을 사용합니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`const value1 = null ?? 'default';      // 'default'
const value2 = undefined ?? 'default'; // 'default'
const value3 = 0 ?? 'default';         // 0       ← 핵심!
const value4 = '' ?? 'default';        // ''      ← 핵심!
const value5 = false ?? 'default';     // false   ← 핵심!`}
        highlight={[3, 4, 5]}
      />

      <h2>?? vs || — 가장 중요한 차이</h2>

      <Callout variant="danger">
        <p>
          <code>||</code>는 모든 falsy 값(0, &apos;&apos;, false, null, undefined)에서
          기본값을 사용합니다. <code>??</code>는 null과 undefined에서만 기본값을
          사용합니다. 숫자/문자열 기본값에는 <strong>??를 쓰세요.</strong>
        </p>
      </Callout>

      <CodeBlock
        language="typescript"
        code={`// || 연산자: falsy면 기본값 (0, '', false도 falsy!)
0 || 100       // 100  ← 0이 유효한 값인데 무시됨
'' || '없음'   // '없음' ← 빈 문자열이 유효한 값인데 무시됨
false || true  // true

// ?? 연산자: null/undefined일 때만 기본값
0 ?? 100       // 0    ✅ 0은 유효한 값으로 보존
'' ?? '없음'   // ''   ✅ 빈 문자열도 유효한 값으로 보존
false ?? true  // false ✅ false도 유효한 값으로 보존
null ?? 100    // 100  ✅ null이니까 기본값
undefined ?? 100 // 100 ✅ undefined니까 기본값`}
        highlight={[2, 3, 7, 8, 9]}
      />

      <h2>실무 사용 예시</h2>

      <CodeBlock
        filename="practical-examples.ts"
        language="typescript"
        code={`// 1. API 응답 기본값
const funds = response?.data?.funds ?? [];
const total = response?.data?.total ?? 0;
const userName = user?.name ?? '비회원';

// 2. 설정값 (0이 유효한 값)
const timeout = config.timeout ?? 5000;  // config.timeout이 0이면 0 유지
const retries = config.retries ?? 3;     // config.retries가 0이면 0 유지

// 3. 수익률 표시 (0%는 유효한 값)
const returnRate = fund.returnRate ?? 0;
const displayRate = \`\${returnRate.toFixed(2)}%\`;

// 4. 옵셔널 프로퍼티 접근 + 기본값
const avatarUrl = user?.profile?.avatar ?? '/default-avatar.png';

// 5. 함수 호출 결과 + 기본값
const cachedData = cache.get(key) ?? await fetchFromServer(key);`}
        highlight={[2, 3, 7, 11, 15, 18]}
      />

      <h2>Nullish Assignment (??=)</h2>

      <CodeBlock
        language="typescript"
        code={`// 값이 null 또는 undefined일 때만 할당
let name: string | null = null;
name ??= 'default';  // name이 null이므로 'default' 할당
console.log(name);   // 'default'

let count: number | null = 0;
count ??= 10;        // count가 0이므로 할당 안 함 (0은 null이 아님)
console.log(count);  // 0

// 실무: 캐시 패턴
const cache: Record<string, Data> = {};
function getData(key: string) {
  return cache[key] ??= fetchSync(key);
  // cache[key]가 없으면 fetch 후 캐시에 저장하고 반환
}`}
        highlight={[3, 7, 13]}
      />

      <h2>조합 패턴 정리</h2>

      <CodeBlock
        filename="patterns.ts"
        language="typescript"
        code={`// 패턴 1: 안전한 깊은 접근 + 기본값
const city = user?.address?.city ?? '서울';

// 패턴 2: 배열 안전 접근 + 기본값
const firstFund = funds?.[0]?.name ?? '펀드 없음';
const lastItem = items?.at(-1) ?? defaultItem;

// 패턴 3: 조건부 메서드 호출
onSuccess?.(data);       // onSuccess가 있을 때만 호출
ref.current?.focus();    // ref가 연결됐을 때만 호출
timer.current && clearTimeout(timer.current);

// 패턴 4: 타입 가드와 조합
const errorMessage =
  error instanceof ApiError ? error.userMessage
  : error instanceof Error ? error.message
  : '알 수 없는 오류';

// 패턴 5: React props 기본값과 ??
interface Props {
  size?: number;
  label?: string;
  disabled?: boolean;
}
function Button({ size, label, disabled }: Props) {
  const actualSize = size ?? 14;        // 0도 유효
  const actualLabel = label ?? '버튼';   // ''도 유효
  const isDisabled = disabled ?? false;  // false도 유효
}`}
        highlight={[2, 5, 9, 10, 25, 26, 27]}
      />
    </DocLayout>
  );
}
