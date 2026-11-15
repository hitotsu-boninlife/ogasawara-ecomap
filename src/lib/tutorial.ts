export const TUTORIAL_KEY = "tutorial_v1";

export type TutorialStep = {
  title: string;
  body: string;
  /**
   * true: カードを上部に表示（ボトムシートが開いているステップで使用）
   * false: カードを下部に表示（デフォルト）
   */
  cardAtTop: boolean;
};

export const STEPS: TutorialStep[] = [
  {
    title: "マップを動かしてみよう",
    body: "指でなぞって移動、2本指で広げて拡大・縮小ができます。",
    cardAtTop: false,
  },
  {
    // step 1: 全ピンを光らせる（App.tsx → StampMap highlightPins）
    title: "ピンをタップしよう",
    body: "マップ上のピンをタップすると、スポットの詳細が表示されます。",
    cardAtTop: false,
  },
  {
    // step 2: ボトムシートを開いてナビボタンを光らせる（App.tsx → SpotDetail highlightTarget="navigate"）
    title: "スポットへ向かおう",
    body: "スポット詳細の「ここに行く」ボタンでGoogleマップのナビが開きます。スポットへ向かいましょう。",
    cardAtTop: true,
  },
  {
    // step 3: スタンプボタンを光らせる（App.tsx → SpotDetail highlightTarget="stamp"）
    title: "到着したらスタンプを押そう",
    body: "スポットに近づくと、スタンプボタンが押せるようになります。",
    cardAtTop: true,
  },
  {
    // step 4: QRボタンを光らせる（App.tsx → SpotDetail highlightTarget="qr"）
    title: "QRコードでも押せます",
    body: "スタンプが押せない場合は、QRコードアイコンをタップしてスキャンすると押印できます。",
    cardAtTop: true,
  },
  {
    // step 5: ボトムシートを閉じてスタンプ一覧ボタンを光らせる（App.tsx）
    title: "スタンプ一覧を見てみよう",
    body: "右下のスタンプ一覧ボタンで、押印状況を確認できます。",
    cardAtTop: true,
  },
  {
    // step 6: インストールボタンを光らせる（App.tsx → InstallPrompt highlight）
    title: "アプリをインストールしよう",
    body: "右上のインストールボタンからアプリを追加すると、オフラインでもご利用いただけます。",
    cardAtTop: false,
  },
];
