// ==UserScript==
// @name         Better xCloud (Beta)
// @namespace    https://github.com/redphx
// @version      4.0.0
// @description  Improve Xbox Cloud Gaming (xCloud) experience
// @author       redphx
// @license      MIT
// @match        https://www.xbox.com/*/play*
// @match        https://www.xbox.com/*/auth/msa?*loggedIn*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/redphx/better-xcloud/typescript/dist/better-xcloud.meta.js
// @downloadURL  https://github.com/redphx/better-xcloud/releases/latest/download/better-xcloud.user.js
// ==/UserScript==
'use strict';
// src/utils/global.ts
var SCRIPT_VERSION = "4.0.0";
var SCRIPT_HOME = "https://github.com/redphx/better-xcloud";
var AppInterface = window.AppInterface;
var STATES = {
  isPlaying: false,
  appContext: {},
  serverRegions: {},
  hasTouchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  currentStream: {},
  remotePlay: {}
};

// src/utils/bx-event.ts
var BxEvent;
(function(BxEvent2) {
  BxEvent2["JUMP_BACK_IN_READY"] = "bx-jump-back-in-ready";
  BxEvent2["POPSTATE"] = "bx-popstate";
  BxEvent2["STREAM_LOADING"] = "bx-stream-loading";
  BxEvent2["STREAM_STARTING"] = "bx-stream-starting";
  BxEvent2["STREAM_STARTED"] = "bx-stream-started";
  BxEvent2["STREAM_PLAYING"] = "bx-stream-playing";
  BxEvent2["STREAM_STOPPED"] = "bx-stream-stopped";
  BxEvent2["STREAM_ERROR_PAGE"] = "bx-stream-error-page";
  BxEvent2["STREAM_MENU_SHOWN"] = "bx-stream-menu-shown";
  BxEvent2["STREAM_MENU_HIDDEN"] = "bx-stream-menu-hidden";
  BxEvent2["STREAM_WEBRTC_CONNECTED"] = "bx-stream-webrtc-connected";
  BxEvent2["STREAM_WEBRTC_DISCONNECTED"] = "bx-stream-webrtc-disconnected";
  BxEvent2["CUSTOM_TOUCH_LAYOUTS_LOADED"] = "bx-custom-touch-layouts-loaded";
  BxEvent2["REMOTE_PLAY_READY"] = "bx-remote-play-ready";
  BxEvent2["REMOTE_PLAY_FAILED"] = "bx-remote-play-failed";
  BxEvent2["XCLOUD_SERVERS_READY"] = "bx-servers-ready";
  BxEvent2["DATA_CHANNEL_CREATED"] = "bx-data-channel-created";
})(BxEvent || (BxEvent = {}));
(function(BxEvent) {
  function dispatch(target, eventName, data) {
    if (!eventName) {
      alert("BxEvent.dispatch(): eventName is null");
      return;
    }
    const event = new Event(eventName);
    if (data) {
      for (const key in data) {
        event[key] = data[key];
      }
    }
    AppInterface && AppInterface.onEvent(eventName);
    target.dispatchEvent(event);
  }
  BxEvent.dispatch = dispatch;
})(BxEvent || (BxEvent = {}));

// src/utils/bx-flags.ts

/* ADDITIONAL CODE */

var DEFAULT_FLAGS = {
  CheckForUpdate: true,
  PreloadRemotePlay: true,
  PreloadUi: false,
  EnableXcloudLogging: false,
  SafariWorkaround: true,
  UseDevTouchLayout: false
};
var BX_FLAGS = Object.assign(DEFAULT_FLAGS, window.BX_FLAGS || {});
try {
  delete window.BX_FLAGS;
} catch (e) {
}

// src/utils/bx-exposed.ts
var BxExposed = {
  onPollingModeChanged: (mode) => {
    if (!STATES.isPlaying) {
      return false;
    }
    const $screenshotBtn = document.querySelector(".bx-screenshot-button");
    const $touchControllerBar = document.getElementById("bx-touch-controller-bar");
    if (mode !== "None") {
      $screenshotBtn && $screenshotBtn.classList.add("bx-gone");
      $touchControllerBar && $touchControllerBar.classList.add("bx-gone");
    } else {
      $screenshotBtn && $screenshotBtn.classList.remove("bx-gone");
      $touchControllerBar && $touchControllerBar.classList.remove("bx-gone");
    }
  }
};

// src/utils/translation.ts
var SUPPORTED_LANGUAGES = {
  "en-ID": "Bahasa Indonesia",
  "de-DE": "Deutsch",
  "en-US": "English (United States)",
  "es-ES": "español (España)",
  "fr-FR": "français",
  "it-IT": "italiano",
  "ja-JP": "日本語",
  "ko-KR": "한국어",
  "pl-PL": "polski",
  "pt-BR": "português (Brasil)",
  "ru-RU": "русский",
  "tr-TR": "Türkçe",
  "uk-UA": "українська",
  "vi-VN": "Tiếng Việt",
  "zh-CN": "中文(简体)"
};
var Texts = {
  activate: [
    "Aktivieren",
    "Aktifkan",
    "Activate",
    "Activo",
    ,
    ,
    "設定する",
    "활성화",
    "Aktywuj",
    "Ativar",
    "Активировать",
    "Etkinleştir",
    "Активувати",
    "Kích hoạt",
    "启用"
  ],
  activated: [
    "Aktiviert",
    "Diaktifkan",
    "Activated",
    "Activado",
    ,
    ,
    "設定中",
    "활성화 됨",
    "Aktywowane",
    "Ativado",
    "Активирован",
    "Etkin",
    "Активований",
    "Đã kích hoạt",
    "已启用"
  ],
  active: [
    "Aktiv",
    "Aktif",
    "Active",
    "Activo",
    ,
    ,
    "有効",
    "활성화",
    "Aktywny",
    "Ativo",
    "Активный",
    "Etkin",
    "Активний",
    "Hoạt động",
    "已启用"
  ],
  advanced: [
    "Erweitert",
    "Lanjutan",
    "Advanced",
    "Avanzado",
    "Options avancées",
    "Avanzate",
    "高度な設定",
    "고급",
    "Zaawansowane",
    "Avançado",
    "Продвинутые",
    "Gelişmiş ayarlar",
    "Розширені",
    "Nâng cao",
    "高级选项"
  ],
  apply: [
    "Anwenden",
    "Terapkan",
    "Apply",
    "Aplicar",
    ,
    ,
    "適用",
    ,
    "Zastosuj",
    "Aplicar",
    "Применить",
    "Uygula",
    "Застосувати",
    "Áp dụng",
    "应用"
  ],
  audio: [
    "Audio",
    "Audio",
    "Audio",
    "Audio",
    "Audio",
    "Audio",
    "音声",
    "오디오",
    "Dźwięk",
    "Áudio",
    "Звук",
    "Ses",
    "Звук",
    "Âm thanh",
    "音频"
  ],
  auto: [
    "Automatisch",
    "Otomatis",
    "Auto",
    "Auto",
    "Auto",
    "Automatico",
    "自動",
    "자동",
    "Automatyczne",
    "Automático",
    "Автоматически",
    "Otomatik",
    "Автоматично",
    "Tự động",
    "自动"
  ],
  "badge-audio": [
    "Audio",
    "Audio",
    "Audio",
    "Audio",
    "Audio",
    "Audio",
    "音声",
    "오디오",
    "Dźwięk",
    "Áudio",
    "Звук",
    "Ses",
    "Звук",
    "Tiếng",
    "音频"
  ],
  "badge-battery": [
    "Batterie",
    "Baterai",
    "Battery",
    "Batería",
    "Batterie",
    "Batteria",
    "バッテリー",
    "배터리",
    "Bateria",
    "Bateria",
    "Батарея",
    "Pil",
    "Батарея",
    "Pin",
    "电量"
  ],
  "badge-in": [
    "Empfangen",
    "Masuk",
    "In",
    "Entrada",
    "Dans",
    "DL",
    "IN",
    "다운로드",
    "Pobieranie",
    "Recebidos",
    "Входящие",
    "Gelen",
    "Завантаження",
    "Nhận",
    "下载"
  ],
  "badge-out": [
    "Gesendet",
    "Keluar",
    "Out",
    "Salida",
    "Sorti",
    "UP",
    "OUT",
    "업로드",
    "Wysyłanie",
    "Enviados",
    "Исходящие",
    "Giden",
    "Вивантаження",
    "Gởi",
    "上传"
  ],
  "badge-playtime": [
    "Spielzeit",
    "Waktu bermain",
    "Playtime",
    "Tiempo jugado",
    "Temps de jeu",
    "In gioco da",
    "プレイ時間",
    "플레이한 시간",
    "Czas gry",
    "Tempo de jogo",
    "Время в игре",
    "Oynanış süresi",
    "Час гри",
    "Giờ chơi",
    "游玩时间"
  ],
  "badge-server": [
    "Server",
    "Server",
    "Server",
    "Servidor",
    "Serveur",
    "Server",
    "サーバー",
    "서버",
    "Serwer",
    "Servidor",
    "Сервер",
    "Sunucu",
    "Сервер",
    "Máy chủ",
    "服务器"
  ],
  "badge-video": [
    "Video",
    "Video",
    "Video",
    "Video",
    "Vidéo",
    "Video",
    "映像",
    "비디오",
    "Obraz",
    "Vídeo",
    "Видео",
    "Görüntü",
    "Відео",
    "Hình",
    "视频"
  ],
  "bottom-left": [
    "Unten links",
    "Kiri bawah",
    "Bottom-left",
    "Inferior izquierdo",
    "En bas à gauche",
    "In basso a sinistra",
    "左下",
    "좌측 하단",
    "Lewy dolny róg",
    "Inferior esquerdo",
    "Левый нижний угол",
    "Sol alt",
    "Внизу ліворуч",
    "Phía dưới bên trái",
    "左下角"
  ],
  "bottom-right": [
    "Unten rechts",
    "Kanan bawah",
    "Bottom-right",
    "Inferior derecha",
    "Bas-droit",
    "In basso a destra",
    "右下",
    "우측 하단",
    "Prawy dolny róg",
    "Inferior direito",
    "Правый нижний угол",
    "Sağ alt",
    "Внизу праворуч",
    "Phía dưới bên phải",
    "右下角"
  ],
  brightness: [
    "Helligkeit",
    "Kecerahan",
    "Brightness",
    "Brillo",
    "Luminosité",
    "Luminosità",
    "輝度",
    "밝기",
    "Jasność",
    "Brilho",
    "Яркость",
    "Aydınlık",
    "Яскравість",
    "Độ sáng",
    "亮度"
  ],
  "browser-unsupported-feature": [
    "Dein Browser unterstützt diese Funktion nicht",
    "Browser anda tidak mendukung fitur ini",
    "Your browser doesn't support this feature",
    "Su navegador no soporta esta característica",
    "Votre navigateur ne supporte pas cette fonctionnalité",
    "Il tuo browser non supporta questa funzione",
    "お使いのブラウザはこの機能をサポートしていません。",
    "브라우저에서 이 기능을 지원하지 않습니다.",
    "Twoja przeglądarka nie obsługuje tej funkcji",
    "Seu navegador não suporta este recurso",
    "Ваш браузер не поддерживает эту функцию",
    "Web tarayıcınız bu özelliği desteklemiyor",
    "Ваш браузер не підтримує цю функцію",
    "Trình duyệt không hỗ trợ tính năng này",
    "您的浏览器不支持此功能"
  ],
  "can-stream-xbox-360-games": [
    "Kann Xbox 360 Spiele streamen",
    "Dapat melakukan stream game Xbox 360",
    "Can stream Xbox 360 games",
    "Puede transmitir juegos de Xbox 360",
    ,
    "Puoi riprodurre i giochi Xbox 360",
    "Xbox 360ゲームのストリーミング可能",
    "Xbox 360 게임 스트림 가능",
    "Można strumieniować gry Xbox 360",
    "Pode transmitir jogos de Xbox 360",
    "Позволяет транслировать Xbox 360 игры",
    "Xbox 360 oyunlarına erişim sağlanabilir",
    "Дозволяє транслювати ігри Xbox 360",
    "Có thể stream các game Xbox 360",
    "可以进行流式传输Xbox360游戏"
  ],
  cancel: [
    "Abbrechen",
    "Batal",
    "Cancel",
    "Cancelar",
    ,
    "Cancella",
    "キャンセル",
    "취소",
    "Anuluj",
    "Cancelar",
    "Отмена",
    "Vazgeç",
    "Скасувати",
    "Hủy",
    "取消"
  ],
  "cant-stream-xbox-360-games": [
    "Kann Xbox 360 Spiele nicht streamen",
    "Tidak dapat melakukan stream game Xbox 360",
    "Can't stream Xbox 360 games",
    "No puede transmitir juegos de Xbox 360",
    ,
    "Impossibile riprodurre i giochi Xbox 360",
    "Xbox 360ゲームのストリーミング不可",
    "Xbox 360 게임 스트림 불가",
    "Nie można strumieniować gier Xbox 360",
    "Não pode transmitir jogos de Xbox 360",
    "Невозможно транслировать игры Xbox 360",
    "Xbox 360 oyunlarına erişim sağlanamaz",
    "Не дозволяє транслювати ігри Xbox 360",
    "Không thể stream các game Xbox 360",
    "不可以进行流式传输Xbox360游戏"
  ],
  clarity: [
    "Klarheit",
    "Kejernihan",
    "Clarity",
    "Claridad",
    "Clarté",
    "Nitidezza",
    "明瞭度（クラリティ）",
    "선명도",
    "Ostrość",
    "Nitidez",
    "Чёткость",
    "Netlik",
    "Чіткість",
    "Độ nét",
    "清晰度"
  ],
  "clarity-boost-warning": [
    "Diese Einstellungen funktionieren nicht, wenn \"Clarity Boost\" aktiviert ist",
    "Pengaturan ini tidak bekerja ketika mode \"Kejernihan\" aktif",
    "These settings don't work when the Clarity Boost mode is ON",
    "Estos ajustes no funcionan cuando el modo Clarity Boost está activado",
    "Ces paramètres ne fonctionnent pas lorsque le mode Clarity Boost est activé",
    "Queste impostazioni non funzionano quando la modalità Clarity Boost è attiva",
    "クラリティブーストが有効の場合、映像設定は無効化されます。",
    "이 설정들은 선명도 향상 기능이 켜져 있을 때는 동작하지 않습니다.",
    'Te ustawienia nie będą działać, gdy tryb "Clarity Boost" jest włączony',
    'Estas configurações não funcionam quando o modo "Clarity Boost" está ATIVADO',
    "Эти настройки не работают, когда включен режим Clarity Boost",
    "Netliği Artırma modu açıkken bu ayarlar ETKİSİZDİR",
    'Ці налаштування не працюють, коли увімкнено режим "Clarity Boost"',
    "Các tùy chỉnh này không hoạt động khi chế độ Clarity Boost đang được bật",
    "这些设置在 Clarity Boost 清晰度增强 开启时不可用"
  ],
  clear: [
    "Zurücksetzen",
    "Bersihkan",
    "Clear",
    "Borrar",
    ,
    ,
    "消去",
    "비우기",
    "Wyczyść",
    "Limpar",
    "Очистить",
    "Temizle",
    "Очистити",
    "Xóa",
    "清空"
  ],
  close: [
    "Schließen",
    "Tutup",
    "Close",
    "Cerrar",
    "Fermer",
    "Chiudi",
    "閉じる",
    "닫기",
    "Zamknij",
    "Fechar",
    "Закрыть",
    "Kapat",
    "Закрити",
    "Đóng",
    "关闭"
  ],
  "combine-audio-video-streams": [
    "Audio- und Video-Streams kombinieren",
    "Gabung audio & video stream",
    "Combine audio & video streams",
    "Combinar flujos de audio y vídeo",
    ,
    ,
    "音声を映像ストリーミングと統合",
    ,
    "Połącz strumienie audio i wideo",
    "Combinar fluxos de áudio e vídeo",
    "Объединить аудио и видео потоки",
    "Ses ve görüntü akışını birleştir",
    "Поєднайте аудіо та відео потоки",
    "Hòa hợp nguồn của âm thanh và hình ảnh",
    "合并视频音频流"
  ],
  "combine-audio-video-streams-summary": [
    "Könnte das Problem mit verzögertem Ton beheben",
    "Mungkin memperbaiki masalah lag pada audio",
    "May fix the laggy audio problem",
    "Puede arreglar el problema de audio con retraso",
    ,
    ,
    "音声の遅延を改善できる可能性があります",
    ,
    "Może rozwiązać problem z zacinającym dźwiękiem",
    "Pode corrigir o problema de áudio atrasado",
    "Может исправить проблему подвисания звука",
    "Sesteki gecikme sorununa çözüm olabilir",
    "Може виправити проблему із затримкою звуку",
    "Có thể sửa được lỗi trễ tiếng",
    "有助于缓解音频延迟"
  ],
  "conditional-formatting": [
    "Zustandsabhängige Textfarbe",
    "Format teks kondisional",
    "Conditional formatting text color",
    "Color condicional de formato de texto",
    "Couleur du texte de mise en forme conditionnelle",
    "Colore testo formattazione condizionale",
    "状態に応じた文字色で表示",
    "통계에 따라 글자 색 지정",
    "Kolor tekstu zależny od wartości",
    "Cor do texto de formatação condicional",
    "Цвет текста в зависимости от условий",
    "Metin renginin koşullu biçimlendirilmesi",
    "Колір тексту в залежності від умов",
    "Thay đổi màu chữ tùy theo giá trị",
    "更改文本颜色"
  ],
  "confirm-delete-preset": [
    "Möchtest Du diese Voreinstellung löschen?",
    "Apakah anda yakin ingin menghapus preset ini?",
    "Do you want to delete this preset?",
    "¿Desea eliminar este preajuste?",
    "Voulez-vous supprimer ce préréglage?",
    ,
    "このプリセットを削除しますか？",
    "이 프리셋을 삭제하시겠습니까?",
    "Czy na pewno chcesz usunąć ten szablon?",
    "Você quer excluir esta predefinição?",
    "Вы точно хотите удалить этот шаблон?",
    "Bu hazır ayarı silmek istiyor musunuz?",
    "Ви бажаєте видалити цей пресет?",
    "Bạn có muốn xoá thiết lập sẵn này không?",
    "您想要删除此预设吗？"
  ],
  "confirm-reload-stream": [
    "Möchtest Du den Stream aktualisieren?",
    "Apakah anda ingin memuat ulang stream?",
    "Do you want to refresh the stream?",
    `¿Quieres actualizar el stream?
`,
    "Voulez-vous actualiser le stream ?",
    "Vuoi aggiornare lo stream?",
    "ストリーミングをリフレッシュしますか？",
    "스트리밍을 재시작할까요?",
    "Czy chcesz odświeżyć transmisję?",
    "Você deseja atualizar a transmissão?",
    "Вы хотите перезапустить поток?",
    "Yayını yeniden başlatmak istiyor musunuz?",
    "Бажаєте оновити трансляцію?",
    "Bạn có muốn kết nối lại stream không?",
    "您想要刷新吗？"
  ],
  connected: [
    "Verbunden",
    "Tersambung",
    "Connected",
    "Conectado",
    ,
    ,
    "接続済み",
    ,
    "Połączony",
    "Conectado",
    "Подключен",
    "Bağlı",
    "Під’єднано",
    "Đã kết nối",
    "已连接"
  ],
  "console-connect": [
    "Verbinden",
    "Sambungkan",
    "Connect",
    "Conectar",
    ,
    "Connetti",
    "本体に接続",
    "콘솔 연결",
    "Połącz",
    "Conectar",
    "Подключиться",
    "Bağlan",
    "Під’єднатися",
    "Kết nối",
    "连接"
  ],
  contrast: [
    "Kontrast",
    "Kontras",
    "Contrast",
    "Contraste",
    "Contraste",
    "Contrasto",
    "コントラスト",
    "대비",
    "Kontrast",
    "Contraste",
    "Контрастность",
    "Karşıtlık",
    "Контрастність",
    "Độ tương phản",
    "对比度"
  ],
  controller: [
    "Controller",
    "Kontroler",
    "Controller",
    "Joystick",
    "Contrôle",
    "Controller",
    "コントローラー",
    "컨트롤러",
    "Kontroler",
    "Controle",
    "Контроллер",
    "Oyun Kumandası",
    "Контролер",
    "Bộ điều khiển",
    "手柄"
  ],
  "controller-shortcuts": [
    "Controller-Shortcuts",
    "Pintasan kontroler",
    "Controller shortcuts",
    "Habilitar atajos del Joystick",
    ,
    "Abilita scrociatorie da controller",
    "コントローラーショートカット",
    ,
    "Skróty kontrolera",
    "Atalhos do controle",
    "Горячие клавиши контроллера",
    "Oyun kumandası kısayolları",
    "Ярлики контролера",
    "Các phím tắt tay cầm",
    "手柄快捷键"
  ],
  "controller-vibration": [
    "Vibration des Controllers",
    "Getaran kontroler",
    "Controller vibration",
    "Vibración del mando",
    ,
    ,
    "コントローラーの振動",
    "컨트롤러 진동",
    "Wibracje kontrolera",
    "Vibração do controle",
    "Вибрация контроллера",
    "Oyun kumandası titreşimi",
    "Вібрація контролера",
    "Rung bộ điều khiển",
    "控制器振动"
  ],
  copy: [
    "Kopieren",
    "Salin",
    "Copy",
    "Copiar",
    ,
    ,
    "コピー",
    "복사",
    "Kopiuj",
    "Copiar",
    "Скопировать",
    "Kopyala",
    "Копіювати",
    "Sao chép",
    "复制"
  ],
  custom: [
    "Benutzerdefiniert",
    "Kustom",
    "Custom",
    "Personalizado",
    "Personnalisée",
    "Personalizzato",
    "カスタム",
    "사용자 지정",
    "Niestandardowe",
    "Personalizado",
    "Вручную",
    "Özel",
    "Користувацькі",
    "Tùy chỉnh",
    "自定义"
  ],
  "deadzone-counterweight": [
    "Deadzone Gegengewicht",
    "Pengimbang deadzone",
    "Deadzone counterweight",
    "Contrapeso de la zona muerta",
    ,
    ,
    "デッドゾーンのカウンターウエイト",
    ,
    "Przeciwwaga martwej strefy",
    "Contrapeso de zona morta",
    "Противодействие мертвой зоне игры",
    "Ölü alan denge ağırlığı",
    "Противага Deadzone",
    "Đối trọng vùng chết",
    "死区补偿"
  ],
  default: [
    "Standard",
    "Bawaan",
    "Default",
    "Por defecto",
    "Par défaut",
    "Predefinito",
    "デフォルト",
    "기본값",
    "Domyślny",
    "Padrão",
    "По умолчанию",
    "Varsayılan",
    "За замовчуванням",
    "Mặc định",
    "默认"
  ],
  delete: [
    "Löschen",
    "Hapus",
    "Delete",
    "Borrar",
    ,
    "Elimina",
    "削除",
    "삭제",
    "Usuń",
    "Deletar",
    "Удалить",
    "Sil",
    "Видалити",
    "Xóa",
    "删除"
  ],
  "device-unsupported-touch": [
    "Dein Gerät hat keine Touch-Unterstützung",
    "Perangkat anda tidak mendukung layar sentuh",
    "Your device doesn't have touch support",
    "Tu dispositivo no tiene soporte táctil",
    "Votre appareil n'a pas de support tactile",
    "Il tuo dispositivo non ha uno schermo touch",
    "お使いのデバイスはタッチ機能をサポートしていません。",
    "브라우저에서 터치를 지원하지 않습니다.",
    "Twoje urządzenie nie obsługuję tej funkcji",
    "Seu dispositivo não possui suporte de toque",
    "Ваше устройство не поддерживает сенсорное управление",
    "Cihazınızda dokunmatik ekran özelliği yoktur",
    "Ваш пристрій не має підтримки сенсорного керування",
    "Thiết bị này không hỗ trợ cảm ứng",
    "您的设备不支持触摸"
  ],
  "device-vibration": [
    "Vibration des Geräts",
    "Getaran perangkat",
    "Device vibration",
    "Vibración del dispositivo",
    ,
    ,
    "デバイスの振動",
    "기기 진동",
    "Wibracje urządzenia",
    "Vibração do dispositivo",
    "Вибрация устройства",
    "Cihaz titreşimi",
    "Вібрація пристрою",
    "Rung thiết bị",
    "设备振动"
  ],
  "device-vibration-not-using-gamepad": [
    "An, wenn kein Gamepad verbunden",
    "Aktif ketika tidak menggunakan gamepad",
    "On when not using gamepad",
    "Activado cuando no se utiliza el mando",
    ,
    ,
    "ゲームパッド未使用時にオン",
    "게임패드를 사용하지 않을 때",
    "Włączone, gdy nie używasz kontrolera",
    "Ativar quando não estiver usando o dispositivo",
    "Включить когда не используется геймпад",
    "Oyun kumandası bağlanmadan titreşim",
    "Увімкнена, коли не використовується геймпад",
    "Bật khi không dùng tay cầm",
    "当不使用游戏手柄时"
  ],
  disable: [
    "Deaktiviert",
    "Mati",
    "Disable",
    "Deshabilitar",
    "Désactiver",
    "Disabilita",
    "無効",
    "비활성화",
    "Wyłącz",
    "Desabilitar",
    "Отключить",
    "Devre dışı bırak",
    "Вимкнути",
    "Vô hiệu hóa",
    "禁用"
  ],
  "disable-post-stream-feedback-dialog": [
    "Feedback-Dialog beim Beenden deaktivieren",
    "Matikan umpan balik dialog stream",
    "Disable post-stream feedback dialog",
    "Desactivar diálogo de retroalimentación post-stream",
    "Désactiver la boîte de dialogue de commentaires post-stream",
    "Disabilita la finestra di feedback al termine dello stream",
    "ストリーミング終了後のフィードバック画面を非表示",
    "스트림 후 피드백 다이얼 비활성화",
    "Wyłącz okno opinii po zakończeniu transmisji",
    "Desativar o diálogo de comentários pós-transmissão",
    "Отключить диалог обратной связи после стрима",
    "Yayın sonrası geribildirim ekranını kapat",
    "Відключити діалогове вікно зворотного зв’язку після трансляції",
    "Tắt hộp thoại góp ý sau khi chơi xong",
    "禁用反馈问卷"
  ],
  "disable-social-features": [
    "Soziale Funktionen deaktivieren",
    "Matikan fitur social",
    "Disable social features",
    "Desactivar características sociales",
    "Désactiver les fonctionnalités sociales",
    "Disabilita le funzioni social",
    "ソーシャル機能を無効",
    "소셜 기능 비활성화",
    "Wyłącz funkcje społecznościowe",
    "Desativar recursos sociais",
    "Отключить социальные функции",
    "Sosyal özellikleri kapat",
    "Вимкнути соціальні функції",
    "Khóa các tính năng xã hội",
    "禁用社交功能"
  ],
  "disable-xcloud-analytics": [
    "xCloud-Datenanalyse deaktivieren",
    "Matikan analisis xCloud",
    "Disable xCloud analytics",
    "Desactivar análisis de xCloud",
    "Désactiver les analyses xCloud",
    "Disabilita l'analitica di xCloud",
    "xCloudアナリティクスを無効",
    "xCloud 통계 비활성화",
    "Wyłącz analitykę xCloud",
    "Desativar telemetria do xCloud",
    "Отключить аналитику xCloud",
    "xCloud'un veri toplamasını devre dışı bırak",
    "Вимкнути аналітику xCloud",
    "Khóa phân tích thông tin của xCloud",
    "关闭 xCloud 遥测数据统计"
  ],
  disabled: [
    "Deaktiviert",
    "Dinonaktifkan",
    "Disabled",
    "Desactivado",
    ,
    ,
    "無効",
    "비활성화됨",
    "Wyłączony",
    "Desativado",
    "Отключено",
    "Kapalı",
    "Вимкнено",
    "Đã tắt",
    "禁用"
  ],
  disconnected: [
    "Getrennt",
    "Terputus",
    "Disconnected",
    "Desconectado",
    ,
    ,
    "切断",
    ,
    "Rozłączony",
    "Desconectado",
    "Отключен",
    "Bağlı değil",
    "Від'єднано",
    "Đã ngắt kết nối",
    "已断开连接"
  ],
  edit: [
    "Bearbeiten",
    "Edit",
    "Edit",
    "Editar",
    ,
    "Modifica",
    "編集",
    "편집",
    "Edytuj",
    "Editar",
    "Редактировать",
    "Düzenle",
    "Редагувати",
    "Sửa",
    "编辑"
  ],
  "enable-controller-shortcuts": [
    "Controller-Shortcuts aktivieren",
    "Nyalakan pintas kontroler",
    "Enable controller shortcuts",
    "Habilitar accesos directos del Joystick",
    "Activer les raccourcis du contrôle",
    "Consenti scorciatoie da controller",
    "コントローラーショートカットを有効化",
    "컨트롤러 숏컷 활성화",
    "Włącz skróty kontrolera",
    "Ativar atalhos do controle",
    "Включить быстрые клавиши контроллера",
    "Oyun kumandası kısayollarını aç",
    "Увімкнути ярлики контролера",
    "Bật tính năng phím tắt cho bộ điều khiển",
    "启用手柄快捷方式"
  ],
  "enable-local-co-op-support": [
    "Lokale Koop-Unterstützung aktivieren",
    "Nyalakan dukungan mode lokal co-op",
    "Enable local co-op support",
    "Habilitar soporte co-op local",
    ,
    ,
    "ローカルマルチプレイのサポートを有効化",
    ,
    "Włącz lokalny co-op",
    "Habilitar o suporte a co-op local",
    "Включить поддержку локальной кооперативной игры",
    "Yerel çok oyuncu desteğini aktive et",
    "Увімкнути локальну co-op підтримку",
    "Kích hoạt tính năng chơi chung cục bộ",
    "启用本地多人联机"
  ],
  "enable-local-co-op-support-note": [
    "Funktioniert nur, wenn das Spiel kein anderes Profil benötigt",
    "Hanya berfungsi saat permainan tidak membutuhkan profil berbeda",
    "Only works if the game doesn't require a different profile",
    "Solo funciona si el juego no requiere un perfil diferente",
    ,
    ,
    "別アカウントでのサインインを必要としないゲームのみ動作します",
    ,
    "Działa tylko wtedy, gdy gra nie wymaga innego profilu",
    "Só funciona se o jogo não exigir um perfil diferente",
    "Работает только в том случае, если игра не требует другого профиля",
    "Bu seçenek ancak oyun ayrı profillere giriş yapılmasını istemiyorsa etki eder",
    "Працює, лише якщо для гри не потрібен інший профіль",
    "Chỉ hoạt động nếu game không yêu cầu thêm tài khoản khác",
    "仅在当前游戏不要求切换账户时才能使用"
  ],
  "enable-mic-on-startup": [
    "Mikrofon bei Spielstart aktivieren",
    "Nyalakan mikrofon saat permainan diluncurkan",
    "Enable microphone on game launch",
    "Activar micrófono al iniciar el juego",
    "Activer le microphone lors du lancement du jeu",
    "Abilita il microfono all'avvio del gioco",
    "ゲーム起動時にマイクを有効化",
    "게임 시작 시 마이크 활성화",
    "Włącz mikrofon przy uruchomieniu gry",
    "Ativar microfone ao iniciar um jogo",
    "Автоматически включать микрофон при запуске игры",
    "Oyun başlarken mikrofonu aç",
    "Увімкнути мікрофон при запуску гри",
    "Bật mic lúc vào game",
    "游戏启动时打开麦克风"
  ],
  "enable-mkb": [
    "Controller mit Maus & Tastatur emulieren",
    "Tirukan kontroler menggunakan Mouse & Keyboard",
    "Emulate controller with Mouse & Keyboard",
    "Emular mandos con teclado y ratón",
    ,
    "Abilita il supporto per mouse e tastiera",
    "マウス＆キーボード操作をコントローラー化",
    "마우스 & 키보드 활성화",
    "Emuluj kontroler za pomocą myszy i klawiatury",
    "Emular controlador com mouse e teclado",
    "Эмулировать контроллер с помощью мыши и клавиатуры",
    "Klavye ve fareyle oyun kumandasını taklit et",
    "Емуляція контролера за допомогою миші та клавіатури",
    "Giả lập tay cầm bằng Chuột và Bàn phím",
    "使用键鼠模拟手柄输入"
  ],
  "enable-quick-glance-mode": [
    "\"Kurzer Blick\"-Modus aktivieren",
    "Aktifkan mode \"Quick Glance\"",
    "Enable \"Quick Glance\" mode",
    'Activar modo "Vista rápida"',
    'Activer le mode "Aperçu rapide"',
    "Abilita la modalità Quick Glance",
    "クイック確認モードを有効化",
    '"퀵 글랜스" 모드 활성화',
    'Włącz tryb "Quick Glance"',
    "Ativar modo \"Relance\"",
    "Включить режим «Быстрый взгляд»",
    '"Seri Bakış" modunu aç',
    'Увімкнути режим "Quick Glance"',
    'Bật chế độ "Xem nhanh"',
    "仅在打开设置时显示统计信息"
  ],
  "enable-remote-play-feature": [
    "\"Remote Play\" Funktion aktivieren",
    "Nyalakan fitur \"Remote Play\"",
    "Enable the \"Remote Play\" feature",
    'Activar la función "Reproducción remota"',
    ,
    "Abilitare la funzione \"Riproduzione remota\"",
    "リモートプレイ機能を有効化",
    '"리모트 플레이" 기능 활성화',
    'Włącz funkcję "Gra zdalna"',
    'Ativar o recurso "Reprodução Remota"',
    "Включить функцию «Удаленная игра»",
    '"Uzaktan Oynama" özelliğini aktive et',
    'Увімкнути функцію "Remote Play"',
    'Bật tính năng "Chơi Từ Xa"',
    '启用"Remote Play"主机串流'
  ],
  "enable-volume-control": [
    "Lautstärkeregelung aktivieren",
    "Nyalakan fitur kontrol volume",
    "Enable volume control feature",
    "Habilitar la función de control de volumen",
    "Activer la fonction de contrôle du volume",
    "Abilità controlli volume",
    "音量調節機能を有効化",
    "음량 조절 기능 활성화",
    "Włącz funkcję kontroli głośności",
    "Ativar recurso de controle de volume",
    "Включить управление громкостью",
    "Ses düzeyini yönetmeyi etkinleştir",
    "Увімкнути функцію керування гучністю",
    "Bật tính năng điều khiển âm lượng",
    "启用音量控制"
  ],
  enabled: [
    "Aktiviert",
    "Diaktifkan",
    "Enabled",
    "Activado",
    ,
    ,
    "有効",
    "활성화됨",
    "Włączony",
    "Ativado",
    "Включено",
    "Açık",
    "Увімкнено",
    "Đã bật",
    "启用"
  ],
  experimental: [
    "Experimentell",
    "Eksperimental",
    "Experimental",
    "Experimental",
    ,
    ,
    "実験的機能",
    ,
    "Eksperymentalne",
    "Experimental",
    "Экспериментально",
    "Deneme aşamasında",
    "Експериментальне",
    "Thử nghiệm",
    "实验性功能"
  ],
  export: [
    "Exportieren",
    "Ekspor",
    "Export",
    "Exportar",
    ,
    ,
    "エクスポート（書出し）",
    "내보내기",
    "Eksportuj",
    "Exportar",
    "Экспортировать",
    "Dışa aktar",
    "Експорт",
    "Xuất",
    "导出"
  ],
  fast: [
    "Schnell",
    "Cepat",
    "Fast",
    "Rápido",
    ,
    "Veloce",
    "高速",
    "빠름",
    "Szybko",
    "Rápido",
    "Быстрый",
    "Hızlı",
    "Швидкий",
    "Nhanh",
    "快速"
  ],
  "fortnite-allow-stw-mode": [
    'Erlaubt das Spielen im "STW"-Modus auf Mobilgeräten',
    "Aktikan mode STW",
    "Allows playing STW mode on mobile",
    "Permitir jugar al modo STW en el móvil",
    ,
    ,
    "モバイル版で「世界を救え」をプレイできるようになります",
    ,
    "Zezwól na granie w tryb STW na urządzeniu mobilnym",
    "Permitir a reprodução do modo STW no celular",
    "Позволяет играть в режиме STW на мобильных устройствах",
    "Mobil cihazda Fortnite: Dünyayı Kurtar modunu etkinleştir",
    "Дозволити відтворення режиму STW на мобільному пристрої",
    "Cho phép chơi chế độ STW trên điện thoại",
    "允许游玩Save the World模式"
  ],
  "fortnite-force-console-version": [
    "Fortnite: Erzwinge Konsolenversion",
    "Fortnite: Paksa versi konsol",
    "Fortnite: force console version",
    "Fortnite: forzar versión de consola",
    ,
    "Fortnite: Foza la versione console",
    "Fortnite: 強制的にコンソール版を起動する",
    ,
    "Fortnite: wymuś wersję konsolową",
    "Fortnite: forçar versão para console",
    "Fortnite: форсированная консольная версия",
    "Fortnite'ın konsol sürümünü aç",
    "Fortnite: примусова консольна версія",
    "Fortnite: bắt buộc phiên bản console",
    "Fortnite: 强制使用主机版客户端"
  ],
  "getting-consoles-list": [
    "Rufe Liste der Konsolen ab...",
    "Mendapatkan daftar konsol...",
    "Getting the list of consoles...",
    "Obteniendo la lista de consolas...",
    ,
    "Ottenere la lista delle consoles...",
    "本体のリストを取得中...",
    "콘솔 목록 불러오는 중...",
    "Pobieranie listy konsoli...",
    "Obtendo a lista de consoles...",
    "Получение списка консолей...",
    "Konsol listesine erişiliyor...",
    "Отримання списку консолей...",
    "Đang lấy danh sách các console...",
    "正在获取控制台列表..."
  ],
  help: [
    "Hilfe",
    "Bantuan",
    "Help",
    "Ayuda",
    ,
    ,
    "ヘルプ",
    ,
    "Pomoc",
    "Ajuda",
    "Справка",
    "Yardım",
    "Довідка",
    "Trợ giúp",
    "帮助"
  ],
  "hide-idle-cursor": [
    "Mauszeiger bei Inaktivität ausblenden",
    "Sembunyikan kursor mouse saat tidak digunakan",
    "Hide mouse cursor on idle",
    "Ocultar el cursor del ratón al estar inactivo",
    "Masquer le curseur de la souris",
    "Nascondi il cursore previa inattività",
    "マウスカーソルを3秒間動かしていない場合に非表示",
    "대기 상태에서 마우스 커서 숨기기",
    "Ukryj kursor myszy podczas bezczynności",
    "Ocultar o cursor do mouse quando ocioso",
    "Скрыть курсор мыши при бездействии",
    "Boştayken fare imlecini gizle",
    "Приховати курсор при очікуванні",
    "Ẩn con trỏ chuột khi không di chuyển",
    "空闲时隐藏鼠标"
  ],
  "hide-scrollbar": [
    "Scrollbalken der Webseite ausblenden",
    "Sembunyikan bilah gulir halaman",
    "Hide web page's scrollbar",
    "Oculta la barra de desplazamiento de la página",
    ,
    ,
    "Webページのスクロールバーを隠す",
    ,
    "Ukryj pasek przewijania strony",
    "Ocultar a barra de rolagem da página",
    "Скрыть полосу прокрутки страницы",
    "Yandaki kaydırma çubuğunu gizle",
    "Приховати смугу прокрутки вебсторінок",
    "Ẩn thanh cuộn của trang web",
    "隐藏浏览器滚动条"
  ],
  "hide-system-menu-icon": [
    "Symbol des System-Menüs ausblenden",
    "Sembunyikan ikon menu sistem",
    "Hide System menu's icon",
    "Ocultar el icono del menú del sistema",
    "Masquer l'icône du menu système",
    "Nascondi icona del menu a tendina",
    "システムメニューのアイコンを非表示",
    "시스템 메뉴 아이콘 숨기기",
    "Ukryj ikonę menu systemu",
    "Ocultar ícone do menu do Sistema",
    "Скрыть значок системного меню",
    "Sistem menüsü simgesini gizle",
    "Приховати іконку системного меню",
    "Ẩn biểu tượng của menu Hệ thống",
    "隐藏系统菜单图标"
  ],
  "horizontal-sensitivity": [
    "Horizontale Empfindlichkeit",
    "Sensitifitas horizontal",
    "Horizontal sensitivity",
    "Sensibilidad horizontal",
    ,
    ,
    "左右方向の感度",
    ,
    "Czułość pozioma",
    "Sensibilidade horizontal",
    "Горизонтальная чувствительность",
    "Yatay hassasiyet",
    "Горизонтальна чутливість",
    "Độ nhạy ngang",
    "水平灵敏度"
  ],
  import: [
    "Importieren",
    "Impor",
    "Import",
    "Importar",
    ,
    ,
    "インポート（読込み）",
    "가져오기",
    "Importuj",
    "Importar",
    "Импортировать",
    "İçeri aktar",
    "Імпорт",
    "Nhập",
    "导入"
  ],
  "install-android": [
    '"Better xCloud" App für Android installieren',
    "Pasang aplikasi Better xCloud untuk Android",
    "Install Better xCloud app for Android",
    "Instale la aplicación Better xCloud para Android",
    ,
    ,
    "Android用のBetter xCloudをインストール",
    ,
    "Zainstaluj aplikację Better xCloud na Androida",
    "Instalar o aplicativo Better xCloud para Android",
    "Установите приложение Better xCloud для Android",
    "Better xCloud'un Android uygulamasını indir",
    "Встановити додаток Better xCloud для Android",
    "Cài đặt ứng dụng Better xCloud cho Android",
    "安装Better xCloud安卓客户端"
  ],
  "keyboard-shortcuts": [
    "Tastatur-Shortcuts",
    "Pintasan keyboard",
    "Keyboard shortcuts",
    "Atajos del teclado",
    ,
    ,
    "キーボードショートカット",
    ,
    "Skróty klawiszowe",
    "Atalhos do teclado",
    "Горячие клавиши",
    "Klavye kısayolları",
    "Комбінації клавіш",
    "Các phím tắt bàn phím",
    "键盘快捷键"
  ],
  language: [
    "Sprache",
    "Bahasa",
    "Language",
    "Idioma",
    "Langue",
    "Lingua",
    "言語",
    "언어",
    "Język",
    "Idioma",
    "Язык",
    "Dil",
    "Мова",
    "Ngôn ngữ",
    "切换语言"
  ],
  large: [
    "Groß",
    "Besar",
    "Large",
    "Grande",
    "Grande",
    "Grande",
    "大",
    "크게",
    "Duży",
    "Grande",
    "Большой",
    "Büyük",
    "Великий",
    "Lớn",
    "大"
  ],
  layout: [
    "Layout",
    "Tata letak",
    "Layout",
    "Diseño",
    ,
    "Layout",
    "レイアウト",
    "레이아웃",
    "Układ",
    "Layout",
    "Расположение",
    "Arayüz Görünümü",
    "Розмітка",
    "Bố cục",
    "布局"
  ],
  "left-stick": [
    "Linker Stick",
    "Stik kiri",
    "Left stick",
    "Joystick izquierdo",
    ,
    ,
    "左スティック",
    "왼쪽 스틱",
    "Lewy drążek analogowy",
    "Direcional analógico esquerdo",
    "Левый стик",
    "Sol analog çubuk",
    "Лівий стік",
    "Analog trái",
    "左摇杆"
  ],
  "loading-screen": [
    "Ladebildschirm",
    "Pemuatan layar",
    "Loading screen",
    "Pantalla de carga",
    "Écran de chargement",
    "Schermata di caricamento",
    "ロード画面",
    "로딩 화면",
    "Ekran wczytywania",
    "Tela de carregamento",
    "Экран загрузки",
    "Yükleme ekranı",
    "Екран завантаження",
    "Màn hình chờ",
    "载入画面"
  ],
  "local-co-op": [
    "Lokales Koop",
    "Lokal co-op",
    "Local co-op",
    "Co-op local",
    ,
    ,
    "ローカルマルチプレイ",
    ,
    "Lokalna kooperacja",
    "Co-op local",
    "Локальная кооперативная игра",
    "Yerel çoklu oyunculu",
    "Локальний co-op",
    "Chơi chung cục bộ",
    "本地多人联机"
  ],
  "map-mouse-to": [
    "Maus binden an",
    "Petakan mouse ke",
    "Map mouse to",
    "Mapear ratón a",
    ,
    ,
    "マウスの割り当て",
    ,
    "Przypisz myszkę do",
    "Mapear o mouse para",
    "Наведите мышку на",
    "Fareyi ata",
    "Прив'язати мишу до",
    "Gán chuột với",
    "将鼠标映射到"
  ],
  "may-not-work-properly": [
    "Funktioniert evtl. nicht fehlerfrei!",
    "Mungkin tidak berfungsi dengan baik!",
    "May not work properly!",
    "¡Puede que no funcione correctamente!",
    ,
    "Potrebbe non funzionare correttamente!",
    "正常に動作しない場合があります！",
    "제대로 작동하지 않을 수 있음!",
    "Może nie działać poprawnie!",
    "Pode não funcionar corretamente!",
    "Может работать некорректно!",
    "Düzgün çalışmayabilir!",
    "Може працювати некоректно!",
    "Có thể không hoạt động!",
    "可能无法正常工作！"
  ],
  "menu-stream-settings": [
    "Stream Einstellungen",
    "Pengaturan stream",
    "Stream settings",
    "Ajustes del stream",
    "Réglages Stream",
    "Impostazioni dello stream",
    "ストリーミング設定",
    "스트리밍 설정",
    "Ustawienia strumienia",
    "Ajustes de transmissão",
    "Настройки потоковой передачи",
    "Yayın ayarları",
    "Налаштування трансляції",
    "Cấu hình stream",
    "串流设置"
  ],
  "menu-stream-stats": [
    "Stream Statistiken",
    "Statistik stream",
    "Stream stats",
    "Estadísticas del stream",
    "Statistiques du stream",
    "Statistiche dello stream",
    "ストリーミング統計情報",
    "통계",
    "Statystyki strumienia",
    "Estatísticas da transmissão",
    "Статистика стрима",
    "Yayın durumu",
    "Статистика трансляції",
    "Thông số stream",
    "串流统计数据"
  ],
  microphone: [
    "Mikrofon",
    "Mikrofon",
    "Microphone",
    "Micrófono",
    "Microphone",
    "Microfono",
    "マイク",
    "마이크",
    "Mikrofon",
    "Microfone",
    "Микрофон",
    "Mikrofon",
    "Мікрофон",
    "Micro",
    "麦克风"
  ],
  "mkb-adjust-ingame-settings": [
    "Vielleicht müssen auch Empfindlichkeit & Deadzone in den Spieleinstellungen angepasst werden",
    "Anda mungkin butuh untuk menyesuaikan pengaturan sensitivitas & deadzone dalam permainan",
    "You may also need to adjust the in-game sensitivity & deadzone settings",
    "También puede que necesites ajustar la sensibilidad del juego y la configuración de la zona muerta",
    ,
    "Potrebbe anche essere necessario regolare le impostazioni della sensibilità e deadzone del gioco",
    "ゲーム内の設定で感度とデッドゾーンの調整が必要な場合があります",
    ,
    "Może być również konieczne dostosowanie czułości w grze i ustawienia 'martwej strefy' urządzenia",
    "Você talvez também precise ajustar as configurações de sensibilidade e zona morta no jogo",
    "Также может потребоваться изменить настройки чувствительности и мертвой зоны в игре",
    "Bu seçenek etkinken bile oyun içi seçeneklerden hassasiyet ve ölü bölge ayarlarını düzeltmeniz gerekebilir",
    "Можливо, вам також доведеться регулювати чутливість і deadzone у параметрах гри",
    "Có thể bạn cần phải điều chỉnh các thông số độ nhạy và điểm chết trong game",
    "您可能还需要调整游戏内的灵敏度和死区设置"
  ],
  "mkb-click-to-activate": [
    "Klicken zum Aktivieren",
    "Klik untuk mengaktifkan",
    "Click to activate",
    "Haz clic para activar",
    ,
    "Fare clic per attivare",
    "マウスクリックで開始",
    ,
    "Kliknij, aby aktywować",
    "Clique para ativar",
    "Нажмите, чтобы активировать",
    "Etkinleştirmek için tıklayın",
    "Натисніть, щоб активувати",
    "Nhấn vào để kích hoạt",
    "单击以启用"
  ],
  "mkb-disclaimer": [
    "Das Nutzen dieser Funktion beim Online-Spielen könnte als Betrug angesehen werden",
    "Mengaktifkan fitur ini saat bermain online akan dianggap curang",
    "Using this feature when playing online could be viewed as cheating",
    "Usar esta función al jugar en línea podría ser visto como trampas",
    ,
    "L'utilizzo di questa funzione quando si gioca online potrebbe essere considerato un baro",
    "オンラインプレイでこの機能を使用すると不正行為と判定される可能性があります",
    ,
    "Używanie tej funkcji podczas grania online może być postrzegane jako oszukiwanie",
    "Usar esta função em jogos online pode ser considerado como uma forma de trapaça",
    "Использование этой функции при игре онлайн может рассматриваться как читерство",
    "Bu özellik çevrimiçi oyunlarda sizi hile yapıyormuşsunuz gibi gösterebilir",
    "Використання цієї функції під час гри онлайн може розглядатися як шахрайство",
    "Sử dụng chức năng này khi chơi trực tuyến có thể bị xem là gian lận",
    "游玩在线游戏时，使用此功能可能被视为作弊。"
  ],
  "mouse-and-keyboard": [
    "Maus & Tastatur",
    "Mouse & Keyboard",
    "Mouse & Keyboard",
    "Ratón y teclado",
    ,
    "Mouse e tastiera",
    "マウス＆キーボード",
    "마우스 & 키보드",
    "Mysz i klawiatura",
    "Mouse e Teclado",
    "Мышь и клавиатура",
    "Klavye ve Fare",
    "Миша та клавіатура",
    "Chuột và Bàn phím",
    "鼠标和键盘"
  ],
  muted: [
    "Stumm",
    "Bisukan",
    "Muted",
    "Silenciado",
    ,
    "Microfono disattivato",
    "ミュート",
    "음소거",
    "Wyciszony",
    "Mudo",
    "Выкл микрофон",
    "Kapalı",
    "Без звуку",
    "Đã tắt âm",
    "静音"
  ],
  name: [
    "Name",
    "Nama",
    "Name",
    "Nombre",
    ,
    ,
    "名前",
    "이름",
    "Nazwa",
    "Nome",
    "Имя",
    "İsim",
    "Назва",
    "Tên",
    "名称"
  ],
  new: [
    "Neu",
    "Baru",
    "New",
    "Nuevo",
    ,
    ,
    "新しい",
    "새로 만들기",
    "Nowy",
    "Novo",
    "Создать",
    "Yeni",
    "Новий",
    "Tạo mới",
    "新建"
  ],
  "no-consoles-found": [
    "Keine Konsolen gefunden",
    "Tidak ditemukan konsol",
    "No consoles found",
    "No se encontraron consolas",
    ,
    "Nessuna console trovata",
    "本体が見つかりません",
    "콘솔을 찾을 수 없음",
    "Nie znaleziono konsoli",
    "Nenhum console encontrado",
    "Консолей не найдено",
    "Konsol bulunamadı",
    "Не знайдено консолі",
    "Không tìm thấy console nào",
    "未找到主机"
  ],
  normal: [
    "Mittel",
    "Normal",
    "Normal",
    "Normal",
    "Normal",
    "Normale",
    "標準",
    "보통",
    "Normalny",
    "Normal",
    "Средний",
    "Normal",
    "Нормальний",
    "Thường",
    "中"
  ],
  off: [
    "Aus",
    "Mati",
    "Off",
    "Apagado",
    "Désactivé",
    "Off",
    "オフ",
    "꺼짐",
    "Wyłączone",
    "Desligado",
    "Выключен",
    "Kapalı",
    "Вимкнено",
    "Tắt",
    "关"
  ],
  on: [
    "An",
    "Hidup",
    "On",
    "Activado",
    ,
    "Attivo",
    "オン",
    "켜짐",
    "Włącz",
    "Ativado",
    "Вкл",
    "Açık",
    "Увімкнено",
    "Bật",
    "开启"
  ],
  "only-supports-some-games": [
    "Unterstützt nur einige Spiele",
    "Hanya mendukung beberapa permainan",
    "Only supports some games",
    "Sólo soporta algunos juegos",
    ,
    "Supporta solo alcuni giochi",
    "一部のゲームのみサポート",
    "몇몇 게임만 지원",
    "Wspiera tylko niektóre gry",
    "Suporta apenas alguns jogos",
    "Поддерживает только некоторые игры",
    "Yalnızca belli oyunlar destekleniyor",
    "Підтримує лише деякі ігри",
    "Chỉ hỗ trợ một vài game",
    "仅支持一些游戏"
  ],
  opacity: [
    "Deckkraft",
    "Opasitas",
    "Opacity",
    "Opacidad",
    "Opacité",
    "Opacità",
    "透過度",
    "불투명도",
    "Przezroczystość",
    "Opacidade",
    "Непрозрачность",
    "Saydamsızlık",
    "Непрозорість",
    "Độ mờ",
    "透明度"
  ],
  other: [
    "Sonstiges",
    "Lainnya",
    "Other",
    "Otro",
    "Autres",
    "Altro",
    "その他",
    "기타",
    "Inne",
    "Outros",
    "Прочее",
    "Diğer",
    "Інше",
    "Khác",
    "其他"
  ],
  playing: [
    "Spielt",
    "Sedang memainkan",
    "Playing",
    "Jugando",
    ,
    "Installa l'applicazione Better xCloud per Android",
    "プレイ中",
    "플레이 중",
    "W grze",
    "Jogando",
    "Играет",
    "Şu anda oyunda",
    "Гра триває",
    "Đang chơi",
    "游戏中"
  ],
  position: [
    "Position",
    "Posisi",
    "Position",
    "Posición",
    "Position",
    "Posizione",
    "位置",
    "위치",
    "Pozycja",
    "Posição",
    "Расположение",
    "Konum",
    "Позиція",
    "Vị trí",
    "位置"
  ],
  "powered-off": [
    "Ausgeschaltet",
    "Dimatikan",
    "Powered off",
    "Desactivado",
    ,
    "Spento",
    "本体オフ",
    "전원 꺼짐",
    "Zasilanie wyłączone",
    "Desligado",
    "Выключено",
    "Kapalı",
    "Вимкнений",
    "Đã tắt nguồn",
    "关机"
  ],
  "powered-on": [
    "Eingeschaltet",
    "Menyala",
    "Powered on",
    "Activado",
    ,
    "Acceso",
    "本体オン",
    "전원 켜짐",
    "Zasilanie włączone",
    "Ligado",
    "Включено",
    "Açık",
    "Увімкнений",
    "Đang bật nguồn",
    "开机"
  ],
  "prefer-ipv6-server": [
    "IPv6-Server bevorzugen",
    "Utamakan Server IPv6",
    "Prefer IPv6 server",
    "Servidor IPv6 preferido",
    "Préférer le serveur IPv6",
    "Preferisci server IPv6",
    "IPv6 サーバーを優先",
    "IPv6 서버 우선",
    "Preferuj serwer IPv6",
    "Preferir servidor IPv6",
    "Предпочитать IPv6 сервер",
    "IPv6 sunucusunu tercih et",
    "Віддавати перевагу IPv6",
    "Ưu tiên máy chủ IPv6",
    "优先使用 IPv6 服务器"
  ],
  "preferred-game-language": [
    "Bevorzugte Spielsprache",
    "Bahasa Permainan yang diutamakan",
    "Preferred game's language",
    "Idioma preferencial del juego",
    "Langue préférée du jeu",
    "Lingua del gioco preferita",
    "ゲームの優先言語設定",
    "선호하는 게임 언어",
    "Preferowany język gry",
    "Idioma preferencial do jogo",
    "Предпочитаемый язык игры",
    "Oyunda tercih edilen dil",
    "Бажана мова гри",
    "Ngôn ngữ game ưu tiên",
    "首选游戏语言"
  ],
  preset: [
    "Voreinstellung",
    "Preset",
    "Preset",
    "Preajuste",
    ,
    ,
    "プリセット",
    "프리셋",
    "Szablon",
    "Predefinição",
    "Шаблон",
    "Hazır ayar",
    "Пресет",
    "Thiết lập sẵn",
    "预设"
  ],
  "press-esc-to-cancel": [
    'Zum Abbrechen "Esc" drücken',
    "Tekan Esc untuk batal",
    "Press Esc to cancel",
    "Presione Esc para cancelar",
    ,
    ,
    "Escを押してキャンセル",
    "ESC를 눌러 취소",
    "Naciśnij Esc, aby anulować",
    "Pressione Esc para cancelar",
    "Нажмите Esc для отмены",
    "İptal etmek için Esc'ye basın",
    "Натисніть Esc, щоб скасувати",
    "Nhấn Esc để bỏ qua",
    "按下ESC键以取消"
  ],
  "press-key-to-toggle-mkb": [
    (e) => `${e.key}: Maus- und Tastaturunterstützung an-/ausschalten`,
    (e) => `Tekan ${e.key} untuk mengaktifkan fitur Mouse dan Keyboard`,
    (e) => `Press ${e.key} to toggle the Mouse and Keyboard feature`,
    (e) => `Pulsa ${e.key} para activar la función de ratón y teclado`,
    ,
    ,
    (e) => `${e.key} キーでマウスとキーボードの機能を切り替える`,
    (e) => `${e.key} 키를 눌러 마우스와 키보드 기능을 활성화 하십시오`,
    (e) => `Naciśnij ${e.key}, aby przełączyć funkcję myszy i klawiatury`,
    (e) => `Pressione ${e.key} para ativar/desativar a função de Mouse e Teclado`,
    (e) => `Нажмите ${e.key} для переключения функции мыши и клавиатуры`,
    (e) => `Klavye ve fare özelliğini açmak için ${e.key} tuşuna basın`,
    (e) => `Натисніть ${e.key}, щоб увімкнути або вимкнути функцію миші та клавіатури`,
    (e) => `Nhấn ${e.key} để bật/tắt tính năng Chuột và Bàn phím`,
    (e) => `按下 ${e.key} 切换键鼠模式`
  ],
  "press-to-bind": [
    "Zum Festlegen Taste drücken oder mit der Maus klicken...",
    "Tekan tombol atau gunakan mouse untuk mengaitkan...",
    "Press a key or do a mouse click to bind...",
    "Presione una tecla o haga un clic del ratón para enlazar...",
    ,
    ,
    "キーを押すかマウスをクリックして割り当て...",
    "정지하려면 아무키나 마우스를 클릭해주세요...",
    "Naciśnij klawisz lub kliknij myszą, aby przypisać...",
    "Pressione uma tecla ou clique do mouse para vincular...",
    "Нажмите клавишу или щелкните мышкой, чтобы связать...",
    "Klavyedeki bir tuşa basarak veya fareyle tıklayarak tuş ataması yapın...",
    "Натисніть клавішу або кнопку миші, щоб прив'язати...",
    "Nhấn nút hoặc nhấn chuột để gán...",
    "按相应按键或鼠标键来绑定"
  ],
  "prompt-preset-name": [
    "Voreinstellung Name:",
    "Nama preset:",
    "Preset's name:",
    "Nombre del preajuste:",
    ,
    ,
    "プリセット名:",
    "프리셋 이름:",
    "Nazwa szablonu:",
    "Nome da predefinição:",
    "Имя шаблона:",
    "Hazır ayar adı:",
    "Назва пресету:",
    "Tên của mẫu sẵn:",
    "预设名称："
  ],
  ratio: [
    "Seitenverhältnis",
    "Rasio",
    "Ratio",
    "Relación de aspecto",
    "Ratio",
    "Rapporto",
    "比率",
    "화면 비율",
    "Współczynnik proporcji",
    "Proporção",
    "Соотношение сторон",
    "Görüntü oranı",
    "Співвідношення сторін",
    "Tỉ lệ",
    "宽高比"
  ],
  "reduce-animations": [
    "Animationen reduzieren",
    "Kurangi animasi antarmuka",
    "Reduce UI animations",
    "Reduce las animaciones de la interfaz",
    "Réduire les animations dans l’interface",
    "Animazioni ridottte",
    "UIアニメーションを減らす",
    "애니메이션 감소",
    "Ogranicz animacje interfejsu",
    "Reduzir animações da interface",
    "Убрать анимации интерфейса",
    "Arayüz animasyonlarını azalt",
    "Зменшити анімацію інтерфейсу",
    "Giảm hiệu ứng chuyển động",
    "减少UI动画"
  ],
  region: [
    "Region",
    "Wilayah",
    "Region",
    "Región",
    "Région",
    "Regione",
    "地域",
    "지역",
    "Region",
    "Região",
    "Регион",
    "Bölge",
    "Регіон",
    "Khu vực",
    "地区"
  ],
  "remote-play": [
    "Remote Play",
    "Remote Play",
    "Remote Play",
    "Reproducción remota",
    ,
    "Riproduzione Remota",
    "リモートプレイ",
    "리모트 플레이",
    "Gra zdalna",
    "Reprodução remota",
    "Удаленная игра",
    "Uzaktan Bağlanma",
    "Віддалена гра",
    "Chơi Từ Xa",
    "远程串流"
  ],
  rename: [
    "Umbenennen",
    "Ubah nama",
    "Rename",
    "Renombrar",
    ,
    ,
    "名前変更",
    "이름 바꾸기",
    "Zmień nazwę",
    "Renomear",
    "Переименовать",
    "Ad değiştir",
    "Перейменувати",
    "Sửa tên",
    "重命名"
  ],
  "right-click-to-unbind": [
    "Rechtsklick auf Taste: Zuordnung aufheben",
    "Klik kanan pada tombol untuk menghapus",
    "Right-click on a key to unbind it",
    "Clic derecho en una tecla para desvincularla",
    ,
    ,
    "右クリックで割り当て解除",
    "할당 해제하려면 키를 오른쪽 클릭하세요",
    "Kliknij prawym przyciskiem myszy na klawisz, aby anulować przypisanie",
    "Clique com o botão direito em uma tecla para desvinculá-la",
    "Щелкните правой кнопкой мыши по кнопке, чтобы отвязать её",
    "Tuş atamasını kaldırmak için fareyle sağ tık yapın",
    "Натисніть правою кнопкою миші, щоб відв'язати",
    "Nhấn chuột phải lên một phím để gỡ nó",
    "右键解除绑定"
  ],
  "right-stick": [
    "Rechter Stick",
    "Stik kanan",
    "Right stick",
    "Joystick derecho",
    ,
    ,
    "右スティック",
    "오른쪽 스틱",
    "Prawy drążek analogowy",
    "Direcional analógico direito",
    "Правый стик",
    "Sağ analog çubuk",
    "Правий стік",
    "Analog phải",
    "右摇杆"
  ],
  "rocket-always-hide": [
    "Immer ausblenden",
    "Selalu sembunyikan",
    "Always hide",
    "Ocultar siempre",
    "Toujours masquer",
    "Nascondi sempre",
    "常に非表示",
    "항상 숨기기",
    "Zawsze ukrywaj",
    "Sempre ocultar",
    "Всегда скрывать",
    "Her zaman gizle",
    "Ховати завжди",
    "Luôn ẩn",
    "始终隐藏"
  ],
  "rocket-always-show": [
    "Immer anzeigen",
    "Selalu tampilkan",
    "Always show",
    "Mostrar siempre",
    "Toujours afficher",
    "Mostra sempre",
    "常に表示",
    "항상 표시",
    "Zawsze pokazuj",
    "Sempre mostrar",
    "Всегда показывать",
    "Her zaman göster",
    "Показувати завжди",
    "Luôn hiển thị",
    "始终显示"
  ],
  "rocket-animation": [
    "Raketen Animation",
    "Animasi roket",
    "Rocket animation",
    "Animación del cohete",
    "Animation de la fusée",
    "Razzo animato",
    "ロケットのアニメーション",
    "로켓 애니메이션",
    "Animacja rakiety",
    "Animação do foguete",
    "Анимация ракеты",
    "Roket animasyonu",
    "Анімація ракети",
    "Phi thuyền",
    "火箭动画"
  ],
  "rocket-hide-queue": [
    "Bei Warteschlange ausblenden",
    "Sembunyikan ketika mengantri",
    "Hide when queuing",
    "Ocultar al hacer cola",
    "Masquer lors de la file d'attente",
    "Nascondi durante la coda",
    "待機中は非表示",
    "대기 중에는 숨기기",
    "Ukryj podczas czekania w kolejce",
    "Ocultar quando estiver na fila",
    "Скрыть, когда есть очередь",
    "Sıradayken gizle",
    "Не показувати у черзі",
    "Ẩn khi xếp hàng chờ",
    "排队时隐藏"
  ],
  "safari-failed-message": [
    'Ausführen von "Better xCloud" fehlgeschlagen. Versuche es erneut, bitte warten...',
    "Gagal menjalankan Better xCloud. Mencoba ulang, Mohon tunggu...",
    "Failed to run Better xCloud. Retrying, please wait...",
    "No se pudo ejecutar Better xCloud. Reintentando, por favor espera...",
    "Impossible d'exécuter Better xCloud. Nouvelle tentative, veuillez patienter...",
    "Si è verificato un errore durante l'esecuzione di Better xCloud. Nuovo tentativo, attendere...",
    "Better xCloud の実行に失敗しました。再試行中...",
    "Better xCloud 시작에 실패했습니다. 재시도중이니 잠시만 기다려 주세요.",
    "Nie udało się uruchomić Better xCloud. Ponawiam próbę...",
    "Falha ao executar o Better xCloud. Tentando novamente, aguarde...",
    "Не удалось запустить Better xCloud. Идет перезапуск, пожалуйста, подождите...",
    "Better xCloud çalıştırılamadı. Yeniden deneniyor...",
    "Не вдалий старт Better xCloud. Повторна спроба, будь ласка, зачекайте...",
    "Không thể chạy Better xCloud. Đang thử lại, vui lòng chờ...",
    "插件无法运行。正在重试，请稍候..."
  ],
  saturation: [
    "Sättigung",
    "Saturasi",
    "Saturation",
    "Saturación",
    "Saturation",
    "Saturazione",
    "彩度",
    "채도",
    "Nasycenie",
    "Saturação",
    "Насыщенность",
    "Renk doygunluğu",
    "Насиченість",
    "Độ bão hòa",
    "饱和度"
  ],
  save: [
    "Speichern",
    "Simpan",
    "Save",
    "Guardar",
    ,
    ,
    "保存",
    "저장",
    "Zapisz",
    "Salvar",
    "Сохранить",
    "Kaydet",
    "Зберегти",
    "Lưu",
    "保存"
  ],
  "screenshot-apply-filters": [
    "Videofilter auf Screenshots anwenden",
    "Terapkan filter video pada screenshot",
    "Applies video filters to screenshots",
    "Aplica filtros de vídeo a las capturas de pantalla",
    ,
    ,
    "スクリーンショットにビデオフィルターを適用",
    ,
    "Stosuje filtry wideo do zrzutów ekranu",
    "Aplicar filtros de vídeo às capturas de tela",
    "Применяет фильтры видео к скриншотам",
    "Görsel filtreleri ekran görüntülerine de uygular",
    "Застосовує відеофільтри до знімків екрана",
    "Áp dụng hiệu ứng video vào ảnh chụp màn hình",
    "为截图添加滤镜"
  ],
  "screenshot-button-position": [
    "Position des Screenshot-Buttons",
    "Posisi tombol Screenshot",
    "Screenshot button's position",
    "Posición del botón de captura de pantalla",
    "Position du bouton de capture d'écran",
    "Posizione del pulsante screenshot",
    "スクリーンショットボタンの位置",
    "스크린샷 버튼 위치",
    "Pozycja przycisku zrzutu ekranu",
    "Posição do botão de captura de tela",
    "Расположение кнопки скриншота",
    "Ekran görüntüsü düğmesi konumu",
    "Позиція кнопки знімка екрана",
    "Vị trí của nút Chụp màn hình",
    "截图按钮位置"
  ],
  "separate-touch-controller": [
    "Trenne Touch-Controller & Controller #1",
    "Pisahkan Kontrol sentuh & Kontroler #1",
    "Separate Touch controller & Controller #1",
    "Separar controlador táctil y controlador #1",
    ,
    ,
    "タッチコントローラーとコントローラー#1を分ける",
    ,
    "Oddziel Kontroler dotykowy i Kontroler #1",
    "Separar o Controle por Toque e o Controle #1",
    "Раздельный сенсорный контроллер и контроллер #1",
    "Dokunmatik kumandayı ve birincil kumandayı ayrı tut",
    "Відокремити Сенсорний контролер та Контролер #1",
    "Tách biệt Bộ điều khiển cảm ứng và Tay cầm #1",
    "虚拟摇杆和手柄分别控制不同角色"
  ],
  "separate-touch-controller-note": [
    "Touch-Controller ist Spieler 1, Controller #1 ist Spieler 2",
    "Kontrol sentuh adalah Player 1, Kontroler #1 adalah Player 2",
    "Touch controller is Player 1, Controller #1 is Player 2",
    "El controlador táctil es Jugador 1, Controlador #1 es Jugador 2",
    ,
    ,
    "タッチコントローラーがプレイヤー1、コントローラー#1がプレイヤー2に割り当てられます",
    ,
    "Kontroler dotykowy to Gracz 1, Kontroler #1 to Gracz 2",
    "O Controle por Toque é o Jogador 1, o Controle #1 é o Jogador 2",
    "Сенсорный контроллер — игрок 1, контроллер #1 — игрок 2",
    "Dokunmaktik kumanda birinci oyuncu, birincil kumanda ikinci oyuncu",
    "Сенсорний контролер це Гравець 1, Контролер #1 це Гравець 2",
    "Bộ điều khiển cảm ứng là Người chơi 1, Tay cầm #1 là Người chơi 2",
    "虚拟摇杆为玩家1，手柄#1为玩家2"
  ],
  server: [
    "Server",
    "Server",
    "Server",
    "Servidor",
    "Serveur",
    "Server",
    "サーバー",
    "서버",
    "Serwer",
    "Servidor",
    "Сервер",
    "Sunucu",
    "Сервер",
    "Máy chủ",
    "服务器"
  ],
  "settings-reload": [
    "Seite neu laden und Änderungen anwenden",
    "Muat ulang untuk menerapkan",
    "Reload page to reflect changes",
    "Actualice la página para aplicar los cambios",
    "Recharger la page pour bénéficier des changements",
    "Applica e ricarica la pagina",
    "ページを更新をして設定変更を適用",
    "적용 및 페이지 새로고침",
    "Odśwież stronę, aby zastosować zmiany",
    "Recarregue a página para aplicar as alterações",
    "Перезагрузить страницу, чтобы применить изменения",
    "Kaydetmek için sayfayı yenile",
    "Перезавантажте сторінку, щоб застосувати зміни",
    "Tải lại trang để áp dụng các thay đổi",
    "重新加载页面以应用更改"
  ],
  "settings-reloading": [
    "Wird neu geladen...",
    "Memuat ulang...",
    "Reloading...",
    "Recargando...",
    "Actualisation...",
    "Ricaricamento...",
    "更新中...",
    "새로고침하는 중...",
    "Ponowne ładowanie...",
    "Recarregando...",
    "Перезагрузка...",
    "Sayfa yenileniyor...",
    "Перезавантаження...",
    "Đang tải lại...",
    "正在重新加载..."
  ],
  "shortcut-keys": [
    "Shortcut-Tasten",
    "Tombol pintasan",
    "Shortcut keys",
    "Teclas de atajo",
    ,
    ,
    "ショートカットキー",
    ,
    "Skróty klawiszowe",
    "Teclas de atalho",
    "Горячие клавиши",
    "Kısayol tuşları",
    "Клавіші швидкого доступу",
    "Các phím tắt",
    "快捷键"
  ],
  "show-game-art": [
    "Poster des Spiels anzeigen",
    "Tampilkan sampul permainan",
    "Show game art",
    "Mostrar imagen del juego",
    "Afficher la couverture du jeu",
    "Mostra immagine del gioco",
    "ゲームアートを表示",
    "게임 아트 표시",
    "Pokaż okładkę gry",
    "Mostrar arte do jogo",
    "Показывать игровую обложку",
    "Oyun resmini göster",
    "Показувати ігровий арт",
    "Hiển thị ảnh game",
    "显示游戏封面"
  ],
  "show-stats-on-startup": [
    "Statistiken beim Start des Spiels anzeigen",
    "Tampilkan statistik ketika permainan dimulai",
    "Show stats when starting the game",
    "Mostrar estadísticas al iniciar el juego",
    "Afficher les statistiques au démarrage de la partie",
    "Mostra le statistiche quando si avvia la partita",
    "ゲーム開始時に統計情報を表示",
    "게임 시작 시 통계 보여주기",
    "Pokaż statystyki podczas uruchamiania gry",
    "Mostrar estatísticas ao iniciar o jogo",
    "Показывать статистику при запуске игры",
    "Oyun başlatırken yayın durumunu göster",
    "Показувати статистику при запуску гри",
    "Hiển thị thông số khi vào game",
    "开始游戏时显示统计信息"
  ],
  "show-wait-time": [
    "Geschätzte Wartezeit anzeigen",
    "Tampilkan waktu antrian",
    "Show the estimated wait time",
    "Mostrar el tiempo de espera estimado",
    "Afficher le temps d'attente estimé",
    "Mostra una stima del tempo di attesa",
    "推定待機時間を表示",
    "예상 대기 시간 표시",
    "Pokaż szacowany czas oczekiwania",
    "Mostrar o tempo de espera estimado",
    "Показать предполагаемое время до запуска",
    "Tahminî bekleme süresini göster",
    "Показувати орієнтовний час очікування",
    "Hiển thị thời gian chờ dự kiến",
    "显示预计等待时间"
  ],
  "simplify-stream-menu": [
    "Stream-Menü vereinfachen",
    "Sederhanakan menu Stream",
    "Simplify Stream's menu",
    "Simplificar el menú del stream",
    "Simplifier le menu Stream",
    "Semplifica il menu della trasmissione",
    "ストリーミングメニューのラベルを非表示",
    "메뉴 간단히 보기",
    "Uprość menu strumienia",
    "Simplificar menu de transmissão",
    "Упростить меню потока",
    "Yayın menüsünü basitleştir",
    "Спростити меню трансляції",
    "Đơn giản hóa menu của Stream",
    "简化菜单"
  ],
  "skip-splash-video": [
    "Xbox-Logo bei Spielstart überspringen",
    "Lewati video splash Xbox",
    "Skip Xbox splash video",
    "Saltar vídeo de presentación de Xbox",
    "Ignorer la vidéo de démarrage Xbox",
    "Salta il logo Xbox iniziale",
    "Xboxの起動画面をスキップ",
    "Xbox 스플래시 건너뛰기",
    "Pomiń wstępne intro Xbox",
    "Pular introdução do Xbox",
    "Пропустить видео с заставкой Xbox",
    "Xbox açılış ekranını atla",
    "Пропустити заставку Xbox",
    "Bỏ qua video Xbox",
    "跳过 Xbox 启动动画"
  ],
  slow: [
    "Langsam",
    "Lambat",
    "Slow",
    "Lento",
    ,
    "Lento",
    "低速",
    "느림",
    "Wolno",
    "Lento",
    "Медленный",
    "Yavaş",
    "Повільний",
    "Chậm",
    "慢速"
  ],
  small: [
    "Klein",
    "Kecil",
    "Small",
    "Pequeño",
    "Petite",
    "Piccolo",
    "小",
    "작게",
    "Mały",
    "Pequeno",
    "Маленький",
    "Küçük",
    "Маленький",
    "Nhỏ",
    "小"
  ],
  "smart-tv": [
    "Smart TV",
    "Smart TV",
    "Smart TV",
    "Smart TV",
    ,
    "Smart TV",
    "スマートTV",
    "스마트 TV",
    "Smart TV",
    "Smart TV",
    "Smart TV",
    "Akıllı TV",
    "Smart TV",
    "TV thông minh",
    "智能电视"
  ],
  sound: [
    "Ton",
    "Suara",
    "Sound",
    "Sonido",
    ,
    "Suoni",
    "サウンド",
    "소리",
    "Dźwięk",
    "Som",
    "Звук",
    "Ses",
    "Звук",
    "Âm thanh",
    "声音"
  ],
  standby: [
    "Standby",
    "Siaga",
    "Standby",
    "Modo de espera",
    ,
    "Sospendi",
    "スタンバイ",
    "대기",
    "Stan czuwania",
    "Suspenso",
    "Режим ожидания",
    "Beklemede",
    "Режим очікування",
    "Đang ở chế độ chờ",
    "待机"
  ],
  "stat-bitrate": [
    "Bitrate",
    "Bitrate",
    "Bitrate",
    "Tasa de bits",
    "Bitrate",
    "Bitrate",
    "ビットレート",
    "비트레이트",
    "Bitrate",
    "Bitrate",
    "Скорость соединения",
    "Bit hızı",
    "Бітрейт",
    "Bitrate",
    "码率"
  ],
  "stat-decode-time": [
    "Dekodierzeit",
    "Waktu dekode",
    "Decode time",
    "Tiempo de decodificación",
    "Décodage",
    "Decodifica",
    "デコード時間",
    "디코딩 시간",
    "Czas dekodowania",
    "Tempo de decodificação",
    "Время декодирования",
    "Kod çözme süresi",
    "Час декодування",
    "Thời gian giải mã",
    "解码时间"
  ],
  "stat-fps": [
    "Framerate",
    "FPS",
    "FPS",
    "FPS",
    "FPS",
    "FPS",
    "FPS",
    "FPS",
    "FPS",
    "FPS",
    "Кадр/сек",
    "FPS",
    "Кадрів на секунду",
    "FPS",
    "帧率"
  ],
  "stat-frames-lost": [
    "Verlorene Frames",
    "Bingkai terbuang",
    "Frames lost",
    "Pérdida de fotogramas",
    "Images perdues",
    "Perdita di fotogrammi",
    "フレームロス",
    "프레임 손실",
    "Utracone klatki",
    "Quadros perdidos",
    "Потери кадров",
    "Kare kaybı",
    "Кадрів втрачено",
    "Số khung hình bị mất",
    "丢帧"
  ],
  "stat-packets-lost": [
    "Paketverluste",
    "Paket hilang",
    "Packets lost",
    "Pérdida de paquetes",
    "Perte paquets",
    "Perdita di pacchetti",
    "パケットロス",
    "패킷 손실",
    "Utracone pakiety",
    "Pacotes perdidos",
    "Потери пакетов",
    "Paket kaybı",
    "Пакетів втрачено",
    "Số gói tin bị mất",
    "丢包"
  ],
  "stat-ping": [
    "Ping",
    "Ping",
    "Ping",
    "Latencia",
    "Ping",
    "Ping",
    "Ping",
    "지연 시간",
    "Ping",
    "Ping",
    "Задержка соединения",
    "Gecikme",
    "Затримка",
    "Ping",
    "延迟"
  ],
  stats: [
    "Statistiken",
    "Statistik",
    "Stats",
    "Estadísticas",
    "Stats",
    "Statistiche",
    "統計情報",
    "통계",
    "Statystyki",
    "Estatísticas",
    "Статистика",
    "Durum",
    "Статистика",
    "Các thông số",
    "统计信息"
  ],
  "stick-decay-minimum": [
    "Stick Abklingzeit Minimum",
    "Minimum pelepasan stik",
    "Stick decay minimum",
    "Disminuir mínimamente el analógico",
    ,
    ,
    "スティックの減衰の最小値",
    ,
    "Minimalne opóźnienie drążka",
    "Tempo mínimo de redefinição do analógico",
    "Минимальная перезарядка стика",
    "Çubuğun ortalanma süresi minimumu",
    "Мінімальне згасання стіка",
    "Độ suy giảm tối thiểu của cần điều khiển",
    "最小摇杆回中延迟"
  ],
  "stick-decay-strength": [
    "Stick Abklingzeit Geschwindigkeit",
    "Kekuatan pelepasan stik",
    "Stick decay strength",
    "Intensidad de decaimiento del analógico",
    ,
    ,
    "スティックの減衰の強さ",
    ,
    "Siła opóźnienia drążka",
    "Velocidade de redefinição do analógico",
    "Скорость перезарядки стика",
    "Çubuğun ortalanma gücü",
    "Сила згасання стіка",
    "Sức mạnh độ suy giảm của cần điều khiển",
    "摇杆回中强度"
  ],
  stream: [
    "Stream",
    "Stream",
    "Stream",
    "Stream",
    "Stream",
    "Stream",
    "ストリーミング",
    "스트리밍",
    "Stream",
    "Transmissão",
    "Видеопоток",
    "Yayın",
    "Трансляція",
    "Stream",
    "串流"
  ],
  stretch: [
    "Strecken",
    "Rentangkan",
    "Stretch",
    "Estirado",
    "Étirer",
    "Riempi",
    "引き伸ばし",
    "채우기",
    "Rozciągnij",
    "Esticar",
    "Растянуть",
    "Genişlet",
    "Розтягнути",
    "Kéo giãn",
    "拉伸"
  ],
  "support-better-xcloud": [
    '"Better xCloud" unterstützen',
    "Dukung Better xCloud",
    "Support Better xCloud",
    "Apoyar a Better xCloud",
    ,
    ,
    "Better xCloudをサポート",
    ,
    "Wesprzyj Better xCloud",
    "Apoie o Better xCloud",
    "Поддержать Better xCloud",
    "Better xCloud'a destek ver",
    "Підтримати Better xCloud",
    "Ủng hộ Better xCloud",
    "赞助本插件"
  ],
  "swap-buttons": [
    "Tasten tauschen",
    "Tukar tombol",
    "Swap buttons",
    "Intercambiar botones",
    ,
    "Inverti i pulsanti",
    "ボタン入れ替え",
    "버튼 바꾸기",
    "Zamień przyciski",
    "Trocar botões",
    "Поменять кнопки",
    "Düğme düzenini ters çevir",
    "Поміняти кнопки місцями",
    "Hoán đổi nút",
    "交换按钮"
  ],
  "target-resolution": [
    "Festgelegte Auflösung",
    "Resolusi",
    "Target resolution",
    "Calidad de imagen",
    "Résolution cible",
    "Risoluzione prevista",
    "ターゲット解像度",
    "목표 해상도",
    "Rozdzielczość docelowa",
    "Resolução padrão",
    "Целевое разрешение",
    "Tercih edilen çözünürlük",
    "Цільова роздільна здатність",
    "Độ phân giải",
    "目标分辨率"
  ],
  "tc-all-games": [
    "Alle Spiele",
    "Semua permainan",
    "All games",
    "Todos los juegos",
    "Tous les jeux",
    "Tutti i giochi",
    "全てのゲームで有効",
    "모든 게임",
    "Wszystkie gry",
    "Todos os jogos",
    "Все игры",
    "Tüm oyunlar",
    "Всі ігри",
    "Tất cả các game",
    "所有游戏"
  ],
  "tc-all-white": [
    "Komplett weiß",
    "Putih",
    "All white",
    "Todo blanco",
    "Tout blanc",
    "Tutti bianchi",
    "オールホワイト",
    "모두 하얗게",
    "Wszystkie białe",
    "Todo branco",
    "Полностью белые",
    "Hepsi beyaz",
    "Все біле",
    "Trắng hoàn toàn",
    "白色"
  ],
  "tc-auto-off": [
    "Aus, wenn Controller gefunden",
    "Mati saat kontroler terhubung",
    "Off when controller found",
    "Desactivar cuando se encuentra el controlador",
    ,
    ,
    "コントローラー接続時に無効化",
    ,
    "Wyłącz, gdy kontroler zostanie znaleziony",
    "Desligar toque quando o controle estiver conectado",
    "Выключить, когда контроллер найден",
    "Başka bir kumanda bağlandığında kapat",
    "Вимкнено, коли контролер знайдено",
    "Tắt khi sử dụng tay cầm",
    "手柄连接时隐藏虚拟摇杆"
  ],
  "tc-availability": [
    "Verfügbarkeit",
    "Ketersediaan",
    "Availability",
    "Disponibilidad",
    "Disponibilité",
    "Disponibilità",
    "強制的に有効化",
    "사용 여부",
    "Dostępność",
    "Disponibilidade",
    "В каких играх включить",
    "Uygunluk durumu",
    "Доступність",
    "Khả dụng",
    "启用"
  ],
  "tc-custom-layout-style": [
    "Angepasstes Layout Button Stil",
    "Gaya tata letak tombol kustom",
    "Custom layout's button style",
    "Estilo de botones de diseño personalizado",
    "Style personnalisé des boutons",
    "Layout dei tasti personalizzato",
    "カスタムレイアウト",
    "커스텀 레이아웃의 버튼 스타일",
    "Niestandardowy układ przycisków",
    "Estilo de botão do layout personalizado",
    "Пользовательский стиль кнопок",
    "Özelleştirilmiş düğme düzeninin biçimi",
    "Користувацький стиль кнопок",
    "Màu của bố cục tùy chọn",
    "特殊游戏按钮样式"
  ],
  "tc-muted-colors": [
    "Matte Farben",
    "Warna redup",
    "Muted colors",
    "Colores apagados",
    "Couleurs adoucies",
    "Riduci intensità colori",
    "ミュートカラー",
    "저채도 색상",
    "Stonowane kolory",
    "Cores opacas",
    "Приглушенные цвета",
    "Yumuşak renkler",
    "Приглушені кольори",
    "Màu câm",
    "低饱和度"
  ],
  "tc-standard-layout-style": [
    "Standard Layout Button Stil",
    "Gaya tata letak tombol standar",
    "Standard layout's button style",
    "Estilo de botones de diseño estándar",
    "Style standard des boutons",
    "Layout dei tasti standard",
    "標準レイアウト",
    "표준 레이아웃의 버튼 스타일",
    "Standardowy układ przycisków",
    "Estilo de botão do layout padrão",
    "Стандартный стиль кнопок",
    "Varsayılan düğme düzeninin biçimi",
    "Стандартний стиль кнопок",
    "Màu của bố cục tiêu chuẩn",
    "通用按钮样式"
  ],
  "text-size": [
    "Textgröße",
    "Ukuran teks",
    "Text size",
    "Tamano del texto",
    "Taille du texte",
    "Dimensione del testo",
    "文字サイズ",
    "글자 크기",
    "Rozmiar tekstu",
    "Tamanho do texto",
    "Размер текста",
    "Metin boyutu",
    "Розмір тексту",
    "Cỡ chữ",
    "文字大小"
  ],
  "top-center": [
    "Oben zentriert",
    "Tengah atas",
    "Top-center",
    "Superior centrado",
    "En haut au centre",
    "In alto al centro",
    "上",
    "중앙 상단",
    "Wyśrodkowany na górze",
    "Superior centralizado",
    "Сверху",
    "Orta üst",
    "Зверху по центру",
    "Chính giữa phía trên",
    "顶部居中"
  ],
  "top-left": [
    "Oben links",
    "Kiri atas",
    "Top-left",
    "Superior izquierdo",
    "Haut-gauche",
    "In alto a sinistra",
    "左上",
    "좌측 상단",
    "Lewy górny róg",
    "Superior esquerdo",
    "Левый верхний угол",
    "Sol üst",
    "Зверху ліворуч",
    "Phía trên bên trái",
    "左上角"
  ],
  "top-right": [
    "Oben rechts",
    "Kanan atas",
    "Top-right",
    "Superior derecho",
    "En haut à droite",
    "In alto a destra",
    "右上",
    "우측 상단",
    "Prawy górny róg",
    "Superior direito",
    "Справа",
    "Sağ üst",
    "Зверху праворуч",
    "Phía trên bên phải",
    "右上角"
  ],
  "touch-control-layout": [
    "Touch-Steuerungslayout",
    "Tata letak kontrol sentuhan",
    "Touch control layout",
    "Diseño de control táctil",
    ,
    "Controller Touch",
    "タッチコントロールレイアウト",
    ,
    "Układ sterowania dotykowego",
    "Layout do controle por toque",
    "Расположение сенсорных кнопок",
    "Dokunmatik kontrol şeması",
    "Розташування сенсорного керування",
    "Bố cục điều khiển cảm ứng",
    "触摸控制布局"
  ],
  "touch-controller": [
    "Touch-Controller",
    "Kontrol sentuhan",
    "Touch controller",
    "Controles táctiles",
    "Commandes tactiles",
    "Controller Touch",
    "タッチコントローラー",
    "터치 컨트롤",
    "Sterowanie dotykiem",
    "Controle de toque",
    "Сенсорные кнопки",
    "Dokunmatik oyun kumandası",
    "Сенсорне керування",
    "Bộ điều khiển cảm ứng",
    "虚拟摇杆"
  ],
  "transparent-background": [
    "Transparenter Hintergrund",
    "Latar belakang transparan",
    "Transparent background",
    "Fondo transparente",
    "Fond transparent",
    "Sfondo trasparente",
    "背景の透過",
    "투명 배경",
    "Przezroczyste tło",
    "Fundo transparente",
    "Прозрачный фон",
    "Saydam arka plan",
    "Прозоре тло",
    "Trong suốt màu nền",
    "透明背景"
  ],
  ui: [
    "Benutzeroberfläche",
    "Antarmuka pengguna",
    "UI",
    "Interfaz de usuario",
    "Interface utilisateur",
    "Interfaccia",
    "UI",
    "UI",
    "Interfejs",
    "Interface",
    "Интерфейс",
    "Kullanıcı arayüzü",
    "Інтерфейс користувача",
    "Giao diện",
    "UI"
  ],
  unknown: [
    "Unbekannt",
    "Tidak diketahui",
    "Unknown",
    "Desconocido",
    ,
    "Sconosciuto",
    "不明",
    "알 수 없음",
    "Nieznane",
    "Desconhecido",
    "Неизвестный",
    "Bilinmiyor",
    "Невідомий",
    "Không rõ",
    "未知"
  ],
  unlimited: [
    "Unbegrenzt",
    "Tak terbatas",
    "Unlimited",
    "Ilimitado",
    ,
    "Illimitato",
    "無制限",
    "제한없음",
    "Bez ograniczeń",
    "Ilimitado",
    "Неограничено",
    "Limitsiz",
    "Необмежено",
    "Không giới hạn",
    "无限制"
  ],
  unmuted: [
    "Ton an",
    "Bunyikan",
    "Unmuted",
    "Activar sonido",
    ,
    "Microfono attivato",
    "ミュート解除",
    "음소거 해제",
    "Wyciszenie wyłączone",
    "Sem Mudo",
    "Вкл микрофон",
    "Açık",
    "Увімкнути звук",
    "Đã mở âm",
    "已取消静音"
  ],
  "use-mouse-absolute-position": [
    "Absolute Position der Maus verwenden",
    "Gunakan posisi mouse mutlak",
    "Use mouse's absolute position",
    "Usar la posición absoluta del ratón",
    ,
    ,
    "マウスの絶対座標を使用",
    "마우스 절대위치 사용",
    "Użyj pozycji bezwzględnej myszy",
    "Usar posição absoluta do mouse",
    "Использовать абсолютное положение мыши",
    "Farenin mutlak pozisyonunu baz al",
    "Використовувати абсолютне положення миші",
    "Sử dụng vị trí tuyệt đối của chuột",
    "使用鼠标的绝对位置"
  ],
  "user-agent-profile": [
    "User-Agent Profil",
    "Profil User-Agent",
    "User-Agent profile",
    "Perfil del agente de usuario",
    "Profil de l'agent utilisateur",
    "User-Agent",
    "ユーザーエージェントプロファイル",
    "사용자 에이전트 프로파일",
    "Profil User-Agent",
    "Perfil do User-Agent",
    "Профиль устройства",
    "Kullanıcı aracısı profili",
    "Профіль User-Agent",
    "User-Agent",
    "浏览器UA伪装"
  ],
  "vertical-sensitivity": [
    "Vertikale Empfindlichkeit",
    "Sensitivitas vertikal",
    "Vertical sensitivity",
    "Sensibilidad Vertical",
    ,
    "Sensibilità Verticale",
    "上下方向の感度",
    ,
    "Czułość pionowa",
    "Sensibilidade vertical",
    "Вертикальная чувствительность",
    "Dikey hassasiyet",
    "Вертикальна чутливість",
    "Độ ngạy dọc",
    "垂直灵敏度"
  ],
  "vibration-intensity": [
    "Vibrationsstärke",
    "Intensitas getaran",
    "Vibration intensity",
    "Intensidad de la vibración",
    ,
    ,
    "振動の強さ",
    "진동 세기",
    "Siła wibracji",
    "Intensidade da vibração",
    "Сила вибрации",
    "Titreşim gücü",
    "Інтенсивність вібрації",
    "Cường độ rung",
    "振动强度"
  ],
  "vibration-status": [
    "Vibration",
    "Getaran",
    "Vibration",
    "Vibración",
    ,
    ,
    "振動",
    ,
    "Wibracje",
    "Vibração",
    "Вибрация",
    "Titreşim",
    "Вібрація",
    "Rung",
    "手柄震动"
  ],
  video: [
    "Video",
    "Video",
    "Video",
    "Video",
    "Vidéo",
    "Video",
    "映像",
    "비디오",
    "Obraz",
    "Vídeo",
    "Видео",
    "Görüntü",
    "Відео",
    "Hình ảnh",
    "视频"
  ],
  "visual-quality": [
    "Bildqualität",
    "Kualitas visual",
    "Visual quality",
    "Calidad visual",
    "Qualité visuelle",
    "Profilo codec preferito",
    "画質",
    "시각적 품질",
    "Jakość grafiki",
    "Qualidade visual",
    "Качество видеопотока",
    "Görüntü kalitesi",
    "Візуальна якість",
    "Chất lượng hình ảnh",
    "画质"
  ],
  "visual-quality-high": [
    "Hoch",
    "Tinggi",
    "High",
    "Alto",
    "Élevée",
    "Alta",
    "高",
    "높음",
    "Wysoka",
    "Alto",
    "Высокое",
    "Yüksek",
    "Високий",
    "Cao",
    "高"
  ],
  "visual-quality-low": [
    "Niedrig",
    "Rendah",
    "Low",
    "Bajo",
    "Basse",
    "Bassa",
    "低",
    "낮음",
    "Niska",
    "Baixo",
    "Низкое",
    "Düşük",
    "Низький",
    "Thấp",
    "低"
  ],
  "visual-quality-normal": [
    "Mittel",
    "Normal",
    "Normal",
    "Normal",
    "Normal",
    "Normale",
    "中",
    "보통",
    "Normalna",
    "Normal",
    "Среднее",
    "Normal",
    "Нормальний",
    "Thường",
    "中"
  ],
  volume: [
    "Lautstärke",
    "Volume",
    "Volume",
    "Volumen",
    "Volume",
    "Volume",
    "音量",
    "음량",
    "Głośność",
    "Volume",
    "Громкость",
    "Ses düzeyi",
    "Гучність",
    "Âm lượng",
    "音量"
  ],
  "wait-time-countdown": [
    "Countdown",
    "Hitung mundur",
    "Countdown",
    "Cuenta Regresiva",
    "Compte à rebours",
    "Countdown",
    "カウントダウン",
    "카운트다운",
    "Pozostały czas oczekiwania",
    "Contagem regressiva",
    "Время до запуска",
    "Geri sayım",
    "Зворотній відлік",
    "Đếm ngược",
    "倒计时"
  ],
  "wait-time-estimated": [
    "Geschätzte Endzeit",
    "Perkiraan waktu",
    "Estimated finish time",
    "Tiempo estimado de finalización",
    "Temps estimé avant la fin",
    "Tempo residuo stimato",
    "推定完了時間",
    "예상 완료 시간",
    "Szacowany czas zakończenia",
    "Tempo estimado para a conclusão",
    "Примерное время запуска",
    "Tahminî bitiş süresi",
    "Орієнтовний час завершення",
    "Thời gian hoàn thành dự kiến",
    "预计等待时间"
  ]
};

class Translations {
  static #enUS = -1;
  static #selectedLocale = -1;
  static refreshCurrentLocale() {
    const supportedLocales = Object.keys(SUPPORTED_LANGUAGES);
    supportedLocales.sort();
    Translations.#enUS = supportedLocales.indexOf("en-US");
    let locale = localStorage.getItem("better_xcloud_locale");
    if (!locale) {
      locale = window.navigator.language || "en-US";
      if (supportedLocales.indexOf(locale) === -1) {
        locale = "en-US";
      }
      localStorage.setItem("better_xcloud_locale", locale);
    }
    Translations.#selectedLocale = supportedLocales.indexOf(locale);
  }
  static get(key, values) {
    const texts = Texts[key] || alert(`Missing translation key: ${key}`);
    const translation = texts[Translations.#selectedLocale] || texts[Translations.#enUS];
    return values ? translation(values) : translation;
  }
}
var t = Translations.get;
var refreshCurrentLocale = Translations.refreshCurrentLocale;
refreshCurrentLocale();

// src/utils/html.ts
var createElement = function(elmName, props = {}, ..._) {
  let $elm;
  const hasNs = "xmlns" in props;
  if (hasNs) {
    $elm = document.createElementNS(props.xmlns, elmName);
    delete props.xmlns;
  } else {
    $elm = document.createElement(elmName);
  }
  for (const key in props) {
    if ($elm.hasOwnProperty(key)) {
      continue;
    }
    if (hasNs) {
      $elm.setAttributeNS(null, key, props[key]);
    } else {
      $elm.setAttribute(key, props[key]);
    }
  }
  for (let i = 2, size = arguments.length;i < size; i++) {
    const arg = arguments[i];
    const argType = typeof arg;
    if (argType === "string" || argType === "number") {
      $elm.appendChild(document.createTextNode(arg));
    } else if (arg) {
      $elm.appendChild(arg);
    }
  }
  return $elm;
};
var CE = createElement;
var Icon;
(function(Icon2) {
  Icon2["STREAM_SETTINGS"] = '<g transform="matrix(.142357 0 0 .142357 -2.22021 -2.22164)" fill="none" stroke="#fff" stroke-width="16"><circle cx="128" cy="128" r="40"/><path d="M130.05 206.11h-4L94 224c-12.477-4.197-24.049-10.711-34.11-19.2l-.12-36c-.71-1.12-1.38-2.25-2-3.41L25.9 147.24a99.16 99.16 0 0 1 0-38.46l31.84-18.1c.65-1.15 1.32-2.29 2-3.41l.16-36C69.951 42.757 81.521 36.218 94 32l32 17.89h4L162 32c12.477 4.197 24.049 10.711 34.11 19.2l.12 36c.71 1.12 1.38 2.25 2 3.41l31.85 18.14a99.16 99.16 0 0 1 0 38.46l-31.84 18.1c-.65 1.15-1.32 2.29-2 3.41l-.16 36A104.59 104.59 0 0 1 162 224l-31.95-17.89z"/></g>';
  Icon2["STREAM_STATS"] = '<path d="M1.181 24.55v-3.259c0-8.19 6.576-14.952 14.767-14.98H16c8.13 0 14.819 6.69 14.819 14.819v3.42c0 .625-.515 1.14-1.14 1.14H2.321c-.625 0-1.14-.515-1.14-1.14z"/><path d="M16 6.311v4.56M12.58 25.69l9.12-12.54m4.559 5.7h4.386m-29.266 0H5.74"/>';
  Icon2["CONTROLLER"] = '<path d="M19.193 12.807h3.193m-13.836 0h4.257"/><path d="M10.678 10.678v4.257"/><path d="M13.061 19.193l-5.602 6.359c-.698.698-1.646 1.09-2.633 1.09-2.044 0-3.725-1.682-3.725-3.725a3.73 3.73 0 0 1 .056-.646l2.177-11.194a6.94 6.94 0 0 1 6.799-5.721h11.722c3.795 0 6.918 3.123 6.918 6.918s-3.123 6.918-6.918 6.918h-8.793z"/><path d="M18.939 19.193l5.602 6.359c.698.698 1.646 1.09 2.633 1.09 2.044 0 3.725-1.682 3.725-3.725a3.73 3.73 0 0 0-.056-.646l-2.177-11.194"/>';
  Icon2["DISPLAY"] = '<path d="M1.238 21.119c0 1.928 1.565 3.493 3.493 3.493H27.27c1.928 0 3.493-1.565 3.493-3.493V5.961c0-1.928-1.565-3.493-3.493-3.493H4.731c-1.928 0-3.493 1.565-3.493 3.493v15.158zm19.683 8.413H11.08"/>';
  Icon2["MOUSE"] = '<path d="M26.256 8.185c0-3.863-3.137-7-7-7h-6.512c-3.863 0-7 3.137-7 7v15.629c0 3.863 3.137 7 7 7h6.512c3.863 0 7-3.137 7-7V8.185z"/><path d="M16 13.721V6.883"/>';
  Icon2["MOUSE_SETTINGS"] = '<g transform="matrix(1.10403 0 0 1.10403 -4.17656 -.560429)" fill="none" stroke="#fff"><g stroke-width="1.755"><path d="M24.49 16.255l.01-8.612A6.15 6.15 0 0 0 18.357 1.5h-5.714A6.15 6.15 0 0 0 6.5 7.643v13.715a6.15 6.15 0 0 0 6.143 6.143h5.714"/><path d="M15.5 12.501v-6"/></g><circle cx="48" cy="48" r="15" stroke-width="7.02" transform="matrix(.142357 0 0 .142357 17.667421 16.541885)"/><path d="M24.61 27.545h-.214l-1.711.955c-.666-.224-1.284-.572-1.821-1.025l-.006-1.922-.107-.182-1.701-.969c-.134-.678-.134-1.375 0-2.053l1.7-.966.107-.182.009-1.922c.537-.454 1.154-.803 1.82-1.029l1.708.955h.214l1.708-.955c.666.224 1.284.572 1.821 1.025l.006 1.922.107.182 1.7.968c.134.678.134 1.375 0 2.053l-1.7.966-.107.182-.009 1.922c-.536.455-1.154.804-1.819 1.029l-1.706-.955z" stroke-width=".999"/></g>';
  Icon2["NEW"] = '<path d="M26.875 30.5H5.125c-.663 0-1.208-.545-1.208-1.208V2.708c0-.663.545-1.208 1.208-1.208h14.5l8.458 8.458v19.333c0 .663-.545 1.208-1.208 1.208z"/><path d="M19.625 1.5v8.458h8.458m-15.708 9.667h7.25"/><path d="M16 16v7.25"/>';
  Icon2["COPY"] = '<path d="M1.498 6.772h23.73v23.73H1.498zm5.274-5.274h23.73v23.73"/>';
  Icon2["TRASH"] = '<path d="M29.5 6.182h-27m9.818 7.363v9.818m7.364-9.818v9.818"/><path d="M27.045 6.182V29.5c0 .673-.554 1.227-1.227 1.227H6.182c-.673 0-1.227-.554-1.227-1.227V6.182m17.181 0V3.727a2.47 2.47 0 0 0-2.455-2.455h-7.364a2.47 2.47 0 0 0-2.455 2.455v2.455"/>';
  Icon2["CURSOR_TEXT"] = '<path d="M16 7.3a5.83 5.83 0 0 1 5.8-5.8h2.9m0 29h-2.9a5.83 5.83 0 0 1-5.8-5.8"/><path d="M7.3 30.5h2.9a5.83 5.83 0 0 0 5.8-5.8V7.3a5.83 5.83 0 0 0-5.8-5.8H7.3"/><path d="M11.65 16h8.7"/>';
  Icon2["QUESTION"] = '<g transform="matrix(.256867 0 0 .256867 -16.878964 -18.049342)"><circle cx="128" cy="180" r="12" fill="#fff"/><path d="M128 144v-8c17.67 0 32-12.54 32-28s-14.33-28-32-28-32 12.54-32 28v4" fill="none" stroke="#fff" stroke-width="16"/></g>';
  Icon2["REMOTE_PLAY"] = '<g transform="matrix(.492308 0 0 .581818 -14.7692 -11.6364)"><clipPath id="A"><path d="M30 20h65v55H30z"/></clipPath><g clip-path="url(#A)"><g transform="matrix(.395211 0 0 .334409 11.913 7.01124)"><g transform="matrix(.555556 0 0 .555556 57.8889 -20.2417)" fill="none" stroke="#fff" stroke-width="13.88"><path d="M200 140.564c-42.045-33.285-101.955-33.285-144 0M168 165c-23.783-17.3-56.217-17.3-80 0"/></g><g transform="matrix(-.555556 0 0 -.555556 200.111 262.393)"><g transform="matrix(1 0 0 1 0 11.5642)"><path d="M200 129c-17.342-13.728-37.723-21.795-58.636-24.198C111.574 101.378 80.703 109.444 56 129" fill="none" stroke="#fff" stroke-width="13.88"/></g><path d="M168 165c-23.783-17.3-56.217-17.3-80 0" fill="none" stroke="#fff" stroke-width="13.88"/></g><g transform="matrix(.75 0 0 .75 32 32)"><path d="M24 72h208v93.881H24z" fill="none" stroke="#fff" stroke-linejoin="miter" stroke-width="9.485"/><circle cx="188" cy="128" r="12" stroke-width="10" transform="matrix(.708333 0 0 .708333 71.8333 12.8333)"/><path d="M24.358 103.5h110" fill="none" stroke="#fff" stroke-linecap="butt" stroke-width="10.282"/></g></g></g></g>';
  Icon2["HAND_TAP"] = '<path d="M6.537 8.906c0-4.216 3.469-7.685 7.685-7.685s7.685 3.469 7.685 7.685M7.719 30.778l-4.333-7.389C3.133 22.944 3 22.44 3 21.928a2.97 2.97 0 0 1 2.956-2.956 2.96 2.96 0 0 1 2.55 1.461l2.761 4.433V8.906a2.97 2.97 0 0 1 2.956-2.956 2.97 2.97 0 0 1 2.956 2.956v8.276a2.97 2.97 0 0 1 2.956-2.956 2.97 2.97 0 0 1 2.956 2.956v2.365a2.97 2.97 0 0 1 2.956-2.956A2.97 2.97 0 0 1 29 19.547v5.32c0 3.547-1.182 5.911-1.182 5.911"/>';
})(Icon || (Icon = {}));
var createSvgIcon = (icon, strokeWidth = 2) => {
  const $svg = CE("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    stroke: "#fff",
    "fill-rule": "evenodd",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "stroke-width": strokeWidth
  });
  $svg.innerHTML = icon;
  $svg.setAttribute("viewBox", "0 0 32 32");
  return $svg;
};
var ButtonStyle = {};
ButtonStyle[ButtonStyle.PRIMARY = 1] = "bx-primary";
ButtonStyle[ButtonStyle.DANGER = 2] = "bx-danger";
ButtonStyle[ButtonStyle.GHOST = 4] = "bx-ghost";
ButtonStyle[ButtonStyle.FOCUSABLE = 8] = "bx-focusable";
ButtonStyle[ButtonStyle.FULL_WIDTH = 16] = "bx-full-width";
ButtonStyle[ButtonStyle.FULL_HEIGHT = 32] = "bx-full-height";
var ButtonStyleIndices = Object.keys(ButtonStyle).splice(0, Object.keys(ButtonStyle).length / 2).map((i) => parseInt(i));
var createButton = (options) => {
  let $btn;
  if (options.url) {
    $btn = CE("a", { class: "bx-button" });
    $btn.href = options.url;
    $btn.target = "_blank";
  } else {
    $btn = CE("button", { class: "bx-button" });
  }
  const style = options.style || 0;
  style && ButtonStyleIndices.forEach((index) => {
    style & index && $btn.classList.add(ButtonStyle[index]);
  });
  options.classes && $btn.classList.add(...options.classes);
  options.icon && $btn.appendChild(createSvgIcon(options.icon, 4));
  options.label && $btn.appendChild(CE("span", {}, options.label));
  options.title && $btn.setAttribute("title", options.title);
  options.disabled && ($btn.disabled = true);
  options.onClick && $btn.addEventListener("click", options.onClick);
  return $btn;
};
var CTN = document.createTextNode.bind(document);
window.BX_CE = createElement;

// src/utils/settings.ts
var SettingElementType;
(function(SettingElementType2) {
  SettingElementType2["OPTIONS"] = "options";
  SettingElementType2["MULTIPLE_OPTIONS"] = "multiple-options";
  SettingElementType2["NUMBER"] = "number";
  SettingElementType2["NUMBER_STEPPER"] = "number-stepper";
  SettingElementType2["CHECKBOX"] = "checkbox";
})(SettingElementType || (SettingElementType = {}));

class SettingElement {
  static #renderOptions(key, setting, currentValue, onChange) {
    const $control = CE("select");
    for (let value in setting.options) {
      const label = setting.options[value];
      const $option = CE("option", { value }, label);
      $control.appendChild($option);
    }
    $control.value = currentValue;
    onChange && $control.addEventListener("change", (e) => {
      const target = e.target;
      const value = setting.type && setting.type === "number" ? parseInt(target.value) : target.value;
      onChange(e, value);
    });
    $control.setValue = (value) => {
      $control.value = value;
    };
    return $control;
  }
  static #renderMultipleOptions(key, setting, currentValue, onChange, params = {}) {
    const $control = CE("select", { multiple: true });
    if (params && params.size) {
      $control.setAttribute("size", params.size.toString());
    }
    for (let value in setting.multipleOptions) {
      const label = setting.multipleOptions[value];
      const $option = CE("option", { value }, label);
      $option.selected = currentValue.indexOf(value) > -1;
      $option.addEventListener("mousedown", function(e) {
        e.preventDefault();
        const target = e.target;
        target.selected = !target.selected;
        const $parent = target.parentElement;
        $parent.focus();
        $parent.dispatchEvent(new Event("change"));
      });
      $control.appendChild($option);
    }
    $control.addEventListener("mousedown", function(e) {
      const self = this;
      const orgScrollTop = self.scrollTop;
      window.setTimeout(() => self.scrollTop = orgScrollTop, 0);
    });
    $control.addEventListener("mousemove", (e) => e.preventDefault());
    onChange && $control.addEventListener("change", (e) => {
      const target = e.target;
      const values = Array.from(target.selectedOptions).map((i) => i.value);
      onChange(e, values);
    });
    return $control;
  }
  static #renderNumber(key, setting, currentValue, onChange) {
    const $control = CE("input", { type: "number", min: setting.min, max: setting.max });
    $control.value = currentValue;
    onChange && $control.addEventListener("change", (e) => {
      const target = e.target;
      const value = Math.max(setting.min, Math.min(setting.max, parseInt(target.value)));
      target.value = value.toString();
      onChange(e, value);
    });
    return $control;
  }
  static #renderCheckbox(key, setting, currentValue, onChange) {
    const $control = CE("input", { type: "checkbox" });
    $control.checked = currentValue;
    onChange && $control.addEventListener("change", (e) => {
      onChange(e, e.target.checked);
    });
    return $control;
  }
  static #renderNumberStepper(key, setting, value, onChange, options = {}) {
    options = options || {};
    options.suffix = options.suffix || "";
    options.disabled = !!options.disabled;
    options.hideSlider = !!options.hideSlider;
    let $text;
    let $decBtn;
    let $incBtn;
    let $range;
    const MIN = setting.min;
    const MAX = setting.max;
    const STEPS = Math.max(setting.steps || 1, 1);
    const $wrapper = CE("div", { class: "bx-number-stepper" }, $decBtn = CE("button", { "data-type": "dec" }, "-"), $text = CE("span", {}, value + options.suffix), $incBtn = CE("button", { "data-type": "inc" }, "+"));
    if (!options.disabled && !options.hideSlider) {
      $range = CE("input", { type: "range", min: MIN, max: MAX, value, step: STEPS });
      $range.addEventListener("input", (e) => {
        value = parseInt(e.target.value);
        $text.textContent = value + options.suffix;
        onChange && onChange(e, value);
      });
      $wrapper.appendChild($range);
      if (options.ticks || options.exactTicks) {
        const markersId = `markers-${key}`;
        const $markers = CE("datalist", { id: markersId });
        $range.setAttribute("list", markersId);
        if (options.exactTicks) {
          let start = Math.max(Math.floor(MIN / options.exactTicks), 1) * options.exactTicks;
          if (start === MIN) {
            start += options.exactTicks;
          }
          for (let i = start;i < MAX; i += options.exactTicks) {
            $markers.appendChild(CE("option", { value: i }));
          }
        } else {
          for (let i = MIN + options.ticks;i < MAX; i += options.ticks) {
            $markers.appendChild(CE("option", { value: i }));
          }
        }
        $wrapper.appendChild($markers);
      }
    }
    if (options.disabled) {
      $incBtn.disabled = true;
      $incBtn.classList.add("bx-hidden");
      $decBtn.disabled = true;
      $decBtn.classList.add("bx-hidden");
      return $wrapper;
    }
    let interval;
    let isHolding = false;
    const onClick = (e) => {
      if (isHolding) {
        e.preventDefault();
        isHolding = false;
        return;
      }
      let value2;
      if ($range) {
        value2 = parseInt($range.value);
      } else {
        value2 = parseInt($text.textContent);
      }
      const btnType = e.target.getAttribute("data-type");
      if (btnType === "dec") {
        value2 = Math.max(MIN, value2 - STEPS);
      } else {
        value2 = Math.min(MAX, value2 + STEPS);
      }
      $text.textContent = value2.toString() + options.suffix;
      $range && ($range.value = value2.toString());
      isHolding = false;
      onChange && onChange(e, value2);
    };
    const onMouseDown = (e) => {
      isHolding = true;
      const args = arguments;
      interval = window.setInterval(() => {
        const event = new Event("click");
        event.arguments = args;
        e.target?.dispatchEvent(event);
      }, 200);
    };
    const onMouseUp = (e) => {
      clearInterval(interval);
      isHolding = false;
    };
    $wrapper.setValue = (value2) => {
      $text.textContent = value2 + options.suffix;
      $range && ($range.value = value2);
    };
    $decBtn.addEventListener("click", onClick);
    $decBtn.addEventListener("mousedown", onMouseDown);
    $decBtn.addEventListener("mouseup", onMouseUp);
    $decBtn.addEventListener("touchstart", onMouseDown);
    $decBtn.addEventListener("touchend", onMouseUp);
    $incBtn.addEventListener("click", onClick);
    $incBtn.addEventListener("mousedown", onMouseDown);
    $incBtn.addEventListener("mouseup", onMouseUp);
    $incBtn.addEventListener("touchstart", onMouseDown);
    $incBtn.addEventListener("touchend", onMouseUp);
    return $wrapper;
  }
  static #METHOD_MAP = {
    [SettingElementType.OPTIONS]: SettingElement.#renderOptions,
    [SettingElementType.MULTIPLE_OPTIONS]: SettingElement.#renderMultipleOptions,
    [SettingElementType.NUMBER]: SettingElement.#renderNumber,
    [SettingElementType.NUMBER_STEPPER]: SettingElement.#renderNumberStepper,
    [SettingElementType.CHECKBOX]: SettingElement.#renderCheckbox
  };
  static render(type, key, setting, currentValue, onChange, options) {
    const method = SettingElement.#METHOD_MAP[type];
    const $control = method(...Array.from(arguments).slice(1));
    $control.id = `bx_setting_${key}`;
    if (type === SettingElementType.OPTIONS || type === SettingElementType.MULTIPLE_OPTIONS) {
      $control.name = $control.id;
    }
    return $control;
  }
}

// src/utils/user-agent.ts
var UserAgentProfile;
(function(UserAgentProfile2) {
  UserAgentProfile2["EDGE_WINDOWS"] = "edge-windows";
  UserAgentProfile2["SAFARI_MACOS"] = "safari-macos";
  UserAgentProfile2["SMARTTV_TIZEN"] = "smarttv-tizen";
  UserAgentProfile2["KIWI_V123"] = "kiwi-v123";
  UserAgentProfile2["DEFAULT"] = "default";
  UserAgentProfile2["CUSTOM"] = "custom";
})(UserAgentProfile || (UserAgentProfile = {}));
var CHROMIUM_VERSION = "123.0.0.0";
if (!!window.chrome) {
  const match = window.navigator.userAgent.match(/\s(?:Chrome|Edg)\/([\d\.]+)/);
  if (match) {
    CHROMIUM_VERSION = match[1];
  }
}
var EDGE_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/[[VERSION]] Safari/537.36 Edg/[[VERSION]]";
EDGE_USER_AGENT = EDGE_USER_AGENT.replaceAll("[[VERSION]]", CHROMIUM_VERSION);

class UserAgent {
  static #USER_AGENTS = {
    [UserAgentProfile.EDGE_WINDOWS]: EDGE_USER_AGENT,
    [UserAgentProfile.SAFARI_MACOS]: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.2 Safari/605.1.1",
    [UserAgentProfile.SMARTTV_TIZEN]: "Mozilla/5.0 (SMART-TV; LINUX; Tizen 7.0) AppleWebKit/537.36 (KHTML, like Gecko) 94.0.4606.31/7.0 TV Safari/537.36",
    [UserAgentProfile.KIWI_V123]: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.118 Mobile Safari/537.36"
  };
  static getDefault() {
    return window.navigator.orgUserAgent || window.navigator.userAgent;
  }
  static get(profile) {
    const defaultUserAgent = UserAgent.getDefault();
    if (profile === UserAgentProfile.CUSTOM) {
      return getPref(PrefKey.USER_AGENT_CUSTOM);
    }
    return UserAgent.#USER_AGENTS[profile] || defaultUserAgent;
  }
  static isSafari(mobile = false) {
    const userAgent = (UserAgent.getDefault() || "").toLowerCase();
    let result = userAgent.includes("safari") && !userAgent.includes("chrom");
    if (result && mobile) {
      result = userAgent.includes("mobile");
    }
    return result;
  }
  static spoof() {
    let newUserAgent;
    const profile = getPref(PrefKey.USER_AGENT_PROFILE);
    if (profile === UserAgentProfile.DEFAULT) {
      return;
    }
    if (!newUserAgent) {
      newUserAgent = UserAgent.get(profile);
    }
    Object.defineProperty(window.navigator, "userAgentData", {});
    window.navigator.orgUserAgent = window.navigator.userAgent;
    Object.defineProperty(window.navigator, "userAgent", {
      value: newUserAgent
    });
    return newUserAgent;
  }
}

// src/modules/stream/stream-badges.ts
var StreamBadge;
(function(StreamBadge2) {
  StreamBadge2["PLAYTIME"] = "playtime";
  StreamBadge2["BATTERY"] = "battery";
  StreamBadge2["IN"] = "in";
  StreamBadge2["OUT"] = "out";
  StreamBadge2["SERVER"] = "server";
  StreamBadge2["VIDEO"] = "video";
  StreamBadge2["AUDIO"] = "audio";
  StreamBadge2["BREAK"] = "break";
})(StreamBadge || (StreamBadge = {}));

class StreamBadges {
  static ipv6 = false;
  static resolution = null;
  static video = null;
  static audio = null;
  static fps = 0;
  static region = "";
  static startBatteryLevel = 100;
  static startTimestamp = 0;
  static #cachedDoms = {};
  static #interval;
  static #REFRESH_INTERVAL = 3000;
  static #renderBadge(name, value, color) {
    if (name === StreamBadge.BREAK) {
      return CE("div", { style: "display: block" });
    }
    let $badge;
    if (StreamBadges.#cachedDoms[name]) {
      $badge = StreamBadges.#cachedDoms[name];
      $badge.lastElementChild.textContent = value;
      return $badge;
    }
    $badge = CE("div", { class: "bx-badge" }, CE("span", { class: "bx-badge-name" }, t(`badge-${name}`)), CE("span", { class: "bx-badge-value", style: `background-color: ${color}` }, value));
    if (name === StreamBadge.BATTERY) {
      $badge.classList.add("bx-badge-battery");
    }
    StreamBadges.#cachedDoms[name] = $badge;
    return $badge;
  }
  static async#updateBadges(forceUpdate) {
    if (!forceUpdate && !document.querySelector(".bx-badges")) {
      StreamBadges.#stop();
      return;
    }
    let now = +new Date;
    const diffSeconds = Math.ceil((now - StreamBadges.startTimestamp) / 1000);
    const playtime = StreamBadges.#secondsToHm(diffSeconds);
    let batteryLevel = "100%";
    let batteryLevelInt = 100;
    let isCharging = false;
    if ("getBattery" in navigator) {
      try {
        const bm = await navigator.getBattery();
        isCharging = bm.charging;
        batteryLevelInt = Math.round(bm.level * 100);
        batteryLevel = `${batteryLevelInt}%`;
        if (batteryLevelInt != StreamBadges.startBatteryLevel) {
          const diffLevel = Math.round(batteryLevelInt - StreamBadges.startBatteryLevel);
          const sign = diffLevel > 0 ? "+" : "";
          batteryLevel += ` (${sign}${diffLevel}%)`;
        }
      } catch (e) {
      }
    }
    const stats = await STATES.currentStream.peerConnection?.getStats();
    let totalIn = 0;
    let totalOut = 0;
    stats.forEach((stat) => {
      if (stat.type === "candidate-pair" && stat.packetsReceived > 0 && stat.state === "succeeded") {
        totalIn += stat.bytesReceived;
        totalOut += stat.bytesSent;
      }
    });
    const badges = {
      [StreamBadge.IN]: totalIn ? StreamBadges.#humanFileSize(totalIn) : null,
      [StreamBadge.OUT]: totalOut ? StreamBadges.#humanFileSize(totalOut) : null,
      [StreamBadge.PLAYTIME]: playtime,
      [StreamBadge.BATTERY]: batteryLevel
    };
    let name;
    for (name in badges) {
      const value = badges[name];
      if (value === null) {
        continue;
      }
      const $elm = StreamBadges.#cachedDoms[name];
      $elm && ($elm.lastElementChild.textContent = value);
      if (name === StreamBadge.BATTERY) {
        $elm.setAttribute("data-charging", isCharging.toString());
        if (StreamBadges.startBatteryLevel === 100 && batteryLevelInt === 100) {
          $elm.style.display = "none";
        } else {
          $elm.removeAttribute("style");
        }
      }
    }
  }
  static #stop() {
    StreamBadges.#interval && clearInterval(StreamBadges.#interval);
    StreamBadges.#interval = null;
  }
  static #secondsToHm(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60) + 1;
    const hDisplay = h > 0 ? `${h}h` : "";
    const mDisplay = m > 0 ? `${m}m` : "";
    return hDisplay + mDisplay;
  }
  static #humanFileSize(size) {
    const units = ["B", "kB", "MB", "GB", "TB"];
    let i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) + " " + units[i];
  }
  static async render() {
    let video = "";
    if (StreamBadges.resolution) {
      video = `${StreamBadges.resolution.height}p`;
    }
    if (StreamBadges.video) {
      video && (video += "/");
      video += StreamBadges.video.codec;
      if (StreamBadges.video.profile) {
        const profile = StreamBadges.video.profile;
        let quality = profile;
        if (profile.startsWith("4d")) {
          quality = t("visual-quality-high");
        } else if (profile.startsWith("42e")) {
          quality = t("visual-quality-normal");
        } else if (profile.startsWith("420")) {
          quality = t("visual-quality-low");
        }
        video += ` (${quality})`;
      }
    }
    let audio;
    if (StreamBadges.audio) {
      audio = StreamBadges.audio.codec;
      const bitrate = StreamBadges.audio.bitrate / 1000;
      audio += ` (${bitrate} kHz)`;
    }
    let batteryLevel = "";
    if ("getBattery" in navigator) {
      batteryLevel = "100%";
    }
    let server = StreamBadges.region;
    server += "@" + (StreamBadges.ipv6 ? "IPv6" : "IPv4");
    const BADGES = [
      [StreamBadge.PLAYTIME, "1m", "#ff004d"],
      [StreamBadge.BATTERY, batteryLevel, "#00b543"],
      [StreamBadge.IN, StreamBadges.#humanFileSize(0), "#29adff"],
      [StreamBadge.OUT, StreamBadges.#humanFileSize(0), "#ff77a8"],
      [StreamBadge.BREAK],
      [StreamBadge.SERVER, server, "#ff6c24"],
      video ? [StreamBadge.VIDEO, video, "#742f29"] : null,
      audio ? [StreamBadge.AUDIO, audio, "#5f574f"] : null
    ];
    const $wrapper = CE("div", { class: "bx-badges" });
    BADGES.forEach((item2) => {
      if (!item2) {
        return;
      }
      const $badge = StreamBadges.#renderBadge(...item2);
      $wrapper.appendChild($badge);
    });
    await StreamBadges.#updateBadges(true);
    StreamBadges.#stop();
    StreamBadges.#interval = window.setInterval(StreamBadges.#updateBadges, StreamBadges.#REFRESH_INTERVAL);
    return $wrapper;
  }
  static setupEvents() {
    window.addEventListener(BxEvent.STREAM_PLAYING, (e) => {
      const $video = e.$video;
      StreamBadges.resolution = {
        width: $video.videoWidth,
        height: $video.videoHeight
      };
      StreamBadges.startTimestamp = +new Date;
      try {
        "getBattery" in navigator && navigator.getBattery().then((bm) => {
          StreamBadges.startBatteryLevel = Math.round(bm.level * 100);
        });
      } catch (e2) {
      }
    });
  }
}

// src/modules/stream/stream-stats.ts
var StreamStat;
(function(StreamStat2) {
  StreamStat2["PING"] = "ping";
  StreamStat2["FPS"] = "fps";
  StreamStat2["BITRATE"] = "btr";
  StreamStat2["DECODE_TIME"] = "dt";
  StreamStat2["PACKETS_LOST"] = "pl";
  StreamStat2["FRAMES_LOST"] = "fl";
})(StreamStat || (StreamStat = {}));

class StreamStats {
  static #interval;
  static #updateInterval = 1000;
  static #$container;
  static #$fps;
  static #$ping;
  static #$dt;
  static #$pl;
  static #$fl;
  static #$br;
  static #lastStat;
  static #quickGlanceObserver;
  static start(glancing = false) {
    if (!StreamStats.isHidden() || glancing && StreamStats.isGlancing()) {
      return;
    }
    StreamStats.#$container.classList.remove("bx-gone");
    StreamStats.#$container.setAttribute("data-display", glancing ? "glancing" : "fixed");
    StreamStats.#interval = window.setInterval(StreamStats.update, StreamStats.#updateInterval);
  }
  static stop(glancing = false) {
    if (glancing && !StreamStats.isGlancing()) {
      return;
    }
    StreamStats.#interval && clearInterval(StreamStats.#interval);
    StreamStats.#interval = null;
    StreamStats.#lastStat = null;
    if (StreamStats.#$container) {
      StreamStats.#$container.removeAttribute("data-display");
      StreamStats.#$container.classList.add("bx-gone");
    }
  }
  static toggle() {
    if (StreamStats.isGlancing()) {
      StreamStats.#$container.setAttribute("data-display", "fixed");
    } else {
      StreamStats.isHidden() ? StreamStats.start() : StreamStats.stop();
    }
  }
  static onStoppedPlaying() {
    StreamStats.stop();
    StreamStats.quickGlanceStop();
    StreamStats.hideSettingsUi();
  }
  static isHidden = () => StreamStats.#$container && StreamStats.#$container.classList.contains("bx-gone");
  static isGlancing = () => StreamStats.#$container && StreamStats.#$container.getAttribute("data-display") === "glancing";
  static quickGlanceSetup() {
    if (StreamStats.#quickGlanceObserver) {
      return;
    }
    const $uiContainer = document.querySelector("div[data-testid=ui-container]");
    StreamStats.#quickGlanceObserver = new MutationObserver((mutationList, observer) => {
      for (let record of mutationList) {
        if (record.attributeName && record.attributeName === "aria-expanded") {
          const expanded = record.target.ariaExpanded;
          if (expanded === "true") {
            StreamStats.isHidden() && StreamStats.start(true);
          } else {
            StreamStats.stop(true);
          }
        }
      }
    });
    StreamStats.#quickGlanceObserver.observe($uiContainer, {
      attributes: true,
      attributeFilter: ["aria-expanded"],
      subtree: true
    });
  }
  static quickGlanceStop() {
    StreamStats.#quickGlanceObserver && StreamStats.#quickGlanceObserver.disconnect();
    StreamStats.#quickGlanceObserver = null;
  }
  static update() {
    if (StreamStats.isHidden() || !STATES.currentStream.peerConnection) {
      StreamStats.onStoppedPlaying();
      return;
    }
    const PREF_STATS_CONDITIONAL_FORMATTING = getPref(PrefKey.STATS_CONDITIONAL_FORMATTING);
    STATES.currentStream.peerConnection.getStats().then((stats) => {
      stats.forEach((stat) => {
        let grade = "";
        if (stat.type === "inbound-rtp" && stat.kind === "video") {
          StreamStats.#$fps.textContent = stat.framesPerSecond || 0;
          const packetsLost = stat.packetsLost;
          const packetsReceived = stat.packetsReceived;
          const packetsLostPercentage = (packetsLost * 100 / (packetsLost + packetsReceived || 1)).toFixed(2);
          StreamStats.#$pl.textContent = packetsLostPercentage === "0.00" ? packetsLost : `${packetsLost} (${packetsLostPercentage}%)`;
          const framesDropped = stat.framesDropped;
          const framesReceived = stat.framesReceived;
          const framesDroppedPercentage = (framesDropped * 100 / (framesDropped + framesReceived || 1)).toFixed(2);
          StreamStats.#$fl.textContent = framesDroppedPercentage === "0.00" ? framesDropped : `${framesDropped} (${framesDroppedPercentage}%)`;
          if (StreamStats.#lastStat) {
            const lastStat = StreamStats.#lastStat;
            const timeDiff = stat.timestamp - lastStat.timestamp;
            const bitrate = 8 * (stat.bytesReceived - lastStat.bytesReceived) / timeDiff / 1000;
            StreamStats.#$br.textContent = `${bitrate.toFixed(2)} Mbps`;
            const totalDecodeTimeDiff = stat.totalDecodeTime - lastStat.totalDecodeTime;
            const framesDecodedDiff = stat.framesDecoded - lastStat.framesDecoded;
            const currentDecodeTime = totalDecodeTimeDiff / framesDecodedDiff * 1000;
            StreamStats.#$dt.textContent = `${currentDecodeTime.toFixed(2)}ms`;
            if (PREF_STATS_CONDITIONAL_FORMATTING) {
              grade = currentDecodeTime > 12 ? "bad" : currentDecodeTime > 9 ? "ok" : currentDecodeTime > 6 ? "good" : "";
            }
            StreamStats.#$dt.setAttribute("data-grade", grade);
          }
          StreamStats.#lastStat = stat;
        } else if (stat.type === "candidate-pair" && stat.packetsReceived > 0 && stat.state === "succeeded") {
          const roundTripTime = typeof stat.currentRoundTripTime !== "undefined" ? stat.currentRoundTripTime * 1000 : -1;
          StreamStats.#$ping.textContent = roundTripTime === -1 ? "???" : roundTripTime.toString();
          if (PREF_STATS_CONDITIONAL_FORMATTING) {
            grade = roundTripTime > 100 ? "bad" : roundTripTime > 75 ? "ok" : roundTripTime > 40 ? "good" : "";
          }
          StreamStats.#$ping.setAttribute("data-grade", grade);
        }
      });
    });
  }
  static refreshStyles() {
    const PREF_ITEMS = getPref(PrefKey.STATS_ITEMS);
    const PREF_POSITION = getPref(PrefKey.STATS_POSITION);
    const PREF_TRANSPARENT = getPref(PrefKey.STATS_TRANSPARENT);
    const PREF_OPACITY = getPref(PrefKey.STATS_OPACITY);
    const PREF_TEXT_SIZE = getPref(PrefKey.STATS_TEXT_SIZE);
    const $container = StreamStats.#$container;
    $container.setAttribute("data-stats", "[" + PREF_ITEMS.join("][") + "]");
    $container.setAttribute("data-position", PREF_POSITION);
    $container.setAttribute("data-transparent", PREF_TRANSPARENT);
    $container.style.opacity = PREF_OPACITY + "%";
    $container.style.fontSize = PREF_TEXT_SIZE;
  }
  static hideSettingsUi() {
    if (StreamStats.isGlancing() && !getPref(PrefKey.STATS_QUICK_GLANCE)) {
      StreamStats.stop();
    }
  }
  static render() {
    if (StreamStats.#$container) {
      return;
    }
    const STATS = {
      [StreamStat.PING]: [t("stat-ping"), StreamStats.#$ping = CE("span", {}, "0")],
      [StreamStat.FPS]: [t("stat-fps"), StreamStats.#$fps = CE("span", {}, "0")],
      [StreamStat.BITRATE]: [t("stat-bitrate"), StreamStats.#$br = CE("span", {}, "0 Mbps")],
      [StreamStat.DECODE_TIME]: [t("stat-decode-time"), StreamStats.#$dt = CE("span", {}, "0ms")],
      [StreamStat.PACKETS_LOST]: [t("stat-packets-lost"), StreamStats.#$pl = CE("span", {}, "0")],
      [StreamStat.FRAMES_LOST]: [t("stat-frames-lost"), StreamStats.#$fl = CE("span", {}, "0")]
    };
    const $barFragment = document.createDocumentFragment();
    let statKey;
    for (statKey in STATS) {
      const $div = CE("div", { class: `bx-stat-${statKey}`, title: STATS[statKey][0] }, CE("label", {}, statKey.toUpperCase()), STATS[statKey][1]);
      $barFragment.appendChild($div);
    }
    StreamStats.#$container = CE("div", { class: "bx-stats-bar bx-gone" }, $barFragment);
    document.documentElement.appendChild(StreamStats.#$container);
    StreamStats.refreshStyles();
  }
  static getServerStats() {
    STATES.currentStream.peerConnection && STATES.currentStream.peerConnection.getStats().then((stats) => {
      const allVideoCodecs = {};
      let videoCodecId;
      const allAudioCodecs = {};
      let audioCodecId;
      const allCandidates = {};
      let candidateId;
      stats.forEach((stat) => {
        if (stat.type === "codec") {
          const mimeType = stat.mimeType.split("/");
          if (mimeType[0] === "video") {
            allVideoCodecs[stat.id] = stat;
          } else if (mimeType[0] === "audio") {
            allAudioCodecs[stat.id] = stat;
          }
        } else if (stat.type === "inbound-rtp" && stat.packetsReceived > 0) {
          if (stat.kind === "video") {
            videoCodecId = stat.codecId;
          } else if (stat.kind === "audio") {
            audioCodecId = stat.codecId;
          }
        } else if (stat.type === "candidate-pair" && stat.packetsReceived > 0 && stat.state === "succeeded") {
          candidateId = stat.remoteCandidateId;
        } else if (stat.type === "remote-candidate") {
          allCandidates[stat.id] = stat.address;
        }
      });
      if (videoCodecId) {
        const videoStat = allVideoCodecs[videoCodecId];
        const video = {
          codec: videoStat.mimeType.substring(6)
        };
        if (video.codec === "H264") {
          const match = /profile-level-id=([0-9a-f]{6})/.exec(videoStat.sdpFmtpLine);
          video.profile = match ? match[1] : null;
        }
        StreamBadges.video = video;
      }
      if (audioCodecId) {
        const audioStat = allAudioCodecs[audioCodecId];
        StreamBadges.audio = {
          codec: audioStat.mimeType.substring(6),
          bitrate: audioStat.clockRate
        };
      }
      if (candidateId) {
        console.log("candidate", candidateId, allCandidates);
        StreamBadges.ipv6 = allCandidates[candidateId].includes(":");
      }
      if (getPref(PrefKey.STATS_SHOW_WHEN_PLAYING)) {
        StreamStats.start();
      }
    });
  }
  static setupEvents() {
    window.addEventListener(BxEvent.STREAM_PLAYING, (e) => {
      const PREF_STATS_QUICK_GLANCE = getPref(PrefKey.STATS_QUICK_GLANCE);
      const PREF_STATS_SHOW_WHEN_PLAYING = getPref(PrefKey.STATS_SHOW_WHEN_PLAYING);
      StreamStats.getServerStats();
      if (PREF_STATS_QUICK_GLANCE) {
        StreamStats.quickGlanceSetup();
        !PREF_STATS_SHOW_WHEN_PLAYING && StreamStats.start(true);
      }
    });
  }
}

// src/utils/preferences.ts
var PrefKey;
(function(PrefKey2) {
  PrefKey2["LAST_UPDATE_CHECK"] = "version_last_check";
  PrefKey2["LATEST_VERSION"] = "version_latest";
  PrefKey2["CURRENT_VERSION"] = "version_current";
  PrefKey2["BETTER_XCLOUD_LOCALE"] = "bx_locale";
  PrefKey2["SERVER_REGION"] = "server_region";
  PrefKey2["PREFER_IPV6_SERVER"] = "prefer_ipv6_server";
  PrefKey2["STREAM_TARGET_RESOLUTION"] = "stream_target_resolution";
  PrefKey2["STREAM_PREFERRED_LOCALE"] = "stream_preferred_locale";
  PrefKey2["STREAM_CODEC_PROFILE"] = "stream_codec_profile";
  PrefKey2["USER_AGENT_PROFILE"] = "user_agent_profile";
  PrefKey2["USER_AGENT_CUSTOM"] = "user_agent_custom";
  PrefKey2["STREAM_SIMPLIFY_MENU"] = "stream_simplify_menu";
  PrefKey2["STREAM_COMBINE_SOURCES"] = "stream_combine_sources";
  PrefKey2["STREAM_TOUCH_CONTROLLER"] = "stream_touch_controller";
  PrefKey2["STREAM_TOUCH_CONTROLLER_AUTO_OFF"] = "stream_touch_controller_auto_off";
  PrefKey2["STREAM_TOUCH_CONTROLLER_STYLE_STANDARD"] = "stream_touch_controller_style_standard";
  PrefKey2["STREAM_TOUCH_CONTROLLER_STYLE_CUSTOM"] = "stream_touch_controller_style_custom";
  PrefKey2["STREAM_DISABLE_FEEDBACK_DIALOG"] = "stream_disable_feedback_dialog";
  PrefKey2["LOCAL_CO_OP_ENABLED"] = "local_co_op_enabled";
  PrefKey2["CONTROLLER_ENABLE_SHORTCUTS"] = "controller_enable_shortcuts";
  PrefKey2["CONTROLLER_ENABLE_VIBRATION"] = "controller_enable_vibration";
  PrefKey2["CONTROLLER_DEVICE_VIBRATION"] = "controller_device_vibration";
  PrefKey2["CONTROLLER_VIBRATION_INTENSITY"] = "controller_vibration_intensity";
  PrefKey2["MKB_ENABLED"] = "mkb_enabled";
  PrefKey2["MKB_HIDE_IDLE_CURSOR"] = "mkb_hide_idle_cursor";
  PrefKey2["MKB_ABSOLUTE_MOUSE"] = "mkb_absolute_mouse";
  PrefKey2["MKB_DEFAULT_PRESET_ID"] = "mkb_default_preset_id";
  PrefKey2["SCREENSHOT_BUTTON_POSITION"] = "screenshot_button_position";
  PrefKey2["SCREENSHOT_APPLY_FILTERS"] = "screenshot_apply_filters";
  PrefKey2["BLOCK_TRACKING"] = "block_tracking";
  PrefKey2["BLOCK_SOCIAL_FEATURES"] = "block_social_features";
  PrefKey2["SKIP_SPLASH_VIDEO"] = "skip_splash_video";
  PrefKey2["HIDE_DOTS_ICON"] = "hide_dots_icon";
  PrefKey2["REDUCE_ANIMATIONS"] = "reduce_animations";
  PrefKey2["UI_LOADING_SCREEN_GAME_ART"] = "ui_loading_screen_game_art";
  PrefKey2["UI_LOADING_SCREEN_WAIT_TIME"] = "ui_loading_screen_wait_time";
  PrefKey2["UI_LOADING_SCREEN_ROCKET"] = "ui_loading_screen_rocket";
  PrefKey2["UI_LAYOUT"] = "ui_layout";
  PrefKey2["UI_SCROLLBAR_HIDE"] = "ui_scrollbar_hide";
  PrefKey2["VIDEO_CLARITY"] = "video_clarity";
  PrefKey2["VIDEO_RATIO"] = "video_ratio";
  PrefKey2["VIDEO_BRIGHTNESS"] = "video_brightness";
  PrefKey2["VIDEO_CONTRAST"] = "video_contrast";
  PrefKey2["VIDEO_SATURATION"] = "video_saturation";
  PrefKey2["AUDIO_MIC_ON_PLAYING"] = "audio_mic_on_playing";
  PrefKey2["AUDIO_ENABLE_VOLUME_CONTROL"] = "audio_enable_volume_control";
  PrefKey2["AUDIO_VOLUME"] = "audio_volume";
  PrefKey2["STATS_ITEMS"] = "stats_items";
  PrefKey2["STATS_SHOW_WHEN_PLAYING"] = "stats_show_when_playing";
  PrefKey2["STATS_QUICK_GLANCE"] = "stats_quick_glance";
  PrefKey2["STATS_POSITION"] = "stats_position";
  PrefKey2["STATS_TEXT_SIZE"] = "stats_text_size";
  PrefKey2["STATS_TRANSPARENT"] = "stats_transparent";
  PrefKey2["STATS_OPACITY"] = "stats_opacity";
  PrefKey2["STATS_CONDITIONAL_FORMATTING"] = "stats_conditional_formatting";
  PrefKey2["REMOTE_PLAY_ENABLED"] = "xhome_enabled";
  PrefKey2["REMOTE_PLAY_RESOLUTION"] = "xhome_resolution";
  PrefKey2["GAME_FORTNITE_FORCE_CONSOLE"] = "game_fortnite_force_console";
})(PrefKey || (PrefKey = {}));

class Preferences {
  static SETTINGS = {
    [PrefKey.LAST_UPDATE_CHECK]: {
      default: 0
    },
    [PrefKey.LATEST_VERSION]: {
      default: ""
    },
    [PrefKey.CURRENT_VERSION]: {
      default: ""
    },
    [PrefKey.BETTER_XCLOUD_LOCALE]: {
      label: t("language"),
      default: localStorage.getItem("better_xcloud_locale") || "en-US",
      options: SUPPORTED_LANGUAGES
    },
    [PrefKey.SERVER_REGION]: {
      label: t("region"),
      default: "default"
    },
    [PrefKey.STREAM_PREFERRED_LOCALE]: {
      label: t("preferred-game-language"),
      default: "default",
      options: {
        default: t("default"),
        "ar-SA": "العربية",
        "cs-CZ": "čeština",
        "da-DK": "dansk",
        "de-DE": "Deutsch",
        "el-GR": "Ελληνικά",
        "en-GB": "English (United Kingdom)",
        "en-US": "English (United States)",
        "es-ES": "español (España)",
        "es-MX": "español (Latinoamérica)",
        "fi-FI": "suomi",
        "fr-FR": "français",
        "he-IL": "עברית",
        "hu-HU": "magyar",
        "it-IT": "italiano",
        "ja-JP": "日本語",
        "ko-KR": "한국어",
        "nb-NO": "norsk bokmål",
        "nl-NL": "Nederlands",
        "pl-PL": "polski",
        "pt-BR": "português (Brasil)",
        "pt-PT": "português (Portugal)",
        "ru-RU": "русский",
        "sk-SK": "slovenčina",
        "sv-SE": "svenska",
        "tr-TR": "Türkçe",
        "zh-CN": "中文(简体)",
        "zh-TW": "中文 (繁體)"
      }
    },
    [PrefKey.STREAM_TARGET_RESOLUTION]: {
      label: t("target-resolution"),
      default: "auto",
      options: {
        auto: t("default"),
        "1080p": "1080p",
        "720p": "720p"
      }
    },
    [PrefKey.STREAM_CODEC_PROFILE]: {
      label: t("visual-quality"),
      default: "default",
      options: (() => {
        const options = {
          default: t("default")
        };
        if (!("getCapabilities" in RTCRtpReceiver) || typeof RTCRtpTransceiver === "undefined" || !("setCodecPreferences" in RTCRtpTransceiver.prototype)) {
          return options;
        }
        let hasLowCodec = false;
        let hasNormalCodec = false;
        let hasHighCodec = false;
        const codecs = RTCRtpReceiver.getCapabilities("video").codecs;
        for (let codec of codecs) {
          if (codec.mimeType.toLowerCase() !== "video/h264" || !codec.sdpFmtpLine) {
            continue;
          }
          const fmtp = codec.sdpFmtpLine.toLowerCase();
          if (!hasHighCodec && fmtp.includes("profile-level-id=4d")) {
            hasHighCodec = true;
          } else if (!hasNormalCodec && fmtp.includes("profile-level-id=42e")) {
            hasNormalCodec = true;
          } else if (!hasLowCodec && fmtp.includes("profile-level-id=420")) {
            hasLowCodec = true;
          }
        }
        if (hasHighCodec) {
          if (!hasLowCodec && !hasNormalCodec) {
            options.default = `${t("visual-quality-high")} (${t("default")})`;
          } else {
            options.high = t("visual-quality-high");
          }
        }
        if (hasNormalCodec) {
          if (!hasLowCodec && !hasHighCodec) {
            options.default = `${t("visual-quality-normal")} (${t("default")})`;
          } else {
            options.normal = t("visual-quality-normal");
          }
        }
        if (hasLowCodec) {
          if (!hasNormalCodec && !hasHighCodec) {
            options.default = `${t("visual-quality-low")} (${t("default")})`;
          } else {
            options.low = t("visual-quality-low");
          }
        }
        return options;
      })(),
      ready: () => {
        const setting = Preferences.SETTINGS[PrefKey.STREAM_CODEC_PROFILE];
        const options = setting.options;
        const keys = Object.keys(options);
        if (keys.length <= 1) {
          setting.unsupported = true;
          setting.note = "⚠️ " + t("browser-unsupported-feature");
        } else {
        }
      }
    },
    [PrefKey.PREFER_IPV6_SERVER]: {
      label: t("prefer-ipv6-server"),
      default: false
    },
    [PrefKey.SCREENSHOT_BUTTON_POSITION]: {
      label: t("screenshot-button-position"),
      default: "bottom-left",
      options: {
        "bottom-left": t("bottom-left"),
        "bottom-right": t("bottom-right"),
        none: t("disable")
      }
    },
    [PrefKey.SCREENSHOT_APPLY_FILTERS]: {
      label: t("screenshot-apply-filters"),
      default: false
    },
    [PrefKey.SKIP_SPLASH_VIDEO]: {
      label: t("skip-splash-video"),
      default: false
    },
    [PrefKey.HIDE_DOTS_ICON]: {
      label: t("hide-system-menu-icon"),
      default: false
    },
    [PrefKey.STREAM_COMBINE_SOURCES]: {
      label: t("combine-audio-video-streams"),
      default: false,
      experimental: true,
      note: t("combine-audio-video-streams-summary")
    },
    [PrefKey.STREAM_TOUCH_CONTROLLER]: {
      label: t("tc-availability"),
      default: "all",
      options: {
        default: t("default"),
        all: t("tc-all-games"),
        off: t("off")
      },
      unsupported: !STATES.hasTouchSupport,
      ready: () => {
        const setting = Preferences.SETTINGS[PrefKey.STREAM_TOUCH_CONTROLLER];
        if (setting.unsupported) {
          setting.default = "default";
        }
      }
    },
    [PrefKey.STREAM_TOUCH_CONTROLLER_AUTO_OFF]: {
      label: t("tc-auto-off"),
      default: false,
      unsupported: !STATES.hasTouchSupport
    },
    [PrefKey.STREAM_TOUCH_CONTROLLER_STYLE_STANDARD]: {
      label: t("tc-standard-layout-style"),
      default: "default",
      options: {
        default: t("default"),
        white: t("tc-all-white"),
        muted: t("tc-muted-colors")
      },
      unsupported: !STATES.hasTouchSupport
    },
    [PrefKey.STREAM_TOUCH_CONTROLLER_STYLE_CUSTOM]: {
      label: t("tc-custom-layout-style"),
      default: "default",
      options: {
        default: t("default"),
        muted: t("tc-muted-colors")
      },
      unsupported: !STATES.hasTouchSupport
    },
    [PrefKey.STREAM_SIMPLIFY_MENU]: {
      label: t("simplify-stream-menu"),
      default: false
    },
    [PrefKey.MKB_HIDE_IDLE_CURSOR]: {
      label: t("hide-idle-cursor"),
      default: false
    },
    [PrefKey.STREAM_DISABLE_FEEDBACK_DIALOG]: {
      label: t("disable-post-stream-feedback-dialog"),
      default: false
    },
    [PrefKey.LOCAL_CO_OP_ENABLED]: {
      label: t("enable-local-co-op-support"),
      default: false,
      note: CE("a", {
        href: "https://github.com/redphx/better-xcloud/discussions/275",
        target: "_blank"
      }, t("enable-local-co-op-support-note"))
    },
    [PrefKey.CONTROLLER_ENABLE_SHORTCUTS]: {
      default: false
    },
    [PrefKey.CONTROLLER_ENABLE_VIBRATION]: {
      default: true
    },
    [PrefKey.CONTROLLER_DEVICE_VIBRATION]: {
      default: "off",
      options: {
        on: t("on"),
        auto: t("device-vibration-not-using-gamepad"),
        off: t("off")
      }
    },
    [PrefKey.CONTROLLER_VIBRATION_INTENSITY]: {
      type: SettingElementType.NUMBER_STEPPER,
      default: 100,
      min: 0,
      max: 100,
      steps: 10,
      params: {
        suffix: "%",
        ticks: 10
      }
    },
    [PrefKey.MKB_ENABLED]: {
      label: t("enable-mkb"),
      default: false,
      unsupported: (() => {
        const userAgent = (window.navigator.orgUserAgent || window.navigator.userAgent || "").toLowerCase();
        return userAgent.match(/(android|iphone|ipad)/) ? t("browser-unsupported-feature") : false;
      })(),
      ready: () => {
        const pref = Preferences.SETTINGS[PrefKey.MKB_ENABLED];
        let note;
        let url;
        if (pref.unsupported) {
          note = t("browser-unsupported-feature");
          url = "https://github.com/redphx/better-xcloud/issues/206#issuecomment-1920475657";
        } else {
          note = t("mkb-disclaimer");
          url = "https://better-xcloud.github.io/mouse-and-keyboard/#disclaimer";
        }
        Preferences.SETTINGS[PrefKey.MKB_ENABLED].note = CE("a", {
          href: url,
          target: "_blank"
        }, "⚠️ " + note);
      }
    },
    [PrefKey.MKB_DEFAULT_PRESET_ID]: {
      default: 0
    },
    [PrefKey.MKB_ABSOLUTE_MOUSE]: {
      default: false
    },
    [PrefKey.REDUCE_ANIMATIONS]: {
      label: t("reduce-animations"),
      default: false
    },
    [PrefKey.UI_LOADING_SCREEN_GAME_ART]: {
      label: t("show-game-art"),
      default: true
    },
    [PrefKey.UI_LOADING_SCREEN_WAIT_TIME]: {
      label: t("show-wait-time"),
      default: true
    },
    [PrefKey.UI_LOADING_SCREEN_ROCKET]: {
      label: t("rocket-animation"),
      default: "show",
      options: {
        show: t("rocket-always-show"),
        "hide-queue": t("rocket-hide-queue"),
        hide: t("rocket-always-hide")
      }
    },
    [PrefKey.UI_LAYOUT]: {
      label: t("layout"),
      default: "default",
      options: {
        default: t("default"),
        tv: t("smart-tv")
      }
    },
    [PrefKey.UI_SCROLLBAR_HIDE]: {
      label: t("hide-scrollbar"),
      default: false
    },
    [PrefKey.BLOCK_SOCIAL_FEATURES]: {
      label: t("disable-social-features"),
      default: false
    },
    [PrefKey.BLOCK_TRACKING]: {
      label: t("disable-xcloud-analytics"),
      default: false
    },
    [PrefKey.USER_AGENT_PROFILE]: {
      label: t("user-agent-profile"),
      default: "default",
      options: {
        [UserAgentProfile.DEFAULT]: t("default"),
        [UserAgentProfile.EDGE_WINDOWS]: "Edge + Windows",
        [UserAgentProfile.SAFARI_MACOS]: "Safari + macOS",
        [UserAgentProfile.SMARTTV_TIZEN]: "Samsung Smart TV",
        [UserAgentProfile.KIWI_V123]: "Kiwi Browser v123",
        [UserAgentProfile.CUSTOM]: t("custom")
      }
    },
    [PrefKey.USER_AGENT_CUSTOM]: {
      default: ""
    },
    [PrefKey.VIDEO_CLARITY]: {
      type: SettingElementType.NUMBER_STEPPER,
      default: 0,
      min: 0,
      max: 5,
      params: {
        hideSlider: true
      }
    },
    [PrefKey.VIDEO_RATIO]: {
      default: "16:9",
      options: {
        "16:9": "16:9",
        "18:9": "18:9",
        "21:9": "21:9",
        "16:10": "16:10",
        "4:3": "4:3",
        fill: t("stretch")
      }
    },
    [PrefKey.VIDEO_SATURATION]: {
      type: SettingElementType.NUMBER_STEPPER,
      default: 100,
      min: 50,
      max: 150,
      params: {
        suffix: "%",
        ticks: 25
      }
    },
    [PrefKey.VIDEO_CONTRAST]: {
      type: SettingElementType.NUMBER_STEPPER,
      default: 100,
      min: 50,
      max: 150,
      params: {
        suffix: "%",
        ticks: 25
      }
    },
    [PrefKey.VIDEO_BRIGHTNESS]: {
      type: SettingElementType.NUMBER_STEPPER,
      default: 100,
      min: 50,
      max: 150,
      params: {
        suffix: "%",
        ticks: 25
      }
    },
    [PrefKey.AUDIO_MIC_ON_PLAYING]: {
      label: t("enable-mic-on-startup"),
      default: false
    },
    [PrefKey.AUDIO_ENABLE_VOLUME_CONTROL]: {
      label: t("enable-volume-control"),
      default: false,
      experimental: true
    },
    [PrefKey.AUDIO_VOLUME]: {
      type: SettingElementType.NUMBER_STEPPER,
      default: 100,
      min: 0,
      max: 600,
      params: {
        suffix: "%",
        ticks: 100
      }
    },
    [PrefKey.STATS_ITEMS]: {
      default: [StreamStat.PING, StreamStat.FPS, StreamStat.BITRATE, StreamStat.DECODE_TIME, StreamStat.PACKETS_LOST, StreamStat.FRAMES_LOST],
      multipleOptions: {
        [StreamStat.PING]: `${StreamStat.PING.toUpperCase()}: ${t("stat-ping")}`,
        [StreamStat.FPS]: `${StreamStat.FPS.toUpperCase()}: ${t("stat-fps")}`,
        [StreamStat.BITRATE]: `${StreamStat.BITRATE.toUpperCase()}: ${t("stat-bitrate")}`,
        [StreamStat.DECODE_TIME]: `${StreamStat.DECODE_TIME.toUpperCase()}: ${t("stat-decode-time")}`,
        [StreamStat.PACKETS_LOST]: `${StreamStat.PACKETS_LOST.toUpperCase()}: ${t("stat-packets-lost")}`,
        [StreamStat.FRAMES_LOST]: `${StreamStat.FRAMES_LOST.toUpperCase()}: ${t("stat-frames-lost")}`
      },
      params: {
        size: 6
      }
    },
    [PrefKey.STATS_SHOW_WHEN_PLAYING]: {
      default: false
    },
    [PrefKey.STATS_QUICK_GLANCE]: {
      default: true
    },
    [PrefKey.STATS_POSITION]: {
      default: "top-right",
      options: {
        "top-left": t("top-left"),
        "top-center": t("top-center"),
        "top-right": t("top-right")
      }
    },
    [PrefKey.STATS_TEXT_SIZE]: {
      default: "0.9rem",
      options: {
        "0.9rem": t("small"),
        "1.0rem": t("normal"),
        "1.1rem": t("large")
      }
    },
    [PrefKey.STATS_TRANSPARENT]: {
      default: false
    },
    [PrefKey.STATS_OPACITY]: {
      type: SettingElementType.NUMBER_STEPPER,
      default: 80,
      min: 50,
      max: 100,
      params: {
        suffix: "%",
        ticks: 10
      }
    },
    [PrefKey.STATS_CONDITIONAL_FORMATTING]: {
      default: false
    },
    [PrefKey.REMOTE_PLAY_ENABLED]: {
      label: t("enable-remote-play-feature"),
      default: false
    },
    [PrefKey.REMOTE_PLAY_RESOLUTION]: {
      default: "1080p",
      options: {
        "1080p": "1080p",
        "720p": "720p"
      }
    },
    [PrefKey.GAME_FORTNITE_FORCE_CONSOLE]: {
      label: "🎮 " + t("fortnite-force-console-version"),
      default: false,
      note: t("fortnite-allow-stw-mode")
    }
  };
  #storage = localStorage;
  #key = "better_xcloud";
  #prefs = {};
  constructor() {
    let savedPrefsStr = this.#storage.getItem(this.#key);
    if (savedPrefsStr == null) {
      savedPrefsStr = "{}";
    }
    const savedPrefs = JSON.parse(savedPrefsStr);
    for (let settingId in Preferences.SETTINGS) {
      const setting = Preferences.SETTINGS[settingId];
      setting.ready && setting.ready.call(this);
      if (setting.migrate && settingId in savedPrefs) {
        setting.migrate.call(this, savedPrefs, savedPrefs[settingId]);
      }
    }
    for (let settingId in Preferences.SETTINGS) {
      const setting = Preferences.SETTINGS[settingId];
      if (!setting) {
        alert(`Undefined setting key: ${settingId}`);
        console.log("Undefined setting key");
        continue;
      }
      if (setting.migrate) {
        continue;
      }
      if (settingId in savedPrefs) {
        this.#prefs[settingId] = this.#validateValue(settingId, savedPrefs[settingId]);
      } else {
        this.#prefs[settingId] = setting.default;
      }
    }
  }
  #validateValue(key, value) {
    const config = Preferences.SETTINGS[key];
    if (!config) {
      return value;
    }
    if (typeof value === "undefined" || value === null) {
      value = config.default;
    }
    if ("min" in config) {
      value = Math.max(config.min, value);
    }
    if ("max" in config) {
      value = Math.min(config.max, value);
    }
    if ("options" in config && !(value in config.options)) {
      value = config.default;
    } else if ("multipleOptions" in config) {
      if (value.length) {
        const validOptions = Object.keys(config.multipleOptions);
        value.forEach((item2, idx) => {
          validOptions.indexOf(item2) === -1 && value.splice(idx, 1);
        });
      }
      if (!value.length) {
        value = config.default;
      }
    }
    return value;
  }
  get(key) {
    if (typeof key === "undefined") {
      debugger;
      return;
    }
    if (Preferences.SETTINGS[key].unsupported) {
      return Preferences.SETTINGS[key].default;
    }
    if (!(key in this.#prefs)) {
      this.#prefs[key] = this.#validateValue(key, null);
    }
    return this.#prefs[key];
  }
  set(key, value) {
    value = this.#validateValue(key, value);
    this.#prefs[key] = value;
    this.#updateStorage();
  }
  #updateStorage() {
    this.#storage.setItem(this.#key, JSON.stringify(this.#prefs));
  }
  toElement(key, onChange, overrideParams = {}) {
    const setting = Preferences.SETTINGS[key];
    let currentValue = this.get(key);
    let $control;
    let type;
    if ("type" in setting) {
      type = setting.type;
    } else if ("options" in setting) {
      type = SettingElementType.OPTIONS;
    } else if ("multipleOptions" in setting) {
      type = SettingElementType.MULTIPLE_OPTIONS;
    } else if (typeof setting.default === "number") {
      type = SettingElementType.NUMBER;
    } else {
      type = SettingElementType.CHECKBOX;
    }
    const params = Object.assign(overrideParams, setting.params || {});
    if (params.disabled) {
      currentValue = Preferences.SETTINGS[key].default;
    }
    $control = SettingElement.render(type, key, setting, currentValue, (e, value) => {
      this.set(key, value);
      onChange && onChange(e, value);
    }, params);
    return $control;
  }
  toNumberStepper(key, onChange, options = {}) {
    return SettingElement.render(SettingElementType.NUMBER_STEPPER, key, Preferences.SETTINGS[key], this.get(key), (e, value) => {
      this.set(key, value);
      onChange && onChange(e, value);
    }, options);
  }
}
var prefs = new Preferences;
var getPref = prefs.get.bind(prefs);
var setPref = prefs.set.bind(prefs);
var toPrefElement = prefs.toElement.bind(prefs);

// src/utils/region.ts
function getPreferredServerRegion(shortName = false) {
  let preferredRegion = getPref(PrefKey.SERVER_REGION);
  if (preferredRegion in STATES.serverRegions) {
    if (shortName && STATES.serverRegions[preferredRegion].shortName) {
      return STATES.serverRegions[preferredRegion].shortName;
    } else {
      return preferredRegion;
    }
  }
  for (let regionName in STATES.serverRegions) {
    const region = STATES.serverRegions[regionName];
    if (!region.isDefault) {
      continue;
    }
    if (shortName && region.shortName) {
      return region.shortName;
    } else {
      return regionName;
    }
  }
  return "???";
}

// src/utils/titles-info.ts
class TitlesInfo {
  static #INFO = {};
  static get(titleId) {
    return TitlesInfo.#INFO[titleId];
  }
  static update(titleId, info) {
    TitlesInfo.#INFO[titleId] = TitlesInfo.#INFO[titleId] || {};
    Object.assign(TitlesInfo.#INFO[titleId], info);
  }
  static saveFromTitleInfo(titleInfo) {
    const details = titleInfo.details;
    const info = {
      titleId: titleInfo.titleId,
      xboxTitleId: "" + details.xboxTitleId,
      hasTouchSupport: details.supportedInputTypes.length > 1
    };
    TitlesInfo.update(details.productId, info);
  }
  static saveFromCatalogInfo(catalogInfo) {
    const titleId = catalogInfo.StoreId;
    const imageHero = (catalogInfo.Image_Hero || catalogInfo.Image_Tile || {}).URL;
    TitlesInfo.update(titleId, {
      imageHero
    });
  }
  static hasTouchSupport(titleId) {
    return !!TitlesInfo.#INFO[titleId]?.hasTouchSupport;
  }
  static requestCatalogInfo(titleId, callback) {
    const url = `https://catalog.gamepass.com/v3/products?market=${STATES.appContext.marketInfo.market}&language=${STATES.appContext.marketInfo.locale}&hydration=RemoteHighSapphire0`;
    const appVersion = document.querySelector("meta[name=gamepass-app-version]").getAttribute("content");
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ms-Cv": STATES.appContext.telemetryInfo.initialCv,
        "Calling-App-Name": "Xbox Cloud Gaming Web",
        "Calling-App-Version": appVersion
      },
      body: JSON.stringify({
        Products: [titleId]
      })
    }).then((resp) => {
      callback && callback(TitlesInfo.get(titleId));
    });
  }
}

class PreloadedState {
  static override() {
    Object.defineProperty(window, "__PRELOADED_STATE__", {
      configurable: true,
      get: () => {
        const userAgent = UserAgent.spoof();
        if (userAgent) {
          this._state.appContext.requestInfo.userAgent = userAgent;
        }
        return this._state;
      },
      set: (state) => {
        this._state = state;
        STATES.appContext = structuredClone(state.appContext);
        if (getPref(PrefKey.STREAM_TOUCH_CONTROLLER) === "all") {
          let titles = {};
          try {
            titles = state.xcloud.titles.data.titles;
          } catch (e) {
          }
          for (let id2 in titles) {
            TitlesInfo.saveFromTitleInfo(titles[id2].data);
          }
        }
      }
    });
  }
}

// src/modules/loading-screen.ts
class LoadingScreen {
  static #$bgStyle;
  static #$waitTimeBox;
  static #waitTimeInterval = null;
  static #orgWebTitle;
  static #secondsToString(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const mDisplay = m > 0 ? `${m}m` : "";
    const sDisplay = `${s}s`.padStart(s >= 0 ? 3 : 4, "0");
    return mDisplay + sDisplay;
  }
  static setup() {
    const match = window.location.pathname.match(/\/launch\/[^\/]+\/([\w\d]+)/);
    if (!match) {
      return;
    }
    if (!LoadingScreen.#$bgStyle) {
      const $bgStyle = CE("style");
      document.documentElement.appendChild($bgStyle);
      LoadingScreen.#$bgStyle = $bgStyle;
    }
    const titleId = match[1];
    const titleInfo = TitlesInfo.get(titleId);
    if (titleInfo && titleInfo.imageHero) {
      LoadingScreen.#setBackground(titleInfo.imageHero);
    } else {
      TitlesInfo.requestCatalogInfo(titleId, (info) => {
        info && info.imageHero && LoadingScreen.#setBackground(info.imageHero);
      });
    }
    if (getPref(PrefKey.UI_LOADING_SCREEN_ROCKET) === "hide") {
      LoadingScreen.#hideRocket();
    }
  }
  static #hideRocket() {
    let $bgStyle = LoadingScreen.#$bgStyle;
    const css = `
#game-stream div[class*=RocketAnimation-module__container] > svg {
    display: none;
}
`;
    $bgStyle.textContent += css;
  }
  static #setBackground(imageUrl) {
    let $bgStyle = LoadingScreen.#$bgStyle;
    imageUrl = imageUrl + "?w=1920";
    const css = `
#game-stream {
    background-image: linear-gradient(#00000033, #000000e6), url(${imageUrl}) !important;
    background-color: transparent !important;
    background-position: center center !important;
    background-repeat: no-repeat !important;
    background-size: cover !important;
}

#game-stream rect[width="800"] {
    transition: opacity 0.3s ease-in-out !important;
}
`;
    $bgStyle.textContent += css;
    const bg = new Image;
    bg.onload = (e) => {
      $bgStyle.textContent += `
#game-stream rect[width="800"] {
    opacity: 0 !important;
}
`;
    };
    bg.src = imageUrl;
  }
  static setupWaitTime(waitTime) {
    if (getPref(PrefKey.UI_LOADING_SCREEN_ROCKET) === "hide-queue") {
      LoadingScreen.#hideRocket();
    }
    let secondsLeft = waitTime;
    let $countDown;
    let $estimated;
    LoadingScreen.#orgWebTitle = document.title;
    const endDate = new Date;
    const timeZoneOffsetSeconds = endDate.getTimezoneOffset() * 60;
    endDate.setSeconds(endDate.getSeconds() + waitTime - timeZoneOffsetSeconds);
    let endDateStr = endDate.toISOString().slice(0, 19);
    endDateStr = endDateStr.substring(0, 10) + " " + endDateStr.substring(11, 19);
    endDateStr += ` (${LoadingScreen.#secondsToString(waitTime)})`;
    let $waitTimeBox = LoadingScreen.#$waitTimeBox;
    if (!$waitTimeBox) {
      $waitTimeBox = CE("div", { class: "bx-wait-time-box" }, CE("label", {}, t("server")), CE("span", {}, getPreferredServerRegion()), CE("label", {}, t("wait-time-estimated")), $estimated = CE("span", {}), CE("label", {}, t("wait-time-countdown")), $countDown = CE("span", {}));
      document.documentElement.appendChild($waitTimeBox);
      LoadingScreen.#$waitTimeBox = $waitTimeBox;
    } else {
      $waitTimeBox.classList.remove("bx-gone");
      $estimated = $waitTimeBox.querySelector(".bx-wait-time-estimated");
      $countDown = $waitTimeBox.querySelector(".bx-wait-time-countdown");
    }
    $estimated.textContent = endDateStr;
    $countDown.textContent = LoadingScreen.#secondsToString(secondsLeft);
    document.title = `[${$countDown.textContent}] ${LoadingScreen.#orgWebTitle}`;
    LoadingScreen.#waitTimeInterval = window.setInterval(() => {
      secondsLeft--;
      $countDown.textContent = LoadingScreen.#secondsToString(secondsLeft);
      document.title = `[${$countDown.textContent}] ${LoadingScreen.#orgWebTitle}`;
      if (secondsLeft <= 0) {
        LoadingScreen.#waitTimeInterval && clearInterval(LoadingScreen.#waitTimeInterval);
        LoadingScreen.#waitTimeInterval = null;
      }
    }, 1000);
  }
  static hide() {
    LoadingScreen.#orgWebTitle && (document.title = LoadingScreen.#orgWebTitle);
    LoadingScreen.#$waitTimeBox && LoadingScreen.#$waitTimeBox.classList.add("bx-gone");
    if (getPref(PrefKey.UI_LOADING_SCREEN_GAME_ART) && LoadingScreen.#$bgStyle) {
      const $rocketBg = document.querySelector('#game-stream rect[width="800"]');
      $rocketBg && $rocketBg.addEventListener("transitionend", (e) => {
        LoadingScreen.#$bgStyle.textContent += `
#game-stream {
    background: #000 !important;
}
`;
      });
      LoadingScreen.#$bgStyle.textContent += `
#game-stream rect[width="800"] {
    opacity: 1 !important;
}
`;
    }
    LoadingScreen.reset();
  }
  static reset() {
    LoadingScreen.#$waitTimeBox && LoadingScreen.#$waitTimeBox.classList.add("bx-gone");
    LoadingScreen.#$bgStyle && (LoadingScreen.#$bgStyle.textContent = "");
    LoadingScreen.#waitTimeInterval && clearInterval(LoadingScreen.#waitTimeInterval);
    LoadingScreen.#waitTimeInterval = null;
  }
}

// src/utils/toast.ts
class Toast {
  static #$wrapper;
  static #$msg;
  static #$status;
  static #stack = [];
  static #isShowing = false;
  static #timeout;
  static #DURATION = 3000;
  static show(msg, status, options = {}) {
    options = options || {};
    const args = Array.from(arguments);
    if (options.instant) {
      Toast.#stack = [args];
      Toast.#showNext();
    } else {
      Toast.#stack.push(args);
      !Toast.#isShowing && Toast.#showNext();
    }
  }
  static #showNext() {
    if (!Toast.#stack.length) {
      Toast.#isShowing = false;
      return;
    }
    Toast.#isShowing = true;
    Toast.#timeout && clearTimeout(Toast.#timeout);
    Toast.#timeout = window.setTimeout(Toast.#hide, Toast.#DURATION);
    const [msg, status, _] = Toast.#stack.shift();
    Toast.#$msg.textContent = msg;
    if (status) {
      Toast.#$status.classList.remove("bx-gone");
      Toast.#$status.textContent = status;
    } else {
      Toast.#$status.classList.add("bx-gone");
    }
    const classList = Toast.#$wrapper.classList;
    classList.remove("bx-offscreen", "bx-hide");
    classList.add("bx-show");
  }
  static #hide() {
    Toast.#timeout = null;
    const classList = Toast.#$wrapper.classList;
    classList.remove("bx-show");
    classList.add("bx-hide");
  }
  static setup() {
    Toast.#$wrapper = CE("div", { class: "bx-toast bx-offscreen" }, Toast.#$msg = CE("span", { class: "bx-toast-msg" }), Toast.#$status = CE("span", { class: "bx-toast-status" }));
    Toast.#$wrapper.addEventListener("transitionend", (e) => {
      const classList = Toast.#$wrapper.classList;
      if (classList.contains("bx-hide")) {
        classList.remove("bx-offscreen", "bx-hide");
        classList.add("bx-offscreen");
        Toast.#showNext();
      }
    });
    document.documentElement.appendChild(Toast.#$wrapper);
  }
}

// src/modules/mkb/definitions.ts
var GamepadKey = {};
GamepadKey[GamepadKey.A = 0] = "A";
GamepadKey[GamepadKey.B = 1] = "B";
GamepadKey[GamepadKey.X = 2] = "X";
GamepadKey[GamepadKey.Y = 3] = "Y";
GamepadKey[GamepadKey.LB = 4] = "LB";
GamepadKey[GamepadKey.RB = 5] = "RB";
GamepadKey[GamepadKey.LT = 6] = "LT";
GamepadKey[GamepadKey.RT = 7] = "RT";
GamepadKey[GamepadKey.SELECT = 8] = "SELECT";
GamepadKey[GamepadKey.START = 9] = "START";
GamepadKey[GamepadKey.L3 = 10] = "L3";
GamepadKey[GamepadKey.R3 = 11] = "R3";
GamepadKey[GamepadKey.UP = 12] = "UP";
GamepadKey[GamepadKey.DOWN = 13] = "DOWN";
GamepadKey[GamepadKey.LEFT = 14] = "LEFT";
GamepadKey[GamepadKey.RIGHT = 15] = "RIGHT";
GamepadKey[GamepadKey.HOME = 16] = "HOME";
GamepadKey[GamepadKey.LS_UP = 100] = "LS_UP";
GamepadKey[GamepadKey.LS_DOWN = 101] = "LS_DOWN";
GamepadKey[GamepadKey.LS_LEFT = 102] = "LS_LEFT";
GamepadKey[GamepadKey.LS_RIGHT = 103] = "LS_RIGHT";
GamepadKey[GamepadKey.RS_UP = 200] = "RS_UP";
GamepadKey[GamepadKey.RS_DOWN = 201] = "RS_DOWN";
GamepadKey[GamepadKey.RS_LEFT = 202] = "RS_LEFT";
GamepadKey[GamepadKey.RS_RIGHT = 203] = "RS_RIGHT";
var GamepadKeyName = {
  [GamepadKey.A]: ["A", "⇓"],
  [GamepadKey.B]: ["B", "⇒"],
  [GamepadKey.X]: ["X", "⇐"],
  [GamepadKey.Y]: ["Y", "⇑"],
  [GamepadKey.LB]: ["LB", "↘"],
  [GamepadKey.RB]: ["RB", "↙"],
  [GamepadKey.LT]: ["LT", "↖"],
  [GamepadKey.RT]: ["RT", "↗"],
  [GamepadKey.SELECT]: ["Select", "⇺"],
  [GamepadKey.START]: ["Start", "⇻"],
  [GamepadKey.HOME]: ["Home", ""],
  [GamepadKey.UP]: ["D-Pad Up", "≻"],
  [GamepadKey.DOWN]: ["D-Pad Down", "≽"],
  [GamepadKey.LEFT]: ["D-Pad Left", "≺"],
  [GamepadKey.RIGHT]: ["D-Pad Right", "≼"],
  [GamepadKey.L3]: ["L3", "↺"],
  [GamepadKey.LS_UP]: ["Left Stick Up", "↾"],
  [GamepadKey.LS_DOWN]: ["Left Stick Down", "⇂"],
  [GamepadKey.LS_LEFT]: ["Left Stick Left", "↼"],
  [GamepadKey.LS_RIGHT]: ["Left Stick Right", "⇀"],
  [GamepadKey.R3]: ["R3", "↻"],
  [GamepadKey.RS_UP]: ["Right Stick Up", "↿"],
  [GamepadKey.RS_DOWN]: ["Right Stick Down", "⇃"],
  [GamepadKey.RS_LEFT]: ["Right Stick Left", "↽"],
  [GamepadKey.RS_RIGHT]: ["Right Stick Right", "⇁"]
};
var GamepadStick;
(function(GamepadStick2) {
  GamepadStick2[GamepadStick2["LEFT"] = 0] = "LEFT";
  GamepadStick2[GamepadStick2["RIGHT"] = 1] = "RIGHT";
})(GamepadStick || (GamepadStick = {}));
var MouseButtonCode;
(function(MouseButtonCode2) {
  MouseButtonCode2["LEFT_CLICK"] = "Mouse0";
  MouseButtonCode2["RIGHT_CLICK"] = "Mouse2";
  MouseButtonCode2["MIDDLE_CLICK"] = "Mouse1";
})(MouseButtonCode || (MouseButtonCode = {}));
var MouseMapTo = {};
MouseMapTo[MouseMapTo.OFF = 0] = "OFF";
MouseMapTo[MouseMapTo.LS = 1] = "LS";
MouseMapTo[MouseMapTo.RS = 2] = "RS";
var WheelCode;
(function(WheelCode2) {
  WheelCode2["SCROLL_UP"] = "ScrollUp";
  WheelCode2["SCROLL_DOWN"] = "ScrollDown";
  WheelCode2["SCROLL_LEFT"] = "ScrollLeft";
  WheelCode2["SCROLL_RIGHT"] = "ScrollRight";
})(WheelCode || (WheelCode = {}));
var MkbPresetKey;
(function(MkbPresetKey2) {
  MkbPresetKey2["MOUSE_MAP_TO"] = "map_to";
  MkbPresetKey2["MOUSE_SENSITIVITY_X"] = "sensitivity_x";
  MkbPresetKey2["MOUSE_SENSITIVITY_Y"] = "sensitivity_y";
  MkbPresetKey2["MOUSE_DEADZONE_COUNTERWEIGHT"] = "deadzone_counterweight";
  MkbPresetKey2["MOUSE_STICK_DECAY_STRENGTH"] = "stick_decay_strength";
  MkbPresetKey2["MOUSE_STICK_DECAY_MIN"] = "stick_decay_min";
})(MkbPresetKey || (MkbPresetKey = {}));

// src/modules/dialog.ts
class Dialog {
  $dialog;
  $title;
  $content;
  $overlay;
  onClose;
  constructor(options) {
    const {
      title,
      className,
      content,
      hideCloseButton,
      onClose,
      helpUrl
    } = options;
    this.$overlay = document.querySelector(".bx-dialog-overlay");
    if (!this.$overlay) {
      this.$overlay = CE("div", { class: "bx-dialog-overlay bx-gone" });
      this.$overlay.addEventListener("contextmenu", (e) => e.preventDefault());
      document.documentElement.appendChild(this.$overlay);
    }
    let $close;
    this.onClose = onClose;
    this.$dialog = CE("div", { class: `bx-dialog ${className || ""} bx-gone` }, this.$title = CE("h2", {}, CE("b", {}, title), helpUrl && createButton({
      icon: Icon.QUESTION,
      style: ButtonStyle.GHOST,
      title: t("help"),
      url: helpUrl
    })), this.$content = CE("div", { class: "bx-dialog-content" }, content), !hideCloseButton && ($close = CE("button", {}, t("close"))));
    $close && $close.addEventListener("click", (e) => {
      this.hide(e);
    });
    !title && this.$title.classList.add("bx-gone");
    !content && this.$content.classList.add("bx-gone");
    this.$dialog.addEventListener("contextmenu", (e) => e.preventDefault());
    document.documentElement.appendChild(this.$dialog);
  }
  show(newOptions) {
    document.activeElement && document.activeElement.blur();
    if (newOptions && newOptions.title) {
      this.$title.querySelector("b").textContent = newOptions.title;
      this.$title.classList.remove("bx-gone");
    }
    this.$dialog.classList.remove("bx-gone");
    this.$overlay.classList.remove("bx-gone");
    document.body.classList.add("bx-no-scroll");
  }
  hide(e) {
    this.$dialog.classList.add("bx-gone");
    this.$overlay.classList.add("bx-gone");
    document.body.classList.remove("bx-no-scroll");
    this.onClose && this.onClose(e);
  }
  toggle() {
    this.$dialog.classList.toggle("bx-gone");
    this.$overlay.classList.toggle("bx-gone");
  }
}

// src/modules/mkb/key-helper.ts
class KeyHelper {
  static #NON_PRINTABLE_KEYS = {
    Backquote: "`",
    [MouseButtonCode.LEFT_CLICK]: "Left Click",
    [MouseButtonCode.RIGHT_CLICK]: "Right Click",
    [MouseButtonCode.MIDDLE_CLICK]: "Middle Click",
    [WheelCode.SCROLL_UP]: "Scroll Up",
    [WheelCode.SCROLL_DOWN]: "Scroll Down",
    [WheelCode.SCROLL_LEFT]: "Scroll Left",
    [WheelCode.SCROLL_RIGHT]: "Scroll Right"
  };
  static getKeyFromEvent(e) {
    let code;
    let name;
    if (e instanceof KeyboardEvent) {
      code = e.code;
    } else if (e instanceof WheelEvent) {
      if (e.deltaY < 0) {
        code = WheelCode.SCROLL_UP;
      } else if (e.deltaY > 0) {
        code = WheelCode.SCROLL_DOWN;
      } else if (e.deltaX < 0) {
        code = WheelCode.SCROLL_LEFT;
      } else {
        code = WheelCode.SCROLL_RIGHT;
      }
    } else if (e instanceof MouseEvent) {
      code = "Mouse" + e.button;
    }
    if (code) {
      name = KeyHelper.codeToKeyName(code);
    }
    return code ? { code, name } : null;
  }
  static codeToKeyName(code) {
    return KeyHelper.#NON_PRINTABLE_KEYS[code] || code.startsWith("Key") && code.substring(3) || code.startsWith("Digit") && code.substring(5) || code.startsWith("Numpad") && "Numpad " + code.substring(6) || code.startsWith("Arrow") && "Arrow " + code.substring(5) || code.endsWith("Lock") && code.replace("Lock", " Lock") || code.endsWith("Left") && "Left " + code.replace("Left", "") || code.endsWith("Right") && "Right " + code.replace("Right", "") || code;
  }
}

// src/utils/local-db.ts
class LocalDb {
  static #instance;
  static get INSTANCE() {
    if (!LocalDb.#instance) {
      LocalDb.#instance = new LocalDb;
    }
    return LocalDb.#instance;
  }
  static DB_NAME = "BetterXcloud";
  static DB_VERSION = 1;
  static TABLE_PRESETS = "mkb_presets";
  #DB;
  #open() {
    return new Promise((resolve, reject) => {
      if (this.#DB) {
        resolve();
        return;
      }
      const request = window.indexedDB.open(LocalDb.DB_NAME, LocalDb.DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        switch (e.oldVersion) {
          case 0: {
            const presets = db.createObjectStore(LocalDb.TABLE_PRESETS, { keyPath: "id", autoIncrement: true });
            presets.createIndex("name_idx", "name");
            break;
          }
        }
      };
      request.onerror = (e) => {
        console.log(e);
        alert(e.target.error.message);
        reject && reject();
      };
      request.onsuccess = (e) => {
        this.#DB = e.target.result;
        resolve();
      };
    });
  }
  #table(name, type) {
    const transaction = this.#DB.transaction(name, type || "readonly");
    const table = transaction.objectStore(name);
    return new Promise((resolve) => resolve(table));
  }
  #call(method) {
    const table = arguments[1];
    return new Promise((resolve) => {
      const request = method.call(table, ...Array.from(arguments).slice(2));
      request.onsuccess = (e) => {
        resolve([table, e.target.result]);
      };
    });
  }
  #count(table) {
    return this.#call(table.count, ...arguments);
  }
  #add(table, data) {
    return this.#call(table.add, ...arguments);
  }
  #put(table, data) {
    return this.#call(table.put, ...arguments);
  }
  #delete(table, data) {
    return this.#call(table.delete, ...arguments);
  }
  #get(table, id2) {
    return this.#call(table.get, ...arguments);
  }
  #getAll(table) {
    return this.#call(table.getAll, ...arguments);
  }
  newPreset(name, data) {
    return this.#open().then(() => this.#table(LocalDb.TABLE_PRESETS, "readwrite")).then((table) => this.#add(table, { name, data })).then(([table, id2]) => new Promise((resolve) => resolve(id2)));
  }
  updatePreset(preset) {
    return this.#open().then(() => this.#table(LocalDb.TABLE_PRESETS, "readwrite")).then((table) => this.#put(table, preset)).then(([table, id2]) => new Promise((resolve) => resolve(id2)));
  }
  deletePreset(id2) {
    return this.#open().then(() => this.#table(LocalDb.TABLE_PRESETS, "readwrite")).then((table) => this.#delete(table, id2)).then(([table, id3]) => new Promise((resolve) => resolve(id3)));
  }
  getPreset(id2) {
    return this.#open().then(() => this.#table(LocalDb.TABLE_PRESETS, "readwrite")).then((table) => this.#get(table, id2)).then(([table, preset]) => new Promise((resolve) => resolve(preset)));
  }
  getPresets() {
    return this.#open().then(() => this.#table(LocalDb.TABLE_PRESETS, "readwrite")).then((table) => this.#count(table)).then(([table, count]) => {
      if (count > 0) {
        return new Promise((resolve) => {
          this.#getAll(table).then(([table2, items]) => {
            const presets = {};
            items.forEach((item2) => presets[item2.id] = item2);
            resolve(presets);
          });
        });
      }
      const preset = {
        name: t("default"),
        data: MkbPreset.DEFAULT_PRESET
      };
      return new Promise((resolve) => {
        this.#add(table, preset).then(([table2, id2]) => {
          preset.id = id2;
          setPref(PrefKey.MKB_DEFAULT_PRESET_ID, id2);
          resolve({ [id2]: preset });
        });
      });
    });
  }
}

// src/modules/stream/stream-ui.ts
var cloneStreamHudButton = function($orgButton, label, svgIcon) {
  const $container = $orgButton.cloneNode(true);
  let timeout;
  const onTransitionStart = (e) => {
    if (e.propertyName !== "opacity") {
      return;
    }
    timeout && clearTimeout(timeout);
    $container.style.pointerEvents = "none";
  };
  const onTransitionEnd = (e) => {
    if (e.propertyName !== "opacity") {
      return;
    }
    const left = document.getElementById("StreamHud")?.style.left;
    if (left === "0px") {
      timeout && clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        $container.style.pointerEvents = "auto";
      }, 100);
    }
  };
  if (STATES.hasTouchSupport) {
    $container.addEventListener("transitionstart", onTransitionStart);
    $container.addEventListener("transitionend", onTransitionEnd);
  }
  const $button = $container.querySelector("button");
  $button.setAttribute("title", label);
  const $svg = $button.querySelector("svg");
  $svg.innerHTML = svgIcon;
  $svg.style.fill = "none";
  const attrs = {
    fill: "none",
    stroke: "#fff",
    "fill-rule": "evenodd",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "stroke-width": "2",
    viewBox: "0 0 32 32"
  };
  let attr;
  for (attr in attrs) {
    $svg.setAttribute(attr, attrs[attr]);
  }
  return $container;
};
function injectStreamMenuButtons() {
  const $screen = document.querySelector("#PageContent section[class*=PureScreens]");
  if (!$screen) {
    return;
  }
  if ($screen.xObserving) {
    return;
  }
  $screen.xObserving = true;
  const $quickBar = document.querySelector(".bx-quick-settings-bar");
  const $parent = $screen.parentElement;
  const hideQuickBarFunc = (e) => {
    if (e) {
      const $target = e.target;
      e.stopPropagation();
      if ($target != $parent && $target.id !== "MultiTouchSurface" && !$target.querySelector("#BabylonCanvasContainer-main")) {
        return;
      }
      if ($target.id === "MultiTouchSurface") {
        $target.removeEventListener("touchstart", hideQuickBarFunc);
      }
    }
    $quickBar.classList.add("bx-gone");
    $parent?.removeEventListener("click", hideQuickBarFunc);
  };
  let $btnStreamSettings;
  let $btnStreamStats;
  const PREF_DISABLE_FEEDBACK_DIALOG = getPref(PrefKey.STREAM_DISABLE_FEEDBACK_DIALOG);
  const observer = new MutationObserver((mutationList) => {
    mutationList.forEach((item2) => {
      if (item2.type !== "childList") {
        return;
      }
      item2.removedNodes.forEach(($node) => {
        if (!$node || $node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        if (!$node.className || !$node.className.startsWith) {
          return;
        }
        if ($node.className.startsWith("StreamMenu")) {
          if (!document.querySelector("div[class^=PureInStreamConfirmationModal]")) {
            BxEvent.dispatch(window, BxEvent.STREAM_MENU_HIDDEN);
          }
        }
      });
      item2.addedNodes.forEach(async ($node) => {
        if (!$node || $node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        let $elm = $node;
        if ($elm.className.includes("PureErrorPage")) {
          BxEvent.dispatch(window, BxEvent.STREAM_ERROR_PAGE);
          return;
        }
        if (PREF_DISABLE_FEEDBACK_DIALOG && $elm.className.startsWith("PostStreamFeedbackScreen")) {
          const $btnClose = $elm.querySelector("button");
          $btnClose && $btnClose.click();
          return;
        }
        if ($elm.className.startsWith("StreamMenu")) {
          BxEvent.dispatch(window, BxEvent.STREAM_MENU_SHOWN);
          const $btnCloseHud = document.querySelector("button[class*=StreamMenu-module__backButton]");
          if (!$btnCloseHud) {
            return;
          }
          $btnCloseHud && $btnCloseHud.addEventListener("click", (e) => {
            $quickBar.classList.add("bx-gone");
          });
          const $btnQuit = $elm.querySelector("div[class^=StreamMenu] > div > button:last-child");
          new MouseHoldEvent($btnQuit, () => {
            confirm(t("confirm-reload-stream")) && window.location.reload();
          }, 1000);
          const $menu = document.querySelector("div[class*=StreamMenu-module__menuContainer] > div[class*=Menu-module]");
          $menu?.appendChild(await StreamBadges.render());
          hideQuickBarFunc();
          return;
        }
        if ($elm.className.startsWith("Overlay-module_") || $elm.className.startsWith("InProgressScreen")) {
          $elm = $elm.querySelector("#StreamHud");
        }
        if (!$elm || ($elm.id || "") !== "StreamHud") {
          return;
        }
        const $gripHandle = $elm.querySelector("button[class^=GripHandle]");
        const hideGripHandle = () => {
          if (!$gripHandle) {
            return;
          }
          $gripHandle.dispatchEvent(new PointerEvent("pointerdown"));
          $gripHandle.click();
          $gripHandle.dispatchEvent(new PointerEvent("pointerdown"));
          $gripHandle.click();
        };
        const $orgButton = $elm.querySelector("div[class^=HUDButton]");
        if (!$orgButton) {
          return;
        }
        if (!$btnStreamSettings) {
          $btnStreamSettings = cloneStreamHudButton($orgButton, t("menu-stream-settings"), Icon.STREAM_SETTINGS);
          $btnStreamSettings.addEventListener("click", (e) => {
            hideGripHandle();
            e.preventDefault();
            $quickBar.classList.remove("bx-gone");
            $parent?.addEventListener("click", hideQuickBarFunc);
            const $touchSurface = document.getElementById("MultiTouchSurface");
            $touchSurface && $touchSurface.style.display != "none" && $touchSurface.addEventListener("touchstart", hideQuickBarFunc);
          });
        }
        if (!$btnStreamStats) {
          $btnStreamStats = cloneStreamHudButton($orgButton, t("menu-stream-stats"), Icon.STREAM_STATS);
          $btnStreamStats.addEventListener("click", (e) => {
            hideGripHandle();
            e.preventDefault();
            StreamStats.toggle();
            const btnStreamStatsOn2 = !StreamStats.isHidden() && !StreamStats.isGlancing();
            $btnStreamStats.classList.toggle("bx-stream-menu-button-on", btnStreamStatsOn2);
          });
        }
        const btnStreamStatsOn = !StreamStats.isHidden() && !StreamStats.isGlancing();
        $btnStreamStats.classList.toggle("bx-stream-menu-button-on", btnStreamStatsOn);
        if ($orgButton) {
          const $btnParent = $orgButton.parentElement;
          $btnParent.insertBefore($btnStreamStats, $btnParent.lastElementChild);
          $btnParent.insertBefore($btnStreamSettings, $btnStreamStats);
          const $dotsButton = $btnParent.lastElementChild;
          $dotsButton.parentElement.insertBefore($dotsButton, $dotsButton.parentElement.firstElementChild);
        }
      });
    });
  });
  observer.observe($screen, { subtree: true, childList: true });
}
function showStreamSettings(tabId) {
  const $wrapper = document.querySelector(".bx-quick-settings-bar");
  if (!$wrapper) {
    return;
  }
  if (tabId) {
    const $tab = $wrapper.querySelector(`.bx-quick-settings-tabs svg[data-group=${tabId}]`);
    $tab && $tab.dispatchEvent(new Event("click"));
  }
  $wrapper.classList.remove("bx-gone");
  const $screen = document.querySelector("#PageContent section[class*=PureScreens]");
  if ($screen && $screen.parentElement) {
    const $parent = $screen.parentElement;
    if (!$parent || $parent.bxClick) {
      return;
    }
    $parent.bxClick = true;
    const onClick = (e) => {
      $wrapper.classList.add("bx-gone");
      $parent.bxClick = false;
      $parent.removeEventListener("click", onClick);
    };
    $parent.addEventListener("click", onClick);
  }
}

class MouseHoldEvent {
  #isHolding = false;
  #timeout;
  #$elm;
  #callback;
  #duration;
  #onMouseDown(e) {
    const _this = this;
    this.#isHolding = false;
    this.#timeout && clearTimeout(this.#timeout);
    this.#timeout = window.setTimeout(() => {
      _this.#isHolding = true;
      _this.#callback();
    }, this.#duration);
  }
  #onMouseUp(e) {
    this.#timeout && clearTimeout(this.#timeout);
    this.#timeout = null;
    if (this.#isHolding) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.#isHolding = false;
  }
  #addEventListeners = () => {
    this.#$elm.addEventListener("mousedown", this.#onMouseDown.bind(this));
    this.#$elm.addEventListener("click", this.#onMouseUp.bind(this));
    this.#$elm.addEventListener("touchstart", this.#onMouseDown.bind(this));
    this.#$elm.addEventListener("touchend", this.#onMouseUp.bind(this));
  };
  constructor($elm, callback, duration = 1000) {
    this.#$elm = $elm;
    this.#callback = callback;
    this.#duration = duration;
    this.#addEventListeners();
  }
}

// src/modules/mkb/mkb-handler.ts
class MkbHandler {
  static #instance;
  static get INSTANCE() {
    if (!MkbHandler.#instance) {
      MkbHandler.#instance = new MkbHandler;
    }
    return MkbHandler.#instance;
  }
  #CURRENT_PRESET_DATA = MkbPreset.convert(MkbPreset.DEFAULT_PRESET);
  static DEFAULT_PANNING_SENSITIVITY = 0.001;
  static DEFAULT_STICK_SENSITIVITY = 0.0006;
  static DEFAULT_DEADZONE_COUNTERWEIGHT = 0.01;
  static MAXIMUM_STICK_RANGE = 1.1;
  static VIRTUAL_GAMEPAD_ID = "Xbox 360 Controller";
  #VIRTUAL_GAMEPAD = {
    id: MkbHandler.VIRTUAL_GAMEPAD_ID,
    index: 3,
    connected: false,
    hapticActuators: null,
    mapping: "standard",
    axes: [0, 0, 0, 0],
    buttons: new Array(17).fill(null).map(() => ({ pressed: false, value: 0 })),
    timestamp: performance.now(),
    vibrationActuator: null
  };
  #nativeGetGamepads = window.navigator.getGamepads.bind(window.navigator);
  #enabled = false;
  #prevWheelCode = null;
  #wheelStoppedTimeout;
  #detectMouseStoppedTimeout;
  #allowStickDecaying = false;
  #$message;
  #STICK_MAP;
  #LEFT_STICK_X = [];
  #LEFT_STICK_Y = [];
  #RIGHT_STICK_X = [];
  #RIGHT_STICK_Y = [];
  constructor() {
    this.#STICK_MAP = {
      [GamepadKey.LS_LEFT]: [this.#LEFT_STICK_X, 0, -1],
      [GamepadKey.LS_RIGHT]: [this.#LEFT_STICK_X, 0, 1],
      [GamepadKey.LS_UP]: [this.#LEFT_STICK_Y, 1, -1],
      [GamepadKey.LS_DOWN]: [this.#LEFT_STICK_Y, 1, 1],
      [GamepadKey.RS_LEFT]: [this.#RIGHT_STICK_X, 2, -1],
      [GamepadKey.RS_RIGHT]: [this.#RIGHT_STICK_X, 2, 1],
      [GamepadKey.RS_UP]: [this.#RIGHT_STICK_Y, 3, -1],
      [GamepadKey.RS_DOWN]: [this.#RIGHT_STICK_Y, 3, 1]
    };
  }
  #patchedGetGamepads = () => {
    const gamepads = this.#nativeGetGamepads() || [];
    gamepads[this.#VIRTUAL_GAMEPAD.index] = this.#VIRTUAL_GAMEPAD;
    return gamepads;
  };
  #getVirtualGamepad = () => this.#VIRTUAL_GAMEPAD;
  #updateStick(stick, x, y) {
    const virtualGamepad = this.#getVirtualGamepad();
    virtualGamepad.axes[stick * 2] = x;
    virtualGamepad.axes[stick * 2 + 1] = y;
    virtualGamepad.timestamp = performance.now();
  }
  #getStickAxes(stick) {
    const virtualGamepad = this.#getVirtualGamepad();
    return {
      x: virtualGamepad.axes[stick * 2],
      y: virtualGamepad.axes[stick * 2 + 1]
    };
  }
  #vectorLength = (x, y) => Math.sqrt(x ** 2 + y ** 2);
  #disableContextMenu = (e) => e.preventDefault();
  #resetGamepad = () => {
    const gamepad = this.#getVirtualGamepad();
    gamepad.axes = [0, 0, 0, 0];
    for (const button of gamepad.buttons) {
      button.pressed = false;
      button.value = 0;
    }
    gamepad.timestamp = performance.now();
  };
  #pressButton = (buttonIndex, pressed) => {
    const virtualGamepad = this.#getVirtualGamepad();
    if (buttonIndex >= 100) {
      let [valueArr, axisIndex] = this.#STICK_MAP[buttonIndex];
      valueArr = valueArr;
      axisIndex = axisIndex;
      for (let i = valueArr.length - 1;i >= 0; i--) {
        if (valueArr[i] === buttonIndex) {
          valueArr.splice(i, 1);
        }
      }
      pressed && valueArr.push(buttonIndex);
      let value;
      if (valueArr.length) {
        value = this.#STICK_MAP[valueArr[valueArr.length - 1]][2];
      } else {
        value = 0;
      }
      virtualGamepad.axes[axisIndex] = value;
    } else {
      virtualGamepad.buttons[buttonIndex].pressed = pressed;
      virtualGamepad.buttons[buttonIndex].value = pressed ? 1 : 0;
    }
    virtualGamepad.timestamp = performance.now();
  };
  #onKeyboardEvent = (e) => {
    const isKeyDown = e.type === "keydown";
    if (isKeyDown && e.code === "F8") {
      e.preventDefault();
      this.toggle();
      return;
    }
    const buttonIndex = this.#CURRENT_PRESET_DATA.mapping[e.code];
    if (typeof buttonIndex === "undefined") {
      return;
    }
    if (e.repeat) {
      return;
    }
    e.preventDefault();
    this.#pressButton(buttonIndex, isKeyDown);
  };
  #onMouseEvent = (e) => {
    const isMouseDown = e.type === "mousedown";
    const key = KeyHelper.getKeyFromEvent(e);
    if (!key) {
      return;
    }
    const buttonIndex = this.#CURRENT_PRESET_DATA.mapping[key.code];
    if (typeof buttonIndex === "undefined") {
      return;
    }
    e.preventDefault();
    this.#pressButton(buttonIndex, isMouseDown);
  };
  #onWheelEvent = (e) => {
    const key = KeyHelper.getKeyFromEvent(e);
    if (!key) {
      return;
    }
    const buttonIndex = this.#CURRENT_PRESET_DATA.mapping[key.code];
    if (typeof buttonIndex === "undefined") {
      return;
    }
    e.preventDefault();
    if (this.#prevWheelCode === null || this.#prevWheelCode === key.code) {
      this.#wheelStoppedTimeout && clearTimeout(this.#wheelStoppedTimeout);
      this.#pressButton(buttonIndex, true);
    }
    this.#wheelStoppedTimeout = window.setTimeout(() => {
      this.#prevWheelCode = null;
      this.#pressButton(buttonIndex, false);
    }, 20);
  };
  #decayStick = () => {
    if (!this.#allowStickDecaying) {
      return;
    }
    const mouseMapTo = this.#CURRENT_PRESET_DATA.mouse[MkbPresetKey.MOUSE_MAP_TO];
    if (mouseMapTo === MouseMapTo.OFF) {
      return;
    }
    const analog = mouseMapTo === MouseMapTo.LS ? GamepadStick.LEFT : GamepadStick.RIGHT;
    let { x, y } = this.#getStickAxes(analog);
    const length = this.#vectorLength(x, y);
    const clampedLength = Math.min(1, length);
    const decayStrength = this.#CURRENT_PRESET_DATA.mouse[MkbPresetKey.MOUSE_STICK_DECAY_STRENGTH];
    const decay = 1 - clampedLength * clampedLength * decayStrength;
    const minDecay = this.#CURRENT_PRESET_DATA.mouse[MkbPresetKey.MOUSE_STICK_DECAY_MIN];
    const clampedDecay = Math.min(1 - minDecay, decay);
    x *= clampedDecay;
    y *= clampedDecay;
    const deadzoneCounterweight = 20 * MkbHandler.DEFAULT_DEADZONE_COUNTERWEIGHT;
    if (Math.abs(x) <= deadzoneCounterweight && Math.abs(y) <= deadzoneCounterweight) {
      x = 0;
      y = 0;
    }
    if (this.#allowStickDecaying) {
      this.#updateStick(analog, x, y);
      (x !== 0 || y !== 0) && requestAnimationFrame(this.#decayStick);
    }
  };
  #onMouseStopped = () => {
    this.#allowStickDecaying = true;
    requestAnimationFrame(this.#decayStick);
  };
  #onMouseMoveEvent = (e) => {
    const mouseMapTo = this.#CURRENT_PRESET_DATA.mouse[MkbPresetKey.MOUSE_MAP_TO];
    if (mouseMapTo === MouseMapTo.OFF) {
      return;
    }
    this.#allowStickDecaying = false;
    this.#detectMouseStoppedTimeout && clearTimeout(this.#detectMouseStoppedTimeout);
    this.#detectMouseStoppedTimeout = window.setTimeout(this.#onMouseStopped.bind(this), 100);
    const deltaX = e.movementX;
    const deltaY = e.movementY;
    const deadzoneCounterweight = this.#CURRENT_PRESET_DATA.mouse[MkbPresetKey.MOUSE_DEADZONE_COUNTERWEIGHT];
    let x = deltaX * this.#CURRENT_PRESET_DATA.mouse[MkbPresetKey.MOUSE_SENSITIVITY_X];
    let y = deltaY * this.#CURRENT_PRESET_DATA.mouse[MkbPresetKey.MOUSE_SENSITIVITY_Y];
    let length = this.#vectorLength(x, y);
    if (length !== 0 && length < deadzoneCounterweight) {
      x *= deadzoneCounterweight / length;
      y *= deadzoneCounterweight / length;
    } else if (length > MkbHandler.MAXIMUM_STICK_RANGE) {
      x *= MkbHandler.MAXIMUM_STICK_RANGE / length;
      y *= MkbHandler.MAXIMUM_STICK_RANGE / length;
    }
    const analog = mouseMapTo === MouseMapTo.LS ? GamepadStick.LEFT : GamepadStick.RIGHT;
    this.#updateStick(analog, x, y);
  };
  toggle = () => {
    this.#enabled = !this.#enabled;
    this.#enabled ? document.pointerLockElement && this.start() : this.stop();
    Toast.show(t("mouse-and-keyboard"), t(this.#enabled ? "enabled" : "disabled"), { instant: true });
    if (this.#enabled) {
      !document.pointerLockElement && this.#waitForPointerLock(true);
    } else {
      this.#waitForPointerLock(false);
      document.pointerLockElement && document.exitPointerLock();
    }
  };
  #getCurrentPreset = () => {
    return new Promise((resolve) => {
      const presetId = getPref(PrefKey.MKB_DEFAULT_PRESET_ID);
      LocalDb.INSTANCE.getPreset(presetId).then((preset) => {
        resolve(preset);
      });
    });
  };
  refreshPresetData = () => {
    this.#getCurrentPreset().then((preset) => {
      this.#CURRENT_PRESET_DATA = MkbPreset.convert(preset ? preset.data : MkbPreset.DEFAULT_PRESET);
      this.#resetGamepad();
    });
  };
  #onPointerLockChange = () => {
    if (this.#enabled && !document.pointerLockElement) {
      this.stop();
      this.#waitForPointerLock(true);
    }
  };
  #onPointerLockError = (e) => {
    console.log(e);
    this.stop();
  };
  #onActivatePointerLock = () => {
    if (!document.pointerLockElement) {
      document.body.requestPointerLock();
    }
    this.#waitForPointerLock(false);
    this.start();
  };
  #waitForPointerLock = (wait) => {
    this.#$message && this.#$message.classList.toggle("bx-gone", !wait);
  };
  #onStreamMenuShown = () => {
    this.#enabled && this.#waitForPointerLock(false);
  };
  #onStreamMenuHidden = () => {
    this.#enabled && this.#waitForPointerLock(true);
  };
  init = () => {
    this.refreshPresetData();
    this.#enabled = true;
    window.addEventListener("keydown", this.#onKeyboardEvent);
    document.addEventListener("pointerlockchange", this.#onPointerLockChange);
    document.addEventListener("pointerlockerror", this.#onPointerLockError);
    this.#$message = CE("div", { class: "bx-mkb-pointer-lock-msg bx-gone" }, createButton({
      icon: Icon.MOUSE_SETTINGS,
      style: ButtonStyle.PRIMARY,
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        showStreamSettings("mkb");
      }
    }), CE("div", {}, CE("p", {}, t("mkb-click-to-activate")), CE("p", {}, t("press-key-to-toggle-mkb")({ key: "F8" }))));
    this.#$message.addEventListener("click", this.#onActivatePointerLock);
    document.documentElement.appendChild(this.#$message);
    window.addEventListener(BxEvent.STREAM_MENU_SHOWN, this.#onStreamMenuShown);
    window.addEventListener(BxEvent.STREAM_MENU_HIDDEN, this.#onStreamMenuHidden);
    this.#waitForPointerLock(true);
  };
  destroy = () => {
    this.#enabled = false;
    this.stop();
    this.#waitForPointerLock(false);
    document.pointerLockElement && document.exitPointerLock();
    window.removeEventListener("keydown", this.#onKeyboardEvent);
    document.removeEventListener("pointerlockchange", this.#onPointerLockChange);
    document.removeEventListener("pointerlockerror", this.#onPointerLockError);
    window.removeEventListener(BxEvent.STREAM_MENU_SHOWN, this.#onStreamMenuShown);
    window.removeEventListener(BxEvent.STREAM_MENU_HIDDEN, this.#onStreamMenuHidden);
  };
  start = () => {
    window.navigator.getGamepads = this.#patchedGetGamepads;
    this.#resetGamepad();
    window.addEventListener("keyup", this.#onKeyboardEvent);
    window.addEventListener("mousemove", this.#onMouseMoveEvent);
    window.addEventListener("mousedown", this.#onMouseEvent);
    window.addEventListener("mouseup", this.#onMouseEvent);
    window.addEventListener("wheel", this.#onWheelEvent);
    window.addEventListener("contextmenu", this.#disableContextMenu);
    const virtualGamepad = this.#getVirtualGamepad();
    virtualGamepad.connected = true;
    virtualGamepad.timestamp = performance.now();
    BxEvent.dispatch(window, "gamepadconnected", {
      gamepad: virtualGamepad
    });
  };
  stop = () => {
    const virtualGamepad = this.#getVirtualGamepad();
    virtualGamepad.connected = false;
    virtualGamepad.timestamp = performance.now();
    BxEvent.dispatch(window, "gamepaddisconnected", {
      gamepad: virtualGamepad
    });
    window.navigator.getGamepads = this.#nativeGetGamepads;
    this.#resetGamepad();
    window.removeEventListener("keyup", this.#onKeyboardEvent);
    window.removeEventListener("mousemove", this.#onMouseMoveEvent);
    window.removeEventListener("mousedown", this.#onMouseEvent);
    window.removeEventListener("mouseup", this.#onMouseEvent);
    window.removeEventListener("wheel", this.#onWheelEvent);
    window.removeEventListener("contextmenu", this.#disableContextMenu);
  };
  static setupEvents() {
    window.addEventListener(BxEvent.STREAM_PLAYING, () => {
      if (getPref(PrefKey.MKB_ENABLED)) {
        console.log("Emulate MKB");
        MkbHandler.INSTANCE.init();
      }
    });
  }
}

// src/modules/mkb/mkb-preset.ts
class MkbPreset {
  static MOUSE_SETTINGS = {
    [MkbPresetKey.MOUSE_MAP_TO]: {
      label: t("map-mouse-to"),
      type: SettingElementType.OPTIONS,
      default: MouseMapTo[MouseMapTo.RS],
      options: {
        [MouseMapTo[MouseMapTo.RS]]: t("right-stick"),
        [MouseMapTo[MouseMapTo.LS]]: t("left-stick"),
        [MouseMapTo[MouseMapTo.OFF]]: t("off")
      }
    },
    [MkbPresetKey.MOUSE_SENSITIVITY_Y]: {
      label: t("horizontal-sensitivity"),
      type: SettingElementType.NUMBER_STEPPER,
      default: 50,
      min: 1,
      max: 200,
      params: {
        suffix: "%",
        exactTicks: 20
      }
    },
    [MkbPresetKey.MOUSE_SENSITIVITY_X]: {
      label: t("vertical-sensitivity"),
      type: SettingElementType.NUMBER_STEPPER,
      default: 50,
      min: 1,
      max: 200,
      params: {
        suffix: "%",
        exactTicks: 20
      }
    },
    [MkbPresetKey.MOUSE_DEADZONE_COUNTERWEIGHT]: {
      label: t("deadzone-counterweight"),
      type: SettingElementType.NUMBER_STEPPER,
      default: 20,
      min: 1,
      max: 100,
      params: {
        suffix: "%",
        exactTicks: 10
      }
    },
    [MkbPresetKey.MOUSE_STICK_DECAY_STRENGTH]: {
      label: t("stick-decay-strength"),
      type: SettingElementType.NUMBER_STEPPER,
      default: 100,
      min: 10,
      max: 100,
      params: {
        suffix: "%",
        exactTicks: 10
      }
    },
    [MkbPresetKey.MOUSE_STICK_DECAY_MIN]: {
      label: t("stick-decay-minimum"),
      type: SettingElementType.NUMBER_STEPPER,
      default: 10,
      min: 1,
      max: 10,
      params: {
        suffix: "%"
      }
    }
  };
  static DEFAULT_PRESET = {
    mapping: {
      [GamepadKey.UP]: ["ArrowUp"],
      [GamepadKey.DOWN]: ["ArrowDown"],
      [GamepadKey.LEFT]: ["ArrowLeft"],
      [GamepadKey.RIGHT]: ["ArrowRight"],
      [GamepadKey.LS_UP]: ["KeyW"],
      [GamepadKey.LS_DOWN]: ["KeyS"],
      [GamepadKey.LS_LEFT]: ["KeyA"],
      [GamepadKey.LS_RIGHT]: ["KeyD"],
      [GamepadKey.RS_UP]: ["KeyI"],
      [GamepadKey.RS_DOWN]: ["KeyK"],
      [GamepadKey.RS_LEFT]: ["KeyJ"],
      [GamepadKey.RS_RIGHT]: ["KeyL"],
      [GamepadKey.A]: ["Space", "KeyE"],
      [GamepadKey.X]: ["KeyR"],
      [GamepadKey.B]: ["ControlLeft", "Backspace"],
      [GamepadKey.Y]: ["KeyV"],
      [GamepadKey.START]: ["Enter"],
      [GamepadKey.SELECT]: ["Tab"],
      [GamepadKey.LB]: ["KeyC", "KeyG"],
      [GamepadKey.RB]: ["KeyQ"],
      [GamepadKey.HOME]: ["Backquote"],
      [GamepadKey.RT]: [MouseButtonCode.LEFT_CLICK],
      [GamepadKey.LT]: [MouseButtonCode.RIGHT_CLICK],
      [GamepadKey.L3]: ["ShiftLeft"],
      [GamepadKey.R3]: ["KeyF"]
    },
    mouse: {
      [MkbPresetKey.MOUSE_MAP_TO]: MouseMapTo[MouseMapTo.RS],
      [MkbPresetKey.MOUSE_SENSITIVITY_X]: 50,
      [MkbPresetKey.MOUSE_SENSITIVITY_Y]: 50,
      [MkbPresetKey.MOUSE_DEADZONE_COUNTERWEIGHT]: 20,
      [MkbPresetKey.MOUSE_STICK_DECAY_STRENGTH]: 18,
      [MkbPresetKey.MOUSE_STICK_DECAY_MIN]: 6
    }
  };
  static convert(preset) {
    const obj = {
      mapping: {},
      mouse: Object.assign({}, preset.mouse)
    };
    for (const buttonIndex in preset.mapping) {
      for (const keyName of preset.mapping[parseInt(buttonIndex)]) {
        obj.mapping[keyName] = parseInt(buttonIndex);
      }
    }
    const mouse = obj.mouse;
    mouse[MkbPresetKey.MOUSE_SENSITIVITY_X] *= MkbHandler.DEFAULT_PANNING_SENSITIVITY;
    mouse[MkbPresetKey.MOUSE_SENSITIVITY_Y] *= MkbHandler.DEFAULT_PANNING_SENSITIVITY;
    mouse[MkbPresetKey.MOUSE_DEADZONE_COUNTERWEIGHT] *= MkbHandler.DEFAULT_DEADZONE_COUNTERWEIGHT;
    mouse[MkbPresetKey.MOUSE_STICK_DECAY_STRENGTH] *= 0.01;
    mouse[MkbPresetKey.MOUSE_STICK_DECAY_MIN] *= 0.01;
    const mouseMapTo = MouseMapTo[mouse[MkbPresetKey.MOUSE_MAP_TO]];
    if (typeof mouseMapTo !== "undefined") {
      mouse[MkbPresetKey.MOUSE_MAP_TO] = mouseMapTo;
    } else {
      mouse[MkbPresetKey.MOUSE_MAP_TO] = MkbPreset.MOUSE_SETTINGS[MkbPresetKey.MOUSE_MAP_TO].default;
    }
    console.log(obj);
    return obj;
  }
}

// src/modules/mkb/mkb-remapper.ts
class MkbRemapper {
  #BUTTON_ORDERS = [
    GamepadKey.UP,
    GamepadKey.DOWN,
    GamepadKey.LEFT,
    GamepadKey.RIGHT,
    GamepadKey.A,
    GamepadKey.B,
    GamepadKey.X,
    GamepadKey.Y,
    GamepadKey.LB,
    GamepadKey.RB,
    GamepadKey.LT,
    GamepadKey.RT,
    GamepadKey.SELECT,
    GamepadKey.START,
    GamepadKey.HOME,
    GamepadKey.L3,
    GamepadKey.LS_UP,
    GamepadKey.LS_DOWN,
    GamepadKey.LS_LEFT,
    GamepadKey.LS_RIGHT,
    GamepadKey.R3,
    GamepadKey.RS_UP,
    GamepadKey.RS_DOWN,
    GamepadKey.RS_LEFT,
    GamepadKey.RS_RIGHT
  ];
  static #instance;
  static get INSTANCE() {
    if (!MkbRemapper.#instance) {
      MkbRemapper.#instance = new MkbRemapper;
    }
    return MkbRemapper.#instance;
  }
  #STATE = {
    currentPresetId: 0,
    presets: {},
    editingPresetData: null,
    isEditing: false
  };
  #$ = {
    wrapper: null,
    presetsSelect: null,
    activateButton: null,
    currentBindingKey: null,
    allKeyElements: [],
    allMouseElements: {}
  };
  bindingDialog;
  constructor() {
    this.#STATE.currentPresetId = getPref(PrefKey.MKB_DEFAULT_PRESET_ID);
    this.bindingDialog = new Dialog({
      className: "bx-binding-dialog",
      content: CE("div", {}, CE("p", {}, t("press-to-bind")), CE("i", {}, t("press-esc-to-cancel"))),
      hideCloseButton: true
    });
  }
  #clearEventListeners = () => {
    window.removeEventListener("keydown", this.#onKeyDown);
    window.removeEventListener("mousedown", this.#onMouseDown);
    window.removeEventListener("wheel", this.#onWheel);
  };
  #bindKey = ($elm, key) => {
    const buttonIndex = parseInt($elm.getAttribute("data-button-index"));
    const keySlot = parseInt($elm.getAttribute("data-key-slot"));
    if ($elm.getAttribute("data-key-code") === key.code) {
      return;
    }
    for (const $otherElm of this.#$.allKeyElements) {
      if ($otherElm.getAttribute("data-key-code") === key.code) {
        this.#unbindKey($otherElm);
      }
    }
    this.#STATE.editingPresetData.mapping[buttonIndex][keySlot] = key.code;
    $elm.textContent = key.name;
    $elm.setAttribute("data-key-code", key.code);
  };
  #unbindKey = ($elm) => {
    const buttonIndex = parseInt($elm.getAttribute("data-button-index"));
    const keySlot = parseInt($elm.getAttribute("data-key-slot"));
    this.#STATE.editingPresetData.mapping[buttonIndex][keySlot] = null;
    $elm.textContent = "";
    $elm.removeAttribute("data-key-code");
  };
  #onWheel = (e) => {
    e.preventDefault();
    this.#clearEventListeners();
    this.#bindKey(this.#$.currentBindingKey, KeyHelper.getKeyFromEvent(e));
    window.setTimeout(() => this.bindingDialog.hide(), 200);
  };
  #onMouseDown = (e) => {
    e.preventDefault();
    this.#clearEventListeners();
    this.#bindKey(this.#$.currentBindingKey, KeyHelper.getKeyFromEvent(e));
    window.setTimeout(() => this.bindingDialog.hide(), 200);
  };
  #onKeyDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.#clearEventListeners();
    if (e.code !== "Escape") {
      this.#bindKey(this.#$.currentBindingKey, KeyHelper.getKeyFromEvent(e));
    }
    window.setTimeout(() => this.bindingDialog.hide(), 200);
  };
  #onBindingKey = (e) => {
    if (!this.#STATE.isEditing || e.button !== 0) {
      return;
    }
    console.log(e);
    this.#$.currentBindingKey = e.target;
    window.addEventListener("keydown", this.#onKeyDown);
    window.addEventListener("mousedown", this.#onMouseDown);
    window.addEventListener("wheel", this.#onWheel);
    this.bindingDialog.show({ title: this.#$.currentBindingKey.getAttribute("data-prompt") });
  };
  #onContextMenu = (e) => {
    e.preventDefault();
    if (!this.#STATE.isEditing) {
      return;
    }
    this.#unbindKey(e.target);
  };
  #getPreset = (presetId) => {
    return this.#STATE.presets[presetId];
  };
  #getCurrentPreset = () => {
    return this.#getPreset(this.#STATE.currentPresetId);
  };
  #switchPreset = (presetId) => {
    this.#STATE.currentPresetId = presetId;
    const presetData = this.#getCurrentPreset().data;
    for (const $elm of this.#$.allKeyElements) {
      const buttonIndex = parseInt($elm.getAttribute("data-button-index"));
      const keySlot = parseInt($elm.getAttribute("data-key-slot"));
      const buttonKeys = presetData.mapping[buttonIndex];
      if (buttonKeys && buttonKeys[keySlot]) {
        $elm.textContent = KeyHelper.codeToKeyName(buttonKeys[keySlot]);
        $elm.setAttribute("data-key-code", buttonKeys[keySlot]);
      } else {
        $elm.textContent = "";
        $elm.removeAttribute("data-key-code");
      }
    }
    let key;
    for (key in this.#$.allMouseElements) {
      const $elm = this.#$.allMouseElements[key];
      let value = presetData.mouse[key];
      if (typeof value === "undefined") {
        value = MkbPreset.MOUSE_SETTINGS[key].default;
      }
      "setValue" in $elm && $elm.setValue(value);
    }
    const activated = getPref(PrefKey.MKB_DEFAULT_PRESET_ID) === this.#STATE.currentPresetId;
    this.#$.activateButton.disabled = activated;
    this.#$.activateButton.querySelector("span").textContent = activated ? t("activated") : t("activate");
  };
  #refresh() {
    while (this.#$.presetsSelect.firstChild) {
      this.#$.presetsSelect.removeChild(this.#$.presetsSelect.firstChild);
    }
    LocalDb.INSTANCE.getPresets().then((presets) => {
      this.#STATE.presets = presets;
      const $fragment = document.createDocumentFragment();
      let defaultPresetId;
      if (this.#STATE.currentPresetId === 0) {
        this.#STATE.currentPresetId = parseInt(Object.keys(presets)[0]);
        defaultPresetId = this.#STATE.currentPresetId;
        setPref(PrefKey.MKB_DEFAULT_PRESET_ID, defaultPresetId);
        MkbHandler.INSTANCE.refreshPresetData();
      } else {
        defaultPresetId = getPref(PrefKey.MKB_DEFAULT_PRESET_ID);
      }
      for (let id2 in presets) {
        const preset = presets[id2];
        let name = preset.name;
        if (id2 === defaultPresetId) {
          name = `🎮 ` + name;
        }
        const $options = CE("option", { value: id2 }, name);
        $options.selected = parseInt(id2) === this.#STATE.currentPresetId;
        $fragment.appendChild($options);
      }
      this.#$.presetsSelect.appendChild($fragment);
      const activated = defaultPresetId === this.#STATE.currentPresetId;
      this.#$.activateButton.disabled = activated;
      this.#$.activateButton.querySelector("span").textContent = activated ? t("activated") : t("activate");
      !this.#STATE.isEditing && this.#switchPreset(this.#STATE.currentPresetId);
    });
  }
  #toggleEditing = (force) => {
    this.#STATE.isEditing = typeof force !== "undefined" ? force : !this.#STATE.isEditing;
    this.#$.wrapper.classList.toggle("bx-editing", this.#STATE.isEditing);
    if (this.#STATE.isEditing) {
      this.#STATE.editingPresetData = structuredClone(this.#getCurrentPreset().data);
    } else {
      this.#STATE.editingPresetData = null;
    }
    const childElements = this.#$.wrapper.querySelectorAll("select, button, input");
    for (const $elm of Array.from(childElements)) {
      if ($elm.parentElement.parentElement.classList.contains("bx-mkb-action-buttons")) {
        continue;
      }
      let disable = !this.#STATE.isEditing;
      if ($elm.parentElement.classList.contains("bx-mkb-preset-tools")) {
        disable = !disable;
      }
      $elm.disabled = disable;
    }
  };
  render() {
    this.#$.wrapper = CE("div", { class: "bx-mkb-settings" });
    this.#$.presetsSelect = CE("select", {});
    this.#$.presetsSelect.addEventListener("change", (e) => {
      this.#switchPreset(parseInt(e.target.value));
    });
    const promptNewName = (value) => {
      let newName = "";
      while (!newName) {
        newName = prompt(t("prompt-preset-name"), value);
        if (newName === null) {
          return false;
        }
        newName = newName.trim();
      }
      return newName ? newName : false;
    };
    const $header = CE("div", { class: "bx-mkb-preset-tools" }, this.#$.presetsSelect, createButton({
      title: t("rename"),
      icon: Icon.CURSOR_TEXT,
      onClick: (e) => {
        const preset = this.#getCurrentPreset();
        let newName = promptNewName(preset.name);
        if (!newName || newName === preset.name) {
          return;
        }
        preset.name = newName;
        LocalDb.INSTANCE.updatePreset(preset).then((id2) => this.#refresh());
      }
    }), createButton({
      icon: Icon.NEW,
      title: t("new"),
      onClick: (e) => {
        let newName = promptNewName("");
        if (!newName) {
          return;
        }
        LocalDb.INSTANCE.newPreset(newName, MkbPreset.DEFAULT_PRESET).then((id2) => {
          this.#STATE.currentPresetId = id2;
          this.#refresh();
        });
      }
    }), createButton({
      icon: Icon.COPY,
      title: t("copy"),
      onClick: (e) => {
        const preset = this.#getCurrentPreset();
        let newName = promptNewName(`${preset.name} (2)`);
        if (!newName) {
          return;
        }
        LocalDb.INSTANCE.newPreset(newName, preset.data).then((id2) => {
          this.#STATE.currentPresetId = id2;
          this.#refresh();
        });
      }
    }), createButton({
      icon: Icon.TRASH,
      style: ButtonStyle.DANGER,
      title: t("delete"),
      onClick: (e) => {
        if (!confirm(t("confirm-delete-preset"))) {
          return;
        }
        LocalDb.INSTANCE.deletePreset(this.#STATE.currentPresetId).then((id2) => {
          this.#STATE.currentPresetId = 0;
          this.#refresh();
        });
      }
    }));
    this.#$.wrapper.appendChild($header);
    const $rows = CE("div", { class: "bx-mkb-settings-rows" }, CE("i", { class: "bx-mkb-note" }, t("right-click-to-unbind")));
    const keysPerButton = 2;
    for (const buttonIndex of this.#BUTTON_ORDERS) {
      const [buttonName, buttonPrompt] = GamepadKeyName[buttonIndex];
      let $elm;
      const $fragment = document.createDocumentFragment();
      for (let i = 0;i < keysPerButton; i++) {
        $elm = CE("button", {
          "data-prompt": buttonPrompt,
          "data-button-index": buttonIndex,
          "data-key-slot": i
        }, " ");
        $elm.addEventListener("mouseup", this.#onBindingKey);
        $elm.addEventListener("contextmenu", this.#onContextMenu);
        $fragment.appendChild($elm);
        this.#$.allKeyElements.push($elm);
      }
      const $keyRow = CE("div", { class: "bx-mkb-key-row" }, CE("label", { title: buttonName }, buttonPrompt), $fragment);
      $rows.appendChild($keyRow);
    }
    $rows.appendChild(CE("i", { class: "bx-mkb-note" }, t("mkb-adjust-ingame-settings")));
    const $mouseSettings = document.createDocumentFragment();
    for (const key in MkbPreset.MOUSE_SETTINGS) {
      const setting = MkbPreset.MOUSE_SETTINGS[key];
      const value = setting.default;
      let $elm;
      const onChange = (e, value2) => {
        this.#STATE.editingPresetData.mouse[key] = value2;
      };
      const $row = CE("div", { class: "bx-quick-settings-row" }, CE("label", { for: `bx_setting_${key}` }, setting.label), $elm = SettingElement.render(setting.type, key, setting, value, onChange, setting.params));
      $mouseSettings.appendChild($row);
      this.#$.allMouseElements[key] = $elm;
    }
    $rows.appendChild($mouseSettings);
    this.#$.wrapper.appendChild($rows);
    const $actionButtons = CE("div", { class: "bx-mkb-action-buttons" }, CE("div", {}, createButton({
      label: t("edit"),
      onClick: (e) => this.#toggleEditing(true)
    }), this.#$.activateButton = createButton({
      label: t("activate"),
      style: ButtonStyle.PRIMARY,
      onClick: (e) => {
        setPref(PrefKey.MKB_DEFAULT_PRESET_ID, this.#STATE.currentPresetId);
        MkbHandler.INSTANCE.refreshPresetData();
        this.#refresh();
      }
    })), CE("div", {}, createButton({
      label: t("cancel"),
      style: ButtonStyle.GHOST,
      onClick: (e) => {
        this.#switchPreset(this.#STATE.currentPresetId);
        this.#toggleEditing(false);
      }
    }), createButton({
      label: t("save"),
      style: ButtonStyle.PRIMARY,
      onClick: (e) => {
        const updatedPreset = structuredClone(this.#getCurrentPreset());
        updatedPreset.data = this.#STATE.editingPresetData;
        LocalDb.INSTANCE.updatePreset(updatedPreset).then((id2) => {
          if (id2 === getPref(PrefKey.MKB_DEFAULT_PRESET_ID)) {
            MkbHandler.INSTANCE.refreshPresetData();
          }
          this.#toggleEditing(false);
          this.#refresh();
        });
      }
    })));
    this.#$.wrapper.appendChild($actionButtons);
    this.#toggleEditing(false);
    this.#refresh();
    return this.#$.wrapper;
  }
}

// src/modules/screenshot.ts
function takeScreenshot(callback) {
  const currentStream = STATES.currentStream;
  const $video = currentStream.$video;
  const $canvas = currentStream.$screenshotCanvas;
  if (!$video || !$canvas) {
    return;
  }
  const $canvasContext = $canvas.getContext("2d");
  $canvasContext.drawImage($video, 0, 0, $canvas.width, $canvas.height);
  if (AppInterface) {
    const data = $canvas.toDataURL("image/png").split(";base64,")[1];
    AppInterface.saveScreenshot(currentStream.titleId, data);
    $canvasContext.clearRect(0, 0, $canvas.width, $canvas.height);
    callback && callback();
    return;
  }
  $canvas && $canvas.toBlob((blob) => {
    const now = +new Date;
    const $anchor = CE("a", {
      download: `${currentStream.titleId}-${now}.png`,
      href: URL.createObjectURL(blob)
    });
    $anchor.click();
    URL.revokeObjectURL($anchor.href);
    $canvasContext.clearRect(0, 0, $canvas.width, $canvas.height);
    callback && callback();
  }, "image/png");
}
function setupScreenshotButton() {
  const currentStream = STATES.currentStream;
  currentStream.$screenshotCanvas = CE("canvas", { class: "bx-screenshot-canvas" });
  document.documentElement.appendChild(currentStream.$screenshotCanvas);
  const delay = 2000;
  const $btn = CE("div", { class: "bx-screenshot-button", "data-showing": false });
  let timeout;
  const detectDbClick = (e) => {
    if (!currentStream.$video) {
      timeout = null;
      $btn.style.display = "none";
      return;
    }
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      $btn.setAttribute("data-capturing", "true");
      takeScreenshot(() => {
        $btn.setAttribute("data-showing", "false");
        window.setTimeout(() => {
          if (!timeout) {
            $btn.setAttribute("data-capturing", "false");
          }
        }, 100);
      });
      return;
    }
    const isShowing = $btn.getAttribute("data-showing") === "true";
    if (!isShowing) {
      $btn.setAttribute("data-showing", "true");
      $btn.setAttribute("data-capturing", "false");
      timeout && clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        timeout = null;
        $btn.setAttribute("data-showing", "false");
        $btn.setAttribute("data-capturing", "false");
      }, delay);
    }
  };
  $btn.addEventListener("mousedown", detectDbClick);
  document.documentElement.appendChild($btn);
}

// src/modules/touch-controller.ts
class TouchController {
  static #EVENT_SHOW_DEFAULT_CONTROLLER = new MessageEvent("message", {
    data: '{"content":"{\\"layoutId\\":\\"\\"}","target":"/streaming/touchcontrols/showlayoutv2","type":"Message"}',
    origin: "better-xcloud"
  });
  static #$bar;
  static #$style;
  static #enable = false;
  static #showing = false;
  static #dataChannel;
  static #customLayouts = {};
  static #baseCustomLayouts = {};
  static #currentLayoutId;
  static enable() {
    TouchController.#enable = true;
  }
  static disable() {
    TouchController.#enable = false;
  }
  static isEnabled() {
    return TouchController.#enable;
  }
  static #showDefault() {
    TouchController.#dispatchMessage(TouchController.#EVENT_SHOW_DEFAULT_CONTROLLER);
    TouchController.#showing = true;
  }
  static #show() {
    document.querySelector("#BabylonCanvasContainer-main")?.parentElement?.classList.remove("bx-offscreen");
    TouchController.#showing = true;
  }
  static #hide() {
    document.querySelector("#BabylonCanvasContainer-main")?.parentElement?.classList.add("bx-offscreen");
    TouchController.#showing = false;
  }
  static #toggleVisibility() {
    if (!TouchController.#dataChannel) {
      return;
    }
    TouchController.#showing ? TouchController.#hide() : TouchController.#show();
  }
  static #toggleBar(value) {
    TouchController.#$bar && TouchController.#$bar.setAttribute("data-showing", value.toString());
  }
  static reset() {
    TouchController.#enable = false;
    TouchController.#showing = false;
    TouchController.#dataChannel = null;
    TouchController.#$bar && TouchController.#$bar.removeAttribute("data-showing");
    TouchController.#$style && (TouchController.#$style.textContent = "");
  }
  static #dispatchMessage(msg) {
    TouchController.#dataChannel && window.setTimeout(() => {
      TouchController.#dataChannel.dispatchEvent(msg);
    }, 10);
  }
  static #dispatchLayouts(data) {
    BxEvent.dispatch(window, BxEvent.CUSTOM_TOUCH_LAYOUTS_LOADED, {
      data
    });
  }
  static async getCustomLayouts(xboxTitleId, retries = 1) {
    if (xboxTitleId in TouchController.#customLayouts) {
      TouchController.#dispatchLayouts(TouchController.#customLayouts[xboxTitleId]);
      return;
    }
    retries = retries || 1;
    if (retries > 2) {
      TouchController.#customLayouts[xboxTitleId] = null;
      window.setTimeout(() => TouchController.#dispatchLayouts(null), 1000);
      return;
    }
    const baseUrl = `https://raw.githubusercontent.com/redphx/better-xcloud/gh-pages/touch-layouts${BX_FLAGS.UseDevTouchLayout ? "/dev" : ""}`;
    const url = `${baseUrl}/${xboxTitleId}.json`;
    try {
      const resp = await NATIVE_FETCH(url);
      const json = await resp.json();
      const layouts = {};
      json.layouts.forEach(async (layoutName) => {
        let baseLayouts = {};
        if (layoutName in TouchController.#baseCustomLayouts) {
          baseLayouts = TouchController.#baseCustomLayouts[layoutName];
        } else {
          try {
            const layoutUrl = `${baseUrl}/layouts/${layoutName}.json`;
            const resp2 = await NATIVE_FETCH(layoutUrl);
            const json2 = await resp2.json();
            baseLayouts = json2.layouts;
            TouchController.#baseCustomLayouts[layoutName] = baseLayouts;
          } catch (e) {
          }
        }
        Object.assign(layouts, baseLayouts);
      });
      json.layouts = layouts;
      TouchController.#customLayouts[xboxTitleId] = json;
      window.setTimeout(() => TouchController.#dispatchLayouts(json), 1000);
    } catch (e) {
      TouchController.getCustomLayouts(xboxTitleId, retries + 1);
    }
  }
  static loadCustomLayout(xboxTitleId, layoutId, delay = 0) {
    if (!window.BX_EXPOSED.touch_layout_manager) {
      return;
    }
    const layoutChanged = TouchController.#currentLayoutId !== layoutId;
    TouchController.#currentLayoutId = layoutId;
    const layoutData = TouchController.#customLayouts[xboxTitleId];
    if (!xboxTitleId || !layoutId || !layoutData) {
      TouchController.#enable && TouchController.#showDefault();
      return;
    }
    const layout = layoutData.layouts[layoutId] || layoutData.layouts[layoutData.default_layout];
    if (!layout) {
      return;
    }
    layoutChanged && Toast.show(t("touch-control-layout"), layout.name);
    window.setTimeout(() => {
      window.BX_EXPOSED.touch_layout_manager.changeLayoutForScope({
        type: "showLayout",
        scope: xboxTitleId,
        subscope: "base",
        layout: {
          id: "System.Standard",
          displayName: "System",
          layoutFile: {
            content: layout.content
          }
        }
      });
    }, delay);
  }
  static setup() {
    window.BX_EXPOSED.test_touch_control = (content) => {
      const { touch_layout_manager } = window.BX_EXPOSED;
      touch_layout_manager && touch_layout_manager.changeLayoutForScope({
        type: "showLayout",
        scope: "" + STATES.currentStream?.xboxTitleId,
        subscope: "base",
        layout: {
          id: "System.Standard",
          displayName: "Custom",
          layoutFile: {
            content
          }
        }
      });
    };
    const $fragment = document.createDocumentFragment();
    const $style = document.createElement("style");
    $fragment.appendChild($style);
    const $bar = CE("div", { id: "bx-touch-controller-bar" });
    $fragment.appendChild($bar);
    document.documentElement.appendChild($fragment);
    let clickTimeout;
    $bar.addEventListener("mousedown", (e) => {
      clickTimeout && clearTimeout(clickTimeout);
      if (clickTimeout) {
        clickTimeout = null;
        TouchController.#toggleVisibility();
        return;
      }
      clickTimeout = window.setTimeout(() => {
        clickTimeout = null;
      }, 400);
    });
    TouchController.#$bar = $bar;
    TouchController.#$style = $style;
    const PREF_STYLE_STANDARD = getPref(PrefKey.STREAM_TOUCH_CONTROLLER_STYLE_STANDARD);
    const PREF_STYLE_CUSTOM = getPref(PrefKey.STREAM_TOUCH_CONTROLLER_STYLE_CUSTOM);
    window.addEventListener(BxEvent.DATA_CHANNEL_CREATED, (e) => {
      const dataChannel = e.dataChannel;
      if (!dataChannel || dataChannel.label !== "message") {
        return;
      }
      let filter = "";
      if (TouchController.#enable) {
        if (PREF_STYLE_STANDARD === "white") {
          filter = "grayscale(1) brightness(2)";
        } else if (PREF_STYLE_STANDARD === "muted") {
          filter = "sepia(0.5)";
        }
      } else if (PREF_STYLE_CUSTOM === "muted") {
        filter = "sepia(0.5)";
      }
      if (filter) {
        $style.textContent = `#babylon-canvas { filter: ${filter} !important; }`;
      } else {
        $style.textContent = "";
      }
      TouchController.#dataChannel = dataChannel;
      dataChannel.addEventListener("open", () => {
        window.setTimeout(TouchController.#show, 1000);
      });
      let focused = false;
      dataChannel.addEventListener("message", (msg) => {
        if (msg.origin === "better-xcloud" || typeof msg.data !== "string") {
          return;
        }
        if (msg.data.includes("touchcontrols/showtitledefault")) {
          if (TouchController.#enable) {
            if (focused) {
              TouchController.getCustomLayouts(STATES.currentStream?.xboxTitleId);
            } else {
              TouchController.#showDefault();
            }
          }
          return;
        }
        try {
          if (msg.data.includes("/titleinfo")) {
            const json = JSON.parse(JSON.parse(msg.data).content);
            TouchController.#toggleBar(json.focused);
            focused = json.focused;
            if (!json.focused) {
              TouchController.#show();
            }
            STATES.currentStream.xboxTitleId = parseInt(json.titleid, 16).toString();
          }
        } catch (e2) {
          console.log(e2);
        }
      });
    });
  }
}

// src/modules/vibration-manager.ts
var VIBRATION_DATA_MAP = {
  gamepadIndex: 8,
  leftMotorPercent: 8,
  rightMotorPercent: 8,
  leftTriggerMotorPercent: 8,
  rightTriggerMotorPercent: 8,
  durationMs: 16
};

class VibrationManager {
  static #playDeviceVibration(data) {
    if (AppInterface) {
      AppInterface.vibrate(JSON.stringify(data), window.BX_VIBRATION_INTENSITY);
      return;
    }
    const intensity = Math.min(100, data.leftMotorPercent + data.rightMotorPercent / 2) * window.BX_VIBRATION_INTENSITY;
    if (intensity === 0 || intensity === 100) {
      window.navigator.vibrate(intensity ? data.durationMs : 0);
      return;
    }
    const pulseDuration = 200;
    const onDuration = Math.floor(pulseDuration * intensity / 100);
    const offDuration = pulseDuration - onDuration;
    const repeats = Math.ceil(data.durationMs / pulseDuration);
    const pulses = Array(repeats).fill([onDuration, offDuration]).flat();
    window.navigator.vibrate(pulses);
  }
  static supportControllerVibration() {
    return Gamepad.prototype.hasOwnProperty("vibrationActuator");
  }
  static supportDeviceVibration() {
    return !!window.navigator.vibrate;
  }
  static updateGlobalVars() {
    window.BX_ENABLE_CONTROLLER_VIBRATION = VibrationManager.supportControllerVibration() ? getPref(PrefKey.CONTROLLER_ENABLE_VIBRATION) : false;
    window.BX_VIBRATION_INTENSITY = getPref(PrefKey.CONTROLLER_VIBRATION_INTENSITY) / 100;
    if (!VibrationManager.supportDeviceVibration()) {
      window.BX_ENABLE_DEVICE_VIBRATION = false;
      return;
    }
    window.navigator.vibrate(0);
    const value = getPref(PrefKey.CONTROLLER_DEVICE_VIBRATION);
    let enabled;
    if (value === "on") {
      enabled = true;
    } else if (value === "auto") {
      enabled = true;
      const gamepads = window.navigator.getGamepads();
      for (const gamepad of gamepads) {
        if (gamepad) {
          enabled = false;
          break;
        }
      }
    } else {
      enabled = false;
    }
    window.BX_ENABLE_DEVICE_VIBRATION = enabled;
  }
  static #onMessage(e) {
    if (!window.BX_ENABLE_DEVICE_VIBRATION) {
      return;
    }
    if (typeof e !== "object" || !(e.data instanceof ArrayBuffer)) {
      return;
    }
    const dataView = new DataView(e.data);
    let offset = 0;
    let messageType;
    if (dataView.byteLength === 13) {
      messageType = dataView.getUint16(offset, true);
      offset += Uint16Array.BYTES_PER_ELEMENT;
    } else {
      messageType = dataView.getUint8(offset);
      offset += Uint8Array.BYTES_PER_ELEMENT;
    }
    if (!(messageType & 128)) {
      return;
    }
    const vibrationType = dataView.getUint8(offset);
    offset += Uint8Array.BYTES_PER_ELEMENT;
    if (vibrationType !== 0) {
      return;
    }
    const data = {};
    let key;
    for (key in VIBRATION_DATA_MAP) {
      if (VIBRATION_DATA_MAP[key] === 16) {
        data[key] = dataView.getUint16(offset, true);
        offset += Uint16Array.BYTES_PER_ELEMENT;
      } else {
        data[key] = dataView.getUint8(offset);
        offset += Uint8Array.BYTES_PER_ELEMENT;
      }
    }
    VibrationManager.#playDeviceVibration(data);
  }
  static initialSetup() {
    window.addEventListener("gamepadconnected", VibrationManager.updateGlobalVars);
    window.addEventListener("gamepaddisconnected", VibrationManager.updateGlobalVars);
    VibrationManager.updateGlobalVars();
    window.addEventListener(BxEvent.DATA_CHANNEL_CREATED, (e) => {
      const dataChannel = e.dataChannel;
      if (!dataChannel || dataChannel.label !== "input") {
        return;
      }
      dataChannel.addEventListener("message", VibrationManager.#onMessage);
    });
  }
}

// src/modules/ui/ui.ts
function localRedirect(path) {
  const url = window.location.href.substring(0, 31) + path;
  const $pageContent = document.getElementById("PageContent");
  if (!$pageContent) {
    return;
  }
  const $anchor = CE("a", {
    href: url,
    class: "bx-hidden bx-offscreen"
  }, "");
  $anchor.addEventListener("click", (e) => {
    window.setTimeout(() => {
      $pageContent.removeChild($anchor);
    }, 1000);
  });
  $pageContent.appendChild($anchor);
  $anchor.click();
}
var getVideoPlayerFilterStyle = function() {
  const filters = [];
  const clarity = getPref(PrefKey.VIDEO_CLARITY);
  if (clarity != 0) {
    const level = (7 - (clarity - 1) * 0.5).toFixed(1);
    const matrix = `0 -1 0 -1 ${level} -1 0 -1 0`;
    document.getElementById("bx-filter-clarity-matrix").setAttributeNS(null, "kernelMatrix", matrix);
    filters.push(`url(#bx-filter-clarity)`);
  }
  const saturation = getPref(PrefKey.VIDEO_SATURATION);
  if (saturation != 100) {
    filters.push(`saturate(${saturation}%)`);
  }
  const contrast = getPref(PrefKey.VIDEO_CONTRAST);
  if (contrast != 100) {
    filters.push(`contrast(${contrast}%)`);
  }
  const brightness = getPref(PrefKey.VIDEO_BRIGHTNESS);
  if (brightness != 100) {
    filters.push(`brightness(${brightness}%)`);
  }
  return filters.join(" ");
};
var setupQuickSettingsBar = function() {
  const isSafari = UserAgent.isSafari();
  const SETTINGS_UI = [
    getPref(PrefKey.MKB_ENABLED) && {
      icon: Icon.MOUSE,
      group: "mkb",
      items: [
        {
          group: "mkb",
          label: t("mouse-and-keyboard"),
          help_url: "https://better-xcloud.github.io/mouse-and-keyboard/",
          content: MkbRemapper.INSTANCE.render()
        }
      ]
    },
    {
      icon: Icon.DISPLAY,
      group: "stream",
      items: [
        {
          group: "audio",
          label: t("audio"),
          help_url: "https://better-xcloud.github.io/ingame-features/#audio",
          items: [
            {
              pref: PrefKey.AUDIO_VOLUME,
              label: t("volume"),
              onChange: (e, value) => {
                STATES.currentStream.audioGainNode && (STATES.currentStream.audioGainNode.gain.value = value / 100);
              },
              params: {
                disabled: !getPref(PrefKey.AUDIO_ENABLE_VOLUME_CONTROL)
              }
            }
          ]
        },
        {
          group: "video",
          label: t("video"),
          help_url: "https://better-xcloud.github.io/ingame-features/#video",
          items: [
            {
              pref: PrefKey.VIDEO_RATIO,
              label: t("ratio"),
              onChange: updateVideoPlayerCss
            },
            {
              pref: PrefKey.VIDEO_CLARITY,
              label: t("clarity"),
              onChange: updateVideoPlayerCss,
              unsupported: isSafari
            },
            {
              pref: PrefKey.VIDEO_SATURATION,
              label: t("saturation"),
              onChange: updateVideoPlayerCss
            },
            {
              pref: PrefKey.VIDEO_CONTRAST,
              label: t("contrast"),
              onChange: updateVideoPlayerCss
            },
            {
              pref: PrefKey.VIDEO_BRIGHTNESS,
              label: t("brightness"),
              onChange: updateVideoPlayerCss
            }
          ]
        }
      ]
    },
    {
      icon: Icon.CONTROLLER,
      group: "controller",
      items: [
        {
          group: "controller",
          label: t("controller"),
          help_url: "https://better-xcloud.github.io/ingame-features/#controller",
          items: [
            {
              pref: PrefKey.CONTROLLER_ENABLE_VIBRATION,
              label: t("controller-vibration"),
              unsupported: !VibrationManager.supportControllerVibration(),
              onChange: VibrationManager.updateGlobalVars
            },
            {
              pref: PrefKey.CONTROLLER_DEVICE_VIBRATION,
              label: t("device-vibration"),
              unsupported: !VibrationManager.supportDeviceVibration(),
              onChange: VibrationManager.updateGlobalVars
            },
            (VibrationManager.supportControllerVibration() || VibrationManager.supportDeviceVibration()) && {
              pref: PrefKey.CONTROLLER_VIBRATION_INTENSITY,
              label: t("vibration-intensity"),
              unsupported: !VibrationManager.supportDeviceVibration(),
              onChange: VibrationManager.updateGlobalVars
            }
          ]
        },
        STATES.hasTouchSupport && {
          group: "touch-controller",
          label: t("touch-controller"),
          items: [
            {
              label: t("layout"),
              content: CE("select", { disabled: true }, CE("option", {}, t("default"))),
              onMounted: ($elm) => {
                $elm.addEventListener("change", (e) => {
                  TouchController.loadCustomLayout(STATES.currentStream?.xboxTitleId, $elm.value, 1000);
                });
                window.addEventListener(BxEvent.CUSTOM_TOUCH_LAYOUTS_LOADED, (e) => {
                  const data = e.data;
                  if (STATES.currentStream?.xboxTitleId && $elm.xboxTitleId === STATES.currentStream?.xboxTitleId) {
                    $elm.dispatchEvent(new Event("change"));
                    return;
                  }
                  $elm.xboxTitleId = STATES.currentStream?.xboxTitleId;
                  while ($elm.firstChild) {
                    $elm.removeChild($elm.firstChild);
                  }
                  $elm.disabled = !data;
                  if (!data) {
                    $elm.appendChild(CE("option", { value: "" }, t("default")));
                    $elm.value = "";
                    $elm.dispatchEvent(new Event("change"));
                    return;
                  }
                  const $fragment = document.createDocumentFragment();
                  for (const key in data.layouts) {
                    const layout = data.layouts[key];
                    const $option = CE("option", { value: key }, layout.name);
                    $fragment.appendChild($option);
                  }
                  $elm.appendChild($fragment);
                  $elm.value = data.default_layout;
                  $elm.dispatchEvent(new Event("change"));
                });
              }
            }
          ]
        }
      ]
    },
    {
      icon: Icon.STREAM_STATS,
      group: "stats",
      items: [
        {
          group: "stats",
          label: t("menu-stream-stats"),
          help_url: "https://better-xcloud.github.io/stream-stats/",
          items: [
            {
              pref: PrefKey.STATS_SHOW_WHEN_PLAYING,
              label: t("show-stats-on-startup")
            },
            {
              pref: PrefKey.STATS_QUICK_GLANCE,
              label: "👀 " + t("enable-quick-glance-mode"),
              onChange: (e) => {
                e.target.checked ? StreamStats.quickGlanceSetup() : StreamStats.quickGlanceStop();
              }
            },
            {
              pref: PrefKey.STATS_ITEMS,
              label: t("stats"),
              onChange: StreamStats.refreshStyles
            },
            {
              pref: PrefKey.STATS_POSITION,
              label: t("position"),
              onChange: StreamStats.refreshStyles
            },
            {
              pref: PrefKey.STATS_TEXT_SIZE,
              label: t("text-size"),
              onChange: StreamStats.refreshStyles
            },
            {
              pref: PrefKey.STATS_OPACITY,
              label: t("opacity"),
              onChange: StreamStats.refreshStyles
            },
            {
              pref: PrefKey.STATS_TRANSPARENT,
              label: t("transparent-background"),
              onChange: StreamStats.refreshStyles
            },
            {
              pref: PrefKey.STATS_CONDITIONAL_FORMATTING,
              label: t("conditional-formatting"),
              onChange: StreamStats.refreshStyles
            }
          ]
        }
      ]
    }
  ];
  let $tabs;
  let $settings;
  const $wrapper = CE("div", { class: "bx-quick-settings-bar bx-gone" }, $tabs = CE("div", { class: "bx-quick-settings-tabs" }), $settings = CE("div", { class: "bx-quick-settings-tab-contents" }));
  for (const settingTab of SETTINGS_UI) {
    if (!settingTab) {
      continue;
    }
    const $svg = CE("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      "data-group": settingTab.group,
      fill: "none",
      stroke: "#fff",
      "fill-rule": "evenodd",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": 2
    });
    $svg.innerHTML = settingTab.icon;
    $svg.setAttribute("viewBox", "0 0 32 32");
    $svg.addEventListener("click", (e) => {
      for (const $child of Array.from($settings.children)) {
        if ($child.getAttribute("data-group") === settingTab.group) {
          $child.classList.remove("bx-gone");
        } else {
          $child.classList.add("bx-gone");
        }
      }
      for (const $child of Array.from($tabs.children)) {
        $child.classList.remove("bx-active");
      }
      $svg.classList.add("bx-active");
    });
    $tabs.appendChild($svg);
    const $group = CE("div", { "data-group": settingTab.group, class: "bx-gone" });
    for (const settingGroup of settingTab.items) {
      if (!settingGroup) {
        continue;
      }
      $group.appendChild(CE("h2", {}, CE("span", {}, settingGroup.label), settingGroup.help_url && createButton({
        icon: Icon.QUESTION,
        style: ButtonStyle.GHOST,
        url: settingGroup.help_url,
        title: t("help")
      })));
      if (settingGroup.note) {
        if (typeof settingGroup.note === "string") {
          settingGroup.note = document.createTextNode(settingGroup.note);
        }
        $group.appendChild(settingGroup.note);
      }
      if (settingGroup.content) {
        $group.appendChild(settingGroup.content);
        continue;
      }
      if (!settingGroup.items) {
        settingGroup.items = [];
      }
      for (const setting of settingGroup.items) {
        if (!setting) {
          continue;
        }
        const pref = setting.pref;
        let $control;
        if (setting.content) {
          $control = setting.content;
        } else if (!setting.unsupported) {
          $control = toPrefElement(pref, setting.onChange, setting.params);
        }
        const $content = CE("div", { class: "bx-quick-settings-row", "data-type": settingGroup.group }, CE("label", { for: `bx_setting_${pref}` }, setting.label, setting.unsupported && CE("div", { class: "bx-quick-settings-bar-note" }, t("browser-unsupported-feature"))), !setting.unsupported && $control);
        $group.appendChild($content);
        setting.onMounted && setting.onMounted($control);
      }
    }
    $settings.appendChild($group);
  }
  $tabs.firstElementChild.dispatchEvent(new Event("click"));
  document.documentElement.appendChild($wrapper);
};
function updateVideoPlayerCss() {
  let $elm = document.getElementById("bx-video-css");
  if (!$elm) {
    const $fragment = document.createDocumentFragment();
    $elm = CE("style", { id: "bx-video-css" });
    $fragment.appendChild($elm);
    const $svg = CE("svg", {
      id: "bx-video-filters",
      xmlns: "http://www.w3.org/2000/svg",
      class: "bx-gone"
    }, CE("defs", { xmlns: "http://www.w3.org/2000/svg" }, CE("filter", { id: "bx-filter-clarity", xmlns: "http://www.w3.org/2000/svg" }, CE("feConvolveMatrix", { id: "bx-filter-clarity-matrix", order: "3", xmlns: "http://www.w3.org/2000/svg" }))));
    $fragment.appendChild($svg);
    document.documentElement.appendChild($fragment);
  }
  let filters = getVideoPlayerFilterStyle();
  let videoCss = "";
  if (filters) {
    videoCss += `filter: ${filters} !important;`;
  }
  if (getPref(PrefKey.SCREENSHOT_APPLY_FILTERS)) {
    STATES.currentStream.$screenshotCanvas.getContext("2d").filter = filters;
  }
  const PREF_RATIO = getPref(PrefKey.VIDEO_RATIO);
  if (PREF_RATIO && PREF_RATIO !== "16:9") {
    if (PREF_RATIO.includes(":")) {
      videoCss += `aspect-ratio: ${PREF_RATIO.replace(":", "/")}; object-fit: unset !important;`;
      const tmp = PREF_RATIO.split(":");
      const ratio = parseFloat(tmp[0]) / parseFloat(tmp[1]);
      const maxRatio = window.innerWidth / window.innerHeight;
      if (ratio < maxRatio) {
        videoCss += "width: fit-content !important;";
      } else {
        videoCss += "height: fit-content !important;";
      }
    } else {
      videoCss += `object-fit: ${PREF_RATIO} !important;`;
    }
  }
  let css = "";
  if (videoCss) {
    css = `
div[data-testid="media-container"] {
    display: flex;
}

#game-stream video {
    margin: 0 auto;
    align-self: center;
    background: #000;
    ${videoCss}
}
`;
  }
  $elm.textContent = css;
}
function setupBxUi() {
  if (!document.querySelector(".bx-quick-settings-bar")) {
    window.addEventListener("resize", updateVideoPlayerCss);
    setupQuickSettingsBar();
    setupScreenshotButton();
    StreamStats.render();
  }
  updateVideoPlayerCss();
}

// src/modules/remote-play.ts
var RemotePlayConsoleState;
(function(RemotePlayConsoleState2) {
  RemotePlayConsoleState2["ON"] = "On";
  RemotePlayConsoleState2["OFF"] = "Off";
  RemotePlayConsoleState2["STANDBY"] = "ConnectedStandby";
  RemotePlayConsoleState2["UNKNOWN"] = "Unknown";
})(RemotePlayConsoleState || (RemotePlayConsoleState = {}));

class RemotePlay {
  static XCLOUD_TOKEN;
  static XHOME_TOKEN;
  static #CONSOLES;
  static #REGIONS;
  static #STATE_LABELS = {
    [RemotePlayConsoleState.ON]: t("powered-on"),
    [RemotePlayConsoleState.OFF]: t("powered-off"),
    [RemotePlayConsoleState.STANDBY]: t("standby"),
    [RemotePlayConsoleState.UNKNOWN]: t("unknown")
  };
  static BASE_DEVICE_INFO = {
    appInfo: {
      env: {
        clientAppId: window.location.host,
        clientAppType: "browser",
        clientAppVersion: "21.1.98",
        clientSdkVersion: "8.5.3",
        httpEnvironment: "prod",
        sdkInstallId: ""
      }
    },
    dev: {
      displayInfo: {
        dimensions: {
          widthInPixels: 1920,
          heightInPixels: 1080
        },
        pixelDensity: {
          dpiX: 1,
          dpiY: 1
        }
      },
      hw: {
        make: "Microsoft",
        model: "unknown",
        sdktype: "web"
      },
      os: {
        name: "windows",
        ver: "22631.2715",
        platform: "desktop"
      },
      browser: {
        browserName: "chrome",
        browserVersion: "119.0"
      }
    }
  };
  static #$content;
  static #initialize() {
    if (RemotePlay.#$content) {
      return;
    }
    RemotePlay.#$content = CE("div", {}, t("getting-consoles-list"));
    RemotePlay.#getXhomeToken(() => {
      RemotePlay.#getConsolesList(() => {
        console.log(RemotePlay.#CONSOLES);
        RemotePlay.#renderConsoles();
        BxEvent.dispatch(window, BxEvent.REMOTE_PLAY_READY);
      });
    });
  }
  static #renderConsoles() {
    const $fragment = CE("div", { class: "bx-remote-play-container" });
    if (!RemotePlay.#CONSOLES || RemotePlay.#CONSOLES.length === 0) {
      $fragment.appendChild(CE("span", {}, t("no-consoles-found")));
      RemotePlay.#$content = CE("div", {}, $fragment);
      return;
    }
    const $settingNote = CE("p", {});
    const resolutions = [1080, 720];
    const currentResolution = getPref(PrefKey.REMOTE_PLAY_RESOLUTION);
    const $resolutionGroup = CE("div", {});
    for (const resolution of resolutions) {
      const value = `${resolution}p`;
      const id2 = `bx_radio_xhome_resolution_${resolution}`;
      const $radio = CE("input", {
        type: "radio",
        value,
        id: id2,
        name: "bx_radio_xhome_resolution"
      }, value);
      $radio.addEventListener("change", (e) => {
        const value2 = e.target.value;
        $settingNote.textContent = value2 === "1080p" ? "✅ " + t("can-stream-xbox-360-games") : "❌ " + t("cant-stream-xbox-360-games");
        setPref(PrefKey.REMOTE_PLAY_RESOLUTION, value2);
      });
      const $label = CE("label", {
        for: id2,
        class: "bx-remote-play-resolution"
      }, $radio, `${resolution}p`);
      $resolutionGroup.appendChild($label);
      if (currentResolution === value) {
        $radio.checked = true;
        $radio.dispatchEvent(new Event("change"));
      }
    }
    const $qualitySettings = CE("div", { class: "bx-remote-play-settings" }, CE("div", {}, CE("label", {}, t("target-resolution"), $settingNote), $resolutionGroup));
    $fragment.appendChild($qualitySettings);
    for (let con of RemotePlay.#CONSOLES) {
      const $child = CE("div", { class: "bx-remote-play-device-wrapper" }, CE("div", { class: "bx-remote-play-device-info" }, CE("div", {}, CE("span", { class: "bx-remote-play-device-name" }, con.deviceName), CE("span", { class: "bx-remote-play-console-type" }, con.consoleType.replace("Xbox", ""))), CE("div", { class: "bx-remote-play-power-state" }, RemotePlay.#STATE_LABELS[con.powerState])), createButton({
        classes: ["bx-remote-play-connect-button"],
        label: t("console-connect"),
        style: ButtonStyle.PRIMARY | ButtonStyle.FOCUSABLE,
        onClick: (e) => {
          RemotePlay.play(con.serverId);
        }
      }));
      $fragment.appendChild($child);
    }
    $fragment.appendChild(createButton({
      icon: Icon.QUESTION,
      style: ButtonStyle.GHOST | ButtonStyle.FOCUSABLE,
      url: "https://better-xcloud.github.io/remote-play",
      label: t("help")
    }));
    RemotePlay.#$content = CE("div", {}, $fragment);
  }
  static #getXhomeToken(callback) {
    if (RemotePlay.XHOME_TOKEN) {
      callback();
      return;
    }
    let GSSV_TOKEN;
    try {
      GSSV_TOKEN = JSON.parse(localStorage.getItem("xboxcom_xbl_user_info")).tokens["http://gssv.xboxlive.com/"].token;
    } catch (e) {
      for (let i = 0;i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key.startsWith("Auth.User.")) {
          continue;
        }
        const json = JSON.parse(localStorage.getItem(key));
        for (const token of json.tokens) {
          if (!token.relyingParty.includes("gssv.xboxlive.com")) {
            continue;
          }
          GSSV_TOKEN = token.tokenData.token;
          break;
        }
        break;
      }
    }
    const request = new Request("https://xhome.gssv-play-prod.xboxlive.com/v2/login/user", {
      method: "POST",
      body: JSON.stringify({
        offeringId: "xhome",
        token: GSSV_TOKEN
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
    fetch(request).then((resp) => resp.json()).then((json) => {
      RemotePlay.#REGIONS = json.offeringSettings.regions;
      RemotePlay.XHOME_TOKEN = json.gsToken;
      callback();
    });
  }
  static async#getConsolesList(callback) {
    if (RemotePlay.#CONSOLES) {
      callback();
      return;
    }
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RemotePlay.XHOME_TOKEN}`
      }
    };
    for (const region2 of RemotePlay.#REGIONS) {
      try {
        const request = new Request(`${region2.baseUri}/v6/servers/home?mr=50`, options);
        const resp = await fetch(request);
        const json = await resp.json();
        RemotePlay.#CONSOLES = json.results;
        STATES.remotePlay.server = region2.baseUri;
        callback();
      } catch (e) {
      }
      if (RemotePlay.#CONSOLES) {
        break;
      }
    }
    if (!STATES.remotePlay.server) {
      RemotePlay.#CONSOLES = [];
    }
  }
  static play(serverId, resolution) {
    if (resolution) {
      setPref(PrefKey.REMOTE_PLAY_RESOLUTION, resolution);
    }
    STATES.remotePlay.config = {
      serverId
    };
    window.BX_REMOTE_PLAY_CONFIG = STATES.remotePlay.config;
    localRedirect("/launch/fortnite/BT5P2X999VH2#remote-play");
    RemotePlay.detachPopup();
  }
  static preload() {
    RemotePlay.#initialize();
  }
  static detachPopup() {
    const $popup = document.querySelector(".bx-remote-play-popup");
    $popup && $popup.remove();
  }
  static togglePopup(force = null) {
    if (!getPref(PrefKey.REMOTE_PLAY_ENABLED) || !RemotePlay.isReady()) {
      Toast.show(t("getting-consoles-list"));
      return;
    }
    RemotePlay.#initialize();
    if (AppInterface && AppInterface.showRemotePlayDialog) {
      AppInterface.showRemotePlayDialog(JSON.stringify(RemotePlay.#CONSOLES));
      document.activeElement.blur();
      return;
    }
    if (document.querySelector(".bx-remote-play-popup")) {
      if (force === false) {
        RemotePlay.#$content.classList.add("bx-gone");
      } else {
        RemotePlay.#$content.classList.toggle("bx-gone");
      }
      return;
    }
    const $header = document.querySelector("#gamepass-root header");
    const group2 = $header.firstElementChild.getAttribute("data-group");
    RemotePlay.#$content.setAttribute("data-group", group2);
    RemotePlay.#$content.classList.add("bx-remote-play-popup");
    RemotePlay.#$content.classList.remove("bx-gone");
    $header.insertAdjacentElement("afterend", RemotePlay.#$content);
  }
  static detect() {
    if (!getPref(PrefKey.REMOTE_PLAY_ENABLED)) {
      return;
    }
    STATES.remotePlay.isPlaying = window.location.pathname.includes("/launch/") && window.location.hash.startsWith("#remote-play");
    if (STATES.remotePlay?.isPlaying) {
      window.BX_REMOTE_PLAY_CONFIG = STATES.remotePlay.config;
      window.history.replaceState({ origin: "better-xcloud" }, "", "https://www.xbox.com/" + location.pathname.substring(1, 6) + "/play");
    } else {
      window.BX_REMOTE_PLAY_CONFIG = null;
    }
  }
  static isReady() {
    return RemotePlay.#CONSOLES !== null && RemotePlay.#CONSOLES.length > 0;
  }
}

// src/utils/network.ts
var clearApplicationInsightsBuffers = function() {
  window.sessionStorage.removeItem("AI_buffer");
  window.sessionStorage.removeItem("AI_sentBuffer");
};
var clearDbLogs = function(dbName, table) {
  const request = window.indexedDB.open(dbName);
  request.onsuccess = (e) => {
    const db = e.target.result;
    try {
      const objectStore = db.transaction(table, "readwrite").objectStore(table);
      const objectStoreRequest = objectStore.clear();
      objectStoreRequest.onsuccess = function() {
        console.log(`[Better xCloud] Cleared ${dbName}.${table}`);
      };
    } catch (ex) {
    }
  };
};
var clearAllLogs = function() {
  clearApplicationInsightsBuffers();
  clearDbLogs("StreamClientLogHandler", "logs");
  clearDbLogs("XCloudAppLogs", "logs");
};
var updateIceCandidates = function(candidates, options) {
  const pattern = new RegExp(/a=candidate:(?<foundation>\d+) (?<component>\d+) UDP (?<priority>\d+) (?<ip>[^\s]+) (?<port>\d+) (?<the_rest>.*)/);
  const lst = [];
  for (let item2 of candidates) {
    if (item2.candidate == "a=end-of-candidates") {
      continue;
    }
    const groups = pattern.exec(item2.candidate).groups;
    lst.push(groups);
  }
  if (options.preferIpv6Server) {
    lst.sort((a, b) => {
      const firstIp = a.ip;
      const secondIp = b.ip;
      return !firstIp.includes(":") && secondIp.includes(":") ? 1 : -1;
    });
  }
  const newCandidates = [];
  let foundation = 1;
  const newCandidate = (candidate) => {
    return {
      candidate,
      messageType: "iceCandidate",
      sdpMLineIndex: "0",
      sdpMid: "0"
    };
  };
  lst.forEach((item2) => {
    item2.foundation = foundation;
    item2.priority = foundation == 1 ? 1e4 : 1;
    newCandidates.push(newCandidate(`a=candidate:${item2.foundation} 1 UDP ${item2.priority} ${item2.ip} ${item2.port} ${item2.the_rest}`));
    ++foundation;
  });
  if (options.consoleAddrs) {
    for (const ip in options.consoleAddrs) {
      const port = options.consoleAddrs[ip];
      newCandidates.push(newCandidate(`a=candidate:${newCandidates.length + 1} 1 UDP 1 ${ip} ${port} typ host`));
    }
  }
  newCandidates.push(newCandidate("a=end-of-candidates"));
  console.log(newCandidates);
  return newCandidates;
};
async function patchIceCandidates(request, consoleAddrs) {
  const response = await NATIVE_FETCH(request);
  const text = await response.clone().text();
  if (!text.length) {
    return response;
  }
  const options = {
    preferIpv6Server: getPref(PrefKey.PREFER_IPV6_SERVER),
    consoleAddrs
  };
  const obj = JSON.parse(text);
  let exchangeResponse = JSON.parse(obj.exchangeResponse);
  exchangeResponse = updateIceCandidates(exchangeResponse, options);
  obj.exchangeResponse = JSON.stringify(exchangeResponse);
  response.json = () => Promise.resolve(obj);
  response.text = () => Promise.resolve(JSON.stringify(obj));
  return response;
}
function interceptHttpRequests() {
  let BLOCKED_URLS = [];
  if (getPref(PrefKey.BLOCK_TRACKING)) {
    clearAllLogs();
    BLOCKED_URLS = BLOCKED_URLS.concat([
      "https://arc.msn.com",
      "https://browser.events.data.microsoft.com",
      "https://dc.services.visualstudio.com"
    ]);
  }
  if (getPref(PrefKey.BLOCK_SOCIAL_FEATURES)) {
    BLOCKED_URLS = BLOCKED_URLS.concat([
      "https://peoplehub.xboxlive.com/users/me/people/social",
      "https://peoplehub.xboxlive.com/users/me/people/recommendations",
      "https://notificationinbox.xboxlive.com"
    ]);
  }
  const xhrPrototype = XMLHttpRequest.prototype;
  const nativeXhrOpen = xhrPrototype.open;
  const nativeXhrSend = xhrPrototype.send;
  xhrPrototype.open = function(method, url) {
    this._url = url;
    return nativeXhrOpen.apply(this, arguments);
  };
  xhrPrototype.send = function(...arg) {
    for (const blocked of BLOCKED_URLS) {
      if (this._url.startsWith(blocked)) {
        if (blocked === "https://dc.services.visualstudio.com") {
          window.setTimeout(clearAllLogs, 1000);
        }
        return false;
      }
    }
    return nativeXhrSend.apply(this, arguments);
  };
  window.fetch = async (request, init) => {
    let url = typeof request === "string" ? request : request.url;
    for (let blocked of BLOCKED_URLS) {
      if (!url.startsWith(blocked)) {
        continue;
      }
      return new Response('{"acc":1,"webResult":{}}', {
        status: 200,
        statusText: "200 OK"
      });
    }
    if (url.endsWith("/play")) {
      BxEvent.dispatch(window, BxEvent.STREAM_LOADING);
    }
    if (url.endsWith("/configuration")) {
      BxEvent.dispatch(window, BxEvent.STREAM_STARTING);
    }
    let requestType;
    if (url.includes("/sessions/home") || url.includes("xhome.") || STATES.remotePlay.isPlaying && url.endsWith("/inputconfigs")) {
      requestType = RequestType.XHOME;
    } else {
      requestType = RequestType.XCLOUD;
    }
    if (requestType === RequestType.XHOME) {
      return XhomeInterceptor.handle(request);
    }
    return XcloudInterceptor.handle(request, init);
  };
}
var NATIVE_FETCH = window.fetch;
var RequestType;
(function(RequestType2) {
  RequestType2["XCLOUD"] = "xcloud";
  RequestType2["XHOME"] = "xhome";
})(RequestType || (RequestType = {}));

class XhomeInterceptor {
  static #consoleAddrs = {};
  static async#handleLogin(request) {
    try {
      const clone = request.clone();
      const obj = await clone.json();
      obj.offeringId = "xhome";
      request = new Request("https://xhome.gssv-play-prod.xboxlive.com/v2/login/user", {
        method: "POST",
        body: JSON.stringify(obj),
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (e) {
      alert(e);
      console.log(e);
    }
    return NATIVE_FETCH(request);
  }
  static async#handleConfiguration(request) {
    const response = await NATIVE_FETCH(request);
    const obj = await response.clone().json();
    console.log(obj);
    const serverDetails = obj.serverDetails;
    if (serverDetails.ipV4Address) {
      XhomeInterceptor.#consoleAddrs[serverDetails.ipV4Address] = serverDetails.ipV4Port;
    }
    if (serverDetails.ipV6Address) {
      XhomeInterceptor.#consoleAddrs[serverDetails.ipV6Address] = serverDetails.ipV6Port;
    }
    response.json = () => Promise.resolve(obj);
    response.text = () => Promise.resolve(JSON.stringify(obj));
    return response;
  }
  static async#handleInputConfigs(request, opts) {
    const response = await NATIVE_FETCH(request);
    if (getPref(PrefKey.STREAM_TOUCH_CONTROLLER) !== "all") {
      return response;
    }
    const obj = await response.clone().json();
    const xboxTitleId = JSON.parse(opts.body).titleIds[0];
    STATES.currentStream.xboxTitleId = xboxTitleId;
    const inputConfigs = obj[0];
    let hasTouchSupport = inputConfigs.supportedTabs.length > 0;
    if (!hasTouchSupport) {
      const supportedInputTypes = inputConfigs.supportedInputTypes;
      hasTouchSupport = supportedInputTypes.includes("NativeTouch");
    }
    if (hasTouchSupport) {
      TouchController.disable();
      BxEvent.dispatch(window, BxEvent.CUSTOM_TOUCH_LAYOUTS_LOADED, {
        data: null
      });
    } else {
      TouchController.enable();
      TouchController.getCustomLayouts(xboxTitleId);
    }
    response.json = () => Promise.resolve(obj);
    response.text = () => Promise.resolve(JSON.stringify(obj));
    return response;
  }
  static async#handleTitles(request) {
    const clone = request.clone();
    const headers = {};
    for (const pair of clone.headers.entries()) {
      headers[pair[0]] = pair[1];
    }
    headers.authorization = `Bearer ${RemotePlay.XCLOUD_TOKEN}`;
    const index = request.url.indexOf(".xboxlive.com");
    request = new Request("https://wus.core.gssv-play-prod" + request.url.substring(index), {
      method: clone.method,
      body: await clone.text(),
      headers
    });
    return NATIVE_FETCH(request);
  }
  static async handle(request) {
    TouchController.disable();
    const clone = request.clone();
    const headers = {};
    for (const pair of clone.headers.entries()) {
      headers[pair[0]] = pair[1];
    }
    headers.authorization = `Bearer ${RemotePlay.XHOME_TOKEN}`;
    const deviceInfo = RemotePlay.BASE_DEVICE_INFO;
    if (getPref(PrefKey.REMOTE_PLAY_RESOLUTION) === "720p") {
      deviceInfo.dev.os.name = "android";
    }
    headers["x-ms-device-info"] = JSON.stringify(deviceInfo);
    const opts = {
      method: clone.method,
      headers
    };
    if (clone.method === "POST") {
      opts.body = await clone.text();
    }
    let newUrl = request.url;
    if (!newUrl.includes("/servers/home")) {
      const index = request.url.indexOf(".xboxlive.com");
      newUrl = STATES.remotePlay.server + request.url.substring(index + 13);
    }
    request = new Request(newUrl, opts);
    let url = typeof request === "string" ? request : request.url;
    if (url.includes("/configuration")) {
      return XhomeInterceptor.#handleConfiguration(request);
    } else if (url.includes("inputconfigs")) {
      return XhomeInterceptor.#handleInputConfigs(request, opts);
    } else if (url.includes("/login/user")) {
      return XhomeInterceptor.#handleLogin(request);
    } else if (url.endsWith("/titles")) {
      return XhomeInterceptor.#handleTitles(request);
    } else if (url && url.endsWith("/ice") && url.includes("/sessions/") && request.method === "GET") {
      return patchIceCandidates(request, XhomeInterceptor.#consoleAddrs);
    }
    return await NATIVE_FETCH(request);
  }
}

class XcloudInterceptor {
  static async#handleLogin(request, init) {
    const response = await NATIVE_FETCH(request, init);
    const obj = await response.clone().json();
    getPref(PrefKey.REMOTE_PLAY_ENABLED) && BX_FLAGS.PreloadRemotePlay && RemotePlay.preload();
    RemotePlay.XCLOUD_TOKEN = obj.gsToken;
    const serverEmojis = {
      AustraliaEast: "🇦🇺",
      AustraliaSouthEast: "🇦🇺",
      BrazilSouth: "🇧🇷",
      EastUS: "🇺🇸",
      EastUS2: "🇺🇸",
      JapanEast: "🇯🇵",
      KoreaCentral: "🇰🇷",
      MexicoCentral: "🇲🇽",
      NorthCentralUs: "🇺🇸",
      SouthCentralUS: "🇺🇸",
      UKSouth: "🇬🇧",
      WestEurope: "🇪🇺",
      WestUS: "🇺🇸",
      WestUS2: "🇺🇸"
    };
    const serverRegex = /\/\/(\w+)\./;
    for (let region3 of obj.offeringSettings.regions) {
      const regionName = region3.name;
      let shortName = region3.name;
      let match = serverRegex.exec(region3.baseUri);
      if (match) {
        shortName = match[1];
        if (serverEmojis[regionName]) {
          shortName = serverEmojis[regionName] + " " + shortName;
        }
      }
      region3.shortName = shortName.toUpperCase();
      STATES.serverRegions[region3.name] = Object.assign({}, region3);
    }
    BxEvent.dispatch(window, BxEvent.XCLOUD_SERVERS_READY);
    const preferredRegion = getPreferredServerRegion();
    if (preferredRegion in STATES.serverRegions) {
      const tmp = Object.assign({}, STATES.serverRegions[preferredRegion]);
      tmp.isDefault = true;
      obj.offeringSettings.regions = [tmp];
    }
    response.json = () => Promise.resolve(obj);
    return response;
  }
  static async#handlePlay(request, init) {
    const PREF_STREAM_TARGET_RESOLUTION = getPref(PrefKey.STREAM_TARGET_RESOLUTION);
    const PREF_STREAM_PREFERRED_LOCALE = getPref(PrefKey.STREAM_PREFERRED_LOCALE);
    const url = typeof request === "string" ? request : request.url;
    const parsedUrl = new URL(url);
    StreamBadges.region = parsedUrl.host.split(".", 1)[0];
    for (let regionName in STATES.serverRegions) {
      const region3 = STATES.serverRegions[regionName];
      if (parsedUrl.origin == region3.baseUri) {
        StreamBadges.region = regionName;
        break;
      }
    }
    const clone = request.clone();
    const body = await clone.json();
    if (PREF_STREAM_TARGET_RESOLUTION !== "auto") {
      const osName = PREF_STREAM_TARGET_RESOLUTION === "720p" ? "android" : "windows";
      body.settings.osName = osName;
    }
    if (PREF_STREAM_PREFERRED_LOCALE !== "default") {
      body.settings.locale = PREF_STREAM_PREFERRED_LOCALE;
    }
    const newRequest = new Request(request, {
      body: JSON.stringify(body)
    });
    return NATIVE_FETCH(newRequest);
  }
  static async#handleWaitTime(request, init) {
    const response = await NATIVE_FETCH(request, init);
    if (getPref(PrefKey.UI_LOADING_SCREEN_WAIT_TIME)) {
      const json = await response.clone().json();
      if (json.estimatedAllocationTimeInSeconds > 0) {
        LoadingScreen.setupWaitTime(json.estimatedTotalWaitTimeInSeconds);
      }
    }
    return response;
  }
  static async#handleConfiguration(request, init) {
    if (request.method !== "GET") {
      return NATIVE_FETCH(request, init);
    }
    if (getPref(PrefKey.STREAM_TOUCH_CONTROLLER) === "all") {
      TouchController.disable();
      const match = window.location.pathname.match(/\/launch\/[^\/]+\/([\w\d]+)/);
      if (match) {
        const titleId = match[1];
        !TitlesInfo.hasTouchSupport(titleId) && TouchController.enable();
      }
    }
    const response = await NATIVE_FETCH(request, init);
    const text = await response.clone().text();
    if (!text.length) {
      return response;
    }
    const obj = JSON.parse(text);
    let overrides = JSON.parse(obj.clientStreamingConfigOverrides || "{}") || {};
    overrides.inputConfiguration = overrides.inputConfiguration || {};
    overrides.inputConfiguration.enableVibration = true;
    if (TouchController.isEnabled()) {
      overrides.inputConfiguration.enableTouchInput = true;
      overrides.inputConfiguration.maxTouchPoints = 10;
    }
    if (getPref(PrefKey.AUDIO_MIC_ON_PLAYING)) {
      overrides.audioConfiguration = overrides.audioConfiguration || {};
      overrides.audioConfiguration.enableMicrophone = true;
    }
    obj.clientStreamingConfigOverrides = JSON.stringify(overrides);
    response.json = () => Promise.resolve(obj);
    response.text = () => Promise.resolve(JSON.stringify(obj));
    return response;
  }
  static async#handleCatalog(request, init) {
    const response = await NATIVE_FETCH(request, init);
    const json = await response.clone().json();
    for (let productId in json.Products) {
      TitlesInfo.saveFromCatalogInfo(json.Products[productId]);
    }
    return response;
  }
  static async#handleTitles(request, init) {
    const response = await NATIVE_FETCH(request, init);
    if (getPref(PrefKey.STREAM_TOUCH_CONTROLLER) === "all") {
      const json = await response.clone().json();
      for (let game of json.results) {
        TitlesInfo.saveFromTitleInfo(game);
      }
    }
    return response;
  }
  static async handle(request, init) {
    let url = typeof request === "string" ? request : request.url;
    if (url.endsWith("/v2/login/user")) {
      return XcloudInterceptor.#handleLogin(request, init);
    } else if (url.endsWith("/sessions/cloud/play")) {
      return XcloudInterceptor.#handlePlay(request, init);
    } else if (url.includes("xboxlive.com") && url.includes("/waittime/")) {
      return XcloudInterceptor.#handleWaitTime(request, init);
    } else if (url.endsWith("/configuration")) {
      return XcloudInterceptor.#handleConfiguration(request, init);
    } else if (url.startsWith("https://catalog.gamepass.com") && url.includes("/products")) {
      return XcloudInterceptor.#handleCatalog(request, init);
    } else if (url.includes("/v2/titles") || url.includes("/mru")) {
      return XcloudInterceptor.#handleTitles(request, init);
    } else if (url && url.endsWith("/ice") && url.includes("/sessions/") && request.method === "GET") {
      return patchIceCandidates(request);
    }
    return NATIVE_FETCH(request, init);
  }
}

// src/utils/gamepad.ts
function showGamepadToast(gamepad) {
  if (gamepad.id === MkbHandler.VIRTUAL_GAMEPAD_ID) {
    return;
  }
  console.log(gamepad);
  let text = "🎮";
  if (getPref(PrefKey.LOCAL_CO_OP_ENABLED)) {
    text += ` #${gamepad.index + 1}`;
  }
  const gamepadId = gamepad.id.replace(/ \(.*?Vendor: \w+ Product: \w+\)$/, "");
  text += ` - ${gamepadId}`;
  let status;
  if (gamepad.connected) {
    const supportVibration = !!gamepad.vibrationActuator;
    status = (supportVibration ? "✅" : "❌") + " " + t("vibration-status");
  } else {
    status = t("disconnected");
  }
  Toast.show(text, status, { instant: false });
}

// src/utils/css.ts
function addCss() {
  let css = `:root {
  --bx-title-font: Bahnschrift, Arial, Helvetica, sans-serif;
  --bx-title-font-semibold: Bahnschrift Semibold, Arial, Helvetica, sans-serif;
  --bx-normal-font: "Segoe UI", Arial, Helvetica, sans-serif;
  --bx-monospaced-font: Consolas, "Courier New", Courier, monospace;
  --bx-promptfont-font: promptfont;
  --bx-button-height: 36px;
  --bx-default-button-color: #2d3036;
  --bx-default-button-hover-color: #515863;
  --bx-default-button-disabled-color: #8e8e8e;
  --bx-primary-button-color: #008746;
  --bx-primary-button-hover-color: #04b358;
  --bx-primary-button-disabled-color: #448262;
  --bx-danger-button-color: #c10404;
  --bx-danger-button-hover-color: #e61d1d;
  --bx-danger-button-disabled-color: #a26c6c;
  --bx-toast-z-index: 9999;
  --bx-reload-button-z-index: 9200;
  --bx-dialog-z-index: 9101;
  --bx-dialog-overlay-z-index: 9100;
  --bx-remote-play-popup-z-index: 9090;
  --bx-stats-bar-z-index: 9001;
  --bx-stream-settings-z-index: 9000;
  --bx-mkb-pointer-lock-msg-z-index: 8999;
  --bx-screenshot-z-index: 8888;
  --bx-touch-controller-bar-z-index: 5555;
  --bx-wait-time-box-z-index: 100;
}
@font-face {
  font-family: 'promptfont';
  src: url("https://redphx.github.io/better-xcloud/fonts/promptfont.otf");
}
div[class^=HUDButton-module__hiddenContainer] ~ div:not([class^=HUDButton-module__hiddenContainer]) {
  opacity: 0;
  pointer-events: none !important;
  position: absolute;
  top: -9999px;
  left: -9999px;
}
@media screen and (max-width: 600px) {
  header a[href="/play"] {
    display: none;
  }
}
.bx-full-width {
  width: 100% !important;
}
.bx-full-height {
  height: 100% !important;
}
.bx-no-scroll {
  overflow: hidden !important;
}
.bx-gone {
  display: none !important;
}
.bx-offscreen {
  position: absolute !important;
  top: -9999px !important;
  left: -9999px !important;
  visibility: hidden !important;
}
.bx-hidden {
  visibility: hidden !important;
}
.bx-no-margin {
  margin: 0 !important;
}
.bx-no-padding {
  padding: 0 !important;
}
#headerArea,
#uhfSkipToMain,
.uhf-footer {
  display: none;
}
div[class*=NotFocusedDialog] {
  position: absolute !important;
  top: -9999px !important;
  left: -9999px !important;
  width: 0px !important;
  height: 0px !important;
}
#game-stream video:not([src]) {
  visibility: hidden;
}
.bx-button {
  background-color: var(--bx-default-button-color);
  user-select: none;
  -webkit-user-select: none;
  color: #fff;
  font-family: var(--bx-title-font-semibold);
  font-size: 14px;
  border: none;
  font-weight: 400;
  height: var(--bx-button-height);
  border-radius: 4px;
  padding: 0 8px;
  text-transform: uppercase;
  cursor: pointer;
  overflow: hidden;
}
.bx-button:focus {
  outline: none !important;
}
.bx-button:hover,
.bx-button.bx-focusable:focus {
  background-color: var(--bx-default-button-hover-color);
}
.bx-button:disabled {
  cursor: default;
  background-color: var(--bx-default-button-disabled-color);
}
.bx-button.bx-ghost {
  background-color: transparent;
}
.bx-button.bx-ghost:hover,
.bx-button.bx-ghost.bx-focusable:focus {
  background-color: var(--bx-default-button-hover-color);
}
.bx-button.bx-primary {
  background-color: var(--bx-primary-button-color);
}
.bx-button.bx-primary:hover,
.bx-button.bx-primary.bx-focusable:focus {
  background-color: var(--bx-primary-button-hover-color);
}
.bx-button.bx-primary:disabled {
  background-color: var(--bx-primary-button-disabled-color);
}
.bx-button.bx-danger {
  background-color: var(--bx-danger-button-color);
}
.bx-button.bx-danger:hover,
.bx-button.bx-danger.bx-focusable:focus {
  background-color: var(--bx-danger-button-hover-color);
}
.bx-button.bx-danger:disabled {
  background-color: var(--bx-danger-button-disabled-color);
}
.bx-button svg {
  display: inline-block;
  width: 16px;
  height: var(--bx-button-height);
}
.bx-button svg:not(:only-child) {
  margin-right: 4px;
}
.bx-button span {
  display: inline-block;
  height: calc(var(--bx-button-height) - 2px);
  line-height: var(--bx-button-height);
  vertical-align: middle;
  color: #fff;
  overflow: hidden;
  white-space: nowrap;
}
.bx-button.bx-focusable {
  position: relative;
}
.bx-button.bx-focusable::after {
  border: 2px solid transparent;
  border-radius: 4px;
}
.bx-button.bx-focusable:focus::after {
  content: '';
  border-color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
a.bx-button {
  display: inline-block;
}
a.bx-button.bx-full-width {
  text-align: center;
}
.bx-header-remote-play-button {
  height: auto;
  margin-right: 8px !important;
}
.bx-header-remote-play-button svg {
  width: 24px;
  height: 46px;
}
.bx-header-settings-button {
  line-height: 30px;
  font-size: 14px;
  text-transform: uppercase;
  position: relative;
}
.bx-header-settings-button[data-update-available]::before {
  content: '🌟' !important;
  line-height: var(--bx-button-height);
  display: inline-block;
  margin-left: 4px;
}
.bx-settings-reload-button-wrapper {
  z-index: var(--bx-reload-button-z-index);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  background: rgba(0,0,0,0.812);
  padding: 10px;
}
.bx-settings-reload-button-wrapper button {
  max-width: 450px;
  margin: 0 !important;
}
.bx-settings-container {
  background-color: #151515;
  user-select: none;
  -webkit-user-select: none;
  color: #fff;
  font-family: var(--bx-normal-font);
}
@media (hover: hover) {
  .bx-settings-wrapper a.bx-settings-title:hover {
    color: #83f73a;
  }
}
.bx-settings-wrapper {
  width: 450px;
  margin: auto;
  padding: 12px 6px;
}
@media screen and (max-width: 450px) {
  .bx-settings-wrapper {
    width: 100%;
  }
}
.bx-settings-wrapper *:focus {
  outline: none !important;
}
.bx-settings-wrapper .bx-settings-title-wrapper {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}
.bx-settings-wrapper a.bx-settings-title {
  font-family: var(--bx-title-font);
  font-size: 1.4rem;
  text-decoration: none;
  font-weight: bold;
  display: block;
  color: #5dc21e;
  flex: 1;
}
.bx-settings-wrapper a.bx-settings-title:focus {
  color: #83f73a;
}
.bx-settings-wrapper .bx-button.bx-primary {
  margin-top: 8px;
}
.bx-settings-wrapper a.bx-settings-update {
  display: block;
  color: #ff834b;
  text-decoration: none;
  margin-bottom: 8px;
  text-align: center;
  background: #222;
  border-radius: 4px;
  padding: 4px;
}
@media (hover: hover) {
  .bx-settings-wrapper a.bx-settings-update:hover {
    color: #ff9869;
    text-decoration: underline;
  }
}
.bx-settings-wrapper a.bx-settings-update:focus {
  color: #ff9869;
  text-decoration: underline;
}
.bx-settings-group-label {
  font-weight: bold;
  display: block;
  font-size: 1.1rem;
}
.bx-settings-row {
  display: flex;
  margin-bottom: 8px;
  padding: 2px 4px;
}
.bx-settings-row label {
  flex: 1;
  align-self: center;
  margin-bottom: 0;
  padding-left: 10px;
}
@media (hover: none) {
  .bx-settings-row:focus-within {
    background-color: #242424;
  }
}
.bx-settings-row input {
  align-self: center;
  accent-color: var(--bx-primary-button-color);
}
.bx-settings-row select:disabled {
  -webkit-appearance: none;
  background: transparent;
  text-align-last: right;
  border: none;
  color: #fff;
}
.bx-settings-group-label b,
.bx-settings-row label b {
  display: block;
  font-size: 12px;
  font-style: italic;
  font-weight: normal;
  color: #828282;
}
.bx-settings-group-label b {
  margin-bottom: 8px;
}
.bx-settings-app-version {
  margin-top: 10px;
  text-align: center;
  color: #747474;
  font-size: 12px;
}
.bx-donation-link {
  display: block;
  text-align: center;
  text-decoration: none;
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  margin-top: 10px;
  color: #5dc21e;
}
.bx-donation-link:hover {
  color: #6dd72b;
}
.bx-settings-custom-user-agent {
  display: block;
  width: 100%;
}
.bx-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--bx-dialog-overlay-z-index);
  background: #000;
  opacity: 50%;
}
.bx-dialog {
  display: flex;
  flex-flow: column;
  max-height: 90vh;
  position: fixed;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  min-width: 420px;
  padding: 20px;
  border-radius: 8px;
  z-index: var(--bx-dialog-z-index);
  background: #1a1b1e;
  color: #fff;
  font-weight: 400;
  font-size: 16px;
  font-family: var(--bx-normal-font);
  box-shadow: 0 0 6px #000;
  user-select: none;
  -webkit-user-select: none;
}
.bx-dialog *:focus {
  outline: none !important;
}
.bx-dialog h2 {
  display: flex;
  margin-bottom: 12px;
}
.bx-dialog h2 b {
  flex: 1;
  color: #fff;
  display: block;
  font-family: var(--bx-title-font);
  font-size: 26px;
  font-weight: 400;
  line-height: var(--bx-button-height);
}
.bx-dialog.bx-binding-dialog h2 b {
  font-family: var(--bx-promptfont-font) !important;
}
.bx-dialog > div {
  overflow: auto;
  padding: 2px 0;
}
.bx-dialog > button {
  padding: 8px 32px;
  margin: 10px auto 0;
  border: none;
  border-radius: 4px;
  display: block;
  background-color: #2d3036;
  text-align: center;
  color: #fff;
  text-transform: uppercase;
  font-family: var(--bx-title-font);
  font-weight: 400;
  line-height: 18px;
  font-size: 14px;
}
@media (hover: hover) {
  .bx-dialog > button:hover {
    background-color: #515863;
  }
}
.bx-dialog > button:focus {
  background-color: #515863;
}
@media screen and (max-width: 450px) {
  .bx-dialog {
    min-width: 100%;
  }
}
.bx-toast {
  user-select: none;
  -webkit-user-select: none;
  position: fixed;
  left: 50%;
  top: 24px;
  transform: translate(-50%, 0);
  background: #000;
  border-radius: 16px;
  color: #fff;
  z-index: var(--bx-toast-z-index);
  font-family: var(--bx-normal-font);
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  opacity: 0;
  overflow: clip;
  transition: opacity 0.2s ease-in;
}
.bx-toast.bx-show {
  opacity: 0.85;
}
.bx-toast.bx-hide {
  opacity: 0;
}
.bx-toast-msg {
  font-size: 14px;
  display: inline-block;
  padding: 12px 16px;
  white-space: pre;
}
.bx-toast-status {
  font-weight: bold;
  font-size: 14px;
  text-transform: uppercase;
  display: inline-block;
  background: #515863;
  padding: 12px 16px;
  color: #fff;
  white-space: pre;
}
.bx-wait-time-box {
  position: fixed;
  top: 0;
  right: 0;
  background-color: rgba(0,0,0,0.8);
  color: #fff;
  z-index: var(--bx-wait-time-box-z-index);
  padding: 12px;
  border-radius: 0 0 0 8px;
}
.bx-wait-time-box label {
  display: block;
  text-transform: uppercase;
  text-align: right;
  font-size: 12px;
  font-weight: bold;
  margin: 0;
}
.bx-wait-time-box span {
  display: block;
  font-family: var(--bx-monospaced-font);
  text-align: right;
  font-size: 16px;
  margin-bottom: 10px;
}
.bx-wait-time-box span:last-of-type {
  margin-bottom: 0;
}
.bx-remote-play-popup {
  width: 100%;
  max-width: 1920px;
  margin: auto;
  position: relative;
  height: 0.1px;
  overflow: visible;
  z-index: var(--bx-remote-play-popup-z-index);
}
.bx-remote-play-container {
  position: absolute;
  right: 10px;
  top: 0;
  background: #1a1b1e;
  border-radius: 10px;
  width: 420px;
  max-width: calc(100vw - 20px);
  margin: 0 0 0 auto;
  padding: 20px;
  box-shadow: rgba(0,0,0,0.502) 0px 0px 12px 0px;
}
@media (min-width: 480px) and (min-height: calc(480px + 1px)) {
  .bx-remote-play-container {
    right: calc(env(safe-area-inset-right, 0px) + 32px);
  }
}
@media (min-width: 768px) and (min-height: calc(480px + 1px)) {
  .bx-remote-play-container {
    right: calc(env(safe-area-inset-right, 0px) + 48px);
  }
}
@media (min-width: 1920px) and (min-height: calc(480px + 1px)) {
  .bx-remote-play-container {
    right: calc(env(safe-area-inset-right, 0px) + 80px);
  }
}
.bx-remote-play-container > .bx-button {
  display: table;
  margin: 0 0 0 auto;
}
.bx-remote-play-settings {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #2d2d2d;
}
.bx-remote-play-settings > div {
  display: flex;
}
.bx-remote-play-settings label {
  flex: 1;
}
.bx-remote-play-settings label p {
  margin: 4px 0 0;
  padding: 0;
  color: #888;
  font-size: 12px;
}
.bx-remote-play-settings span {
  font-weight: bold;
  font-size: 18px;
  display: block;
  margin-bottom: 8px;
  text-align: center;
}
.bx-remote-play-resolution {
  display: block;
}
.bx-remote-play-resolution input[type="radio"] {
  accent-color: var(--bx-primary-button-color);
  margin-right: 6px;
}
.bx-remote-play-resolution input[type="radio"]:focus {
  accent-color: var(--bx-primary-button-hover-color);
}
.bx-remote-play-device-wrapper {
  display: flex;
  margin-bottom: 12px;
}
.bx-remote-play-device-wrapper:last-child {
  margin-bottom: 2px;
}
.bx-remote-play-device-info {
  flex: 1;
  padding: 4px 0;
}
.bx-remote-play-device-name {
  font-size: 20px;
  font-weight: bold;
  display: inline-block;
  vertical-align: middle;
}
.bx-remote-play-console-type {
  font-size: 12px;
  background: #004c87;
  color: #fff;
  display: inline-block;
  border-radius: 14px;
  padding: 2px 10px;
  margin-left: 8px;
  vertical-align: middle;
}
.bx-remote-play-power-state {
  color: #888;
  font-size: 14px;
}
.bx-remote-play-connect-button {
  min-height: 100%;
  margin: 4px 0;
}
div[class*=StreamMenu-module__menuContainer] > div[class*=Menu-module] {
  overflow: visible;
}
.bx-stream-menu-button-on {
  fill: #000 !important;
  background-color: #2d2d2d !important;
  color: #000 !important;
}
.bx-number-stepper span {
  display: inline-block;
  width: 40px;
  font-family: var(--bx-monospaced-font);
  font-size: 14px;
}
.bx-number-stepper button {
  border: none;
  width: 24px;
  height: 24px;
  margin: 0 4px;
  line-height: 24px;
  background-color: var(--bx-default-button-color);
  color: #fff;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  font-family: var(--bx-monospaced-font);
  color: #fff;
}
@media (hover: hover) {
  .bx-number-stepper button:hover {
    background-color: var(--bx-default-button-hover-color);
  }
}
.bx-number-stepper button:active {
  background-color: var(--bx-default-button-hover-color);
}
.bx-number-stepper button:disabled + span {
  font-family: var(--bx-title-font);
}
.bx-number-stepper input[type=range]:disabled,
.bx-number-stepper button:disabled {
  display: none;
}
.bx-screenshot-button {
  display: none;
  opacity: 0;
  position: fixed;
  bottom: 0;
  box-sizing: border-box;
  width: 60px;
  height: 90px;
  padding: 16px 16px 46px 16px;
  background-size: cover;
  background-repeat: no-repeat;
  background-origin: content-box;
  filter: drop-shadow(0 0 2px rgba(0,0,0,0.69));
  transition: opacity 0.1s ease-in-out 0s, padding 0.1s ease-in 0s;
  z-index: var(--bx-screenshot-z-index);
/* Credit: https://phosphoricons.com */
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSIjZmZmIj48cGF0aCBkPSJNMjguMzA4IDUuMDM4aC00LjI2NWwtMi4wOTctMy4xNDVhMS4yMyAxLjIzIDAgMCAwLTEuMDIzLS41NDhoLTkuODQ2YTEuMjMgMS4yMyAwIDAgMC0xLjAyMy41NDhMNy45NTYgNS4wMzhIMy42OTJBMy43MSAzLjcxIDAgMCAwIDAgOC43MzF2MTcuMjMxYTMuNzEgMy43MSAwIDAgMCAzLjY5MiAzLjY5MmgyNC42MTVBMy43MSAzLjcxIDAgMCAwIDMyIDI1Ljk2MlY4LjczMWEzLjcxIDMuNzEgMCAwIDAtMy42OTItMy42OTJ6bS02Ljc2OSAxMS42OTJjMCAzLjAzOS0yLjUgNS41MzgtNS41MzggNS41MzhzLTUuNTM4LTIuNS01LjUzOC01LjUzOCAyLjUtNS41MzggNS41MzgtNS41MzggNS41MzggMi41IDUuNTM4IDUuNTM4eiIvPjwvc3ZnPgo=");
}
.bx-screenshot-button[data-showing=true] {
  opacity: 0.9;
}
.bx-screenshot-button[data-capturing=true] {
  padding: 8px 8px 38px 8px;
}
.bx-screenshot-canvas {
  display: none;
}
#bx-touch-controller-bar {
  display: none;
  opacity: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6vh;
  z-index: var(--bx-touch-controller-bar-z-index);
}
#bx-touch-controller-bar[data-showing=true] {
  display: block;
}
.bx-badges {
  position: absolute;
  margin-left: 0px;
  user-select: none;
  -webkit-user-select: none;
}
.bx-badge {
  border: none;
  display: inline-block;
  line-height: 24px;
  color: #fff;
  font-family: var(--bx-title-font-semibold);
  font-size: 14px;
  font-weight: 400;
  margin: 0 8px 8px 0;
  box-shadow: 0px 0px 6px #000;
  border-radius: 4px;
}
.bx-badge-name {
  background-color: #2d3036;
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px 0 0 4px;
  text-transform: uppercase;
}
.bx-badge-value {
  background-color: #808080;
  display: inline-block;
  padding: 2px 8px;
  border-radius: 0 4px 4px 0;
}
.bx-badge-battery[data-charging=true] span:first-of-type::after {
  content: ' ⚡️';
}
.bx-stats-bar {
  display: block;
  user-select: none;
  -webkit-user-select: none;
  position: fixed;
  top: 0;
  background-color: #000;
  color: #fff;
  font-family: var(--bx-monospaced-font);
  font-size: 0.9rem;
  padding-left: 8px;
  z-index: var(--bx-stats-bar-z-index);
  text-wrap: nowrap;
}
.bx-stats-bar[data-stats*="[fps]"] > .bx-stat-fps,
.bx-stats-bar[data-stats*="[ping]"] > .bx-stat-ping,
.bx-stats-bar[data-stats*="[btr]"] > .bx-stat-btr,
.bx-stats-bar[data-stats*="[dt]"] > .bx-stat-dt,
.bx-stats-bar[data-stats*="[pl]"] > .bx-stat-pl,
.bx-stats-bar[data-stats*="[fl]"] > .bx-stat-fl {
  display: inline-block;
}
.bx-stats-bar[data-stats$="[fps]"] > .bx-stat-fps,
.bx-stats-bar[data-stats$="[ping]"] > .bx-stat-ping,
.bx-stats-bar[data-stats$="[btr]"] > .bx-stat-btr,
.bx-stats-bar[data-stats$="[dt]"] > .bx-stat-dt,
.bx-stats-bar[data-stats$="[pl]"] > .bx-stat-pl,
.bx-stats-bar[data-stats$="[fl]"] > .bx-stat-fl {
  margin-right: 0;
  border-right: none;
}
.bx-stats-bar::before {
  display: none;
  content: '👀';
  vertical-align: middle;
  margin-right: 8px;
}
.bx-stats-bar[data-display=glancing]::before {
  display: inline-block;
}
.bx-stats-bar[data-position=top-left] {
  left: 0;
  border-radius: 0 0 4px 0;
}
.bx-stats-bar[data-position=top-right] {
  right: 0;
  border-radius: 0 0 0 4px;
}
.bx-stats-bar[data-position=top-center] {
  transform: translate(-50%, 0);
  left: 50%;
  border-radius: 0 0 4px 4px;
}
.bx-stats-bar[data-transparent=true] {
  background: none;
  filter: drop-shadow(1px 0 0 rgba(0,0,0,0.941)) drop-shadow(-1px 0 0 rgba(0,0,0,0.941)) drop-shadow(0 1px 0 rgba(0,0,0,0.941)) drop-shadow(0 -1px 0 rgba(0,0,0,0.941));
}
.bx-stats-bar > div {
  display: none;
  margin-right: 8px;
  border-right: 1px solid #fff;
  padding-right: 8px;
}
.bx-stats-bar label {
  margin: 0 8px 0 0;
  font-family: var(--bx-title-font);
  font-size: inherit;
  font-weight: bold;
  vertical-align: middle;
  cursor: help;
}
.bx-stats-bar span {
  min-width: 60px;
  display: inline-block;
  text-align: right;
  vertical-align: middle;
}
.bx-stats-bar span[data-grade=good] {
  color: #6bffff;
}
.bx-stats-bar span[data-grade=ok] {
  color: #fff16b;
}
.bx-stats-bar span[data-grade=bad] {
  color: #ff5f5f;
}
.bx-stats-bar span:first-of-type {
  min-width: 22px;
}
.bx-quick-settings-bar {
  display: flex;
  position: fixed;
  z-index: var(--bx-stream-settings-z-index);
  opacity: 0.98;
  user-select: none;
  -webkit-user-select: none;
}
.bx-quick-settings-tabs {
  position: fixed;
  top: 0;
  right: 420px;
  display: flex;
  flex-direction: column;
  border-radius: 0 0 0 8px;
  box-shadow: 0px 0px 6px #000;
  overflow: clip;
}
.bx-quick-settings-tabs svg {
  width: 32px;
  height: 32px;
  padding: 10px;
  box-sizing: content-box;
  background: #131313;
  cursor: pointer;
  border-left: 4px solid #1e1e1e;
}
.bx-quick-settings-tabs svg.bx-active {
  background: #222;
  border-color: #008746;
}
.bx-quick-settings-tabs svg:not(.bx-active):hover {
  background: #2f2f2f;
  border-color: #484848;
}
.bx-quick-settings-tab-contents {
  flex-direction: column;
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 14px 14px 0;
  width: 420px;
  background: #1a1b1e;
  color: #fff;
  font-weight: 400;
  font-size: 16px;
  font-family: var(--bx-title-font);
  text-align: center;
  box-shadow: 0px 0px 6px #000;
  overflow: overlay;
}
.bx-quick-settings-tab-contents > div[data-group=mkb] {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.bx-quick-settings-tab-contents *:focus {
  outline: none !important;
}
.bx-quick-settings-tab-contents h2 {
  margin-bottom: 8px;
  display: flex;
  align-item: center;
}
.bx-quick-settings-tab-contents h2 span {
  display: inline-block;
  font-size: 24px;
  font-weight: bold;
  text-transform: uppercase;
  text-align: left;
  flex: 1;
  height: var(--bx-button-height);
  line-height: calc(var(--bx-button-height) + 4px);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.bx-quick-settings-tab-contents input[type="range"] {
  display: block;
  margin: 12px auto 2px;
  width: 180px;
  color: #959595 !important;
}
.bx-quick-settings-row {
  display: flex;
  border-bottom: 1px solid rgba(64,64,64,0.502);
  margin-bottom: 16px;
  padding-bottom: 16px;
}
.bx-quick-settings-row label {
  font-size: 16px;
  display: block;
  text-align: left;
  flex: 1;
  align-self: center;
  margin-bottom: 0 !important;
}
.bx-quick-settings-row input {
  accent-color: var(--bx-primary-button-color);
}
.bx-quick-settings-row select:disabled {
  -webkit-appearance: none;
  background: transparent;
  text-align-last: right;
  border: none;
}
.bx-quick-settings-bar-note {
  display: block;
  text-align: center;
  font-size: 12px;
  font-weight: lighter;
  font-style: italic;
  padding-top: 16px;
}
.bx-mkb-settings {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-bottom: 10px;
  overflow: hidden;
}
.bx-mkb-settings select:disabled {
  -webkit-appearance: none;
  background: transparent;
  text-align-last: right;
  text-align: right;
  border: none;
  color: #fff;
}
.bx-mkb-pointer-lock-msg {
  display: flex;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  margin: auto;
  background: rgba(0,0,0,0.898);
  z-index: var(--bx-mkb-pointer-lock-msg-z-index);
  color: #fff;
  text-align: center;
  font-weight: 400;
  font-family: "Segoe UI", Arial, Helvetica, sans-serif;
  font-size: 1.3rem;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  box-shadow: 0 0 6px #000;
}
.bx-mkb-pointer-lock-msg:hover {
  background: #151515;
}
.bx-mkb-pointer-lock-msg button {
  margin-right: 12px;
  height: 60px;
}
.bx-mkb-pointer-lock-msg svg {
  width: 32px;
}
.bx-mkb-pointer-lock-msg div {
  display: flex;
  flex-direction: column;
  text-align: left;
}
.bx-mkb-pointer-lock-msg p {
  margin: 0;
}
.bx-mkb-pointer-lock-msg p:first-child {
  font-size: 22px;
  margin-bottom: 8px;
}
.bx-mkb-pointer-lock-msg p:last-child {
  font-size: 14px;
  font-style: italic;
}
.bx-mkb-preset-tools {
  display: flex;
  margin-bottom: 12px;
}
.bx-mkb-preset-tools select {
  flex: 1;
}
.bx-mkb-preset-tools button {
  margin-left: 6px;
}
.bx-mkb-settings-rows {
  flex: 1;
  overflow: scroll;
}
.bx-mkb-key-row {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}
.bx-mkb-key-row label {
  margin-bottom: 0;
  font-family: var(--bx-promptfont-font);
  font-size: 26px;
  text-align: center;
  width: 26px;
  height: 32px;
  line-height: 32px;
}
.bx-mkb-key-row button {
  flex: 1;
  height: 32px;
  line-height: 32px;
  margin: 0 0 0 10px;
  background: transparent;
  border: none;
  color: #fff;
  border-radius: 0;
  border-left: 1px solid #373737;
}
.bx-mkb-key-row button:hover {
  background: transparent;
  cursor: default;
}
.bx-mkb-settings.bx-editing .bx-mkb-key-row button {
  background: #393939;
  border-radius: 4px;
  border: none;
}
.bx-mkb-settings.bx-editing .bx-mkb-key-row button:hover {
  background: #333;
  cursor: pointer;
}
.bx-mkb-action-buttons > div {
  text-align: right;
  display: none;
}
.bx-mkb-action-buttons button {
  margin-left: 8px;
}
.bx-mkb-settings:not(.bx-editing) .bx-mkb-action-buttons > div:first-child {
  display: block;
}
.bx-mkb-settings.bx-editing .bx-mkb-action-buttons > div:last-child {
  display: block;
}
.bx-mkb-note {
  display: block;
  margin: 16px 0 10px;
  font-size: 12px;
}
.bx-mkb-note:first-of-type {
  margin-top: 0;
}
`;
  if (getPref(PrefKey.BLOCK_SOCIAL_FEATURES)) {
    css += `
div[class^=HomePage-module__bottomSpacing]:has(button[class*=SocialEmptyCard]),
button[class*=SocialEmptyCard] {
    display: none;
}
`;
  }
  if (getPref(PrefKey.REDUCE_ANIMATIONS)) {
    css += `
div[class*=GameCard-module__gameTitleInnerWrapper],
div[class*=GameCard-module__card],
div[class*=ScrollArrows-module] {
    transition: none !important;
}
`;
  }
  if (getPref(PrefKey.HIDE_DOTS_ICON)) {
    css += `
div[class*=Grip-module__container] {
    visibility: hidden;
}

@media (hover: hover) {
    button[class*=GripHandle-module__container]:hover div[class*=Grip-module__container] {
        visibility: visible;
    }
}

button[class*=GripHandle-module__container][aria-expanded=true] div[class*=Grip-module__container] {
    visibility: visible;
}

button[class*=GripHandle-module__container][aria-expanded=false] {
    background-color: transparent !important;
}

div[class*=StreamHUD-module__buttonsContainer] {
    padding: 0px !important;
}
`;
  }
  css += `
div[class*=StreamMenu-module__menu] {
    min-width: 100vw !important;
}
`;
  if (getPref(PrefKey.STREAM_SIMPLIFY_MENU)) {
    css += `
div[class*=Menu-module__scrollable] {
    --bxStreamMenuItemSize: 80px;
    --streamMenuItemSize: calc(var(--bxStreamMenuItemSize) + 40px) !important;
}

.bx-badges {
    top: calc(var(--streamMenuItemSize) - 20px);
}

body[data-media-type=tv] .bx-badges {
    top: calc(var(--streamMenuItemSize) - 10px) !important;
}

button[class*=MenuItem-module__container] {
    min-width: auto !important;
    min-height: auto !important;
    width: var(--bxStreamMenuItemSize) !important;
    height: var(--bxStreamMenuItemSize) !important;
}

div[class*=MenuItem-module__label] {
    display: none !important;
}

svg[class*=MenuItem-module__icon] {
    width: 36px;
    height: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
}
`;
  } else {
    css += `
body[data-media-type=tv] .bx-badges {
    top: calc(var(--streamMenuItemSize) + 30px);
}

body:not([data-media-type=tv]) .bx-badges {
    top: calc(var(--streamMenuItemSize) + 20px);
}

body:not([data-media-type=tv]) button[class*=MenuItem-module__container] {
    min-width: auto !important;
    width: 100px !important;
}

body:not([data-media-type=tv]) button[class*=MenuItem-module__container]:nth-child(n+2) {
    margin-left: 10px !important;
}

body:not([data-media-type=tv]) div[class*=MenuItem-module__label] {
    margin-left: 8px !important;
    margin-right: 8px !important;
}
`;
  }
  if (getPref(PrefKey.UI_SCROLLBAR_HIDE)) {
    css += `
html {
    scrollbar-width: none;
}

body::-webkit-scrollbar {
    display: none;
}
`;
  }
  const $style = CE("style", {}, css);
  document.documentElement.appendChild($style);
}

// src/modules/mkb/mouse-cursor-hider.ts
class MouseCursorHider {
  static #timeout;
  static #cursorVisible = true;
  static show() {
    document.body && (document.body.style.cursor = "unset");
    MouseCursorHider.#cursorVisible = true;
  }
  static hide() {
    document.body && (document.body.style.cursor = "none");
    MouseCursorHider.#timeout = null;
    MouseCursorHider.#cursorVisible = false;
  }
  static onMouseMove(e) {
    !MouseCursorHider.#cursorVisible && MouseCursorHider.show();
    MouseCursorHider.#timeout && clearTimeout(MouseCursorHider.#timeout);
    MouseCursorHider.#timeout = window.setTimeout(MouseCursorHider.hide, 3000);
  }
  static start() {
    MouseCursorHider.show();
    document.addEventListener("mousemove", MouseCursorHider.onMouseMove);
  }
  static stop() {
    MouseCursorHider.#timeout && clearTimeout(MouseCursorHider.#timeout);
    document.removeEventListener("mousemove", MouseCursorHider.onMouseMove);
    MouseCursorHider.show();
  }
}

// src/modules/ui/global-settings.ts
function setupSettingsUi() {
  if (document.querySelector(".bx-settings-container")) {
    return;
  }
  const PREF_PREFERRED_REGION = getPreferredServerRegion();
  const PREF_LATEST_VERSION = getPref(PrefKey.LATEST_VERSION);
  let $reloadBtnWrapper;
  const $container = CE("div", {
    class: "bx-settings-container bx-gone"
  });
  let $updateAvailable;
  const $wrapper = CE("div", { class: "bx-settings-wrapper" }, CE("div", { class: "bx-settings-title-wrapper" }, CE("a", {
    class: "bx-settings-title",
    href: SCRIPT_HOME,
    target: "_blank"
  }, "Better xCloud " + SCRIPT_VERSION), createButton({ icon: Icon.QUESTION, label: t("help"), url: "https://better-xcloud.github.io/features/" })));
  $updateAvailable = CE("a", {
    class: "bx-settings-update bx-gone",
    href: "https://github.com/redphx/better-xcloud/releases",
    target: "_blank"
  });
  $wrapper.appendChild($updateAvailable);
  if (PREF_LATEST_VERSION && PREF_LATEST_VERSION != SCRIPT_VERSION) {
    $updateAvailable.textContent = `🌟 Version ${PREF_LATEST_VERSION} available`;
    $updateAvailable.classList.remove("bx-gone");
  }
  if (!AppInterface) {
    const userAgent = UserAgent.getDefault().toLowerCase();
    if (userAgent.includes("android")) {
      const $btn = createButton({
        label: "🔥 " + t("install-android"),
        style: ButtonStyle.FULL_WIDTH | ButtonStyle.FOCUSABLE,
        url: "https://better-xcloud.github.io/android"
      });
      $wrapper.appendChild($btn);
    }
  }
  const onChange = (e) => {
    if (!$reloadBtnWrapper) {
      return;
    }
    $reloadBtnWrapper.classList.remove("bx-gone");
    if (e.target.id === "bx_setting_" + PrefKey.BETTER_XCLOUD_LOCALE) {
      refreshCurrentLocale();
      const $btn = $reloadBtnWrapper.firstElementChild;
      $btn.textContent = t("settings-reloading");
      $btn.click();
    }
  };
  for (let groupLabel in SETTINGS_UI) {
    const $group = CE("span", { class: "bx-settings-group-label" }, groupLabel);
    if (SETTINGS_UI[groupLabel].note) {
      const $note = CE("b", {}, SETTINGS_UI[groupLabel].note);
      $group.appendChild($note);
    }
    $wrapper.appendChild($group);
    if (SETTINGS_UI[groupLabel].unsupported) {
      continue;
    }
    const settingItems = SETTINGS_UI[groupLabel].items;
    for (let settingId of settingItems) {
      if (!settingId) {
        continue;
      }
      const setting = Preferences.SETTINGS[settingId];
      if (!setting) {
        continue;
      }
      let settingLabel = setting.label;
      let settingNote = setting.note || "";
      if (setting.experimental) {
        settingLabel = "🧪 " + settingLabel;
        if (!settingNote) {
          settingNote = t("experimental");
        } else {
          settingNote = `${t("experimental")}: ${settingNote}`;
        }
      }
      let $control;
      let $inpCustomUserAgent;
      let labelAttrs = {};
      if (settingId === PrefKey.USER_AGENT_PROFILE) {
        let defaultUserAgent = window.navigator.orgUserAgent || window.navigator.userAgent;
        $inpCustomUserAgent = CE("input", {
          type: "text",
          placeholder: defaultUserAgent,
          class: "bx-settings-custom-user-agent"
        });
        $inpCustomUserAgent.addEventListener("change", (e) => {
          setPref(PrefKey.USER_AGENT_CUSTOM, e.target.value.trim());
          onChange(e);
        });
        $control = toPrefElement(PrefKey.USER_AGENT_PROFILE, (e) => {
          const value = e.target.value;
          let isCustom = value === UserAgentProfile.CUSTOM;
          let userAgent = UserAgent.get(value);
          $inpCustomUserAgent.value = userAgent;
          $inpCustomUserAgent.readOnly = !isCustom;
          $inpCustomUserAgent.disabled = !isCustom;
          onChange(e);
        });
      } else if (settingId === PrefKey.SERVER_REGION) {
        let selectedValue;
        $control = CE("select", { id: `bx_setting_${settingId}` });
        $control.name = $control.id;
        $control.addEventListener("change", (e) => {
          setPref(settingId, e.target.value);
          onChange(e);
        });
        selectedValue = PREF_PREFERRED_REGION;
        setting.options = {};
        for (let regionName in STATES.serverRegions) {
          const region4 = STATES.serverRegions[regionName];
          let value = regionName;
          let label = `${region4.shortName} - ${regionName}`;
          if (region4.isDefault) {
            label += ` (${t("default")})`;
            value = "default";
            if (selectedValue === regionName) {
              selectedValue = "default";
            }
          }
          setting.options[value] = label;
        }
        for (let value in setting.options) {
          const label = setting.options[value];
          const $option = CE("option", { value }, label);
          $control.appendChild($option);
        }
        $control.value = selectedValue;
      } else {
        if (settingId === PrefKey.BETTER_XCLOUD_LOCALE) {
          $control = toPrefElement(settingId, (e) => {
            localStorage.setItem("better_xcloud_locale", e.target.value);
            onChange(e);
          });
        } else {
          $control = toPrefElement(settingId, onChange);
        }
        labelAttrs = { for: $control.id, tabindex: 0 };
      }
      if (setting.unsupported) {
        $control.disabled = true;
      }
      const $label = CE("label", labelAttrs, settingLabel);
      if (settingNote) {
        $label.appendChild(CE("b", {}, settingNote));
      }
      const $elm = CE("div", { class: "bx-settings-row" }, $label, $control);
      $wrapper.appendChild($elm);
      if (settingId === PrefKey.USER_AGENT_PROFILE) {
        $wrapper.appendChild($inpCustomUserAgent);
        $control.dispatchEvent(new Event("change"));
      }
    }
  }
  const $reloadBtn = createButton({
    label: t("settings-reload"),
    style: ButtonStyle.DANGER | ButtonStyle.FOCUSABLE | ButtonStyle.FULL_WIDTH,
    onClick: (e) => {
      window.location.reload();
      $reloadBtn.disabled = true;
      $reloadBtn.textContent = t("settings-reloading");
    }
  });
  $reloadBtn.setAttribute("tabindex", "0");
  $reloadBtnWrapper = CE("div", { class: "bx-settings-reload-button-wrapper bx-gone" }, $reloadBtn);
  $wrapper.appendChild($reloadBtnWrapper);
  const $donationLink = CE("a", { class: "bx-donation-link", href: "https://ko-fi.com/redphx", target: "_blank" }, `❤️ ${t("support-better-xcloud")}`);
  $wrapper.appendChild($donationLink);
  try {
    const appVersion = document.querySelector("meta[name=gamepass-app-version]").content;
    const appDate = new Date(document.querySelector("meta[name=gamepass-app-date]").content).toISOString().substring(0, 10);
    $wrapper.appendChild(CE("div", { class: "bx-settings-app-version" }, `xCloud website version ${appVersion} (${appDate})`));
  } catch (e) {
  }
  $container.appendChild($wrapper);
  const $pageContent = document.getElementById("PageContent");
  $pageContent?.parentNode?.insertBefore($container, $pageContent);
}
var SETTINGS_UI = {
  "Better xCloud": {
    items: [
      PrefKey.BETTER_XCLOUD_LOCALE,
      PrefKey.REMOTE_PLAY_ENABLED
    ]
  },
  [t("server")]: {
    items: [
      PrefKey.SERVER_REGION,
      PrefKey.STREAM_PREFERRED_LOCALE,
      PrefKey.PREFER_IPV6_SERVER
    ]
  },
  [t("stream")]: {
    items: [
      PrefKey.STREAM_TARGET_RESOLUTION,
      PrefKey.STREAM_CODEC_PROFILE,
      PrefKey.GAME_FORTNITE_FORCE_CONSOLE,
      PrefKey.AUDIO_MIC_ON_PLAYING,
      PrefKey.STREAM_DISABLE_FEEDBACK_DIALOG,
      PrefKey.SCREENSHOT_BUTTON_POSITION,
      PrefKey.SCREENSHOT_APPLY_FILTERS,
      PrefKey.AUDIO_ENABLE_VOLUME_CONTROL,
      PrefKey.STREAM_COMBINE_SOURCES
    ]
  },
  [t("local-co-op")]: {
    items: [
      PrefKey.LOCAL_CO_OP_ENABLED
    ]
  },
  [t("mouse-and-keyboard")]: {
    items: [
      PrefKey.MKB_ENABLED,
      PrefKey.MKB_HIDE_IDLE_CURSOR
    ]
  },
  [t("touch-controller")]: {
    note: !STATES.hasTouchSupport ? "⚠️ " + t("device-unsupported-touch") : null,
    unsupported: !STATES.hasTouchSupport,
    items: [
      PrefKey.STREAM_TOUCH_CONTROLLER,
      PrefKey.STREAM_TOUCH_CONTROLLER_AUTO_OFF,
      PrefKey.STREAM_TOUCH_CONTROLLER_STYLE_STANDARD,
      PrefKey.STREAM_TOUCH_CONTROLLER_STYLE_CUSTOM
    ]
  },
  [t("loading-screen")]: {
    items: [
      PrefKey.UI_LOADING_SCREEN_GAME_ART,
      PrefKey.UI_LOADING_SCREEN_WAIT_TIME,
      PrefKey.UI_LOADING_SCREEN_ROCKET
    ]
  },
  [t("ui")]: {
    items: [
      PrefKey.UI_LAYOUT,
      PrefKey.STREAM_SIMPLIFY_MENU,
      PrefKey.SKIP_SPLASH_VIDEO,
      !AppInterface && PrefKey.UI_SCROLLBAR_HIDE,
      PrefKey.HIDE_DOTS_ICON,
      PrefKey.REDUCE_ANIMATIONS
    ]
  },
  [t("other")]: {
    items: [
      PrefKey.BLOCK_SOCIAL_FEATURES,
      PrefKey.BLOCK_TRACKING
    ]
  },
  [t("advanced")]: {
    items: [
      PrefKey.USER_AGENT_PROFILE
    ]
  }
};

// src/modules/ui/header.ts
var injectSettingsButton = function($parent) {
  if (!$parent) {
    return;
  }
  const PREF_PREFERRED_REGION = getPreferredServerRegion(true);
  const PREF_LATEST_VERSION = getPref(PrefKey.LATEST_VERSION);
  const $headerFragment = document.createDocumentFragment();
  if (getPref(PrefKey.REMOTE_PLAY_ENABLED)) {
    const $remotePlayBtn = createButton({
      classes: ["bx-header-remote-play-button"],
      icon: Icon.REMOTE_PLAY,
      title: t("remote-play"),
      style: ButtonStyle.GHOST | ButtonStyle.FOCUSABLE,
      onClick: (e) => {
        RemotePlay.togglePopup();
      }
    });
    $headerFragment.appendChild($remotePlayBtn);
  }
  const $settingsBtn = createButton({
    classes: ["bx-header-settings-button"],
    label: PREF_PREFERRED_REGION,
    style: ButtonStyle.GHOST | ButtonStyle.FOCUSABLE | ButtonStyle.FULL_HEIGHT,
    onClick: (e) => {
      setupSettingsUi();
      const $settings = document.querySelector(".bx-settings-container");
      $settings.classList.toggle("bx-gone");
      window.scrollTo(0, 0);
      document.activeElement && document.activeElement.blur();
    }
  });
  if (PREF_LATEST_VERSION && PREF_LATEST_VERSION !== SCRIPT_VERSION) {
    $settingsBtn.setAttribute("data-update-available", "true");
  }
  $headerFragment.appendChild($settingsBtn);
  $parent.appendChild($headerFragment);
};
function checkHeader() {
  const $button = document.querySelector(".bx-header-settings-button");
  if (!$button) {
    const $rightHeader = document.querySelector("#PageContent div[class*=EdgewaterHeader-module__rightSectionSpacing]");
    injectSettingsButton($rightHeader);
  }
}
function watchHeader() {
  const $header = document.querySelector("#PageContent header");
  if (!$header) {
    return;
  }
  let timeout;
  const observer = new MutationObserver((mutationList) => {
    timeout && clearTimeout(timeout);
    timeout = window.setTimeout(checkHeader, 2000);
  });
  observer.observe($header, { subtree: true, childList: true });
  checkHeader();
}

// src/utils/utils.ts
function checkForUpdate() {
  const CHECK_INTERVAL_SECONDS = 7200;
  const currentVersion = getPref(PrefKey.CURRENT_VERSION);
  const lastCheck = getPref(PrefKey.LAST_UPDATE_CHECK);
  const now = Math.round(+new Date / 1000);
  if (currentVersion === SCRIPT_VERSION && now - lastCheck < CHECK_INTERVAL_SECONDS) {
    return;
  }
  setPref(PrefKey.LAST_UPDATE_CHECK, now);
  fetch("https://api.github.com/repos/redphx/better-xcloud/releases/latest").then((response) => response.json()).then((json) => {
    setPref(PrefKey.LATEST_VERSION, json.tag_name.substring(1));
    setPref(PrefKey.CURRENT_VERSION, SCRIPT_VERSION);
  });
}
function disablePwa() {
  const userAgent = (window.navigator.orgUserAgent || window.navigator.userAgent || "").toLowerCase();
  if (!userAgent) {
    return;
  }
  if (UserAgent.isSafari(true)) {
    Object.defineProperty(window.navigator, "standalone", {
      value: true
    });
  }
}

// src/modules/patcher.ts
var PATCHES = {
  disableAiTrack(str2) {
    const text = ".track=function(";
    const index = str2.indexOf(text);
    if (index === -1) {
      return false;
    }
    if (str2.substring(0, index + 200).includes('"AppInsightsCore')) {
      return false;
    }
    return str2.substring(0, index) + ".track=function(e){},!!function(" + str2.substring(index + text.length);
  },
  disableTelemetry(str2) {
    const text = ".disableTelemetry=function(){return!1}";
    if (!str2.includes(text)) {
      return false;
    }
    return str2.replace(text, ".disableTelemetry=function(){return!0}");
  },
  disableTelemetryProvider(str2) {
    const text = "this.enableLightweightTelemetry=!";
    if (!str2.includes(text)) {
      return false;
    }
    const newCode = [
      "this.trackEvent",
      "this.trackPageView",
      "this.trackHttpCompleted",
      "this.trackHttpFailed",
      "this.trackError",
      "this.trackErrorLike",
      "this.onTrackEvent",
      "()=>{}"
    ].join("=");
    return str2.replace(text, newCode + ";" + text);
  },
  disableIndexDbLogging(str2) {
    const text = "async addLog(e,t=1e4){";
    if (!str2.includes(text)) {
      return false;
    }
    return str2.replace(text, text + "return;");
  },
  tvLayout(str2) {
    const text = '?"tv":"default"';
    if (!str2.includes(text)) {
      return false;
    }
    return str2.replace(text, '?"tv":"tv"');
  },
  remotePlayDirectConnectUrl(str2) {
    const index = str2.indexOf("/direct-connect");
    if (index === -1) {
      return false;
    }
    return str2.replace(str2.substring(index - 9, index + 15), "https://www.xbox.com/play");
  },
  remotePlayKeepAlive(str2) {
    if (!str2.includes("onServerDisconnectMessage(e){")) {
      return false;
    }
    str2 = str2.replace("onServerDisconnectMessage(e){", `onServerDisconnectMessage(e) {
            const msg = JSON.parse(e);
            if (msg.reason === 'WarningForBeingIdle' && !window.location.pathname.includes('/launch/')) {
                try {
                    this.sendKeepAlive();
                    return;
                } catch (ex) { console.log(ex); }
            }
        `);
    return str2;
  },
  remotePlayConnectMode(str2) {
    const text = 'connectMode:"cloud-connect"';
    if (!str2.includes(text)) {
      return false;
    }
    return str2.replace(text, `connectMode:window.BX_REMOTE_PLAY_CONFIG?"xhome-connect":"cloud-connect",remotePlayServerId:(window.BX_REMOTE_PLAY_CONFIG&&window.BX_REMOTE_PLAY_CONFIG.serverId)||''`);
  },
  remotePlayGuideWorkaround(str2) {
    const text = "nexusButtonHandler:this.featureGates.EnableClientGuideInStream";
    if (!str2.includes(text)) {
      return false;
    }
    return str2.replace(text, `nexusButtonHandler: !window.BX_REMOTE_PLAY_CONFIG && this.featureGates.EnableClientGuideInStream`);
  },
  disableTrackEvent(str2) {
    const text = "this.trackEvent=";
    if (!str2.includes(text)) {
      return false;
    }
    return str2.replace(text, "this.trackEvent=e=>{},this.uwuwu=");
  },
  blockWebRtcStatsCollector(str2) {
    const text = "this.shouldCollectStats=!0";
    if (!str2.includes(text)) {
      return false;
    }
    return str2.replace(text, "this.shouldCollectStats=!1");
  },
  blockGamepadStatsCollector(str2) {
    const text = "this.inputPollingIntervalStats.addValue";
    if (!str2.includes(text)) {
      return false;
    }
    str2 = str2.replace("this.inputPollingIntervalStats.addValue", "");
    str2 = str2.replace("this.inputPollingDurationStats.addValue", "");
    return str2;
  },
  enableXcloudLogger(str2) {
    const text = "this.telemetryProvider=e}log(e,t,i){";
    if (!str2.includes(text)) {
      return false;
    }
    str2 = str2.replaceAll(text, text + "console.log(Array.from(arguments));");
    return str2;
  },
  enableConsoleLogging(str2) {
    const text = "static isConsoleLoggingAllowed(){";
    if (!str2.includes(text)) {
      return false;
    }
    str2 = str2.replaceAll(text, text + "return true;");
    return str2;
  },
  playVibration(str2) {
    const text = "}playVibration(e){";
    if (!str2.includes(text)) {
      return false;
    }
    const newCode = `
if (!window.BX_ENABLE_CONTROLLER_VIBRATION) {
return void(0);
}
if (window.BX_VIBRATION_INTENSITY && window.BX_VIBRATION_INTENSITY < 1) {
e.leftMotorPercent = e.leftMotorPercent * window.BX_VIBRATION_INTENSITY;
e.rightMotorPercent = e.rightMotorPercent * window.BX_VIBRATION_INTENSITY;
e.leftTriggerMotorPercent = e.leftTriggerMotorPercent * window.BX_VIBRATION_INTENSITY;
e.rightTriggerMotorPercent = e.rightTriggerMotorPercent * window.BX_VIBRATION_INTENSITY;
}
`;
    VibrationManager.updateGlobalVars();
    str2 = str2.replaceAll(text, text + newCode);
    return str2;
  },
  overrideSettings(str2) {
    const index = str2.indexOf(",EnableStreamGate:");
    if (index === -1) {
      return false;
    }
    const endIndex = str2.indexOf("},", index);
    const newSettings = [
      "PwaPrompt: false"
    ];
    const newCode = newSettings.join(",");
    str2 = str2.substring(0, endIndex) + "," + newCode + str2.substring(endIndex);
    return str2;
  },
  disableGamepadDisconnectedScreen(str2) {
    const index = str2.indexOf('"GamepadDisconnected_Title",');
    if (index === -1) {
      return false;
    }
    const constIndex = str2.indexOf("const", index - 30);
    str2 = str2.substring(0, constIndex) + "e.onClose();return null;" + str2.substring(constIndex);
    return str2;
  },
  patchUpdateInputConfigurationAsync(str2) {
    const text = "async updateInputConfigurationAsync(e){";
    if (!str2.includes(text)) {
      return false;
    }
    const newCode = "e.enableTouchInput = true;";
    str2 = str2.replace(text, text + newCode);
    return str2;
  },
  loadingEndingChunks(str2) {
    const text = 'Symbol("ChatSocketPlugin")';
    if (!str2.includes(text)) {
      return false;
    }
    console.log("[Better xCloud] Remaining patches:", PATCH_ORDERS);
    PATCH_ORDERS = PATCH_ORDERS.concat(PLAYING_PATCH_ORDERS);
    Patcher.cleanupPatches();
    return str2;
  },
  disableStreamGate(str2) {
    const index = str2.indexOf('case"partially-ready":');
    if (index === -1) {
      return false;
    }
    const bracketIndex = str2.indexOf("=>{", index - 150) + 3;
    str2 = str2.substring(0, bracketIndex) + "return 0;" + str2.substring(bracketIndex);
    return str2;
  },
  exposeTouchLayoutManager(str2) {
    const text = "this._perScopeLayoutsStream=new";
    if (!str2.includes(text)) {
      return false;
    }
    str2 = str2.replace(text, 'window.BX_EXPOSED["touch_layout_manager"] = this,' + text);
    return str2;
  },
  supportLocalCoOp(str2) {
    const text = "this.gamepadMappingsToSend=[],";
    if (!str2.includes(text)) {
      return false;
    }
    let patchstr = `
let match;
let onGamepadChangedStr = this.onGamepadChanged.toString();

onGamepadChangedStr = onGamepadChangedStr.replaceAll('0', 'arguments[1]');
eval(\`this.onGamepadChanged = function \${onGamepadChangedStr}\`);

let onGamepadInputStr = this.onGamepadInput.toString();

match = onGamepadInputStr.match(/(\\w+\\.GamepadIndex)/);
if (match) {
    const gamepadIndexVar = match[0];
    onGamepadInputStr = onGamepadInputStr.replace('this.gamepadStates.get(', \`this.gamepadStates.get(\${gamepadIndexVar},\`);
    eval(\`this.onGamepadInput = function \${onGamepadInputStr}\`);
    console.log('[Better xCloud] ✅ Successfully patched local co-op support');
} else {
    console.log('[Better xCloud] ❌ Unable to patch local co-op support');
}
`;
    const newCode = `true; ${patchstr}; true,`;
    str2 = str2.replace(text, text + newCode);
    return str2;
  },
  forceFortniteConsole(str2) {
    const text = "sendTouchInputEnabledMessage(e){";
    if (!str2.includes(text)) {
      return false;
    }
    const newCode = `window.location.pathname.includes('/launch/fortnite/') && (e = false);`;
    str2 = str2.replace(text, text + newCode);
    return str2;
  },
  disableTakRenderer(str2) {
    const text = "const{TakRenderer:";
    if (!str2.includes(text)) {
      return false;
    }
    let newCode = "";
    if (getPref(PrefKey.STREAM_TOUCH_CONTROLLER) === "off") {
      newCode = "return;";
    } else {
      newCode = `
const gamepads = window.navigator.getGamepads();
let gamepadFound = false;

for (let gamepad of gamepads) {
if (gamepad && gamepad.connected) {
    gamepadFound = true;
    break;
}
}

if (gamepadFound) {
return;
}
`;
    }
    str2 = str2.replace(text, newCode + text);
    return str2;
  },
  streamCombineSources(str2) {
    const text = "this.useCombinedAudioVideoStream=!!this.deviceInformation.isTizen";
    if (!str2.includes(text)) {
      return false;
    }
    str2 = str2.replace(text, "this.useCombinedAudioVideoStream=true");
    return str2;
  },
  patchStreamHud(str2) {
    const text = "let{onCollapse";
    if (!str2.includes(text)) {
      return false;
    }
    str2 = str2.replace(text, "e.guideUI = null;" + text);
    if (getPref(PrefKey.STREAM_TOUCH_CONTROLLER) === "off") {
      str2 = str2.replace(text, "e.canShowTakHUD = false;" + text);
    }
    return str2;
  },
  broadcastPollingMode(str2) {
    const text = ".setPollingMode=e=>{";
    if (!str2.includes(text)) {
      return false;
    }
    const newCode = `
window.BX_EXPOSED.onPollingModeChanged && window.BX_EXPOSED.onPollingModeChanged(e);
`;
    str2 = str2.replace(text, text + newCode);
    return str2;
  }
};
var PATCH_ORDERS = [
  getPref(PrefKey.BLOCK_TRACKING) && [
    "disableAiTrack",
    "disableTelemetry"
  ],
  ["disableStreamGate"],
  ["broadcastPollingMode"],
  getPref(PrefKey.UI_LAYOUT) === "tv" && ["tvLayout"],
  BX_FLAGS.EnableXcloudLogging && [
    "enableConsoleLogging",
    "enableXcloudLogger"
  ],
  getPref(PrefKey.LOCAL_CO_OP_ENABLED) && ["supportLocalCoOp"],
  getPref(PrefKey.BLOCK_TRACKING) && [
    "blockWebRtcStatsCollector",
    "disableIndexDbLogging"
  ],
  getPref(PrefKey.BLOCK_TRACKING) && [
    "disableTelemetryProvider",
    "disableTrackEvent"
  ],
  getPref(PrefKey.REMOTE_PLAY_ENABLED) && ["remotePlayKeepAlive"],
  getPref(PrefKey.REMOTE_PLAY_ENABLED) && ["remotePlayDirectConnectUrl"],
  [
    "overrideSettings"
  ],
  getPref(PrefKey.REMOTE_PLAY_ENABLED) && STATES.hasTouchSupport && ["patchUpdateInputConfigurationAsync"],
  getPref(PrefKey.GAME_FORTNITE_FORCE_CONSOLE) && ["forceFortniteConsole"]
];
var PLAYING_PATCH_ORDERS = [
  getPref(PrefKey.REMOTE_PLAY_ENABLED) && ["remotePlayConnectMode"],
  getPref(PrefKey.REMOTE_PLAY_ENABLED) && ["remotePlayGuideWorkaround"],
  ["patchStreamHud"],
  ["playVibration"],
  STATES.hasTouchSupport && getPref(PrefKey.STREAM_TOUCH_CONTROLLER) === "all" && ["exposeTouchLayoutManager"],
  STATES.hasTouchSupport && (getPref(PrefKey.STREAM_TOUCH_CONTROLLER) === "off" || getPref(PrefKey.STREAM_TOUCH_CONTROLLER_AUTO_OFF)) && ["disableTakRenderer"],
  BX_FLAGS.EnableXcloudLogging && ["enableConsoleLogging"],
  getPref(PrefKey.BLOCK_TRACKING) && ["blockGamepadStatsCollector"],
  [
    "disableGamepadDisconnectedScreen"
  ],
  getPref(PrefKey.STREAM_COMBINE_SOURCES) && ["streamCombineSources"]
];

class Patcher {
  static #patchFunctionBind() {
    const nativeBind = Function.prototype.bind;
    Function.prototype.bind = function() {
      let valid = false;
      if (this.name.length <= 2 && arguments.length === 2 && arguments[0] === null) {
        if (arguments[1] === 0 || typeof arguments[1] === "function") {
          valid = true;
        }
      }
      if (!valid) {
        return nativeBind.apply(this, arguments);
      }
      if (typeof arguments[1] === "function") {
        console.log("[Better xCloud] Restored Function.prototype.bind()");
        Function.prototype.bind = nativeBind;
      }
      const orgFunc = this;
      const newFunc = (a, item2) => {
        if (Patcher.length() === 0) {
          orgFunc(a, item2);
          return;
        }
        Patcher.patch(item2);
        orgFunc(a, item2);
      };
      return nativeBind.apply(newFunc, arguments);
    };
  }
  static length() {
    return PATCH_ORDERS.length;
  }
  static patch(item) {
    let appliedPatches;
    for (let id in item[1]) {
      if (PATCH_ORDERS.length <= 0) {
        return;
      }
      appliedPatches = [];
      const func = item[1][id];
      let str = func.toString();
      for (let groupIndex = 0;groupIndex < PATCH_ORDERS.length; groupIndex++) {
        const group = PATCH_ORDERS[groupIndex];
        let modified = false;
        for (let patchIndex = 0;patchIndex < group.length; patchIndex++) {
          const patchName = group[patchIndex];
          if (appliedPatches.indexOf(patchName) > -1) {
            continue;
          }
          const patchedstr = PATCHES[patchName].call(null, str);
          if (!patchedstr) {
            if (patchIndex === 0) {
              break;
            } else {
              continue;
            }
          }
          modified = true;
          str = patchedstr;
          console.log(`[Better xCloud] Applied "${patchName}" patch`);
          appliedPatches.push(patchName);
          group.splice(patchIndex, 1);
          patchIndex--;
        }
        if (modified) {
          item[1][id] = eval(str);
        }
        if (!group.length) {
          PATCH_ORDERS.splice(groupIndex, 1);
          groupIndex--;
        }
      }
    }
  }
  static cleanupPatches() {
    for (let groupIndex2 = PATCH_ORDERS.length - 1;groupIndex2 >= 0; groupIndex2--) {
      const group2 = PATCH_ORDERS[groupIndex2];
      if (group2 === false) {
        PATCH_ORDERS.splice(groupIndex2, 1);
        continue;
      }
      for (let patchIndex = group2.length - 1;patchIndex >= 0; patchIndex--) {
        const patchName = group2[patchIndex];
        if (!PATCHES[patchName]) {
          group2.splice(patchIndex, 1);
        }
      }
      if (!group2.length) {
        PATCH_ORDERS.splice(groupIndex2, 1);
      }
    }
  }
  static initialize() {
    if (window.location.pathname.includes("/play/")) {
      PATCH_ORDERS = PATCH_ORDERS.concat(PLAYING_PATCH_ORDERS);
    } else {
      PATCH_ORDERS.push(["loadingEndingChunks"]);
    }
    Patcher.cleanupPatches();
    Patcher.#patchFunctionBind();
  }
}

// src/utils/history.ts
function patchHistoryMethod(type) {
  const orig = window.history[type];
  return function(...args) {
    BxEvent.dispatch(window, BxEvent.POPSTATE, {
      arguments: args
    });
    return orig.apply(this, arguments);
  };
}
function onHistoryChanged(e) {
  if (e && e.arguments && e.arguments[0] && e.arguments[0].origin === "better-xcloud") {
    return;
  }
  window.setTimeout(RemotePlay.detect, 10);
  const $settings = document.querySelector(".bx-settings-container");
  if ($settings) {
    $settings.classList.add("bx-gone");
  }
  RemotePlay.detachPopup();
  LoadingScreen.reset();
  window.setTimeout(checkHeader, 2000);
  BxEvent.dispatch(window, BxEvent.STREAM_STOPPED);
}

// src/utils/monkey-patches.ts
function patchVideoApi() {
  const PREF_SKIP_SPLASH_VIDEO = getPref(PrefKey.SKIP_SPLASH_VIDEO);
  const showFunc = function() {
    this.style.visibility = "visible";
    this.removeEventListener("playing", showFunc);
    if (!this.videoWidth) {
      return;
    }
    BxEvent.dispatch(window, BxEvent.STREAM_PLAYING, {
      $video: this
    });
  };
  const nativePlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function() {
    if (this.className && this.className.startsWith("XboxSplashVideo")) {
      if (PREF_SKIP_SPLASH_VIDEO) {
        this.volume = 0;
        this.style.display = "none";
        this.dispatchEvent(new Event("ended"));
        return new Promise(() => {
        });
      }
      return nativePlay.apply(this);
    }
    if (!!this.src) {
      return nativePlay.apply(this);
    }
    this.addEventListener("playing", showFunc);
    return nativePlay.apply(this);
  };
}
function patchRtcCodecs() {
  const codecProfile = getPref(PrefKey.STREAM_CODEC_PROFILE);
  if (codecProfile === "default") {
    return;
  }
  if (typeof RTCRtpTransceiver === "undefined" || !("setCodecPreferences" in RTCRtpTransceiver.prototype)) {
    return false;
  }
  const profilePrefix = codecProfile === "high" ? "4d" : codecProfile === "low" ? "420" : "42e";
  const profileLevelId = `profile-level-id=${profilePrefix}`;
  const nativeSetCodecPreferences = RTCRtpTransceiver.prototype.setCodecPreferences;
  RTCRtpTransceiver.prototype.setCodecPreferences = function(codecs) {
    const newCodecs = codecs.slice();
    let pos = 0;
    newCodecs.forEach((codec, i) => {
      if (codec.sdpFmtpLine && codec.sdpFmtpLine.includes(profileLevelId)) {
        newCodecs.splice(i, 1);
        newCodecs.splice(pos, 0, codec);
        ++pos;
      }
    });
    try {
      nativeSetCodecPreferences.apply(this, [newCodecs]);
    } catch (e) {
      console.log(e);
      nativeSetCodecPreferences.apply(this, [codecs]);
    }
  };
}
function patchRtcPeerConnection() {
  const nativeCreateDataChannel = RTCPeerConnection.prototype.createDataChannel;
  RTCPeerConnection.prototype.createDataChannel = function() {
    const dataChannel = nativeCreateDataChannel.apply(this, arguments);
    BxEvent.dispatch(window, BxEvent.DATA_CHANNEL_CREATED, {
      dataChannel
    });
    return dataChannel;
  };
  const OrgRTCPeerConnection = window.RTCPeerConnection;
  window.RTCPeerConnection = function() {
    const conn = new OrgRTCPeerConnection;
    STATES.currentStream.peerConnection = conn;
    conn.addEventListener("connectionstatechange", (e) => {
      if (conn.connectionState === "connecting") {
        STATES.currentStream.audioGainNode = null;
      }
      console.log("connectionState", conn.connectionState);
    });
    return conn;
  };
}
function patchAudioContext() {
  if (UserAgent.isSafari(true)) {
    const nativeCreateGain = window.AudioContext.prototype.createGain;
    window.AudioContext.prototype.createGain = function() {
      const gainNode = nativeCreateGain.apply(this);
      gainNode.gain.value = getPref(PrefKey.AUDIO_VOLUME) / 100;
      STATES.currentStream.audioGainNode = gainNode;
      return gainNode;
    };
  }
  const OrgAudioContext = window.AudioContext;
  window.AudioContext = function() {
    const ctx = new OrgAudioContext;
    STATES.currentStream.audioContext = ctx;
    STATES.currentStream.audioGainNode = null;
    return ctx;
  };
  const nativePlay = HTMLAudioElement.prototype.play;
  HTMLAudioElement.prototype.play = function() {
    this.muted = true;
    const promise = nativePlay.apply(this);
    if (STATES.currentStream.audioGainNode) {
      return promise;
    }
    this.addEventListener("playing", (e) => e.target.pause());
    const audioCtx = STATES.currentStream.audioContext;
    const audioStream = audioCtx.createMediaStreamSource(this.srcObject);
    const gainNode = audioCtx.createGain();
    audioStream.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = getPref(PrefKey.AUDIO_VOLUME) / 100;
    STATES.currentStream.audioGainNode = gainNode;
    return promise;
  };
}

// src/index.ts
var main = function() {
  patchRtcPeerConnection();
  patchRtcCodecs();
  interceptHttpRequests();
  patchVideoApi();
  if (getPref(PrefKey.AUDIO_ENABLE_VOLUME_CONTROL)) {
    patchAudioContext();
  }
  PreloadedState.override();
  VibrationManager.initialSetup();
  BX_FLAGS.CheckForUpdate && checkForUpdate();
  addCss();
  Toast.setup();
  BX_FLAGS.PreloadUi && setupBxUi();
  StreamBadges.setupEvents();
  StreamStats.setupEvents();
  MkbHandler.setupEvents();
  Patcher.initialize();
  disablePwa();
  window.addEventListener("gamepadconnected", (e) => showGamepadToast(e.gamepad));
  window.addEventListener("gamepaddisconnected", (e) => showGamepadToast(e.gamepad));
  if (getPref(PrefKey.REMOTE_PLAY_ENABLED)) {
    RemotePlay.detect();
  }
  if (getPref(PrefKey.STREAM_TOUCH_CONTROLLER) === "all") {
    TouchController.setup();
  }
};
if (window.location.pathname.includes("/auth/msa")) {
  window.addEventListener("load", (e) => {
    window.location.search.includes("loggedIn") && window.setTimeout(() => {
      const location2 = window.location;
      location2.pathname.includes("/play") && location2.reload(true);
    }, 2000);
  });
  throw new Error("[Better xCloud] Refreshing the page after logging in");
}
console.log(`[Better xCloud] readyState: ${document.readyState}`);
if (BX_FLAGS.SafariWorkaround && document.readyState !== "loading") {
  window.stop();
  const css2 = `
.bx-reload-overlay {
    position: fixed;
    top: 0;
    background: #000000cc;
    z-index: 9999;
    width: 100%;
    line-height: 100vh;
    color: #fff;
    text-align: center;
    font-weight: 400;
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 1.3rem;
}
`;
  const $fragment = document.createDocumentFragment();
  $fragment.appendChild(CE("style", {}, css2));
  $fragment.appendChild(CE("div", { class: "bx-reload-overlay" }, t("safari-failed-message")));
  document.documentElement.appendChild($fragment);
  window.location.reload(true);
  throw new Error("[Better xCloud] Executing workaround for Safari");
}
window.addEventListener("load", (e) => {
  window.setTimeout(() => {
    if (document.body.classList.contains("legacyBackground")) {
      window.stop();
      window.location.reload(true);
    }
  }, 3000);
});
window.BX_EXPOSED = BxExposed;
window.addEventListener(BxEvent.POPSTATE, onHistoryChanged);
window.addEventListener("popstate", onHistoryChanged);
window.history.pushState = patchHistoryMethod("pushState");
window.history.replaceState = patchHistoryMethod("replaceState");
window.addEventListener(BxEvent.XCLOUD_SERVERS_READY, (e) => {
  if (document.querySelector("div[class^=UnsupportedMarketPage]")) {
    window.setTimeout(watchHeader, 2000);
  } else {
    watchHeader();
  }
});
window.addEventListener(BxEvent.STREAM_LOADING, (e) => {
  if (window.location.pathname.includes("/launch/")) {
    const matches = /\/launch\/(?<title_id>[^\/]+)\/(?<product_id>\w+)/.exec(window.location.pathname);
    if (matches?.groups) {
      STATES.currentStream.titleId = matches.groups.title_id;
      STATES.currentStream.productId = matches.groups.product_id;
    }
  } else {
    STATES.currentStream.titleId = "remote-play";
    STATES.currentStream.productId = "";
  }
  setupBxUi();
  getPref(PrefKey.UI_LOADING_SCREEN_GAME_ART) && LoadingScreen.setup();
});
window.addEventListener(BxEvent.STREAM_STARTING, (e) => {
  LoadingScreen.hide();
  if (!getPref(PrefKey.MKB_ENABLED) && getPref(PrefKey.MKB_HIDE_IDLE_CURSOR)) {
    MouseCursorHider.start();
    MouseCursorHider.hide();
  }
});
window.addEventListener(BxEvent.STREAM_PLAYING, (e) => {
  const $video = e.$video;
  STATES.currentStream.$video = $video;
  STATES.isPlaying = true;
  injectStreamMenuButtons();
  const PREF_SCREENSHOT_BUTTON_POSITION = getPref(PrefKey.SCREENSHOT_BUTTON_POSITION);
  STATES.currentStream.$screenshotCanvas.width = $video.videoWidth;
  STATES.currentStream.$screenshotCanvas.height = $video.videoHeight;
  updateVideoPlayerCss();
  if (PREF_SCREENSHOT_BUTTON_POSITION !== "none") {
    const $btn = document.querySelector(".bx-screenshot-button");
    $btn.style.display = "block";
    if (PREF_SCREENSHOT_BUTTON_POSITION === "bottom-right") {
      $btn.style.right = "0";
    } else {
      $btn.style.left = "0";
    }
  }
});
window.addEventListener(BxEvent.STREAM_ERROR_PAGE, (e) => {
  BxEvent.dispatch(window, BxEvent.STREAM_STOPPED);
});
window.addEventListener(BxEvent.STREAM_STOPPED, (e) => {
  if (!STATES.isPlaying) {
    return;
  }
  STATES.isPlaying = false;
  getPref(PrefKey.MKB_ENABLED) && MkbHandler.INSTANCE.destroy();
  const $quickBar = document.querySelector(".bx-quick-settings-bar");
  if ($quickBar) {
    $quickBar.classList.add("bx-gone");
  }
  STATES.currentStream.audioGainNode = null;
  STATES.currentStream.$video = null;
  StreamStats.onStoppedPlaying();
  const $screenshotBtn = document.querySelector(".bx-screenshot-button");
  if ($screenshotBtn) {
    $screenshotBtn.removeAttribute("style");
  }
  MouseCursorHider.stop();
  TouchController.reset();
});
main();