import { DocLayout } from "@/components/doc-layout/DocLayout";
import { Callout } from "@/components/callout/Callout";
import { Mermaid } from "@/components/mermaid/Mermaid";

export default function AwsTermsAndTipsPage() {
  return (
    <DocLayout
      title="용어 & 대화 팁"
      description="회의에서 자주 튀어나오는 AWS 용어들과, '아는 척' 할 수 있는 실전 표현·비용 상식을 정리합니다."
    >
      <p>
        마지막으로, 실무 대화에서 자주 등장하지만 앞에서 안 다룬{" "}
        <strong>추가 용어들</strong>과, 회의에서 자연스럽게 낄 수 있는{" "}
        <strong>대화 팁</strong>을 모았습니다. 뜻만 알아도 &ldquo;아, 그거요&rdquo;
        하고 대화에 참여할 수 있어요.
      </p>

      <h2>자주 나오는 용어 8가지</h2>

      <h3>온디맨드 vs 예약 인스턴스 (요금제)</h3>
      <p>
        서버(EC2) 요금을 내는 방식입니다.{" "}
        <strong>온디맨드(On-Demand)</strong>는 &ldquo;쓴 만큼만 그때그때
        청구&rdquo;로 자유롭지만 비쌉니다. <strong>예약 인스턴스(Reserved
        Instance)</strong>는 &ldquo;1~3년 쓸게요&rdquo;라고 미리 약정하면 최대{" "}
        <strong>70%까지 할인</strong>해줍니다.
      </p>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> 온디맨드는 <strong>정기권 없이 그때그때 내는
          지하철 요금</strong>, 예약 인스턴스는 <strong>1년 정기권을 미리 끊어
          할인받는 것</strong>. 오래 쓸 게 확실하면 정기권이 이득이죠.
        </p>
      </Callout>

      <h3>퍼블릭 / 프라이빗 서브넷</h3>
      <p>
        VPC(우리 네트워크)를 두 구역으로 나눈 것입니다.{" "}
        <strong>퍼블릭 서브넷</strong>은 인터넷과 직접 연결되는 구역(웹서버),{" "}
        <strong>프라이빗 서브넷</strong>은 내부망만 연결되는 구역이에요.{" "}
        <strong>DB는 항상 프라이빗</strong>에 둡니다. (인프라 기초 페이지에서
        그림으로 봤던 그 개념입니다.)
      </p>

      <h3>AMI (서버 이미지)</h3>
      <p>
        <strong>AMI(Amazon Machine Image)</strong>는 EC2 서버의{" "}
        <strong>스냅샷(사진)</strong>입니다. 지금 서버 상태를 그대로 사진 찍어
        두면, 똑같은 서버를 몇 개든 복제하거나 백업본으로 되살릴 수 있어요.
      </p>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> AMI = <strong>게임 세이브 파일</strong>. 세팅
          다 해둔 상태를 저장해 두고, 언제든 그 지점부터 똑같이 시작할 수
          있습니다.
        </p>
      </Callout>

      <h3>EBS (가상 하드디스크)</h3>
      <p>
        <strong>EBS(Elastic Block Store)</strong>는 EC2 서버에 붙이는{" "}
        <strong>가상 하드디스크(저장 장치)</strong>입니다. 용량이 부족하면 콘솔에서
        클릭으로 늘릴 수 있어요. EC2가 &ldquo;컴퓨터 본체&rdquo;라면 EBS는 그
        안의 &ldquo;SSD/하드디스크&rdquo;입니다.
      </p>

      <h3>NAT Gateway (내부 서버의 외부 통로)</h3>
      <p>
        프라이빗 서브넷(외부와 차단된 구역)의 서버도 가끔은 인터넷에 나가야 할
        때가 있어요. 예: 보안 업데이트 다운로드(<code>yum</code>,{" "}
        <code>apt</code>). 이때{" "}
        <strong>&ldquo;나가는 것만 허용하고, 밖에서 들어오는 건 막는
        일방통행 통로&rdquo;</strong>가 NAT Gateway입니다.
      </p>

      <Mermaid
        caption="NAT Gateway: 프라이빗 서버가 밖으로 '나가는 것만' 허용"
        chart={`flowchart LR
    subgraph Priv["프라이빗 서브넷"]
      S["💻 내부 서버"]
    end
    S -->|"업데이트 받으러<br/>나감 (허용)"| NAT["🚪 NAT Gateway"]
    NAT --> Net["🌐 인터넷"]
    Net -. "밖에서 직접<br/>들어오기 (차단)" .-x S`}
      />

      <h3>ACM (무료 SSL 인증서)</h3>
      <p>
        <strong>ACM(AWS Certificate Manager)</strong>은{" "}
        <strong>SSL/TLS 인증서를 무료로 발급하고 자동 갱신</strong>해주는
        서비스입니다. 이 인증서가 있어야 <code>https://</code>(자물쇠 표시)로
        안전하게 접속할 수 있어요. 보통 ALB나 CloudFront에 연결해서 씁니다.
      </p>
      <Callout variant="note">
        <p>
          <strong>HTTPS의 자물쇠가 그거예요.</strong> 브라우저 주소창의 자물쇠
          아이콘은 &ldquo;이 사이트와의 통신이 암호화되어 있다&rdquo;는 표시고, 그
          암호화를 가능하게 하는 게 바로 SSL 인증서입니다. ACM 덕분에 이걸 공짜로
          쓸 수 있어요.
        </p>
      </Callout>

      <h3>Auto Scaling (자동 서버 증감)</h3>
      <p>
        <strong>Auto Scaling</strong>은 트래픽이 몰리면 EC2 서버를{" "}
        <strong>자동으로 늘리고</strong>, 한산해지면{" "}
        <strong>자동으로 줄이는</strong> 기능입니다. 사람이 밤새 지켜보며 서버를
        켜고 끌 필요가 없어요.
      </p>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> 식당에서 손님이 몰리면 알바를 더 부르고, 한가하면
          집에 보내는 것처럼 서버 수를 자동 조절합니다.
        </p>
      </Callout>

      <h3>Bastion Host (점프 서버)</h3>
      <p>
        <strong>Bastion Host(배스천 호스트)</strong>는 외부와 차단된 프라이빗
        서브넷의 서버에 접속하기 위한{" "}
        <strong>중간 다리 역할의 서버</strong>입니다. 관리자는 일단 배스천에
        접속한 뒤, 거기서 내부 서버로 한 번 더 들어갑니다.
      </p>
      <Callout variant="note">
        <p>
          <strong>비유:</strong> 보안이 삼엄한 건물의 <strong>&ldquo;안내
          데스크&rdquo;</strong>예요. 아무나 내부 사무실로 직행할 수 없고, 반드시
          안내 데스크(배스천)를 거쳐야 들어갈 수 있게 한 겁니다. 공격 경로를 하나로
          좁혀 안전하게 관리하죠.
        </p>
      </Callout>

      <h2>💬 회의에서 &ldquo;아는 척&rdquo; 하는 표현</h2>
      <p>
        아래 문장들은 실제로 인프라 담당자들이 자주 쓰는 표현이에요. 뜻과 함께
        외워두면 대화에 자연스럽게 낄 수 있습니다.
      </p>

      <Callout variant="tip" title="구조·안정성 관련">
        <p>
          &bull; <strong>&ldquo;ALB에서 HTTPS 끊고 EC2로는 HTTP로 내리는 게 더
          깔끔하지 않나요?&rdquo;</strong>
          <br />
          &nbsp;&nbsp;→ 암호화를 로드밸런서가 대신 처리하는{" "}
          <strong>SSL Termination</strong> 개념. 뒤쪽 서버 부담을 덜어줌.
        </p>
        <p>
          &bull; <strong>&ldquo;멀티 AZ로 RDS 구성하면 failover가 자동이라서요&rdquo;</strong>
          <br />
          &nbsp;&nbsp;→ DB를 여러 건물(AZ)에 두면 한쪽이 죽어도 자동으로 다른
          쪽이 이어받음(<strong>고가용성</strong>). failover = 장애 시 예비로
          전환.
        </p>
        <p>
          &bull;{" "}
          <strong>
            &ldquo;Security Group에서 RDS는 EC2 SG ID만 허용하면 IP 노출 없이
            안전하죠&rdquo;
          </strong>
          <br />
          &nbsp;&nbsp;→ DB 접근을 특정 IP가 아니라 &ldquo;그 웹서버
          그룹&rdquo;에게만 허용해 더 안전하게 만드는 방식.
        </p>
      </Callout>

      <Callout variant="tip" title="비용 관련">
        <p>
          &bull; <strong>&ldquo;NAT Gateway가 생각보다 비용이 나와서요, 트래픽
          많으면 의외로 큰 항목이에요&rdquo;</strong>
          <br />
          &nbsp;&nbsp;→ NAT Gateway는 데이터 처리량만큼 과금돼서, 은근히 요금이
          쌓이는 대표 항목.
        </p>
        <p>
          &bull; <strong>&ldquo;데이터 전송 비용(Egress)은 AWS 밖으로 나갈 때
          과금이라 S3에 CDN 붙이면 좀 낫죠&rdquo;</strong>
          <br />
          &nbsp;&nbsp;→ AWS <strong>밖으로 나가는</strong> 데이터(Egress)에 돈이
          붙음. CDN(CloudFront)으로 캐싱하면 나가는 양을 줄일 수 있음.
        </p>
        <p>
          &bull; <strong>&ldquo;Cost Explorer에서 서비스별 breakdown 보면 어디서
          돈 나가는지 바로 보여요&rdquo;</strong>
          <br />
          &nbsp;&nbsp;→ <strong>Cost Explorer</strong>는 AWS 요금을 서비스별로
          쪼개 보여주는 도구. &ldquo;어디서 돈이 새는지&rdquo; 확인할 때 씀.
        </p>
      </Callout>

      <Callout variant="warning">
        <p>
          <strong>주의:</strong> &ldquo;아는 척&rdquo;은 대화에 참여하고 흐름을
          이해하기 위한 것이지, 잘 모르는 걸 결정하라는 뜻이 아닙니다. 실제 비용이
          걸린 결정이나 보안 설정은 반드시 인프라 담당자와 함께 확인하세요.
          이해하는 것과 책임지는 것은 다릅니다!
        </p>
      </Callout>

      <h2>전체 시리즈 마무리 정리</h2>
      <p>다섯 페이지를 관통하는 큰 그림을 한 장으로 정리하면:</p>

      <Mermaid
        caption="AWS 핵심 개념 전체 요약"
        chart={`flowchart TB
    subgraph Base["1. 인프라 기초 (땅과 울타리)"]
      direction LR
      Region --> AZ --> VPC --> IAM_SG["IAM · Security Group"]
    end
    subgraph Svc["2. 핵심 서비스 (부품)"]
      direction LR
      EC2 --> S3 --> RDS --> Etc["Route53 · ALB · Lambda 등"]
    end
    subgraph Arch["3. 실전 구성 (조립)"]
      direction LR
      Flow["사용자 → DNS → LB → 서버 → DB"]
    end
    Base --> Svc --> Arch`}
      />

      <Callout variant="tip">
        <p>
          <strong>수고하셨습니다!</strong> 이제 여러분은 AWS 회의에서 오가는{" "}
          Region, VPC, EC2, S3, RDS, 로드밸런서, 그리고 비용 이야기까지 알아들을
          수 있습니다. 완벽히 다룰 줄 아는 것과는 다르지만,{" "}
          <strong>대화에 참여하고 큰 그림을 이해하는</strong> 목표는 충분히
          달성했어요. 필요할 때 이 문서로 다시 돌아와 복습하세요!
        </p>
      </Callout>
    </DocLayout>
  );
}
