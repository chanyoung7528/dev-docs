import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function StorybookIntroPage() {
  return (
    <DocLayout
      title="Storybook 소개"
      description="컴포넌트를 독립적으로 개발하고 문서화하는 도구입니다."
    >
      <h2>Storybook이란?</h2>
      <p>
        Storybook은 UI 컴포넌트를 앱과 분리하여 독립적으로 개발, 테스트, 문서화할
        수 있는 도구입니다. 각 컴포넌트의 다양한 상태를 &quot;Story&quot;로
        정의하고 브라우저에서 바로 확인할 수 있습니다.
      </p>

      <h3>왜 사용하나요?</h3>
      <ul>
        <li>컴포넌트를 페이지 없이 독립적으로 개발할 수 있음</li>
        <li>다양한 Props 조합을 시각적으로 확인</li>
        <li>디자이너/기획자와 공유 가능한 UI 문서 자동 생성</li>
        <li>시각적 회귀 테스트 가능</li>
      </ul>

      <h2>설치</h2>

      <CodeBlock
        language="bash"
        code={`npx storybook@latest init`}
      />

      <p>
        위 명령어를 실행하면 프로젝트에 맞는 설정이 자동으로 추가됩니다.
        실행 후 <code>pnpm storybook</code>으로 시작합니다.
      </p>

      <h2>기본 구조</h2>
      <p>
        Story 파일은 대상 컴포넌트와 같은 폴더에 <code>.stories.tsx</code>{" "}
        확장자로 생성합니다.
      </p>

      <CodeBlock
        language="plaintext"
        code={`src/
├── components/
│   └── button/
│       ├── Button.tsx
│       ├── Button.module.css
│       └── Button.stories.tsx    ← Story 파일`}
      />

      <h2>첫 번째 Story 작성</h2>

      <CodeBlock
        filename="Button.stories.tsx"
        language="tsx"
        code={`import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 스토리
export const Primary: Story = {
  args: {
    children: '버튼',
    variant: 'primary',
  },
};

// 변형 스토리
export const Secondary: Story = {
  args: {
    children: '취소',
    variant: 'secondary',
  },
};

// 비활성화 상태
export const Disabled: Story = {
  args: {
    children: '비활성화',
    disabled: true,
  },
};`}
        highlight={[4, 5, 7, 24]}
      />

      <Callout variant="note">
        <p>
          <code>tags: [&apos;autodocs&apos;]</code>를 추가하면 Props 타입을
          기반으로 문서가 자동 생성됩니다.
        </p>
      </Callout>

      <h2>핵심 개념 정리</h2>
      <table>
        <thead>
          <tr>
            <th>용어</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Meta</code></td>
            <td>Story 그룹의 메타 정보 (제목, 대상 컴포넌트, 기본 설정)</td>
          </tr>
          <tr>
            <td><code>Story</code></td>
            <td>컴포넌트의 특정 상태를 표현하는 하나의 스냅샷</td>
          </tr>
          <tr>
            <td><code>args</code></td>
            <td>Story에 전달할 Props 값</td>
          </tr>
          <tr>
            <td><code>argTypes</code></td>
            <td>Controls 패널에서 Props를 어떤 UI로 조작할지 정의</td>
          </tr>
          <tr>
            <td><code>decorators</code></td>
            <td>Story를 감싸는 래퍼 (Provider, 레이아웃 등)</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="tip">
        <p>
          컴포넌트를 만들 때 Story를 먼저 작성하는 습관을 들이면 자연스럽게
          Props 설계가 깔끔해집니다. 테스트하기 쉬운 컴포넌트 = 좋은 컴포넌트
          입니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
