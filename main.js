// ブラウザ判定
// 参考: https://qiita.com/sakuraya/items/33f93e19438d0694a91d
var userAgent = window.navigator.userAgent.toLowerCase();
var isChrome = 0;

if (userAgent.indexOf('msie') != -1 || userAgent.indexOf('trident') != -1) {
  // IE
} else if (userAgent.indexOf('edge') != -1) {
  // Edge
} else if (userAgent.indexOf('chrome') != -1) {
  // Chrome
  isChrome = 1;
} else if (userAgent.indexOf('safari') != -1) {
  // Safari
} else if (userAgent.indexOf('firefox') != -1) {
  // Firefox
} else if (userAgent.indexOf('opera') != -1) {
  // Opera
} else {
  // その他
}

if (!isChrome) {
  alert('Google Chromeでアクセスしてください')
  document.getElementById('status').innerHTML = "Google Chromeでアクセスしてください";
  document.getElementById('status').className = "error";
  exit;
}

// Webカメラ
// 参考: https://qiita.com/qiita_mona/items/e58943cf74c40678050a
// getUserMedia が使えないとき
if (typeof navigator.mediaDevices.getUserMedia !== 'function') {
  const err = new Error('getUserMedia()が使用できません');
  alert(`${err.name} ${err.message}`);
  throw err;
}

const $video = document.getElementById('result_video'); // 映像表示エリア

// select要素のoptionをクリアする
function clearSelect(select) {
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }
}

// select要素のoptionに、option.valueがvalueな項目があれば選択する
// 戻り値は、option中に該当項目があればtrue
function selectValueIfExists(select, value) {
  if (value === null || value === undefined) return;
  var result = false;
  select.childNodes.forEach(n => {
    if (n.value === value) {
      select.value = value;
      result = true;
    }
  })
  return result;
}

// カメラを列挙して select_camera オブジェクトの option に設定
// 参考：https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
// deviceInfos : MediaDeviceInfo[]
// 引数は MediaDevices.enumerateDevices() の戻り値の Promise の中身という前提
// 参考：https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/enumerateDevices
function updateCameraSelector(deviceInfos) {
  // 選んだ項目を最後で再度選ぶために記憶
  const selectedDevice = select_camera.value;
  // 既存の選択肢をクリア
  clearSelect(select_camera);
  // メディアデバイス一覧のうち、videoinputをoption要素としてselectに追加
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'videoinput') {
      const option = document.createElement('option');
      option.value = deviceInfo.deviceId;
      option.text = deviceInfos[i].label || `camera ${select_camera.length + 1}`;
      select_camera.appendChild(option);
    }
  }
  // 元々選んでいた項目があれば、その項目を再度選択
  selectValueIfExists(select_camera, selectedDevice);
}

// video要素にstreamを設定し、メディア（カメラ、マイク）一覧を返す
// 参考：https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
function handleStream(stream) {
  window.stream = stream;
  $video.srcObject = stream;
  return navigator.mediaDevices.enumerateDevices();
}

// 設定に基づきカメラ映像を表示
// isInit : カメラ選択肢がない場合だけtrue、他（選択肢切替時や保存された設定からの復元時）は不要
// 参考：https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
function setupCamera(isInit) {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const videoSource = select_camera.value;
  const constraints = {
    video: {
      aspectRatio: {
        ideal: 1.7777777778
      }
    },
    audio: false
  };
  if (isInit !== true) {
    constraints.video["deviceId"] = videoSource ? {
      exact: videoSource
    } : undefined;
  }
  navigator.mediaDevices.getUserMedia(constraints)
    .then(handleStream)
    .then(updateCameraSelector)
    .catch(onCameraError);
}

