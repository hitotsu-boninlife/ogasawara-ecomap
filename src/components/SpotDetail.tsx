import { type Spot } from "@/lib/event";
import { m } from "@/lib/messages";
import { type GpsResult } from "@/lib/validate";
import QrIcon from "./QrIcon";

const navUrl = (s: Spot) =>
  `https://www.google.com/maps/dir/?api=1&destination=${s.real.lat},${s.real.lng}&travelmode=walking&dir_action=navigate`;

type Props = {
  view: Spot;
  viewDone: boolean;
  distanceText: string;
  note: { text: string; strong: boolean } | null;
  result: GpsResult | null;
  /** 渡した場合はドラッグハンドル付きで描画（モバイルのボトムシート用） */
  onClose?: () => void;
  /** 渡した場合はスポット名右に×ボタンを表示（デスクトップサイドバー用） */
  onDeselect?: () => void;
  onStampByGps: () => void;
  onScanQr: () => void;
  /** チュートリアル用グローハイライト対象 */
  highlightTarget?: "navigate" | "stamp" | "qr";
};

export default function SpotDetail({
  view, viewDone, distanceText, note, result, onClose, onDeselect, onStampByGps, onScanQr, highlightTarget,
}: Props) {
  return (
    <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {onClose && (
        <button onClick={onClose} aria-label={m.bottomSheet.closeAriaLabel} className="mx-auto block h-7 w-20">
          <span className="mx-auto block h-1.5 w-10 rounded-full bg-ink/25" />
        </button>
      )}

      <div className="flex items-center gap-2">
        <h2 className="min-w-0 flex-1 truncate text-xl font-bold leading-tight">{view.name}</h2>
        {viewDone && (
          <span
            role="img"
            aria-label="スタンプ済み"
            className="grid h-10 w-10 shrink-0 -rotate-12 place-items-center rounded-full border-[3px] border-stamp text-lg font-bold text-stamp"
          >
            {m.bottomSheet.stampedBadge}
          </span>
        )}
        {onDeselect && (
          <button
            onClick={onDeselect}
            aria-label={m.bottomSheet.closeAriaLabel}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink/40 hover:bg-ink/5 active:bg-ink/10"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <p className="mt-1 text-sm" role="status" aria-live="polite">
        {distanceText}
      </p>
      {note && (
        <p className={`mt-1 text-sm ${note.strong ? "font-bold text-stamp" : ""}`}>{note.text}</p>
      )}

      <a
        href={navUrl(view)}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-3 flex h-12 items-center justify-center rounded-2xl border-2 border-ink text-base font-bold active:bg-ink/10${highlightTarget === "navigate" ? " tutorial-glow" : ""}`}
      >
        {m.bottomSheet.navigate}
      </a>

      <div className="mt-2 flex gap-2">
        <button
          onClick={onStampByGps}
          disabled={result?.status !== "ok" || viewDone}
          className={`h-14 min-w-0 flex-1 rounded-2xl bg-stamp text-lg font-bold text-white active:bg-stamp-dark disabled:bg-ink/20 disabled:text-ink/50${highlightTarget === "stamp" ? " tutorial-glow" : ""}`}
        >
          {viewDone ? m.bottomSheet.stamped : m.bottomSheet.stamp}
        </button>
        <button
          onClick={onScanQr}
          aria-label="QRコードで押す（現在ご利用いただけません）"
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-ink/30 text-ink/30${highlightTarget === "qr" ? " tutorial-glow" : ""}`}
        >
          <QrIcon />
        </button>
      </div>
    </div>
  );
}
