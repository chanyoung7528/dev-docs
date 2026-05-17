import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function TanstackQueryUseMutationPage() {
  return (
    <DocLayout
      title="useMutation"
      description="서버 데이터를 변경(생성/수정/삭제)하는 Hook입니다."
    >
      <h2>useQuery vs useMutation</h2>
      <table>
        <thead>
          <tr>
            <th>특성</th>
            <th>useQuery</th>
            <th>useMutation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>용도</td>
            <td>데이터 조회 (GET)</td>
            <td>데이터 변경 (POST/PUT/DELETE)</td>
          </tr>
          <tr>
            <td>실행 시점</td>
            <td>컴포넌트 마운트 시 자동</td>
            <td><code>mutate()</code> 호출 시</td>
          </tr>
          <tr>
            <td>캐싱</td>
            <td>자동 캐싱</td>
            <td>캐싱 없음</td>
          </tr>
        </tbody>
      </table>

      <h2>기본 사용법</h2>
      <CodeBlock
        language="tsx"
        code={`const { mutate, isPending } = useMutation({
  mutationFn: (data: CreatePostDto) => postApi.create(data),
  onSuccess: () => {
    // 성공 후 처리
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
  onError: (error) => {
    // 에러 처리
  },
});

// 사용
<button onClick={() => mutate(formData)} disabled={isPending}>
  {isPending ? '저장 중...' : '저장'}
</button>`}
        highlight={[3, 5]}
      />

      <h2>실전 패턴: 로그인 + 캐시 업데이트</h2>
      <p>
        프로젝트에서 로그인 성공 후 사용자 정보를 즉시 캐시에 저장하는 패턴입니다.
      </p>

      <CodeBlock
        filename="member.queries.ts"
        language="tsx"
        code={`export function useLoginGeneral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberApi.loginGeneral,
    meta: { skipGlobalError: true },
    onSuccess: async response => {
      if (response.data?.passwordChangeAlert) return;

      // 로그인 성공 → 유저 정보 즉시 fetch + 캐시
      const result = await queryClient.fetchQuery(memberQueries.me());
      if (result.data) authCache.set(result.data);
      authCache.setJoinTpCd(JoinTypeCode.GENERAL);
    },
  });
}`}
        highlight={[7, 11, 12]}
      />

      <h2>콜백 라이프사이클</h2>
      <CodeBlock
        language="tsx"
        code={`useMutation({
  mutationFn: api.update,

  // 1. 요청 직전 (Optimistic Update에 사용)
  onMutate: async (variables) => {
    // 진행 중인 쿼리 취소 + 이전 데이터 스냅샷
    return { previousData };
  },

  // 2. 성공 시
  onSuccess: (data, variables, context) => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },

  // 3. 에러 시
  onError: (error, variables, context) => {
    // Optimistic Update 롤백
    queryClient.setQueryData(['items'], context?.previousData);
  },

  // 4. 성공/에러 상관없이 항상 실행
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
});`}
        highlight={[5, 11, 16, 22]}
      />

      <h2>mutate vs mutateAsync</h2>
      <CodeBlock
        language="tsx"
        code={`// mutate: 콜백 기반 (추천)
mutate(data, {
  onSuccess: () => router.push('/list'),
});

// mutateAsync: Promise 반환 (try/catch 필요)
async function handleSubmit() {
  try {
    await mutateAsync(data);
    router.push('/list');
  } catch (error) {
    // 에러는 반드시 catch해야 함
  }
}`}
      />

      <Callout variant="tip">
        <p>
          일반적으로 <code>mutate</code>의 콜백을 사용하는 것이 권장됩니다.
          <code>mutateAsync</code>는 여러 mutation을 순차 실행할 때만 사용하세요.
        </p>
      </Callout>
    </DocLayout>
  );
}
