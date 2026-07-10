import { DocLayout } from "@/components/doc-layout/DocLayout";
import { Callout } from "@/components/callout/Callout";
import { Mermaid } from "@/components/mermaid/Mermaid";

export default function AwsInfrastructurePage() {
  return (
    <DocLayout
      title="인프라 기초 개념"
      description="Region, AZ, VPC, IAM, Security Group — AWS를 쓰기 전에 알아야 할 '땅과 울타리' 개념을 비유로 쉽게 풀어봅니다."
    >
      <p>
        서버(EC2)나 데이터베이스(RDS) 같은 실제 도구를 배우기 전에, 그것들이{" "}
        <strong>어디에, 어떤 울타리 안에, 누구의 허락을 받고</strong> 놓이는지를
        먼저 알아야 합니다. 이 페이지의 5가지 개념이 바로 그 &ldquo;땅과
        울타리&rdquo;예요. 비유로 하나씩 잡아봅시다.
      </p>

      <Mermaid
        caption="개념들의 포함 관계: 지역 > 가용영역 > 가상 네트워크 > 서버"
        chart={`flowchart TD
    R["🌏 Region (서울 지역)"] --> AZ1["🏢 AZ-a (건물 A)"]
    R --> AZ2["🏢 AZ-c (건물 C)"]
    AZ1 --> VPC["🧱 VPC (우리 회사 전용 네트워크)"]
    AZ2 --> VPC
    VPC --> SG["🚪 Security Group (서버 앞 경비원)"]
    SG --> EC2["💻 EC2 (실제 서버)"]
    IAM["🪪 IAM (사원증·출입권한)"] -.누가 만질 수 있나 통제.-> VPC`}
      />

      <h2>1. Region (리전) — 나라 단위의 데이터센터 거점</h2>
      <p>
        <strong>Region은 AWS 데이터센터가 모여 있는 지리적 위치</strong>입니다.
        서울, 도쿄, 미국 버지니아 등 전 세계에 여러 개가 있어요. 우리가 서비스를
        어느 지역에 둘지 고를 수 있습니다.
      </p>
      <ul>
        <li>
          <strong>서울 리전</strong>의 코드 이름은 <code>ap-northeast-2</code>{" "}
          입니다. (ap = Asia Pacific, 아시아 태평양)
        </li>
        <li>
          한국 사용자를 위한 서비스라면 서울 리전을 골라야 <strong>가장
          빠릅니다</strong>. 미국 리전에 두면 데이터가 태평양을 왕복하느라
          느려져요.
        </li>
      </ul>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> Region은 <strong>&ldquo;나라 단위의 물류
          거점&rdquo;</strong>이에요. 서울에서 물건을 시키면 서울 물류센터에서
          오는 게 빠르지, 미국 창고에서 배송 오면 오래 걸리는 것과 같습니다.
        </p>
      </Callout>

      <h2>2. AZ (가용영역) — 같은 지역 안의 서로 다른 건물</h2>
      <p>
        <strong>AZ(Availability Zone, 가용영역)</strong>는 하나의 Region 안에
        있는 <strong>물리적으로 분리된 데이터센터</strong>입니다. 한 Region에는
        보통 2~3개 이상의 AZ가 있어요.
      </p>
      <p>
        왜 나눠 놨을까요? <strong>한 건물에 정전이나 화재가 나도 다른 건물은
        멀쩡하게 하려고요.</strong> 서버를 여러 AZ에 나눠 두면, 한쪽이 죽어도
        서비스가 멈추지 않습니다. 이걸 <strong>고가용성(High
        Availability)</strong>이라고 부릅니다.
      </p>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> AZ는 <strong>&ldquo;같은 도시 안에 있는 서로
          다른 건물의 서버실&rdquo;</strong>입니다. 본사 서버실 하나만 믿었다가
          그 건물에 불나면 끝이지만, 옆 건물에도 복제해 두면 안전하죠.
        </p>
      </Callout>

      <h2>3. VPC — 우리만의 가상 네트워크 공간</h2>
      <p>
        <strong>VPC(Virtual Private Cloud)</strong>는 AWS라는 거대한 공용 공간
        안에 만드는 <strong>&ldquo;우리 회사 전용 네트워크 방&rdquo;</strong>
        입니다. 이 안에서 서버들을 어떻게 배치하고, 어떤 길(라우팅)로 연결하고,
        어떤 문(방화벽)을 열지 우리가 직접 정합니다.
      </p>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> VPC는 <strong>&ldquo;공유 오피스 건물 안에서
          우리 회사만 쓰는 전용 사무실 층&rdquo;</strong>이에요. 같은 건물(AWS)에
          다른 회사들도 있지만, 우리 층 안은 우리끼리만 오가고 외부와 분리돼
          있습니다.
        </p>
      </Callout>
      <p>VPC 안은 다시 두 종류의 구역으로 나뉩니다.</p>

      <Mermaid
        caption="VPC 안의 퍼블릭 서브넷 / 프라이빗 서브넷 구조"
        chart={`flowchart LR
    Internet["🌐 인터넷<br/>(외부 사용자)"] --> Pub
    subgraph VPC["🧱 VPC (우리 전용 네트워크)"]
      subgraph Pub["퍼블릭 서브넷 (외부 노출 O)"]
        LB["로드밸런서 / 웹서버"]
      end
      subgraph Priv["프라이빗 서브넷 (외부 차단)"]
        DB[("데이터베이스<br/>RDS")]
      end
      LB --> DB
    end`}
      />

      <ul>
        <li>
          <strong>퍼블릭 서브넷(Public Subnet)</strong> — 인터넷과 직접 연결되는
          구역. 사용자가 접속해야 하는 웹서버를 여기 둡니다.
        </li>
        <li>
          <strong>프라이빗 서브넷(Private Subnet)</strong> — 인터넷에서 직접 접근
          불가능한 내부 전용 구역. <strong>데이터베이스는 항상 여기</strong>에
          둡니다. 고객 정보가 든 DB가 인터넷에 그대로 노출되면 큰일이니까요.
        </li>
      </ul>

      <h2>4. IAM — 누가 무엇을 할 수 있는지 정하는 권한 시스템</h2>
      <p>
        <strong>IAM(Identity and Access Management)</strong>은 AWS 계정 안에서{" "}
        <strong>&ldquo;누가 어떤 서비스를 만질 수 있는지&rdquo;</strong>를
        정하는 권한 관리 시스템입니다. 예를 들어 &ldquo;A 직원은 서버만 볼 수
        있고, B 직원은 결제 설정까지 바꿀 수 있다&rdquo;처럼요.
      </p>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> IAM은 <strong>&ldquo;회사 사원증 + 출입 권한
          시스템&rdquo;</strong>입니다. 사원증(계정)마다 들어갈 수 있는 방이
          다르게 설정돼 있죠. 신입에게 실수로 서버실 마스터키를 주면 안 되듯,
          권한은 꼭 필요한 만큼만 주는 게 원칙입니다(최소 권한 원칙).
        </p>
      </Callout>

      <h2>5. Security Group — 서버 앞을 지키는 경비원(방화벽)</h2>
      <p>
        <strong>Security Group(보안 그룹)</strong>은 EC2 같은 개별 리소스에
        붙이는 <strong>가상 방화벽</strong>입니다. &ldquo;어떤 포트로, 어떤
        IP에서 들어오는 접속만 허용할지&rdquo;를 정합니다.
      </p>
      <p>
        예를 들어 웹서버라면 <strong>80번(HTTP)</strong>과{" "}
        <strong>443번(HTTPS)</strong> 포트만 열고 나머지는 다 막습니다. 열어둔
        문(허용 목록)만 통과할 수 있고, 나머지는 전부 차단돼요.
      </p>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> Security Group은{" "}
          <strong>&ldquo;서버 앞에 서 있는 경비원&rdquo;</strong>이에요.
          허용 명단(80·443번 손님)에 있는 사람만 통과시키고, 명단에 없으면
          돌려보냅니다.
        </p>
      </Callout>

      <Callout variant="warning">
        <p>
          <strong>포트(Port)가 뭐죠?</strong> 하나의 서버 컴퓨터는 여러 종류의
          통신을 동시에 처리해요. 이때 &ldquo;몇 번 창구로 오세요&rdquo;를
          구분하는 번호가 포트입니다. 웹(HTTP)은 80번, 보안 웹(HTTPS)은 443번,
          많은 개발 서버는 3000번 창구를 씁니다. 방화벽은 &ldquo;어떤 창구를
          열어둘지&rdquo;를 정하는 거예요.
        </p>
      </Callout>

      <h2>다섯 개념 한눈에 정리</h2>
      <table>
        <thead>
          <tr>
            <th>개념</th>
            <th>한마디로</th>
            <th>비유</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Region</strong>
            </td>
            <td>데이터센터가 모인 지리적 지역 (서울 = ap-northeast-2)</td>
            <td>나라 단위 물류 거점</td>
          </tr>
          <tr>
            <td>
              <strong>AZ</strong>
            </td>
            <td>한 Region 안의 물리적으로 분리된 건물. 하나 죽어도 다른 건 정상</td>
            <td>같은 도시의 다른 건물 서버실</td>
          </tr>
          <tr>
            <td>
              <strong>VPC</strong>
            </td>
            <td>내가 직접 설계하는 우리 전용 가상 네트워크</td>
            <td>회사 전용 사무실 층</td>
          </tr>
          <tr>
            <td>
              <strong>IAM</strong>
            </td>
            <td>누가 어떤 AWS 서비스를 쓸 수 있는지 정하는 권한</td>
            <td>사원증 + 출입 권한</td>
          </tr>
          <tr>
            <td>
              <strong>Security Group</strong>
            </td>
            <td>리소스에 붙는 방화벽. 허용한 포트·IP만 통과</td>
            <td>서버 앞 경비원</td>
          </tr>
        </tbody>
      </table>

      <Callout variant="tip">
        <p>
          <strong>핵심 요약:</strong> Region(지역) 안에 여러 AZ(건물)가 있고, 그
          위에 VPC(우리 네트워크)를 만들고, 그 안에 서버를 두되 Security
          Group(경비원)으로 지키고, 전체 접근 권한은 IAM(사원증)으로 관리한다 —
          이게 AWS 인프라의 뼈대입니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
