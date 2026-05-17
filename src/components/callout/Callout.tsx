import styles from "./Callout.module.css";

type CalloutVariant = "note" | "warning" | "danger" | "tip";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}

const variantIcons: Record<CalloutVariant, string> = {
  note: "i",
  warning: "!",
  danger: "X",
  tip: "✓",
};

const variantLabels: Record<CalloutVariant, string> = {
  note: "참고",
  warning: "주의",
  danger: "위험",
  tip: "팁",
};

export function Callout({ variant = "note", title, children }: CalloutProps) {
  return (
    <div className={`${styles.callout} ${styles[variant]}`}>
      <div className={styles.header}>
        <span className={styles.icon}>{variantIcons[variant]}</span>
        <span className={styles.label}>{title ?? variantLabels[variant]}</span>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
