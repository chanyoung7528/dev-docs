"use client";

import { useState } from "react";
import Link from "next/link";
import { projects } from "@/config/navigation";
import styles from "./Header.module.css";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>D</span>
          <span className={styles.logoText}>Dev Docs</span>
        </Link>

        <nav className={styles.nav}>
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={project.categories[0]?.items[0]?.path ?? "#"}
              className={styles.navLink}
            >
              {project.title}
            </Link>
          ))}
        </nav>

        <button
          className={styles.mobileToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴 열기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {mobileMenuOpen ? (
              <path
                d="M6 6L18 18M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7H20M4 12H20M4 17H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={project.categories[0]?.items[0]?.path ?? "#"}
              className={styles.mobileLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              {project.title}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
