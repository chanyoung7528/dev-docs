"use client";

import { useEffect, useId, useState } from "react";
import styles from "./Mermaid.module.css";

interface MermaidProps {
  /** Mermaid 다이어그램 정의 문자열 */
  chart: string;
  /** 다이어그램 위에 표시할 설명 캡션 (선택) */
  caption?: string;
}

/**
 * Mermaid 다이어그램을 클라이언트에서 렌더링하는 컴포넌트.
 * mermaid 라이브러리를 동적 import 하여 초기 번들 크기에 영향을 주지 않는다.
 */
export function Mermaid({ chart, caption }: MermaidProps) {
  const rawId = useId();
  const renderId = `mermaid-${rawId.replace(/[:]/g, "")}`;
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "neutral",
          fontFamily:
            "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
          themeVariables: {
            primaryColor: "#e8f0fe",
            primaryBorderColor: "#087ea4",
            primaryTextColor: "#23272f",
            lineColor: "#5e687e",
            fontSize: "14px",
          },
        });

        const { svg: rendered } = await mermaid.render(
          renderId,
          chart.trim()
        );
        if (!cancelled) {
          setSvg(rendered);
          setError("");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "다이어그램 렌더링 실패");
        }
      }
    }

    renderChart();
    return () => {
      cancelled = true;
    };
  }, [chart, renderId]);

  return (
    <figure className={styles.wrapper}>
      {error ? (
        <pre className={styles.error}>다이어그램 오류: {error}</pre>
      ) : (
        <div
          className={styles.diagram}
          // mermaid가 만든 SVG를 삽입
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
