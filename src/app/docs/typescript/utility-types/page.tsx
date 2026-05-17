import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function UtilityTypesPage() {
  return (
    <DocLayout
      title="유틸리티 타입"
      description="TypeScript 내장 유틸리티 타입을 활용해 기존 타입을 변환하고 재사용하는 실무 패턴입니다."
    >
      <h2>Partial&lt;T&gt;</h2>
      <p>
        모든 속성을 <code>optional(?)</code>로 변환합니다. 업데이트 DTO에서
        가장 많이 씁니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`interface User {
  name: string;
  age: number;
  email: string;
}

// Partial<User> 결과:
// { name?: string; age?: number; email?: string }

// 실무: 업데이트 시 변경할 필드만 전달
function updateUser(id: string, updates: Partial<User>) {
  // updates.name 있으면 업데이트, 없으면 스킵
}

updateUser('1', { name: '새 이름' });          // ✅ name만 전달
updateUser('1', { age: 31, email: 'new@' });  // ✅ 일부만 전달`}
        highlight={[11]}
      />

      <h2>Pick&lt;T, K&gt;</h2>
      <p>
        특정 속성만 추출하여 새 타입을 만듭니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  createdAt: Date;
}

// 목록에서 보여줄 최소 정보만 추출
type UserPreview = Pick<User, 'id' | 'name' | 'email'>;
// { id: string; name: string; email: string }

// 로그인 폼에 필요한 필드만
type LoginForm = Pick<User, 'email'> & { password: string };
// { email: string; password: string }`}
        highlight={[10, 14]}
      />

      <h2>Omit&lt;T, K&gt;</h2>
      <p>
        특정 속성을 제외한 새 타입을 만듭니다. Pick의 반대입니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  createdAt: Date;
}

// 생성 시에는 id, createdAt이 없음
type CreateUserDTO = Omit<User, 'id' | 'createdAt'>;
// { name: string; age: number; email: string }

// 외부 노출 시 민감 정보 제거
type PublicUser = Omit<User, 'email'>;`}
        highlight={[10, 14]}
      />

      <h2>Record&lt;K, V&gt;</h2>
      <p>
        키 타입과 값 타입을 지정하여 객체 타입을 만듭니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`// 상태별 라벨 매핑
type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

const statusLabel: Record<OrderStatus, string> = {
  pending: '대기중',
  confirmed: '확인됨',
  cancelled: '취소됨',
};

// API 에러 코드 매핑
const errorMessages: Record<number, string> = {
  400: '잘못된 요청입니다',
  401: '인증이 필요합니다',
  403: '권한이 없습니다',
  404: '찾을 수 없습니다',
  500: '서버 오류입니다',
};

// 동적 키 객체
type FormErrors = Record<string, string>;
const errors: FormErrors = {
  name: '이름을 입력하세요',
  email: '유효한 이메일을 입력하세요',
};`}
        highlight={[4, 11, 21]}
      />

      <h2>ReturnType&lt;T&gt; & Parameters&lt;T&gt;</h2>
      <p>
        함수의 반환 타입이나 매개변수 타입을 추출합니다. 외부 라이브러리
        함수의 타입을 가져올 때 유용합니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`function createUser(name: string, age: number) {
  return { id: crypto.randomUUID(), name, age, createdAt: new Date() };
}

// 함수 반환 타입 추출
type CreatedUser = ReturnType<typeof createUser>;
// { id: string; name: string; age: number; createdAt: Date }

// 함수 매개변수 타입 추출
type CreateUserParams = Parameters<typeof createUser>;
// [string, number]`}
        highlight={[6, 10]}
      />

      <h2>실무 조합 패턴</h2>

      <CodeBlock
        filename="dto-patterns.ts"
        language="typescript"
        code={`interface Fund {
  id: string;
  name: string;
  category: string;
  nav: number;
  manager: string;
  createdAt: Date;
  updatedAt: Date;
}

// 생성 DTO: 서버가 만드는 필드 제외
type CreateFundDTO = Omit<Fund, 'id' | 'createdAt' | 'updatedAt'>;

// 수정 DTO: id 필수 + 나머지 선택
type UpdateFundDTO = Pick<Fund, 'id'> & Partial<Omit<Fund, 'id'>>;

// 목록 아이템: 필요한 것만
type FundListItem = Pick<Fund, 'id' | 'name' | 'category' | 'nav'>;

// 검색 파라미터
type FundSearchParams = Partial<Pick<Fund, 'name' | 'category' | 'manager'>> & {
  page?: number;
  size?: number;
};`}
        highlight={[12, 15, 18, 21]}
      />

      <Callout variant="note">
        <p>
          <strong>핵심 원칙:</strong> 하나의 인터페이스를 정의한 뒤,
          유틸리티 타입으로 변환하여 DTO를 만드세요. 같은 필드를 여러
          인터페이스에 중복 정의하면 변경 시 누락이 생깁니다.
        </p>
      </Callout>

      <h2>Required&lt;T&gt; & Readonly&lt;T&gt;</h2>

      <CodeBlock
        language="typescript"
        code={`// Required: 모든 속성을 필수로 (Partial의 반대)
type RequiredUser = Required<Partial<User>>;
// 다시 원래 User와 동일해짐

// Readonly: 모든 속성을 읽기 전용으로
type FrozenConfig = Readonly<{
  apiUrl: string;
  timeout: number;
  maxRetries: number;
}>;

const config: FrozenConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  maxRetries: 3,
};

config.timeout = 10000; // ❌ 컴파일 에러: 읽기 전용`}
        highlight={[6, 18]}
      />

      <h2>Extract & Exclude</h2>

      <CodeBlock
        language="typescript"
        code={`type AllStatus = 'active' | 'inactive' | 'pending' | 'deleted';

// Extract: 조건에 맞는 타입만 추출
type ActiveStatus = Extract<AllStatus, 'active' | 'pending'>;
// 'active' | 'pending'

// Exclude: 조건에 맞는 타입 제외
type VisibleStatus = Exclude<AllStatus, 'deleted'>;
// 'active' | 'inactive' | 'pending'

// 실무: 이벤트 타입에서 특정 그룹만 추출
type MouseEvents = Extract<keyof HTMLElementEventMap, \`mouse\${string}\`>;
// 'mousedown' | 'mouseup' | 'mousemove' | ...`}
        highlight={[4, 8, 12]}
      />
    </DocLayout>
  );
}
