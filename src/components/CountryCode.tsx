"use client";
import { useState } from "react";
import { m } from "@/lib/messages";

type Props = { open: boolean; onClose: () => void };

export default function CountryCode({ open, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `${m.countryCode.title}\n${m.countryCode.rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={m.countryCode.title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:items-center md:pb-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-paper px-5 py-6 shadow-xl">
        <div className="mb-4 flex items-center justify-center gap-2">
          <h2 className="text-lg font-bold text-ink">{m.countryCode.title}</h2>
          <button
            onClick={handleCopy}
            aria-label={m.countryCode.copyAriaLabel}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/10 text-ink hover:bg-ink/15 active:bg-ink/20"
          >
            {copied ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink/60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
        {copied && (
          <p
            role="status"
            className="toast-fade-out mb-3 rounded-xl bg-ink/8 py-1.5 text-center text-xs font-medium text-ink/60"
            onAnimationEnd={() => setCopied(false)}
          >
            {m.countryCode.copied}
          </p>
        )}
        <ol className="space-y-3">
          {m.countryCode.rules.map((rule, i) => (
            <li key={i} className="flex gap-3 text-sm leading-snug">
              <span className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink/10 text-xs font-bold text-ink">
                {i + 1}
              </span>
              <span className="text-ink">{rule}</span>
            </li>
          ))}
        </ol>
        <button
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-2xl bg-ink text-base font-bold text-white active:opacity-80"
        >
          {m.countryCode.close}
        </button>
      </div>
    </div>
  );
}
