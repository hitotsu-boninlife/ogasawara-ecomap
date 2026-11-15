"use client";
import { useEffect } from "react";
import { precacheTiles } from "@/lib/offline";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then(async () => {
        // 初回表示で読み込んだJS/CSSも、次回のオフライン起動用にシェルキャッシュへ保存する
        const cache = await caches.open("shell-v1");
        const urls = performance
          .getEntriesByType("resource")
          .map((r) => r.name)
          .filter((u) => u.startsWith(location.origin + "/_next/static/"));
        for (const u of urls) {
          if (!(await cache.match(u))) await cache.add(u).catch(() => {});
        }
        // 電波が入らない場所に備えて、地図タイルを裏で全部保存しておく（データセーバー時はスキップ）
        const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        if (!conn?.saveData) await precacheTiles(() => {});
      })
      .catch(() => {});
  }, []);
  return null;
}
