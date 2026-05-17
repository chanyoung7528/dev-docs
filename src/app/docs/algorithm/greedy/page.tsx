import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function GreedyPage() {
  return (
    <DocLayout
      title="그리디 (탐욕법)"
      description="각 단계에서 가장 좋아 보이는 선택을 하여 전체 최적해를 구하는 전략입니다."
    >
      <h2>핵심 개념</h2>
      <p>
        그리디는 &ldquo;현재 시점에서 최선의 선택&rdquo;을 반복합니다.
        항상 최적해를 보장하지는 않지만, <strong>정렬 + 규칙 적용</strong>으로
        최적해가 되는 문제가 코테에서 자주 출제됩니다.
      </p>

      <h2>패턴 1: 회의실 배정 (Activity Selection)</h2>

      <CodeBlock
        filename="meeting-rooms.ts"
        language="typescript"
        code={`// 최대한 많은 회의를 배정하기
// 끝나는 시간 기준 정렬 → 가장 빨리 끝나는 것부터 선택
function maxMeetings(meetings: [number, number][]): number {
  // 종료 시간 오름차순 정렬
  meetings.sort((a, b) => a[1] - b[1]);

  let count = 1;
  let lastEnd = meetings[0][1];

  for (let i = 1; i < meetings.length; i++) {
    // 시작 시간이 이전 회의 종료 시간 이후면 → 선택
    if (meetings[i][0] >= lastEnd) {
      count++;
      lastEnd = meetings[i][1];
    }
  }

  return count;
}

maxMeetings([[1,4],[3,5],[0,6],[5,7],[3,8],[5,9],[6,10],[8,11],[8,12],[2,13],[12,14]]);
// 4: [1,4] [5,7] [8,11] [12,14]

// 왜 그리디가 최적?
// 일찍 끝나는 회의를 선택하면 남은 시간이 최대 → 더 많은 회의 가능`}
        highlight={[5, 12, 13, 14]}
      />

      <h2>패턴 2: 점프 게임 (Jump Game)</h2>

      <CodeBlock
        filename="jump-game.ts"
        language="typescript"
        code={`// 배열의 각 위치에서 최대 nums[i]만큼 점프 가능
// 마지막 인덱스에 도달할 수 있는가?
// [2,3,1,1,4] → true, [3,2,1,0,4] → false
function canJump(nums: number[]): boolean {
  let maxReach = 0; // 현재까지 갈 수 있는 최대 위치

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false; // 현재 위치에 도달 불가

    maxReach = Math.max(maxReach, i + nums[i]);

    if (maxReach >= nums.length - 1) return true; // 끝에 도달 가능
  }

  return true;
}

// 최소 점프 횟수 (Jump Game II)
function jump(nums: number[]): number {
  let jumps = 0;
  let currentEnd = 0;   // 현재 점프로 갈 수 있는 끝
  let farthest = 0;     // 다음 점프로 갈 수 있는 최대

  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);

    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
    }
  }

  return jumps;
}`}
        highlight={[5, 8, 10, 12, 21, 22, 27, 28]}
      />

      <h2>패턴 3: 거스름돈 (Coin Change — 그리디 버전)</h2>

      <CodeBlock
        filename="coin-change-greedy.ts"
        language="typescript"
        code={`// 큰 동전부터 사용 (특정 동전 조합에서만 최적!)
// 한국 동전: [500, 100, 50, 10]
function minCoinsGreedy(coins: number[], amount: number): number {
  // 큰 동전부터 정렬
  coins.sort((a, b) => b - a);

  let count = 0;
  let remaining = amount;

  for (const coin of coins) {
    const numCoins = Math.floor(remaining / coin);
    count += numCoins;
    remaining -= numCoins * coin;
  }

  return remaining === 0 ? count : -1;
}

minCoinsGreedy([500, 100, 50, 10], 1260);
// 500*2 + 100*2 + 50*1 + 10*1 = 6개

// 주의: 동전이 [1, 3, 4]이고 amount=6이면
// 그리디: 4+1+1=3개, 최적: 3+3=2개
// → 일반적 Coin Change는 DP로 풀어야 함!`}
        highlight={[5, 11, 12, 13]}
      />

      <h2>패턴 4: 문자열 — 가장 많은 단어 선택</h2>

      <CodeBlock
        filename="partition-labels.ts"
        language="typescript"
        code={`// 문자열을 가능한 많은 파트로 나누되,
// 각 문자가 하나의 파트에만 속하도록
// "ababcbacadefegdehijhklij" → [9, 7, 8]
function partitionLabels(s: string): number[] {
  // 각 문자의 마지막 등장 위치 기록
  const lastIndex = new Map<string, number>();
  for (let i = 0; i < s.length; i++) {
    lastIndex.set(s[i], i);
  }

  const result: number[] = [];
  let start = 0;
  let end = 0;

  for (let i = 0; i < s.length; i++) {
    // 현재 파트의 끝을 최대한 확장
    end = Math.max(end, lastIndex.get(s[i])!);

    // i가 end에 도달하면 → 파트 완성
    if (i === end) {
      result.push(end - start + 1);
      start = end + 1;
    }
  }

  return result;
}

// 핵심: 각 문자가 마지막으로 나타나는 위치까지 파트를 확장
// 현재 위치가 파트 끝에 도달하면 → 잘라도 안전`}
        highlight={[6, 7, 8, 17, 20, 21]}
      />

      <Callout variant="tip">
        <p>
          <strong>그리디 vs DP 판단 기준</strong>
        </p>
        <p>
          &bull; <strong>그리디</strong>: 현재 선택이 미래에 영향 없음. 정렬 후 규칙 적용으로 풀림<br />
          &bull; <strong>DP</strong>: 현재 선택이 미래에 영향. 모든 경우를 따져야 함<br />
          &bull; 확신이 없으면 → 작은 예시로 그리디가 최적인지 반례 확인<br />
          &bull; 코테에서 그리디 키워드: &ldquo;최소/최대 개수&rdquo;, &ldquo;정렬 후 선택&rdquo;
        </p>
      </Callout>
    </DocLayout>
  );
}
