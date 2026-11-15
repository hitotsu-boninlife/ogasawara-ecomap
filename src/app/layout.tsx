import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "マイボトルを持ち歩こう！｜Ogasawara ECO MAP",
  description: "父島のエコな場所をまとめたマップです。マイボトルを持ち歩こう！",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "ECO MAP", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/site-logo.png", type: "image/png" }],
    apple: [{ url: "/site-logo.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "マイボトルを持ち歩こう！｜Ogasawara ECO MAP",
    description: "父島のエコな場所をまとめたマップです。マイボトルを持ち歩こう！",
    images: [{ url: "/site-logo.png", width: 512, height: 512, alt: "Ogasawara ECO MAP" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1c2f4a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <PwaRegister />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
