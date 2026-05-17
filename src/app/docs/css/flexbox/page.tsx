import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function CssFlexboxPage() {
  return (
    <DocLayout
      title="Flexbox"
      description="1차원 레이아웃을 구성하는 CSS의 핵심 도구입니다."
    >
      <h2>Flexbox 기본</h2>
      <p>
        Flexbox는 한 방향(가로 또는 세로)으로 요소를 배치하는 레이아웃 모델입니다.
        컨테이너에 <code>display: flex</code>를 적용하면 자식 요소들이
        flex item이 됩니다.
      </p>

      <CodeBlock
        language="css"
        code={`/* 기본 축: 가로 방향 */
.container {
  display: flex;
  gap: 16px;              /* 아이템 간격 */
}

/* 세로 방향 */
.column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}`}
      />

      <h2>주요 속성</h2>

      <h3>컨테이너 속성</h3>
      <table>
        <thead>
          <tr>
            <th>속성</th>
            <th>설명</th>
            <th>자주 쓰는 값</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>justify-content</code></td>
            <td>주축 정렬</td>
            <td><code>center</code>, <code>space-between</code></td>
          </tr>
          <tr>
            <td><code>align-items</code></td>
            <td>교차축 정렬</td>
            <td><code>center</code>, <code>stretch</code></td>
          </tr>
          <tr>
            <td><code>flex-wrap</code></td>
            <td>줄바꿈 여부</td>
            <td><code>nowrap</code>, <code>wrap</code></td>
          </tr>
          <tr>
            <td><code>gap</code></td>
            <td>아이템 간격</td>
            <td><code>8px</code>, <code>1rem</code></td>
          </tr>
        </tbody>
      </table>

      <h3>아이템 속성</h3>
      <table>
        <thead>
          <tr>
            <th>속성</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>flex: 1</code></td>
            <td>남은 공간을 차지 (flex-grow: 1)</td>
          </tr>
          <tr>
            <td><code>flex-shrink: 0</code></td>
            <td>공간이 부족해도 줄어들지 않음</td>
          </tr>
          <tr>
            <td><code>align-self</code></td>
            <td>개별 아이템의 교차축 정렬</td>
          </tr>
        </tbody>
      </table>

      <h2>실전 적용: 약관 항목 레이아웃</h2>

      <CodeBlock
        filename="AgreementItem.module.scss"
        language="css"
        code={`.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.8rem;
}

.title {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--gray-900);
}

.badge {
  flex-shrink: 0;    /* 뱃지가 줄어들지 않도록 */
}

.detailButton {
  flex-shrink: 0;    /* 버튼도 줄어들지 않도록 */
}

/* 결과:
   [체크] [제목 텍스트...........] [필수] [상세 >]
   체크/뱃지/버튼은 고정 크기, 제목만 유동적으로 변함 */`}
        highlight={[2, 3, 4, 16, 20]}
      />

      <Callout variant="tip" title="flex-shrink: 0">
        <p>
          아이콘, 뱃지, 버튼 등 크기가 고정되어야 하는 요소에는{" "}
          <code>flex-shrink: 0</code>을 적용하세요.
          화면이 좁아져도 찌그러지지 않습니다.
        </p>
      </Callout>

      <h2>자주 쓰는 패턴</h2>

      <h3>중앙 정렬</h3>
      <CodeBlock
        language="css"
        code={`.center {
  display: flex;
  align-items: center;
  justify-content: center;
}`}
      />

      <h3>양쪽 정렬 (헤더 패턴)</h3>
      <CodeBlock
        language="css"
        code={`.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* [로고]        [검색]  [프로필] */`}
      />

      <h3>세로 쌓기 (카드 패턴)</h3>
      <CodeBlock
        language="css"
        code={`.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 제목
   설명
   버튼 */`}
      />
    </DocLayout>
  );
}
