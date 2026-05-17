"use client";

import { Highlight, themes } from "prism-react-renderer";
import styles from "./CodeBlock.module.css";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  highlight?: number[];
}

export function CodeBlock({
  code,
  language = "tsx",
  filename,
  highlight = [],
}: CodeBlockProps) {
  const trimmedCode = code.trim();

  return (
    <div className={styles.wrapper}>
      {filename && (
        <div className={styles.header}>
          <span className={styles.filename}>{filename}</span>
          <span className={styles.language}>{language}</span>
        </div>
      )}
      <Highlight theme={themes.github} code={trimmedCode} language={language}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className={styles.pre}>
            <code className={styles.code}>
              {tokens.map((line, i) => {
                const { key: _lineKey, ...lineProps } = getLineProps({ line });
                const isHighlighted = highlight.includes(i + 1);
                return (
                  <div
                    key={i}
                    {...lineProps}
                    className={`${styles.line} ${
                      isHighlighted ? styles.highlighted : ""
                    }`}
                  >
                    <span className={styles.lineNumber}>{i + 1}</span>
                    <span className={styles.lineContent}>
                      {line.map((token, j) => {
                        const { key: _tokenKey, ...tokenProps } = getTokenProps({ token });
                        return <span key={j} {...tokenProps} />;
                      })}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
