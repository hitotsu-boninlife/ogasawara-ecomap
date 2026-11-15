import { m } from "@/lib/messages";

type Props = {
  sheetOpen: boolean;
  hiddenKinds: Set<string>;
  onToggle: (kind: string) => void;
  className?: string;
};

const LEGENDS = [
  { kind: "water",   bg: "#0FF6FF", border: "#00C4CC", clip: "polygon(50% 0%, 70% 20%, 90% 45%, 93% 63%, 83% 83%, 62% 96%, 50% 100%, 38% 96%, 17% 83%, 7% 63%, 10% 45%, 30% 20%)" },
  { kind: "bottle",  bg: "#E94A31", border: "#C33020", clip: undefined },
  { kind: "compost", bg: "#F690CA", border: "#D060A0", clip: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
  { kind: "eco",     bg: "#FFD83A", border: "#D4A800", clip: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" },
] as const;

export default function PinLegend({ sheetOpen, hiddenKinds, onToggle, className = "" }: Props) {
  return (
    <div
      className={[
        // 共通
        "pointer-events-auto absolute rounded-2xl bg-white/90 px-3 py-2.5 shadow-md transition-opacity duration-200",
        // モバイル: 左下、縦並び。ボトムシート表示中は非表示
        "left-3 bottom-[calc(env(safe-area-inset-bottom)+4.25rem)]",
        sheetOpen ? "opacity-0 pointer-events-none" : "opacity-100",
        // デスクトップ: ヘッダー下・中央、横並び。常時表示
        "md:left-[calc(50%+10rem)] md:-translate-x-1/2 md:bottom-auto md:top-[calc(max(0.75rem,env(safe-area-inset-top))+5.75rem)] md:opacity-100 md:pointer-events-auto",
        className,
      ].join(" ")}
    >
      <ul className="space-y-1.5 md:flex md:flex-row md:space-y-0 md:gap-3">
        {LEGENDS.map(({ kind, bg, border, clip }) => {
          const hidden = hiddenKinds.has(kind);
          const label = m.pinLegend[kind];
          return (
            <li key={kind}>
              <button
                onClick={() => onToggle(kind)}
                className={`flex items-center gap-2 text-sm font-medium transition-opacity ${hidden ? "opacity-35" : "opacity-100"}`}
                aria-pressed={!hidden}
                aria-label={`${label}を${hidden ? "表示" : "非表示"}にする`}
              >
                <span
                  className={`inline-block h-4 w-4 shrink-0 ${clip ? "" : "rounded-full border-2"}`}
                  style={{
                    background: hidden ? "#ccc" : bg,
                    borderColor: clip ? undefined : (hidden ? "#aaa" : border),
                    clipPath: clip ?? undefined,
                  }}
                  aria-hidden="true"
                />
                <span className={`text-ink ${hidden ? "line-through" : ""}`}>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
