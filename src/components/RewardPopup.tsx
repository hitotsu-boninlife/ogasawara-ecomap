"use client";
import { useEffect, useState } from "react";
import { m, t } from "@/lib/messages";

// ピン種別に対応した4種のSVG形状
function WaterDrop() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <polygon points="12,0 16.8,4.8 21.6,10.8 22.3,15.1 19.9,19.9 14.9,23 12,24 9.1,23 4.1,19.9 1.7,15.1 2.4,10.8 7.2,4.8" fill="#0FF6FF" />
    </svg>
  );
}
function Circle() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#E94A31" />
    </svg>
  );
}
function DiamondShape() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <polygon points="12,1 23,12 12,23 1,12" fill="#F690CA" />
    </svg>
  );
}
function StarShape() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <polygon points="12,1 15,9 23,9 17,14 19,22 12,17 5,22 7,14 1,9 9,9" fill="#FFD83A" />
    </svg>
  );
}

const SHAPES = [WaterDrop, Circle, DiamondShape, StarShape];

const PETALS: { shapeIndex: number; left: string; delay: string; duration: string; size: string }[] = [
  // 第1波（delay 0〜0.9s）
  { shapeIndex: 0, left: "2%",  delay: "0.0s", duration: "2.2s", size: "1.6rem" },
  { shapeIndex: 1, left: "7%",  delay: "0.3s", duration: "2.7s", size: "1.4rem" },
  { shapeIndex: 2, left: "12%", delay: "0.1s", duration: "2.0s", size: "1.2rem" },
  { shapeIndex: 3, left: "17%", delay: "0.6s", duration: "2.5s", size: "1.5rem" },
  { shapeIndex: 0, left: "22%", delay: "0.2s", duration: "2.3s", size: "1.3rem" },
  { shapeIndex: 1, left: "27%", delay: "0.5s", duration: "2.6s", size: "1.1rem" },
  { shapeIndex: 2, left: "32%", delay: "0.0s", duration: "2.1s", size: "1.7rem" },
  { shapeIndex: 3, left: "37%", delay: "0.8s", duration: "2.4s", size: "1.0rem" },
  { shapeIndex: 0, left: "42%", delay: "0.4s", duration: "2.7s", size: "1.5rem" },
  { shapeIndex: 1, left: "47%", delay: "0.1s", duration: "2.2s", size: "1.3rem" },
  { shapeIndex: 2, left: "52%", delay: "0.7s", duration: "2.9s", size: "1.2rem" },
  { shapeIndex: 3, left: "57%", delay: "0.3s", duration: "2.4s", size: "1.6rem" },
  { shapeIndex: 0, left: "62%", delay: "0.9s", duration: "2.6s", size: "1.4rem" },
  { shapeIndex: 1, left: "67%", delay: "0.2s", duration: "2.1s", size: "1.0rem" },
  { shapeIndex: 2, left: "72%", delay: "0.6s", duration: "2.8s", size: "1.5rem" },
  { shapeIndex: 3, left: "77%", delay: "0.4s", duration: "2.3s", size: "1.2rem" },
  { shapeIndex: 0, left: "82%", delay: "0.0s", duration: "2.5s", size: "1.4rem" },
  { shapeIndex: 1, left: "87%", delay: "0.8s", duration: "2.0s", size: "1.1rem" },
  { shapeIndex: 2, left: "92%", delay: "0.5s", duration: "2.7s", size: "1.6rem" },
  { shapeIndex: 3, left: "97%", delay: "0.2s", duration: "2.3s", size: "1.3rem" },
  // 第2波（delay 1.0〜1.9s）
  { shapeIndex: 1, left: "4%",  delay: "1.1s", duration: "2.4s", size: "1.3rem" },
  { shapeIndex: 2, left: "10%", delay: "1.4s", duration: "2.1s", size: "1.5rem" },
  { shapeIndex: 3, left: "15%", delay: "1.0s", duration: "2.6s", size: "1.2rem" },
  { shapeIndex: 0, left: "20%", delay: "1.7s", duration: "2.3s", size: "1.6rem" },
  { shapeIndex: 1, left: "25%", delay: "1.2s", duration: "2.8s", size: "1.1rem" },
  { shapeIndex: 2, left: "35%", delay: "1.5s", duration: "2.0s", size: "1.4rem" },
  { shapeIndex: 3, left: "44%", delay: "1.0s", duration: "2.5s", size: "1.7rem" },
  { shapeIndex: 0, left: "50%", delay: "1.8s", duration: "2.2s", size: "1.2rem" },
  { shapeIndex: 1, left: "55%", delay: "1.3s", duration: "2.7s", size: "1.5rem" },
  { shapeIndex: 2, left: "60%", delay: "1.6s", duration: "2.4s", size: "1.0rem" },
  { shapeIndex: 3, left: "70%", delay: "1.1s", duration: "2.9s", size: "1.3rem" },
  { shapeIndex: 0, left: "75%", delay: "1.9s", duration: "2.1s", size: "1.6rem" },
  { shapeIndex: 1, left: "80%", delay: "1.4s", duration: "2.6s", size: "1.2rem" },
  { shapeIndex: 2, left: "85%", delay: "1.0s", duration: "2.3s", size: "1.4rem" },
  { shapeIndex: 3, left: "90%", delay: "1.7s", duration: "2.5s", size: "1.1rem" },
  { shapeIndex: 0, left: "95%", delay: "1.2s", duration: "2.8s", size: "1.5rem" },
  // 第3波（delay 2.0〜2.9s）
  { shapeIndex: 3, left: "5%",  delay: "2.0s", duration: "2.3s", size: "1.4rem" },
  { shapeIndex: 0, left: "13%", delay: "2.4s", duration: "2.6s", size: "1.2rem" },
  { shapeIndex: 1, left: "23%", delay: "2.1s", duration: "2.0s", size: "1.6rem" },
  { shapeIndex: 2, left: "33%", delay: "2.7s", duration: "2.4s", size: "1.1rem" },
  { shapeIndex: 3, left: "43%", delay: "2.2s", duration: "2.8s", size: "1.5rem" },
  { shapeIndex: 0, left: "53%", delay: "2.5s", duration: "2.2s", size: "1.3rem" },
  { shapeIndex: 1, left: "63%", delay: "2.0s", duration: "2.7s", size: "1.7rem" },
  { shapeIndex: 2, left: "73%", delay: "2.3s", duration: "2.1s", size: "1.2rem" },
  { shapeIndex: 3, left: "83%", delay: "2.6s", duration: "2.5s", size: "1.4rem" },
  { shapeIndex: 0, left: "93%", delay: "2.9s", duration: "2.3s", size: "1.0rem" },
];

