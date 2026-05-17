import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function TwoPointerPage() {
  return (
    <DocLayout
      title="투 포인터"
      description="정렬된 배열이나 문자열에서 두 개의 포인터를 움직여 O(n)에 탐색하는 패턴입니다."
    >
      <h2>핵심 개념</h2>
      <p>
        두 개의 포인터(인덱스)를 배열의 양 끝 또는 같은 방향에서 출발시켜,
        조건에 따라 이동합니다. 이중 루프 O(n&sup2;)를 O(n)으로 줄이는
        핵심 테크닉입니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`// 두 가지 변형
// 1. 양쪽 끝에서 시작 (left, right) → 정렬된 배열
// 2. 같은 방향 (slow, fast)        → 연결 리스트, 중복 제거`}
      />

      <h2>패턴 1: 정렬 배열에서 Two Sum</h2>

      <CodeBlock
        filename="two-sum-sorted.ts"
        language="typescript"
        code={`// 정렬된 배열에서 합이 target인 두 수 찾기
// 시간 O(n), 공간 O(1) — 해시맵보다 공간 효율적
function twoSumSorted(nums: number[], target: number): [number, number] {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];

    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;   // 합이 작으면 → 큰 쪽으로
    } else {
      right--;  // 합이 크면 → 작은 쪽으로
    }
  }

  throw new Error('No solution');
}

// 왜 작동하는가?
// 정렬되어 있으므로:
// sum이 작다 → left를 올리면 sum 증가
// sum이 크다 → right를 내리면 sum 감소
// → 한쪽 방향으로만 이동하므로 최대 n번`}
        highlight={[4, 5, 10, 12, 13, 15]}
      />

      <h2>패턴 2: 물 담기 (Container With Most Water)</h2>

      <CodeBlock
        filename="max-area.ts"
        language="typescript"
        code={`// 두 기둥 사이에 담을 수 있는 최대 물의 양
// 높이 배열: [1,8,6,2,5,4,8,3,7]
function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;

  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, width * h);

    // 더 낮은 쪽을 이동 (높은 쪽을 유지해야 더 큰 면적 가능)
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxWater;
}

maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]); // 49`}
        highlight={[9, 10, 11, 14, 15, 17]}
      />

      <h2>패턴 3: 팰린드롬 검사</h2>

      <CodeBlock
        filename="palindrome.ts"
        language="typescript"
        code={`// 영문자/숫자만 고려하여 팰린드롬 검사
function isPalindrome(s: string): boolean {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = cleaned.length - 1;

  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

isPalindrome('A man, a plan, a canal: Panama'); // true

// 응용: 최대 1개 문자를 삭제하여 팰린드롬 가능한가?
function validPalindrome(s: string): boolean {
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    if (s[left] !== s[right]) {
      // 한쪽을 건너뛰고 나머지가 팰린드롬인지 확인
      return isPalindromeRange(s, left + 1, right)
          || isPalindromeRange(s, left, right - 1);
    }
    left++;
    right--;
  }
  return true;
}

function isPalindromeRange(s: string, l: number, r: number): boolean {
  while (l < r) {
    if (s[l] !== s[r]) return false;
    l++; r--;
  }
  return true;
}`}
        highlight={[7, 8, 27, 28, 29]}
      />

      <h2>패턴 4: 중복 제거 (같은 방향 포인터)</h2>

      <CodeBlock
        filename="remove-duplicates.ts"
        language="typescript"
        code={`// 정렬된 배열에서 중복 제거 (in-place)
// [1,1,2,2,3] → [1,2,3,...] 반환: 3 (유니크 개수)
function removeDuplicates(nums: number[]): number {
  if (nums.length === 0) return 0;

  let slow = 0; // 유니크 값을 쓸 위치

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast]; // 유니크 값을 앞으로 옮김
    }
  }

  return slow + 1; // 유니크 개수
}

// slow: "여기까지가 정리된 구간"
// fast: "다음 후보를 탐색"
// 패턴: fast가 빨리 앞서가고, 조건 만족 시 slow에 기록`}
        highlight={[6, 8, 9, 10, 11]}
      />

      <h2>패턴 5: 세 수의 합 (3Sum)</h2>

      <CodeBlock
        filename="three-sum.ts"
        language="typescript"
        code={`// 합이 0인 세 수의 조합 찾기 (중복 없이)
// [-1, 0, 1, 2, -1, -4] → [[-1,-1,2],[-1,0,1]]
function threeSum(nums: number[]): number[][] {
  const result: number[][] = [];
  nums.sort((a, b) => a - b); // 정렬 필수

  for (let i = 0; i < nums.length - 2; i++) {
    // 중복 건너뛰기
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    // 나머지 두 수는 투 포인터로 찾기
    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        // 중복 건너뛰기
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}

// 핵심: 첫 번째 수를 고정 → 나머지 두 수를 투 포인터로
// 시간 O(n²), 공간 O(1) — 정렬 + 투 포인터 조합`}
        highlight={[5, 9, 12, 13, 16, 21, 22]}
      />

      <Callout variant="tip">
        <p>
          <strong>언제 투 포인터를 떠올릴까?</strong>
        </p>
        <p>
          &bull; 배열이 <strong>정렬</strong>되어 있거나 정렬해도 되는 경우<br />
          &bull; &ldquo;두 수의 합/차&rdquo;에서 공간 O(1)이 필요할 때<br />
          &bull; &ldquo;양 끝에서 좁혀가며&rdquo; 탐색하는 문제<br />
          &bull; in-place 중복 제거, 파티셔닝
        </p>
      </Callout>
    </DocLayout>
  );
}
