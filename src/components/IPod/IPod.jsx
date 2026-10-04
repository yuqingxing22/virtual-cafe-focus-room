import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { JAZZ_STATIONS } from "../../data/jazzStations.js";
import { readStored, writeStored } from "../../lib/storage.js";
import { StationCover } from "./covers.jsx";
import { useStationPlayer } from "./useStationPlayer.js";
import "./ipod.css";

const COLOR_KEY = "cafe-focus-ipod-color";
const isHexColor = (value) => /^#[0-9a-f]{6}$/i.test(value);

const BODY_COLORS = [
  { value: "#d9dadc", name: { zh: "银色", en: "Silver" } },
  { value: "#2b2b2e", name: { zh: "石墨黑", en: "Graphite" } },
  { value: "#e9dcc3", name: { zh: "奶油色", en: "Cream" } },
  { value: "#f0a6b8", name: { zh: "粉色", en: "Pink" } },
  { value: "#c8323c", name: { zh: "红色", en: "Red" } },
  { value: "#f0a04b", name: { zh: "橙色", en: "Orange" } },
  { value: "#9ccf8a", name: { zh: "绿色", en: "Green" } },
  { value: "#7fb2d9", name: { zh: "蓝色", en: "Blue" } },
  { value: "#a58ad6", name: { zh: "紫色", en: "Purple" } },
];

const IPOD_COPY = {
  zh: {
    label: "爵士播放器",
    browse: "爵士电台",
    nowPlaying: "正在播放",
    menu: "菜单",
    previous: "上一个",
    next: "下一个",
    playPause: "播放或暂停",
    select: "选择",
    failed: "这首暂时放不了，换一首试试",
    color: "机身颜色",
    customColor: "自选颜色",
    of: (index, total) => `第 ${index} 首，共 ${total} 首`,
  },
  en: {
    label: "Jazz player",
    browse: "Jazz Radio",
    nowPlaying: "Now Playing",
    menu: "Menu",
    previous: "Previous",
    next: "Next",
    playPause: "Play or pause",
    select: "Select",
    failed: "This one won't play right now. Try another.",
    color: "Body colour",
    customColor: "Custom colour",
    of: (index, total) => `${index} of ${total}`,
  },
};

const FLOW_STEP_DEGREES = 45;
const VOLUME_STEP_DEGREES = 18;
const SWIPE_STEP_PX = 44;

// Dark bodies get the black click wheel, everything else the white one.
const toneOf = (hex) => {
  const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.3 ? "dark" : "light";
};

const formatClock = (seconds) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

const coverTransform = (offset) => {
  if (offset === 0) return { transform: "translateX(0) translateZ(40px) rotateY(0deg)", zIndex: 10 };
  const side = Math.sign(offset);
  const distance = Math.abs(offset);
  return {
    transform: `translateX(${side * (62 + (distance - 1) * 24)}px) translateZ(-30px) rotateY(${-side * 60}deg)`,
    zIndex: 10 - distance,
    opacity: distance > 3 ? 0 : 1,
  };
};

const CORD_PATH =
  "M222 92 C 222 14, 332 -6, 346 78 C 354 130, 394 170, 388 230 C 386 282, 300 288, 296 234 " +
  "C 292 180, 382 176, 390 238 C 394 292, 306 298, 300 246 C 296 196, 370 190, 374 242 " +
  "C 378 302, 345 330, 345 384";
const LEFT_WIRE = "M345 384 C 326 422, 312 452, 316 488";
const RIGHT_WIRE = "M345 384 C 366 428, 386 472, 380 522";

function Earbud({ x, y, side }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className="ipod-bud-stem" x={-5} y={-4} width={10} height={44} rx={5} />
      <circle className="ipod-bud" cx={side * 9} cy={46} r={19} />
      <circle className="ipod-bud-ring" cx={side * 9} cy={46} r={13} />
      <circle className="ipod-bud-mesh" cx={side * 9} cy={46} r={10} />
    </g>
  );
}

function Earphones() {
  return (
    <svg className="ipod-cord" viewBox="0 0 420 600" aria-hidden="true">
      <path className="ipod-cord-edge" d={CORD_PATH} />
      <path className="ipod-cord-wire" d={CORD_PATH} />
      <g className="ipod-cord-drop">
        <path className="ipod-cord-edge thin" d={LEFT_WIRE} />
        <path className="ipod-cord-wire thin" d={LEFT_WIRE} />
        <path className="ipod-cord-edge thin" d={RIGHT_WIRE} />
        <path className="ipod-cord-wire thin" d={RIGHT_WIRE} />
        <Earbud x={316} y={488} side={-1} />
        <Earbud x={380} y={522} side={1} />
      </g>
      <rect className="ipod-cord-splitter" x={338} y={372} width={14} height={24} rx={6} />
      <rect className="ipod-plug-sleeve" x={214} y={86} width={16} height={22} rx={4} />
      <rect className="ipod-plug-metal" x={218} y={106} width={8} height={6} />
    </svg>
  );
}

