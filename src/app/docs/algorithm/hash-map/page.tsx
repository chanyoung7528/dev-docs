import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function HashMapPage() {
  return (
    <DocLayout
      title="해시맵 (Map / Object)"
      description="O(1) 탐색으로 빈도 카운팅, 중복 검사, 매핑 문제를 푸는 가장 기본적인 패턴입니다."
    >
      <h2>핵심 개념</h2>
      <p>
        해시맵은 <strong>key → value 매핑</strong>을 O(1)에 수행합니다.
        &ldquo;이 값을 본 적 있는가?&rdquo;, &ldquo;몇 번 나왔는가?&rdquo;를
        물어보는 문제에서 가장 먼저 떠올려야 합니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`// JavaScript에서 해시맵
const map = new Map<string, number>();  // Map (권장)
const obj: Record<string, number> = {}; // Object (간단할 때)

// Map vs Object
// Map: 어떤 타입이든 key 가능, size 프로퍼티, 순회 순서 보장
// Object: string/symbol key만, JSON.stringify 가능`}
      />

      <h2>패턴 1: Two Sum (가장 빈출)</h2>
      <p>
        배열에서 합이 target인 두 수의 인덱스를 찾아라.
      </p>

      <CodeBlock
        filename="two-sum.ts"
        language="typescript"
        code={`// 시간 O(n), 공간 O(n)
function twoSum(nums: number[], target: number): [number, number] {
  const map = new Map<number, number>(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }

    map.set(nums[i], i);
  }

  throw new Error('No solution');
}

// 핵심: "내가 필요한 값(complement)을 누가 갖고 있는가?"를
// 매번 배열을 다시 순회하는 대신, Map에 기록해두고 O(1)로 찾는다.
twoSum([2, 7, 11, 15], 9); // [0, 1]`}
        highlight={[3, 7, 8, 11]}
      />

      <h2>패턴 2: 빈도 카운팅</h2>

      <CodeBlock
        filename="frequency.ts"
        language="typescript"
        code={`// 문자열에서 각 문자의 빈도 세기
function charFrequency(s: string): Map<string, number> {
  const freq = new Map<string, number>();

  for (const char of s) {
    freq.set(char, (freq.get(char) ?? 0) + 1);
  }

  return freq;
}

// 응용: 애너그램 판별 (두 문자열이 같은 문자 구성인가?)
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;

  const freq = new Map<string, number>();

  for (const char of s) freq.set(char, (freq.get(char) ?? 0) + 1);
  for (const char of t) freq.set(char, (freq.get(char) ?? 0) - 1);

  for (const count of freq.values()) {
    if (count !== 0) return false;
  }
  return true;
}

isAnagram('listen', 'silent'); // true`}
        highlight={[5, 6, 17, 18]}
      />

      <h2>패턴 3: 중복 검사</h2>

      <CodeBlock
        filename="duplicates.ts"
        language="typescript"
        code={`// 배열에 중복이 있는가?
function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();

  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }

  return false;
}

// 첫 번째 중복되지 않는 문자 찾기
function firstUniqChar(s: string): number {
  const freq = new Map<string, number>();

  for (const char of s) {
    freq.set(char, (freq.get(char) ?? 0) + 1);
  }

  for (let i = 0; i < s.length; i++) {
    if (freq.get(s[i]) === 1) return i;
  }

  return -1;
}

firstUniqChar('leetcode'); // 0 ('l')
firstUniqChar('aabb');     // -1`}
        highlight={[3, 5, 6, 15]}
      />

      <h2>패턴 4: 그룹핑</h2>

      <CodeBlock
        filename="group-anagrams.ts"
        language="typescript"
        code={`// 애너그램끼리 그룹핑
// 입력: ["eat","tea","tan","ate","nat","bat"]
// 출력: [["eat","tea","ate"],["tan","nat"],["bat"]]
function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();

  for (const str of strs) {
    // 정렬된 문자열을 키로 사용
    const key = str.split('').sort().join('');
    const group = map.get(key) ?? [];
    group.push(str);
    map.set(key, group);
  }

  return [...map.values()];
}

// 핵심: "같은 그룹"의 기준을 키로 변환하여 Map에 모은다
// eat → aet, tea → aet, ate → aet → 같은 키!`}
        highlight={[5, 9, 10, 11]}
      />

      <h2>패턴 5: 누적합 + 해시맵 (Subarray Sum)</h2>

      <CodeBlock
        filename="subarray-sum.ts"
        language="typescript"
        code={`// 합이 k인 연속 부분 배열의 개수
// 입력: nums = [1,1,1], k = 2 → 출력: 2 ([1,1], [1,1])
function subarraySum(nums: number[], k: number): number {
  // prefixSum[i] - prefixSum[j] = k → j~i 구간의 합이 k
  // → prefixSum[j] = prefixSum[i] - k 인 j가 있었는가?
  const prefixCount = new Map<number, number>();
  prefixCount.set(0, 1); // 빈 구간 (처음부터 합이 k인 경우)

  let sum = 0;
  let count = 0;

  for (const num of nums) {
    sum += num;
    const target = sum - k;

    if (prefixCount.has(target)) {
      count += prefixCount.get(target)!;
    }

    prefixCount.set(sum, (prefixCount.get(sum) ?? 0) + 1);
  }

  return count;
}

subarraySum([1, 1, 1], 2); // 2`}
        highlight={[6, 7, 14, 16, 17, 20]}
      />

      <Callout variant="tip">
        <p>
          <strong>언제 해시맵을 떠올릴까?</strong>
        </p>
        <p>
          &bull; &ldquo;두 수의 합/차&rdquo; → Two Sum 패턴<br />
          &bull; &ldquo;빈도/개수&rdquo; → 빈도 카운팅<br />
          &bull; &ldquo;중복 있는가&rdquo; → Set<br />
          &bull; &ldquo;그룹으로 묶어라&rdquo; → 그룹핑<br />
          &bull; &ldquo;연속 부분 배열의 합&rdquo; → 누적합 + 해시맵
        </p>
      </Callout>
    </DocLayout>
  );
}
