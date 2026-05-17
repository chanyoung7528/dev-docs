"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { findAdjacentItems } from "@/config/navigation";
import styles from "./DocLayout.module.css";

interface DocLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DocLayout({ title, description, children }: DocLayoutProps) {
  const pathname = usePathname();
  const { prev, next } = findAdjacentItems(pathname);

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </header>
      <div className={styles.content}>{children}</div>
      <nav className={styles.pagination}>
        {prev ? (
          <Link href={prev.path} className={styles.paginationLink}>
            <span className={styles.paginationLabel}>이전</span>
            <span className={styles.paginationTitle}>{prev.title}</span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={next.path}
            className={`${styles.paginationLink} ${styles.next}`}
          >
            <span className={styles.paginationLabel}>다음</span>
            <span className={styles.paginationTitle}>{next.title}</span>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
}
