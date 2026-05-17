import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ArrayMethodsPage() {
  return (
    <DocLayout
      title="배열 메서드 체이닝"
      description="filter, map, reduce, find 등 배열 메서드를 조합하여 데이터를 변환하는 실무 패턴입니다."
    >
      <h2>핵심 메서드 한눈에</h2>

      <CodeBlock
        language="typescript"
        code={`const items = [
  { id: 1, name: '성장 펀드', category: 'equity', returnRate: 12.5 },
  { id: 2, name: '안정 채권', category: 'bond', returnRate: 3.2 },
  { id: 3, name: '글로벌 주식', category: 'equity', returnRate: 8.7 },
  { id: 4, name: '단기 채권', category: 'bond', returnRate: 2.1 },
];

// filter — 조건에 맞는 요소만 (새 배열 반환)
const equityFunds = items.filter(item => item.category === 'equity');
// [{ id: 1, ... }, { id: 3, ... }]

// map — 각 요소를 변환 (새 배열 반환)
const names = items.map(item => item.name);
// ['성장 펀드', '안정 채권', '글로벌 주식', '단기 채권']

// find — 조건에 맞는 첫 번째 요소 (하나만 | undefined)
const found = items.find(item => item.id === 3);
// { id: 3, name: '글로벌 주식', ... }

// findIndex — 조건에 맞는 첫 번째 인덱스 (-1 if not found)
const index = items.findIndex(item => item.id === 3);
// 2

// some — 하나라도 조건 만족하면 true
const hasHighReturn = items.some(item => item.returnRate > 10);
// true

// every — 모두 조건 만족해야 true
const allPositive = items.every(item => item.returnRate > 0);
// true`}
        highlight={[9, 13, 17, 21, 25, 29]}
      />

      <h2>체이닝 — 실무 데이터 변환 파이프라인</h2>

      <CodeBlock
        filename="data-transform.ts"
        language="typescript"
        code={`interface Fund {
  id: string;
  name: string;
  category: string;
  returnRate: number;
  isActive: boolean;
}

// 활성 주식 펀드 중 수익률 상위 5개를 드롭다운 옵션으로 변환
const topFundOptions = funds
  .filter(fund => fund.isActive)                      // 활성만
  .filter(fund => fund.category === 'equity')         // 주식 펀드만
  .sort((a, b) => b.returnRate - a.returnRate)        // 수익률 내림차순
  .slice(0, 5)                                        // 상위 5개
  .map(fund => ({                                     // 드롭다운 옵션으로 변환
    label: \`\${fund.name} (\${fund.returnRate.toFixed(1)}%)\`,
    value: fund.id,
  }));`}
        highlight={[11, 12, 13, 14, 15]}
      />

      <h2>reduce — 누적 계산 & 그룹핑</h2>

      <CodeBlock
        language="typescript"
        code={`// 합계 계산
const totalReturn = funds.reduce(
  (sum, fund) => sum + fund.returnRate,
  0  // 초기값
);

// 그룹핑: 카테고리별로 묶기
const grouped = funds.reduce<Record<string, Fund[]>>(
  (acc, fund) => {
    const key = fund.category;
    acc[key] = [...(acc[key] ?? []), fund];
    return acc;
  },
  {}
);
// { equity: [Fund, Fund], bond: [Fund, Fund] }

// 최대값 찾기
const bestFund = funds.reduce(
  (best, fund) => fund.returnRate > best.returnRate ? fund : best
);

// 카운트
const categoryCounts = funds.reduce<Record<string, number>>(
  (acc, fund) => ({
    ...acc,
    [fund.category]: (acc[fund.category] ?? 0) + 1,
  }),
  {}
);
// { equity: 2, bond: 2 }`}
        highlight={[2, 8, 19, 24]}
      />

      <Callout variant="note">
        <p>
          <code>reduce</code>는 강력하지만 가독성이 떨어질 수 있습니다.
          단순 합계나 그룹핑 외에는 <code>filter</code> + <code>map</code>
          조합이 더 읽기 쉬운 경우가 많습니다.
        </p>
      </Callout>

      <h2>includes, indexOf, flat, flatMap</h2>

      <CodeBlock
        language="typescript"
        code={`// includes — 배열에 값이 있는지 (boolean)
const categories = ['equity', 'bond', 'hybrid'];
categories.includes('equity');  // true
categories.includes('crypto');  // false

// indexOf — 값의 인덱스 (-1 if not found)
categories.indexOf('bond');  // 1

// flat — 중첩 배열 평탄화
const nested = [[1, 2], [3, 4], [5]];
nested.flat();  // [1, 2, 3, 4, 5]

// flatMap — map + flat (1단계)
const users = [
  { name: 'Kim', tags: ['admin', 'dev'] },
  { name: 'Lee', tags: ['dev'] },
];
const allTags = users.flatMap(user => user.tags);
// ['admin', 'dev', 'dev']

// 중복 제거: Set 활용
const uniqueTags = [...new Set(allTags)];
// ['admin', 'dev']`}
        highlight={[3, 11, 18, 22]}
      />

      <h2>정렬 (sort) 패턴</h2>

      <CodeBlock
        language="typescript"
        code={`// sort는 원본 배열을 변경함! (불변성 주의)
// → React에서는 반드시 복사 후 정렬
const sorted = [...funds].sort((a, b) => b.returnRate - a.returnRate);

// 문자열 정렬 (한글 포함)
const byName = [...funds].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

// 다중 조건 정렬
const multiSort = [...funds].sort((a, b) => {
  // 1순위: 카테고리 오름차순
  const catCompare = a.category.localeCompare(b.category);
  if (catCompare !== 0) return catCompare;
  // 2순위: 수익률 내림차순
  return b.returnRate - a.returnRate;
});

// 날짜 정렬
const byDate = [...items].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);`}
        highlight={[3, 6, 9]}
      />

      <Callout variant="danger">
        <p>
          <code>sort()</code>는 <strong>원본 배열을 변경</strong>합니다.
          React 상태에서는 반드시 <code>[...array].sort()</code>로 복사 후
          정렬하세요. <code>toSorted()</code>(ES2023)를 사용하면 원본을
          변경하지 않습니다.
        </p>
      </Callout>

      <h2>실무 팁: 빈 배열 안전 처리</h2>

      <CodeBlock
        language="typescript"
        code={`// API 응답이 없을 수 있는 경우
const funds = response?.data?.funds ?? [];

// 빈 배열 체크
if (funds.length === 0) {
  return <EmptyState message="펀드가 없습니다" />;
}

// Optional chaining + nullish coalescing으로 안전하게
const firstName = users?.[0]?.name ?? '없음';
const lastCategory = funds.at(-1)?.category ?? 'unknown';`}
        highlight={[2, 10, 11]}
      />
    </DocLayout>
  );
}
