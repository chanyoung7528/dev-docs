import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function SlidingWindowPage() {
  return (
    <DocLayout
      title="슬라이딩 윈도우"
      description="고정/가변 크기 창을 한 칸씩 밀어가며 연속 구간 최적값을 O(n)에 구하는 패턴입니다."
    >
      <h2>핵심 개념</h2>
      <p>
        배열/문자열에서 <strong>연속된 구간(window)</strong>을 유지하면서
        한 칸씩 밀어가는 방식입니다. 구간을 매번 새로 계산하지 않고,
        들어오는 값과 나가는 값만 처리하여 O(n)을 달성합니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`// 두 가지 변형
// 1. 고정 윈도우: 크기 k가 주어짐 → 단순 슬라이드
// 2. 가변 윈도우: 조건 만족하는 최소/최대 구간 → 수축/확장`}
      />

      <h2>패턴 1: 고정 윈도우 — 최대 합</h2>

      <CodeBlock
        filename="max-sum-subarray.ts"
        language="typescript"
        code={`// 크기 k인 연속 부분 배열의 최대 합
function maxSumSubarray(nums: number[], k: number): number {
  // 첫 윈도우 합 계산
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += nums[i];
  }

  let maxSum = windowSum;

  // 윈도우를 한 칸씩 밀기
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i];      // 새 값 추가
    windowSum -= nums[i - k];  // 오래된 값 제거
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

// [2, 1, 5, 1, 3, 2], k=3
// 윈도우: [2,1,5]=8 → [1,5,1]=7 → [5,1,3]=9 → [1,3,2]=6
// 최대: 9`}
        highlight={[4, 5, 6, 12, 13, 14]}
      />

      <h2>패턴 2: 가변 윈도우 — 조건 만족하는 최소 길이</h2>

      <CodeBlock
        filename="min-subarray-len.ts"
        language="typescript"
        code={`// 합이 target 이상인 최소 길이 연속 부분 배열
// [2,3,1,2,4,3], target=7 → 2 ([4,3])
function minSubArrayLen(target: number, nums: number[]): number {
  let left = 0;
  let sum = 0;
  let minLen = Infinity;

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right]; // 확장

    // 조건 만족하면 → 수축하며 최소 길이 갱신
    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left]; // 왼쪽 제거
      left++;            // 수축
    }
  }

  return minLen === Infinity ? 0 : minLen;
}

// 핵심 구조:
// right를 늘려 확장 → 조건 만족 시 left를 늘려 수축
// 확장/수축 각각 최대 n번 → 총 O(n)`}
        highlight={[8, 9, 12, 13, 14, 15]}
      />

      <h2>패턴 3: 중복 없는 최장 부분 문자열</h2>

      <CodeBlock
        filename="longest-substring.ts"
        language="typescript"
        code={`// 중복 문자가 없는 가장 긴 부분 문자열의 길이
// "abcabcbb" → 3 ("abc")
function lengthOfLongestSubstring(s: string): number {
  const charIndex = new Map<string, number>(); // 문자 → 마지막 인덱스
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    // 이미 윈도우 안에 있는 문자라면 → left를 그 다음으로 점프
    if (charIndex.has(char) && charIndex.get(char)! >= left) {
      left = charIndex.get(char)! + 1;
    }

    charIndex.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// "abcabcbb"
// a: {a:0} len=1
// b: {a:0,b:1} len=2
// c: {a:0,b:1,c:2} len=3
// a: a가 이미 있음! left=0+1=1, {a:3,b:1,c:2} len=3
// ...`}
        highlight={[4, 12, 13, 16, 17]}
      />

      <h2>패턴 4: 최대 K개 교체 후 최장 반복 문자열</h2>

      <CodeBlock
        filename="character-replacement.ts"
        language="typescript"
        code={`// 최대 k번 문자를 교체하여 만들 수 있는 가장 긴 동일 문자 부분 문자열
// "AABABBA", k=1 → 4 ("AABA" → "AAAA")
function characterReplacement(s: string, k: number): number {
  const freq = new Map<string, number>();
  let left = 0;
  let maxFreq = 0; // 윈도우 내 가장 많은 문자의 빈도
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    freq.set(char, (freq.get(char) ?? 0) + 1);
    maxFreq = Math.max(maxFreq, freq.get(char)!);

    // 윈도우 크기 - 최다 문자 = 교체 필요 횟수
    // 교체 필요 > k면 → 수축
    const windowSize = right - left + 1;
    if (windowSize - maxFreq > k) {
      freq.set(s[left], freq.get(s[left])! - 1);
      left++;
    }

    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// 핵심 아이디어:
// 윈도우에서 "가장 많은 문자"를 유지하고, 나머지를 교체
// 교체 횟수 = 윈도우 크기 - 최다 문자 빈도`}
        highlight={[6, 12, 16, 17]}
      />

      <Callout variant="tip">
        <p>
          <strong>언제 슬라이딩 윈도우를 떠올릴까?</strong>
        </p>
        <p>
          &bull; &ldquo;연속된 부분 배열/문자열&rdquo;이 키워드<br />
          &bull; &ldquo;최대/최소 길이&rdquo; 또는 &ldquo;최대/최소 합&rdquo;<br />
          &bull; &ldquo;K개 이하의 조건으로&rdquo; (가변 윈도우)<br />
          &bull; &ldquo;크기 K인 구간에서&rdquo; (고정 윈도우)
        </p>
      </Callout>
    </DocLayout>
  );
}