export default function IPod({ lang = "zh", stations = JAZZ_STATIONS }) {
  const copy = IPOD_COPY[lang] ?? IPOD_COPY.zh;
  const player = useStationPlayer(stations);
  const [view, setView] = useState("flow");
  const [browseIndex, setBrowseIndex] = useState(0);
  const [color, setColor] = useState(() => readStored(COLOR_KEY, BODY_COLORS[0].value, isHexColor));
  const [volumeShown, setVolumeShown] = useState(false);
  const wheelRef = useRef(null);
  const suppressClickRef = useRef(false);
  const volumeTimerRef = useRef(null);

  const hasStation = player.stationIndex !== null;
  const playingStation = hasStation ? stations[player.stationIndex] : null;
  const track = playingStation?.tracks[player.trackIndex];
  const browsed = stations[browseIndex];

  useEffect(() => () => window.clearTimeout(volumeTimerRef.current), []);

  const pickColor = (value) => {
    setColor(value);
    writeStored(COLOR_KEY, value);
  };

  const moveBrowse = (direction) =>
    setBrowseIndex((index) => Math.max(0, Math.min(stations.length - 1, index + direction)));

  const nudgeVolume = (direction) => {
    player.setVolume((value) => value + direction * 0.05);
    setVolumeShown(true);
    window.clearTimeout(volumeTimerRef.current);
    volumeTimerRef.current = window.setTimeout(() => setVolumeShown(false), 1500);
  };

  const openStation = (index) => {
    if (index !== player.stationIndex) player.playTrack(index, 0);
    setView("playing");
  };

  const onMenu = () => {
    if (view === "playing") {
      setBrowseIndex(player.stationIndex ?? browseIndex);
      setView("flow");
    } else if (hasStation) {
      setView("playing");
    }
  };

  const onStep = (direction) => {
    if (view === "flow") moveBrowse(direction);
    else player.skip(direction);
  };

  const onPlayPause = () => {
    if (hasStation) player.toggle();
    else openStation(browseIndex);
  };

  const onSelect = () => {
    if (view === "flow") openStation(browseIndex);
    else player.toggle();
  };

  // The wheel and swipe handlers stay attached to window for the length of a drag, so they
  // read the latest state through this ref.
  const turnRef = useRef(null);
  turnRef.current = (direction) => {
    if (view === "flow") moveBrowse(direction);
    else nudgeVolume(direction);
  };

  const finishDrag = (moved) => {
    if (!moved) return;
    // A drag that ends over a button must not also count as a press of that button.
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const onWheelPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    if (Math.hypot(event.clientX - cx, event.clientY - cy) < rect.width * 0.2) return;
    const stepDegrees = view === "flow" ? FLOW_STEP_DEGREES : VOLUME_STEP_DEGREES;
    let last = Math.atan2(event.clientY - cy, event.clientX - cx);
    let pending = 0;
    let travelled = 0;

    const onMove = (moveEvent) => {
      const angle = Math.atan2(moveEvent.clientY - cy, moveEvent.clientX - cx);
      let delta = ((angle - last) * 180) / Math.PI;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      last = angle;
      pending += delta;
      travelled += Math.abs(delta);
      while (Math.abs(pending) >= stepDegrees) {
        const direction = Math.sign(pending);
        pending -= direction * stepDegrees;
        turnRef.current(direction);
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      finishDrag(travelled > 12);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const onFlowPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    let lastX = event.clientX;
    let pending = 0;
    let travelled = 0;

    const onMove = (moveEvent) => {
      const delta = moveEvent.clientX - lastX;
      lastX = moveEvent.clientX;
      pending += delta;
      travelled += Math.abs(delta);
      while (Math.abs(pending) >= SWIPE_STEP_PX) {
        const direction = Math.sign(pending);
        pending -= direction * SWIPE_STEP_PX;
        // Dragging the covers to the left brings the next one in.
        turnRef.current(-direction);
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      finishDrag(travelled > 8);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const swallowClickAfterDrag = (event) => {
    if (!suppressClickRef.current) return;
    event.stopPropagation();
    event.preventDefault();
  };

  const onKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (event.target instanceof HTMLInputElement) return;
    event.preventDefault();
    turnRef.current(event.key === "ArrowRight" ? 1 : -1);
  };

  const progress = player.time.duration > 0 ? player.time.current / player.time.duration : 0;

  return (
    <div className="ipod-rig" style={{ "--ipod-color": color }} data-tone={toneOf(color)}>
      <Earphones />
      <div className="ipod" role="group" aria-label={copy.label} onKeyDown={onKeyDown}>
        <div className="ipod-screen">
          <div className="ipod-statusbar">
            <span className="ipod-status-icon">
              {hasStation ? player.playing ? <Play size={9} fill="currentColor" /> : <Pause size={9} fill="currentColor" /> : null}
            </span>
            <span className="ipod-status-title">{view === "flow" ? copy.browse : copy.nowPlaying}</span>
            <span className="ipod-battery" aria-hidden="true" />
          </div>

          <div
            className="ipod-view ipod-flow"
            data-active={view === "flow"}
            inert={view !== "flow"}
            onPointerDown={onFlowPointerDown}
            onClickCapture={swallowClickAfterDrag}
          >
            <div className="ipod-flow-stage">
              {stations.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className="ipod-flow-cover"
                  style={coverTransform(index - browseIndex)}
                  aria-label={item.name[lang] ?? item.name.en}
                  aria-current={index === browseIndex}
                  tabIndex={index === browseIndex ? 0 : -1}
                  onClick={() => (index === browseIndex ? openStation(index) : setBrowseIndex(index))}
                >
                  <StationCover station={item} decorative />
                  <span className="ipod-cover-reflection" aria-hidden="true">
                    <StationCover station={item} decorative />
                  </span>
                </button>
              ))}
            </div>
            <div className="ipod-flow-caption" aria-live="polite">
              <strong>{browsed.name[lang] ?? browsed.name.en}</strong>
              <span>{browsed.blurb[lang] ?? browsed.blurb.en}</span>
            </div>
          </div>

          <div className="ipod-view ipod-now" data-active={view === "playing"} inert={view !== "playing"}>
            {playingStation && track ? (
              <>
                <div className="ipod-now-main">
                  <div className="ipod-now-cover">
                    <StationCover station={playingStation} />
                    <span className="ipod-cover-reflection" aria-hidden="true">
                      <StationCover station={playingStation} decorative />
                    </span>
                  </div>
                  <div className="ipod-now-text">
                    <strong>{track.title}</strong>
                    <span>{track.artist}</span>
                    <span>{playingStation.name[lang] ?? playingStation.name.en}</span>
                    <small>{copy.of(player.trackIndex + 1, playingStation.tracks.length)}</small>
                    {player.failed ? <em role="status">{copy.failed}</em> : null}
                  </div>
                </div>
                {volumeShown ? (
                  <div className="ipod-now-bar">
                    <Volume2 size={11} />
                    <span className="ipod-meter volume">
                      <span style={{ width: `${Math.round(player.volume * 100)}%` }} />
                    </span>
                  </div>
                ) : (
                  <div className="ipod-now-bar">
                    <span>{formatClock(player.time.current)}</span>
                    <span className="ipod-meter">
                      <span style={{ width: `${(progress * 100).toFixed(1)}%` }} />
                    </span>
                    <span>-{formatClock(Math.max(0, player.time.duration - player.time.current))}</span>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        <div className="ipod-wheel" ref={wheelRef} onPointerDown={onWheelPointerDown} onClickCapture={swallowClickAfterDrag}>
          <button type="button" className="ipod-wheel-button menu" aria-label={copy.menu} onClick={onMenu}>
            MENU
          </button>
          <button type="button" className="ipod-wheel-button previous" aria-label={copy.previous} onClick={() => onStep(-1)}>
            <SkipBack size={15} fill="currentColor" />
          </button>
          <button type="button" className="ipod-wheel-button next" aria-label={copy.next} onClick={() => onStep(1)}>
            <SkipForward size={15} fill="currentColor" />
          </button>
          <button type="button" className="ipod-wheel-button play" aria-label={copy.playPause} aria-pressed={player.playing} onClick={onPlayPause}>
            <Play size={11} fill="currentColor" />
            <Pause size={11} fill="currentColor" />
          </button>
          <button type="button" className="ipod-wheel-center" aria-label={copy.select} onClick={onSelect} />
        </div>
      </div>

      <div className="ipod-colors" role="group" aria-label={copy.color}>
        {BODY_COLORS.map((option) => (
          <button
            key={option.value}
            type="button"
            className="ipod-swatch"
            style={{ background: option.value }}
            aria-label={option.name[lang] ?? option.name.en}
            aria-pressed={color.toLowerCase() === option.value}
            onClick={() => pickColor(option.value)}
          />
        ))}
        <label className="ipod-swatch custom" title={copy.customColor}>
          <input type="color" value={color} aria-label={copy.customColor} onChange={(event) => pickColor(event.target.value)} />
        </label>
      </div>
    </div>
  );
}
