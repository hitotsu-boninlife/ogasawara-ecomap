# Ogasawara ECO MAP

自作イラストマップ上で、GPS または現地QRでスタンプを押す PWA。
Next.js (静的書き出し) + TypeScript + Tailwind + MapLibre GL JS。バックエンドなし（スタンプ状態は IndexedDB）。

## 起動

```bash
pnpm install           # postinstall で MapLibre の Worker を public/maplibre/ にコピー
cp .env.example .env.local   # 環境変数ファイルを作成（必要に応じて編集）
pnpm dev               # http://localhost:3000/?debug=1
```

`?debug=1` を付けると下部に **擬似位置モード** が出ます。地図をタップした位置を「現在地」にして
到着判定・GPS精度悪化・スタンプのリセットを試せます。

> Service Worker は本番ビルドのみ有効です。オフライン動作は `pnpm build && pnpm preview` で確認します。
> カメラ(QR)と位置情報は HTTPS か localhost でないと動きません。実機確認は `cloudflared tunnel` 等で HTTPS 化してください。

## 環境変数

`.env.example` をコピーして `.env.local` を作成し、必要な値を設定してください。

| 変数名 | 説明 |
|---|---|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 測定ID（例: `G-XXXXXXXXXX`）。未設定時は計測しない |

## スポットの追加・編集

`src/data/event.json` の `spots[]` を編集します。

```jsonc
{
  "id": "myShop",              // 一意のID（公開後は変更不可。変えると既存スタンプがリセットされる）
  "name": "お店の名前",
  "real": { "lat": 27.09, "lng": 142.19 },  // 実際のGPS座標
  "px": [500, 400],            // イラスト上のピクセル位置
  "radiusM": 30,               // GPS判定半径（メートル）
  "kind": "bottle",            // bottle / water / compost / eco
  "qrHash": ""                 // pnpm qr を実行すると自動入力される
}
```

スポットを追加・変更したら `pnpm qr` でQRコードを再生成してください。

## セットアップ手順（新しいイベントで使う場合）

1. イラストを用意して `src/data/event.json` の `image` セクションを編集
   - `width/height` … 画像のピクセルサイズ
   - `bounds` … 画像を貼る架空の緯度経度。**縦横比を画像と合わせる**（例: 2048×1536 → 幅0.02°なら高さ0.015°）
   - `minzoom/maxzoom` … タイルのズーム範囲（256pxタイル基準）。画像が約2000pxなら 14〜17 が目安
2. `pnpm run tiles` … `public/tiles/` にタイルを生成（要: `pip install pillow`）
3. `spots[]` を追加・編集
4. `pnpm qr` … QRコードを `qr/*.png` に出力し `qrHash` を自動書き込み

## 仕組み

| 役割 | 場所 |
|---|---|
| 実座標⇔イラスト座標の変換（薄板スプライン） | `src/lib/warp.ts`, `src/lib/event.ts` |
| GPS判定（距離＋精度）/ QR判定 | `src/lib/validate.ts` |
| スタンプ保存（IndexedDB） | `src/lib/stamps.ts` |
| オフライン（SW＋タイルの自動事前保存） | `public/sw.js`, `src/lib/offline.ts` |
| 地図表示 | `src/components/StampMap.tsx` |

- **判定は実座標、表示だけ変換**: イラストが歪んでいても判定には影響しません。
- **GPS判定**: 距離が「半径＋精度」より遠ければ「遠い」、近そうでも精度が `gpsMaxAccuracyM` を超えれば「保留」（QRへ誘導）。
- **QR**: 中身は `stamp:<spotId>:<secret>`。アプリは secret の SHA-256 だけ持つのでオフラインで照合できます。
  `qr/secrets.json` は印刷用の元データなので **公開リポジトリに入れないでください**（`.gitignore` 済み）。
- **extraControlPoints**: スポットのない地図端の変換精度補正用。スポットが地図全体に分散していれば空配列（`[]`）で問題ありません。

## Cloudflare Pages へのデプロイ

- ビルドコマンド: `pnpm build`（Python不要。タイルは生成済みのものをコミットしておく）
- 出力ディレクトリ: `out`
- 環境変数: `NODE_VERSION=22`、`NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`

### タイルが増えたら
Pages は1サイトあたりのファイル数に上限があります。ズームを深くして数千枚になる場合は、
タイルを **PMTiles 1ファイル**にして R2 に置き、`pmtiles` プラグインで読む構成に切り替えてください。

## 注意事項

- 端末内だけの判定なので、解析されれば偽装できます。景品が絡むなら、通信復帰時に履歴をサーバーへ送って検証するなど併用してください。
- iOS は画面を閉じている間の位置取得ができません。「画面を開いている間だけ判定」する設計です（Wake Lock で消灯は防止）。
- アプリを更新したら `public/sw.js` の `VERSION` と `src/components/PwaRegister.tsx` のキャッシュ名を上げてください。
