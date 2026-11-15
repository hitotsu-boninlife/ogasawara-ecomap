// 電波が弱い場所に備えて、全タイルを事前にキャッシュへ保存する。
// キャッシュ名は public/sw.js と揃えること。
export const TILE_CACHE = "tiles-v1";

export async function precacheTiles(onProgress: (done: number, total: number) => void) {
  const urls: string[] = await (await fetch("/tiles/manifest.json", { cache: "no-store" })).json();
  const cache = await caches.open(TILE_CACHE);
  const queue = [...urls];
  let done = 0;
  const worker = async () => {
    for (let u = queue.pop(); u; u = queue.pop()) {
      if (!(await cache.match(u))) await cache.add(u).catch(() => {});
      onProgress(++done, urls.length);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
}
