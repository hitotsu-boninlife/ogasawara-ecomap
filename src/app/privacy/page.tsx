import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Ogasawara ECO MAP",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-paper/95 px-4 py-3 shadow-sm backdrop-blur-sm">
        <Link
          href="/"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/60 hover:bg-ink/5 active:bg-ink/10"
          aria-label="マップに戻る"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-base font-bold text-ink">プライバシーポリシー</h1>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-8 text-ink">
        <p className="mb-8 text-sm leading-relaxed text-ink/60">
          ひとつ ~Bonin Life~（以下「当サイト」）は、Ogasawara ECO MAP（以下「本サービス」）における利用者の個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
        </p>

        <section className="mb-8">
          <h2 className="mb-3 text-base font-bold">1. 取得する情報</h2>
          <p className="text-sm leading-relaxed text-ink/80">
            本サービスは、スタンプスポットへの接近を検知するために、ブラウザの Geolocation API を通じて利用者の現在地情報（緯度・経度・精度）を取得します。位置情報の取得はスタンプ機能のためのみに使用し、それ以外の目的には利用しません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-base font-bold">2. 情報の利用目的</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-ink/80">
            <li className="flex gap-2"><span className="shrink-0">・</span>スタンプスポットへの到着判定</li>
            <li className="flex gap-2"><span className="shrink-0">・</span>地図上での現在地表示</li>
            <li className="flex gap-2"><span className="shrink-0">・</span>スポットまでの距離案内</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-base font-bold">3. 情報の保存・送信</h2>
          <p className="text-sm leading-relaxed text-ink/80">
            取得した位置情報はブラウザのメモリ上でのみ処理され、外部サーバーへの送信や端末への永続的な保存は行いません。スタンプの押印記録はお使いの端末のブラウザストレージ（localStorage）にのみ保存され、当サイトが収集・参照することはありません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-base font-bold">4. 位置情報の利用許可について</h2>
          <p className="text-sm leading-relaxed text-ink/80">
            位置情報の利用は任意です。許可しない場合でも、現地に設置されたQRコードを読み取ることでスタンプを押印できます。位置情報の許可はブラウザの設定からいつでも変更できます。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-base font-bold">5. 第三者への提供</h2>
          <p className="text-sm leading-relaxed text-ink/80">
            当サイトは、取得した情報を法令に基づく場合を除き、第三者に提供することはありません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-base font-bold">6. ポリシーの変更</h2>
          <p className="text-sm leading-relaxed text-ink/80">
            本ポリシーは、必要に応じて予告なく変更することがあります。変更後の内容は本ページに掲載した時点から効力を生じるものとします。
          </p>
        </section>
      </main>
    </div>
  );
}
