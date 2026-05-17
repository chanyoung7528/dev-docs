"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { projects } from "@/config/navigation";
import type { ProjectNav, NavCategory } from "@/config/navigation";
import styles from "./Sidebar.module.css";

function CategorySection({
  category,
  currentPath,
}: {
  category: NavCategory;
  currentPath: string;
}) {
  return (
    <div className={styles.category}>
      <h3 className={styles.categoryTitle}>{category.title}</h3>
      <ul className={styles.itemList}>
        {category.items.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={`${styles.item} ${
                currentPath === item.path ? styles.active : ""
              }`}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectSection({
  project,
  currentPath,
  isOpen,
  onToggle,
}: {
  project: ProjectNav;
  currentPath: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles.project}>
      <button
        className={`${styles.projectToggle} ${isOpen ? styles.open : ""}`}
        onClick={onToggle}
      >
        <span className={styles.projectTitle}>{project.title}</span>
        <svg
          className={styles.chevron}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M4.5 2L8.5 6L4.5 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && (
        <div className={styles.projectContent}>
          {project.categories.map((category) => (
            <CategorySection
              key={category.title}
              category={category}
              currentPath={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const activeProjectSlug = pathname.split("/")[2] || "";

  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      projects.forEach((p) => {
        initial[p.slug] = p.slug === activeProjectSlug;
      });
      return initial;
    }
  );

  function toggleProject(slug: string) {
    setOpenProjects((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {projects.map((project) => (
          <ProjectSection
            key={project.slug}
            project={project}
            currentPath={pathname}
            isOpen={openProjects[project.slug] ?? false}
            onToggle={() => toggleProject(project.slug)}
          />
        ))}
      </nav>
    </aside>
  );
}
