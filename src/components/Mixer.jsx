import {
  Bean,
  Bird,
  Car,
  CloudRain,
  Coffee,
  Keyboard,
  Music,
  Radio,
  Utensils,
  Volume2,
  VolumeX,
} from "lucide-react";
import SoundSlider from "./SoundSlider.jsx";
import StationPicker from "./StationPicker.jsx";
import TimeSlotButtons from "./TimeSlotButtons.jsx";
import { JAZZ_ENABLED, JAZZ_MODES } from "../lib/music.js";

// The room-sound controls on the focus scene: ambience switch, time slot, one slider per
// layer, then the two music sources (jazz and the YouTube station, which exclude each other).
// `sound` is the object returned by useSoundscape.
function Mixer({ copy, lang, sound }) {
  const { layerMix, updateLayer, timeSlot } = sound;
  return (
    <>
      <button
        className={`sound-toggle ${sound.enabled ? "enabled" : ""}`}
        type="button"
        onClick={sound.toggleAmbience}
      >
        {sound.enabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        {sound.enabled ? copy.ambienceOn : copy.startAmbience}
      </button>
      <div className="mixer">
        <TimeSlotButtons copy={copy} value={timeSlot} onChange={sound.setTimeSlot} />
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
          icon={<Car aria-hidden="true" />}
          label={copy.soundLabels.traffic}
          value={layerMix.traffic}
          onChange={(value) => updateLayer("traffic", value)}
        />
        {timeSlot === "morning" && (
          <SoundSlider
            icon={<Bird aria-hidden="true" />}
            label={copy.soundLabels.birds}
            value={layerMix.birds ?? 0}
            onChange={(value) => updateLayer("birds", value)}
          />
        )}
        <SoundSlider
          icon={<Keyboard aria-hidden="true" />}
          label={copy.soundLabels.keys}
          value={layerMix.keys}
          onChange={(value) => updateLayer("keys", value)}
        />
        <SoundSlider
          icon={<Utensils aria-hidden="true" />}
          label={copy.soundLabels.cups}
          value={layerMix.cups}
          onChange={(value) => updateLayer("cups", value)}
        />
        <SoundSlider
          icon={<Bean aria-hidden="true" />}
          label={copy.soundLabels.backCounter}
          value={layerMix.backCounter}
          onChange={(value) => updateLayer("backCounter", value)}
        />
        {JAZZ_ENABLED ? (
          <>
            <SoundSlider
              icon={<Music aria-hidden="true" />}
              label={copy.soundLabels.jazz}
              value={layerMix.jazz ?? 0}
              onChange={(value) => updateLayer("jazz", value)}
            />
            <div className="mode-buttons jazz-modes" aria-label={copy.jazzModeLabel}>
              {JAZZ_MODES.map((mode) => (
                <button
                  className={sound.jazzMode === mode ? "active" : ""}
                  key={mode}
                  type="button"
                  aria-pressed={sound.jazzMode === mode}
                  onClick={() => sound.chooseJazzMode(mode)}
                >
                  {copy.jazzModes[mode]}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="layer-paused" role="note">
            <span>
              <Music aria-hidden="true" />
              {copy.soundLabels.jazz}
            </span>
            <p>{copy.jazzPaused}</p>
          </div>
        )}
        <SoundSlider
          icon={<Radio aria-hidden="true" />}
          label={copy.youtubeLabel}
          value={layerMix.youtube ?? 0}
          onChange={(value) => updateLayer("youtube", value)}
        />
        {(layerMix.youtube ?? 0) > 0 && (
          <StationPicker
            copy={copy}
            lang={lang}
            youtube={sound.youtube}
            volume={layerMix.youtube ?? 0}
            playing={sound.enabled}
          />
        )}
      </div>
    </>
  );
}

export default Mixer;
