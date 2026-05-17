import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function TanstackQueryOptimisticUpdatesPage() {
  return (
    <DocLayout
      title="Optimistic Updates"
      description="서버 응답을 기다리지 않고 UI를 먼저 업데이트하는 패턴입니다."
    >
      <h2>Optimistic Update란?</h2>
      <p>
        서버에 요청을 보낸 후 응답을 기다리지 않고, &quot;성공할 것&quot;이라고
        가정하고 UI를 먼저 업데이트합니다. 실패하면 이전 상태로 롤백합니다.
        좋아요, 토글, 체크박스 등 즉각적인 피드백이 필요한 곳에 사용합니다.
      </p>

      <h2>실전 적용: 약관 동의 토글</h2>
      <p>
        프로젝트에서 건강검진 동의 여부를 토글하는 기능입니다. 체크 즉시
        UI가 변경되고, 실패 시 원래 상태로 복구됩니다.
      </p>

      <CodeBlock
        filename="agreement.queries.ts"
        language="tsx"
        code={`export function useUpdateCheckupConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agreementApi.updateCheckupConsent,

    onMutate: async ({ agrmNo, consentYn }) => {
      // 1. 진행 중인 refetch 취소 (optimistic 데이터 덮어쓰기 방지)
      await queryClient.cancelQueries({
        queryKey: agreementKeys.myConsents(),
      });

      // 2. 이전 데이터 스냅샷 (롤백용)
      const previous = queryClient.getQueryData<ApiResponse<MyConsent[]>>(
        agreementKeys.myConsents()
      );

      // 3. 캐시를 낙관적으로 업데이트
      queryClient.setQueryData<ApiResponse<MyConsent[]>>(
        agreementKeys.myConsents(),
        old => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map(consent =>
              consent.agrmNo === agrmNo
                ? { ...consent, agrYn: consentYn }
                : consent
            ),
          };
        }
      );

      return { previous };  // context로 전달
    },

    onError: (_err, _vars, context) => {
      // 4. 에러 시 이전 데이터로 롤백
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          agreementKeys.myConsents(),
          context.previous
        );
      }
    },

    onSettled: () => {
      // 5. 성공/실패 상관없이 서버와 동기화
      queryClient.invalidateQueries({
        queryKey: agreementKeys.myConsents(),
      });
    },
  });
}`}
        highlight={[7, 9, 10, 14, 15, 19, 20, 34, 38, 39, 47, 48]}
      />

      <h2>Optimistic Update 흐름</h2>
      <CodeBlock
        language="plaintext"
        code={`[사용자 클릭]
  ↓
onMutate: 캐시 즉시 업데이트 (UI 반영)
  ↓
mutationFn: 서버에 요청
  ↓
  ├── 성공 → onSettled: invalidateQueries (서버 데이터로 갱신)
  └── 실패 → onError: 스냅샷으로 롤백 → onSettled`}
      />

      <Callout variant="warning">
        <p>
          <code>onMutate</code>에서 반드시{" "}
          <code>cancelQueries</code>를 호출하세요. 진행 중인 refetch가 있으면
          낙관적 업데이트를 덮어쓸 수 있습니다.
        </p>
      </Callout>

      <h2>사용 판단 기준</h2>
      <table>
        <thead>
          <tr>
            <th>적합</th>
            <th>부적합</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>좋아요/북마크 토글</td>
            <td>결제/송금</td>
          </tr>
          <tr>
            <td>체크박스 토글</td>
            <td>파일 업로드</td>
          </tr>
          <tr>
            <td>리스트 순서 변경</td>
            <td>복잡한 유효성 검사 필요한 폼</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="tip">
        <p>
          실패 확률이 낮고, 실패해도 롤백으로 복구 가능한 경우에만 사용하세요.
          금전 관련이나 되돌릴 수 없는 작업에는 사용하지 마세요.
        </p>
      </Callout>
    </DocLayout>
  );
}
