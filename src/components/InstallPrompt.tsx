"use client";
import { useEffect, useState } from "react";
import { m } from "@/lib/messages";

// beforeinstallprompt は標準の TypeScript 型定義にないため独自定義
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "pwa-install-dismissed";

export default function InstallPrompt({ highlight, className = "" }: { highlight?: boolean; className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios) {
      setIsIos(true);
      setCanInstall(true);
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  if (!canInstall) return null;

  return (
    <>
      {/* 右上の常時表示アイコン */}
      <button
        onClick={isIos ? () => setShow(true) : handleInstall}
        aria-label={m.installPrompt.title}
        className={`fixed top-[max(0.75rem,env(safe-area-inset-top))] right-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-md active:opacity-70 ${className}${highlight ? " tutorial-glow" : ""}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      {/* カプセル型通知（初回表示 or アイコンタップ後） */}
      {show && (
        <div className="fixed top-[calc(max(0.75rem,env(safe-area-inset-top))+4.25rem)] left-1/2 z-40 -translate-x-1/2 whitespace-nowrap md:top-[calc(max(0.75rem,env(safe-area-inset-top))+7.25rem)] md:left-[calc(50%+10rem)]">
          <div className="flex items-center gap-2 rounded-full bg-white/95 py-2 pl-4 pr-2 shadow-lg">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>

            {isIos ? (
              <span className="text-sm font-medium text-ink">{m.installPrompt.iosInstruction}</span>
            ) : (
              <>
                <span className="text-sm font-medium text-ink">{m.installPrompt.title}</span>
                <button
                  onClick={handleInstall}
                  className="rounded-full bg-ink px-3 py-1 text-sm font-bold text-white active:opacity-80"
                >
                  {m.installPrompt.install}
                </button>
              </>
            )}

            <button
              onClick={handleDismiss}
              aria-label={m.installPrompt.closeAriaLabel}
              className="grid h-7 w-7 place-items-center rounded-full text-ink/40 hover:bg-ink/10 active:bg-ink/10"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
