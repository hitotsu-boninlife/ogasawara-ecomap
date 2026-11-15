"use client";
import Link from "next/link";
import { m } from "@/lib/messages";

const INSTAGRAM_URL = "https://www.instagram.com/hitotsuboninlife";
const TERMS_URL = "/terms";
const PRIVACY_URL = "/privacy";

type Props = {
  open: boolean;
  onClose: () => void;
  onStampList: () => void;
  onCountryCode: () => void;
};

export default function DrawerMenu({ open, onClose, onStampList, onCountryCode }: Props) {
  return (
    <>
      {/* タップで閉じるオーバーレイ */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-ink/40 transition-opacity duration-300 motion-reduce:transition-none ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* ドロワー本体: モバイルは右から、PC は左から */}
      <nav
        aria-label="メニュー"
        inert={!open}
        className={`fixed inset-y-0 z-40 flex w-72 flex-col bg-paper shadow-xl transition-transform duration-300 motion-reduce:transition-none right-0 md:right-auto md:left-0 ${open ? "translate-x-0" : "translate-x-full md:-translate-x-full"
          }`}
      >
        {/* セーフエリア + 団体名 + 閉じるボタン */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <p className="text-base font-bold text-ink">{m.footer.orgName}</p>
          <button
            onClick={onClose}
            aria-label={m.drawer.closeAriaLabel}
            className="grid h-10 w-10 place-items-center rounded-full text-ink/40 hover:bg-ink/5 active:bg-ink/10"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 上部: Instagram・カントリーコード */}
        <div className="flex-1 px-4 pt-2">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-ink/5 active:bg-ink/10"
          >
            {/* Instagram ロゴ（簡略 SVG） */}
            <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <span className="font-medium text-ink">{m.drawer.instagram}</span>
          </a>
          <button
            onClick={onCountryCode}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 hover:bg-ink/5 active:bg-ink/10"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
            <span className="font-medium text-ink">{m.map.buttons.countryCode}</span>
          </button>
          <button
            onClick={onStampList}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 hover:bg-ink/5 active:bg-ink/10"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span className="font-medium text-ink">{m.map.buttons.stampList}</span>
          </button>
        </div>

        {/* 下部: 利用規約・プライバシーポリシー・コピーライト */}
        <div className="shrink-0 space-y-3 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-4 text-sm">
            <Link href={TERMS_URL} className="text-ink/50 hover:text-ink active:text-ink">
              {m.drawer.terms}
            </Link>
            <Link href={PRIVACY_URL} className="text-ink/50 hover:text-ink active:text-ink">
              {m.drawer.privacy}
            </Link>
          </div>
          <p className="text-xs text-ink/40">{m.footer.copyright}</p>
        </div>
      </nav>
    </>
  );
}
