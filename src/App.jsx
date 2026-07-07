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
  Pause,
  Play,
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
const assetPath = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
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
    },
    sessionComplete: "Session complete",
    sessionEnded: "Session ended",
    stayedWith: (task) => `You stayed with “${task}.”`,
    completedLine: (minutes) => `You worked for ${minutes} minutes. That counts.`,
    endedLine: "Your table is still here when you want to come back.",
    visitAgain: "Visit again",
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
    },
    sessionComplete: "专注完成",
    sessionEnded: "专注结束",
    stayedWith: (task) => `你刚才一直和“${task}”待在一起。`,
    completedLine: (minutes) => `你专注了 ${minutes} 分钟。这已经算数。`,
    endedLine: "你的座位还在这里。想回来时可以再回来。",
    visitAgain: "下次再来",
  },
};

const AMBIENT_TRACKS = [
  { key: "cafe", layerKey: "cafe", src: assetPath("audio/cafe-ambience.mp3"), maxVolume: 0.55 },
  { key: "rain", layerKey: "rain", src: assetPath("audio/rain.mp3"), maxVolume: 0.48 },
  { key: "keys", layerKey: "keys", src: assetPath("audio/typing.mp3"), maxVolume: 0.36 },
  { key: "cups", layerKey: "cups", src: assetPath("audio/coffee-stir.mp3"), maxVolume: 0.42 },
  {
    key: "trafficLight",
    layerKey: "traffic",
    modeGroup: "traffic",
    mode: "light",
    src: assetPath("audio/light-traffic.m4a"),
    maxVolume: 0.38,
  },
  {
    key: "trafficHeavy",
    layerKey: "traffic",
    modeGroup: "traffic",
    mode: "heavy",
    src: assetPath("audio/heavy-traffic.m4a"),
    maxVolume: 0.34,
  },
  {
    key: "backCounter",
    layerKey: "backCounter",
    src: assetPath("audio/back-counter-coffee.mp3"),
    maxVolume: 0.36,
  },
];

const JAZZ_PLAYLISTS = {
  cafe: [
    assetPath("audio/jazz/cafe/01-jazz-cafe.mp3"),
    assetPath("audio/jazz/cafe/02-jazz-elegant.mp3"),
    assetPath("audio/jazz/cafe/03-jazz-4.mp3"),
  ],
  swing: [
    assetPath("audio/jazz/swing/01-jazz-cafe-2.mp3"),
    assetPath("audio/jazz/swing/02-jazz-music-3.mp3"),
    assetPath("audio/jazz/swing/03-jazz.mp3"),
    assetPath("audio/jazz/swing/04-jazz-2.mp3"),
    assetPath("audio/jazz/swing/05-jazz-music-2.mp3"),
  ],
  club: [
    assetPath("audio/jazz/club/01-jazz-club.mp3"),
    assetPath("audio/jazz/club/02-west-coast-jazz.mp3"),
    assetPath("audio/jazz/club/03-jazz-4.mp3"),
  ],
};

const getJazzPlaylist = (mode) => JAZZ_PLAYLISTS[mode] ?? JAZZ_PLAYLISTS.cafe;

const CUE_SOUNDS = {
  steps: assetPath("audio/steps-to-cafe.mp3"),
  woodenDoor: assetPath("audio/door-open.mp3"),
  door: assetPath("audio/door-bell.mp3"),
  espresso: assetPath("audio/espresso.mp3"),
  drip: assetPath("audio/drip-coffee.mp3"),
  stir: assetPath("audio/coffee-stir.mp3"),
  cupSetDown: assetPath("audio/cup-set-down.mp3"),
};

const createAudioElement = (src, loop = false) => {
  const audio = new Audio(src);
  audio.loop = loop;
  audio.preload = "none";
  audio.volume = 0;
  return audio;
};

const applyAmbientVolumes = (tracks, layers, ambientModes) => {
  AMBIENT_TRACKS.forEach(({ key, layerKey, modeGroup, mode, maxVolume }) => {
    if (!tracks[key]) return;
    const level = layers[layerKey] ?? 0;
    const modeMultiplier = !mode || ambientModes[modeGroup] === mode ? 1 : 0;
    tracks[key].volume = Math.max(0, Math.min(1, level * maxVolume * modeMultiplier));
  });
};

