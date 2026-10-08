import { Armchair, BookOpen, Coffee, Laptop } from "lucide-react";

export const DRINKS = [
  {
    id: "iced-latte",
    name: { en: "Iced latte", zh: "冰拿铁" },
    note: { en: "cool and steady", zh: "凉一点，稳稳的" },
  },
  {
    id: "americano",
    name: { en: "Americano", zh: "美式" },
    note: { en: "clear and direct", zh: "清醒、直接" },
  },
  {
    id: "matcha",
    name: { en: "Matcha latte", zh: "抹茶拿铁" },
    note: { en: "soft energy", zh: "柔和的劲" },
  },
  {
    id: "cappuccino",
    name: { en: "Cappuccino", zh: "卡布奇诺" },
    note: { en: "warm and classic", zh: "温热、经典" },
  },
  {
    id: "water",
    name: { en: "Just water", zh: "今天只喝水" },
    note: { en: "simple and light", zh: "简单、轻一点" },
  },
];

export const SEATS = [
  {
    id: "window",
    name: { en: "Window seat", zh: "窗边座位" },
    label: { en: "Reading and writing", zh: "读书、写东西" },
    description: {
      en: "Rain on the glass, the street outside, voices kept low. Good for easing in.",
      zh: "窗外有雨和街景，人声更轻，适合慢慢进入状态。",
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
      birds: 0.4,
    },
  },
  {
    id: "corner",
    name: { en: "Corner table", zh: "角落小桌" },
    label: { en: "Deep work", zh: "深度工作" },
    description: {
      en: "Tucked away. The café hum stays low and nothing interrupts.",
      zh: "靠里的位子，店里的声音低一些，不容易被打断。",
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
      birds: 0.18,
    },
  },
  {
    id: "bar",
    name: { en: "Bar seat", zh: "吧台座位" },
    label: { en: "Short tasks", zh: "短任务" },
    description: {
      en: "Cups and footsteps close by. Good for quick starts and small jobs.",
      zh: "杯子声和脚步声更近，适合快速开始、处理小事。",
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
      birds: 0.12,
    },
  },
  {
    id: "quiet",
    name: { en: "Quiet zone", zh: "安静区" },
    label: { en: "Exam prep", zh: "复习、高强度专注" },
    description: {
      en: "Almost no voices, a steady hum. For revision and anything that takes everything you have.",
      zh: "几乎没有人声，底噪很稳，适合复习和需要全力的事。",
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
      birds: 0.1,
    },
  },
];

// Room tone before a seat is chosen: standing at the counter, just inside the door.
export const COUNTER_LAYERS = {
  cafe: 0.5,
  rain: 0.2,
  keys: 0.1,
  cups: 0.3,
  traffic: 0.12,
  backCounter: 0.32,
  jazz: 0.14,
  birds: 0.2,
};

export const DURATIONS = [25, 45, 60, 90];