// カメラ初回起動
function initCamera() {
  const conf = JSON.parse(localStorage.speech_to_text_config || '{}');
  var camera_selected = false;
  if (typeof conf.select_camera !== 'undefined') {
    if (selectValueIfExists(select_camera, conf.select_camera)) {
      // カメラ選択肢が保存され、selectのoption中にあれば選択されたカメラを起動
      camera_selected = true;
      setupCamera();
    }
  }
  if (!camera_selected) {
    // カメラ設定がされていなければ、デフォルトカメラで開始
    setupCamera(true); // 引数はデフォルトカメラ選択の意
  }
}

function onCameraError(err) {
  console.log(`カメラ関連の問題：${err.name} / ${err.message}`)
  alert(`カメラ映像を読み込めませんでした。ブラウザのアクセス制限など，設定を確認してください`);
  document.getElementById('help_on_error').style.display = 'block';
}

// カメラの選択肢を生成
navigator.mediaDevices.enumerateDevices()
  .then(updateCameraSelector)
  .then(initCamera)
  .catch(onCameraError);

// 音声認識
// 参考: https://jellyware.jp/kurage/iot/webspeechapi.html
var flag_speech = 0;
var recognition;
var lang = 'ja-JP';
var textUpdateTimeoutID = 0;
var textUpdateTimeoutSecond = 30; // 音声認識結果が更新されない場合にクリアするまでの秒数（0以下の場合は自動クリアしない）

function vr_function() {
  window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
  recognition = new webkitSpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onsoundstart = function() {
    document.getElementById('status').innerHTML = "認識中...";
    document.getElementById('status').className = "processing";
  };
  recognition.onnomatch = function() {
    document.getElementById('status').innerHTML = "音声を認識できませんでした";
    document.getElementById('status').className = "error";
  };
  recognition.onerror = function() {
    document.getElementById('status').innerHTML = "エラー";
    document.getElementById('status').className = "error";
    if (flag_speech == 0)
      vr_function();
  };
  recognition.onsoundend = function() {
    document.getElementById('status').innerHTML = "停止中";
    document.getElementById('status').className = "error";
    vr_function();
  };

  recognition.onresult = function(event) {
    var results = event.results;
    for (var i = event.resultIndex; i < results.length; i++) {
      if (results[i].isFinal) {
        var result_transcript = results[i][0].transcript
        if (lang == 'ja-JP') {
          result_transcript += '。';
        }

        if (document.getElementById('checkbox_hiragana').checked && lang == 'ja-JP') {
          document.getElementById('result_text').innerHTML = resultToHiragana(result_transcript);
        } else {
          document.getElementById('result_text').innerHTML = result_transcript;
        }
        setTimeoutForClearText();

        if (document.getElementById('checkbox_timestamp').checked) {
          // タイムスタンプ機能
          var now = new window.Date();
          var Year = now.getFullYear();
          var Month = (("0" + (now.getMonth() + 1)).slice(-2));
          var Date = ("0" + now.getDate()).slice(-2);
          var Hour = ("0" + now.getHours()).slice(-2);
          var Min = ("0" + now.getMinutes()).slice(-2);
          var Sec = ("0" + now.getSeconds()).slice(-2);

          var timestamp = Year + '-' + Month + '-' + Date + ' ' + Hour + ':' + Min + ':' + Sec + '&#009;'
          result_transcript = timestamp + result_transcript
        }

        document.getElementById('result_log').insertAdjacentHTML('beforeend', result_transcript + '\n');
        textAreaHeightSet(document.getElementById('result_log'));
        vr_function();
        flag_speech = 0;
      } else {
        var result_transcript = results[i][0].transcript;

        if (document.getElementById('checkbox_hiragana').checked && lang == 'ja-JP') {
          document.getElementById('result_text').innerHTML = resultToHiragana(result_transcript);
        } else {
          document.getElementById('result_text').innerHTML = result_transcript;
        }

        flag_speech = 1;
      }
    }
  }

  flag_speech = 0;
  document.getElementById('status').innerHTML = "待機中";
  document.getElementById('status').className = "ready";
  recognition.start();
}

