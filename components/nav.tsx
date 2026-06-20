"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "대시보드" },
  { href: "/lessons", label: "교훈 목록" },
  { href: "/report", label: "분석 리포트" },
  { href: "/lessons/new", label: "새 교훈 입력" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 shadow-sm backdrop-blur-sm transition-all">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-10">
        <Link href="/" className="text-xl font-bold text-primary">
          교훈창고
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
