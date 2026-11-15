// 各スポットの QR コードを生成する。
//  - 秘密文字列(ランダム)を qr/secrets.json に保存（git管理しない・印刷用QRの元）
//  - その SHA-256 だけを src/data/event.json の qrHash に書き込む（アプリ側はハッシュしか持たない）
//  - qr/<spotId>.png を出力（QRの中身: stamp:<spotId>:<secret>）
import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import QRCode from "qrcode";

const eventPath = "src/data/event.json";
const secretsPath = "qr/secrets.json";
const ev = JSON.parse(readFileSync(eventPath, "utf8"));
const secrets = existsSync(secretsPath) ? JSON.parse(readFileSync(secretsPath, "utf8")) : {};
mkdirSync("qr", { recursive: true });

for (const s of ev.spots) {
  secrets[s.id] ??= randomBytes(16).toString("hex");
  s.qrHash = createHash("sha256").update(secrets[s.id]).digest("hex");
  await QRCode.toFile(`qr/${s.id}.png`, `stamp:${s.id}:${secrets[s.id]}`, { width: 600, margin: 2 });
}
writeFileSync(secretsPath, JSON.stringify(secrets, null, 2));
writeFileSync(eventPath, JSON.stringify(ev, null, 2));
console.log(`QR ${ev.spots.length}枚を qr/ に出力、qrHash を更新しました`);
