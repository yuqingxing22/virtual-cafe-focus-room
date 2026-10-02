import { useEffect, useMemo, useRef, useState } from "react";
import {
  Armchair,
  BookOpen,
  Check,
  Clock3,
  CloudRain,
  Coffee,
  DoorOpen,
  Keyboard,
  Laptop,
  MessageCircle,
  Music,
  Pause,
  Play,
  Radio,
  Square,
  TimerReset,
  Volume2,
  VolumeX,
} from "lucide-react";

const DRINKS = [
  {
    id: "iced-latte",
    name: { en: "Iced Latte", zh: "冰拿铁" },
    note: { en: "cool, steady, familiar", zh: "凉一点，稳定熟悉" },
  },
  {
    id: "americano",
    name: { en: "Americano", zh: "美式咖啡" },
    note: { en: "clear and direct", zh: "清醒、直接" },
  },
  {
    id: "matcha",
    name: { en: "Matcha Latte", zh: "抹茶拿铁" },
    note: { en: "soft energy", zh: "柔和的能量" },
  },
  {
    id: "cappuccino",
    name: { en: "Cappuccino", zh: "卡布奇诺" },
    note: { en: "warm and classic", zh: "温热、经典" },
  },
  {
    id: "water",
    name: { en: "Water", zh: "今天只喝水" },
    note: { en: "simple and light", zh: "简单、轻一点" },
  },
];

const SEATS = [
  {
    id: "window",
    name: { en: "Window Seat", zh: "窗边座位" },
    label: { en: "Reading / writing", zh: "阅读 / 写作" },
    description: {
      en: "Rain at the glass, soft street movement, lighter voices.",
      zh: "窗外有雨声和街景，人声更轻，适合慢慢进入状态。",
    },
    icon: BookOpen,
    layers: {
      cafe: 0.4,
      rain: 0.55,
      keys: 0.16,
      cups: 0.16,
      traffic: 0.36,
      backCounter: 0.04,
      jazz: 0.08,
    },
  },
  {
    id: "corner",
    name: { en: "Corner Table", zh: "角落小桌" },
    label: { en: "Deep work", zh: "深度工作" },
    description: {
      en: "A quieter table with low café hum and fewer interruptions.",
      zh: "偏安静的位置，咖啡厅背景声低一点，不容易被打断。",
    },
    icon: Armchair,
    layers: {
      cafe: 0.5,
      rain: 0.18,
      keys: 0.24,
      cups: 0.14,
      traffic: 0,
      backCounter: 0.08,
      jazz: 0,
    },
  },
  {
    id: "bar",
    name: { en: "Bar Seat", zh: "吧台座位" },
    label: { en: "Short tasks", zh: "短任务" },
    description: {
      en: "More cup sounds, nearby footsteps, and light motion.",
      zh: "杯子声和脚步声更明显，适合处理短任务或快速开始。",
    },
    icon: Coffee,
    layers: {
      cafe: 0.58,
      rain: 0.08,
      keys: 0.28,
      cups: 0.42,
      traffic: 0.04,
      backCounter: 0.42,
      jazz: 0.32,
    },
  },
  {
    id: "quiet",
    name: { en: "Quiet Zone", zh: "安静区" },
    label: { en: "Exam review", zh: "复习 / 高强度专注" },
    description: {
      en: "Muted room tone, almost no chatter, a steady focus bed.",
      zh: "人声很少，白噪音更稳定，适合考试复习或高强度专注。",
    },
    icon: Laptop,
    layers: {
      cafe: 0.28,
      rain: 0.12,
      keys: 0.12,
      cups: 0.08,
      traffic: 0,
      backCounter: 0,
      jazz: 0,
    },
  },
];

