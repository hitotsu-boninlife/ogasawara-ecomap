"use client";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import type { Pos } from "./validate";

import { m } from "./messages";

const ERRORS: Record<number, string> = {
  1: m.gps.denied,
  2: m.gps.unavailable,
  3: m.gps.timeout,
};

/** 高精度GPSを監視。電波(モバイル回線)がなくてもGPS自体は動く */
export function useGeolocation(enabled: boolean) {
  const [pos, setPos] = useState<Pos | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!("geolocation" in navigator)) {
      setError(m.gps.unsupported);
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy });
        setError(null);
      },
      (e) => setError(ERRORS[e.code] ?? "位置情報エラー"),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled]);

  return { pos, error };
}

/** 現在ページのQRコード画像URLを生成する。enabled=false のときは生成しない */
export function useQrCode(enabled = true) {
  const [pageUrl, setPageUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (!enabled || !pageUrl) return;
    QRCode.toDataURL(pageUrl, {
      width: 240,
      margin: 2,
      color: { dark: "#1c2f4a", light: "#f6f8fa" },
    }).then(setQrDataUrl);
  }, [enabled, pageUrl]);

  return { qrDataUrl, pageUrl };
}

/** 歩きながら使うので画面の自動消灯を防ぐ（非対応端末では何もしない） */
export function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        lock = (await navigator.wakeLock?.request("screen")) ?? null;
      } catch {}
    };
    const onVisible = () => document.visibilityState === "visible" && request();
    request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, []);
}
