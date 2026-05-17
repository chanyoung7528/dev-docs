import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function SortingPage() {
  return (
    <DocLayout
      title="정렬 알고리즘"
      description="정렬의 원리를 이해하고, 커스텀 정렬과 위상 정렬 등 실전 패턴을 다룹니다."
    >
      <h2>정렬 알고리즘 비교</h2>

      <CodeBlock
        language="typescript"
        code={`// 시간 복잡도 비교
// 버블 정렬:  O(n²) — 느리지만 이해하기 쉬움
// 선택 정렬:  O(n²) — 느림
// 삽입 정렬:  O(n²) — 거의 정렬된 데이터에서 빠름
// 병합 정렬:  O(n log n) — 안정적, 추가 공간 O(n)
// 퀵 정렬:    O(n log n) 평균, O(n²) 최악 — 실무 가장 빠름
// JS sort():  O(n log n) — TimSort (병합+삽입 하이브리드)

// 코딩 테스트에서는 Array.sort()를 쓰되,
// 정렬 알고리즘 자체를 구현하라는 문제도 나옴`}
      />

      <h2>병합 정렬 (Merge Sort) 구현</h2>

      <CodeBlock
        filename="merge-sort.ts"
        language="typescript"
        code={`// 분할 정복: 반으로 나누고 → 정렬하고 → 합치기
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));   // 왼쪽 정렬
  const right = mergeSort(arr.slice(mid));      // 오른쪽 정렬

  return merge(left, right);                    // 합치기
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0;
  let j = 0;

  // 두 정렬된 배열을 하나로 합치기
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  // 남은 요소 추가
  return [...result, ...left.slice(i), ...right.slice(j)];
}

mergeSort([38, 27, 43, 3, 9, 82, 10]);
// [3, 9, 10, 27, 38, 43, 82]`}
        highlight={[4, 5, 6, 8, 18, 19, 20, 22]}
      />

      <h2>퀵 정렬 (Quick Sort) 구현</h2>

      <CodeBlock
        filename="quick-sort.ts"
        language="typescript"
        code={`// 피벗 기준으로 작은 것/큰 것을 분할 → 재귀
function quickSort(arr: number[], low = 0, high = arr.length - 1): number[] {
  if (low < high) {
    const pivotIdx = partition(arr, low, high);
    quickSort(arr, low, pivotIdx - 1);   // 피벗 왼쪽 정렬
    quickSort(arr, pivotIdx + 1, high);   // 피벗 오른쪽 정렬
  }
  return arr;
}

function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high]; // 마지막 요소를 피벗으로
  let i = low - 1;        // 작은 요소의 경계

  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; // 피벗을 올바른 위치로
  return i + 1;
}`}
        highlight={[4, 5, 6, 12, 13, 16, 18, 22]}
      />

      <h2>커스텀 정렬 (실전 필수)</h2>

      <CodeBlock
        filename="custom-sort.ts"
        language="typescript"
        code={`// JS sort의 compare 함수: 음수 → a 먼저, 양수 → b 먼저, 0 → 동일

// 숫자 정렬 (주의: 기본 sort는 문자열 비교!)
[10, 9, 8].sort();              // [10, 8, 9] ❌ 문자열 비교
[10, 9, 8].sort((a, b) => a - b); // [8, 9, 10] ✅ 오름차순
[10, 9, 8].sort((a, b) => b - a); // [10, 9, 8] ✅ 내림차순

// 객체 배열 다중 조건 정렬
interface Student { name: string; score: number; grade: number }

const students: Student[] = [
  { name: 'Kim', score: 90, grade: 2 },
  { name: 'Lee', score: 95, grade: 1 },
  { name: 'Park', score: 90, grade: 1 },
];

// 1순위: 점수 내림차순, 2순위: 학년 오름차순
students.sort((a, b) => {
  if (a.score !== b.score) return b.score - a.score;
  return a.grade - b.grade;
});
// [Lee(95,1), Park(90,1), Kim(90,2)]

// 가장 큰 수 만들기 (문자열 조합 비교)
function largestNumber(nums: number[]): string {
  const sorted = nums
    .map(String)
    .sort((a, b) => (b + a).localeCompare(a + b));

  if (sorted[0] === '0') return '0';
  return sorted.join('');
}

largestNumber([3, 30, 34, 5, 9]); // "9534330"
// 비교: "330" vs "303" → "330" > "303" → 3이 30보다 앞`}
        highlight={[5, 6, 19, 20, 21, 29]}
      />

      <h2>K번째 큰 수 (Quick Select)</h2>

      <CodeBlock
        filename="kth-largest.ts"
        language="typescript"
        code={`// 정렬하지 않고 K번째 큰 수 찾기 — 평균 O(n)
// 퀵 정렬의 partition만 활용
function findKthLargest(nums: number[], k: number): number {
  const target = nums.length - k; // k번째 큰 수 = (n-k)번째 작은 수

  function quickSelect(low: number, high: number): number {
    const pivotIdx = partition(nums, low, high);

    if (pivotIdx === target) return nums[pivotIdx];
    if (pivotIdx < target) return quickSelect(pivotIdx + 1, high);
    return quickSelect(low, pivotIdx - 1);
  }

  return quickSelect(0, nums.length - 1);
}

// 또는 간단하게 (실전에서 충분):
function findKthLargestSimple(nums: number[], k: number): number {
  nums.sort((a, b) => b - a);
  return nums[k - 1];
}`}
        highlight={[4, 8, 9, 10]}
      />

      <Callout variant="tip">
        <p>
          <strong>정렬 관련 코테 팁</strong>
        </p>
        <p>
          &bull; 대부분 <code>Array.sort()</code>를 쓰면 됨 — O(n log n)<br />
          &bull; compare 함수 없이 sort()하면 <strong>문자열 비교</strong>됨! 주의<br />
          &bull; 정렬 + 투 포인터 조합이 빈출 (3Sum, 회의실 배정 등)<br />
          &bull; &ldquo;K번째&rdquo; 문제 → 정렬 or Quick Select or 힙
        </p>
      </Callout>
    </DocLayout>
  );
}
