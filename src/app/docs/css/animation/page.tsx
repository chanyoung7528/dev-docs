import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function CssAnimationPage() {
  return (
    <DocLayout
      title="애니메이션"
      description="CSS transition과 animation으로 자연스러운 UI 인터랙션을 구현합니다."
    >
      <h2>Transition vs Animation</h2>
      <table>
        <thead>
          <tr>
            <th>특성</th>
            <th>Transition</th>
            <th>Animation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>트리거</td>
            <td>상태 변화 (hover, class 변경)</td>
            <td>자동 실행 가능</td>
          </tr>
          <tr>
            <td>중간 단계</td>
            <td>시작 → 끝 (2단계)</td>
            <td>keyframes (다단계)</td>
          </tr>
          <tr>
            <td>반복</td>
            <td>불가</td>
            <td>가능 (infinite)</td>
          </tr>
          <tr>
            <td>사용 예</td>
            <td>hover 효과, 토글</td>
            <td>로딩 스피너, 진입 효과</td>
          </tr>
        </tbody>
      </table>

      <h2>Transition 기본</h2>
      <CodeBlock
        language="css"
        code={`/* 상태 변화에 부드러운 전환 적용 */
.button {
  background-color: var(--primary);
  transition: background-color 0.2s ease;
}

.button:hover {
  background-color: var(--primary-dark);
}

/* 여러 속성 전환 */
.card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}`}
        highlight={[4, 13, 14, 15]}
      />

      <h2>실전 적용: Button 로딩 스피너</h2>
      <p>
        프로젝트의 Button 컴포넌트에서 로딩 상태일 때 CSS만으로
        스피너를 표시합니다.
      </p>

      <CodeBlock
        filename="Button.module.scss"
        language="css"
        code={`.root {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &[data-loading] {
    pointer-events: none;

    /* 버튼 텍스트 숨기기 */
    & > * {
      opacity: 0;
    }

    /* 의사 요소로 스피너 생성 */
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: var(--spinner-size);
      height: var(--spinner-size);
      translate: -50% -50%;
      border: 2px solid;
      border-color: currentColor transparent currentColor transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}`}
        highlight={[12, 21, 22, 30, 31, 32, 37, 38, 39]}
      />

      <Callout variant="note">
        <p>
          스피너를 <code>::after</code> 의사 요소로 구현하면 추가 DOM 요소가
          불필요합니다. <code>currentColor</code>를 사용하면 버튼 색상에 자동으로
          맞춰집니다.
        </p>
      </Callout>

      <h2>실전 적용: Accordion 패널 애니메이션</h2>
      <CodeBlock
        filename="Accordion.module.scss"
        language="css"
        code={`/* 아이콘 회전 */
.icon {
  transition: transform 0.3s cubic-bezier(0.87, 0, 0.13, 1);
  flex-shrink: 0;

  [data-panel-open] & {
    transform: rotate(180deg);
  }
}

/* 패널 열기/닫기 */
.panel {
  height: var(--accordion-panel-height);
  transition:
    height 0.3s cubic-bezier(0.87, 0, 0.13, 1),
    opacity 0.3s cubic-bezier(0.87, 0, 0.13, 1);

  /* 닫히는 상태 */
  &[data-starting-style],
  &[data-ending-style] {
    height: 0;
    opacity: 0;
  }
}`}
        highlight={[3, 6, 7, 14, 15, 16, 19, 20, 21, 22]}
      />

      <h2>Easing 함수</h2>
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>값</th>
            <th>느낌</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ease</td>
            <td><code>ease</code></td>
            <td>기본, 자연스러운 감속</td>
          </tr>
          <tr>
            <td>Material</td>
            <td><code>cubic-bezier(0.4, 0, 0.2, 1)</code></td>
            <td>부드러운 가속 + 감속</td>
          </tr>
          <tr>
            <td>Overshoot</td>
            <td><code>cubic-bezier(0.87, 0, 0.13, 1)</code></td>
            <td>살짝 튕기는 효과</td>
          </tr>
          <tr>
            <td>linear</td>
            <td><code>linear</code></td>
            <td>일정 속도 (스피너 전용)</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="tip">
        <p>
          애니메이션 시간은 200~300ms가 적당합니다. 너무 길면 느리게 느껴지고,
          너무 짧으면 인지하지 못합니다. <code>transform</code>과{" "}
          <code>opacity</code>만 애니메이션하면 GPU 가속이 적용되어
          60fps를 유지할 수 있습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
