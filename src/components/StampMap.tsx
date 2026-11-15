"use client";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { imageInfo, mapBounds, spots, type LngLat } from "@/lib/event";

/** ボトムシートの高さの目安(px)。ピン選択時に、シートに隠れない位置へ地図を寄せる */
const SHEET_PX = 300;

type Props = {
  collected: Set<string>;
  /** 選択中のピン（ボトムシートが開いているスポット） */
  selectedId: string | null;
  me: LngLat | null;
  /** 値が変わるたびに現在地へ移動 */
  recenterNonce: number;
  onSelect: (id: string) => void;
  /** 非表示にするピン種別 */
  hiddenKinds: Set<string>;
  /** true のとき全ピンにグローリングを表示（チュートリアル用） */
  highlightPins?: boolean;
};

const [[W, S], [E, N]] = mapBounds;

// Worker は public/maplibre/ に置いたものを使う（scripts/copy-maplibre-worker.mjs が配置）
maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

export default function StampMap({ collected, selectedId, me, recenterNonce, onSelect, hiddenKinds, highlightPins }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef(new Map<string, HTMLButtonElement>());
  const meMarker = useRef<maplibregl.Marker | null>(null);
  const cb = useRef({ onSelect });
  cb.current = { onSelect };

  // 地図の初期化（1回だけ）
  useEffect(() => {
    const m = new maplibregl.Map({
      container: box.current!,
      style: {
        version: 8,
        sources: {
          illust: {
            type: "raster",
            tiles: [`${location.origin}/tiles/{z}/{x}/{y}.webp`],
            tileSize: 256,
            minzoom: imageInfo.minzoom,
            maxzoom: imageInfo.maxzoom,
            bounds: [W, S, E, N],
          },
        },
        layers: [
          { id: "bg", type: "background", paint: { "background-color": "#dbe4ec" } },
          { id: "illust", type: "raster", source: "illust", paint: { "raster-fade-duration": 0 } },
        ],
      },
      bounds: mapBounds,
      fitBoundsOptions: { padding: { top: 100, bottom: 90, left: 16, right: 16 } },
      // MapLibreのズームは512pxタイル基準なので、256pxタイルのz値より1小さい
      minZoom: imageInfo.minzoom - 1,
      maxZoom: imageInfo.maxzoom + 1, // タイル最大ズームより先は拡大表示（オーバーズーム）
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    m.touchZoomRotate.disableRotation();
    m.on("moveend", () => {
      const c = m.getCenter();
      const mx = (E - W) * 0.3;
      const my = (N - S) * 0.3;
      const x = Math.min(Math.max(c.lng, W - mx), E + mx);
      const y = Math.min(Math.max(c.lat, S - my), N + my);
      if (x !== c.lng || y !== c.lat) m.easeTo({ center: [x, y], duration: 250 });
    });

    spots.forEach((s, i) => {
      const el = document.createElement("button");
      el.className = `spot spot--${s.kind}`;
      el.textContent = "";
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        cb.current.onSelect(s.id);
      });
      new maplibregl.Marker({ element: el }).setLngLat(s.lngLat).addTo(m);
      markers.current.set(s.id, el);
    });

    map.current = m;
    const refs = markers.current;
    return () => {
      m.remove();
      map.current = null;
      refs.clear();
      meMarker.current = null;
    };
  }, []);

  // マーカーの状態（済 / 選択中）
  useEffect(() => {
    markers.current.forEach((el, id) => {
      const done = collected.has(id);
      const i = spots.findIndex((s) => s.id === id);
      el.classList.toggle("spot--done", done);
      el.classList.toggle("spot--target", id === selectedId);
      el.textContent = done ? "済" : "";
      el.setAttribute("aria-label", `${i + 1} ${spots[i].name}${done ? " スタンプ済み" : ""}`);
      el.setAttribute("aria-pressed", String(id === selectedId));
    });
  }, [collected, selectedId]);

  // チュートリアルハイライト（全ピン一斉に変わるだけなので別 effect で分離）
  useEffect(() => {
    markers.current.forEach((el) => el.classList.toggle("spot--tutorial-glow", !!highlightPins));
  }, [highlightPins]);

  // 種別の表示・非表示
  useEffect(() => {
    markers.current.forEach((el, id) => {
      const spot = spots.find((s) => s.id === id);
      if (spot) el.style.display = hiddenKinds.has(spot.kind) ? "none" : "";
    });
  }, [hiddenKinds]);

  // ピンを選んだら、シートに隠れない位置へ地図を寄せる（閉じたときは動かさない）
  useEffect(() => {
    const m = map.current;
    const spot = spots.find((s) => s.id === selectedId);
    if (!m || !spot) return;
    m.easeTo({ center: spot.lngLat, padding: { top: 90, bottom: SHEET_PX, left: 0, right: 0 }, duration: 400 });
  }, [selectedId]);

  // 現在地
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (!me) {
      meMarker.current?.remove();
      meMarker.current = null;
      return;
    }
    if (!meMarker.current) {
      const el = document.createElement("div");
      el.className = "me";
      meMarker.current = new maplibregl.Marker({ element: el }).setLngLat(me).addTo(m);
    } else {
      meMarker.current.setLngLat(me);
    }
  }, [me]);

  // 「現在地へ」
  const meRef = useRef(me);
  meRef.current = me;
  useEffect(() => {
    if (recenterNonce === 0 || !meRef.current || !map.current) return;
    map.current.easeTo({ center: meRef.current, zoom: Math.max(map.current.getZoom(), 16), duration: 600 });
  }, [recenterNonce]);

  return (
    <div className="absolute inset-0 isolate">
      <div ref={box} className="h-full w-full" />
    </div>
  );
}
