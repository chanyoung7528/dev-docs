import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function PositionZIndexPage() {
  return (
    <DocLayout
      title="Position & z-index"
      description="요소의 배치 방식과 쌓임 순서를 제어하는 CSS 속성입니다."
    >
      <h2>position 속성</h2>
      <p>
        <code>position</code> 속성은 문서 흐름에서 요소가 어떻게 배치되는지를
        결정합니다.
      </p>

      <table>
        <thead>
          <tr>
            <th>값</th>
            <th>설명</th>
            <th>기준점</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>static</code></td>
            <td>기본값. 문서 흐름을 따름</td>
            <td>-</td>
          </tr>
          <tr>
            <td><code>relative</code></td>
            <td>자기 자신 기준으로 이동</td>
            <td>원래 위치</td>
          </tr>
          <tr>
            <td><code>absolute</code></td>
            <td>가장 가까운 positioned 조상 기준</td>
            <td>positioned 부모</td>
          </tr>
          <tr>
            <td><code>fixed</code></td>
            <td>뷰포트 기준 고정</td>
            <td>뷰포트</td>
          </tr>
          <tr>
            <td><code>sticky</code></td>
            <td>스크롤 위치에 따라 relative/fixed 전환</td>
            <td>스크롤 컨테이너</td>
          </tr>
        </tbody>
      </table>

      <h3>relative + absolute 조합</h3>
      <p>
        가장 많이 사용하는 패턴입니다. 부모에 <code>relative</code>, 자식에{" "}
        <code>absolute</code>를 적용하면 부모 기준으로 자유롭게 배치할 수
        있습니다.
      </p>

      <CodeBlock
        filename="Badge.module.css"
        language="css"
        code={`.container {
  position: relative;
  display: inline-block;
}

/* 부모(container) 기준 우측 상단에 뱃지 배치 */
.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #d1242f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
}`}
        highlight={[2, 8, 9, 10]}
      />

      <CodeBlock
        filename="Badge.tsx"
        language="tsx"
        code={`function Badge({ count, children }: BadgeProps) {
  return (
    <div className={styles.container}>
      {children}
      {count > 0 && (
        <span className={styles.badge}>{count}</span>
      )}
    </div>
  );
}`}
      />

      <h3>fixed - 고정 요소</h3>
      <p>스크롤해도 항상 같은 위치에 고정됩니다. 헤더, FAB 등에 사용합니다.</p>

      <CodeBlock
        language="css"
        code={`/* 상단 고정 헤더 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  z-index: 100;
}

/* fixed 헤더만큼 컨텐츠 밀어내기 */
.content {
  margin-top: 64px;
}`}
        highlight={[3, 9]}
      />

      <h3>sticky - 스크롤 고정</h3>
      <p>
        스크롤 시 지정된 위치에 도달하면 고정됩니다. 섹션 헤더, 테이블
        헤더 등에 유용합니다.
      </p>

      <CodeBlock
        language="css"
        code={`/* 스크롤 시 상단에 붙는 섹션 헤더 */
.sectionHeader {
  position: sticky;
  top: 64px;  /* 고정 헤더 높이만큼 offset */
  background: white;
  z-index: 10;
  padding: 12px 0;
  border-bottom: 1px solid #e4e6eb;
}`}
        highlight={[3, 4]}
      />

      <Callout variant="warning">
        <p>
          <code>sticky</code>는 부모 요소에 <code>overflow: hidden</code>이
          적용되어 있으면 작동하지 않습니다. 또한{" "}
          <code>top</code>/<code>bottom</code> 등 고정 위치를 반드시 지정해야
          합니다.
        </p>
      </Callout>

      <hr />

      <h2>z-index</h2>
      <p>
        <code>z-index</code>는 요소의 쌓임 순서(stacking order)를 제어합니다.
        값이 높을수록 위에 표시됩니다. <strong>positioned 요소</strong>
        (static이 아닌)에서만 동작합니다.
      </p>

      <h3>쌓임 맥락 (Stacking Context)</h3>
      <p>
        <code>z-index</code>를 이해하려면 <strong>쌓임 맥락</strong> 개념이
        핵심입니다. 쌓임 맥락이 새로 생성되면 그 안에서의 z-index는 외부와
        독립적으로 동작합니다.
      </p>

      <Callout variant="note" title="쌓임 맥락이 생성되는 경우">
        <p>
          position이 absolute/relative이고 z-index가 auto가 아닌 경우,
          position이 fixed/sticky인 경우, opacity가 1 미만인 경우,
          transform/filter/backdrop-filter가 none이 아닌 경우
        </p>
      </Callout>

      <CodeBlock
        language="css"
        code={`/* z-index 문제 상황 */
.parentA {
  position: relative;
  z-index: 1;    /* 새로운 쌓임 맥락 생성 */
}

.childOfA {
  position: relative;
  z-index: 9999; /* 아무리 높여도 parentA 안에 갇힘! */
}

.parentB {
  position: relative;
  z-index: 2;    /* parentA(z:1)보다 위에 표시됨 */
}

/* childOfA(z:9999)는 parentB(z:2) 아래에 표시됨!
   → parentA의 쌓임 맥락(z:1) 안에 있기 때문 */`}
        highlight={[4, 9, 14]}
      />

      <h3>z-index 관리 전략</h3>
      <p>
        프로젝트 전체에서 z-index를 CSS Variables로 관리하면 충돌을 방지할 수
        있습니다.
      </p>

      <CodeBlock
        filename="variables.css"
        language="css"
        code={`:root {
  /* z-index 계층 정의 */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-toast: 700;
}`}
      />

      <CodeBlock
        language="css"
        code={`/* 사용 예시 */
.dropdown {
  position: absolute;
  z-index: var(--z-dropdown);
}

.modal {
  position: fixed;
  z-index: var(--z-modal);
}

.toast {
  position: fixed;
  z-index: var(--z-toast);
}`}
      />

      <Callout variant="tip">
        <p>
          z-index 값을 100, 200, 300... 단위로 정의하면 나중에 사이에 새 레이어를
          추가하기 쉽습니다. 1, 2, 3으로 빽빽하게 지정하면 확장이 어렵습니다.
        </p>
      </Callout>

      <h2>실전 패턴: 모달 오버레이</h2>

      <CodeBlock
        filename="Modal.module.css"
        language="css"
        code={`.backdrop {
  position: fixed;
  inset: 0;                          /* top/right/bottom/left: 0 */
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  position: relative;                /* backdrop 내부 흐름 */
  z-index: var(--z-modal);
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 480px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}`}
        highlight={[2, 3, 5, 13]}
      />
    </DocLayout>
  );
}
