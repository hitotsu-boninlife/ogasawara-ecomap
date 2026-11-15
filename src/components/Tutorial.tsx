"use client";
import { useEffect, useState } from "react";
import { STEPS, TUTORIAL_KEY } from "@/lib/tutorial";

type Props = {
  onStepChange?: (step: number | null) => void;
};

export default function Tutorial({ onStepChange }: Props) {
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    if (!localStorage.getItem(TUTORIAL_KEY)) setStep(0);
  }, []);

  // ステップ変化を親へ通知（ハイライト制御に使用）
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  const completeTutorial = () => localStorage.setItem(TUTORIAL_KEY, "1");

  const advance = () =>
    setStep((prev) => {
      if (prev === null) return null;
      const next = prev + 1;
      if (next >= STEPS.length) { completeTutorial(); return null; }
      return next;
    });

  const skip = () => { completeTutorial(); setStep(null); };

  if (step === null || step >= STEPS.length) return null;

  const curr = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* 全操作ブロック用の背景ディム（z-50）*/}
      <div className="fixed inset-0 z-50 bg-ink/50 pointer-events-auto" />

      {/* チュートリアルカード（z-[52]: ハイライト要素 z-[51] より前面）*/}
      <div className="fixed inset-0 z-[52] pointer-events-none">
        <div
          className={[
            "pointer-events-auto absolute bg-paper",
            curr.cardAtTop
              // ボトムシートが開いているステップ: ヘッダー下に浮かせて表示
              ? "inset-x-4 max-w-sm md:right-auto rounded-3xl px-5 py-4 shadow-xl top-[calc(max(0.75rem,env(safe-area-inset-top))+4.75rem)] md:left-[calc(1rem+20rem)]"
              // 通常: 下部シート型
              : "inset-x-0 bottom-0 rounded-t-3xl px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgb(0,0,0,0.2)] md:left-80 md:right-auto md:max-w-sm",
          ].join(" ")}
        >
          {/* 進捗ドット + スキップ */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-5 bg-stamp"
                      : i < step
                      ? "w-1.5 bg-stamp/40"
                      : "w-1.5 bg-ink/15"
                  }`}
                />
              ))}
            </div>
            <button onClick={skip} className="text-sm text-ink/40 active:text-ink/70">
              スキップ
            </button>
          </div>

          <h2 className="text-xl font-bold text-ink">{curr.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">{curr.body}</p>

          <button
            onClick={advance}
            className="mt-4 h-12 w-full rounded-2xl bg-stamp text-base font-bold text-white active:bg-stamp-dark"
          >
            {isLast ? "はじめる" : "次へ"}
          </button>
        </div>
      </div>
    </>
  );
}
