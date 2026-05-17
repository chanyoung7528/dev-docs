import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function StringManipulationPage() {
  return (
    <DocLayout
      title="문자열 처리"
      description="프론트엔드 코테에서 자주 나오는 문자열 조작, 파싱, 패턴 매칭 문제입니다."
    >
      <h2>JavaScript 문자열 필수 메서드</h2>

      <CodeBlock
        language="typescript"
        code={`const s = 'Hello, World!';

s.split(',')         // ['Hello', ' World!'] — 분리
s.slice(0, 5)        // 'Hello' — 부분 추출 (음수 가능)
s.substring(0, 5)    // 'Hello' — 부분 추출
s.indexOf('World')   // 7 — 위치 찾기 (-1 if not found)
s.includes('World')  // true — 포함 여부
s.replace('World', 'JS') // 'Hello, JS!' — 치환
s.toLowerCase()      // 'hello, world!'
s.trim()             // 양쪽 공백 제거
s.padStart(15, '0')  // '00Hello, World!' — 좌측 패딩
s.repeat(2)          // 'Hello, World!Hello, World!'
s.startsWith('Hello') // true
s.endsWith('!')       // true
s.charCodeAt(0)       // 72 ('H'의 ASCII)
String.fromCharCode(72) // 'H'

// 문자열 → 배열 → 문자열 (불변성 우회)
const reversed = s.split('').reverse().join('');
// 배열로 변환 후 조작하고 다시 문자열로`}
      />

      <h2>패턴 1: 문자열 뒤집기 변형</h2>

      <CodeBlock
        filename="reverse-words.ts"
        language="typescript"
        code={`// 단어 순서 뒤집기 (여러 공백 처리)
// "  hello  world  " → "world hello"
function reverseWords(s: string): string {
  return s.trim().split(/\\s+/).reverse().join(' ');
}

// 단어 내 문자 뒤집기 (단어 순서 유지)
// "Let's take LeetCode contest" → "s'teL ekat edoCteeL tsetnoc"
function reverseWordsInPlace(s: string): string {
  return s.split(' ')
    .map(word => word.split('').reverse().join(''))
    .join(' ');
}

// k개씩 뒤집기
// "abcdefg", k=2 → "bacdfeg"
function reverseStr(s: string, k: number): string {
  const arr = s.split('');

  for (let i = 0; i < arr.length; i += 2 * k) {
    let left = i;
    let right = Math.min(i + k - 1, arr.length - 1);
    while (left < right) {
      [arr[left], arr[right]] = [arr[right], arr[left]];
      left++;
      right--;
    }
  }

  return arr.join('');
}`}
        highlight={[4, 10, 11, 12, 20, 21]}
      />

      <h2>패턴 2: 문자열 압축</h2>

      <CodeBlock
        filename="string-compression.ts"
        language="typescript"
        code={`// 연속 문자 압축: "aabcccaaa" → "a2b1c3a3"
function compress(s: string): string {
  let result = '';
  let count = 1;

  for (let i = 1; i <= s.length; i++) {
    if (i < s.length && s[i] === s[i - 1]) {
      count++;
    } else {
      result += s[i - 1] + count;
      count = 1;
    }
  }

  return result;
}

// 압축 해제: "a2b3" → "aabbb"
function decompress(s: string): string {
  let result = '';
  let i = 0;

  while (i < s.length) {
    const char = s[i];
    i++;

    let numStr = '';
    while (i < s.length && /\\d/.test(s[i])) {
      numStr += s[i];
      i++;
    }

    result += char.repeat(parseInt(numStr) || 1);
  }

  return result;
}`}
        highlight={[6, 7, 10, 11, 28, 29, 33]}
      />

      <h2>패턴 3: 괄호 문자열 파싱 (프론트엔드 빈출)</h2>

      <CodeBlock
        filename="parse-brackets.ts"
        language="typescript"
        code={`// 중첩 괄호 깊이 구하기
function maxDepth(s: string): number {
  let depth = 0;
  let maxD = 0;

  for (const char of s) {
    if (char === '(') {
      depth++;
      maxD = Math.max(maxD, depth);
    } else if (char === ')') {
      depth--;
    }
  }

  return maxD;
}

// 유효한 괄호 생성 (백트래킹)
// n=3 → ["((()))","(()())","(())()","()(())","()()()"]
function generateParenthesis(n: number): string[] {
  const result: string[] = [];

  function backtrack(current: string, open: number, close: number) {
    if (current.length === n * 2) {
      result.push(current);
      return;
    }

    // 여는 괄호를 아직 다 안 썼으면 추가 가능
    if (open < n) {
      backtrack(current + '(', open + 1, close);
    }
    // 닫는 괄호는 여는 괄호보다 적을 때만 추가 가능
    if (close < open) {
      backtrack(current + ')', open, close + 1);
    }
  }

  backtrack('', 0, 0);
  return result;
}`}
        highlight={[7, 8, 10, 25, 31, 35]}
      />

      <h2>패턴 4: URL/경로 파싱 (프론트엔드 특화)</h2>

      <CodeBlock
        filename="path-parsing.ts"
        language="typescript"
        code={`// Unix 경로 단순화
// "/a/./b/../../c/" → "/c"
function simplifyPath(path: string): string {
  const stack: string[] = [];
  const parts = path.split('/');

  for (const part of parts) {
    if (part === '' || part === '.') continue;  // 현재 디렉토리
    if (part === '..') {
      stack.pop();  // 상위 디렉토리
    } else {
      stack.push(part);
    }
  }

  return '/' + stack.join('/');
}

simplifyPath('/home//foo/./bar/../baz'); // '/home/foo/baz'

// 쿼리 스트링 파싱 (프론트엔드 실무)
function parseQueryString(query: string): Record<string, string> {
  if (!query || query === '?') return {};

  return query
    .replace(/^\\?/, '')
    .split('&')
    .reduce<Record<string, string>>((acc, pair) => {
      const [key, value] = pair.split('=');
      if (key) acc[decodeURIComponent(key)] = decodeURIComponent(value ?? '');
      return acc;
    }, {});
}

parseQueryString('?name=Kim&age=30&city=Seoul');
// { name: 'Kim', age: '30', city: 'Seoul' }`}
        highlight={[4, 8, 9, 10, 27, 28, 29, 30]}
      />

      <h2>패턴 5: 정규식 활용</h2>

      <CodeBlock
        filename="regex-patterns.ts"
        language="typescript"
        code={`// 숫자만 추출
'abc123def456'.match(/\\d+/g); // ['123', '456']

// 이메일 유효성 (기본)
/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test('user@example.com'); // true

// camelCase → kebab-case 변환
function camelToKebab(s: string): string {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase();
}
camelToKebab('backgroundColor'); // 'background-color'

// kebab-case → camelCase 변환
function kebabToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
kebabToCamel('background-color'); // 'backgroundColor'

// 전화번호 포맷
function formatPhone(phone: string): string {
  const digits = phone.replace(/\\D/g, '');
  return digits.replace(/(\\d{3})(\\d{4})(\\d{4})/, '$1-$2-$3');
}
formatPhone('01012345678'); // '010-1234-5678'`}
        highlight={[8, 9, 14, 15, 21, 22]}
      />

      <Callout variant="tip">
        <p>
          <strong>프론트엔드 문자열 코테 팁</strong>
        </p>
        <p>
          &bull; 문자열은 불변 → <code>split</code>으로 배열 변환 후 조작<br />
          &bull; <code>charCodeAt</code>으로 알파벳 순서/거리 계산<br />
          &bull; 정규식은 강력하지만, 복잡하면 수동 파싱이 더 안전<br />
          &bull; 프론트엔드 특화: URL 파싱, JSON 처리, 포맷 변환, camelCase
        </p>
      </Callout>
    </DocLayout>
  );
}
