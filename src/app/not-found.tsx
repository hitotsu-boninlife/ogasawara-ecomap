import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 | Ogasawara ECO MAP",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <p className="text-8xl font-bold text-white/20">404</p>
      <p className="mt-4 text-lg font-bold text-white">お探しのページは見つかりませんでした。</p>
      <Link
        href="/"
        className="mt-8 flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-ink active:opacity-80"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12L12 3l9 9" />
          <path d="M9 21V12h6v9" />
        </svg>
        マップに戻る
      </Link>
    </div>
  );
}
