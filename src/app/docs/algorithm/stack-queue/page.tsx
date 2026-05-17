import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function StackQueuePage() {
  return (
    <DocLayout
      title="스택 & 큐"
      description="LIFO(스택)와 FIFO(큐)로 괄호 매칭, 단조 스택, 히스토리 관리 등을 해결합니다."
    >
      <h2>핵심 개념</h2>

      <CodeBlock
        language="typescript"
        code={`// 스택 (Stack): Last In, First Out
// → 배열의 push/pop으로 구현
const stack: number[] = [];
stack.push(1); // [1]
stack.push(2); // [1, 2]
stack.pop();   // 2, stack = [1]

// 큐 (Queue): First In, First Out
// → 배열의 push/shift로 구현 (shift는 O(n)이라 대량 데이터에선 비효율)
const queue: number[] = [];
queue.push(1); // [1]
queue.push(2); // [1, 2]
queue.shift(); // 1, queue = [2]`}
      />

      <h2>패턴 1: 유효한 괄호 (Valid Parentheses)</h2>

      <CodeBlock
        filename="valid-parentheses.ts"
        language="typescript"
        code={`// 괄호 문자열이 올바르게 닫히는지 검사
function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  };

  for (const char of s) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char); // 여는 괄호 → 스택에 추가
    } else {
      // 닫는 괄호 → 스택 최상단과 매칭 확인
      if (stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }

  return stack.length === 0; // 스택이 비어야 모두 매칭됨
}

isValid('({[]})'); // true
isValid('([)]');   // false`}
        highlight={[3, 12, 15, 16, 21]}
      />

      <h2>패턴 2: 단조 스택 (Monotone Stack)</h2>
      <p>
        &ldquo;나보다 큰/작은 다음 요소가 어디에 있는가?&rdquo;를 O(n)으로
        해결합니다.
      </p>

      <CodeBlock
        filename="next-greater.ts"
        language="typescript"
        code={`// 각 원소에 대해 오른쪽에서 처음으로 더 큰 값 찾기
// [2, 1, 2, 4, 3] → [4, 2, 4, -1, -1]
function nextGreaterElement(nums: number[]): number[] {
  const result = new Array(nums.length).fill(-1);
  const stack: number[] = []; // 인덱스를 저장

  for (let i = 0; i < nums.length; i++) {
    // 현재 값이 스택 최상단보다 크면 → 스택의 값들에 대한 "다음 큰 수" 발견
    while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
      const idx = stack.pop()!;
      result[idx] = nums[i];
    }
    stack.push(i);
  }

  return result;
}

// 스택이 단조 감소 유지됨:
// i=0: stack=[0](2)
// i=1: 1<2 → stack=[0,1](2,1)
// i=2: 2>1 → pop 1, result[1]=2. 2=2 → stack=[0,2](2,2)
// i=3: 4>2 → pop 2, result[2]=4. 4>2 → pop 0, result[0]=4. stack=[3](4)
// i=4: 3<4 → stack=[3,4](4,3)
// 결과: [4,2,4,-1,-1]`}
        highlight={[5, 9, 10, 11, 13]}
      />

      <h2>패턴 3: 일일 온도 (Daily Temperatures)</h2>

      <CodeBlock
        filename="daily-temperatures.ts"
        language="typescript"
        code={`// 각 날에 대해 "며칠 후에 더 따뜻한 날이 오는가?"
// [73,74,75,71,69,72,76,73] → [1,1,4,2,1,1,0,0]
function dailyTemperatures(temperatures: number[]): number[] {
  const result = new Array(temperatures.length).fill(0);
  const stack: number[] = []; // 인덱스 저장

  for (let i = 0; i < temperatures.length; i++) {
    while (
      stack.length > 0 &&
      temperatures[i] > temperatures[stack[stack.length - 1]]
    ) {
      const prevIdx = stack.pop()!;
      result[prevIdx] = i - prevIdx; // 날짜 차이
    }
    stack.push(i);
  }

  return result;
}

// 단조 스택의 전형적 응용
// "나보다 큰 것이 나올 때까지 기다린다" = 스택에 대기`}
        highlight={[8, 9, 10, 13, 15]}
      />

      <h2>패턴 4: 큐로 구현하는 최근 요청 수</h2>

      <CodeBlock
        filename="recent-counter.ts"
        language="typescript"
        code={`// 최근 3000ms 이내의 요청 수를 반환
class RecentCounter {
  private queue: number[] = [];

  ping(t: number): number {
    this.queue.push(t);

    // 3000ms 이전 요청 제거
    while (this.queue[0] < t - 3000) {
      this.queue.shift();
    }

    return this.queue.length;
  }
}

// 프론트엔드 실무 연결:
// Rate limiter, 디바운스/쓰로틀의 내부 동작과 유사
// 최근 N초간 API 호출 수 체크 등`}
        highlight={[5, 6, 9, 10, 13]}
      />

      <h2>패턴 5: 프론트엔드 실무 — 히스토리 스택</h2>

      <CodeBlock
        filename="history-stack.ts"
        language="typescript"
        code={`// Undo/Redo 구현 — 두 개의 스택
class HistoryManager<T> {
  private undoStack: T[] = [];
  private redoStack: T[] = [];

  push(state: T) {
    this.undoStack.push(state);
    this.redoStack = []; // 새 액션이 들어오면 redo 초기화
  }

  undo(): T | undefined {
    const state = this.undoStack.pop();
    if (state !== undefined) {
      this.redoStack.push(state);
    }
    return this.undoStack[this.undoStack.length - 1]; // 이전 상태 반환
  }

  redo(): T | undefined {
    const state = this.redoStack.pop();
    if (state !== undefined) {
      this.undoStack.push(state);
    }
    return state;
  }

  get current(): T | undefined {
    return this.undoStack[this.undoStack.length - 1];
  }
}

// 에디터, 폼 히스토리, 브라우저 히스토리 관리에 직접 사용`}
        highlight={[3, 4, 7, 8, 12, 13, 20, 21]}
      />

      <Callout variant="tip">
        <p>
          <strong>언제 스택/큐를 떠올릴까?</strong>
        </p>
        <p>
          &bull; <strong>괄호 매칭</strong>, 중첩 구조 → 스택<br />
          &bull; <strong>&ldquo;다음 큰/작은 값&rdquo;</strong> → 단조 스택<br />
          &bull; <strong>되돌리기(Undo)</strong>, 히스토리 → 두 개의 스택<br />
          &bull; <strong>순서대로 처리</strong> (BFS, 대기열) → 큐<br />
          &bull; <strong>최근 N개</strong> 관리 → 큐
        </p>
      </Callout>
    </DocLayout>
  );
}
