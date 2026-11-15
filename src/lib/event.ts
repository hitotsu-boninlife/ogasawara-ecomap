// イベント定義(src/data/event.json)の読み込みと、実座標⇔イラスト座標の変換。
// ・スタンプ判定は「実座標(real)」で行う  ← イラストが歪んでいても影響しない
// ・地図への表示は「イラスト座標(架空の緯度経度)」で行う ← 変換は表示専用
import raw from "@/data/event.json";
import { fitTPS, type Pt } from "./warp";

export type LatLng = { lat: number; lng: number };
export type LngLat = [number, number];
export type SpotKind = "water" | "bottle" | "compost" | "eco";
export type Spot = {
  id: string;
  name: string;
  real: LatLng;
  radiusM: number;
  kind: SpotKind;
  qrHash: string;
  /** イラスト上の表示位置（架空の経緯度） */
  lngLat: LngLat;
};

const img = raw.image;
const B = img.bounds;

export const eventName = raw.name;
export const imageInfo = img;
export const gpsMaxAccuracyM = raw.gpsMaxAccuracyM;
export const mapBounds: [LngLat, LngLat] = [
  [B.west, B.south],
  [B.east, B.north],
];

/** 画像ピクセル → 架空の経緯度（画像は bounds に線形に貼られている） */
export function pxToLngLat(px: number[]): LngLat {
  return [
    B.west + (px[0] / img.width) * (B.east - B.west),
    B.north - (px[1] / img.height) * (B.north - B.south),
  ];
}

export const spots: Spot[] = raw.spots.map((s) => ({
  id: s.id,
  name: s.name,
  real: s.real,
  radiusM: s.radiusM,
  kind: s.kind as SpotKind,
  qrHash: s.qrHash,
  lngLat: pxToLngLat(s.px),
}));

// 実座標は最初のスポットを原点とした東西/南北メートルに直してから変換する
const origin = raw.spots[0].real;
const KX = 111320 * Math.cos((origin.lat * Math.PI) / 180);
const KY = 110574;
const toM = (p: LatLng): Pt => [(p.lng - origin.lng) * KX, (p.lat - origin.lat) * KY];
const fromM = ([x, y]: Pt): LatLng => ({ lng: origin.lng + x / KX, lat: origin.lat + y / KY });

// 基準点 = 全スポット + 追加の基準点
const controls = [...raw.spots, ...raw.extraControlPoints];
const realPts = controls.map((c) => toM(c.real));
const illPts = controls.map((c) => pxToLngLat(c.px) as Pt);
const real2ill = fitTPS(realPts, illPts);
const ill2real = fitTPS(illPts, realPts);

/** 現在地(実座標) → イラスト上の位置 */
export const toIllust = (p: LatLng): LngLat => real2ill(toM(p));
/** イラスト上の位置 → 実座標（デバッグの擬似現在地用） */
export const toReal = (ll: LngLat): LatLng => fromM(ill2real(ll));

/** イラスト範囲（+余白）の内側か。外挿が暴れる遠方では青い点を出さない */
export function nearIllustration(ll: LngLat, margin = 0.15): boolean {
  const mx = (B.east - B.west) * margin;
  const my = (B.north - B.south) * margin;
  return ll[0] >= B.west - mx && ll[0] <= B.east + mx && ll[1] >= B.south - my && ll[1] <= B.north + my;
}
