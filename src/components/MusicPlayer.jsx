import { useRef } from "react";
import { ChevronDown, ChevronUp, Pause, Play, Radio } from "lucide-react";
import SoundSlider from "./SoundSlider.jsx";
import YouTubeStation from "./YouTubeStation.jsx";
import { DEFAULT_MUSIC_LEVEL } from "../lib/music.js";
import { YOUTUBE_STATIONS, parseYouTubeId } from "../lib/youtube.js";

// The music player on the focus scene: a translucent card at the bottom right, a one-line
// bar when collapsed. Music has one slot, so every source lives here; for now that is the
// YouTube station (the jazz stations follow once their audio is hosted). YouTube's terms
// want the video on screen while it plays, so the card stays open while YouTube plays and
// collapsing it pauses the station. `sound` is the object returned by useSoundscape.
function MusicPlayer({ copy, lang, sound, open, onOpenChange }) {
  const { layerMix, updateLayer, youtube } = sound;
  const level = layerMix.youtube ?? 0;
  const playing = sound.enabled && level > 0;
  const expanded = open || playing;
  // The level to come back to after a pause.
  const lastLevel = useRef(DEFAULT_MUSIC_LEVEL);
  if (level > 0) lastLevel.current = level;
  const station = YOUTUBE_STATIONS.find((item) => item.id === youtube.id);
  const stationName = station ? station.name[lang] : copy.youtubeCustom;

  const play = () => {
    if (!sound.enabled) sound.toggleAmbience();
    updateLayer("youtube", lastLevel.current);
    onOpenChange(true);
  };
  const pause = () => updateLayer("youtube", 0);
  const collapse = () => {
    if (playing) pause();
    onOpenChange(false);
  };
  const pickStation = (id) => {
    youtube.setId(id);
    if (!playing) play();
  };
  const submitLink = (event) => {
    const valid = parseYouTubeId(youtube.input) !== null;
    youtube.submitLink(event);
    if (valid && !playing) play();
  };

  return (
    <div className={`music-player${expanded ? " open" : ""}`} aria-label={copy.playerTitle}>
      <div className="player-mini">
        <span className="player-cover" aria-hidden="true">
          <Radio />
        </span>
        <button
          className="player-now"
          type="button"
          aria-expanded={expanded}
          onClick={() => (expanded ? collapse() : onOpenChange(true))}
        >
          <strong>{stationName}</strong>
          <span>{copy.youtubeLabel}</span>
        </button>
        <button
          className="player-button"
          type="button"
          aria-label={playing ? copy.pauseMusic : copy.playMusic}
          title={playing ? copy.pauseMusic : copy.playMusic}
          onClick={playing ? pause : play}
        >
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
        <button
          className="player-button"
          type="button"
          aria-label={expanded ? copy.playerCollapse : copy.playerExpand}
          title={expanded ? copy.playerCollapse : copy.playerExpand}
          onClick={() => (expanded ? collapse() : onOpenChange(true))}
        >
          {expanded ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
        </button>
      </div>
      {expanded && (
        <div className="player-full">
          <div className="station-list" aria-label={copy.youtubeStationsAria}>
            {YOUTUBE_STATIONS.map((item) => (
              <button
                className={youtube.id === item.id ? "active" : ""}
                key={item.id}
                type="button"
                aria-pressed={youtube.id === item.id}
                onClick={() => pickStation(item.id)}
              >
                {item.name[lang]}
              </button>
            ))}
            {!station && (
              <button className="active" type="button" aria-pressed="true">
                {copy.youtubeCustom}
              </button>
            )}
          </div>
          <form className="station-form" onSubmit={submitLink}>
            <input
              type="url"
              inputMode="url"
              value={youtube.input}
              onChange={(event) => youtube.changeInput(event.target.value)}
              placeholder={copy.youtubePaste}
              aria-label={copy.youtubePaste}
              aria-invalid={youtube.error}
            />
            <button type="submit" disabled={!youtube.input.trim()}>
              {copy.youtubeUse}
            </button>
          </form>
          {youtube.error && (
            <p className="station-error" role="alert">
              {copy.youtubeInvalid}
            </p>
          )}
          <YouTubeStation
            videoId={youtube.id}
            volume={level}
            playing={sound.enabled}
            onUnavailable={youtube.setUnavailableId}
          />
          {youtube.unavailableId === youtube.id ? (
            <p className="station-error" role="alert">
              {copy.youtubeUnavailable}
            </p>
          ) : (
            <p className="station-note">{playing ? copy.youtubeNote : copy.playerCollapseNote}</p>
          )}
          <SoundSlider
            icon={<Radio aria-hidden="true" />}
            label={copy.youtubeLabel}
            value={level}
            onChange={(value) => updateLayer("youtube", value)}
          />
        </div>
      )}
    </div>
  );
}

export default MusicPlayer;
