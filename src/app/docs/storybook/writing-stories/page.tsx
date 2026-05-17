import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function StorybookWritingStoriesPage() {
  return (
    <DocLayout
      title="Story 작성법"
      description="컴포넌트의 다양한 상태를 Story로 정의하는 방법을 알아봅니다."
    >
      <h2>Story 파일 구조</h2>
      <p>
        Story 파일은 대상 컴포넌트와 같은 폴더에 위치합니다.
        <code>meta</code>(기본 설정)와 여러 <code>Story</code>(상태)로 구성됩니다.
      </p>

      <CodeBlock
        language="plaintext"
        code={`src/shared/ui/button/
├── Button.tsx             # 컴포넌트
├── Button.module.scss     # 스타일
└── Button.stories.tsx     # Story 파일`}
      />

      <h2>기본 Story</h2>
      <CodeBlock
        filename="Button.stories.tsx"
        language="tsx"
        code={`import type { Meta, StoryObj } from '@storybook/nextjs';
import { Button } from './Button';

// meta: Story 그룹의 기본 설정
const meta = {
  title: 'Shared/UI/Form/Button',  // 사이드바 경로
  component: Button,                // 대상 컴포넌트
  tags: ['autodocs'],               // 자동 문서 생성
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 각 export가 하나의 Story
export const Primary: Story = {
  args: {
    children: '확인',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: '취소',
    variant: 'secondary',
  },
};

export const Disabled: Story = {
  args: {
    children: '비활성화',
    disabled: true,
  },
};`}
        highlight={[5, 6, 7, 8, 15, 16, 17, 18]}
      />

      <h2>render 함수로 복잡한 Story</h2>
      <p>단순 args로 표현할 수 없는 경우 render 함수를 사용합니다.</p>

      <CodeBlock
        language="tsx"
        code={`// 모든 상태를 한 번에 보여주는 Story
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}>
      <Input label="기본" placeholder="기본 상태" />
      <Input label="에러" error defaultValue="invalid@" />
      <Input label="성공" success defaultValue="user@example.com" />
      <Input label="비활성화" disabled defaultValue="홍길동" />
    </div>
  ),
};`}
        highlight={[3]}
      />

      <h2>실전 적용: Compound 컴포넌트 Story</h2>
      <p>
        프로젝트의 Accordion처럼 Compound 컴포넌트는 헬퍼 함수로
        반복 렌더링을 관리합니다.
      </p>

      <CodeBlock
        filename="Accordion.stories.tsx"
        language="tsx"
        code={`const SAMPLE_ITEMS = [
  { value: '1', title: '개인정보처리방침 개정안내', content: '안녕하세요.' },
  { value: '2', title: '서비스 이용약관 변경', content: '변경 내용입니다.' },
  { value: '3', title: '이벤트 안내', content: '이벤트 내용입니다.' },
];

// 헬퍼 함수로 반복 코드 제거
function renderItems(items = SAMPLE_ITEMS) {
  return items.map(item => (
    <Accordion.Item key={item.value} value={item.value}>
      <Accordion.Header>
        <Accordion.Trigger>{item.title}</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel>{item.content}</Accordion.Panel>
    </Accordion.Item>
  ));
}

export const BoxType: Story = {
  args: { variant: 'box' },
  render: args => <Accordion.Root {...args}>{renderItems()}</Accordion.Root>,
};

export const LineType: Story = {
  args: { variant: 'line' },
  render: args => <Accordion.Root {...args}>{renderItems()}</Accordion.Root>,
};

export const Multiple: Story = {
  args: { variant: 'box', multiple: true },
  render: args => <Accordion.Root {...args}>{renderItems()}</Accordion.Root>,
};`}
        highlight={[8, 21]}
      />

      <h2>decorators: Story 감싸기</h2>
      <p>
        Story를 Provider, 레이아웃 등으로 감쌀 수 있습니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`const meta = {
  title: 'Shared/UI/Form/Input',
  component: Input,
  decorators: [
    // 고정 너비 래퍼
    (Story: React.ComponentType) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;`}
        highlight={[4, 6, 7, 8, 9]}
      />

      <Callout variant="tip">
        <p>
          Story 이름은 컴포넌트의 <strong>상태</strong>를 표현하세요.
          <code>Primary</code>, <code>WithIcon</code>, <code>Loading</code>,{" "}
          <code>Disabled</code> 등이 좋은 예시입니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