function updateTextClearSecond() {
  const sec = Number(document.getElementById('select_autoclear_text').value);
  if ((!isNaN(sec)) && isFinite(sec) && (sec >= 0)) {
    textUpdateTimeoutSecond = sec;
  }
}

function clearTimeoutForClearText() {
  if (textUpdateTimeoutID !== 0) {
    clearTimeout(textUpdateTimeoutID);
    textUpdateTimeoutID = 0;
  }
}

// 変数 textUpdateTimeoutSecond に基づいてタイマーを設定する。
// タイマーの時間切れで、字幕を自動的に消去する。
// 変数の値がゼロ以下の場合はタイマーは設定されない。
// タイマーが既に動いている場合、処理タイミングは後からのもので上書きする。
function setTimeoutForClearText() {
  if (textUpdateTimeoutSecond <= 0) return;

  clearTimeoutForClearText();
  textUpdateTimeoutID = setTimeout(
    () => {
      document.getElementById('result_text').innerHTML = "";
      textUpdateTimeoutID = 0;
    },
    textUpdateTimeoutSecond * 1000);
}

// 認識結果のログのtextareaを自動変形する
// 参考: https://webparts.cman.jp/input/textarea/
function textAreaHeightSet(argObj) {
  // 一旦テキストエリアを小さくしてスクロールバー（縦の長さを取得）
  argObj.style.height = "10px";
  var wSclollHeight = parseInt(argObj.scrollHeight);
  // 1行の長さを取得する
  var wLineH = parseInt(argObj.style.lineHeight.replace(/px/, ''));
  // 最低2行の表示エリアにする
  if (wSclollHeight < (wLineH * 2)) {
    wSclollHeight = (wLineH * 2);
  }
  // テキストエリアの高さを設定する
  argObj.style.height = wSclollHeight + "px";
}

// 認識を手動で止める（文を区切る）
document.addEventListener('keydown',
  event => {
    if (event.key === 'Enter') {
      if (flag_speech == 1) {
        recognition.stop();
      }
    }
  });

// 認識結果のログをダウンロードする
// 参考: https://qiita.com/kerupani129/items/99fd7a768538fcd33420
function downloadLogFile() {
  const a = document.createElement('a');
  a.href = 'data:text/plain,' + encodeURIComponent(document.getElementById('result_log').value);

  var now = new window.Date();
  var Year = now.getFullYear();
  var Month = (("0" + (now.getMonth() + 1)).slice(-2));
  var Date = ("0" + now.getDate()).slice(-2);
  var Hour = ("0" + now.getHours()).slice(-2);
  var Min = ("0" + now.getMinutes()).slice(-2);
  var Sec = ("0" + now.getSeconds()).slice(-2);

  a.download = 'log_' + Year + Month + Date + '_' + Hour + Min + Sec + '.txt';

  a.click();
}

// 参考: https://blog.katsubemakito.net/html5/fullscreen
/**
 * フルスクリーン開始/終了時のイベント設定
 *
 * @param {function} callback
 */
function eventFullScreen(callback) {
  document.addEventListener("fullscreenchange", callback, false);
  document.addEventListener("webkitfullscreenchange", callback, false);
  document.addEventListener("mozfullscreenchange", callback, false);
  document.addEventListener("MSFullscreenChange", callback, false);
}

/**
 * フルスクリーンが利用できるか
 *
 * @return {boolean}
 */
function enabledFullScreen() {
  return (
    document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen || document.msFullscreenEnabled
  );
}

/**
 * フルスクリーンにする
 *
 * @param {object} [element]
 */
function goFullScreen(element = null) {

  const doc = window.document;
  const docEl = (element === null) ? doc.documentElement : element;
  let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  requestFullScreen.call(docEl);
}

/**
 * フルスクリーンをやめる
 */
function cancelFullScreen() {
  const doc = window.document;
  const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  cancelFullScreen.call(doc);
}

