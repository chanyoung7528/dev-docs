import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function StorybookInteractionTestingPage() {
  return (
    <DocLayout
      title="인터랙션 테스트"
      description="Storybook에서 사용자 인터랙션을 시뮬레이션하고 테스트하는 방법입니다."
    >
      <h2>인터랙션 테스트란?</h2>
      <p>
        Story에 <code>play</code> 함수를 추가하면 사용자 행동(클릭, 입력 등)을
        자동으로 시뮬레이션하고, 결과를 검증할 수 있습니다.
        별도의 테스트 파일 없이 Story 안에서 테스트가 완성됩니다.
      </p>

      <h2>기본 사용법</h2>
      <CodeBlock
        language="tsx"
        code={`import { expect, fn, userEvent, within } from '@storybook/test';

export const ClickTest: Story = {
  args: {
    onClick: fn(),
    children: '클릭',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // 버튼 찾기
    const button = canvas.getByRole('button', { name: '클릭' });

    // 클릭 시뮬레이션
    await userEvent.click(button);

    // onClick이 호출되었는지 검증
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};`}
        highlight={[8, 15, 18]}
      />

      <h2>폼 입력 테스트</h2>
      <CodeBlock
        language="tsx"
        code={`export const FormSubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 입력 필드에 텍스트 입력
    const nameInput = canvas.getByLabelText('이름');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '김철수');

    const emailInput = canvas.getByLabelText('이메일');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'test@example.com');

    // 제출 버튼 클릭
    const submitButton = canvas.getByRole('button', { name: '저장' });
    await userEvent.click(submitButton);

    // 결과 검증
    await expect(canvas.getByText('저장 완료')).toBeInTheDocument();
  },
};`}
        highlight={[7, 8, 11, 12, 16, 19]}
      />

      <h2>주요 API</h2>
      <table>
        <thead>
          <tr>
            <th>API</th>
            <th>설명</th>
            <th>예시</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>within</code></td>
            <td>DOM 쿼리 범위 지정</td>
            <td><code>within(canvasElement)</code></td>
          </tr>
          <tr>
            <td><code>userEvent.click</code></td>
            <td>클릭 시뮬레이션</td>
            <td><code>await userEvent.click(el)</code></td>
          </tr>
          <tr>
            <td><code>userEvent.type</code></td>
            <td>텍스트 입력</td>
            <td><code>await userEvent.type(input, &apos;text&apos;)</code></td>
          </tr>
          <tr>
            <td><code>expect</code></td>
            <td>결과 검증</td>
            <td><code>expect(el).toBeVisible()</code></td>
          </tr>
          <tr>
            <td><code>fn()</code></td>
            <td>Mock 함수 생성</td>
            <td><code>args: {'{ onClick: fn() }'}</code></td>
          </tr>
        </tbody>
      </table>

      <h2>DOM 쿼리 메서드</h2>
      <CodeBlock
        language="tsx"
        code={`const canvas = within(canvasElement);

// role 기반 (추천)
canvas.getByRole('button', { name: '저장' });
canvas.getByRole('textbox');
canvas.getByRole('checkbox');

// 텍스트 기반
canvas.getByText('로그인');
canvas.getByLabelText('이메일');
canvas.getByPlaceholderText('검색어 입력');

// 존재 여부 확인 (없어도 에러 안 남)
canvas.queryByText('에러 메시지');  // null 또는 element`}
        highlight={[4, 10, 14]}
      />

      <h2>비동기 대기</h2>
      <CodeBlock
        language="tsx"
        code={`export const AsyncTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: '로드' }));

    // 비동기 결과가 나타날 때까지 대기
    await expect(
      canvas.findByText('로드 완료')  // findBy = waitFor + getBy
    ).resolves.toBeInTheDocument();
  },
};`}
        highlight={[8, 9]}
      />

      <Callout variant="tip">
        <p>
          인터랙션 테스트는 Storybook UI의 &quot;Interactions&quot; 패널에서
          단계별로 실행 과정을 확인할 수 있습니다.
          실패한 단계에서 멈추므로 디버깅이 쉽습니다.
          CI에서 <code>test-storybook</code>으로 자동 실행할 수도 있습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
