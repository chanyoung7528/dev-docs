import { DocLayout } from "@/components/doc-layout/DocLayout";
import { Callout } from "@/components/callout/Callout";
import { Mermaid } from "@/components/mermaid/Mermaid";

export default function AwsIntroductionPage() {
  return (
    <DocLayout
      title="AWS란 무엇인가?"
      description="컴퓨터·서버를 잘 몰라도 이해할 수 있게, AWS가 무엇이고 왜 쓰는지 아주 쉽게 설명합니다."
    >
      <h2>한 문장으로 말하면</h2>
      <p>
        <strong>AWS(Amazon Web Services)</strong>는{" "}
        <strong>&ldquo;컴퓨터(서버)를 빌려주는 회사&rdquo;</strong>입니다. 정확히는
        아마존이 전 세계에 지어놓은 거대한 데이터센터(컴퓨터 창고)를, 우리가
        필요한 만큼 인터넷으로 빌려 쓰는 서비스예요.
      </p>

      <Callout variant="note">
        <p>
          <strong>서버(Server)가 뭔가요?</strong> 여러분이 어떤 웹사이트에
          접속하면, 그 화면과 데이터를 &ldquo;보내주는&rdquo; 컴퓨터가 어딘가에서
          24시간 켜져 있어야 합니다. 그 항상 켜져 있는 컴퓨터를{" "}
          <strong>서버</strong>라고 불러요. 내 노트북처럼 생겼지만, 끄지 않고
          계속 돌아가는 &ldquo;남에게 서비스를 해주는 컴퓨터&rdquo;라고
          생각하면 됩니다.
        </p>
      </Callout>

      <h2>왜 직접 컴퓨터를 사지 않고 &ldquo;빌릴까&rdquo;?</h2>
      <p>
        옛날에는 회사가 웹사이트를 운영하려면 진짜로 서버 컴퓨터를{" "}
        <strong>돈 주고 사서</strong>, 사무실 한 켠에 두고, 전기·인터넷·냉방까지
        직접 관리해야 했어요. 이걸 &ldquo;온프레미스(On-premise, 자체 보유)&rdquo;라고
        합니다. 문제는 이렇습니다.
      </p>
      <ul>
        <li>
          <strong>비쌈</strong> — 컴퓨터를 미리 크게 사둬야 하는데, 손님이 적으면
          돈만 낭비돼요.
        </li>
        <li>
          <strong>느림</strong> — 갑자기 손님이 몰려도 컴퓨터를 새로 사서 설치하는
          데 며칠~몇 주가 걸려요.
        </li>
        <li>
          <strong>귀찮음</strong> — 고장 나면 직접 고쳐야 하고, 관리 인력도
          필요해요.
        </li>
      </ul>
      <p>
        AWS 같은 <strong>클라우드(Cloud)</strong>를 쓰면, 필요할 때 클릭 몇 번으로
        서버를 빌리고, 손님이 줄면 반납할 수 있습니다. 딱 쓴 만큼만 요금을 냅니다.
        마치 <strong>&ldquo;집을 사는 것&rdquo;</strong> 대신{" "}
        <strong>&ldquo;호텔 방을 필요한 날만 빌리는 것&rdquo;</strong>과 같아요.
      </p>

      <Mermaid
        caption="옛날 방식(직접 소유) vs 클라우드(빌려 쓰기)"
        chart={`flowchart LR
    subgraph OLD["옛날 방식 (온프레미스)"]
      A1["서버 컴퓨터를<br/>직접 구매"] --> A2["사무실에 설치"]
      A2 --> A3["전기·냉방·수리<br/>직접 관리"]
      A3 --> A4["손님 없어도<br/>돈 계속 나감"]
    end
    subgraph NEW["클라우드 (AWS)"]
      B1["클릭 몇 번으로<br/>서버 빌리기"] --> B2["바로 사용 시작"]
      B2 --> B3["관리는 AWS가"]
      B3 --> B4["쓴 만큼만<br/>요금 지불"]
    end`}
      />

      <h2>클라우드 = &ldquo;남의 컴퓨터&rdquo;</h2>
      <p>
        개발자들 사이에 <em>&ldquo;클라우드는 그냥 남의 컴퓨터다&rdquo;</em>라는
        농담이 있어요. 진짜 맞는 말입니다. 우리가 인터넷 어딘가(구름, cloud)에
        있다고 상상하는 그 서버들은, 사실 아마존이 소유한 거대한 건물 안의 진짜
        컴퓨터들이에요. 우리는 그걸 인터넷으로 원격 조종해서 쓰는 것뿐입니다.
      </p>

      <h2>AWS는 서비스가 정말 많다 (200개 이상)</h2>
      <p>
        AWS에는 서버뿐 아니라 저장 공간, 데이터베이스, 네트워크, 보안, 인공지능
        등 <strong>200가지가 넘는 서비스</strong>가 있어요. 처음 보면 이름이
        외계어 같고 겁이 나지만, 걱정 마세요. 실무에서 프론트엔드 개발자가 대화에
        낄 수 있을 정도로 알아야 할 건 <strong>10개 남짓</strong>입니다. 이
        문서들에서 그것만 콕 집어 다룹니다.
      </p>

      <Mermaid
        caption="이 문서에서 다룰 AWS 핵심 서비스 지도 (큰 그림)"
        chart={`mindmap
  root((AWS))
    인프라 기초
      Region 지역
      AZ 가용영역
      VPC 가상 네트워크
      IAM 권한 관리
      Security Group 방화벽
    컴퓨팅
      EC2 서버
      Lambda 서버리스
    저장소
      S3 파일 저장
      EBS 하드디스크
    데이터베이스
      RDS 관리형 DB
    네트워크
      Route 53 DNS
      ALB 로드밸런서
      CloudFront CDN
    운영
      CloudWatch 모니터링
      ECR ECS 컨테이너`}
      />

      <h2>이 문서 시리즈를 읽는 순서</h2>
      <p>다음 순서로 읽으면 자연스럽게 이해됩니다.</p>
      <ol>
        <li>
          <strong>AWS란 무엇인가</strong> (지금 이 페이지) — 큰 그림 잡기
        </li>
        <li>
          <strong>인프라 기초 개념</strong> — Region, VPC, 방화벽 등 &ldquo;땅과
          울타리&rdquo; 개념
        </li>
        <li>
          <strong>핵심 서비스</strong> — EC2, S3, RDS 등 실제로 쓰는 도구들
        </li>
        <li>
          <strong>실전 구성도</strong> — 이것들을 어떻게 조립해 웹 서비스를
          만드는가
        </li>
        <li>
          <strong>용어 &amp; 대화 팁</strong> — 회의에서 &ldquo;아는 척&rdquo; 할
          수 있는 표현들
        </li>
      </ol>

      <Callout variant="tip">
        <p>
          <strong>이 시리즈의 목표:</strong> AWS 전문가가 되는 게 아니라,
          개발/인프라 담당자와 회의할 때{" "}
          <strong>&ldquo;무슨 얘기인지 알아듣고, 아는 척 대화에 낄 수
          있는&rdquo;</strong> 수준입니다. 딱 그만큼만, 대신 확실하게 이해하고
          갑시다!
        </p>
      </Callout>
    </DocLayout>
  );
}
