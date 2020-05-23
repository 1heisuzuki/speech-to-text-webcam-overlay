# Webカメラの映像に自動字幕を重ねるWebページ
<img src="./sample.gif" width="100%" alt="動作風景「このページを開くだけで音声認識をした結果の字幕をこんな感じで…」">
Web Speech API の音声認識を利用して文字起こしした結果をWebカメラ映像に重畳して表示するWebページです。ブラウザを画面収録して，ビデオ会議や生配信等で使用できます。

# デモページ
https://1heisuzuki.github.io/speech-to-text-webcam-overlay/  
*PC版のGoogle Chromeでアクセスしてください。

# 動作環境
- PC版 Google Chrome
  - 最新のWindows, macOSでなんとなく確認済
  - 詳しい動作検証はしていないのでご了承ください :pray:
- Android端末 Chrome
  - 筆者が端末を所持していないため未検証だが，動いたとの情報あり

# よくある質問
## 使用環境関係
### iPhoneやiPadのChromeで使えない
- iOS (iPhoneやiPad)のChromeは，中身がSafariのWebKitで実装されているため，音声認識に利用している Web Speech API が現段階では利用できません。PC版のChromeでアクセスしてください。  
参考: https://news.mynavi.jp/article/20190331-iphone_why/

### カメラやマイクが認識されない
- ページを再読み込みするか，ブラウザの設定を確認してください。  
参考: https://support.google.com/chrome/answer/2693767?co=GENIE.Platform%3DDesktop&hl=ja&oco=1

## 機能について
### 相手側の音声を表示したい
- マイクに相手側の声が物理的に入るようにする（ハウリング注意），PC内部で直接相手の音をブラウザに流し込むなどの方法があります。    
参考: https://www.cg-method.com/entry/google-document-convert-voice-to-text/  
参考: https://ghosthack.net/?p=5680

### 文字の修正をしたい
- 認識結果のログでは修正可能になっています。合成画面上での編集については未実装です。
- Google Docsなどの音声入力やUDトークなど，他のツールの利用で要望を満たせるかもしれません。  
参考: Google Docs ヘルプ / 音声で入力する https://support.google.com/docs/answer/4492226?hl=ja

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

## その他
### ブログや生配信で紹介したい
- オープンに公開しているので，自由に使ってください！

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
