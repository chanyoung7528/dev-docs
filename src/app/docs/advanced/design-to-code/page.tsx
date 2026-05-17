import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function DesignToCodePage() {
  return (
    <DocLayout
      title="디자인 → 코드 변환 루틴"
      description="AI 없이 Figma 시안을 보고 체계적으로 코드로 옮기는 실전 워크플로우입니다."
    >
      <h2>핵심 마인드셋</h2>
      <p>
        AI가 해주던 건 &ldquo;타이핑 속도&rdquo;였지, &ldquo;설계 능력&rdquo;이
        아닙니다. 디자인을 보고 구조를 파악하는 능력은 5년간 쌓아온 것이고,
        그건 사라지지 않습니다. 체계적인 루틴만 있으면 됩니다.
      </p>

      <h2>Step 1: 시안 분해 (5분)</h2>
      <p>
        코드를 치기 전에 시안을 <strong>레이어 단위</strong>로 분해합니다.
        이 단계가 가장 중요합니다.
      </p>

      <CodeBlock
        language="text"
        code={`시안을 보면서 메모:

1. 레이아웃 골격 파악
   ┌─ Header (sticky? fixed?)
   ├─ Content (scroll 영역)
   │   ├─ Section A (카드 리스트)
   │   ├─ Section B (차트)
   │   └─ Section C (탭 + 리스트)
   └─ Bottom CTA (fixed? safe-area?)

2. 반복 패턴 찾기
   - "이 카드가 3개 반복되네" → map
   - "이 버튼이 여러 곳에 같은 모양" → 공통 컴포넌트
   - "이 레이아웃이 다른 페이지에도" → 레이아웃 컴포넌트

3. 상태 파악
   - 로딩 상태가 있는가?
   - 비어있을 때 (Empty State)?
   - 에러 상태?
   - 토글/탭 전환?`}
      />

      <h2>Step 2: 컴포넌트 트리 스케치 (3분)</h2>

      <CodeBlock
        language="text"
        code={`// 시안 보면서 컴포넌트 이름 + props 초안
// 종이에 적어도 되고, 주석으로 적어도 됨

<FundDetailPage>
  <Header title="펀드 상세" onBack />
  <ScrollArea>
    <FundSummaryCard
      name="한화 글로벌 성장 펀드"
      returnRate={12.5}
      nav={1234}
      judgeCode="GOOD"
    />
    <PeriodTabs value={period} onChange={setPeriod} />
    <ReturnChart data={chartData} period={period} />
    <FundInfoSection>
      <InfoRow label="운용사" value="한화자산운용" />
      <InfoRow label="설정일" value="2024.01.15" />
      <InfoRow label="총보수" value="0.35%" />
    </FundInfoSection>
  </ScrollArea>
  <BottomCTA>
    <Button fullWidth>가입하기</Button>
  </BottomCTA>
</FundDetailPage>`}
      />

      <Callout variant="note">
        <p>
          이 스케치를 먼저 하면 &ldquo;뭐부터 만들지&rdquo; 고민이 사라집니다.
          위에서 아래로, 바깥에서 안으로 순서대로 만들면 됩니다.
        </p>
      </Callout>

      <h2>Step 3: 레이아웃부터 (큰 박스 먼저)</h2>
      <p>
        텍스트, 색상, 간격은 나중에. <strong>회색 박스로 골격</strong>부터
        잡습니다.
      </p>

      <CodeBlock
        filename="FundDetailPage.module.scss"
        language="scss"
        code={`/* 1단계: 레이아웃 골격만 잡기 */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.header {
  position: sticky;
  top: 0;
  height: calc(4.8rem + var(--sat));
  padding-top: var(--sat);
  z-index: var(--z-header);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.6rem;
}

.bottomCta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.6rem;
  padding-bottom: calc(1.6rem + var(--sab));
  background: white;
}`}
        highlight={[2, 3, 4, 17, 18, 22, 23]}
      />

      <CodeBlock
        filename="FundDetailPage.tsx"
        language="tsx"
        code={`// 1단계: 골격만 (내용은 placeholder)
export function FundDetailPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>헤더</header>
      <main className={styles.content}>
        <div style={{ height: 200, background: '#eee' }}>요약 카드</div>
        <div style={{ height: 40, background: '#ddd' }}>기간 탭</div>
        <div style={{ height: 300, background: '#eee' }}>차트</div>
        <div style={{ height: 200, background: '#ddd' }}>정보 섹션</div>
      </main>
      <div className={styles.bottomCta}>
        <button style={{ width: '100%', height: 48 }}>가입하기</button>
      </div>
    </div>
  );
}

// 이 상태에서 모바일 시뮬레이터로 레이아웃 확인
// → 스크롤, 고정 영역, Safe Area가 맞는지 먼저 검증`}
        highlight={[7, 8, 9, 10]}
      />

      <h2>Step 4: 컴포넌트 하나씩 채우기</h2>
      <p>
        placeholder를 실제 컴포넌트로 <strong>하나씩</strong> 교체합니다.
        한 번에 다 만들지 않습니다.
      </p>

      <CodeBlock
        filename="FundSummaryCard.tsx"
        language="tsx"
        code={`// Figma에서 확인할 것:
// 1. 패딩/마진 (보통 8의 배수: 8, 16, 24, 32)
// 2. 폰트 크기/무게 (보통 3~4 단계)
// 3. 색상 (디자인 토큰 매핑)
// 4. 모서리 둥글기

interface FundSummaryCardProps {
  name: string;
  returnRate: number;
  nav: number;
  judgeCode: JudgeCode;
}

export function FundSummaryCard({ name, returnRate, nav, judgeCode }: FundSummaryCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.badge} data-judge={judgeCode}>
        {JUDGE_LABELS[judgeCode]}
      </span>
      <h2 className={styles.name}>{name}</h2>
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>수익률</span>
          <span className={styles.metricValue} data-positive={returnRate > 0}>
            {returnRate > 0 ? '+' : ''}{returnRate.toFixed(2)}%
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>기준가</span>
          <span className={styles.metricValue}>
            {nav.toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  );
}`}
        highlight={[17, 18, 24, 25]}
      />

      <CodeBlock
        filename="FundSummaryCard.module.scss"
        language="scss"
        code={`.card {
  padding: 2rem;
  border-radius: var(--radius-lg);
  background: var(--gray-050);
}

.badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-xs);
  font-size: 1.2rem;
  font-weight: 600;

  &[data-judge='GOOD']    { background: #e8f5e9; color: #2e7d32; }
  &[data-judge='WARNING'] { background: #fff3e0; color: #e65100; }
  &[data-judge='BAD']     { background: #ffebee; color: #c62828; }
}

.name {
  margin-top: 0.8rem;
  font-size: 1.8rem;
  font-weight: 700;
}

.metrics {
  display: flex;
  gap: 2.4rem;
  margin-top: 1.6rem;
}

.metricLabel {
  font-size: 1.2rem;
  color: var(--gray-500);
}

.metricValue {
  display: block;
  margin-top: 0.4rem;
  font-size: 2rem;
  font-weight: 700;

  &[data-positive='true'] { color: #c62828; }
  &[data-positive='false'] { color: #1565c0; }
}`}
        highlight={[14, 15, 16, 26, 27, 41, 42]}
      />

      <h2>Step 5: 반응 확인 사이클</h2>

      <CodeBlock
        language="text"
        code={`코드 → 저장 → 브라우저 확인 → 미세 조정

이 사이클을 빠르게 돌리는 팁:
1. 크롬 DevTools > 모바일 시뮬레이터 항상 켜두기 (360x800)
2. 시안과 구현을 좌우로 놓고 비교
3. 간격이 안 맞으면 DevTools에서 직접 수정 후 코드에 반영
4. 색상은 스포이드 도구로 확인 (Figma에서 Hex 복사)

Figma에서 꼭 확인할 값들:
- 패딩/마진: 요소 선택 → 오른쪽 패널 "Auto layout" 값
- 폰트: 요소 선택 → "Text" 섹션 (size, weight, line-height)
- 색상: 요소 선택 → "Fill" 섹션 (Hex 복사)
- 모서리: 요소 선택 → "Border radius" 값
- 간격: 두 요소 사이 Alt+hover로 거리 측정`}
      />

      <h2>자주 쓰는 레이아웃 레시피</h2>

      <CodeBlock
        filename="layout-recipes.scss"
        language="scss"
        code={`/* 1. 헤더 + 스크롤 콘텐츠 + 하단 고정 */
.pageLayout {
  display: flex;
  flex-direction: column;
  height: 100dvh;
}
.scrollContent { flex: 1; overflow-y: auto; }
.fixedBottom { flex-shrink: 0; }

/* 2. 좌우 배치 (라벨: 값) */
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 3. 아이콘 + 텍스트 */
.iconText {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* 4. 카드 리스트 */
.cardList {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* 5. 그리드 (2열, 3열) */
.grid2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; }

/* 6. 가로 스크롤 칩/태그 */
.chipScroll {
  display: flex;
  gap: 0.8rem;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  > * { flex-shrink: 0; }
}

/* 7. 중앙 정렬 (빈 상태, 로딩) */
.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 30rem;
  gap: 1.6rem;
}

/* 8. 오버레이 (모달/바텀시트 배경) */
.overlay {
  position: fixed;
  inset: 0;
  background: var(--dim-bk-60);
  z-index: var(--z-overlay);
}

/* 9. 말줄임 (1줄) */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 10. 말줄임 (N줄) */
.lineClamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}`}
      />

      <h2>Figma 값 → CSS 변환 치트시트</h2>

      <CodeBlock
        language="text"
        code={`Figma 값          →  CSS
────────────────────────────────────────
Auto layout       →  display: flex + gap
방향: Vertical     →  flex-direction: column
방향: Horizontal   →  flex-direction: row (기본)
간격: 12           →  gap: 1.2rem
패딩: 16 24        →  padding: 1.6rem 2.4rem
Fill container     →  flex: 1 (또는 width: 100%)
Hug contents       →  width: auto (기본)
Fixed 200          →  width: 20rem

정렬 (Alignment):
Top Left           →  align-items: flex-start
Center             →  align-items: center; justify-content: center
Space between      →  justify-content: space-between

텍스트:
Size 14            →  font-size: 1.4rem
Weight Semi Bold   →  font-weight: 600
Line Height 150%   →  line-height: 1.5
Letter Spacing -2% →  letter-spacing: -0.02em

색상:
Fill #1A1A1A       →  color: var(--gray-900)  (토큰 매핑)
Opacity 60%        →  opacity: 0.6

효과:
Drop Shadow        →  box-shadow: 값 그대로 복사
Background Blur    →  backdrop-filter: blur(16px)
Border Radius 12   →  border-radius: 1.2rem`}
      />

      <h2>속도를 올리는 습관</h2>

      <CodeBlock
        language="text"
        code={`1. 스니펫 등록 (VS Code)
   - "rfc" → React 함수 컴포넌트 + 스타일 import
   - "css" → module.scss 기본 구조
   - "flex" → display: flex 패턴

2. Emmet 활용 (HTML 빠른 입력)
   div.card>h2.title+p.desc  →  Tab키
   결과:
   <div className="card">
     <h2 className="title"></h2>
     <p className="desc"></p>
   </div>

3. CSS 순서 규칙 (일관성 = 속도)
   1) 레이아웃 (display, flex, grid, position)
   2) 크기 (width, height, padding, margin)
   3) 타이포 (font-size, font-weight, color)
   4) 시각 (background, border, border-radius)
   5) 기타 (transition, animation, z-index)

4. 자주 쓰는 값 외우기
   8px = 0.8rem    12px = 1.2rem
   16px = 1.6rem   24px = 2.4rem
   32px = 3.2rem   48px = 4.8rem

5. DevTools 실시간 편집
   - 값 조정 → 결과 확인 → 코드에 반영
   - 위/아래 화살표로 1px씩 조정
   - Shift+화살표로 10px씩 조정`}
      />

      <Callout variant="tip">
        <p>
          <strong>AI 없이 개발하는 건 &ldquo;계산기 없이 수학&rdquo;이 아닙니다.</strong>{" "}
          &ldquo;네비 없이 운전&rdquo;에 가깝습니다. 길은 알고 있어요.
          조금 천천히 갈 뿐입니다. 위 루틴대로 하면 시안 하나를
          1~2시간이면 충분히 구현할 수 있습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