/**
 * フルスクリーン中のオブジェクトを返却
 */
function getFullScreenObject() {
  const doc = window.document;
  const objFullScreen = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
  return (objFullScreen);
}

const FullScreenBtn = document.querySelector("#FullScreenBtn"); // フルスクリーン化ボタン

const objResultText = document.querySelector("#result_text");
var font_size_windowed = parseFloat(getComputedStyle(objResultText).getPropertyValue('font-size'));
var flag_font_size_styled = 0;

window.onload = () => {
  vr_function();
  const video_doc = document.querySelector("#video_wrapper"); // フルスクリーンにするオブジェクト

  //--------------------------------
  // [event] 開始ボタンをクリック
  //--------------------------------
  FullScreenBtn.addEventListener("click", () => {
    if (getFullScreenObject()) {
      // フルスクリーンを解除
      cancelFullScreen(video_doc);
    } else {
      // フルスクリーンを開始
      if (!enabledFullScreen()) {
        alert("フルスクリーンに対応していません");
        return (false);
      }
      goFullScreen(video_doc);

    }
  });

  //--------------------------------
  // フルスクリーンイベント
  //--------------------------------
  eventFullScreen(() => {
    // ボタンを入れ替える
    if (getFullScreenObject()) {
      // フルスクリーン時に文字と画面の比率を維持
      const ratio = window.parent.screen.height / document.querySelector("#result_video").clientHeight
      font_size_windowed = parseFloat(getComputedStyle(objResultText).getPropertyValue('font-size'));
      if (objResultText.style.fontSize) {
        // スライダーでフォントサイズの指定がされているかどうかを記録
        flag_font_size_styled = 1;
        font_size_windowed = parseFloat(getComputedStyle(objResultText).fontSize);
      }
      document.querySelector('#result_text').style.fontSize = parseFloat(getComputedStyle(objResultText).getPropertyValue('font-size')) * ratio + 'px';
      console.log("フルスクリーン開始");

    } else {
      // フルスクリーン時から通常画面に戻るときに文字と画面の比率を維持
      if (flag_font_size_styled) {
        document.querySelector('#result_text').style.fontSize = document.querySelector("#value_font_size").textContent + 'px';
      } else {
        // スライダーでフォントサイズの指定がされていなかった（デフォルトだった）場合は単にstyleのfontSizeを削除する
        // 分割表示時のデフォルトCSSを活かすため
        document.querySelector('#result_text').style.fontSize = '';
      }
      console.log("フルスクリーン終了");

    }
  });

  initConfig();
};


