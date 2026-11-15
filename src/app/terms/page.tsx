import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | Ogasawara ECO MAP",
};

export default function TermsPage() {
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
        <h1 className="text-base font-bold text-ink">利用規約</h1>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-8 text-ink">
        <p className="mb-8 text-sm leading-relaxed text-ink/60">
          本規約は、ひとつ ~Bonin Life~（以下「当サイト」）が提供する Ogasawara ECO MAP（以下「本サービス」）の利用条件を定めるものです。利用者は本規約に同意のうえ、本サービスをご利用ください。
        </p>

        <section className="mb-8">
          <h2 className="mb-3 text-base font-bold">1. サービスの概要</h2>
          <p className="text-sm leading-relaxed text-ink/80">
            本サービスは、小笠原諸島・父島を舞台にしたエコ活動を体験・応援するためのスタンプラリーアプリです。マイボトル協賛店・給水スポット・生ごみ回収拠点などを地図上で確認し、現地訪問または QR コードの読み取りによりスタンプを取得できます。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-base font-bold">2. 免責事項</h2>
          <p className="text-sm leading-relaxed text-ink/80">
            当サイトは、本サービスの利用によって生じた損害（GPS の位置誤差、スポット情報の変更・閉鎖、通信障害等に起因するものを含む）について、一切の責任を負いません。スポット情報は予告なく変更される場合があります。現地の状況は必ず直接ご確認ください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-base font-bold">3. 著作権・知的財産権</h2>
          <p className="text-sm leading-relaxed text-ink/80">
            本サービスに含まれるテキスト・画像・地図イラスト・ロゴ等の著作物に関する権利は、当サイトまたは正当な権利者に帰属します。利用者は、私的利用の範囲を超えて複製・転載・二次利用することはできません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-base font-bold">4. 禁止事項</h2>
          <p className="mb-2 text-sm leading-relaxed text-ink/80">利用者は以下の行為を行ってはなりません。</p>
          <ul className="space-y-2 text-sm leading-relaxed text-ink/80">
            <li className="flex gap-2"><span className="shrink-0">・</span>本サービスの運営を妨害する行為</li>
            <li className="flex gap-2"><span className="shrink-0">・</span>本サービスに過度な負荷をかける行為</li>
            <li className="flex gap-2"><span className="shrink-0">・</span>本サービスをリバースエンジニアリング・逆アセンブル・逆コンパイルするなど、ソースコードの解析を試みる行為</li>
            <li className="flex gap-2"><span className="shrink-0">・</span>不正な手段によるスタンプの取得</li>
            <li className="flex gap-2"><span className="shrink-0">・</span>他の利用者または第三者に不利益を与える行為</li>
            <li className="flex gap-2"><span className="shrink-0">・</span>法令または公序良俗に反する行為</li>
            <li className="flex gap-2"><span className="shrink-0">・</span>その他、当サイトが不適切と判断する行為</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-base font-bold">5. リンクについて</h2>
          <p className="mb-2 text-sm leading-relaxed text-ink/80">
            本サービスへのリンクは原則として自由です。ただし、以下に該当するリンクは禁止します。
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-ink/80">
            <li className="flex gap-2"><span className="shrink-0">・</span>当サイトまたは本サービスを誹謗中傷する目的のリンク</li>
            <li className="flex gap-2"><span className="shrink-0">・</span>本サービスのコンテンツを自サイトのものと誤認させるような形でのリンク</li>
            <li className="flex gap-2"><span className="shrink-0">・</span>法令または公序良俗に違反するサイトからのリンク</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-base font-bold">6. 本規約の変更</h2>
          <p className="text-sm leading-relaxed text-ink/80">
            当サイトは、必要に応じて予告なく本規約を変更することがあります。変更後の規約は本ページに掲載した時点から効力を生じるものとし、利用者は変更後も本サービスを利用することで新規約に同意したものとみなします。
          </p>
        </section>
      </main>
    </div>
  );
}
