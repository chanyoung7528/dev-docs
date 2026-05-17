import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function DeployPipelinePage() {
  return (
    <DocLayout
      title="AWS 배포 & CI/CD 파이프라인"
      description="프론트엔드 엔지니어가 알아야 할 AWS 서비스, 배포 전략, CI/CD 파이프라인 개념입니다."
    >
      <h2>프론트엔드 배포 아키텍처</h2>

      <CodeBlock
        language="text"
        code={`┌─────────────────────────────────────────────────────────┐
│                    배포 파이프라인                        │
│                                                         │
│  개발자 → Git Push → CI/CD → 빌드 → 배포 → CDN → 사용자  │
│                                                         │
│  ┌────────┐  ┌────────┐  ┌─────────┐  ┌──────────────┐  │
│  │ GitHub │→ │ CI/CD  │→ │  Build  │→ │  배포 대상     │  │
│  │ GitLab │  │ Actions│  │ next    │  │ S3 + CF      │  │
│  │        │  │ Jenkins│  │ build   │  │ Vercel       │  │
│  │        │  │        │  │         │  │ Docker + ECS │  │
│  └────────┘  └────────┘  └─────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘

프론트엔드 주요 배포 방식:
1. SSG → S3 + CloudFront (정적 파일 CDN)
2. SSR → EC2/ECS + ALB (Node.js 서버)
3. 하이브리드 → Vercel / AWS Amplify (자동 판별)`}
      />

      <h2>AWS 핵심 서비스 (프론트 시각)</h2>

      <CodeBlock
        language="text"
        code={`S3 (Simple Storage Service)
  - 정적 파일 저장소 (HTML, CSS, JS, 이미지)
  - Static Export 결과물 업로드 대상
  - 웹사이트 호스팅 가능 (S3 Static Website)
  - 비용: 거의 무료 수준

CloudFront (CDN)
  - S3 앞에 붙이는 CDN (전 세계 엣지 서버)
  - HTTPS 자동 처리 (ACM 인증서)
  - 캐시 무효화 (Invalidation): 배포 후 기존 캐시 제거
  - 커스텀 도메인 연결
  - 프론트가 가장 많이 접하는 AWS 서비스

Route 53 (DNS)
  - 도메인 관리 (pine.hanwhaam.com 같은)
  - CloudFront나 ALB에 도메인 연결

ACM (인증서)
  - SSL/TLS 인증서 무료 발급
  - CloudFront/ALB에 연결 → HTTPS

ECR (Container Registry)
  - Docker 이미지 저장소
  - SSR 앱 Docker 이미지 push

ECS/Fargate (컨테이너 실행)
  - Docker 컨테이너 실행 (SSR Node.js 서버)
  - Fargate: 서버 관리 없이 컨테이너 실행

ALB (Application Load Balancer)
  - 여러 ECS 인스턴스에 트래픽 분배
  - 헬스체크, HTTPS 처리`}
      />

      <h2>SSG 배포: S3 + CloudFront</h2>

      <CodeBlock
        language="text"
        code={`배포 흐름:
1. next build (output: 'export') → out/ 폴더 생성
2. out/ 내용을 S3 버킷에 업로드
3. CloudFront 캐시 무효화 (Invalidation)
4. 사용자는 CloudFront 엣지에서 정적 파일 로드

장점:
- 서버 비용 거의 없음
- 전 세계 빠른 로딩 (CDN)
- 높은 안정성 (AWS 인프라)

단점:
- 데이터 변경 시 재빌드 + 재배포 필요
- Server Action, API Route 사용 불가`}
      />

      <h2>GitHub Actions CI/CD 예시</h2>

      <CodeBlock
        filename=".github/workflows/deploy.yml"
        language="yaml"
        code={`name: Deploy to S3 + CloudFront

on:
  push:
    branches: [main]  # main 브랜치 push 시 자동 배포

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      # 1. 코드 체크아웃
      - uses: actions/checkout@v4

      # 2. Node.js 설정
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      # 3. 의존성 설치
      - run: pnpm install --frozen-lockfile

      # 4. 린트 + 타입 체크
      - run: pnpm lint
      - run: pnpm type-check

      # 5. 테스트 (있다면)
      - run: pnpm test --if-present

      # 6. 빌드
      - run: pnpm build

      # 7. S3 업로드
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2

      - run: aws s3 sync out/ s3://my-bucket --delete

      # 8. CloudFront 캐시 무효화
      - run: aws cloudfront create-invalidation
          --distribution-id \${{ secrets.CF_DISTRIBUTION_ID }}
          --paths "/*"`}
        highlight={[4, 5, 33, 42, 45, 46, 47]}
      />

      <h2>Docker 배포 (SSR)</h2>

      <CodeBlock
        filename="Dockerfile"
        language="dockerfile"
        code={`# 멀티스테이지 빌드 (이미지 크기 최소화)

# 1단계: 빌드
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# 2단계: 프로덕션 실행
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 빌드 결과만 복사 (node_modules, 소스 제외)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]

# next.config.ts에 output: 'standalone' 필요
# → .next/standalone에 최소한의 서버 코드만 생성`}
        highlight={[4, 14, 20, 21, 22, 25]}
      />

      <h2>환경 변수 관리</h2>

      <CodeBlock
        language="text"
        code={`환경별 변수 파일:
.env.local          ← 로컬 개발 (Git 제외)
.env.development    ← 개발 환경
.env.staging        ← 스테이징
.env.production     ← 프로덕션

Next.js 환경 변수 규칙:
─────────────────────────────────
NEXT_PUBLIC_*      → 클라이언트 노출 OK (브라우저 번들에 포함)
그 외              → 서버 전용 (빌드 시에만 사용)

예시:
NEXT_PUBLIC_API_URL=https://api.hanwhaam.com   ✅ 공개 가능
DATABASE_URL=postgres://...                     🔒 서버 전용
API_SECRET_KEY=sk-...                           🔒 서버 전용
NEXT_PUBLIC_GA_ID=G-XXXXX                       ✅ 공개 가능

CI/CD에서:
- GitHub Actions: Settings > Secrets에 등록
- AWS: Systems Manager Parameter Store 또는 Secrets Manager`}
      />

      <h2>브랜치 전략 & 배포 플로우</h2>

      <CodeBlock
        language="text"
        code={`일반적인 프론트엔드 브랜치 전략:

main (production)
  ├── develop (개발 통합)
  │     ├── feature/fund-list (기능 개발)
  │     ├── feature/chart-improvement
  │     └── fix/login-error (버그 수정)
  └── release/1.2.0 (릴리스 준비)

배포 플로우:
1. feature → develop (PR + 코드 리뷰)
2. develop → staging 자동 배포 (QA 테스트)
3. develop → release 브랜치 생성 (릴리스 준비)
4. release → main (PR + 승인 → 프로덕션 배포)
5. main에서 태그: v1.2.0

금융권 추가 절차:
- 보안 점검 (소스 코드 스캔, 취약점 검사)
- 배포 승인 프로세스 (배포 전 승인자 확인)
- 블루/그린 배포 또는 카나리 배포 (무중단)
- 롤백 계획 수립`}
      />

      <h2>캐시 전략</h2>

      <CodeBlock
        language="text"
        code={`정적 파일 캐시 설정 (CloudFront):

HTML:   Cache-Control: no-cache
        → 항상 최신 HTML 로드 (CloudFront에서 원본 확인)

JS/CSS: Cache-Control: public, max-age=31536000, immutable
        → 1년 캐시 (파일명에 해시 포함: main.abc123.js)
        → 코드 변경 시 해시가 바뀌어 자동 갱신

이미지: Cache-Control: public, max-age=604800
        → 1주일 캐시

API:    Cache-Control: no-store
        → 캐시 안 함 (실시간 데이터)

핵심: JS/CSS는 해시 기반이라 1년 캐시해도 안전
      HTML은 no-cache로 항상 최신 JS/CSS 해시를 가리킴`}
      />

      <Callout variant="tip">
        <p>
          <strong>프론트엔드가 알아야 할 핵심:</strong>
        </p>
        <p>
          &bull; S3 + CloudFront = SSG 배포의 표준<br />
          &bull; Docker + ECS = SSR 배포의 표준<br />
          &bull; GitHub Actions = CI/CD 자동화<br />
          &bull; <code>NEXT_PUBLIC_</code> 접두사가 없으면 클라이언트에서 접근 불가<br />
          &bull; CloudFront Invalidation = 배포 후 필수<br />
          &bull; 캐시: HTML은 no-cache, JS/CSS는 해시 기반 장기 캐시
        </p>
      </Callout>
    </DocLayout>
  );
}