// 言語切替
// 参考: https://www.google.com/intl/ja/chrome/demos/speech.html
var langs = [
  ['Japanese', ['ja-JP']],
  ['English', ['en-US', 'United States'],
    ['en-AU', 'Australia'],
    ['en-CA', 'Canada'],
    ['en-IN', 'India'],
    ['en-KE', 'Kenya'],
    ['en-TZ', 'Tanzania'],
    ['en-GH', 'Ghana'],
    ['en-NZ', 'New Zealand'],
    ['en-NG', 'Nigeria'],
    ['en-ZA', 'South Africa'],
    ['en-PH', 'Philippines'],
    ['en-GB', 'United Kingdom'],
  ],
  ['Afrikaans', ['af-ZA']],
  ['አማርኛ', ['am-ET']],
  ['Azərbaycanca', ['az-AZ']],
  ['বাংলা', ['bn-BD', 'বাংলাদেশ'],
    ['bn-IN', 'ভারত']
  ],
  ['Bahasa Indonesia', ['id-ID']],
  ['Bahasa Melayu', ['ms-MY']],
  ['Català', ['ca-ES']],
  ['Čeština', ['cs-CZ']],
  ['Dansk', ['da-DK']],
  ['Deutsch', ['de-DE']],
  ['Español', ['es-AR', 'Argentina'],
    ['es-BO', 'Bolivia'],
    ['es-CL', 'Chile'],
    ['es-CO', 'Colombia'],
    ['es-CR', 'Costa Rica'],
    ['es-EC', 'Ecuador'],
    ['es-SV', 'El Salvador'],
    ['es-ES', 'España'],
    ['es-US', 'Estados Unidos'],
    ['es-GT', 'Guatemala'],
    ['es-HN', 'Honduras'],
    ['es-MX', 'México'],
    ['es-NI', 'Nicaragua'],
    ['es-PA', 'Panamá'],
    ['es-PY', 'Paraguay'],
    ['es-PE', 'Perú'],
    ['es-PR', 'Puerto Rico'],
    ['es-DO', 'República Dominicana'],
    ['es-UY', 'Uruguay'],
    ['es-VE', 'Venezuela']
  ],
  ['Euskara', ['eu-ES']],
  ['Filipino', ['fil-PH']],
  ['Français', ['fr-FR']],
  ['Basa Jawa', ['jv-ID']],
  ['Galego', ['gl-ES']],
  ['ગુજરાતી', ['gu-IN']],
  ['Hrvatski', ['hr-HR']],
  ['IsiZulu', ['zu-ZA']],
  ['Íslenska', ['is-IS']],
  ['Italiano', ['it-IT', 'Italia'],
    ['it-CH', 'Svizzera']
  ],
  ['ಕನ್ನಡ', ['kn-IN']],
  ['ភាសាខ្មែរ', ['km-KH']],
  ['Latviešu', ['lv-LV']],
  ['Lietuvių', ['lt-LT']],
  ['മലയാളം', ['ml-IN']],
  ['मराठी', ['mr-IN']],
  ['Magyar', ['hu-HU']],
  ['ລາວ', ['lo-LA']],
  ['Nederlands', ['nl-NL']],
  ['नेपाली भाषा', ['ne-NP']],
  ['Norsk bokmål', ['nb-NO']],
  ['Polski', ['pl-PL']],
  ['Português', ['pt-BR', 'Brasil'],
    ['pt-PT', 'Portugal']
  ],
  ['Română', ['ro-RO']],
  ['සිංහල', ['si-LK']],
  ['Slovenščina', ['sl-SI']],
  ['Basa Sunda', ['su-ID']],
  ['Slovenčina', ['sk-SK']],
  ['Suomi', ['fi-FI']],
  ['Svenska', ['sv-SE']],
  ['Kiswahili', ['sw-TZ', 'Tanzania'],
    ['sw-KE', 'Kenya']
  ],
  ['ქართული', ['ka-GE']],
  ['Հայերեն', ['hy-AM']],
  ['தமிழ்', ['ta-IN', 'இந்தியா'],
    ['ta-SG', 'சிங்கப்பூர்'],
    ['ta-LK', 'இலங்கை'],
    ['ta-MY', 'மலேசியா']
  ],
  ['తెలుగు', ['te-IN']],
  ['Tiếng Việt', ['vi-VN']],
  ['Türkçe', ['tr-TR']],
  ['اُردُو', ['ur-PK', 'پاکستان'],
    ['ur-IN', 'بھارت']
  ],
  ['Ελληνικά', ['el-GR']],
  ['български', ['bg-BG']],
  ['Pусский', ['ru-RU']],
  ['Српски', ['sr-RS']],
  ['Українська', ['uk-UA']],
  ['한국어', ['ko-KR']],
  ['中文', ['cmn-Hans-CN', '普通话 (中国大陆)'],
    ['cmn-Hans-HK', '普通话 (香港)'],
    ['cmn-Hant-TW', '中文 (台灣)'],
    ['yue-Hant-HK', '粵語 (香港)']
  ],
  ['हिन्दी', ['hi-IN']],
  ['ภาษาไทย', ['th-TH']]
];

for (var i = 0; i < langs.length; i++) {
  select_language.options[i] = new Option(langs[i][0], i);
}

