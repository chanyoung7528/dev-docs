import { DocLayout } from "@/components/doc-layout/DocLayout";
import { Callout } from "@/components/callout/Callout";
import { Mermaid } from "@/components/mermaid/Mermaid";

export default function AwsCoreServicesPage() {
  return (
    <DocLayout
      title="자주 쓰는 핵심 서비스"
      description="EC2, S3, RDS, Route 53, ALB, Lambda, ECR/ECS, CloudWatch — 실무 대화에 자주 등장하는 AWS 서비스 8가지를 초보자 눈높이로 설명합니다."
    >
      <p>
        앞에서 &ldquo;땅과 울타리&rdquo;를 배웠으니, 이제 그 안에 놓이는{" "}
        <strong>실제 도구들</strong>을 볼 차례입니다. 여기 나오는 8개만 알아도
        실무 회의에서 오가는 대화 대부분을 알아들을 수 있어요. 각 서비스가{" "}
        <strong>&ldquo;어떤 역할을 하는 부품인지&rdquo;</strong>에 집중하세요.
      </p>

      <Mermaid
        caption="서비스를 역할별로 묶은 지도"
        chart={`flowchart TB
    subgraph Compute["🖥️ 컴퓨팅 (연산·실행)"]
      EC2["EC2<br/>가상 서버"]
      Lambda["Lambda<br/>서버리스 함수"]
    end
    subgraph Storage["📦 저장소"]
      S3["S3<br/>파일 저장소"]
    end
    subgraph DB["🗄️ 데이터베이스"]
      RDS["RDS<br/>관리형 DB"]
    end
    subgraph Network["🌐 네트워크"]
      R53["Route 53<br/>DNS"]
      ALB["ALB / NLB<br/>로드밸런서"]
    end
    subgraph Ops["🛠️ 배포·운영"]
      ECR["ECR / ECS<br/>컨테이너"]
      CW["CloudWatch<br/>모니터링"]
    end`}
      />

      <h2>💻 EC2 — 가상 서버 (가장 기본)</h2>
      <p>
        <strong>EC2(Elastic Compute Cloud)</strong>는 AWS에서 빌리는{" "}
        <strong>가상 컴퓨터(서버) 한 대</strong>입니다. 우리가 &ldquo;서버
        띄운다&rdquo;고 할 때 가장 먼저 떠올리는 게 보통 EC2예요. 여기에 웹서버,
        프로그램, 데이터 분석 도구 등을 설치해서 돌립니다.
      </p>
      <ul>
        <li>
          <strong>인스턴스 타입</strong>으로 사양을 고릅니다. <code>t3.micro</code>{" "}
          (아주 작고 쌈) ~ <code>m5.xlarge</code> (크고 강력함)처럼요. 손님이
          적으면 작은 걸, 많으면 큰 걸 고릅니다.
        </li>
        <li>
          실무 예: <strong>Metabase(데이터 시각화 도구)나 Nginx(웹서버)를 올리는
          바로 그 서버</strong>가 EC2입니다.
        </li>
      </ul>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> EC2 = <strong>빈 컴퓨터 한 대를 빌린 것</strong>.
          운영체제(리눅스 등)만 깔린 텅 빈 컴퓨터를 받아서, 내가 원하는 프로그램을
          직접 설치해 쓰는 겁니다.
        </p>
      </Callout>

      <h2>📦 S3 — 무제한 파일 저장소</h2>
      <p>
        <strong>S3(Simple Storage Service)</strong>는 파일을 무제한으로 넣어둘 수
        있는 <strong>초대형 온라인 창고</strong>입니다. 이미지, 동영상, 백업
        파일, 그리고 정적 웹사이트(HTML/CSS/JS) 파일까지 다 넣을 수 있어요.
      </p>
      <ul>
        <li>
          파일은 <strong>버킷(Bucket)</strong>이라는 단위(폴더 같은 통)로
          관리합니다.
        </li>
        <li>
          각 파일은 고유한 URL을 가져서, 주소만 알면 브라우저로 바로 접근할 수
          있어요.
        </li>
        <li>
          프론트엔드에서 만든 정적 사이트를 S3에 올려 <strong>웹사이트
          호스팅</strong>도 가능합니다. (비용이 거의 안 듦)
        </li>
      </ul>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> S3 = <strong>&ldquo;무한히 넓은 셀프 창고&rdquo;</strong>.
          물건(파일)에 이름표(주소)를 붙여 넣어두면, 나중에 그 주소로 언제든 꺼낼
          수 있습니다.
        </p>
      </Callout>

      <h2>🗄️ RDS — 관리형 데이터베이스</h2>
      <p>
        <strong>RDS(Relational Database Service)</strong>는 AWS가 대신 관리해주는{" "}
        <strong>데이터베이스</strong>입니다. MySQL, PostgreSQL, Aurora 같은
        데이터베이스를 직접 설치·백업·업데이트하는 귀찮은 일을 AWS가 알아서
        해줍니다.
      </p>
      <Callout variant="note">
        <p>
          <strong>데이터베이스(DB)가 뭐죠?</strong> 회원 정보, 주문 내역 같은
          데이터를 <strong>표(엑셀 시트) 형태로 차곡차곡 저장하고 빠르게 찾아주는
          전문 프로그램</strong>이에요. S3가 &ldquo;파일 창고&rdquo;라면, DB는
          &ldquo;검색이 잘 되는 똑똑한 장부&rdquo;입니다.
        </p>
      </Callout>
      <p>
        실무 예: Metabase가 &ldquo;어떤 대시보드가 있는지&rdquo; 같은 자기 설정
        정보를 저장하는 <strong>메타데이터 DB</strong>로 RDS(PostgreSQL)를 많이
        씁니다.
      </p>

      <h2>🌐 Route 53 — 도메인 주소를 서버로 연결 (DNS)</h2>
      <p>
        <strong>Route 53</strong>은 AWS의 <strong>DNS 서비스</strong>입니다. DNS는{" "}
        <strong>&ldquo;사람이 읽는 도메인 이름 ↔ 컴퓨터가 쓰는 IP 주소&rdquo;를
        연결해주는 전화번호부</strong>예요.
      </p>
      <p>
        예를 들어 브라우저에 <code>pine.hanwhaam.com</code>을 치면, 그게 실제로는{" "}
        <code>13.125.xxx.xxx</code> 같은 숫자 IP 주소를 가진 서버라는 걸 알려주는
        역할입니다. 도메인을 새 서버에 연결할 때 여기서{" "}
        <strong>A레코드</strong>(도메인 → IP 매핑)를 설정합니다.
      </p>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> Route 53 = <strong>전화번호부</strong>.
          &ldquo;홍길동&rdquo;(도메인)이라는 이름으로 전화번호(IP)를 찾아주는
          것처럼, 도메인 이름으로 서버 위치를 찾아줍니다.
        </p>
      </Callout>

      <h2>⚖️ ALB / NLB — 트래픽을 나눠주는 로드밸런서</h2>
      <p>
        <strong>로드밸런서(Load Balancer)</strong>는 몰려드는 접속(트래픽)을{" "}
        <strong>여러 대의 서버에 골고루 나눠주는 교통정리원</strong>입니다. 서버
        한 대로 감당이 안 될 때, 여러 대를 두고 앞에 로드밸런서를 세워 부하를
        분산합니다.
      </p>
      <ul>
        <li>
          <strong>ALB(Application Load Balancer)</strong> — 웹(HTTP/HTTPS)
          트래픽용. 가장 흔히 씀. <strong>HTTPS 인증서(ACM) 처리도 여기서</strong>{" "}
          할 수 있어요.
        </li>
        <li>
          <strong>NLB(Network Load Balancer)</strong> — 더 낮은 수준(TCP)의
          트래픽용. 초고속·초대량 처리가 필요할 때.
        </li>
      </ul>

      <Mermaid
        caption="로드밸런서가 트래픽을 여러 서버로 분산하는 모습"
        chart={`flowchart LR
    U1["사용자 1"] --> ALB
    U2["사용자 2"] --> ALB
    U3["사용자 3"] --> ALB
    ALB["⚖️ ALB<br/>로드밸런서"] --> S1["💻 서버 A"]
    ALB --> S2["💻 서버 B"]
    ALB --> S3["💻 서버 C"]`}
      />

      <h2>⚡ Lambda — 서버 없이 코드만 실행 (서버리스)</h2>
      <p>
        <strong>Lambda</strong>는 <strong>&ldquo;서버를 띄워놓지 않고, 요청이 올
        때만 코드를 실행&rdquo;</strong>하는 서비스입니다. EC2처럼 컴퓨터를 계속
        켜둘 필요 없이, 필요한 순간에만 잠깐 돌아가고 딱 그만큼만 요금을 냅니다.
        이런 방식을 <strong>서버리스(Serverless)</strong>라고 불러요.
      </p>
      <Callout variant="note">
        <p>
          <strong>&ldquo;서버리스&rdquo;에 서버가 없나요?</strong> 서버는 있지만{" "}
          <strong>내가 관리하지 않는다</strong>는 뜻이에요. AWS가 알아서 켜고
          끄고, 나는 실행할 코드만 올려두면 됩니다. 특정 이벤트(파일 업로드,
          정해진 시간 등)가 생기면 자동으로 실행되는 자동화에 많이 씁니다.
        </p>
      </Callout>

      <h2>🐳 ECR / ECS — 컨테이너(도커) 배포</h2>
      <p>
        요즘은 프로그램을 <strong>컨테이너(Container)</strong>라는 상자에 담아
        배포합니다. 컨테이너는 &ldquo;프로그램 + 실행에 필요한 모든 환경&rdquo;을
        하나로 포장한 것이라, 어느 컴퓨터에서든 똑같이 돌아갑니다. 가장 유명한
        컨테이너 도구가 <strong>도커(Docker)</strong>예요.
      </p>
      <ul>
        <li>
          <strong>ECR(Elastic Container Registry)</strong> — 도커 이미지(포장된
          상자)를 <strong>보관하는 창고</strong>.
        </li>
        <li>
          <strong>ECS(Elastic Container Service)</strong> — 그 컨테이너들을{" "}
          <strong>실제로 실행하고 관리(오케스트레이션)</strong>하는 지휘자.
        </li>
      </ul>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> ECR은 <strong>컨테이너 부두의 화물 창고</strong>,
          ECS는 <strong>그 컨테이너를 배에 싣고 내리는 크레인 관리자</strong>라고
          생각하면 됩니다. 도커 기반 배포 파이프라인의 핵심 짝꿍이에요.
        </p>
      </Callout>

      <h2>📊 CloudWatch — 모니터링과 알람</h2>
      <p>
        <strong>CloudWatch</strong>는 AWS 리소스들의 상태를{" "}
        <strong>감시(모니터링)하고, 로그를 모으고, 문제가 생기면 알람을
        보내주는</strong> 서비스입니다. &ldquo;CPU 사용률이 90%를 넘으면 담당자에게
        알림&rdquo; 같은 설정을 여기서 합니다.
      </p>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> CloudWatch = <strong>건물 관제실의 CCTV +
          경보 시스템</strong>. 모든 서버의 건강 상태를 한눈에 보고, 이상하면
          경보를 울립니다.
        </p>
      </Callout>

      <h2>8개 서비스 한눈에 정리</h2>
      <table>
        <thead>
          <tr>
            <th>서비스</th>
            <th>분류</th>
            <th>한마디로</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>EC2</strong>
            </td>
            <td>컴퓨팅</td>
            <td>빌려 쓰는 가상 서버 한 대</td>
          </tr>
          <tr>
            <td>
              <strong>S3</strong>
            </td>
            <td>저장소</td>
            <td>무제한 파일 창고 (버킷 단위)</td>
          </tr>
          <tr>
            <td>
              <strong>RDS</strong>
            </td>
            <td>DB</td>
            <td>AWS가 관리해주는 데이터베이스</td>
          </tr>
          <tr>
            <td>
              <strong>Route 53</strong>
            </td>
            <td>네트워크</td>
            <td>도메인 ↔ IP 연결 (전화번호부)</td>
          </tr>
          <tr>
            <td>
              <strong>ALB / NLB</strong>
            </td>
            <td>네트워크</td>
            <td>트래픽을 여러 서버로 분산 (교통정리)</td>
          </tr>
          <tr>
            <td>
              <strong>Lambda</strong>
            </td>
            <td>컴퓨팅</td>
            <td>서버 없이 요청 올 때만 코드 실행</td>
          </tr>
          <tr>
            <td>
              <strong>ECR / ECS</strong>
            </td>
            <td>배포</td>
            <td>도커 이미지 저장(ECR)·실행(ECS)</td>
          </tr>
          <tr>
            <td>
              <strong>CloudWatch</strong>
            </td>
            <td>운영</td>
            <td>모니터링·로그·알람</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="tip">
        <p>
          <strong>핵심 요약:</strong> 서버가 필요하면 <strong>EC2</strong>, 파일
          저장은 <strong>S3</strong>, 데이터는 <strong>RDS</strong>, 도메인
          연결은 <strong>Route 53</strong>, 트래픽 분산은 <strong>ALB</strong>,
          가벼운 자동화는 <strong>Lambda</strong>, 도커 배포는{" "}
          <strong>ECR/ECS</strong>, 감시는 <strong>CloudWatch</strong>. 이
          8개면 웬만한 대화는 다 따라갑니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
