"use client";
import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";
import { m } from "@/lib/messages";

type Props = { onResult: (text: string) => void; onClose: () => void };

/** カメラでQRを読み取る（iOS Safari でも動くよう jsQR を使用。BarcodeDetector は使わない） */
export default function QrScanner({ onResult, onClose }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const done = useRef(onResult);
  done.current = onResult;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        const v = video.current!;
        v.srcObject = stream;
        await v.play();
        let last = 0;
        const tick = (t: number) => {
          if (stopped) return;
          if (t - last > 100 && v.videoWidth) {
            last = t;
            const scale = Math.min(1, 640 / v.videoWidth);
            canvas.width = v.videoWidth * scale;
            canvas.height = v.videoHeight * scale;
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(img.data, img.width, img.height);
            if (code?.data) {
              stopped = true;
              done.current(code.data);
              return;
            }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setError(m.qrScanner.cameraError);
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black" role="dialog" aria-label={m.qrScanner.dialogAriaLabel}>
      <div className="relative flex-1 overflow-hidden">
        <video ref={video} className="h-full w-full object-cover" playsInline muted />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-60 w-60 rounded-3xl border-4 border-white/90" />
        </div>
        {error && <p className="absolute inset-x-4 top-24 rounded-xl bg-white p-4 text-sm font-medium">{error}</p>}
      </div>
      <div className="space-y-3 bg-ink p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-white">
        <p className="text-center text-sm">{m.qrScanner.instruction}</p>
        <div className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder={m.qrScanner.placeholder}
            className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-3 text-sm placeholder:text-white/50"
          />
          <button
            onClick={() => manual && onResult(manual)}
            className="rounded-xl bg-white/15 px-4 text-sm font-bold disabled:opacity-40"
            disabled={!manual}
          >
            {m.qrScanner.submit}
          </button>
        </div>
        <button onClick={onClose} className="h-14 w-full rounded-2xl bg-white text-lg font-bold text-ink">
          {m.qrScanner.close}
        </button>
      </div>
    </div>
  );
}
