import { Coffee, Volume2, VolumeX } from "lucide-react";

const PROGRESS_SCENES = ["entrance", "order", "seat", "setup", "focus"];

// One row: brand, the five-step progress bar with its label, mute (hidden at the door)
// and the language switch. On phones the brand keeps only its icon.
function AppHeader({ copy, lang, onLangChange, scene, ambienceOn, onToggleAmbience }) {
  const stepIndex = scene === "complete" ? PROGRESS_SCENES.length - 1 : PROGRESS_SCENES.indexOf(scene);
  const stepName = copy.sceneNames[scene] ?? scene;
  return (
    <header className="app-header" aria-label={copy.appName}>
      <div className="brand">
        <Coffee aria-hidden="true" />
        <span>{copy.appName}</span>
      </div>
      <div className="progress-steps" aria-label={`${copy.currentScene}: ${stepIndex + 1} / ${PROGRESS_SCENES.length}, ${stepName}`}>
        <ol>
          {PROGRESS_SCENES.map((item, index) => (
            <li
              className={index < stepIndex ? "done" : index === stepIndex ? "now" : ""}
              key={item}
              aria-current={index === stepIndex ? "step" : undefined}
              title={copy.sceneNames[item]}
            >
              <span className="visually-hidden">{copy.sceneNames[item]}</span>
            </li>
          ))}
        </ol>
        <span className="progress-label" aria-hidden="true">
          {stepIndex + 1} / {PROGRESS_SCENES.length} {stepName}
        </span>
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
      <div className="language-switch" aria-label={copy.languageLabel}>
        <button
          className={lang === "en" ? "active" : ""}
          type="button"
          aria-pressed={lang === "en"}
          onClick={() => onLangChange("en")}
        >
          EN
        </button>
        <button
          className={lang === "zh" ? "active" : ""}
          type="button"
          aria-pressed={lang === "zh"}
          onClick={() => onLangChange("zh")}
        >
          中文
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
