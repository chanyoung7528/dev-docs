import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function PrismaSetupPage() {
  return (
    <DocLayout
      title="Prisma + Next.js 설정"
      description="Next.js 풀스택에서 Prisma ORM으로 DB를 다루는 초기 설정과 핵심 개념입니다."
    >
      <h2>Prisma란?</h2>
      <p>
        Prisma는 TypeScript/Node.js용 ORM입니다. SQL을 직접 쓰지 않고
        타입 안전하게 DB를 조작합니다. 스키마에서 타입이 자동 생성되어
        오타나 잘못된 필드 접근이 컴파일 타임에 잡힙니다.
      </p>

      <h2>설치 & 초기화</h2>

      <CodeBlock
        language="bash"
        code={`# 설치
npm install prisma @prisma/client
npx prisma init

# 생성되는 파일:
# prisma/schema.prisma  — DB 스키마 정의
# .env                  — DATABASE_URL`}
      />

      <h2>스키마 정의</h2>

      <CodeBlock
        filename="prisma/schema.prisma"
        language="text"
        code={`// DB 연결 설정
datasource db {
  provider = "postgresql"  // mysql, sqlite, mongodb 등
  url      = env("DATABASE_URL")
}

// Prisma Client 생성 설정
generator client {
  provider = "prisma-client-js"
}

// ─── 모델 정의 (= DB 테이블) ─── //

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 관계: 1:N (유저 → 게시글)
  posts     Post[]
  profile   Profile?  // 1:1 (optional)

  @@map("users")  // 실제 테이블명
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())

  // 관계: N:1 (게시글 → 유저)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String

  // 관계: N:M (게시글 ↔ 태그)
  tags      Tag[]

  @@index([authorId])  // 인덱스
  @@map("posts")
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]

  @@map("tags")
}

model Profile {
  id     String @id @default(cuid())
  bio    String?
  avatar String?
  user   User   @relation(fields: [userId], references: [id])
  userId String @unique

  @@map("profiles")
}

enum Role {
  USER
  ADMIN
}`}
        highlight={[15, 16, 17, 24, 25, 39, 40, 43]}
      />

      <h2>마이그레이션</h2>

      <CodeBlock
        language="bash"
        code={`# 스키마 변경 → DB 반영
npx prisma migrate dev --name init
# → prisma/migrations/ 폴더에 SQL 생성

# Prisma Client 재생성 (타입 업데이트)
npx prisma generate

# DB 시드 (초기 데이터)
npx prisma db seed

# DB GUI 툴 (개발용)
npx prisma studio  # localhost:5555 에서 데이터 확인/편집`}
      />

      <h2>Prisma Client 싱글턴 (Next.js 필수)</h2>

      <CodeBlock
        filename="src/lib/prisma.ts"
        language="typescript"
        code={`import { PrismaClient } from '@prisma/client';

// Next.js 개발 모드: Hot Reload 시 PrismaClient 인스턴스 누적 방지
// 프로덕션: 단일 인스턴스 사용

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'warn', 'error']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 모든 서버 코드에서 이 prisma 인스턴스를 import`}
        highlight={[6, 7, 10, 11, 12, 16, 17]}
      />

      <Callout variant="warning">
        <p>
          Next.js 개발 모드에서 Hot Reload마다 <code>new PrismaClient()</code>가
          호출되면 DB 커넥션이 누적됩니다. 반드시 <code>globalThis</code>에
          캐싱하세요.
        </p>
      </Callout>

      <h2>기본 CRUD 쿼리</h2>

      <CodeBlock
        filename="prisma-queries.ts"
        language="typescript"
        code={`import { prisma } from '@/lib/prisma';

// ─── Create ─── //
const user = await prisma.user.create({
  data: {
    email: 'kim@example.com',
    name: 'Kim',
    password: hashedPassword,
  },
});

// 관계 포함 생성
const userWithProfile = await prisma.user.create({
  data: {
    email: 'kim@example.com',
    name: 'Kim',
    password: hashedPassword,
    profile: {
      create: { bio: '프론트엔드 개발자' },  // Profile 동시 생성
    },
  },
  include: { profile: true },  // 생성된 profile도 반환
});

// ─── Read ─── //
// 단일 조회
const user = await prisma.user.findUnique({
  where: { email: 'kim@example.com' },
  include: { posts: true, profile: true },
});

// 목록 조회 (필터 + 정렬 + 페이지네이션)
const posts = await prisma.post.findMany({
  where: {
    published: true,
    author: { role: 'ADMIN' },      // 관계 필터
    title: { contains: '검색어' },   // 부분 검색
  },
  orderBy: { createdAt: 'desc' },
  skip: 0,     // offset
  take: 10,    // limit
  include: {
    author: { select: { name: true, email: true } },
    tags: true,
  },
});

// ─── Update ─── //
const updated = await prisma.user.update({
  where: { id: userId },
  data: { name: '새 이름' },
});

// ─── Delete ─── //
await prisma.post.delete({
  where: { id: postId },
});

// ─── 집계 ─── //
const count = await prisma.post.count({
  where: { published: true },
});

const stats = await prisma.post.aggregate({
  _count: true,
  _avg: { viewCount: true },
});`}
        highlight={[4, 13, 19, 22, 27, 28, 33, 34, 35, 36, 49, 50]}
      />

      <h2>Zod + Prisma 연동</h2>

      <CodeBlock
        language="typescript"
        code={`import { z } from 'zod';

// API 입력 검증 스키마
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  published: z.boolean().default(false),
  tagIds: z.array(z.string()).optional(),
});

// Route Handler에서 사용
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      ...parsed.data,
      authorId: session.user.id,
      tags: parsed.data.tagIds
        ? { connect: parsed.data.tagIds.map(id => ({ id })) }
        : undefined,
    },
  });

  return Response.json(post, { status: 201 });
}`}
        highlight={[4, 14, 15, 16, 17, 20, 24, 25]}
      />

      <Callout variant="tip">
        <p>
          Prisma 스키마에서 타입이 자동 생성되고, Zod로 API 입력을 검증하면,
          <strong>DB → API → 클라이언트</strong> 전 구간이 타입 안전합니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
