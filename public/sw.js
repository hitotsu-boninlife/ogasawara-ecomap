// 手書きの最小 Service Worker。
//  - /tiles/ ... キャッシュ優先（オフライン準備で事前取得、なければ取得して保存）
//  - ページ遷移 ... ネットワーク優先、失敗したらキャッシュした "/" を返す
//  - その他の同一オリジン静的ファイル ... キャッシュ優先＋裏で更新
// アプリを更新したら VERSION を上げる（古いシェルキャッシュを破棄する）。
const VERSION = "v1";
const SHELL = `shell-${VERSION}`;
const TILES = "tiles-v1"; // src/lib/offline.ts と揃える

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(SHELL)
      .then((c) =>
        c.addAll([
          "/",
          "/manifest.webmanifest",
          "/icons/icon-192.png",
          "/maplibre/maplibre-gl-worker.mjs",
          "/maplibre/maplibre-gl-shared.mjs",
        ]),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("shell-") && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;

  if (url.pathname.startsWith("/tiles/")) {
    e.respondWith(
      caches.open(TILES).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || caches.match("/"))),
    );
    return;
  }

  e.respondWith(
    caches.open(SHELL).then(async (cache) => {
      const hit = await cache.match(req);
      const net = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit || net;
    }),
  );
});
