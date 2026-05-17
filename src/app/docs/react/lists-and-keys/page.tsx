import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function ReactListsAndKeysPage() {
  return (
    <DocLayout
      title="리스트와 Key"
      description="배열 데이터를 렌더링하고, Key를 올바르게 사용하는 방법을 알아봅니다."
    >
      <h2>리스트 렌더링</h2>
      <p>
        배열 데이터를 UI로 변환할 때 <code>map()</code>을 사용합니다.
        각 항목에는 고유한 <code>key</code> prop이 필요합니다.
      </p>

      <CodeBlock
        language="tsx"
        code={`interface Post {
  bbcSeqNo: number;
  title: string;
  createdAt: string;
}

function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul>
      {posts.map(post => (
        <li key={post.bbcSeqNo}>
          <h3>{post.title}</h3>
          <span>{post.createdAt}</span>
        </li>
      ))}
    </ul>
  );
}`}
        highlight={[11]}
      />

      <h2>Key의 역할</h2>
      <p>
        Key는 React가 리스트 항목을 식별하는 데 사용합니다. 항목이 추가, 삭제,
        재정렬될 때 어떤 항목이 변경되었는지 효율적으로 파악합니다.
      </p>

      <h3>좋은 Key vs 나쁜 Key</h3>
      <CodeBlock
        language="tsx"
        code={`// 좋음: 서버에서 받은 고유 ID
{agreements.map(item => (
  <AgreementItem key={item.agrmNo} agreement={item} />
))}

// 나쁨: 배열 인덱스 (항목 순서 변경 시 버그)
{items.map((item, index) => (
  <ListItem key={index} item={item} />
))}

// 최악: 랜덤 값 (매 렌더링마다 컴포넌트 재생성)
{items.map(item => (
  <ListItem key={Math.random()} item={item} />
))}`}
        highlight={[3, 8, 13]}
      />

      <Callout variant="warning">
        <p>
          배열 인덱스를 key로 사용하면 항목 추가/삭제/재정렬 시 React가
          잘못된 항목을 업데이트할 수 있습니다.
          서버에서 받은 고유 ID를 사용하세요.
        </p>
      </Callout>

      <h2>실전 적용: 약관 동의 리스트</h2>

      <CodeBlock
        filename="AgreementList.tsx"
        language="tsx"
        code={`interface AgreementListProps {
  agreements: Agreement[];
  checkedItems: Set<string>;
  onCheckedChange: (agrmNo: string, checked: boolean) => void;
  onViewDetail: (agrmNo: string) => void;
}

export function AgreementList({
  agreements,
  checkedItems,
  onCheckedChange,
  onViewDetail,
}: AgreementListProps) {
  return (
    <div className={styles.list}>
      {agreements.map(agreement => (
        <AgreementItem
          key={agreement.agrmNo}
          agreement={agreement}
          checked={checkedItems.has(agreement.agrmNo)}
          onCheckedChange={onCheckedChange}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
}`}
        highlight={[18, 20]}
      />

      <h2>빈 리스트 처리</h2>
      <CodeBlock
        language="tsx"
        code={`function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>게시글이 없습니다.</p>
      </div>
    );
  }

  return (
    <ul>
      {posts.map(post => (
        <PostItem key={post.bbcSeqNo} post={post} />
      ))}
    </ul>
  );
}`}
      />

      <Callout variant="tip">
        <p>
          리스트 항목이 복잡해지면 별도 컴포넌트로 분리하세요.
          <code>map()</code> 안에 긴 JSX를 작성하면 가독성이 떨어지고,
          항목 컴포넌트를 분리하면 리렌더링도 독립적으로 관리됩니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
