import YouTubeStation from "./YouTubeStation.jsx";
import { YOUTUBE_STATIONS } from "../lib/youtube.js";

// The YouTube station card under its slider: presets, paste-a-link form and the player.
function StationPicker({ copy, lang, youtube, volume, playing }) {
  return (
    <div className="youtube-station">
      <div className="station-list" aria-label={copy.youtubeStationsAria}>
        {YOUTUBE_STATIONS.map((station) => (
          <button
            className={youtube.id === station.id ? "active" : ""}
            key={station.id}
            type="button"
            aria-pressed={youtube.id === station.id}
            onClick={() => youtube.setId(station.id)}
          >
            {station.name[lang]}
          </button>
        ))}
        {!YOUTUBE_STATIONS.some((station) => station.id === youtube.id) && (
          <button className="active" type="button" aria-pressed="true">
            {copy.youtubeCustom}
          </button>
        )}
      </div>
      <form className="station-form" onSubmit={youtube.submitLink}>
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
        volume={volume}
        playing={playing}
        onUnavailable={youtube.setUnavailableId}
      />
      {youtube.unavailableId === youtube.id ? (
        <p className="station-error" role="alert">
          {copy.youtubeUnavailable}
        </p>
      ) : (
        <p className="station-note">{playing ? copy.youtubeNote : copy.youtubeIdle}</p>
      )}
    </div>
  );
}

export default StationPicker;
