import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { NavWrapper } from "@/components/nav-wrapper";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "교훈창고",
  description: "사업 평가 교훈 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className={`${notoSansKr.className} min-h-full flex flex-col bg-gray-50`}>
        <NavWrapper />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
