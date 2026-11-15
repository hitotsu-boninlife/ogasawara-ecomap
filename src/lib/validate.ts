// スタンプ判定。GPS と QR は独立したバリデータで、どちらでも押せる。
// ※ 端末内だけの判定は解析すれば偽装できる。景品が絡む場合はサーバー検証を併用すること。
import { gpsMaxAccuracyM, type LatLng, type Spot } from "./event";
import { m } from "./messages";
import { haversine } from "./geo";

export type Pos = LatLng & { accuracy: number };
export type GpsResult = {
  status: "ok" | "too_far" | "low_accuracy";
  distanceM: number;
};

export function checkGps(spot: Spot, pos: Pos): GpsResult {
  const distanceM = haversine(pos, spot.real);
  // 誤差を最大限見積もっても届かない → 明らかに遠い
  if (distanceM > spot.radiusM + pos.accuracy) return { status: "too_far", distanceM };
  // 近そうだが精度が悪く判定できない → 保留
  if (pos.accuracy > gpsMaxAccuracyM) return { status: "low_accuracy", distanceM };
  return { status: distanceM <= spot.radiusM ? "ok" : "too_far", distanceM };
}

async function sha256Hex(text: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error(m.validation.requiresHttps);
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** QRの中身は "stamp:<spotId>:<secret>"。アプリは secret のハッシュだけを持つのでオフラインでも照合できる */
export async function checkQr(text: string, all: Spot[]): Promise<Spot | null> {
  const match = /^stamp:([^:]+):(.+)$/.exec(text.trim());
  if (!match) return null;
  const spot = all.find((s) => s.id === match[1]);
  if (!spot || !spot.qrHash) return null;
  return (await sha256Hex(match[2])) === spot.qrHash ? spot : null;
}
