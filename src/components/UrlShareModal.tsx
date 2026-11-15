"use client";
import { useState } from "react";
import { useQrCode } from "@/lib/hooks";
import { m } from "@/lib/messages";

type Props = { open: boolean; onClose: () => void };

export default function UrlShareModal({ open, onClose }: Props) {
  const { qrDataUrl, pageUrl } = useQrCode(open);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={m.urlShare.title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:items-center md:pb-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-paper px-5 py-6 shadow-xl">
        <h2 className="mb-5 text-center text-lg font-bold text-ink">{m.urlShare.title}</h2>

        {/* QRコード */}
        <div className="mb-5 flex justify-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR code" width={200} height={200} className="rounded-xl" />
          ) : (
            // QRコード生成中のプレースホルダー
            <div className="h-[200px] w-[200px] animate-pulse rounded-xl bg-ink/10" />
          )}
        </div>

        {/* URLコピーボタン */}
        <button
          onClick={handleCopy}
          className="mb-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink/10 text-sm font-bold text-ink hover:bg-ink/15 active:bg-ink/20"
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink/60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="text-ink/60">{m.urlShare.copied}</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {m.urlShare.copyButton}
            </>
          )}
        </button>

        <button
          onClick={onClose}
          className="h-12 w-full rounded-2xl bg-ink text-base font-bold text-white active:opacity-80"
        >
          {m.urlShare.close}
        </button>
      </div>
    </div>
  );
}
