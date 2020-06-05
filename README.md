# Webカメラの映像に自動字幕を重ねるWebページ
<img src="./sample.gif" alt="動作風景「このページを開くだけで音声認識をした結果の字幕をこんな感じで…」">

Web Speech API の音声認識を利用して文字起こしした結果をWebカメラ映像に重畳して表示するWebページです。ブラウザを画面収録して，ビデオ会議や生配信等で使用できます。

# デモページ
https://1heisuzuki.github.io/speech-to-text-webcam-overlay/  
*PC版のGoogle Chromeでアクセスしてください。

**目次**
- [動作環境](#動作環境)
- [何ができるか](#何ができるか)
- [よくある質問](#よくある質問)
  - [使用環境関係](#使用環境関係)
  - [機能について](#機能について)
  - [その他](#その他)
- [関連資料](#関連資料)
- [参考資料](#参考資料)


# 動作環境
かなりざっくりとした動作環境しか行っていません。  
同様の環境で動かない場合はブラウザのアップデートや別ブラウザでの利用等をお試しください。

- PC版 Google Chrome / Chromium / Vivaldi
  - Windows, macOS, Linux (Ubuntu Mate 20.04) などで確認済み
- Android版 Google Chrome
  - 筆者が端末を所持していないため未検証だが，動いたとの情報あり  

# 何ができるか
- 音声からリアルタイムで文字起こしを行い，Webカメラの映像に重ねてブラウザ上で表示する
  - 認識する言語の変更
  - 表示する文章の翻訳（ログは翻訳されない）
  - 表示する文章のひらがな化（日本語認識→日本語表示の場合のみ，ログはひらがな化されない）
- 認識した過去ログの表示とダウンロード
- 表示する文字のスタイルの調整
  - 調整した設定はブラウザに自動保存

# よくある質問
## 使用環境関係
### Google Chrome って何？どうやって使うの？
- Google Chrome は Google が提供しているウェブブラウザ（ウェブページを表示するためのソフトウェア）です。
- 下記ページからダウンロード・インストールすることで利用できます。  
Google Chrome ダウンロードページ: https://www.google.com/chrome/

### iPhoneやiPadのChromeで使えない
- iOS (iPhoneやiPad)のChromeは，中身がSafariのWebKitで実装されているため，音声認識に利用している Web Speech API が現段階では利用できません。PC版のChromeでアクセスしてください。  
参考: https://news.mynavi.jp/article/20190331-iphone_why/
- iOSで文字起こしを検討したい場合は，iOSの音声入力をメモアプリで使用するなどの方法が考えられます。  
参考: https://time-space.kddi.com/mobile/20190110/2532

### カメラやマイクが認識されない
- ページを再読み込みするか，ブラウザの設定を確認してください。  
参考: https://support.google.com/chrome/answer/2693767?co=GENIE.Platform%3DDesktop&hl=ja&oco=1

## 機能について
### 相手側の音声を表示したい
- 機能として実装はしていませんが，例えば次のような方法があります。
  - マイクに相手側の声が物理的に入るようにする（ハウリング注意）
  - PC内部で直接相手の音をブラウザに流し込む  
    参考: https://www.cg-method.com/entry/google-document-convert-voice-to-text/  
    参考: https://ghosthack.net/?p=5680

### 文字の修正をしたい
- 認識結果のログでは修正可能になっています。合成画面上での編集については未実装です。
- Google Docsなどの音声入力やUDトークなど，他のツールの利用で要望を満たせるかもしれません。  
参考: Google Docs ヘルプ / 音声で入力する https://support.google.com/docs/answer/4492226?hl=ja

### ひらがなで表示したい
- 実装しました。
- 「音声認識：Japanese」を選択すると，「ひらがな」のチェックボックスが表示されます。
  - チェックボックスにチェックを入れると，ひらがな変換用のデータが読み込まれます。
- 仕組みと注意
  - Web Speech API では，漢字や変換された状態で結果が出力されます。
  - その結果から [kuromoji.js](#kuromojijs) により読みを取得し，表示しています。
  - 音声から直接ひらがなを生成しているわけではないため，読みが正しく表示されなかったり，kuromoji.js の辞書に登録されていない単語や英単語等が変換前の状態で表示されたりします。
  - つまり，「日本語音声→ひらがな」の変換ではなく，「日本語音声→文字→ひらがな読み」が行われています。

### 文字認識の結果を保存したい
- 実装しました。
- 保存を自動的に行いたい場合は，Google Docsなどの音声入力やUDトークなど，他のツールの利用を検討してください。  
参考: Google Docs ヘルプ / 音声で入力する https://support.google.com/docs/answer/4492226?hl=ja  

### 自動で翻訳したい
- 実装しました。
- 操作パネルの「翻訳：Select Language」と書かれているところから，翻訳したい言語を選択してください。
- なお，認識ログには音声認識した言語（翻訳前の言語）が表示されます。

### 他の言語を認識したい
- 実装しました。
- 操作パネルの「音声認識：Japanese」と書かれているところから，他の言語を選択してください。

### BIZ UD フォントが表示されない
- Windows 10 の場合，Windows 10 October 2018 Update が適用されていれば利用できます。  
参考: https://forest.watch.impress.co.jp/docs/news/1149745.html
- それ以外（他のWindows，macOSなど）の場合は，フォントをインストールすることで利用が可能になります。下記ページ下部より「MORISAWA BIZ+ 無償版」がダウンロードできます。  
ダウンロード: https://www.morisawa.co.jp/products/fonts/bizplus/price/  

### BIZ UD フォント以外のフォントが表示されない
- 選択が可能になっているフォントのなかで，PCによってはインストールされていない場合があります。
- フォントをインストールするか，別のフォントを選択してください。

## その他
### ブログや生配信で紹介したい
- オープンに公開しているので，自由に使ってください！

# 外部のライブラリ（サブモジュール）について
サブモジュールとして追加しているレポジトリをまとめてcloneする場合は`--recursive` オプションを使用してcloneしてください。
## kuromoji.js
- https://github.com/takuyaa/kuromoji.js
- 形態素解析を行うライブラリ
- 「読み」をひらがな化する際に利用
- License: Apache License 2.0

# 関連資料
- リモートミーティングでの音声認識の活用事例  
https://github.com/DigitalNatureGroup/Remote_Voice_Recognition

# 参考資料
コードを書くにあたって参考にしたWebページ等
- Web Speech API Demonstration  
https://www.google.com/intl/ja/chrome/demos/speech.html
- Web Speech APIで途切れない音声認識  
https://jellyware.jp/kurage/iot/webspeechapi.html
- HTML5のWebRTCでPCに接続されたカメラ映像をウェブブラウザー上に表示してコマ画像を保存したい  
https://qiita.com/qiita_mona/items/e58943cf74c40678050a
- 使用してるブラウザを判定したい  
https://qiita.com/sakuraya/items/33f93e19438d0694a91d
- [HTML5] フルスクリーンの開始と解除  
https://blog.katsubemakito.net/html5/fullscreen
- テキストエリア(textarea)の高さを自動にする  
https://webparts.cman.jp/input/textarea/
- JavaScript でファイル保存・開くダイアログを出して読み書きするまとめ  
https://qiita.com/kerupani129/items/99fd7a768538fcd33420
- JavaScriptからGoogle翻訳を使えるAPI試してみた【コード例付き】  
https://pisuke-code.com/js-usage-of-google-trans-api/
- しりとり審判アプリを作った話  
https://medium.com/@Mitu217/しりとり審判アプリを作った話-294b4947b008