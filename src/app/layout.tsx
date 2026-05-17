import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dev Docs - 프론트엔드 교육 가이드",
  description: "후임 개발자를 위한 프론트엔드 핵심 개념 정리",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
