import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function FullstackCrudPage() {
  return (
    <DocLayout
      title="풀스택 CRUD 실전"
      description="Next.js + Prisma + Zod로 API Route부터 프론트엔드까지 전 구간 타입 안전한 CRUD를 구현합니다."
    >
      <h2>풀스택 구조</h2>

      <CodeBlock
        language="text"
        code={`프론트엔드 (Client)          서버 (Next.js)              DB
─────────────────       ─────────────────────       ──────
TanStack Query    →     API Route / Action     →    Prisma
  useQuery               GET /api/posts              findMany
  useMutation            POST /api/posts             create
                         PUT /api/posts/:id           update
                         DELETE /api/posts/:id        delete

타입 흐름:
Prisma Schema → 자동 생성 타입 → Zod 검증 → API → 클라이언트`}
      />

      <h2>1단계: Prisma 스키마</h2>

      <CodeBlock
        filename="prisma/schema.prisma"
        language="text"
        code={`model Fund {
  id          String   @id @default(cuid())
  name        String
  category    String
  nav         Float
  returnRate  Float
  manager     String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("funds")
}`}
      />

      <h2>2단계: Zod 검증 스키마</h2>

      <CodeBlock
        filename="src/lib/validations/fund.ts"
        language="typescript"
        code={`import { z } from 'zod';

// 생성용
export const createFundSchema = z.object({
  name: z.string().min(1, '펀드명을 입력하세요').max(100),
  category: z.enum(['equity', 'bond', 'hybrid', 'alternative']),
  nav: z.number().positive('기준가는 양수여야 합니다'),
  returnRate: z.number(),
  manager: z.string().min(1),
  description: z.string().optional(),
});

// 수정용 (모든 필드 optional + id 필수)
export const updateFundSchema = createFundSchema.partial();

// 검색용
export const fundQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['name', 'returnRate', 'nav', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateFundDTO = z.infer<typeof createFundSchema>;
export type UpdateFundDTO = z.infer<typeof updateFundSchema>;
export type FundQuery = z.infer<typeof fundQuerySchema>;`}
        highlight={[4, 14, 17, 25, 26, 27]}
      />

      <h2>3단계: API Route (CRUD)</h2>

      <CodeBlock
        filename="app/api/funds/route.ts"
        language="typescript"
        code={`import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createFundSchema, fundQuerySchema } from '@/lib/validations/fund';

// GET /api/funds?category=equity&page=1&size=20
export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = fundQuerySchema.safeParse(params);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { category, search, page, size, sort, order } = parsed.data;

  const where = {
    isActive: true,
    ...(category && { category }),
    ...(search && {
      name: { contains: search, mode: 'insensitive' as const },
    }),
  };

  const [funds, total] = await Promise.all([
    prisma.fund.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * size,
      take: size,
    }),
    prisma.fund.count({ where }),
  ]);

  return Response.json({
    data: funds,
    pagination: {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    },
  });
}

// POST /api/funds
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createFundSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const fund = await prisma.fund.create({ data: parsed.data });
  return Response.json({ data: fund }, { status: 201 });
}`}
        highlight={[7, 8, 10, 11, 24, 25, 47, 48, 50, 51]}
      />

      <CodeBlock
        filename="app/api/funds/[id]/route.ts"
        language="typescript"
        code={`import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateFundSchema } from '@/lib/validations/fund';

type Params = { params: Promise<{ id: string }> };

// GET /api/funds/:id
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const fund = await prisma.fund.findUnique({ where: { id } });

  if (!fund) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json({ data: fund });
}

// PUT /api/funds/:id
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateFundSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const fund = await prisma.fund.update({
    where: { id },
    data: parsed.data,
  });

  return Response.json({ data: fund });
}

// DELETE /api/funds/:id
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;

  await prisma.fund.delete({ where: { id } });

  return new Response(null, { status: 204 });
}`}
        highlight={[8, 9, 10, 20, 21, 23, 29, 30]}
      />

      <h2>4단계: 프론트엔드 연동 (TanStack Query)</h2>

      <CodeBlock
        filename="src/queries/fund.queries.ts"
        language="typescript"
        code={`import { queryOptions } from '@tanstack/react-query';
import type { FundQuery, CreateFundDTO } from '@/lib/validations/fund';

const BASE = '/api/funds';

export const fundQueries = {
  all: () => ['funds'] as const,

  list: (params: FundQuery) =>
    queryOptions({
      queryKey: [...fundQueries.all(), 'list', params] as const,
      queryFn: async () => {
        const query = new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString();
        const res = await fetch(\`\${BASE}?\${query}\`);
        return res.json();
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...fundQueries.all(), 'detail', id] as const,
      queryFn: async () => {
        const res = await fetch(\`\${BASE}/\${id}\`);
        return res.json();
      },
    }),
};

// Mutation 함수
export const fundApi = {
  create: async (data: CreateFundDTO) => {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create');
    return res.json();
  },

  update: async (id: string, data: Partial<CreateFundDTO>) => {
    const res = await fetch(\`\${BASE}/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(\`\${BASE}/\${id}\`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
  },
};`}
        highlight={[9, 10, 11, 23, 24, 25, 35, 36, 45, 46, 55]}
      />

      <h2>5단계: 페이지 컴포넌트</h2>

      <CodeBlock
        filename="FundListPage.tsx"
        language="tsx"
        code={`'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fundQueries, fundApi } from '@/queries/fund.queries';

export function FundListPage() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<FundQuery>({ page: 1, size: 20 });

  // 목록 조회
  const { data, isLoading } = useQuery(fundQueries.list(params));

  // 삭제
  const deleteMutation = useMutation({
    mutationFn: fundApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundQueries.all() });
    },
  });

  if (isLoading) return <Skeleton variant="card" count={5} />;

  return (
    <div>
      {/* 검색/필터 */}
      <SearchBar onSearch={(search) => setParams(p => ({ ...p, search, page: 1 }))} />
      <CategoryFilter onChange={(category) => setParams(p => ({ ...p, category, page: 1 }))} />

      {/* 목록 */}
      {data?.data.map((fund) => (
        <FundCard
          key={fund.id}
          fund={fund}
          onDelete={() => deleteMutation.mutate(fund.id)}
        />
      ))}

      {/* 페이지네이션 */}
      <Pagination
        page={params.page}
        totalPages={data?.pagination.totalPages}
        onChange={(page) => setParams(p => ({ ...p, page }))}
      />
    </div>
  );
}`}
        highlight={[10, 13, 14, 16, 17, 30, 33, 34]}
      />

      <h2>전체 파일 구조</h2>

      <CodeBlock
        language="text"
        code={`prisma/
  schema.prisma              ← DB 스키마

src/
  lib/
    prisma.ts                ← Prisma Client 싱글턴
    validations/
      fund.ts                ← Zod 스키마 (API + 프론트 공유)

  app/
    api/
      funds/
        route.ts             ← GET (목록), POST (생성)
        [id]/
          route.ts           ← GET (상세), PUT (수정), DELETE (삭제)

  queries/
    fund.queries.ts          ← TanStack Query 팩토리 + API 함수

  components/
    FundListPage.tsx         ← 목록 페이지
    FundForm.tsx             ← 생성/수정 폼 (RHF + Zod)`}
      />

      <Callout variant="tip">
        <p>
          <strong>타입 안전성 흐름:</strong> Prisma 스키마 → 자동 생성 타입 →
          Zod로 API 입력 검증 → <code>z.infer</code>로 프론트엔드 타입 →
          TanStack Query로 캐싱/갱신. DB부터 UI까지 타입이 끊기지 않습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
