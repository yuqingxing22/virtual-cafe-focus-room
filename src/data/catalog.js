import { Armchair, BookOpen, Coffee, Laptop } from "lucide-react";

export const DRINKS = [
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

export const SEATS = [
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
      birds: 0.4,
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
      birds: 0.18,
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
      birds: 0.12,
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
