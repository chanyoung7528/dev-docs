import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function SvgIconsPage() {
  return (
    <DocLayout
      title="SVG 아이콘 시스템"
      description="SVGR로 SVG를 React 컴포넌트로 사용하고 currentColor로 색상을 제어합니다."
    >
      <h2>SVGR 설정</h2>
      <p>
        next.config.ts에서 <code>@svgr/webpack</code>을 설정하여
        SVG 파일을 React 컴포넌트로 import합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`// next.config.ts
turbopack: {
  rules: {
    '**/assets/icons/**/*.svg': {
      loaders: [{
        loader: '@svgr/webpack',
        options: {
          dimensions: false,       // width/height 제거 → CSS로 제어
          typescript: true,
          replaceAttrValues: {
            '#222': 'currentColor',     // 하드코딩 색상 → currentColor
            '#222222': 'currentColor',
          },
        },
      }],
      as: '*.tsx',
    },
  },
}`}
        highlight={[8, 10, 11, 12]}
      />

      <h2>사용법</h2>
      <CodeBlock
        language="tsx"
        code={`// SVG를 React 컴포넌트로 import
import IconArrowDown from '@shared/assets/icons/arrow-down.svg';
import IconCheck from '@shared/assets/icons/check.svg';

// JSX에서 사용
<IconArrowDown className={styles.icon} />
<IconCheck className={styles.checkIcon} />`}
      />

      <h2>CSS로 크기와 색상 제어</h2>
      <p>
        <code>currentColor</code> 덕분에 부모의 <code>color</code> 속성을
        상속받아 아이콘 색상이 자동으로 변합니다.
      </p>

      <CodeBlock
        language="css"
        code={`/* CSS Variable로 아이콘 크기 통일 */
.icon {
  --size: 2rem;
  width: var(--size);
  height: var(--size);
  color: var(--gray-700);    /* → SVG의 currentColor에 적용 */
}

/* 호버 시 색상 변경 */
.button:hover .icon {
  color: var(--primary);     /* 아이콘도 자동으로 변경됨 */
}

/* 크기별 변형 */
.iconSm { --size: 1.4rem; }
.iconMd { --size: 2rem; }
.iconLg { --size: 2.4rem; }

/* Accordion 화살표 회전 */
.arrowIcon {
  --size: 2rem;
  transition: transform 0.3s cubic-bezier(0.87, 0, 0.13, 1);

  [data-panel-open] & {
    transform: rotate(180deg);
  }
}`}
        highlight={[3, 4, 5, 6, 11, 24, 25]}
      />

      <h2>실전 적용: Button 아이콘</h2>
      <CodeBlock
        language="tsx"
        code={`// leftIcon, rightIcon prop으로 아이콘 배치
<Button leftIcon={<IconPlus className={styles.btnIcon} />}>
  추가하기
</Button>

<Button rightIcon={<IconArrowRight className={styles.btnIcon} />}>
  다음
</Button>`}
      />

      <CodeBlock
        language="css"
        code={`.btnIcon {
  --size: 1.6rem;
  width: var(--size);
  height: var(--size);
  /* color는 Button의 color를 상속 */
}`}
      />

      <Callout variant="tip" title="currentColor의 장점">
        <p>
          SVG에서 <code>fill=&quot;currentColor&quot;</code>를 사용하면
          CSS의 <code>color</code> 속성만으로 아이콘 색상을 제어할 수 있습니다.
          다크모드, 호버, 비활성화 등 상태별 색상 변경이 자연스럽게 작동합니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
