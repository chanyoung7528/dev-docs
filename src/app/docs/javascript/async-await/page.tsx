import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function AsyncAwaitPage() {
  return (
    <DocLayout
      title="async / await"
      description="Promise 기반 비동기 코드를 동기적으로 읽히게 작성하는 핵심 패턴입니다."
    >
      <h2>기본 사용법</h2>

      <CodeBlock
        language="typescript"
        code={`// async 함수는 항상 Promise를 반환
async function fetchFund(id: string): Promise<Fund> {
  const response = await fetch(\`/api/funds/\${id}\`);

  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}\`);
  }

  return response.json(); // 자동으로 Promise<Fund>
}

// 사용
try {
  const fund = await fetchFund('123');
  console.log(fund.name);
} catch (error) {
  console.error('펀드 조회 실패:', error);
}`}
        highlight={[2, 3, 12]}
      />

      <h2>에러 처리 패턴</h2>

      <CodeBlock
        filename="error-handling.ts"
        language="typescript"
        code={`// 패턴 1: try-catch (가장 기본)
async function fetchWithTryCatch(id: string) {
  try {
    const data = await api.getFund(id);
    return { data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    return { data: null, error: message };
  }
}

// 패턴 2: Go 스타일 (tuple 반환)
async function fetchSafe<T>(
  promise: Promise<T>
): Promise<[T, null] | [null, Error]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

// 사용
const [fund, error] = await fetchSafe(api.getFund('123'));
if (error) {
  showError(error.message);
  return;
}
// fund는 여기서 non-null로 좁혀짐
console.log(fund.name);`}
        highlight={[13, 25]}
      />

      <h2>병렬 실행 — Promise.all</h2>
      <p>
        독립적인 비동기 작업은 <code>Promise.all</code>로 병렬 실행하면
        총 대기 시간이 줄어듭니다.
      </p>

      <CodeBlock
        language="typescript"
        code={`// 순차 실행 — 총 3초 (1+1+1)
const funds = await fetchFunds();       // 1초
const user = await fetchUser();         // 1초
const config = await fetchConfig();     // 1초

// 병렬 실행 — 총 1초 (가장 느린 것만큼)
const [funds, user, config] = await Promise.all([
  fetchFunds(),
  fetchUser(),
  fetchConfig(),
]);
// 셋 다 완료될 때까지 대기
// 하나라도 실패하면 전체 실패 (catch로 빠짐)`}
        highlight={[7, 8, 9, 10]}
      />

      <Callout variant="warning">
        <p>
          <code>Promise.all</code>은 하나라도 실패하면 전체가 실패합니다.
          일부 실패를 허용하려면 <code>Promise.allSettled</code>를 사용하세요.
        </p>
      </Callout>

      <h2>Promise.allSettled — 실패해도 나머지 결과 받기</h2>

      <CodeBlock
        language="typescript"
        code={`// 대시보드: 여러 위젯 데이터를 동시에 불러옴
// 일부 실패해도 나머지는 보여줘야 함
const results = await Promise.allSettled([
  fetchPortfolio(),
  fetchMarketIndex(),
  fetchAlerts(),
]);

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(\`Widget \${index}: 성공\`, result.value);
  } else {
    console.log(\`Widget \${index}: 실패\`, result.reason);
  }
});

// 성공한 것만 추출
const successData = results
  .filter((r): r is PromiseFulfilledResult<unknown> => r.status === 'fulfilled')
  .map(r => r.value);`}
        highlight={[3, 10, 12, 19]}
      />

      <h2>순차 실행이 필요한 경우</h2>

      <CodeBlock
        language="typescript"
        code={`// 앞의 결과가 뒤의 입력으로 필요한 경우 — 순차 실행
async function loadUserPortfolio(userId: string) {
  // 1단계: 유저 정보 (필수 선행)
  const user = await fetchUser(userId);

  // 2단계: 유저의 포트폴리오 (user.portfolioId 필요)
  const portfolio = await fetchPortfolio(user.portfolioId);

  // 3단계: 포트폴리오의 펀드 목록 (portfolio.fundIds 필요)
  const funds = await fetchFunds(portfolio.fundIds);

  return { user, portfolio, funds };
}

// 부분 병렬화: 의존성 없는 것끼리 묶기
async function loadDashboard(userId: string) {
  const user = await fetchUser(userId);

  // user를 받은 후, 독립적인 두 요청은 병렬로
  const [portfolio, notifications] = await Promise.all([
    fetchPortfolio(user.portfolioId),
    fetchNotifications(user.id),
  ]);

  return { user, portfolio, notifications };
}`}
        highlight={[4, 7, 10, 20, 21, 22]}
      />

      <h2>React에서의 비동기 패턴</h2>

      <CodeBlock
        filename="useFetch.tsx"
        language="tsx"
        code={`// useEffect 안에서 async 사용 (주의: effect 자체는 async 불가)
useEffect(() => {
  // 내부에 async 함수를 선언하고 즉시 호출
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchFund(fundId);
      setFund(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류');
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [fundId]);

// 실무에서는 TanStack Query가 이 모든 것을 대신 처리
const { data, isLoading, error } = useQuery({
  queryKey: ['fund', fundId],
  queryFn: () => fetchFund(fundId),
});`}
        highlight={[2, 4, 16, 20]}
      />

      <Callout variant="note">
        <p>
          <code>useEffect</code>에 직접 <code>async</code>를 붙이면 안 됩니다.
          클린업 함수 대신 Promise를 반환하게 되어 React가 제대로 처리하지
          못합니다. 반드시 내부에 async 함수를 따로 선언하세요.
        </p>
      </Callout>

      <h2>Promise.race — 타임아웃 구현</h2>

      <CodeBlock
        language="typescript"
        code={`// 타임아웃: API 응답이 5초 안에 안 오면 에러
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(\`Timeout: \${ms}ms 초과\`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// 사용
try {
  const data = await withTimeout(fetchFund('123'), 5000);
} catch (e) {
  // 5초 초과 시 'Timeout: 5000ms 초과'
}`}
        highlight={[2, 6, 11]}
      />
    </DocLayout>
  );
}
