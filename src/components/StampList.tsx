import { spots } from "@/lib/event";
import { m } from "@/lib/messages";
import type { Stamp } from "@/lib/stamps";

const KIND_STYLES = {
  water:   { bg: "#0FF6FF", border: "#00C4CC", clip: "polygon(50% 0%, 70% 20%, 90% 45%, 93% 63%, 83% 83%, 62% 96%, 50% 100%, 38% 96%, 17% 83%, 7% 63%, 10% 45%, 30% 20%)" },
  bottle:  { bg: "#E94A31", border: "#C33020", clip: undefined },
  compost: { bg: "#F690CA", border: "#D060A0", clip: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
  eco:     { bg: "#FFD83A", border: "#D4A800", clip: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" },
} as const;

function KindIcon({ kind }: { kind: string }) {
  const s = KIND_STYLES[kind as keyof typeof KIND_STYLES];
  if (!s) return null;
  return (
    <span
      className="inline-block h-3 w-3 shrink-0"
      style={s.clip
        ? { background: s.bg, clipPath: s.clip }
        : { background: s.bg, borderRadius: "50%", border: `2px solid ${s.border}` }
      }
      aria-hidden="true"
    />
  );
}

type Props = {
  stamps: Record<string, Stamp>;
  /** modal: モーダル表示（モバイル）/ inline: サイドバー内埋め込み（デスクトップ） */
  variant?: "modal" | "inline";
  open?: boolean;
  onClose?: () => void;
  onSelect?: (id: string) => void;
};

function formatDate(at: number) {
  return new Date(at).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StampListContent({ stamps, onSelect }: { stamps: Record<string, Stamp>; onSelect?: (id: string) => void }) {
  const collected = Object.keys(stamps).length;
  return (
    <>
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-center text-lg font-bold text-ink">{m.stampList.title}</h2>
        <p className="mt-1 text-center text-sm text-ink/60">
          <span className="font-bold text-ink">{collected}</span> / {spots.length} {m.stampList.countUnit}
        </p>
      </div>
      <ul className="divide-y divide-ink/10 px-5 pb-2">
        {[...spots].sort((a, b) => a.name.localeCompare(b.name, "ja")).map((spot) => {
          const stamp = stamps[spot.id];
          return (
            <li key={spot.id}>
              <button
                onClick={() => onSelect?.(spot.id)}
                disabled={!onSelect}
                className="flex w-full items-center gap-3 py-3 text-left disabled:cursor-default active:bg-ink/5 rounded-lg"
              >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${
                  stamp ? "border-stamp bg-stamp text-white" : "border-ink/25 bg-transparent text-ink/30"
                }`}
                aria-hidden="true"
              >
                {stamp ? m.bottomSheet.stampedBadge : "未"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <KindIcon kind={spot.kind} />
                  <span className={`truncate text-sm font-bold ${stamp ? "text-ink" : "text-ink/50"}`}>
                    {spot.name}
                  </span>
                </div>
                {stamp && <p className="mt-0.5 text-xs text-ink/50">{formatDate(stamp.at)}</p>}
              </div>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function StampList({ stamps, variant = "modal", open, onClose, onSelect }: Props) {
  if (variant === "inline") {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="overflow-y-auto">
          <StampListContent stamps={stamps} onSelect={onSelect} />
        </div>
      </div>
    );
  }

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={m.stampList.title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="w-full max-w-md rounded-3xl bg-paper shadow-xl">
        <div className="max-h-[65vh] overflow-y-auto">
          <StampListContent stamps={stamps} />
        </div>
        <div className="px-5 pb-6 pt-3">
          <button
            onClick={onClose}
            className="h-12 w-full rounded-2xl bg-ink text-base font-bold text-white active:opacity-80"
          >
            {m.stampList.close}
          </button>
        </div>
      </div>
    </div>
  );
}
