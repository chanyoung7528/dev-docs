import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function BfsDfsPage() {
  return (
    <DocLayout
      title="BFS / DFS (트리 & 그래프)"
      description="트리와 그래프를 탐색하는 두 가지 핵심 전략 — 너비 우선(BFS)과 깊이 우선(DFS)입니다."
    >
      <h2>BFS vs DFS 한눈에</h2>

      <CodeBlock
        language="typescript"
        code={`// BFS (너비 우선): 가까운 것부터 — Queue 사용
// → 최단 거리, 레벨별 탐색
// → 시간 O(V+E), 공간 O(V)

// DFS (깊이 우선): 끝까지 파고들기 — Stack/재귀 사용
// → 경로 탐색, 백트래킹, 연결 요소
// → 시간 O(V+E), 공간 O(V)`}
      />

      <h2>트리 BFS — 레벨 순회</h2>

      <CodeBlock
        filename="level-order.ts"
        language="typescript"
        code={`interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// 트리를 레벨별로 순회 → [[3],[9,20],[15,7]]
function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];

  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length; // 현재 레벨의 노드 수
    const level: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      level.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}

// 핵심: queue에서 "한 레벨씩" 처리
// levelSize로 현재 레벨 크기를 미리 구해놓고 그만큼만 처리`}
        highlight={[12, 15, 16, 19, 22, 23]}
      />

      <h2>트리 DFS — 세 가지 순회</h2>

      <CodeBlock
        filename="tree-dfs.ts"
        language="typescript"
        code={`// 전위 (Preorder): 루트 → 왼쪽 → 오른쪽
function preorder(node: TreeNode | null, result: number[] = []): number[] {
  if (!node) return result;
  result.push(node.val);      // 루트 먼저
  preorder(node.left, result);
  preorder(node.right, result);
  return result;
}

// 중위 (Inorder): 왼쪽 → 루트 → 오른쪽 — BST에서 정렬 순서!
function inorder(node: TreeNode | null, result: number[] = []): number[] {
  if (!node) return result;
  inorder(node.left, result);
  result.push(node.val);      // 가운데
  inorder(node.right, result);
  return result;
}

// 후위 (Postorder): 왼쪽 → 오른쪽 → 루트
function postorder(node: TreeNode | null, result: number[] = []): number[] {
  if (!node) return result;
  postorder(node.left, result);
  postorder(node.right, result);
  result.push(node.val);      // 마지막
  return result;
}

// BST 유효성 검사 (Inorder DFS 응용)
function isValidBST(node: TreeNode | null, min = -Infinity, max = Infinity): boolean {
  if (!node) return true;
  if (node.val <= min || node.val >= max) return false;
  return isValidBST(node.left, min, node.val)
      && isValidBST(node.right, node.val, max);
}`}
        highlight={[4, 14, 25, 31, 32, 33, 34]}
      />

      <h2>트리 DFS — 최대 깊이, 경로 합</h2>

      <CodeBlock
        filename="tree-problems.ts"
        language="typescript"
        code={`// 트리의 최대 깊이
function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// 루트→리프 경로 합이 target인 경로 존재 여부
function hasPathSum(root: TreeNode | null, target: number): boolean {
  if (!root) return false;

  // 리프 노드에서 남은 합이 0인지 확인
  if (!root.left && !root.right) {
    return target === root.val;
  }

  const remaining = target - root.val;
  return hasPathSum(root.left, remaining)
      || hasPathSum(root.right, remaining);
}

// 좌우 반전 (Invert Binary Tree — 유명한 면접 문제)
function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;

  const temp = root.left;
  root.left = invertTree(root.right);
  root.right = invertTree(temp);

  return root;
}`}
        highlight={[3, 4, 11, 12, 16, 17, 25, 26]}
      />

      <h2>2D 그리드 BFS — 최단 거리</h2>

      <CodeBlock
        filename="grid-bfs.ts"
        language="typescript"
        code={`// 2D 그리드에서 (0,0) → (n-1,m-1) 최단 경로
// 0: 통과 가능, 1: 벽
function shortestPath(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;

  if (grid[0][0] === 1 || grid[rows - 1][cols - 1] === 1) return -1;

  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // 상하좌우
  const queue: [number, number, number][] = [[0, 0, 1]]; // [row, col, distance]
  const visited = new Set<string>();
  visited.add('0,0');

  while (queue.length > 0) {
    const [row, col, dist] = queue.shift()!;

    if (row === rows - 1 && col === cols - 1) return dist;

    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      const key = \`\${nr},\${nc}\`;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
        && grid[nr][nc] === 0 && !visited.has(key)) {
        visited.add(key);
        queue.push([nr, nc, dist + 1]);
      }
    }
  }

  return -1;
}

// 핵심: BFS는 처음 도달한 것이 최단 경로 (가중치 없을 때)`}
        highlight={[9, 10, 11, 16, 24, 25, 26, 27]}
      />

      <h2>섬의 개수 (DFS Flood Fill)</h2>

      <CodeBlock
        filename="num-islands.ts"
        language="typescript"
        code={`// 1로 연결된 섬의 개수 세기
function numIslands(grid: string[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r: number, c: number) {
    // 범위 밖이거나 물('0')이면 리턴
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') {
      return;
    }

    grid[r][c] = '0'; // 방문 처리 (원본 변경)

    // 상하좌우 탐색
    dfs(r - 1, c);
    dfs(r + 1, c);
    dfs(r, c - 1);
    dfs(r, c + 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c); // 연결된 모든 1을 0으로 변경
      }
    }
  }

  return count;
}

// 핵심: 1을 발견하면 → count++ → DFS로 연결된 모든 1을 제거
// 다음에 발견하는 1은 반드시 새로운 섬`}
        highlight={[7, 9, 13, 24, 25, 26]}
      />

      <Callout variant="tip">
        <p>
          <strong>BFS vs DFS 선택 기준</strong>
        </p>
        <p>
          &bull; <strong>최단 거리/경로</strong> → BFS (레벨별로 퍼지므로)<br />
          &bull; <strong>모든 경로 탐색, 백트래킹</strong> → DFS<br />
          &bull; <strong>연결 요소 개수</strong> → BFS 또는 DFS 모두 가능<br />
          &bull; <strong>트리 레벨별 처리</strong> → BFS<br />
          &bull; <strong>그리드 문제</strong> → 둘 다 가능, DFS가 구현 간단
        </p>
      </Callout>
    </DocLayout>
  );
}
