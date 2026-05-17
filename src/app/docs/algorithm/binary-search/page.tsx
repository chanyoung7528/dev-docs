import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function BinarySearchPage() {
  return (
    <DocLayout
      title="이분 탐색"
      description="정렬된 데이터에서 O(log n)으로 값을 찾거나, 조건을 만족하는 경계를 탐색합니다."
    >
      <h2>기본 이분 탐색</h2>

      <CodeBlock
        filename="binary-search.ts"
        language="typescript"
        code={`// 정렬된 배열에서 target의 인덱스 찾기
function binarySearch(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;  // 오른쪽 절반 탐색
    } else {
      right = mid - 1; // 왼쪽 절반 탐색
    }
  }

  return -1; // 못 찾음
}

// 매 단계마다 탐색 범위가 절반 → O(log n)
// n=1,000,000 → 최대 20번 비교`}
        highlight={[6, 7, 9, 11, 12, 14]}
      />

      <h2>Lower Bound / Upper Bound</h2>
      <p>
        정확한 값이 아닌, &ldquo;조건을 만족하는 첫 위치 / 마지막 위치&rdquo;를
        찾는 변형입니다. 실전에서 가장 많이 쓰입니다.
      </p>

      <CodeBlock
        filename="bounds.ts"
        language="typescript"
        code={`// Lower Bound: target 이상인 첫 번째 위치
function lowerBound(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid; // target 이상이면 왼쪽으로
    }
  }

  return left;
}

// Upper Bound: target 초과인 첫 번째 위치
function upperBound(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] <= target) {
      left = mid + 1; // target 이하면 오른쪽으로
    } else {
      right = mid;
    }
  }

  return left;
}

// 활용: target의 개수 = upperBound - lowerBound
// [1, 2, 2, 2, 3, 4]에서 2의 개수
// lowerBound(arr, 2) = 1, upperBound(arr, 2) = 4 → 4-1 = 3개`}
        highlight={[8, 9, 11, 26, 27]}
      />

      <h2>응용: 조건 만족하는 최솟값 (Parametric Search)</h2>

      <CodeBlock
        filename="min-eating-speed.ts"
        language="typescript"
        code={`// 코코가 H시간 안에 바나나를 다 먹으려면 최소 속도 K는?
// piles = [3,6,7,11], h = 8 → 4
function minEatingSpeed(piles: number[], h: number): number {
  let left = 1;
  let right = Math.max(...piles); // 최대 속도 = 가장 큰 더미

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    // mid 속도로 먹으면 총 몇 시간?
    const hours = piles.reduce(
      (sum, pile) => sum + Math.ceil(pile / mid), 0
    );

    if (hours <= h) {
      right = mid;     // 가능 → 더 느린 속도도 가능할까?
    } else {
      left = mid + 1;  // 불가능 → 더 빨라야 함
    }
  }

  return left;
}

// 핵심: "가능한가?" 함수를 만들고
// 가능/불가능의 경계를 이분 탐색으로 찾기
// [불가, 불가, 불가, 가능, 가능, 가능] → 첫 번째 "가능" 찾기`}
        highlight={[4, 5, 11, 12, 15, 16, 18]}
      />

      <h2>응용: 회전 정렬 배열에서 탐색</h2>

      <CodeBlock
        filename="search-rotated.ts"
        language="typescript"
        code={`// [4,5,6,7,0,1,2]에서 target 찾기
// 정렬 배열을 특정 지점에서 회전시킨 배열
function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) return mid;

    // 왼쪽 절반이 정렬된 상태인가?
    if (nums[left] <= nums[mid]) {
      // target이 왼쪽 정렬 구간에 있는가?
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      // 오른쪽 절반이 정렬된 상태
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}

// 핵심: 항상 한쪽은 정렬되어 있음
// 정렬된 쪽에 target이 있는지 확인 → 범위 좁히기`}
        highlight={[12, 14, 15, 22]}
      />

      <Callout variant="tip">
        <p>
          <strong>이분 탐색 실전 팁</strong>
        </p>
        <p>
          &bull; <code>left &lt;= right</code> vs <code>left &lt; right</code> — 구간이 다름, 문제에 맞게<br />
          &bull; <code>mid = left + (right - left) / 2</code> — 오버플로 방지 (JS에선 불필요)<br />
          &bull; &ldquo;최소 X를 만족하는&rdquo; → Parametric Search (가능/불가능 경계)<br />
          &bull; 정렬된 데이터 + O(log n) 요구 → 이분 탐색
        </p>
      </Callout>
    </DocLayout>
  );
}
