import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function GitDailyWorkflowPage() {
  return (
    <DocLayout
      title="일상 워크플로우 & 복구"
      description="실무에서 매일 쓰는 Git 명령어와 실수 복구 방법을 정리합니다."
    >
      <h2>일상 워크플로우</h2>

      <CodeBlock
        language="bash"
        code={`# 브랜치 생성 + 이동
git checkout -b feature/fund-list
# 또는 (Git 2.23+)
git switch -c feature/fund-list

# 변경사항 확인
git status            # 변경된 파일 목록
git diff              # 아직 스테이징 안 된 변경 내용
git diff --staged     # 스테이징된 변경 내용

# 스테이징 + 커밋
git add .                                # 전체 스테이징
git add src/components/FundList.tsx      # 특정 파일만
git commit -m "feat: 펀드 목록 구현"

# 푸시
git push origin feature/fund-list

# 최신 코드 가져오기
git pull origin develop`}
      />

      <h2>브랜치 관리</h2>

      <CodeBlock
        language="bash"
        code={`# 브랜치 목록
git branch            # 로컬 브랜치
git branch -a         # 로컬 + 원격 브랜치

# 브랜치 전환
git switch develop
git checkout develop   # 구버전 호환

# 브랜치 삭제
git branch -d feature/done       # 머지된 브랜치만 삭제
git branch -D feature/abandoned  # 강제 삭제 (머지 안 되어도)

# 원격 브랜치 삭제
git push origin --delete feature/old-branch

# 원격 브랜치 정리 (삭제된 원격 브랜치 참조 제거)
git fetch --prune`}
      />

      <h2>커밋 컨벤션</h2>

      <CodeBlock
        language="text"
        code={`# 타입: 설명
feat:     새 기능 추가
fix:      버그 수정
refactor: 리팩토링 (기능 변경 없이 코드 개선)
style:    코드 포맷팅, 세미콜론 누락 등 (코드 변경 없음)
docs:     문서 수정
test:     테스트 추가/수정
chore:    빌드 설정, 패키지 매니저 등

# 예시
git commit -m "feat: 펀드 상세 페이지 구현"
git commit -m "fix: 수익률 소수점 표시 오류 수정"
git commit -m "refactor: API 클라이언트 싱글턴 패턴 적용"`}
      />

      <h2>실수 복구</h2>

      <Callout variant="warning">
        <p>
          복구 명령어 중 일부는 되돌릴 수 없습니다. 확신이 없으면
          먼저 <code>git stash</code>로 현재 작업을 백업하세요.
        </p>
      </Callout>

      <CodeBlock
        language="bash"
        code={`# 작업 임시 저장 (급히 다른 브랜치로 가야 할 때)
git stash                     # 현재 변경사항 저장
git stash -m "fund-list WIP"  # 메시지 포함
git stash list                # 저장 목록 보기
git stash pop                 # 가장 최근 stash 복원 + 삭제
git stash apply               # 복원 (삭제 안 함, 여러 번 적용 가능)
git stash drop stash@{0}      # 특정 stash 삭제

# 마지막 커밋 취소 (변경사항은 유지)
git reset --soft HEAD~1
# → 커밋만 취소, 파일 변경은 스테이징 상태로 남음

# 마지막 커밋 메시지 수정
git commit --amend -m "fix: 올바른 커밋 메시지"

# 특정 파일만 되돌리기 (커밋된 상태로)
git checkout -- src/components/BrokenComponent.tsx
# 또는 (Git 2.23+)
git restore src/components/BrokenComponent.tsx

# 스테이징 취소 (add 취소)
git reset HEAD src/components/SomeFile.tsx
# 또는
git restore --staged src/components/SomeFile.tsx`}
        highlight={[2, 10, 14, 17, 22]}
      />

      <h2>충돌 해결</h2>

      <CodeBlock
        language="bash"
        code={`# 1. develop 최신 코드를 내 브랜치에 합치기
git pull origin develop

# 2. 충돌 발생 시 — 파일에서 수동 해결
# <<<<<<< HEAD
# 내 코드 (현재 브랜치)
# =======
# 상대 코드 (develop)
# >>>>>>> develop

# 3. 충돌 마커를 제거하고 원하는 코드만 남기기

# 4. 해결 후 스테이징 + 커밋
git add .
git commit
# → 자동으로 머지 커밋 메시지가 생성됨`}
      />

      <h2>커밋 히스토리 조회</h2>

      <CodeBlock
        language="bash"
        code={`# 최근 커밋 목록 (한 줄씩)
git log --oneline -10

# 그래프로 보기 (브랜치 분기 시각화)
git log --oneline --graph --all -20

# 특정 파일의 변경 히스토리
git log --oneline -- src/components/FundList.tsx

# 특정 커밋의 변경 내용 보기
git show abc1234

# 두 브랜치 간 차이
git diff develop..feature/fund-list

# 누가 이 줄을 작성했는지 (blame)
git blame src/components/FundList.tsx`}
      />

      <h2>자주 쓰는 Git Alias 설정</h2>

      <CodeBlock
        language="bash"
        code={`# ~/.gitconfig에 추가
git config --global alias.st "status"
git config --global alias.co "checkout"
git config --global alias.br "branch"
git config --global alias.lg "log --oneline --graph --all -20"
git config --global alias.unstage "reset HEAD --"
git config --global alias.last "log -1 HEAD"

# 사용
git st        # git status
git co -b new # git checkout -b new
git lg        # 그래프 로그`}
      />

      <Callout variant="note">
        <p>
          새 회사 첫날 할 일: <code>git config user.name</code>과{" "}
          <code>git config user.email</code>을 회사 계정으로 설정하세요.
          개인 계정으로 커밋하면 나중에 수정하기 번거롭습니다.
        </p>
      </Callout>

      <CodeBlock
        language="bash"
        code={`# 회사 프로젝트에서 (--local은 해당 저장소만)
git config --local user.name "김감찬"
git config --local user.email "gimchan@hanwha.com"

# 확인
git config user.name
git config user.email`}
      />
    </DocLayout>
  );
}
