import { DocLayout } from "@/components/doc-layout/DocLayout";
import { Callout } from "@/components/callout/Callout";
import { Mermaid } from "@/components/mermaid/Mermaid";

export default function AwsArchitecturePage() {
  return (
    <DocLayout
      title="실전 구성도"
      description="앞서 배운 서비스들을 실제로 어떻게 조립해 웹 서비스를 만드는지, 요청이 흘러가는 순서를 그림으로 따라갑니다."
    >
      <p>
        지금까지 배운 부품(EC2, RDS, Route 53 등)이 실제 서비스에서{" "}
        <strong>어떻게 이어지는지</strong>를 볼 차례입니다. 핵심은{" "}
        <strong>&ldquo;사용자의 요청이 어떤 순서로 흘러가는가&rdquo;</strong>를
        따라가는 거예요. 화살표를 하나씩 짚으며 읽어보세요.
      </p>

      <h2>1. 일반적인 웹 서비스 구성도</h2>
      <p>
        사용자가 브라우저에 주소를 치는 순간부터 데이터를 받아오기까지, 요청은
        아래 순서로 여행합니다.
      </p>

      <Mermaid
        caption="사용자 요청이 흘러가는 전체 경로"
        chart={`flowchart LR
    U["👤 사용자<br/>브라우저"] --> R53["🌐 Route 53<br/>(DNS: 주소 → IP)"]
    R53 --> ALB["⚖️ ALB<br/>(로드밸런서)"]
    ALB --> NGINX["💻 EC2 + Nginx<br/>(웹서버)"]
    NGINX --> APP["⚙️ 앱 서버<br/>(포트 3000)"]
    APP --> DB[("🗄️ RDS<br/>데이터베이스")]`}
      />

      <p>단계별로 풀어보면:</p>
      <ol>
        <li>
          <strong>사용자 브라우저</strong> — <code>example.com</code>을 입력.
        </li>
        <li>
          <strong>Route 53 (DNS)</strong> — 그 도메인이 어느 서버(IP)인지 찾아
          알려줌.
        </li>
        <li>
          <strong>ALB (로드밸런서)</strong> — 요청을 받아서 여유 있는 서버로
          넘겨줌. HTTPS 암호화도 여기서 풀어줌.
        </li>
        <li>
          <strong>EC2 + Nginx</strong> — 요청을 받는 첫 관문 웹서버. 정적 파일을
          내주거나, 뒤쪽 앱 서버로 요청을 전달.
        </li>
        <li>
          <strong>앱 서버 (포트 3000)</strong> — 실제 로직을 처리하는 프로그램.
        </li>
        <li>
          <strong>RDS (DB)</strong> — 필요한 데이터를 꺼내 앱 서버에 돌려줌.
        </li>
      </ol>

      <Callout variant="note">
        <p>
          <strong>Nginx(엔진엑스)가 뭐죠?</strong> 아주 유명한{" "}
          <strong>웹서버 프로그램</strong>이에요. 사용자의 요청을 가장 앞에서
          받아, 정적 파일을 빠르게 내주거나 뒤쪽 앱 서버로 넘겨주는{" "}
          <strong>&ldquo;접수 데스크 + 안내원&rdquo;</strong> 역할을 합니다. 이렇게
          요청을 받아 뒤로 전달하는 방식을 <strong>리버스 프록시(Reverse
          Proxy)</strong>라고 불러요.
        </p>
      </Callout>

      <h2>2. 실전 예시: Metabase 구성</h2>
      <p>
        데이터 시각화 도구인 <strong>Metabase</strong>를 AWS에 올리는 실제
        구성을 봅시다. 위 일반 구조를 조금 단순화한 형태예요.
      </p>

      <Mermaid
        caption="Metabase 실전 구성: EC2 한 대 위에 Nginx + Metabase"
        chart={`flowchart LR
    U["👤 사용자"] -->|"HTTPS :443"| EC2
    subgraph EC2["💻 EC2 서버 한 대"]
      NGINX["Nginx<br/>리버스 프록시<br/>(:443 수신)"] -->|"내부 전달<br/>:3000"| MB["Metabase<br/>(:3000 실행)"]
    end
    MB --> DB[("🗄️ RDS<br/>PostgreSQL")]`}
      />

      <p>흐름을 말로 풀면 이렇습니다.</p>
      <ol>
        <li>
          사용자가 <strong>HTTPS(443번 포트)</strong>로 접속.
        </li>
        <li>
          EC2 위의 <strong>Nginx</strong>가 443번으로 그 요청을 받음.
        </li>
        <li>
          Nginx가 같은 서버 안에서 돌고 있는{" "}
          <strong>Metabase(3000번 포트)</strong>로 요청을 넘겨줌 (리버스 프록시).
        </li>
        <li>
          Metabase가 <strong>RDS(PostgreSQL)</strong>에서 데이터를 읽어 화면을
          만들어 돌려줌.
        </li>
      </ol>

      <Callout variant="note" title="Nginx와 연결되는 지점">
        <p>
          Metabase + Nginx 구성이라면 보통 EC2 위에 Nginx를 리버스 프록시로
          올려서 <strong>80/443 포트 → 3000 포트</strong>로 전달하는 방식을
          씁니다. 이때 <strong>Security Group에서 80·443 인바운드를
          열어줘야</strong> 외부에서 접근이 됩니다. (3000번은 외부에 직접 열지
          않고, Nginx를 거치게 하는 게 안전해요.)
        </p>
      </Callout>

      <h2>3. 왜 이렇게 여러 단계로 나눌까?</h2>
      <p>
        &ldquo;그냥 서버 하나가 다 처리하면 안 되나?&rdquo; 싶을 수 있어요. 굳이
        Route 53 → ALB → Nginx → 앱 → DB로 나누는 이유는:
      </p>
      <ul>
        <li>
          <strong>확장성</strong> — 손님이 몰리면 ALB 뒤에 서버를 여러 대로 늘려
          부하를 나눌 수 있음.
        </li>
        <li>
          <strong>보안</strong> — DB는 맨 안쪽 프라이빗 구역에 숨겨서 외부에서
          직접 못 건드리게 함.
        </li>
        <li>
          <strong>안정성</strong> — 각 단계가 자기 역할만 하니, 한 부분에 문제가
          생겨도 원인을 찾기 쉬움.
        </li>
        <li>
          <strong>HTTPS 처리 분리</strong> — 암호화/복호화 같은 무거운 작업을
          ALB나 Nginx가 전담하면 앱 서버는 로직에만 집중할 수 있음.
        </li>
      </ul>

      <Callout variant="tip">
        <p>
          <strong>핵심 요약:</strong> 웹 서비스 요청은{" "}
          <strong>도메인 찾기(Route 53) → 교통정리(ALB) → 접수(Nginx) →
          처리(앱) → 데이터(RDS)</strong> 순으로 흐릅니다. 각 단계를 나누는 이유는
          확장성·보안·안정성 때문이에요. 이 흐름만 머릿속에 그릴 수 있으면 인프라
          회의의 절반은 이해한 겁니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
