import { audioPath } from "../lib/paths.js";

// Six jazz stations sorted by ear from the Pixabay library in jazz-music/ (see its SOURCES.md).
// File names keep the Pixabay id so each track stays traceable to its licence.
const track = (station, file, title, artist) => ({
  src: audioPath(`audio/jazz/${station}/${file}.mp3`),
  title,
  artist,
});

const station = (id, name, blurb, tracks) => ({
  id,
  name,
  blurb,
  tracks: tracks.map(([file, title, artist]) => track(id, file, title, artist)),
});

export const JAZZ_STATIONS = [
  station(
    "piano-corner",
    { zh: "钢琴角落", en: "Piano Corner" },
    { zh: "安静的钢琴，适合读书写字", en: "Quiet keys for reading and writing" },
    [
      ["jazz-coffee-shop-px556234", "Coffee Shop", "alex-morgan"],
      ["jazz-piano-restaurant-px564275", "Piano Restaurant", "alex-morgan"],
      ["jazz-rainy-night-keys-px567549", "Rainy Night Keys", "alex-morgan"],
      ["jazz-vibes-background-px556245", "Vibes in the Background", "alex-morgan"],
      ["jazz-piano-px584847", "Piano", "aurec"],
      ["jazz-bar-piano-px592657", "Bar Piano", "aurec"],
      ["jazz-waltz-px602643", "Jazz Waltz", "aurec"],
      ["jazz-solo-piano-px578722", "Solo Piano", "leberch"],
      ["jazz-piano-trio-px611049", "Piano Trio", "lnplusmusic"],
      ["jazz-mallets-px519632", "Mallets", "atlasaudio"],
    ],
  ),
  station(
    "mellow-sax",
    { zh: "慢萨克斯", en: "Mellow Sax" },
    { zh: "松弛的萨克斯，像雨天下午", en: "Unhurried sax for a rainy afternoon" },
    [
      ["jazz-cafe-morning-px556238", "Café Morning", "alex-morgan"],
      ["jazz-cocktail-lounge-px556246", "Cocktail Lounge", "alex-morgan"],
      ["jazz-rainy-night-px556239", "Rainy Night", "alex-morgan"],
      ["jazz-restaurant-px556244", "Restaurant", "alex-morgan"],
      ["jazz-relaxing-px588904", "Relaxing", "aurec"],
      ["jazz-cool-px598432", "Cool Jazz", "aurec"],
      ["jazz-elegant-px525518", "Elegant", "waveloom"],
      ["jazz-west-coast-cafe-px348267", "West Coast Café", "tunetank"],
    ],
  ),
  station(
    "cocktail-hour",
    { zh: "鸡尾酒时间", en: "Cocktail Hour" },
    { zh: "更亮的萨克斯和铜管，傍晚小酒馆", en: "Brighter sax and brass, early evening" },
    [
      ["jazz-cocktail-bar-px556247", "Cocktail Bar", "alex-morgan"],
      ["jazz-midnight-club-px563583", "Midnight Club", "alex-morgan"],
      ["jazz-rainy-lounge-brass-px556235", "Rainy Lounge", "alex-morgan"],
      ["jazz-rainy-night-px563584", "Rainy Night II", "alex-morgan"],
      ["jazz-restaurant-px563578", "Restaurant II", "alex-morgan"],
      ["jazz-study-px563581", "Study", "alex-morgan"],
      ["jazz-smooth-coffee-shop-px568173", "Smooth Coffee Shop", "alex-morgan"],
    ],
  ),
  station(
    "lofi-jazz",
    { zh: "Lo-fi 爵士", en: "Lo-fi Jazz" },
    { zh: "带节拍的爵士和弦，轻轻点头", en: "Jazzy chords over a soft beat" },
    [
      ["jazz-lofi-px587555", "Lo-fi", "aurec"],
      ["jazz-lofi-px596980", "Lo-fi", "velariomusic"],
      ["jazz-lofi-px582886", "Lo-fi", "zephiramusic"],
      ["jazz-lounge-beat-px589986", "Lounge Beat", "atlasaudio"],
      ["jazz-smooth-beat-px589997", "Smooth Beat", "atlasaudio"],
      ["jazz-light-tread-px594985", "Light Tread", "ornave"],
      ["jazz-beat-px490623", "Beat", "atlasaudio"],
      ["jazz-sunny-cafe-nu-jazz-px587413", "Sunny Café", "alex-morgan"],
    ],
  ),
  station(
    "guitar-patio",
    { zh: "吉他露台", en: "Guitar Patio" },
    { zh: "轻快的吉他，像露天座位", en: "Light guitar for a seat outside" },
    [
      ["jazz-guitar-px576304", "Guitar", "andriih"],
      ["jazz-coffee-guitar-px593167", "Coffee Guitar", "aurec"],
      ["jazz-cafe-guitar-px585969", "Café Guitar", "aurec"],
      ["jazz-guitar-drums-px495626", "Guitar and Drums", "freemusicforvideo"],
      ["jazz-cafe-guitar-px496552", "Café Guitar", "the_mountain"],
    ],
  ),
  station(
    "swing-time",
    { zh: "摇摆时光", en: "Swing Time" },
    { zh: "老派摇摆，最有精神的一组", en: "Old-school swing with the most energy" },
    [
      ["jazz-swing-study-session-px568162", "Swing Study Session", "alex-morgan"],
      ["jazz-upbeat-px589698", "Upbeat", "aurec"],
      ["jazz-brass-band-px485401", "Brass Band", "tatamusic"],
      ["jazz-old-time-px515630", "Old Time", "starostin"],
      ["jazz-busy-cafe-px516774", "Busy Café", "waveloom"],
      ["jazz-new-orleans-club-px164472", "New Orleans Club", "paoloargento"],
    ],
  ),
];
