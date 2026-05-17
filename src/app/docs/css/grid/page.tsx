import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function CssGridPage() {
  return (
    <DocLayout
      title="Grid"
      description="2차원 레이아웃을 구성하는 CSS의 강력한 도구입니다."
    >
      <h2>Flexbox vs Grid</h2>
      <table>
        <thead>
          <tr>
            <th>특성</th>
            <th>Flexbox</th>
            <th>Grid</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>차원</td>
            <td>1차원 (행 또는 열)</td>
            <td>2차원 (행 + 열)</td>
          </tr>
          <tr>
            <td>적합한 곳</td>
            <td>네비게이션, 카드 내부</td>
            <td>페이지 레이아웃, 카드 그리드</td>
          </tr>
          <tr>
            <td>아이템 크기</td>
            <td>콘텐츠 기반</td>
            <td>트랙(행/열) 기반</td>
          </tr>
        </tbody>
      </table>

      <h2>기본 사용법</h2>
      <CodeBlock
        language="css"
        code={`/* 3열 그리드 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 고정 + 유동 조합 */
.layout {
  display: grid;
  grid-template-columns: 300px 1fr;  /* 사이드바 300px + 메인 유동 */
  gap: 0;
}`}
        highlight={[4, 11]}
      />

      <h2>반응형 그리드: auto-fit + minmax</h2>
      <p>
        미디어 쿼리 없이 자동으로 열 수가 조절되는 반응형 그리드입니다.
      </p>

      <CodeBlock
        language="css"
        code={`/* 카드가 최소 280px, 남는 공간은 균등 분배 */
.cardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* 화면 960px: 3열
   화면 640px: 2열
   화면 320px: 1열 → 자동 조절! */`}
        highlight={[4]}
      />

      <Callout variant="note" title="auto-fit vs auto-fill">
        <p>
          <code>auto-fit</code>: 아이템이 적으면 남는 공간을 채움 (아이템 확장).
          <code>auto-fill</code>: 아이템이 적어도 빈 열 유지 (아이템 고정 크기).
          대부분의 경우 <code>auto-fit</code>이 원하는 동작입니다.
        </p>
      </Callout>

      <h2>실전 적용: 아코디언 data-variant 패턴</h2>
      <p>
        프로젝트에서 Accordion 루트 컴포넌트에 flex column을 사용하고,
        variant에 따라 gap을 조절합니다.
      </p>

      <CodeBlock
        filename="Accordion.module.scss"
        language="css"
        code={`.root {
  display: flex;
  flex-direction: column;
  width: 100%;

  &[data-variant='box'] {
    gap: 0.8rem;     /* 박스형: 넓은 간격 */
  }

  &[data-variant='line'] {
    gap: 0.2rem;     /* 라인형: 좁은 간격 */
  }
}`}
        highlight={[6, 7, 10, 11]}
      />

      <h2>유용한 Grid 속성</h2>
      <table>
        <thead>
          <tr>
            <th>속성</th>
            <th>설명</th>
            <th>예시</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>grid-template-columns</code></td>
            <td>열 정의</td>
            <td><code>repeat(3, 1fr)</code></td>
          </tr>
          <tr>
            <td><code>grid-column</code></td>
            <td>아이템이 차지할 열</td>
            <td><code>span 2</code></td>
          </tr>
          <tr>
            <td><code>place-items</code></td>
            <td>셀 내부 정렬</td>
            <td><code>center</code></td>
          </tr>
          <tr>
            <td><code>gap</code></td>
            <td>셀 간격</td>
            <td><code>20px</code></td>
          </tr>
        </tbody>
      </table>

      <Callout variant="tip">
        <p>
          1차원 배치(한 줄 네비, 카드 내부 구조)에는 Flexbox,
          2차원 그리드(카드 목록, 대시보드)에는 Grid를 사용하세요.
          실무에서는 둘을 혼합하여 사용합니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
