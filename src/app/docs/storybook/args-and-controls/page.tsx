import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function StorybookArgsAndControlsPage() {
  return (
    <DocLayout
      title="Args & Controls"
      description="Storybook Controls 패널에서 Props를 인터랙티브하게 조작하는 방법입니다."
    >
      <h2>Args란?</h2>
      <p>
        Args는 Story에 전달되는 Props 값입니다. Storybook은 args를 기반으로
        Controls 패널을 자동 생성하여, 브라우저에서 실시간으로 Props를 변경할
        수 있게 합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`export const Primary: Story = {
  args: {
    children: '버튼 텍스트',    // Controls에서 수정 가능
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
};`}
      />

      <h2>argTypes로 Controls 커스터마이징</h2>
      <p>
        TypeScript 타입에서 자동 추론되지만,{" "}
        <code>argTypes</code>로 더 세밀하게 제어할 수 있습니다.
      </p>

      <CodeBlock
        filename="Input.stories.tsx"
        language="tsx"
        code={`const meta = {
  title: 'Shared/UI/Form/Input',
  component: Input,
  parameters: {
    layout: 'centered',  // 중앙 정렬
  },
  argTypes: {
    label: {
      control: 'text',
      description: '플로팅 레이블',
    },
    error: {
      control: 'boolean',
      description: '에러 상태',
    },
    success: {
      control: 'boolean',
      description: '성공 상태',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    placeholder: {
      control: 'text',
      description: '플레이스홀더',
    },
  },
} satisfies Meta<typeof Input>;`}
        highlight={[7, 8, 9, 10, 12, 13, 14]}
      />

      <h2>Control 타입</h2>
      <table>
        <thead>
          <tr>
            <th>Control</th>
            <th>용도</th>
            <th>예시</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>text</code></td>
            <td>문자열 입력</td>
            <td>label, placeholder</td>
          </tr>
          <tr>
            <td><code>boolean</code></td>
            <td>체크박스 토글</td>
            <td>disabled, loading</td>
          </tr>
          <tr>
            <td><code>select</code></td>
            <td>드롭다운 선택</td>
            <td>variant, size</td>
          </tr>
          <tr>
            <td><code>radio</code></td>
            <td>라디오 선택</td>
            <td>2-3개 옵션</td>
          </tr>
          <tr>
            <td><code>number</code></td>
            <td>숫자 슬라이더</td>
            <td>count, max</td>
          </tr>
          <tr>
            <td><code>color</code></td>
            <td>색상 선택기</td>
            <td>bgColor</td>
          </tr>
          <tr>
            <td><code>object</code></td>
            <td>JSON 편집</td>
            <td>style, data</td>
          </tr>
        </tbody>
      </table>

      <h3>select Control 예시</h3>
      <CodeBlock
        language="tsx"
        code={`argTypes: {
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'ghost'],
    description: '버튼 스타일 변형',
    table: {
      defaultValue: { summary: 'primary' },
    },
  },
  size: {
    control: 'select',
    options: ['sm', 'md', 'lg'],
  },
}`}
        highlight={[3, 4, 11, 12]}
      />

      <h2>args 상속과 오버라이드</h2>
      <CodeBlock
        language="tsx"
        code={`// meta에서 기본 args 정의
const meta = {
  component: Button,
  args: {
    children: '기본 텍스트',
    variant: 'primary',
    size: 'md',
  },
} satisfies Meta<typeof Button>;

// 각 Story에서 필요한 것만 오버라이드
export const Primary: Story = {};  // meta.args 그대로 사용

export const Large: Story = {
  args: {
    size: 'lg',  // size만 오버라이드, 나머지는 meta.args 유지
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,  // disabled 추가
  },
};`}
        highlight={[4, 5, 6, 7, 16]}
      />

      <Callout variant="tip">
        <p>
          <code>meta.args</code>에 가장 일반적인 값을 설정하고, 각 Story에서는
          차이점만 오버라이드하면 중복 코드를 줄일 수 있습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
