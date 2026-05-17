import Link from "next/link";
import { projects } from "@/config/navigation";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>프론트엔드 개발 가이드</h1>
        <p className={styles.heroDescription}>
          프로젝트에서 사용하는 핵심 기술들을 개념부터 실전까지 정리한 교육
          문서입니다.
        </p>
        <Link
          href={projects[0]?.categories[0]?.items[0]?.path ?? "#"}
          className={styles.heroButton}
        >
          학습 시작하기
        </Link>
      </section>

      <section className={styles.projects}>
        {projects.map((project) => {
          const totalItems = project.categories.reduce(
            (acc, cat) => acc + cat.items.length,
            0
          );
          const firstLink = project.categories[0]?.items[0]?.path ?? "#";

          return (
            <Link
              key={project.slug}
              href={firstLink}
              className={styles.projectCard}
            >
              <h2 className={styles.projectTitle}>{project.title}</h2>
              <p className={styles.projectDescription}>{project.description}</p>
              <div className={styles.projectMeta}>
                <span>{project.categories.length}개 섹션</span>
                <span>{totalItems}개 문서</span>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
