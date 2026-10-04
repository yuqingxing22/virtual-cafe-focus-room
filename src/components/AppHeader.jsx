import { Coffee, Volume2, VolumeX } from "lucide-react";

const PROGRESS_SCENES = ["entrance", "order", "seat", "setup", "focus"];

// Brand, language switch, mute button (hidden at the door) and the progress dots.
function AppHeader({ copy, lang, onLangChange, scene, ambienceOn, onToggleAmbience }) {
  return (
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
            onClick={() => onLangChange("en")}
          >
            EN
          </button>
          <button
            className={lang === "zh" ? "active" : ""}
            type="button"
            onClick={() => onLangChange("zh")}
          >
            中文
          </button>
        </div>
        {scene !== "entrance" && (
          <button
            className={`ambience-switch ${ambienceOn ? "on" : ""}`}
            type="button"
            aria-pressed={ambienceOn}
            aria-label={ambienceOn ? copy.muteAmbience : copy.unmuteAmbience}
            title={ambienceOn ? copy.muteAmbience : copy.unmuteAmbience}
            onClick={onToggleAmbience}
          >
            {ambienceOn ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
          </button>
        )}
        <div
          className="progress-dots"
          role="img"
          aria-label={`${copy.currentScene}: ${copy.sceneNames[scene] ?? scene}`}
        >
          {PROGRESS_SCENES.map((item) => (
            <span
              className={item === scene ? "active" : ""}
              key={item}
              title={copy.sceneNames[item]}
            />
          ))}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