// デフォルトの言語を設定
select_language.selectedIndex = 0;
updateCountry();
select_dialect.selectedIndex = 0;

function updateCountry() {
  for (var i = select_dialect.options.length - 1; i >= 0; i--) {
    select_dialect.remove(i);
  }
  var list = langs[select_language.selectedIndex];
  for (var i = 1; i < list.length; i++) {
    select_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  select_dialect.style.display = list[1].length == 1 ? 'none' : 'inline';
  updateLanguage()
}

function updateLanguage() {
  var flag_recognition_stopped = 0;
  if (recognition) {
    recognition.stop();
    flag_recognition_stopped = 1;
  }
  lang = select_dialect.value;
  if (flag_recognition_stopped) {
    vr_function();
  }

  var el_status_kuromoji_loading = document.getElementById('status_kuromoji_loading');
  var el_checkbox_hiragana = document.getElementById('checkbox_hiragana_wrapper');
  if (lang == 'ja-JP') {
    el_status_kuromoji_loading.style.display = "inline-block";
    el_checkbox_hiragana.style.display = "inline";
  } else {
    el_status_kuromoji_loading.style.display = "none";
    el_checkbox_hiragana.style.display = "none";
  }
}

// 結果の翻訳機能を追加
// 参考: https://pisuke-code.com/js-usage-of-google-trans-api/
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');
}

// フォント切替
// 参考: https://www.google.com/intl/ja/chrome/demos/speech.html
var fonts_custom = [
  ['Noto Sans JP', "'Noto Sans JP', sans-serif"],
  ['BIZ UD ゴシック（Windows 10）', "'BIZ UDゴシック', 'BIZ UDGothic', 'Noto Sans JP', sans-serif"],
  ['BIZ UD 明朝（Windows 10）', "'BIZ UD明朝', 'BIZ UDMincho', 'Noto Sans JP', sans-serif"],
  ['游ゴシック', "游ゴシック体, 'Yu Gothic', YuGothic, sans-serif"],
  ['メイリオ', "'メイリオ', 'Meiryo', 'Noto Sans JP', sans-serif"],
  ['ポップ体（Windows）', "'HGS創英角ﾎﾟｯﾌﾟ体', 'Noto Sans JP', sans-serif"],
  ['ゴシック体（ブラウザ標準）', "sans-serif"],
  ['明朝体（ブラウザ標準）', "serif"]
];

for (var i = 0; i < fonts_custom.length; i++) {
  select_font.options[i] = new Option(fonts_custom[i][0], i);
}

// デフォルトの言語を設定
select_font.selectedIndex = 0;

// 初期設定
const config = JSON.parse(localStorage.speech_to_text_config || '{}');

