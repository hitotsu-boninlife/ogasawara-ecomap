// MapLibre v6 の Worker は別ファイル(ESM)。Next.js のバンドルでは URL 解決に失敗するため、
// public/maplibre/ にコピーして setWorkerUrl() で明示的に指定する（StampMap.tsx 参照）。
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public/maplibre", { recursive: true });
for (const f of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(`node_modules/maplibre-gl/dist/${f}`, `public/maplibre/${f}`);
}
console.log("copied maplibre worker files -> public/maplibre/");

// スタンプラリー景品用マップ画像を public/ へコピー
copyFileSync("assets/illustration.png", "public/illustration.png");
console.log("copied illustration -> public/illustration.png");
