"use client";
import { get, set, del } from "idb-keyval";
import { useCallback, useEffect, useState } from "react";

const KEY = "stamps:v1";
export type Method = "gps" | "qr" | "debug";
export type Stamp = { spotId: string; at: number; method: Method };

/** スタンプ状態を IndexedDB に保存（電波なしでも動く）。将来ここに「未同期キュー」を足してサーバー同期する */
export function useStamps() {
  const [stamps, setStamps] = useState<Record<string, Stamp>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    get<Record<string, Stamp>>(KEY)
      .then((v) => v && setStamps(v))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const add = useCallback((spotId: string, method: Method) => {
    setStamps((prev) => {
      if (prev[spotId]) return prev;
      const next = { ...prev, [spotId]: { spotId, at: Date.now(), method } };
      set(KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStamps({});
    del(KEY).catch(() => {});
  }, []);

  return { stamps, ready, add, reset };
}