function initConfig() {
  function triggerEvent(type, elem) {
    const ev = document.createEvent('HTMLEvents');
    ev.initEvent(type, true, true);
    elem.dispatchEvent(ev);
  }
  ['slider_font_size',
    'slider_opacity',
    'slider_text_shadow_stroke',
    'slider_text_stroke',
    'slider_line_height',
    'slider_letter_spacing',
    'selector_text_color',
    'selector_text_shadow_color',
    'selector_text_stroke_color',
    'slider_text_bg_opacity',
    'selector_text_bg_color',
    'selector_video_bg',
  ].forEach(id => {
    if (typeof config[id] !== 'undefined') {
      const el = document.getElementById(id);
      el.value = config[id];
      triggerEvent('input', el);
    }
  });
  ['video_bg',
    'result_video',
    'text_overlay_wrapper',
    'FullScreenBtn'
  ].forEach(id => {
    if (typeof config[id] !== 'undefined') {
      const el = document.getElementById(id);
      if (config[id]) {
        Object.keys(config[id]).forEach(key => {
          if (config[id][key]) {
            el.classList.add(key);
          } else {
            el.classList.remove(key);
          }
        });
      }
    }
  });
  if (typeof config.position !== 'undefined') {
    const el = document.getElementById(config.position);
    el.checked = 'checked';
    triggerEvent('input', el);
  }
  if (typeof config.select_font !== 'undefined') {
    select_font.selectedIndex = config.select_font;
    triggerEvent('change', select_font);
  }
  if (typeof config.checkbox_timestamp !== 'undefined') {
    const el = document.getElementById('checkbox_timestamp');
    el.checked = config.checkbox_timestamp;
    triggerEvent('input', el);
  }
  if (typeof config.checkbox_hiragana !== 'undefined') {
    const el = document.getElementById('checkbox_hiragana');
    el.checked = config.checkbox_hiragana;
    triggerEvent('input', el);
  }
  if (typeof config.select_autoclear_text !== 'undefined') {
    const el = document.getElementById('select_autoclear_text');
    selectValueIfExists(el, config.select_autoclear_text);
    triggerEvent('change', el);
  }

  document.querySelectorAll('input.control_input').forEach(
    el => el.addEventListener('input', updateConfigValue)
  );
  document.querySelectorAll('input[name="selector_position"]').forEach(
    el => el.addEventListener('input', ev => updateConfig('position', el.id))
  );
  document.querySelector('#select_camera').addEventListener('change', updateConfigValue);
  document.querySelector('#select_font').addEventListener('change', updateConfigValue);
  document.querySelector('#checkbox_timestamp').addEventListener('input', function(e) {
    updateConfig(e.target.id, e.target.checked)
  });
  document.querySelector('#checkbox_hiragana').addEventListener('input', function(e) {
    updateConfig(e.target.id, e.target.checked)
  });
  document.querySelector('#select_autoclear_text').addEventListener('change', updateConfigValue);
}

function updateConfig(key, value) {
  config[key] = value;
  localStorage.speech_to_text_config = JSON.stringify(config);
}

function updateConfigClass(key, value_key, value) {
  if (config[key] == undefined) {
    config[key] = {};
  }
  config[key][value_key] = value;
  localStorage.speech_to_text_config = JSON.stringify(config);
}

function toggleClass(id, className) {
  const el = document.getElementById(id);
  const value = el.classList.toggle(className);
  updateConfigClass(id, className, value);
}

function updateConfigValue() {
  updateConfig(this.id, this.value);
}

function deleteConfig() {
  localStorage.removeItem('speech_to_text_config');
  location.reload();
}

// 形態素解析
let kuromojiObj;

function initKuromoji(checkbox) {
  if (checkbox.checked == true && kuromojiObj == undefined) {
    document.getElementById('status_kuromoji_loading').innerHTML = "ひらがなデータ読み込み中...";
    document.getElementById('status_kuromoji_loading').className = "processing";
    kuromoji.builder({
      dicPath: "kuromoji/dict/"
    }).build(function(err, tokenizer) {
      kuromojiObj = tokenizer
      document.getElementById('status_kuromoji_loading').innerHTML = "ひらがなデータ読み込み完了";
      document.getElementById('status_kuromoji_loading').className = "ready";
    });
  }
}

// 結果をひらがなにする
function resultToHiragana(text) {
  if (kuromojiObj == undefined) {
    return text;
  }
  var kuromoji_result = kuromojiObj.tokenize(text);
  var result_hiragana = '';
  for (var i = 0; i < kuromoji_result.length; i++) {
    if (kuromoji_result[i].word_type == "KNOWN") {
      result_hiragana += kuromoji_result[i].reading;
    } else {
      result_hiragana += kuromoji_result[i].surface_form;
    }
  }
  return katakanaToHiragana(result_hiragana);
}

// カタカナをひらがなにする
// 参考: https://gist.github.com/kawanet/5553478
function katakanaToHiragana(src) {
  return src.replace(/[\u30a1-\u30f6]/g, function(match) {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}
