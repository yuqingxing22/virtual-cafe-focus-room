import { useEffect, useRef, useState } from "react";
import { CUE_SOUNDS } from "../audio/tracks.js";
import { playCue } from "../audio/useAmbientAudio.js";
import { STATUS_MESSAGES } from "../data/copy.js";
import { clearSavedSession, writeSavedSession } from "../lib/session.js";
import { STAMP_MINUTES, readVisits, writeVisits } from "../lib/visits.js";

// Break offer: after this much focused time, when at least this much is left, for this long.
const BREAK_AFTER_SECONDS = 25 * 60;
const BREAK_MIN_LEFT_SECONDS = 5 * 60;
const BREAK_LENGTH_SECONDS = 5 * 60;

// The focus countdown and everything that happens around it: pause and resume, the pause
// nudge, the one break offer, the break itself, keyboard shortcuts, saving the session across
// refreshes and recording the visit on the stamp card.
//
// `restored` is a saved session (or null). `plan` is what the visitor set up: task, seat and
// drink ids, minutes. `sound` supplies the mix and time slot to save, and stopAudio.
export function useFocusSession({ restored, scene, setScene, plan, sound }) {
  const { task, seat, drink, minutes } = plan;
  const { layerMix, timeSlot, stopAudio } = sound;

  const [remaining, setRemaining] = useState(restored ? restored.remaining : 45 * 60);
  const [isRunning, setIsRunning] = useState(Boolean(restored?.endAt));
  // Wall-clock end time of the running countdown; null while paused or idle.
  const endAtRef = useRef(restored?.endAt ?? null);
  const [restoredNotice, setRestoredNotice] = useState(Boolean(restored));
  const [messageIndex, setMessageIndex] = useState(0);
  const [sessionResult, setSessionResult] = useState(null);
  const [visits, setVisits] = useState(readVisits);
  // The visit recorded by the session that just ended, shown on the complete scene.
  const [lastVisit, setLastVisit] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [pauseNudgeSeen, setPauseNudgeSeen] = useState(false);
  // Break: offered once per session; breakEndAt is the wall-clock end while on a break.
  const [breakOffered, setBreakOffered] = useState(false);
  const [breakEndAt, setBreakEndAt] = useState(null);
  const [breakRemaining, setBreakRemaining] = useState(0);
  const [breakNotice, setBreakNotice] = useState(false);
  const onBreak = breakEndAt !== null;

  useEffect(() => {
    if (scene !== "focus" || !isRunning) return undefined;
    if (endAtRef.current === null) {
      endAtRef.current = Date.now() + remaining * 1000;
    }

    // Derive remaining time from the wall clock so background-tab throttling cannot drift it.
    const tick = () => {
      if (endAtRef.current === null) return;
      const next = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemaining(next);
      if (next <= 0) completeSession();
    };

    // Run once right away so a restored session that already ended completes immediately.
    tick();
    const timer = window.setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
    // `remaining` only seeds endAt when the countdown (re)starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, isRunning]);

  // Keep the in-progress session on disk. While running, endAt is enough; while paused, remaining is.
  useEffect(() => {
    if (scene !== "focus") return;
    // Running with no end time only happens for one render while the session completes.
    if (isRunning && endAtRef.current === null) return;
    writeSavedSession({
      task,
      seat,
      drink,
      minutes,
      endAt: isRunning ? endAtRef.current : null,
      remaining: isRunning ? null : remaining,
      layerMix,
      timeSlot,
    });
    // `remaining` is read only when pausing, and pausing already changes isRunning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, isRunning, task, seat, drink, minutes, layerMix, timeSlot]);

  useEffect(() => {
    if (scene !== "focus" || !isRunning) return undefined;
    const statusTimer = window.setInterval(() => {
      setRestoredNotice(false);
      setBreakNotice(false);
      setMessageIndex((index) => (index + 1) % STATUS_MESSAGES.length);
    }, 26000);

    return () => window.clearInterval(statusTimer);
  }, [scene, isRunning]);

  useEffect(() => {
    if (
      scene !== "focus" ||
      isRunning ||
      onBreak ||
      remaining <= 0 ||
      pauseNudgeSeen ||
      intervention
    ) {
      return undefined;
    }

    const pauseTimer = window.setTimeout(() => {
      setPauseNudgeSeen(true);
      setIntervention("pauseLong");
    }, 90000);

    return () => window.clearTimeout(pauseTimer);
  }, [intervention, isRunning, onBreak, pauseNudgeSeen, remaining, scene]);

  // Offer a break once, after 25 focused minutes, unless the session is nearly over.
  useEffect(() => {
    if (scene !== "focus" || !isRunning || onBreak || breakOffered || intervention) return;
    const elapsed = minutes * 60 - remaining;
    if (elapsed >= BREAK_AFTER_SECONDS && remaining >= BREAK_MIN_LEFT_SECONDS) {
      setBreakOffered(true);
      setIntervention("breakReady");
    }
  }, [scene, isRunning, onBreak, breakOffered, intervention, minutes, remaining]);

  const start = () => {
    const seconds = minutes * 60;
    playCue(CUE_SOUNDS.cupSetDown, 0.4);
    endAtRef.current = Date.now() + seconds * 1000;
    setRemaining(seconds);
    setMessageIndex(0);
    setIsRunning(true);
    setSessionResult(null);
    setIntervention(null);
    setPauseNudgeSeen(false);
    setBreakOffered(false);
    setBreakEndAt(null);
    setBreakNotice(false);
    setScene("focus");
  };

  const pause = () => {
    if (endAtRef.current !== null) {
      setRemaining(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)));
    }
    endAtRef.current = null;
    setIsRunning(false);
  };

  const resume = () => {
    setIntervention(null);
    setIsRunning(true);
  };

  const currentRemaining = () =>
    endAtRef.current === null
      ? remaining
      : Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));

  const recordVisit = (completed, elapsedSeconds) => {
    const visitMinutes = Math.floor(elapsedSeconds / 60);
    if (visitMinutes < 1) {
      setLastVisit(null);
      return;
    }
    const entry = {
      at: new Date().toISOString(),
      minutes: visitMinutes,
      task: task.trim(),
      seat,
      drink,
      completed,
      stamp: completed || visitMinutes >= STAMP_MINUTES,
    };
    setVisits((current) => {
      const next = [...current, entry];
      writeVisits(next);
      return next;
    });
    setLastVisit(entry);
  };

  const completeSession = () => {
    endAtRef.current = null;
    clearSavedSession();
    setBreakEndAt(null);
    setRemaining(0);
    setIsRunning(false);
    stopAudio();
    playCue(CUE_SOUNDS.door, 0.3);
    recordVisit(true, minutes * 60);
    setSessionResult("completed");
    setIntervention(null);
    setScene("complete");
  };

  const end = () => {
    const left = currentRemaining();
    endAtRef.current = null;
    clearSavedSession();
    setBreakEndAt(null);
    setIsRunning(false);
    stopAudio();
    recordVisit(left === 0, minutes * 60 - left);
    setSessionResult(left === 0 ? "completed" : "ended");
    setIntervention(null);
    setScene("complete");
  };

  const startBreak = () => {
    setIntervention(null);
    pause();
    setBreakRemaining(BREAK_LENGTH_SECONDS);
    setBreakEndAt(Date.now() + BREAK_LENGTH_SECONDS * 1000);
  };

  const finishBreak = () => {
    if (breakEndAt === null) return;
    setBreakEndAt(null);
    setBreakNotice(true);
    playCue(CUE_SOUNDS.cupSetDown, 0.3);
    resume();
  };

  // Break countdown on the wall clock; returns to the table by itself when it runs out.
  useEffect(() => {
    if (breakEndAt === null) return undefined;
    const tick = () => {
      const left = Math.max(0, Math.ceil((breakEndAt - Date.now()) / 1000));
      setBreakRemaining(left);
      if (left <= 0) finishBreak();
    };
    tick();
    const timer = window.setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
    // finishBreak only matters when the break ends, which re-runs this effect anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakEndAt]);

  // Keyboard: Space pauses or resumes; Esc pauses first, then ends on a second press.
  // During a break either key returns to the table.
  useEffect(() => {
    if (scene !== "focus") return undefined;
    const onKeyDown = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName))
      ) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        if (onBreak) finishBreak();
        else if (isRunning) pause();
        else resume();
      } else if (event.key === "Escape") {
        if (onBreak) finishBreak();
        else if (isRunning) pause();
        else end();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [scene, isRunning, onBreak, pause, resume, end, finishBreak]);

  // Back to the door: forget the finished session. The stamp card (visits) stays.
  const reset = () => {
    endAtRef.current = null;
    clearSavedSession();
    setLastVisit(null);
    setRestoredNotice(false);
    setRemaining(45 * 60);
    setIsRunning(false);
    setSessionResult(null);
    setIntervention(null);
    setPauseNudgeSeen(false);
    setBreakOffered(false);
    setBreakEndAt(null);
    setBreakNotice(false);
  };

  return {
    remaining,
    isRunning,
    onBreak,
    breakRemaining,
    // "breakReady", "pauseLong" or null: the card currently shown on the focus scene.
    intervention,
    dismissIntervention: () => setIntervention(null),
    messageIndex,
    restoredNotice,
    breakNotice,
    // "completed" or "ended", for the complete scene.
    sessionResult,
    visits,
    lastVisit,
    start,
    pause,
    resume,
    end,
    startBreak,
    finishBreak,
    reset,
  };
}
