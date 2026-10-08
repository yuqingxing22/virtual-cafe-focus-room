import { useEffect, useMemo, useState } from "react";
import { CUE_SOUNDS } from "./audio/tracks.js";
import { playCue, playDrinkCue, playTimedCue } from "./audio/useAmbientAudio.js";
import AppHeader from "./components/AppHeader.jsx";
import SceneBackdrop from "./components/SceneBackdrop.jsx";
import { DRINKS, DURATIONS, SEATS } from "./data/catalog.js";
import { SCENE_MEDIA, getSceneMediaKey } from "./data/media.js";
import { useFocusSession } from "./hooks/useFocusSession.js";
import { useLanguage } from "./hooks/useLanguage.js";
import { useSoundscape } from "./hooks/useSoundscape.js";
import { formatTime } from "./lib/format.js";
import { readSavedSession } from "./lib/session.js";
import { readStored, writeStored } from "./lib/storage.js";
import CompleteScene from "./scenes/CompleteScene.jsx";
import EntranceScene from "./scenes/EntranceScene.jsx";
import FocusScene from "./scenes/FocusScene.jsx";
import OrderScene from "./scenes/OrderScene.jsx";
import SeatScene from "./scenes/SeatScene.jsx";
import SetupScene from "./scenes/SetupScene.jsx";

// The visit runs entrance -> order -> seat -> setup -> focus -> complete. App owns which scene
// is showing and what the visitor chose; the countdown lives in useFocusSession, everything
// audible in useSoundscape, and each scene's markup in src/scenes/.
function App() {
  const { lang, setLang, copy } = useLanguage();
  // A focus session saved before a refresh or closed tab; null on a normal visit.
  const [restored] = useState(readSavedSession);
  const [scene, setScene] = useState(restored ? "focus" : "entrance");
  const [drink, setDrink] = useState(restored?.drink ?? null);
  const [seat, setSeat] = useState(restored?.seat ?? null);
  const [task, setTask] = useState(restored?.task ?? "");
  const [duration, setDuration] = useState(
    restored && DURATIONS.includes(restored.minutes) ? restored.minutes : 45,
  );
  const [customDuration, setCustomDuration] = useState(
    restored && !DURATIONS.includes(restored.minutes) ? String(restored.minutes) : "",
  );
  const [ritual, setRitual] = useState(
    restored ? { phone: true, laptop: true } : { phone: false, laptop: false },
  );
  // The mixer is an overlay on the focus scene (a bottom sheet on phones); remembered per device.
  const [mixerOpen, setMixerOpen] = useState(
    () => readStored("cafe-focus-mixer-open", "0", (value) => value === "0" || value === "1") === "1",
  );
  useEffect(() => {
    writeStored("cafe-focus-mixer-open", mixerOpen ? "1" : "0");
  }, [mixerOpen]);

  const selectedDrink = DRINKS.find((item) => item.id === drink);
  const selectedSeat = SEATS.find((item) => item.id === seat);
  const sceneMediaKey = getSceneMediaKey(scene, selectedSeat?.id);
  const sceneMedia = SCENE_MEDIA[sceneMediaKey] ?? SCENE_MEDIA.entrance;
  const effectiveDuration = useMemo(() => {
    const custom = Number(customDuration);
    if (customDuration && Number.isFinite(custom) && custom >= 5) return Math.min(custom, 180);
    return duration;
  }, [customDuration, duration]);

  // What the visitor set up for this visit, with the setters the setup form needs.
  const plan = {
    task,
    setTask,
    seat,
    drink,
    duration,
    setDuration,
    customDuration,
    setCustomDuration,
    ritual,
    setRitual,
    minutes: effectiveDuration,
  };

  const sound = useSoundscape(restored, selectedSeat);
  const session = useFocusSession({ restored, scene, setScene, plan, sound });

  useEffect(() => {
    if (scene !== "focus") return undefined;
    document.title = `${formatTime(session.remaining)} · ${task.trim() || copy.appName}`;
    return () => {
      document.title = copy.appName;
    };
  }, [scene, session.remaining, task, copy.appName]);

  const enterCafe = () => {
    // Inside the click so autoplay rules allow it; the room is audible from the door.
    if (sound.ambiencePref === "on") sound.ensureAudio();
    playTimedCue(CUE_SOUNDS.steps, 0.18, 3600);
    window.setTimeout(() => playCue(CUE_SOUNDS.woodenDoor, 0.36), 450);
    window.setTimeout(() => playCue(CUE_SOUNDS.door, 0.44), 800);
    setScene("order");
  };

  const pickDrink = (id) => {
    setDrink(id);
    playDrinkCue(id);
  };

  // Same table, same task, another session of the same length. Inside the click so the
  // room can start sounding again.
  const stayAgain = () => {
    if (sound.ambiencePref === "on") sound.ensureAudio();
    session.start();
  };

  const resetCafe = () => {
    session.reset();
    sound.stopAudio();
    sound.resetToCounter();
    setScene("entrance");
    setDrink(null);
    setSeat(null);
    setTask("");
    setDuration(45);
    setCustomDuration("");
    setRitual({ phone: false, laptop: false });
  };

  const renderScene = () => {
    switch (scene) {
      case "entrance":
        return <EntranceScene copy={copy} visits={session.visits} onEnter={enterCafe} />;
      case "order":
        return (
          <OrderScene
            copy={copy}
            lang={lang}
            drink={drink}
            onPickDrink={pickDrink}
            onNext={() => setScene("seat")}
          />
        );
      case "seat":
        return (
          <SeatScene
            copy={copy}
            lang={lang}
            seat={seat}
            onPickSeat={setSeat}
            onBack={() => setScene("order")}
            onNext={() => setScene("setup")}
          />
        );
      case "setup":
        return (
          <SetupScene
            copy={copy}
            plan={plan}
            seatName={selectedSeat?.name[lang]}
            drinkName={selectedDrink?.name[lang]}
            timeSlot={sound.timeSlot}
            onTimeSlotChange={sound.setTimeSlot}
            onBack={() => setScene("seat")}
            onStart={session.start}
          />
        );
      case "focus":
        return (
          <FocusScene
            copy={copy}
            lang={lang}
            plan={plan}
            seat={selectedSeat}
            drinkName={selectedDrink?.name[lang]}
            session={session}
            sound={sound}
            mixerOpen={mixerOpen}
            onToggleMixer={(next) => setMixerOpen((open) => (typeof next === "boolean" ? next : !open))}
          />
        );
      default:
        return (
          <CompleteScene
            copy={copy}
            task={task}
            minutes={effectiveDuration}
            session={session}
            onStayAgain={stayAgain}
            onVisitAgain={resetCafe}
          />
        );
    }
  };

  return (
    <main className={`app scene-${scene}`}>
      <SceneBackdrop media={sceneMedia} />
      <div className="background-shade" aria-hidden="true" />
      <AppHeader
        copy={copy}
        lang={lang}
        onLangChange={setLang}
        scene={scene}
        ambienceOn={sound.enabled}
        onToggleAmbience={sound.toggleAmbience}
      />
      {renderScene()}
    </main>
  );
}

export default App;