const DURATIONS = [25, 45, 60, 90];
const joinUrlPath = (base, path) => {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${path.replace(/^\/+/, "")}`;
};

const assetPath = (path) => joinUrlPath(import.meta.env.BASE_URL, path);
const audioPath = (path) => {
  const audioBase = import.meta.env.VITE_AUDIO_BASE_URL?.trim();
  return audioBase ? joinUrlPath(audioBase, path) : assetPath(path);
};
const DEFAULT_BACKDROP = assetPath("assets/cafe-room.png");

const SCENE_MEDIA = {
  entrance: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/entrance/01.png"),
      assetPath("assets/scenes/entrance/02.png"),
      assetPath("assets/scenes/entrance/03.png"),
    ],
  },
  order: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/order/01.png"),
      assetPath("assets/scenes/order/02.png"),
      assetPath("assets/scenes/order/03.png"),
    ],
  },
  seat: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/seat-selection/01.png"),
      assetPath("assets/scenes/seat-selection/02.png"),
      assetPath("assets/scenes/seat-selection/03.png"),
    ],
  },
  setup: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/setup/01.png"),
      assetPath("assets/scenes/setup/02.png"),
      assetPath("assets/scenes/setup/03.png"),
    ],
  },
  focus_window: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/focus-window/01.png"),
      assetPath("assets/scenes/focus-window/02.png"),
      assetPath("assets/scenes/focus-window/03.png"),
    ],
  },
  focus_bar: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/focus-bar/01.png"),
      assetPath("assets/scenes/focus-bar/02.png"),
      assetPath("assets/scenes/focus-bar/03.png"),
    ],
  },
  focus_corner: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/focus-corner/01.png"),
      assetPath("assets/scenes/focus-corner/02.png"),
      assetPath("assets/scenes/focus-corner/03.png"),
    ],
  },
  focus_quiet: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/focus-quiet/01.png"),
      assetPath("assets/scenes/focus-quiet/02.png"),
      assetPath("assets/scenes/focus-quiet/03.png"),
    ],
  },
  complete: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/complete/01.png"),
      assetPath("assets/scenes/complete/02.png"),
      assetPath("assets/scenes/complete/03.png"),
    ],
  },
};

const getSceneMediaKey = (scene, seatId) => {
  if (scene === "focus") return `focus_${seatId ?? "corner"}`;
  if (SCENE_MEDIA[scene]) return scene;
  return "entrance";
};

const STATUS_MESSAGES = [
  {
    en: "Someone nearby is typing quietly.",
    zh: "旁边有人在安静地敲键盘。",
  },
  {
    en: "The barista sets your drink on the table.",
    zh: "咖啡师把你的饮品轻轻放到桌上。",
  },
  {
    en: "A student by the window turns a page.",
    zh: "窗边的学生翻过一页书。",
  },
  {
    en: "The café feels calm. Stay with your task.",
    zh: "咖啡厅很安静，继续留在你的任务里。",
  },
  {
    en: "People around you are settling into their work.",
    zh: "周围的人也慢慢进入了工作状态。",
  },
  {
    en: "Your seat is waiting. Return to one small step.",
    zh: "你的座位还在这里。先回到一个很小的步骤。",
  },
];

const PAUSE_INTERVENTIONS = {
  window: {
    speaker: { en: "Reader by the window", zh: "窗边顾客" },
    line: { en: "You looked very focused earlier.", zh: "刚才看你一直很认真。" },
    thought: {
      en: (task) => `I came here for “${task}.” I can return to one small step now.`,
      zh: (task) => `既然之前已经坐下来认真开始了，现在先不要散掉。回到“${task}”的下一小步。`,
    },
  },
  corner: {
    speaker: { en: "Person at the next table", zh: "旁桌顾客" },
    line: { en: "The room is still quiet.", zh: "这里还是挺安静的。" },
    thought: {
      en: (task) => `I am not at home drifting away. I am here, and “${task}” is still the next thing.`,
      zh: (task) => `我不是在家里躺着。我已经在这里坐下了。现在回到“${task}”。`,
    },
  },
  bar: {
    speaker: { en: "Barista", zh: "咖啡师" },
    line: { en: "Your cup is still here. Take your time.", zh: "你的杯子还在这边。慢慢来。" },
    thought: {
      en: (task) => `I have already arrived. Continue “${task}” with one small step.`,
      zh: (task) => `我已经来到这里了。继续完成“${task}”，先做一个很小的步骤。`,
    },
  },
  quiet: {
    speaker: { en: "Me", zh: "我" },
    line: { en: "This seat is still holding the space for me.", zh: "这个座位还在替我留住空间。" },
    thought: {
      en: (task) => `I am already here. Return to “${task}” before the thread disappears.`,
      zh: (task) => `我已经在这里了。趁线索还没有断，先回到“${task}”。`,
    },
  },
};

const COPY = {
  en: {
    appName: "Virtual Café Focus Room",
    languageLabel: "Language",
    currentScene: "Current scene",
    entranceEyebrow: "Café Mode",
    entranceTitle: "Virtual Café Focus Room",
    entranceLead:
      "Step out of home mode. Enter a quiet public space, order something simple, choose a seat, and let the room carry you into one focused session.",
    enterCafe: "Enter the Café",
    presenceAria: "Café ambience",
    presence: ["door bell", "low voices", "cups on wood"],
    orderEyebrow: "At the counter",
    orderTitle: "Order something and arrive.",
    barista: "Barista",
    baristaGreeting: "Hi, welcome in. What can I get started for you?",
    baristaResponse: "Great choice. Find a seat and I’ll bring it over.",
    chooseSeat: "Choose a seat",
    seatEyebrow: "Find your table",
    seatTitle: "Choose the kind of public quiet you need.",
    back: "Back",
    sitDown: "Sit down",
    setupEyebrow: (seatName) => `At your ${seatName?.toLowerCase() ?? "table"}`,
    setupTitle: "What are you here to focus on?",
    taskLabel: "Current task",
    taskPlaceholder: "read one paper, clean data, write introduction...",
    durationAria: "Focus duration",
    minuteShort: "min",
    customDuration: "Custom",
    ritualPhone: "Put my phone away",
    ritualLaptop: "Open my laptop",
    minutes: "minutes",
    startWorking: "Start Working",
    remainingAria: (time) => `Remaining time ${time}`,
    pause: "Pause",
    resume: "Resume",
    end: "End",
    innerThought: "Inner thought",
    returnToTask: "Return to task",
    detailsAria: "Session details and ambience",
    drink: "Drink",
    roomTone: "Room tone",
    ambienceOn: "Ambience on",
    startAmbience: "Start ambience",
    soundLabels: {
      cafe: "Café ambience",
      rain: "Rain",
      keys: "Typing",
      cups: "Cups / stir",
      traffic: "Street outside",
      backCounter: "Back counter",
      jazz: "Soft jazz",
    },
    trafficModeLabel: "Traffic intensity",
    trafficModes: {
      light: "Light",
      heavy: "Heavy",
    },
    jazzModeLabel: "Jazz mood",
    jazzModes: {
      cafe: "Cafe",
      swing: "Swing",
      club: "Club",
      youtube: "YouTube",
    },
    youtubeLabel: "YouTube station",
    youtubeStationsAria: "YouTube stations",
    youtubeCustom: "My link",
    youtubePaste: "Paste a YouTube link",
    youtubeUse: "Play",
    youtubeInvalid: "That doesn't look like a YouTube video link.",
    youtubeNote: "Volume follows the slider above. YouTube may play ads.",
    youtubeIdle: "Start ambience to play this station.",
    youtubeUnavailable:
      "This video can't play here. The owner may block other sites, or the stream has ended. Try another station or link.",
    sessionComplete: "Session complete",
    sessionEnded: "Session ended",
    stayedWith: (task) => `You stayed with “${task}.”`,
    completedLine: (minutes) => `You worked for ${minutes} minutes. That counts.`,
    endedLine: "Your table is still here when you want to come back.",
    visitAgain: "Visit again",
    visitEyebrow: (n) => `Welcome back · visit ${n}`,
    stampCard: "Stamp card",
    cardNumber: (n) => `card ${n}`,
    stampsAria: (filled, total) => `${filled} of ${total} stamps`,
    visitTotal: (n) => (n === 1 ? "1 visit" : `${n} visits`),
    totalFocused: (time) => `${time} focused in all`,
    stampEarned: "One more stamp on your card.",
    stampMissed: "Stamps come with 10 minutes or a finished session.",
    cardFull: "Card complete. A fresh one next time.",
    hoursMinutes: (h, m) => (m ? `${h} h ${m} min` : `${h} h`),
    minutesOnly: (m) => `${m} min`,
  },
  zh: {
    appName: "云咖啡馆专注室",
    languageLabel: "语言",
    currentScene: "当前步骤",
    entranceEyebrow: "咖啡馆模式",
    entranceTitle: "云咖啡馆专注室",
    entranceLead:
      "先离开在家的状态。进入一个安静的公共空间，点一杯东西，选一个座位，然后让这个环境把你带进一次专注。",
    enterCafe: "推门进入",
    presenceAria: "咖啡馆氛围",
    presence: ["门铃声", "低声交谈", "杯子碰到木桌"],
    orderEyebrow: "在吧台前",
    orderTitle: "点一杯东西，让自己真正到达这里。",
    barista: "咖啡师",
    baristaGreeting: "你好，欢迎光临。今天想喝点什么？",
    baristaResponse: "好的，找个座位坐下吧，我一会儿给你送过去。",
    chooseSeat: "去选座位",
    seatEyebrow: "找个位置",
    seatTitle: "选择你今天需要的公共安静感。",
    back: "返回",
    sitDown: "坐下来",
    setupEyebrow: (seatName) => `你坐在${seatName ?? "座位"}上`,
    setupTitle: "你今天来这里专注什么？",
    taskLabel: "当前任务",
    taskPlaceholder: "读一篇论文、清理数据、写 introduction...",
    durationAria: "专注时长",
    minuteShort: "分钟",
    customDuration: "自定义",
    ritualPhone: "把手机放远一点",
    ritualLaptop: "打开电脑",
    minutes: "分钟",
    startWorking: "开始专注",
    remainingAria: (time) => `剩余时间 ${time}`,
    pause: "暂停",
    resume: "继续",
    end: "结束",
    innerThought: "我心想",
    returnToTask: "回到任务",
    detailsAria: "本次专注和环境音",
    drink: "饮品",
    roomTone: "座位氛围",
    ambienceOn: "环境音已开启",
    startAmbience: "开启环境音",
    soundLabels: {
      cafe: "咖啡厅氛围",
      rain: "雨声",
      keys: "键盘声",
      cups: "杯子 / 搅拌声",
      traffic: "窗外街声",
      backCounter: "后厨咖啡声",
      jazz: "轻爵士",
    },
    trafficModeLabel: "街声强度",
    trafficModes: {
      light: "轻街声",
      heavy: "重交通",
    },
    jazzModeLabel: "爵士氛围",
    jazzModes: {
      cafe: "咖啡馆",
      swing: "摇摆",
      club: "小酒馆",
      youtube: "YouTube",
    },
    youtubeLabel: "YouTube 电台",
    youtubeStationsAria: "YouTube 电台列表",
    youtubeCustom: "我的链接",
    youtubePaste: "粘贴一个 YouTube 链接",
    youtubeUse: "播放",
    youtubeInvalid: "这个看起来不是 YouTube 视频链接。",
    youtubeNote: "音量跟随上面的滑块。YouTube 可能会插播广告。",
    youtubeIdle: "开启环境音后开始播放。",
    youtubeUnavailable: "这个视频无法在这里播放，可能是作者禁止了外站播放，或者直播已经结束。换一个电台或链接试试。",
    sessionComplete: "专注完成",
    sessionEnded: "专注结束",
    stayedWith: (task) => `你刚才一直和“${task}”待在一起。`,
    completedLine: (minutes) => `你专注了 ${minutes} 分钟。这已经算数。`,
    endedLine: "你的座位还在这里。想回来时可以再回来。",
    visitAgain: "下次再来",
    visitEyebrow: (n) => `欢迎回来 · 第 ${n} 次来`,
    stampCard: "集点卡",
    cardNumber: (n) => `第 ${n} 张`,
    stampsAria: (filled, total) => `已集 ${filled} 个章，共 ${total} 格`,
    visitTotal: (n) => `已来过 ${n} 次`,
    totalFocused: (time) => `累计专注 ${time}`,
    stampEarned: "卡上多了一个章。",
    stampMissed: "专注满 10 分钟或完成一次就能盖章。",
    cardFull: "这张卡集满了，下次换一张新的。",
    hoursMinutes: (h, m) => (m ? `${h} 小时 ${m} 分钟` : `${h} 小时`),
    minutesOnly: (m) => `${m} 分钟`,
  },
};

const AMBIENT_TRACKS = [
  { key: "cafe", layerKey: "cafe", src: audioPath("audio/cafe-ambience.mp3"), maxVolume: 0.55 },
  { key: "rain", layerKey: "rain", src: audioPath("audio/rain.mp3"), maxVolume: 0.48 },
  { key: "keys", layerKey: "keys", src: audioPath("audio/typing.mp3"), maxVolume: 0.36 },
  { key: "cups", layerKey: "cups", src: audioPath("audio/coffee-stir.mp3"), maxVolume: 0.42 },
  {
    key: "trafficLight",
    layerKey: "traffic",
    modeGroup: "traffic",
    mode: "light",
    src: audioPath("audio/light-traffic.m4a"),
    maxVolume: 0.38,
  },
  {
    key: "trafficHeavy",
    layerKey: "traffic",
    modeGroup: "traffic",
    mode: "heavy",
    src: audioPath("audio/heavy-traffic.m4a"),
    maxVolume: 0.34,
  },
  {
    key: "backCounter",
    layerKey: "backCounter",
    src: audioPath("audio/back-counter-coffee.mp3"),
    maxVolume: 0.36,
  },
];

const JAZZ_PLAYLISTS = {
  cafe: [
    audioPath("audio/jazz/cafe/01-jazz-cafe.mp3"),
    audioPath("audio/jazz/cafe/02-jazz-elegant.mp3"),
    audioPath("audio/jazz/cafe/03-jazz-4.mp3"),
  ],
  swing: [
    audioPath("audio/jazz/swing/01-jazz-cafe-2.mp3"),
    audioPath("audio/jazz/swing/02-jazz-music-3.mp3"),
    audioPath("audio/jazz/swing/03-jazz.mp3"),
    audioPath("audio/jazz/swing/04-jazz-2.mp3"),
    audioPath("audio/jazz/swing/05-jazz-music-2.mp3"),
  ],
  club: [
    audioPath("audio/jazz/club/01-jazz-club.mp3"),
    audioPath("audio/jazz/club/02-west-coast-jazz.mp3"),
    audioPath("audio/jazz/club/03-jazz-4.mp3"),
  ],
};

const getJazzPlaylist = (mode) => JAZZ_PLAYLISTS[mode] ?? JAZZ_PLAYLISTS.cafe;

const JAZZ_MODES = ["cafe", "swing", "club", "youtube"];

// 24/7 live streams, verified to play inside an embedded player on 2026-10-02.
// Live stream IDs change when a channel restarts a stream; re-check if one stops working.
// Users can also paste any YouTube link.
const YOUTUBE_STATIONS = [
  { id: "Dx5qFachd3A", name: { en: "Jazz piano", zh: "爵士钢琴" } },
  { id: "fEvM-OUbaKs", name: { en: "Coffee jazz", zh: "咖啡爵士" } },
  { id: "E2vONfzoyRI", name: { en: "Jazz lofi", zh: "爵士 lofi" } },
  { id: "5yx6BWlEVcY", name: { en: "Lofi beats", zh: "lofi 节拍" } },
];

// Old preset IDs that were saved in visitors' browsers but no longer play embedded.
const RETIRED_YOUTUBE_IDS = {
  HuFYqnbVbzY: "E2vONfzoyRI",
  jfKfPfyJRdk: "5yx6BWlEVcY",
};

// IFrame API error codes: 2 bad id, 5 HTML5 error, 100 removed/private, 101/150 embedding blocked.
const YOUTUBE_ERROR_CODES = [2, 5, 100, 101, 150];

// YouTube volume is 0-100 and much louder than the ambience beds, so cap it.
const YOUTUBE_MAX_VOLUME = 55;

const parseYouTubeId = (input) => {
  const value = input.trim();
  const isId = (id) => /^[\w-]{11}$/.test(id ?? "");
  if (isId(value)) return value;
  try {
    const url = new URL(value);
    if (url.hostname.endsWith("youtu.be")) {
      const id = url.pathname.slice(1, 12);
      return isId(id) ? id : null;
    }
    const v = url.searchParams.get("v");
    if (isId(v)) return v;
    const match = url.pathname.match(/\/(?:live|embed|shorts)\/([\w-]{11})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

const readStored = (key, fallback, isValid) => {
  try {
    const value = window.localStorage.getItem(key);
    return value && isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

const writeStored = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); the choice just won't persist.
  }
};

// Visit history for the stamp card. One entry per session that lasted at least a minute.
const VISITS_KEY = "cafe-focus-visits";
const STAMPS_PER_CARD = 10;
const STAMP_MINUTES = 10;
const MAX_STORED_VISITS = 500;

const readVisits = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(VISITS_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.at === "string" && Number.isFinite(item.minutes),
    );
  } catch {
    return [];
  }
};

const writeVisits = (visits) => {
  try {
    window.localStorage.setItem(VISITS_KEY, JSON.stringify(visits.slice(-MAX_STORED_VISITS)));
  } catch {
    // Storage unavailable; the card just won't persist.
  }
};

const countStamps = (visits) => visits.filter((item) => item.stamp).length;

const formatMinutes = (minutes, copy) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? copy.hoursMinutes(hours, rest) : copy.minutesOnly(rest);
};

let youTubeApiPromise = null;
const loadYouTubeApi = () => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youTubeApiPromise) {
    youTubeApiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT);
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    });
  }
  return youTubeApiPromise;
};

const CUE_SOUNDS = {
  steps: audioPath("audio/steps-to-cafe.mp3"),
  woodenDoor: audioPath("audio/door-open.mp3"),
  door: audioPath("audio/door-bell.mp3"),
  espresso: audioPath("audio/espresso.mp3"),
  drip: audioPath("audio/drip-coffee.mp3"),
  stir: audioPath("audio/coffee-stir.mp3"),
  cupSetDown: audioPath("audio/cup-set-down.mp3"),
};

const createAudioElement = (src, loop = false) => {
  const audio = new Audio(src);
  audio.loop = loop;
  audio.preload = "none";
  audio.volume = 0;
  return audio;
};

const LONG_TRACK_SECONDS = 300;

// Long field recordings start from a random point so sessions do not all open on the same sound.
const randomizeStart = (audio) => {
  const seek = () => {
    if (!Number.isFinite(audio.duration) || audio.duration < LONG_TRACK_SECONDS) return;
    audio.currentTime = Math.random() * (audio.duration - 60);
  };
  if (audio.readyState >= 1) {
    seek();
    return;
  }
  audio.addEventListener("loadedmetadata", seek, { once: true });
};

// Sets volumes, and only loads/plays a track once its volume is above zero.
const syncAmbientTracks = (setup, layers, ambientModes) => {
  AMBIENT_TRACKS.forEach(({ key, layerKey, modeGroup, mode, maxVolume }) => {
    const audio = setup.tracks[key];
    if (!audio) return;
    const level = layers[layerKey] ?? 0;
    const modeMultiplier = !mode || ambientModes[modeGroup] === mode ? 1 : 0;
    const volume = Math.max(0, Math.min(1, level * maxVolume * modeMultiplier));
    audio.volume = volume;
    if (!setup.enabled) return;
    if (volume <= 0) {
      if (!audio.paused) audio.pause();
      return;
    }
    if (!setup.started.has(key)) {
      setup.started.add(key);
      audio.load();
      randomizeStart(audio);
    }
    if (audio.paused) {
      void audio.play().catch(() => {});
    }
  });
};

const applyJazzVolume = (jazz, layers) => {
  if (!jazz?.audio) return;
  const volume = Math.max(0, Math.min(1, (layers.jazz ?? 0) * 0.32));
  jazz.audio.volume = volume;
  if (volume <= 0 && !jazz.audio.paused) jazz.audio.pause();
};

const setJazzPlaylist = (setup, mode) => {
  const playlist = getJazzPlaylist(mode);
  const jazz = setup.jazz;

  if (jazz.mode === mode && playlist.includes(jazz.audio.src.replace(window.location.origin, ""))) {
    return;
  }

  jazz.mode = mode;
  jazz.index = 0;
  jazz.audio.pause();
  jazz.audio.src = playlist[0];
  jazz.audio.load();
};

const playJazzIfNeeded = (setup, layers) => {
  if (!setup?.jazz?.audio || (layers.jazz ?? 0) <= 0) return;
  void setup.jazz.audio.play().catch(() => {});
};

const playCue = (src, volume = 0.45) => {
  const audio = createAudioElement(src);
  audio.preload = "auto";
  audio.volume = volume;
  void audio.play().catch(() => {});
  return audio;
};

const playTimedCue = (src, volume = 0.35, durationMs = 3500) => {
  const audio = playCue(src, volume);
  window.setTimeout(() => {
    audio.pause();
    audio.src = "";
  }, durationMs);
};

const playDrinkCue = (drinkId) => {
  if (drinkId === "americano") {
    playCue(CUE_SOUNDS.drip, 0.34);
    return;
  }
  if (drinkId === "matcha") {
    playCue(CUE_SOUNDS.stir, 0.32);
    return;
  }
  if (drinkId !== "water") {
    playCue(CUE_SOUNDS.espresso, 0.28);
  }
};

const useAmbientAudio = (layers, ambientModes) => {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const tracks = AMBIENT_TRACKS.reduce((items, track) => {
        items[track.key] = createAudioElement(track.src, true);
        return items;
      }, {});
      const jazzAudio = createAudioElement(getJazzPlaylist(ambientModes.jazz)[0], false);
      const created = {
        enabled: false,
        tracks,
        started: new Set(),
        jazz: {
          audio: jazzAudio,
          index: 0,
          mode: ambientModes.jazz,
        },
      };

      const advanceJazz = () => {
        const playlist = getJazzPlaylist(created.jazz.mode);
        created.jazz.index = (created.jazz.index + 1) % playlist.length;
        created.jazz.audio.src = playlist[created.jazz.index];
        created.jazz.audio.load();
        if (created.enabled && created.jazz.audio.volume > 0) {
          void created.jazz.audio.play().catch(() => {});
        }
      };

      jazzAudio.onended = advanceJazz;

      audioRef.current = created;
    }

    const setup = audioRef.current;
    setup.enabled = true;
    setJazzPlaylist(setup, ambientModes.jazz);
    applyJazzVolume(setup.jazz, layers);
    syncAmbientTracks(setup, layers, ambientModes);
    if ((layers.jazz ?? 0) > 0) {
      setup.jazz.audio.load();
      void setup.jazz.audio.play().catch(() => {});
    }
    setEnabled(true);
  };

  const stopAudio = () => {
    const setup = audioRef.current;
    if (!setup) return;
    setup.enabled = false;
    Object.values(setup.tracks).forEach((audio) => {
      audio.pause();
    });
    setup.jazz.audio.pause();
    setEnabled(false);
  };

  useEffect(() => {
    const setup = audioRef.current;
    if (!setup) return;
    setJazzPlaylist(setup, ambientModes.jazz);
    applyJazzVolume(setup.jazz, layers);
    syncAmbientTracks(setup, layers, ambientModes);
    if (setup.enabled) {
      playJazzIfNeeded(setup, layers);
    }
  }, [layers, ambientModes]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        Object.values(audioRef.current.tracks).forEach((audio) => {
          audio.pause();
          audio.src = "";
        });
        audioRef.current.jazz.audio.pause();
        audioRef.current.jazz.audio.src = "";
      }
    };
  }, []);

  return { enabled, ensureAudio, stopAudio };
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
};

function App() {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("cafe-focus-language");
    if (saved === "en" || saved === "zh") return saved;
    return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  });
  const [scene, setScene] = useState("entrance");
  const [drink, setDrink] = useState(null);
  const [seat, setSeat] = useState(null);
  const [task, setTask] = useState("");
  const [duration, setDuration] = useState(45);
  const [customDuration, setCustomDuration] = useState("");
  const [ritual, setRitual] = useState({ phone: false, laptop: false });
  const [remaining, setRemaining] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  // Wall-clock end time of the running countdown; null while paused or idle.
  const endAtRef = useRef(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [sessionResult, setSessionResult] = useState(null);
  const [layerMix, setLayerMix] = useState(SEATS[1].layers);
  const [trafficMode, setTrafficMode] = useState("light");
  const [jazzMode, setJazzMode] = useState(() =>
    readStored("cafe-focus-jazz-mode", "cafe", (value) => JAZZ_MODES.includes(value)),
  );
  const [youtubeId, setYoutubeId] = useState(() => {
    const stored = readStored("cafe-focus-youtube-id", YOUTUBE_STATIONS[0].id, (value) =>
      /^[\w-]{11}$/.test(value),
    );
    return RETIRED_YOUTUBE_IDS[stored] ?? stored;
  });
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeError, setYoutubeError] = useState(false);
  const [youtubeUnavailableId, setYoutubeUnavailableId] = useState(null);
  const [visits, setVisits] = useState(readVisits);
  // The visit recorded by the session that just ended, shown on the complete scene.
  const [lastVisit, setLastVisit] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [pauseNudgeSeen, setPauseNudgeSeen] = useState(false);

  const copy = COPY[lang];
  const selectedDrink = DRINKS.find((item) => item.id === drink);
  const selectedSeat = SEATS.find((item) => item.id === seat);
  const selectedDrinkName = selectedDrink?.name[lang];
  const selectedSeatName = selectedSeat?.name[lang];
  const selectedSeatLabel = selectedSeat?.label[lang];
  const pauseIntervention = selectedSeat ? PAUSE_INTERVENTIONS[selectedSeat.id] : null;
  const sceneMediaKey = getSceneMediaKey(scene, selectedSeat?.id);
  const sceneMedia = SCENE_MEDIA[sceneMediaKey] ?? SCENE_MEDIA.entrance;
  const effectiveDuration = useMemo(() => {
    const custom = Number(customDuration);
    if (customDuration && Number.isFinite(custom) && custom >= 5) return Math.min(custom, 180);
    return duration;
  }, [customDuration, duration]);

  const ambientModes = useMemo(
    () => ({ traffic: trafficMode, jazz: jazzMode }),
    [trafficMode, jazzMode],
  );
  // In YouTube mode the jazz slider drives the YouTube player, so the hosted playlist stays silent.
  const audioLayers = useMemo(
    () => (jazzMode === "youtube" ? { ...layerMix, jazz: 0 } : layerMix),
    [layerMix, jazzMode],
  );
  const ambient = useAmbientAudio(audioLayers, ambientModes);

  useEffect(() => {
    writeStored("cafe-focus-jazz-mode", jazzMode);
  }, [jazzMode]);

  useEffect(() => {
    writeStored("cafe-focus-youtube-id", youtubeId);
  }, [youtubeId]);

  const submitYoutubeLink = (event) => {
    event.preventDefault();
    const id = parseYouTubeId(youtubeInput);
    if (!id) {
      setYoutubeError(true);
      return;
    }
    setYoutubeError(false);
    setYoutubeInput("");
    setYoutubeId(id);
  };

  useEffect(() => {
    window.localStorage.setItem("cafe-focus-language", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = copy.appName;
  }, [copy.appName, lang]);

  useEffect(() => {
    if (scene !== "focus") return undefined;
    document.title = `${formatTime(remaining)} · ${task.trim() || copy.appName}`;
    return () => {
      document.title = copy.appName;
    };
  }, [scene, remaining, task, copy.appName]);

  useEffect(() => {
    if (!selectedSeat) return;
    setLayerMix(selectedSeat.layers);
  }, [selectedSeat]);

  useEffect(() => {
    if (scene !== "focus" || !isRunning) return undefined;
    if (endAtRef.current === null) {
      endAtRef.current = Date.now() + remaining * 1000;
    }

    // Derive remaining time from the wall clock so background-tab throttling cannot drift it.
    const tick = () => {
      if (endAtRef.current === null) return;
      const next = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemaining(next);
      if (next <= 0) completeSession();
    };

    const timer = window.setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
    // `remaining` only seeds endAt when the countdown (re)starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, isRunning]);

  useEffect(() => {
    if (scene !== "focus" || !isRunning) return undefined;
    const statusTimer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % STATUS_MESSAGES.length);
    }, 26000);

    return () => window.clearInterval(statusTimer);
  }, [scene, isRunning]);

  useEffect(() => {
    if (scene !== "focus" || isRunning || remaining <= 0 || pauseNudgeSeen || intervention) {
      return undefined;
    }

    const pauseTimer = window.setTimeout(() => {
      setPauseNudgeSeen(true);
      setIntervention("pauseLong");
    }, 90000);

    return () => window.clearTimeout(pauseTimer);
  }, [intervention, isRunning, pauseNudgeSeen, remaining, scene]);

  const startFocus = () => {
    const seconds = effectiveDuration * 60;
    playCue(CUE_SOUNDS.cupSetDown, 0.4);
    endAtRef.current = Date.now() + seconds * 1000;
    setRemaining(seconds);
    setMessageIndex(0);
    setIsRunning(true);
    setSessionResult(null);
    setIntervention(null);
    setPauseNudgeSeen(false);
    setScene("focus");
  };

  const pauseFocus = () => {
    if (endAtRef.current !== null) {
      setRemaining(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)));
    }
    endAtRef.current = null;
    setIsRunning(false);
  };

  const resumeFocus = () => {
    setIntervention(null);
    setIsRunning(true);
  };

  const currentRemaining = () =>
    endAtRef.current === null
      ? remaining
      : Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));

  const recordVisit = (completed, elapsedSeconds) => {
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 1) {
      setLastVisit(null);
      return;
    }
    const entry = {
      at: new Date().toISOString(),
      minutes,
      task: task.trim(),
      seat: selectedSeat?.id ?? null,
      drink: selectedDrink?.id ?? null,
      completed,
      stamp: completed || minutes >= STAMP_MINUTES,
    };
    setVisits((current) => {
      const next = [...current, entry];
      writeVisits(next);
      return next;
    });
    setLastVisit(entry);
  };

  const completeSession = () => {
    endAtRef.current = null;
    setRemaining(0);
    setIsRunning(false);
    ambient.stopAudio();
    playCue(CUE_SOUNDS.door, 0.3);
    recordVisit(true, effectiveDuration * 60);
    setSessionResult("completed");
    setIntervention(null);
    setScene("complete");
  };

  const endSession = () => {
    const left = currentRemaining();
    endAtRef.current = null;
    setIsRunning(false);
    ambient.stopAudio();
    recordVisit(left === 0, effectiveDuration * 60 - left);
    setSessionResult(left === 0 ? "completed" : "ended");
    setIntervention(null);
    setScene("complete");
  };

  const resetCafe = () => {
    endAtRef.current = null;
    ambient.stopAudio();
    setLastVisit(null);
    setScene("entrance");
    setDrink(null);
    setSeat(null);
    setTask("");
    setDuration(45);
    setCustomDuration("");
    setRitual({ phone: false, laptop: false });
    setRemaining(45 * 60);
    setIsRunning(false);
    setSessionResult(null);
    setIntervention(null);
    setPauseNudgeSeen(false);
    setTrafficMode("light");
  };

  const updateLayer = (key, value) => {
    setLayerMix((current) => ({ ...current, [key]: Number(value) }));
  };

  const renderScene = () => {
    if (scene === "entrance") {
      return (
        <section className="scene entrance-scene" aria-labelledby="entrance-title">
          <div className="hero-copy">
            <p className="eyebrow">
              {visits.length > 0 ? copy.visitEyebrow(visits.length + 1) : copy.entranceEyebrow}
            </p>
            <h1 id="entrance-title">{copy.entranceTitle}</h1>
            <p className="scene-lede">{copy.entranceLead}</p>
            <button
              className="primary-action"
              type="button"
              onClick={() => {
                playTimedCue(CUE_SOUNDS.steps, 0.18, 3600);
                window.setTimeout(() => playCue(CUE_SOUNDS.woodenDoor, 0.36), 450);
                window.setTimeout(() => playCue(CUE_SOUNDS.door, 0.44), 800);
                setScene("order");
              }}
            >
              <DoorOpen aria-hidden="true" />
              {copy.enterCafe}
            </button>
            {visits.length > 0 && <StampCard visits={visits} copy={copy} />}
          </div>
          <div className="presence-strip" aria-label={copy.presenceAria}>
            {copy.presence.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>
      );
    }

    if (scene === "order") {
      return (
        <section className="scene order-scene" aria-labelledby="order-title">
          <div className="dialogue-panel">
            <p className="eyebrow">{copy.orderEyebrow}</p>
            <h2 id="order-title">{copy.orderTitle}</h2>
            <div className="barista-row">
              <div className="avatar" aria-hidden="true">
                <Coffee />
              </div>
              <div>
                <p className="speaker">{copy.barista}</p>
                <p className="quote">{copy.baristaGreeting}</p>
              </div>
            </div>
            <div className="choice-grid drinks">
              {DRINKS.map((item) => (
                <button
                  className={`choice-card ${drink === item.id ? "selected" : ""}`}
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setDrink(item.id);
                    playDrinkCue(item.id);
                  }}
                >
                  <Coffee aria-hidden="true" />
                  <span>{item.name[lang]}</span>
                  <small>{item.note[lang]}</small>
                </button>
              ))}
            </div>
            {selectedDrink && (
              <div className="next-step" role="status">
                <MessageCircle aria-hidden="true" />
                <span>{copy.baristaResponse}</span>
                <button className="secondary-action" type="button" onClick={() => setScene("seat")}>
                  {copy.chooseSeat}
                </button>
              </div>
            )}
          </div>
        </section>
      );
    }

    if (scene === "seat") {
      return (
        <section className="scene seat-scene" aria-labelledby="seat-title">
          <div className="wide-panel">
            <p className="eyebrow">{copy.seatEyebrow}</p>
            <h2 id="seat-title">{copy.seatTitle}</h2>
            <div className="choice-grid seats">
              {SEATS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className={`choice-card seat-card ${seat === item.id ? "selected" : ""}`}
                    key={item.id}
                    type="button"
                    onClick={() => setSeat(item.id)}
                  >
                    <Icon aria-hidden="true" />
                    <span>{item.name[lang]}</span>
                    <small>{item.label[lang]}</small>
                    <p>{item.description[lang]}</p>
                  </button>
                );
              })}
            </div>
            <div className="scene-actions">
              <button className="ghost-action" type="button" onClick={() => setScene("order")}>
                {copy.back}
              </button>
              <button
                className="primary-action compact"
                type="button"
                disabled={!seat}
                onClick={() => setScene("setup")}
              >
                {copy.sitDown}
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (scene === "setup") {
      return (
        <section className="scene setup-scene" aria-labelledby="setup-title">
          <div className="setup-panel">
            <p className="eyebrow">{copy.setupEyebrow(selectedSeatName)}</p>
            <h2 id="setup-title">{copy.setupTitle}</h2>
            <label className="task-field">
              <span>{copy.taskLabel}</span>
              <input
                type="text"
                value={task}
                onChange={(event) => setTask(event.target.value)}
                placeholder={copy.taskPlaceholder}
              />
            </label>
            <div className="duration-group" aria-label={copy.durationAria}>
              {DURATIONS.map((minutes) => (
                <button
                  className={duration === minutes && !customDuration ? "duration selected" : "duration"}
                  key={minutes}
                  type="button"
                  onClick={() => {
                    setDuration(minutes);
                    setCustomDuration("");
                  }}
                >
                  {minutes} {copy.minuteShort}
                </button>
              ))}
              <label className="custom-duration">
                <Clock3 aria-hidden="true" />
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={customDuration}
                  onChange={(event) => setCustomDuration(event.target.value)}
                  placeholder={copy.customDuration}
                />
              </label>
            </div>
            <div className="ritual-list">
              <button
                className={`ritual-item ${ritual.phone ? "done" : ""}`}
                type="button"
                onClick={() => setRitual((current) => ({ ...current, phone: !current.phone }))}
              >
                <Check aria-hidden="true" />
                {copy.ritualPhone}
              </button>
              <button
                className={`ritual-item ${ritual.laptop ? "done" : ""}`}
                type="button"
                onClick={() => setRitual((current) => ({ ...current, laptop: !current.laptop }))}
              >
                <Laptop aria-hidden="true" />
                {copy.ritualLaptop}
              </button>
            </div>
            <div className="session-summary" aria-live="polite">
              <span>{selectedDrinkName}</span>
              <span>{selectedSeatName}</span>
              <span>
                {effectiveDuration} {copy.minutes}
              </span>
            </div>
            <div className="scene-actions">
              <button className="ghost-action" type="button" onClick={() => setScene("seat")}>
                {copy.back}
              </button>
              <button
                className="primary-action compact"
                type="button"
                disabled={!task.trim() || !ritual.phone || !ritual.laptop}
                onClick={startFocus}
              >
                <Play aria-hidden="true" />
                {copy.startWorking}
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (scene === "focus") {
      return (
        <section className="scene focus-scene" aria-labelledby="focus-title">
          <div className="focus-shell">
            <div className="focus-main">
              <p className="eyebrow">{selectedSeatName}</p>
              <h2 id="focus-title">{task}</h2>
              <div className="timer-display" aria-label={copy.remainingAria(formatTime(remaining))}>
                {formatTime(remaining)}
              </div>
              <p className="status-message">{STATUS_MESSAGES[messageIndex][lang]}</p>
              {intervention === "pauseLong" && pauseIntervention && (
                <div className="intervention-card" role="status">
                  <p className="speaker">{pauseIntervention.speaker[lang]}</p>
                  <p className="quote">{pauseIntervention.line[lang]}</p>
                  <div className="thought-line">
                    <span>{copy.innerThought}</span>
                    <p>{pauseIntervention.thought[lang](task)}</p>
                  </div>
                  <button
                    className="secondary-action"
                    type="button"
                    onClick={resumeFocus}
                  >
                    {copy.returnToTask}
                  </button>
                </div>
              )}
              <div className="focus-actions">
                {isRunning ? (
                  <button className="icon-action" type="button" onClick={pauseFocus}>
                    <Pause aria-hidden="true" />
                    {copy.pause}
                  </button>
                ) : (
                  <button
                    className="icon-action"
                    type="button"
                    onClick={resumeFocus}
                  >
                    <Play aria-hidden="true" />
                    {copy.resume}
                  </button>
                )}
                <button className="icon-action end" type="button" onClick={endSession}>
                  <Square aria-hidden="true" />
                  {copy.end}
                </button>
              </div>
            </div>

            <aside className="focus-side" aria-label={copy.detailsAria}>
              <div className="detail-row">
                <span>{copy.drink}</span>
                <strong>{selectedDrinkName}</strong>
              </div>
              <div className="detail-row">
                <span>{copy.roomTone}</span>
                <strong>{selectedSeatLabel}</strong>
              </div>
              <button
                className={`sound-toggle ${ambient.enabled ? "enabled" : ""}`}
                type="button"
                onClick={ambient.enabled ? ambient.stopAudio : ambient.ensureAudio}
              >
                {ambient.enabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
                {ambient.enabled ? copy.ambienceOn : copy.startAmbience}
              </button>
              <div className="mixer">
                <SoundSlider
                  icon={<Coffee aria-hidden="true" />}
                  label={copy.soundLabels.cafe}
                  value={layerMix.cafe}
                  onChange={(value) => updateLayer("cafe", value)}
                />
                <SoundSlider
                  icon={<CloudRain aria-hidden="true" />}
                  label={copy.soundLabels.rain}
                  value={layerMix.rain}
                  onChange={(value) => updateLayer("rain", value)}
                />
                <SoundSlider
                  icon={<DoorOpen aria-hidden="true" />}
                  label={copy.soundLabels.traffic}
                  value={layerMix.traffic}
                  onChange={(value) => updateLayer("traffic", value)}
                />
                <div className="traffic-mode" aria-label={copy.trafficModeLabel}>
                  <button
                    className={trafficMode === "light" ? "active" : ""}
                    type="button"
                    onClick={() => setTrafficMode("light")}
                  >
                    {copy.trafficModes.light}
                  </button>
                  <button
                    className={trafficMode === "heavy" ? "active" : ""}
                    type="button"
                    onClick={() => setTrafficMode("heavy")}
                  >
                    {copy.trafficModes.heavy}
                  </button>
                </div>
                <SoundSlider
                  icon={<Keyboard aria-hidden="true" />}
                  label={copy.soundLabels.keys}
                  value={layerMix.keys}
                  onChange={(value) => updateLayer("keys", value)}
                />
                <SoundSlider
                  icon={<Coffee aria-hidden="true" />}
                  label={copy.soundLabels.cups}
                  value={layerMix.cups}
                  onChange={(value) => updateLayer("cups", value)}
                />
                <SoundSlider
                  icon={<Coffee aria-hidden="true" />}
                  label={copy.soundLabels.backCounter}
                  value={layerMix.backCounter}
                  onChange={(value) => updateLayer("backCounter", value)}
                />
                <SoundSlider
                  icon={jazzMode === "youtube" ? <Radio aria-hidden="true" /> : <Music aria-hidden="true" />}
                  label={jazzMode === "youtube" ? copy.youtubeLabel : copy.soundLabels.jazz}
                  value={layerMix.jazz}
                  onChange={(value) => updateLayer("jazz", value)}
                />
                <div className="mode-buttons jazz-modes" aria-label={copy.jazzModeLabel}>
                  {JAZZ_MODES.map((mode) => (
                    <button
                      className={jazzMode === mode ? "active" : ""}
                      key={mode}
                      type="button"
                      aria-pressed={jazzMode === mode}
                      onClick={() => setJazzMode(mode)}
                    >
                      {copy.jazzModes[mode]}
                    </button>
                  ))}
                </div>
                {jazzMode === "youtube" && (
                  <div className="youtube-station">
                    <div className="station-list" aria-label={copy.youtubeStationsAria}>
                      {YOUTUBE_STATIONS.map((station) => (
                        <button
                          className={youtubeId === station.id ? "active" : ""}
                          key={station.id}
                          type="button"
                          aria-pressed={youtubeId === station.id}
                          onClick={() => setYoutubeId(station.id)}
                        >
                          {station.name[lang]}
                        </button>
                      ))}
                      {!YOUTUBE_STATIONS.some((station) => station.id === youtubeId) && (
                        <button className="active" type="button" aria-pressed="true">
                          {copy.youtubeCustom}
                        </button>
                      )}
                    </div>
                    <form className="station-form" onSubmit={submitYoutubeLink}>
                      <input
                        type="url"
                        inputMode="url"
                        value={youtubeInput}
                        onChange={(event) => {
                          setYoutubeInput(event.target.value);
                          setYoutubeError(false);
                        }}
                        placeholder={copy.youtubePaste}
                        aria-label={copy.youtubePaste}
                        aria-invalid={youtubeError}
                      />
                      <button type="submit" disabled={!youtubeInput.trim()}>
                        {copy.youtubeUse}
                      </button>
                    </form>
                    {youtubeError && (
                      <p className="station-error" role="alert">
                        {copy.youtubeInvalid}
                      </p>
                    )}
                    <YouTubeStation
                      videoId={youtubeId}
                      volume={layerMix.jazz}
                      playing={ambient.enabled}
                      onUnavailable={setYoutubeUnavailableId}
                    />
                    {youtubeUnavailableId === youtubeId ? (
                      <p className="station-error" role="alert">
                        {copy.youtubeUnavailable}
                      </p>
                    ) : (
                      <p className="station-note">
                        {ambient.enabled ? copy.youtubeNote : copy.youtubeIdle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      );
    }

    return (
      <section className="scene complete-scene" aria-labelledby="complete-title">
        <div className="complete-panel">
          <p className="eyebrow">{sessionResult === "completed" ? copy.sessionComplete : copy.sessionEnded}</p>
          <h2 id="complete-title">{copy.stayedWith(task)}</h2>
          <p>
            {sessionResult === "completed"
              ? copy.completedLine(effectiveDuration)
              : copy.endedLine}
          </p>
          {lastVisit && (
            <StampCard
              visits={visits}
              copy={copy}
              highlightLast={lastVisit.stamp}
              note={lastVisit.stamp ? copy.stampEarned : copy.stampMissed}
            />
          )}
          <div className="scene-actions">
            <button className="primary-action compact" type="button" onClick={resetCafe}>
              <TimerReset aria-hidden="true" />
              {copy.visitAgain}
            </button>
          </div>
        </div>
      </section>
    );
  };

  return (
    <main className={`app scene-${scene}`}>
      <SceneBackdrop media={sceneMedia} />
      <div className="background-shade" aria-hidden="true" />
      <header className="app-header" aria-label={copy.appName}>
        <div className="brand">
          <Coffee aria-hidden="true" />
          <span>{copy.appName}</span>
        </div>
        <div className="header-controls">
          <div className="language-switch" aria-label={copy.languageLabel}>
            <button
              className={lang === "en" ? "active" : ""}
              type="button"
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              className={lang === "zh" ? "active" : ""}
              type="button"
              onClick={() => setLang("zh")}
            >
              中文
            </button>
          </div>
          <div className="progress-dots" aria-label={`${copy.currentScene}: ${scene}`}>
            {["entrance", "order", "seat", "setup", "focus"].map((item) => (
              <span className={item === scene ? "active" : ""} key={item} />
            ))}
          </div>
        </div>
      </header>
      {renderScene()}
    </main>
  );
}

function SceneBackdrop({ media }) {
  const images = media?.images?.length ? media.images : [media?.fallback ?? DEFAULT_BACKDROP];
  const fallback = media?.fallback ?? DEFAULT_BACKDROP;
  const [imageIndex, setImageIndex] = useState(0);
  const [failedSources, setFailedSources] = useState({});
  const [imageLayers, setImageLayers] = useState(() => [
    { id: 0, src: images[0] ?? fallback, active: true },
  ]);
  const layerIdRef = useRef(1);
  const activeImageSrcRef = useRef(images[0] ?? fallback);

  useEffect(() => {
    setImageIndex(0);
    setFailedSources({});
    layerIdRef.current += 1;
    activeImageSrcRef.current = images[0] ?? fallback;
    setImageLayers([{ id: layerIdRef.current, src: activeImageSrcRef.current, active: true }]);
  }, [media]);

  useEffect(() => {
    if (images.length <= 1) return undefined;
    const imageTimer = window.setInterval(() => {
      setImageIndex((index) => (index + 1) % images.length);
    }, media?.intervalMs ?? 7200);

    return () => window.clearInterval(imageTimer);
  }, [images.length, media?.intervalMs]);

  const activeImage = images[imageIndex % images.length];
  const src = failedSources[activeImage] ? fallback : activeImage;

  useEffect(() => {
    if (activeImageSrcRef.current === src) return undefined;

    activeImageSrcRef.current = src;
    layerIdRef.current += 1;
    const nextLayerId = layerIdRef.current;

    setImageLayers((currentLayers) => {
      return [
        ...currentLayers.map((layer) => ({ ...layer, active: true })),
        { id: nextLayerId, src, active: false },
      ].slice(-2);
    });

    const fadeFrame = window.requestAnimationFrame(() => {
      setImageLayers((currentLayers) =>
        currentLayers.map((layer) => ({ ...layer, active: layer.id === nextLayerId })),
      );
    });

    const cleanupTimer = window.setTimeout(() => {
      setImageLayers((currentLayers) => currentLayers.filter((layer) => layer.active));
    }, 2400);

    return () => {
      window.cancelAnimationFrame(fadeFrame);
      window.clearTimeout(cleanupTimer);
    };
  }, [src]);

  if (media?.video) {
    return (
      <video
        className="scene-backdrop"
        key={media.video}
        src={media.video}
        autoPlay
        loop={media.loop ?? true}
        muted
        playsInline
        aria-hidden="true"
      />
    );
  }

  return (
    <>
      {imageLayers.map((layer) => (
        <img
          className={`scene-backdrop scene-backdrop-image${layer.active ? " active" : ""}`}
          key={layer.id}
          src={layer.src}
          alt=""
          aria-hidden="true"
          onError={() => setFailedSources((current) => ({ ...current, [layer.src]: true }))}
        />
      ))}
    </>
  );
}

function StampCard({ visits, copy, highlightLast = false, note = null }) {
  const stamps = countStamps(visits);
  const filled = stamps === 0 ? 0 : ((stamps - 1) % STAMPS_PER_CARD) + 1;
  const cardNumber = Math.max(1, Math.ceil(stamps / STAMPS_PER_CARD));
  const isFull = stamps > 0 && filled === STAMPS_PER_CARD;
  const totalMinutes = visits.reduce((sum, item) => sum + item.minutes, 0);

  return (
    <section className="stamp-card" aria-label={copy.stampCard}>
      <div className="stamp-card-head">
        <span>
          {copy.stampCard} · {copy.cardNumber(cardNumber)}
        </span>
        <strong>
          {filled} / {STAMPS_PER_CARD}
        </strong>
      </div>
      <div className="stamp-row" role="img" aria-label={copy.stampsAria(filled, STAMPS_PER_CARD)}>
        {Array.from({ length: STAMPS_PER_CARD }, (_, index) => {
          const isFilled = index < filled;
          const isNew = highlightLast && isFilled && index === filled - 1;
          return (
            <span
              className={`stamp${isFilled ? " filled" : ""}${isNew ? " new" : ""}`}
              key={index}
            >
              {isFilled && <Coffee aria-hidden="true" />}
            </span>
          );
        })}
      </div>
      <p className="stamp-meta">
        {copy.visitTotal(visits.length)} · {copy.totalFocused(formatMinutes(totalMinutes, copy))}
      </p>
      {(note || isFull) && <p className="stamp-note">{isFull ? copy.cardFull : note}</p>}
    </section>
  );
}

// Visible embedded player (YouTube's terms require it to stay on screen, at least 200x200).
function YouTubeStation({ videoId, volume, playing, onUnavailable }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const loadedIdRef = useRef(videoId);
  const onUnavailableRef = useRef(onUnavailable);
  onUnavailableRef.current = onUnavailable;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return;
      const mount = document.createElement("div");
      hostRef.current.appendChild(mount);
      playerRef.current = new YT.Player(mount, {
        width: "100%",
        height: "100%",
        videoId: loadedIdRef.current,
        playerVars: { playsinline: 1, rel: 0 },
        events: {
          onReady: () => {
            if (!cancelled) setReady(true);
          },
          onError: (event) => {
            if (!cancelled && YOUTUBE_ERROR_CODES.includes(event.data)) {
              onUnavailableRef.current?.(loadedIdRef.current);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!ready || !player) return;
    if (loadedIdRef.current !== videoId) {
      loadedIdRef.current = videoId;
      if (playing && volume > 0) player.loadVideoById(videoId);
      else player.cueVideoById(videoId);
    }
    player.setVolume(Math.round(volume * YOUTUBE_MAX_VOLUME));
    if (playing && volume > 0) player.playVideo();
    else player.pauseVideo();
  }, [ready, videoId, volume, playing]);

  return <div className="youtube-frame" ref={hostRef} />;
}

function SoundSlider({ icon, label, value, onChange }) {
  return (
    <label className="sound-slider">
      <span>
        {icon}
        {label}
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export default App;
