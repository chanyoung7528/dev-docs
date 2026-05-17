import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function StorybookAddonsPage() {
  return (
    <DocLayout
      title="Addon 활용"
      description="Storybook의 기능을 확장하는 Addon 사용법을 알아봅니다."
    >
      <h2>주요 내장 Addon</h2>
      <table>
        <thead>
          <tr>
            <th>Addon</th>
            <th>기능</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Controls</code></td>
            <td>Props를 인터랙티브하게 변경</td>
          </tr>
          <tr>
            <td><code>Actions</code></td>
            <td>이벤트 핸들러 호출 로깅</td>
          </tr>
          <tr>
            <td><code>Viewport</code></td>
            <td>다양한 화면 크기 미리보기</td>
          </tr>
          <tr>
            <td><code>Backgrounds</code></td>
            <td>배경색 전환</td>
          </tr>
          <tr>
            <td><code>Docs</code></td>
            <td>자동 문서 생성</td>
          </tr>
        </tbody>
      </table>

      <h2>Actions: 이벤트 로깅</h2>
      <p>
        콜백 Props가 호출될 때 Actions 패널에 로그가 표시됩니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`const meta = {
  title: 'Shared/UI/Form/Button',
  component: Button,
  argTypes: {
    onClick: { action: 'clicked' },  // 클릭 시 Actions 패널에 로그
  },
} satisfies Meta<typeof Button>;

// 또는 args에서 fn() 사용
import { fn } from '@storybook/test';

export const WithAction: Story = {
  args: {
    onClick: fn(),  // 호출 추적 + Actions 로그
  },
};`}
        highlight={[5, 14]}
      />

      <h2>Viewport: 반응형 테스트</h2>
      <CodeBlock
        language="tsx"
        code={`// .storybook/preview.ts
const preview = {
  parameters: {
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '812px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
      },
    },
  },
};

// 특정 Story에 기본 뷰포트 설정
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
};`}
        highlight={[6, 7, 8, 22, 23]}
      />

      <h2>parameters로 Addon 설정</h2>
      <CodeBlock
        language="tsx"
        code={`const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',     // 'centered' | 'padded' | 'fullscreen'
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    docs: {
      description: {
        component: '전역 모달 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof Modal>;`}
        highlight={[5, 6, 13]}
      />

      <h2>autodocs</h2>
      <p>
        <code>tags: [&apos;autodocs&apos;]</code>를 추가하면 Props 테이블,
        소스코드, 사용 예시가 포함된 문서가 자동 생성됩니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`const meta = {
  title: 'Shared/UI/Accordion',
  component: Accordion.Root,
  tags: ['autodocs'],  // Docs 페이지 자동 생성
  argTypes: {
    variant: {
      control: 'select',
      options: ['box', 'line'],
      description: '아코디언 스타일 변형',
      table: {
        defaultValue: { summary: 'line' },
      },
    },
  },
} satisfies Meta<typeof Accordion.Root>;`}
        highlight={[4]}
      />

      <Callout variant="tip">
        <p>
          모든 공통 컴포넌트(shared/ui)에는 <code>autodocs</code>를 적용하고,
          <code>argTypes</code>에 <code>description</code>을 추가하면
          디자이너/기획자도 이해할 수 있는 문서가 됩니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
