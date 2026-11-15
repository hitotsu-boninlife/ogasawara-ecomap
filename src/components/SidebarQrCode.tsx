"use client";
import { useQrCode } from "@/lib/hooks";
import { m } from "@/lib/messages";

export default function SidebarQrCode() {
  const { qrDataUrl, pageUrl } = useQrCode();

  return (
    <div className="shrink-0 flex flex-col items-center gap-2 border-t border-ink/10 px-5 py-4">
      <p className="text-xs font-bold text-ink/50">このマップにアクセス</p>
      {qrDataUrl ? (
        <img src={qrDataUrl} alt="シェア用QRコード" width={200} height={200} className="rounded-lg" />
      ) : (
        <div className="h-[200px] w-[200px] animate-pulse rounded-lg bg-ink/10" />
      )}
      <p className="max-w-full break-all px-1 text-center text-[10px] text-ink/40">{pageUrl}</p>
    </div>
  );
}
