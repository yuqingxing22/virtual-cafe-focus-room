import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Pause, Play, Radio, SkipBack, SkipForward } from "lucide-react";
import { StationCover } from "./IPod/covers.jsx";
import { useStationPlayer } from "./IPod/useStationPlayer.js";
import SoundSlider from "./SoundSlider.jsx";
import YouTubeStation from "./YouTubeStation.jsx";
import { JAZZ_STATIONS } from "../data/jazzStations.js";
import { formatTime } from "../lib/format.js";
import { DEFAULT_MUSIC_LEVEL, readMusicSource } from "../lib/music.js";
import { readStored, writeStored } from "../lib/storage.js";
import { YOUTUBE_STATIONS, parseYouTubeId } from "../lib/youtube.js";

const JAZZ_STATION_KEY = "cafe-focus-jazz-station";
const readJazzStation = () =>
  readStored(JAZZ_STATION_KEY, JAZZ_STATIONS[0].id, (value) =>
    JAZZ_STATIONS.some((station) => station.id === value),
  );

// The music player on the focus scene: a translucent card at the bottom right, a one-line
// bar when collapsed. Music has one slot, so both sources live here: six jazz stations
// (licensed recordings hosted by the café, played through useStationPlayer) and the YouTube
// station. The mix decides what plays: `layerMix.jazz` and `layerMix.youtube` are the two
// volumes and useSoundscape keeps at most one of them above zero. YouTube's terms want its
// video on screen while it plays, so the card stays open then and collapsing pauses it.
function MusicPlayer({ copy, lang, sound, open, onOpenChange }) {
  const { layerMix, updateLayer, youtube } = sound;
  const jazzLevel = layerMix.jazz ?? 0;
  const youtubeLevel = layerMix.youtube ?? 0;
  const jazzWanted = sound.enabled && jazzLevel > 0;
  const youtubePlaying = sound.enabled && youtubeLevel > 0;
  const expanded = open || youtubePlaying;

  // Which source the card shows: the one playing, otherwise the last one chosen.
  const [chosen, setChosen] = useState(() =>
    youtubeLevel > 0 ? "youtube" : jazzLevel > 0 ? "jazz" : readMusicSource(),
  );
  const source = youtubeLevel > 0 ? "youtube" : jazzLevel > 0 ? "jazz" : chosen;
  // Levels to come back to after a pause.
  const lastLevel = useRef({ jazz: DEFAULT_MUSIC_LEVEL, youtube: DEFAULT_MUSIC_LEVEL });
  if (jazzLevel > 0) lastLevel.current.jazz = jazzLevel;
  if (youtubeLevel > 0) lastLevel.current.youtube = youtubeLevel;

  // Jazz: the chosen station and the element that plays it.
  const [stationId, setStationId] = useState(readJazzStation);
  useEffect(() => {
    writeStored(JAZZ_STATION_KEY, stationId);
  }, [stationId]);
  const stationIndex = Math.max(
    0,
    JAZZ_STATIONS.findIndex((station) => station.id === stationId),
  );
  const station = JAZZ_STATIONS[stationIndex];
  const jazz = useStationPlayer(JAZZ_STATIONS, jazzLevel > 0 ? jazzLevel : DEFAULT_MUSIC_LEVEL);
  const { setVolume: setJazzVolume, playTrack, toggle: toggleJazz } = jazz;

  useEffect(() => {
    setJazzVolume(jazzLevel);
  }, [jazzLevel, setJazzVolume]);

  // Keep the element in step with the mix, the room-sound switch and the chosen station.
  // A track that will not play is left alone until the visitor skips it.
  useEffect(() => {
    if (jazzWanted) {
      if (jazz.failed) return;
      if (jazz.stationIndex !== stationIndex) playTrack(stationIndex, 0);
      else if (!jazz.playing) toggleJazz();
    } else if (jazz.playing) {
      toggleJazz();
    }
  }, [jazzWanted, jazz.failed, jazz.playing, jazz.stationIndex, stationIndex, playTrack, toggleJazz]);

  const roomOn = () => {
    if (!sound.enabled) sound.toggleAmbience();
  };
  const playJazz = () => {
    roomOn();
    setChosen("jazz");
    updateLayer("jazz", lastLevel.current.jazz);
  };
  const playYoutube = () => {
    roomOn();
    setChosen("youtube");
    updateLayer("youtube", lastLevel.current.youtube);
    onOpenChange(true);
  };
  const pause = () => updateLayer(source, 0);
  const playing = source === "youtube" ? youtubePlaying : jazzWanted;
  const play = source === "youtube" ? playYoutube : playJazz;
  const collapse = () => {
    if (youtubePlaying) pause();
    onOpenChange(false);
  };
  const pickJazzStation = (id) => {
    setStationId(id);
    if (!jazzWanted) playJazz();
  };
  const pickYoutubeStation = (id) => {
    youtube.setId(id);
    if (!youtubePlaying) playYoutube();
  };
  const submitLink = (event) => {
    const valid = parseYouTubeId(youtube.input) !== null;
    youtube.submitLink(event);
    if (valid && !youtubePlaying) playYoutube();
  };

  const youtubeStation = YOUTUBE_STATIONS.find((item) => item.id === youtube.id);
  const track = station.tracks[jazz.stationIndex === stationIndex ? jazz.trackIndex : 0];
  const title =
    source === "youtube" ? (youtubeStation ? youtubeStation.name[lang] : copy.youtubeCustom) : track.title;
  const subtitle = source === "youtube" ? copy.youtubeLabel : station.name[lang];
  const progress =
    source === "jazz" && jazz.time.duration > 0 ? jazz.time.current / jazz.time.duration : 0;

  return (
    <div className={`music-player${expanded ? " open" : ""}`} aria-label={copy.playerTitle}>
      <div className="player-mini">
        <span className="player-cover" aria-hidden="true">
          {source === "youtube" ? <Radio /> : <StationCover station={station} decorative />}
        </span>
        <button
          className="player-now"
          type="button"
          aria-expanded={expanded}
          onClick={() => (expanded ? collapse() : onOpenChange(true))}
        >
          <strong>{title}</strong>
          <span>{subtitle}</span>
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
        {source === "jazz" && (
          <button className="player-button" type="button" aria-label={copy.nextTrack} title={copy.nextTrack} onClick={() => jazz.skip(1)}>
            <SkipForward aria-hidden="true" />
          </button>
        )}
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
          <div className="station-list sources" aria-label={copy.sourceLabel}>
            {JAZZ_STATIONS.map((item) => (
              <button
                className={source === "jazz" && item.id === stationId ? "active" : ""}
                key={item.id}
                type="button"
                aria-pressed={source === "jazz" && item.id === stationId}
                onClick={() => pickJazzStation(item.id)}
              >
                {item.name[lang]}
              </button>
            ))}
            <button
              className={`source-youtube${source === "youtube" ? " active" : ""}`}
              type="button"
              aria-pressed={source === "youtube"}
              onClick={() => (source === "youtube" ? undefined : playYoutube())}
            >
              {copy.youtubeLabel}
            </button>
          </div>

          {source === "jazz" ? (
            <>
              <div className="player-track">
                <StationCover station={station} className="player-track-cover" decorative />
                <div className="player-track-text">
                  <strong>{track.title}</strong>
                  <span>
                    {track.artist} · {station.name[lang]}
                  </span>
                  <span className="player-track-blurb">{station.blurb[lang]}</span>
                </div>
              </div>
              <div className="player-progress" aria-hidden="true">
                <i style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <div className="player-times" aria-hidden="true">
                {formatTime(Math.floor(jazz.time.current))} / {formatTime(Math.floor(jazz.time.duration))}
              </div>
              <div className="player-controls">
                <button className="player-button" type="button" aria-label={copy.prevTrack} title={copy.prevTrack} onClick={() => jazz.skip(-1)}>
                  <SkipBack aria-hidden="true" />
                </button>
                <button className="player-button" type="button" aria-label={playing ? copy.pauseMusic : copy.playMusic} onClick={playing ? pause : play}>
                  {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
                </button>
                <button className="player-button" type="button" aria-label={copy.nextTrack} title={copy.nextTrack} onClick={() => jazz.skip(1)}>
                  <SkipForward aria-hidden="true" />
                </button>
              </div>
              {jazz.failed ? (
                <p className="station-error" role="alert">
                  {copy.trackFailed}
                </p>
              ) : (
                <p className="station-note">{copy.jazzNote}</p>
              )}
              <SoundSlider
                icon={<Play aria-hidden="true" />}
                label={copy.soundLabels.jazz}
                value={jazzLevel}
                onChange={(value) => updateLayer("jazz", value)}
              />
            </>
          ) : (
            <>
              <div className="station-list" aria-label={copy.youtubeStationsAria}>
                {YOUTUBE_STATIONS.map((item) => (
                  <button
                    className={youtube.id === item.id ? "active" : ""}
                    key={item.id}
                    type="button"
                    aria-pressed={youtube.id === item.id}
                    onClick={() => pickYoutubeStation(item.id)}
                  >
                    {item.name[lang]}
                  </button>
                ))}
                {!youtubeStation && (
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
                volume={youtubeLevel}
                playing={sound.enabled}
                onUnavailable={youtube.setUnavailableId}
              />
              {youtube.unavailableId === youtube.id ? (
                <p className="station-error" role="alert">
                  {copy.youtubeUnavailable}
                </p>
              ) : (
                <p className="station-note">{youtubePlaying ? copy.youtubeNote : copy.playerCollapseNote}</p>
              )}
              <SoundSlider
                icon={<Radio aria-hidden="true" />}
                label={copy.youtubeLabel}
                value={youtubeLevel}
                onChange={(value) => updateLayer("youtube", value)}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default MusicPlayer;
