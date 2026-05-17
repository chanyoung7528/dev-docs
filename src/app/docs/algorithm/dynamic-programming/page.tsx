import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function DynamicProgrammingPage() {
  return (
    <DocLayout
      title="동적 프로그래밍 (DP)"
      description="중복 부분 문제를 메모이제이션/테이블로 저장하여 효율적으로 해결하는 패턴입니다."
    >
      <h2>핵심 개념</h2>
      <p>
        DP는 큰 문제를 작은 부분 문제로 나누고, 부분 문제의 결과를
        저장(메모이제이션)하여 중복 계산을 피합니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`// DP 문제 해결 순서
// 1. 점화식 정의: dp[i]가 무엇을 의미하는지 정의
// 2. 초기값 설정: dp[0], dp[1] 등 기저 조건
// 3. 순서 결정: 어느 방향으로 채울지 (보통 작은 → 큰)
// 4. 정답 위치: dp[n] or max(dp) 등

// Top-down (메모이제이션): 재귀 + 캐시
// Bottom-up (타뷸레이션): 반복문 + 테이블 ← 실전에서 선호`}
      />

      <h2>패턴 1: 피보나치 (기본 DP)</h2>

      <CodeBlock
        filename="fibonacci.ts"
        language="typescript"
        code={`// Top-down (메모이제이션)
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;

  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

// Bottom-up (타뷸레이션) — 실전 권장
function fibTab(n: number): number {
  if (n <= 1) return n;

  let prev2 = 0; // dp[i-2]
  let prev1 = 1; // dp[i-1]

  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

// 공간 최적화: dp 배열 대신 변수 2개만 사용 → O(1) 공간`}
        highlight={[4, 6, 7, 15, 16, 19, 20, 21]}
      />

      <h2>패턴 2: 계단 오르기 (Climbing Stairs)</h2>

      <CodeBlock
        filename="climbing-stairs.ts"
        language="typescript"
        code={`// n개의 계단, 한 번에 1칸 또는 2칸 오르기. 방법의 수?
// dp[i] = i번째 계단에 도달하는 방법의 수
// dp[i] = dp[i-1] + dp[i-2] (1칸 or 2칸 전에서 올 수 있음)
function climbStairs(n: number): number {
  if (n <= 2) return n;

  let prev2 = 1; // dp[1]
  let prev1 = 2; // dp[2]

  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

// 사실 피보나치와 동일한 구조!
// dp[3] = dp[2] + dp[1] = 2 + 1 = 3
// dp[4] = dp[3] + dp[2] = 3 + 2 = 5`}
        highlight={[3, 7, 8, 11, 12, 13]}
      />

      <h2>패턴 3: 동전 교환 (Coin Change)</h2>

      <CodeBlock
        filename="coin-change.ts"
        language="typescript"
        code={`// 합이 amount인 최소 동전 수 (동전 무한 사용 가능)
// coins = [1,3,4], amount = 6 → 2 (3+3)
function coinChange(coins: number[], amount: number): number {
  // dp[i] = 금액 i를 만드는 최소 동전 수
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // 금액 0은 동전 0개

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        // i원 = (i-coin)원 만드는 방법 + coin 1개
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

// dp 테이블 (coins=[1,3,4]):
// dp[0]=0
// dp[1]=1 (1)
// dp[2]=2 (1+1)
// dp[3]=1 (3)
// dp[4]=1 (4)
// dp[5]=2 (1+4)
// dp[6]=2 (3+3) ✅`}
        highlight={[5, 6, 10, 11]}
      />

      <h2>패턴 4: 최장 증가 부분 수열 (LIS)</h2>

      <CodeBlock
        filename="lis.ts"
        language="typescript"
        code={`// 가장 긴 순증가하는 부분 수열의 길이
// [10,9,2,5,3,7,101,18] → 4 ([2,3,7,101] or [2,5,7,101])
function lengthOfLIS(nums: number[]): number {
  // dp[i] = nums[i]로 끝나는 LIS의 길이
  const dp = new Array(nums.length).fill(1);

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  return Math.max(...dp);
}

// O(n log n) 최적화 — 이분 탐색 활용
function lengthOfLIS_Optimized(nums: number[]): number {
  const tails: number[] = []; // 각 길이의 LIS에서 가장 작은 끝 값

  for (const num of nums) {
    let left = 0;
    let right = tails.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < num) left = mid + 1;
      else right = mid;
    }

    tails[left] = num;
  }

  return tails.length;
}`}
        highlight={[5, 9, 10, 15, 21, 31]}
      />

      <h2>패턴 5: 0/1 배낭 문제 (Knapsack)</h2>

      <CodeBlock
        filename="knapsack.ts"
        language="typescript"
        code={`// 무게 제한 W, 각 아이템은 한 번만 사용 가능
// 최대 가치 구하기
function knapsack(
  weights: number[],
  values: number[],
  capacity: number
): number {
  const n = weights.length;
  // dp[i][w] = i번째 아이템까지 고려했을 때, 무게 w 이하의 최대 가치
  const dp = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      // 안 넣는 경우
      dp[i][w] = dp[i - 1][w];

      // 넣는 경우 (무게가 허용되면)
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        );
      }
    }
  }

  return dp[n][capacity];
}

// 1D 공간 최적화 (뒤에서부터 순회!)
function knapsack1D(weights: number[], values: number[], capacity: number): number {
  const dp = new Array(capacity + 1).fill(0);

  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) { // 뒤에서부터!
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }

  return dp[capacity];
}`}
        highlight={[10, 11, 17, 21, 22, 23, 37]}
      />

      <Callout variant="tip">
        <p>
          <strong>DP 접근 방법</strong>
        </p>
        <p>
          1. dp 배열이 무엇을 의미하는지 <strong>한 문장으로</strong> 정의<br />
          2. 점화식을 세움 (이전 상태에서 현재를 어떻게 구하는가)<br />
          3. 기저 조건 설정 (dp[0] 등)<br />
          4. 코드 작성 후 작은 예시로 검증<br />
          <br />
          자주 나오는 유형: 계단 오르기, 동전 교환, LIS, 배낭, 문자열 편집 거리
        </p>
      </Callout>
    </DocLayout>
  );
}
