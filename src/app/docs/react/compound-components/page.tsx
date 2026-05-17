import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ReactCompoundComponentsPage() {
  return (
    <DocLayout
      title="Compound 컴포넌트"
      description="관련된 컴포넌트들을 하나의 네임스페이스로 묶어 유연한 API를 제공하는 패턴입니다."
    >
      <h2>Compound 컴포넌트란?</h2>
      <p>
        HTML의 <code>{'<select>'}</code>와 <code>{'<option>'}</code>처럼
        여러 컴포넌트가 함께 동작하는 패턴입니다. 각 부분을 조합하여
        유연한 레이아웃을 만들 수 있습니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// Compound 컴포넌트 사용 예시
<Accordion.Root>
  <Accordion.Item value="faq-1">
    <Accordion.Header>
      <Accordion.Trigger>자주 묻는 질문</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      답변 내용이 여기에 표시됩니다.
    </Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>`}
      />

      <h2>실전 적용: Accordion 컴포넌트</h2>
      <p>
        프로젝트의 Accordion은 base-ui를 래핑한 Compound 컴포넌트입니다.
        각 서브 컴포넌트가 독립적으로 정의되고 하나의 객체로 묶입니다.
      </p>

      <CodeBlock
        filename="Accordion.tsx"
        language="tsx"
        code={`function AccordionRoot({ ref, className, variant = 'line', ...props }: AccordionRootProps) {
  return (
    <BaseAccordion.Root
      ref={ref}
      className={mergeCN(styles.root, className)}
      data-variant={variant}
      {...props}
    />
  );
}

function AccordionItem({ ref, className, ...props }: AccordionItemProps) {
  return (
    <BaseAccordion.Item ref={ref} className={mergeCN(styles.item, className)} {...props} />
  );
}

function AccordionTrigger({ ref, className, children, ...props }: AccordionTriggerProps) {
  return (
    <BaseAccordion.Trigger ref={ref} className={mergeCN(styles.trigger, className)} {...props}>
      {children}
      <IconLineArrowDown className={cn(styles.icon, 'icon')} />
    </BaseAccordion.Trigger>
  );
}

function AccordionPanel({ ref, className, ...props }: AccordionPanelProps) {
  return (
    <BaseAccordion.Panel ref={ref} className={mergeCN(styles.panel, className)} {...props} />
  );
}

// 하나의 객체로 내보내기
export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
};`}
        highlight={[6, 22, 34, 35, 36, 37, 38, 39]}
      />

      <Callout variant="note">
        <p>
          <code>data-variant</code> 속성으로 스타일 변형을 관리합니다.
          <code>box</code>와 <code>line</code> 두 가지 변형을 CSS에서 구분합니다.
        </p>
      </Callout>

      <h3>스타일링</h3>
      <CodeBlock
        filename="Accordion.module.scss"
        language="css"
        code={`.root {
  display: flex;
  flex-direction: column;
  width: 100%;

  &[data-variant='box'] { gap: 0.8rem; }
  &[data-variant='line'] { gap: 0.2rem; }
}

.icon {
  transition: transform 0.3s cubic-bezier(0.87, 0, 0.13, 1);
  flex-shrink: 0;

  [data-panel-open] & {
    transform: rotate(180deg);
  }
}

.panel {
  height: var(--accordion-panel-height);
  transition: height 0.3s cubic-bezier(0.87, 0, 0.13, 1);

  &[data-starting-style],
  &[data-ending-style] {
    height: 0;
    opacity: 0;
  }
}`}
        highlight={[6, 7, 15, 16, 23, 24]}
      />

      <h2>Compound vs 단일 컴포넌트</h2>
      <table>
        <thead>
          <tr>
            <th>접근법</th>
            <th>장점</th>
            <th>단점</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>단일 컴포넌트</td>
            <td>사용이 간단</td>
            <td>커스터마이징 제한적</td>
          </tr>
          <tr>
            <td>Compound</td>
            <td>유연한 구조, 레이아웃 자유</td>
            <td>코드량 증가</td>
          </tr>
        </tbody>
      </table>

      <CodeBlock
        language="tsx"
        code={`// 단일 컴포넌트: 간단하지만 유연성 부족
<Accordion
  items={[
    { title: '제목', content: '내용' },
  ]}
/>

// Compound: 각 부분을 자유롭게 배치
<Accordion.Root>
  <Accordion.Item value="1">
    <Accordion.Header>
      <Accordion.Trigger>
        <CustomIcon /> 커스텀 제목
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      <ComplexContent />
    </Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>`}
      />

      <Callout variant="tip">
        <p>
          내부 구조가 고정된 컴포넌트는 단일 컴포넌트로, 사용처마다
          레이아웃이 달라야 하는 컴포넌트는 Compound 패턴으로 만드세요.
        </p>
      </Callout>
    </DocLayout>
  );
}