type Props = { stage: 1 | 2 | 3; remaining: number; onClose: () => void };

export default function RewardPopup({ stage, remaining, onClose }: Props) {
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: m.reward.shareTitle,
        text: m.reward.shareText,
        url: window.location.href,
      });
    } catch {
      // キャンセルまたはエラー
    }
  };

  const title =
    stage === 1 ? m.reward.stage1Title :
    stage === 2 ? m.reward.stage5Title :
    m.reward.completeTitle;

  const body =
    stage === 1 ? m.reward.stage1Body :
    stage === 2 ? t(m.reward.stage5Body, { remaining }) :
    m.reward.completeBody;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* フラワーシャワー（ステージ2・3のみ） */}
      {stage !== 1 && PETALS.map((p, i) => {
        const Shape = SHAPES[p.shapeIndex];
        return (
          <span
            key={i}
            className="pointer-events-none fixed top-0"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animation: `flower-fall ${p.duration} ${p.delay} ease-in forwards`,
            }}
          >
            <Shape />
          </span>
        );
      })}

      {/* ポップアップカード */}
      <div className="reward-popup-in relative w-full max-w-sm overflow-hidden rounded-3xl bg-paper shadow-2xl">
        {/* カラー帯 */}
        <div className="bg-stamp px-6 pb-6 pt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            {stage === 1 && (
              /* プレゼントボックス：報酬をほのめかす */
              <svg viewBox="0 0 24 24" className="h-9 w-9 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 12v10H4V12" />
                <path d="M22 7H2v5h20V7z" />
                <path d="M12 22V7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            )}
            {stage === 2 && (
              /* ダウンロード */
              <svg viewBox="0 0 24 24" className="h-9 w-9 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 15V3m0 12-4-4m4 4 4-4" />
                <path d="M2 17v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" />
              </svg>
            )}
            {stage === 3 && (
              /* シェア */
              <svg viewBox="0 0 24 24" className="h-9 w-9 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            )}
          </div>
          <h2 className="mt-3 text-2xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-white/80">{body}</p>
        </div>

        {/* ボタン */}
        <div className="flex flex-col gap-3 px-6 py-6">
          {stage === 2 && (
            <a
              href="/illustration.png"
              download={m.reward.fileName}
              onClick={onClose}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-stamp text-base font-bold text-white active:opacity-80"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 15V3m0 12-4-4m4 4 4-4" />
                <path d="M2 17v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" />
              </svg>
              {m.reward.buttonLabel}
            </a>
          )}
          {stage === 3 && canShare && (
            <button
              onClick={handleShare}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-stamp text-base font-bold text-white active:opacity-80"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {m.reward.shareButton}
            </button>
          )}
          <button
            onClick={onClose}
            className="h-12 w-full rounded-2xl border-2 border-ink/20 text-sm font-bold text-ink/60 active:bg-ink/5"
          >
            {m.reward.closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
