import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function CssResponsivePage() {
  return (
    <DocLayout
      title="반응형 디자인"
      description="다양한 화면 크기에 대응하는 반응형 레이아웃 구현 방법입니다."
    >
      <h2>모바일 퍼스트</h2>
      <p>
        프로젝트는 <strong>모바일 퍼스트</strong> 접근 방식을 사용합니다.
        기본 스타일을 모바일용으로 작성하고, <code>min-width</code> 미디어
        쿼리로 큰 화면을 대응합니다.
      </p>

      <CodeBlock
        language="css"
        code={`/* 기본: 모바일 스타일 */
.container {
  padding: 16px;
  font-size: 14px;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    font-size: 16px;
  }
}

/* 데스크탑 이상 */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}`}
        highlight={[8, 16]}
      />

      <h2>상대 단위</h2>
      <table>
        <thead>
          <tr>
            <th>단위</th>
            <th>기준</th>
            <th>사용 예</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>rem</code></td>
            <td>루트 font-size</td>
            <td>간격, 폰트 크기, 컴포넌트 크기</td>
          </tr>
          <tr>
            <td><code>em</code></td>
            <td>부모 font-size</td>
            <td>컴포넌트 내부 비례 크기</td>
          </tr>
          <tr>
            <td><code>%</code></td>
            <td>부모 요소</td>
            <td>너비, 높이</td>
          </tr>
          <tr>
            <td><code>vw/vh</code></td>
            <td>뷰포트</td>
            <td>전체 화면 레이아웃</td>
          </tr>
          <tr>
            <td><code>dvh</code></td>
            <td>동적 뷰포트</td>
            <td>모바일 주소바 대응</td>
          </tr>
        </tbody>
      </table>

      <h3>프로젝트에서의 rem 사용</h3>
      <CodeBlock
        filename="Input.module.scss"
        language="css"
        code={`/* rem 기반 크기 정의 → 루트 font-size 변경으로 전체 스케일 조절 */
.input {
  height: 7.4rem;
  padding: 2rem 4.8rem 0.2rem 2rem;
  font-size: 1.6rem;
  font-weight: 600;
  border-radius: var(--radius-md);
}

.label {
  top: 1.2rem;
  left: 2rem;
  font-size: 1.2rem;
}`}
      />

      <h2>반응형 그리드 (CSS Grid)</h2>
      <p>미디어 쿼리 없이 자동으로 열 수가 조절됩니다.</p>

      <CodeBlock
        language="css"
        code={`/* auto-fit + minmax로 자동 반응형 */
.cardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}`}
      />

      <h2>모바일 안전 영역</h2>
      <p>
        아이폰 노치, 홈바 등 안전 영역을 처리합니다.
      </p>

      <CodeBlock
        language="css"
        code={`/* 안전 영역 패딩 */
.bottomBar {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 안전 영역 + 기본 패딩 */
.footer {
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}`}
        highlight={[3, 8]}
      />

      <h2>뷰포트 높이 (모바일)</h2>
      <p>
        모바일에서 <code>100vh</code>는 주소바를 포함한 높이이므로
        실제 보이는 영역보다 큽니다. <code>dvh</code>를 사용합니다.
      </p>

      <CodeBlock
        language="css"
        code={`/* 모바일 전체 화면 */
.fullScreen {
  height: 100dvh;  /* dynamic viewport height */
}

/* dvh 미지원 브라우저 대비 */
.fullScreen {
  height: 100vh;           /* 폴백 */
  height: 100dvh;          /* 지원 시 덮어쓰기 */
}`}
        highlight={[3, 9]}
      />

      <Callout variant="tip">
        <p>
          모바일 퍼스트에서는 데스크탑 스타일을 &quot;추가&quot;하는 것이므로
          미디어 쿼리 안의 코드가 짧아집니다. 반대로 데스크탑 퍼스트는
          모바일을 위해 속성을 &quot;제거&quot;해야 해서 코드가 길어집니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