const applyJazzVolume = (jazz, layers) => {
  if (!jazz?.audio) return;
  jazz.audio.volume = Math.max(0, Math.min(1, (layers.jazz ?? 0) * 0.32));
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

  const ensureAudio = async () => {
    if (!audioRef.current) {
      const tracks = AMBIENT_TRACKS.reduce((items, track) => {
        items[track.key] = createAudioElement(track.src, true);
        return items;
      }, {});
      const jazzAudio = createAudioElement(getJazzPlaylist(ambientModes.jazz)[0], false);
      const setup = {
        enabled: false,
        tracks,
        jazz: {
          audio: jazzAudio,
          index: 0,
          mode: ambientModes.jazz,
        },
      };

      const advanceJazz = () => {
        const playlist = getJazzPlaylist(setup.jazz.mode);
        setup.jazz.index = (setup.jazz.index + 1) % playlist.length;
        setup.jazz.audio.src = playlist[setup.jazz.index];
        setup.jazz.audio.load();
        if (setup.enabled && setup.jazz.audio.volume > 0) {
          void setup.jazz.audio.play().catch(() => {});
        }
      };

      jazzAudio.onended = advanceJazz;

      audioRef.current = setup;
    }

    audioRef.current.enabled = true;
    setJazzPlaylist(audioRef.current, ambientModes.jazz);
    applyAmbientVolumes(audioRef.current.tracks, layers, ambientModes);
    applyJazzVolume(audioRef.current.jazz, layers);
    Object.values(audioRef.current.tracks).forEach((audio) => {
      audio.load();
    });
    audioRef.current.jazz.audio.load();
    const playPromises = Object.values(audioRef.current.tracks).map((audio) => audio.play());
    if ((layers.jazz ?? 0) > 0) {
      playPromises.push(audioRef.current.jazz.audio.play());
    }
    await Promise.allSettled(playPromises);
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
    applyAmbientVolumes(setup.tracks, layers, ambientModes);
    applyJazzVolume(setup.jazz, layers);
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
  const [messageIndex, setMessageIndex] = useState(0);
  const [sessionResult, setSessionResult] = useState(null);
  const [layerMix, setLayerMix] = useState(SEATS[1].layers);
  const [trafficMode, setTrafficMode] = useState("light");
  const [jazzMode, setJazzMode] = useState("cafe");
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
    if (customDuration && Number.isFinite(custom) && custom > 0) return Math.min(custom, 180);
    return duration;
  }, [customDuration, duration]);

  const ambientModes = useMemo(
    () => ({ traffic: trafficMode, jazz: jazzMode }),
    [trafficMode, jazzMode],
  );
  const ambient = useAmbientAudio(layerMix, ambientModes);

  useEffect(() => {
    window.localStorage.setItem("cafe-focus-language", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = copy.appName;
  }, [copy.appName, lang]);

  useEffect(() => {
    if (!selectedSeat) return;
    setLayerMix(selectedSeat.layers);
  }, [selectedSeat]);

  useEffect(() => {
    if (scene !== "focus" || !isRunning || remaining <= 0) return undefined;

    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setIsRunning(false);
          setSessionResult("completed");
          setScene("complete");
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [scene, isRunning, remaining]);

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
    setRemaining(seconds);
    setMessageIndex(0);
    setIsRunning(true);
    setSessionResult(null);
    setIntervention(null);
    setPauseNudgeSeen(false);
    setScene("focus");
  };

  const endSession = () => {
    setIsRunning(false);
    ambient.stopAudio();
    setSessionResult(remaining === 0 ? "completed" : "ended");
    setIntervention(null);
    setScene("complete");
  };

  const resetCafe = () => {
    ambient.stopAudio();
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
    setJazzMode("cafe");
  };

  const updateLayer = (key, value) => {
    setLayerMix((current) => ({ ...current, [key]: Number(value) }));
  };

  const renderScene = () => {
    if (scene === "entrance") {
      return (
        <section className="scene entrance-scene" aria-labelledby="entrance-title">
          <div className="hero-copy">
            <p className="eyebrow">{copy.entranceEyebrow}</p>
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
                    onClick={() => {
                      setIntervention(null);
                      setIsRunning(true);
                    }}
                  >
                    {copy.returnToTask}
                  </button>
                </div>
              )}
              <div className="focus-actions">
                {isRunning ? (
                  <button className="icon-action" type="button" onClick={() => setIsRunning(false)}>
                    <Pause aria-hidden="true" />
                    {copy.pause}
                  </button>
                ) : (
                  <button
                    className="icon-action"
                    type="button"
                    onClick={() => {
                      setIntervention(null);
                      setIsRunning(true);
                    }}
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
                  icon={<Coffee aria-hidden="true" />}
                  label={copy.soundLabels.jazz}
                  value={layerMix.jazz}
                  onChange={(value) => updateLayer("jazz", value)}
                />
                <div className="mode-buttons" aria-label={copy.jazzModeLabel}>
                  <button
                    className={jazzMode === "cafe" ? "active" : ""}
                    type="button"
                    onClick={() => setJazzMode("cafe")}
                  >
                    {copy.jazzModes.cafe}
                  </button>
                  <button
                    className={jazzMode === "swing" ? "active" : ""}
                    type="button"
                    onClick={() => setJazzMode("swing")}
                  >
                    {copy.jazzModes.swing}
                  </button>
                  <button
                    className={jazzMode === "club" ? "active" : ""}
                    type="button"
                    onClick={() => setJazzMode("club")}
                  >
                    {copy.jazzModes.club}
                  </button>
                </div>
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
