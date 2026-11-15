"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { nearIllustration, spots, toIllust, type LngLat, type Spot } from "@/lib/event";
import { formatDistance } from "@/lib/geo";
import { useGeolocation, useWakeLock } from "@/lib/hooks";
import { m, t } from "@/lib/messages";
import { useStamps } from "@/lib/stamps";
import { checkGps, checkQr } from "@/lib/validate";
import CountryCode from "./CountryCode";
import DrawerMenu from "./DrawerMenu";
import UrlShareModal from "./UrlShareModal";
import RewardPopup from "./RewardPopup";
import Header from "./Header";
import InstallPrompt from "./InstallPrompt";
import PinLegend from "./PinLegend";
import ProximityToast from "./ProximityToast";
import QrScanner from "./QrScanner";
import SpotDetail from "./SpotDetail";
import SidebarQrCode from "./SidebarQrCode";
import StampList from "./StampList";
import Tutorial from "./Tutorial";

const StampMap = dynamic(() => import("./StampMap"), { ssr: false });

export default function App() {
  const { stamps, add } = useStamps();
  useWakeLock();

  const gps = useGeolocation(true);
  const pos = gps.pos;

  const collected = useMemo(() => new Set(Object.keys(stamps)), [stamps]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [recenter, setRecenter] = useState(0);
  const [countryCodeOpen, setCountryCodeOpen] = useState(false);
  const [urlShareOpen, setUrlShareOpen] = useState(false);
  const [stampListOpen, setStampListOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rewardStage, setRewardStage] = useState<1 | 2 | 3 | null>(null);
  const prevCollectedSize = useRef(0);
  useEffect(() => {
    const prev = prevCollectedSize.current;
    const cur = collected.size;
    if (prev === 0 && cur === 1) {
      setRewardStage(1);
    } else if (prev < 5 && cur === 5) {
      setRewardStage(2);
    } else if (prev < spots.length && cur === spots.length) {
      setRewardStage(3);
    }
    prevCollectedSize.current = cur;
  }, [collected.size]);
  const [mapInteracting, setMapInteracting] = useState(false);
  const mapInteractTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onMapTouchStart = useCallback(() => {
    clearTimeout(mapInteractTimer.current);
    setMapInteracting(true);
  }, []);
  const onMapTouchEnd = useCallback(() => {
    clearTimeout(mapInteractTimer.current);
    mapInteractTimer.current = setTimeout(() => setMapInteracting(false), 600);
  }, []);
  useEffect(() => () => clearTimeout(mapInteractTimer.current), []);
  const [hiddenKinds, setHiddenKinds] = useState<Set<string>>(new Set());

  // チュートリアル現在ステップ（null = 非表示）
  const [tutStep, setTutStep] = useState<number | null>(null);
  const handleTutStepChange = useCallback((step: number | null) => {
    setTutStep(step);
    if (step === 2) setSelectedId(spots[0]?.id ?? null); // ナビステップ: ボトムシートを開く
    if (step === 5) setSelectedId(null);                 // スタンプ一覧ステップ: ボトムシートを閉じる
  }, []);

  const toggleKind = useCallback((kind: string) => {
    setHiddenKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind); else next.add(kind);
      return next;
    });
  }, []);

  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const flash = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // ピンのタッチでシートを開閉（同じピンをもう一度タッチで閉じる）
  const toggleSpot = useCallback((id: string) => setSelectedId((cur) => (cur === id ? null : id)), []);

  // ボトムシートのスワイプ操作（モバイル用）
  const sectionRef = useRef<HTMLElement>(null);
  const swipeStartY = useRef(0);

  const onSheetTouchStart = useCallback((e: React.TouchEvent) => {
    swipeStartY.current = e.touches[0].clientY;
  }, []);

  const onSheetTouchMove = useCallback((e: React.TouchEvent) => {
    const el = sectionRef.current;
    if (!el) return;
    const dy = e.touches[0].clientY - swipeStartY.current;
    if (dy > 0) {
      el.style.transition = "none";
      el.style.transform = `translateY(${dy}px)`;
    }
  }, []);

  const onSheetTouchEnd = useCallback((e: React.TouchEvent) => {
    const el = sectionRef.current;
    if (!el) return;
    const dy = e.changedTouches[0].clientY - swipeStartY.current;
    if (dy > 80) {
      el.style.transition = "none";
      el.style.transform = "";
      requestAnimationFrame(() => {
        if (sectionRef.current) sectionRef.current.style.transition = "";
        setSelectedId(null);
      });
    } else {
      el.style.transition = "transform 200ms ease-out";
      el.style.transform = "";
      setTimeout(() => {
        if (sectionRef.current) sectionRef.current.style.transition = "";
      }, 200);
    }
  }, []);

  // 閉じるアニメーション中も内容が消えないよう、最後に開いていたスポットを保持
  const lastSpot = useRef<Spot | null>(null);
  const selected = useMemo(() => spots.find((s) => s.id === selectedId) ?? null, [selectedId]);
  if (selected) lastSpot.current = selected;
  const open = !!selected;
  const view = selected ?? lastSpot.current;

  const viewDone = !!view && collected.has(view.id);
  const result = pos && view ? checkGps(view, pos) : null;
  const complete = collected.size === spots.length;

  const me: LngLat | null = useMemo(() => {
    if (!pos) return null;
    const ll = toIllust(pos);
    return nearIllustration(ll) ? ll : null;
  }, [pos]);

  const stamp = (spot: Spot, method: "gps" | "qr") => {
    add(spot.id, method);
    navigator.vibrate?.(80);
    flash(t(m.toast.stampSuccess, { name: spot.name }));
  };

  const stampByGps = () => {
    if (!selected || result?.status !== "ok" || viewDone) return;
    stamp(selected, "gps");
  };

  const onQr = async (text: string) => {
    setScanning(false);
    try {
      const spot = await checkQr(text, spots);
      if (!spot) return flash(m.toast.qrInvalid);
      if (collected.has(spot.id)) return flash(t(m.toast.alreadyStamped, { name: spot.name }));
      stamp(spot, "qr");
      setSelectedId(spot.id);
    } catch (e) {
      flash(e instanceof Error ? e.message : m.toast.scanFailed);
    }
  };

  const distanceText = result
    ? t(m.map.distance, { distance: formatDistance(result.distanceM) })
    : (gps.error ?? m.gps.loading);

  let note: { text: string; strong: boolean } | null = null;
  if (!viewDone && result?.status === "ok") note = { text: m.note.arrived, strong: true };
  else if (!viewDone && result?.status === "low_accuracy" && pos)
    note = {
      text: t(m.note.lowAccuracy, { accuracy: Math.round(pos.accuracy) }),
      strong: false,
    };

  // マップ操作中は UI を画面外へ退避（ボトムシートが開いている間は発動しない）
  const hideUi = mapInteracting && !open;

  // チュートリアルのフェーズ判定
  const isTutSpotDetailPhase = tutStep !== null && tutStep >= 2 && tutStep <= 4;
  const isTutSidebarPhase    = tutStep !== null && tutStep >= 2 && tutStep <= 5;

  const tutHighlightTarget =
    tutStep === 2 ? "navigate" as const :
    tutStep === 3 ? "stamp" as const :
    tutStep === 4 ? "qr" as const : undefined;

  // チュートリアル中はスポット名を固定表示
  const displayView = isTutSpotDetailPhase && view ? { ...view, name: "ひとつ ~Bonin Life~" } : view;

  const spotDetailProps = displayView ? {
    view: displayView, viewDone, distanceText, note, result,
    onStampByGps: stampByGps,
    onScanQr: () => flash(m.toast.qrUnavailable),
    highlightTarget: tutHighlightTarget,
  } : null;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ink font-sans">
      {/* マップ: モバイルは全画面、デスクトップはサイドバー右側 */}
      {/* step 1: マップコンテナを z-[51] に引き上げてピンのグローをオーバーレイ前面へ */}
      <div
        className={`absolute inset-0 md:left-80${tutStep === 1 ? " z-[51]" : ""}`}
        onTouchStart={onMapTouchStart}
        onTouchEnd={onMapTouchEnd}
      >
        <StampMap
          collected={collected}
          selectedId={selectedId}
          me={me}
          recenterNonce={recenter}
          onSelect={toggleSpot}
          hiddenKinds={hiddenKinds}
          highlightPins={tutStep === 1}
        />
      </div>

      {/* ヘッダー（共通） */}
      {/* step 1: マップが z-[51] になるためヘッダーも z-[52] に引き上げて隠れないようにする */}
      <Header
        collectedCount={collected.size}
        totalCount={spots.length}
        complete={complete}
        className={`transition-transform duration-300 motion-reduce:transition-none md:transition-none${tutStep === 1 ? " z-[52]" : ""}${hideUi ? " -translate-y-[200%]" : ""}`}
      />

      {/* PC: ハンバーガーボタン（マップエリア左上） */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label={m.drawer.openAriaLabel}
        className="hidden md:grid fixed left-[calc(20rem+0.75rem)] top-[max(0.75rem,env(safe-area-inset-top))] z-20 h-10 w-10 place-items-center rounded-full bg-white/90 shadow-md active:opacity-70"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* トースト（共通） */}
      {toast && (
        <p
          role="status"
          aria-live="polite"
          className="absolute inset-x-4 mx-auto max-w-md rounded-2xl bg-ink/90 px-4 py-3 text-center text-sm font-bold text-white shadow-lg top-[calc(max(0.75rem,env(safe-area-inset-top))+5.25rem)] md:top-[calc(max(0.75rem,env(safe-area-inset-top))+8rem)] md:left-80"
        >
          {toast}
        </p>
      )}

      {/* ピン凡例（共通・レスポンシブ） */}
      <PinLegend
        sheetOpen={open}
        hiddenKinds={hiddenKinds}
        onToggle={toggleKind}
        className={`transition-transform duration-300 motion-reduce:transition-none md:transition-none${hideUi ? " -translate-x-[calc(100%+1rem)] md:translate-x-0" : ""}`}
      />

      {/* ─── デスクトップ: 左サイドバー ─── */}
      {/* steps 2-5: aside を z-[51] に引き上げて左パネル要素をオーバーレイ前面へ。
          pointer-events-none でタッチ禁止。steps 2-4 は glow クリップ防止のため overflow-visible */}
      <aside className={`hidden md:flex absolute inset-y-0 left-0 w-80 flex-col bg-paper shadow-xl${isTutSidebarPhase ? ` z-[51] pointer-events-none${isTutSpotDetailPhase ? " overflow-visible" : " overflow-hidden"}` : " z-10 overflow-hidden"}`}>
        {/* ヘッダー分の余白 */}
        <div className="shrink-0 h-[calc(max(0.75rem,env(safe-area-inset-top))+5.5rem)]" />

        {/* ピン選択中: スポット詳細のみ / 未選択: スタンプ一覧のみ */}
        {open ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SpotDetail {...spotDetailProps!} onDeselect={() => setSelectedId(null)} />
          </div>
        ) : (
          <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <StampList stamps={stamps} variant="inline" onSelect={setSelectedId} />
            </div>
            <SidebarQrCode />
          </div>
        )}
      </aside>

      {/* ─── モバイル: ボタン群・ボトムシート ─── */}

      <div className="md:hidden pointer-events-none absolute inset-x-0 bottom-0">
        {/* 右端ボタン群 */}
        <div
          className={`pointer-events-auto absolute right-3 flex flex-col items-end gap-2 transition-transform duration-300 motion-reduce:transition-none${hideUi ? " translate-x-[calc(100%+0.75rem)]" : ""}`}
          style={{ bottom: open ? "calc(100% + 0.75rem)" : "calc(env(safe-area-inset-bottom) + 4.25rem)" }}
        >
          {collected.size >= 5 && (
            <a
              href="/illustration.png"
              download={m.reward.fileName}
              aria-label={m.reward.buttonLabel}
              className="grid h-12 w-12 place-items-center rounded-full bg-stamp text-white shadow-lg active:opacity-80"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 15V3m0 12-4-4m4 4 4-4" />
                <path d="M2 17v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" />
              </svg>
            </a>
          )}
          <button
            onClick={() => setCountryCodeOpen(true)}
            aria-label={m.map.buttons.countryCode}
            className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-lg"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </button>
          <button
            onClick={() => setUrlShareOpen(true)}
            aria-label={m.map.buttons.urlShare}
            className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-lg"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <button
            onClick={() => setStampListOpen(true)}
            aria-label={m.map.buttons.stampList}
            className={`grid h-12 w-12 place-items-center rounded-full bg-white shadow-lg${tutStep === 5 ? " relative z-[51] pointer-events-none tutorial-glow" : ""}`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </button>
          <button
            onClick={() => setRecenter((n) => n + 1)}
            disabled={!me}
            aria-label={m.map.buttons.currentLocation}
            className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-lg disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
          </button>
          {/* ハンバーガーボタン（最下部） */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label={m.drawer.openAriaLabel}
            className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-lg"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* ボトムシート */}
        <section
          ref={sectionRef}
          aria-label="スポットの詳細"
          inert={!open}
          onTouchStart={onSheetTouchStart}
          onTouchMove={onSheetTouchMove}
          onTouchEnd={onSheetTouchEnd}
          className={`grid rounded-t-3xl bg-paper transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr] shadow-[0_-6px_24px_rgb(0,0,0,0.25)]" : "grid-rows-[0fr]"} ${isTutSpotDetailPhase ? "relative z-[51] pointer-events-none" : "pointer-events-auto"}`}
        >
          {/* overflow-hidden はグリッドアニメーション用。
              チュートリアル中はグローがクリッピングされるため外す */}
          <div className={isTutSpotDetailPhase ? "" : "overflow-hidden"}>
            {spotDetailProps && (
              <SpotDetail {...spotDetailProps} onClose={() => setSelectedId(null)} />
            )}
          </div>
        </section>
      </div>

      {/* デスクトップ: 右下ボタン群（カントリーコード + 現在地へ） */}
      <div className="hidden md:flex fixed right-4 bottom-4 z-20 flex-col items-end gap-2">
        {collected.size >= 5 && (
          <a
            href="/illustration.png"
            download={m.reward.fileName}
            className="flex h-12 items-center gap-1.5 rounded-full bg-stamp px-4 text-sm font-bold text-white shadow-lg active:opacity-80"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 15V3m0 12-4-4m4 4 4-4" />
              <path d="M2 17v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" />
            </svg>
            {m.reward.buttonLabel}
          </a>
        )}
        <button
          onClick={() => setCountryCodeOpen(true)}
          className="flex h-12 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold shadow-lg"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6M9 16h4" />
          </svg>
          {m.map.buttons.countryCode}
        </button>
        <button
          onClick={() => setUrlShareOpen(true)}
          className="flex h-12 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold shadow-lg"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          {m.map.buttons.urlShare}
        </button>
        <button
          onClick={() => setRecenter((n) => n + 1)}
          disabled={!me}
          className="flex h-12 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold shadow-lg disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          {m.map.buttons.currentLocation}
        </button>
      </div>

      {/* 共通モーダル・その他 */}
      <ProximityToast
        pos={pos}
        collected={collected}
        onNear={(name) => flash(t(m.toast.proximity, { name }))}
      />
      <StampList open={stampListOpen} onClose={() => setStampListOpen(false)} stamps={stamps} />
      <InstallPrompt
        highlight={tutStep === 6}
        className={
          tutStep === 1 ? "z-[52]" :  // マップが z-[51] になるため上に出す
          tutStep === 6 ? "z-[51]" :  // オーバーレイより前面（ハイライト）
          "z-40"                       // 通常 or 他チュートリアルステップ（オーバーレイより後面）
        }
      />
      <DrawerMenu
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStampList={() => { setDrawerOpen(false); setStampListOpen(true); }}
        onCountryCode={() => { setDrawerOpen(false); setCountryCodeOpen(true); }}
      />
      <CountryCode open={countryCodeOpen} onClose={() => setCountryCodeOpen(false)} />
      <UrlShareModal open={urlShareOpen} onClose={() => setUrlShareOpen(false)} />
      {rewardStage && <RewardPopup stage={rewardStage} remaining={spots.length - 5} onClose={() => setRewardStage(null)} />}
      {scanning && <QrScanner onResult={onQr} onClose={() => setScanning(false)} />}
      <Tutorial onStepChange={handleTutStepChange} />
    </main>
  );
}
