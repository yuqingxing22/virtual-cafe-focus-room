import { useEffect, useRef, useState } from "react";
import { YOUTUBE_ERROR_CODES, YOUTUBE_MAX_VOLUME, loadYouTubeApi } from "../lib/youtube.js";

// Visible embedded player (YouTube's terms require it to stay on screen, at least 200x200).
function YouTubeStation({ videoId, volume, playing, onUnavailable }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const loadedIdRef = useRef(videoId);
  const onUnavailableRef = useRef(onUnavailable);
  onUnavailableRef.current = onUnavailable;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return;
      const mount = document.createElement("div");
      hostRef.current.appendChild(mount);
      playerRef.current = new YT.Player(mount, {
        width: "100%",
        height: "100%",
        videoId: loadedIdRef.current,
        playerVars: { playsinline: 1, rel: 0 },
        events: {
          onReady: () => {
            if (!cancelled) setReady(true);
          },
          onError: (event) => {
            if (!cancelled && YOUTUBE_ERROR_CODES.includes(event.data)) {
              onUnavailableRef.current?.(loadedIdRef.current);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!ready || !player) return;
    if (loadedIdRef.current !== videoId) {
      loadedIdRef.current = videoId;
      if (playing && volume > 0) player.loadVideoById(videoId);
      else player.cueVideoById(videoId);
    }
    player.setVolume(Math.round(volume * YOUTUBE_MAX_VOLUME));
    if (playing && volume > 0) player.playVideo();
    else player.pauseVideo();
  }, [ready, videoId, volume, playing]);

  return <div className="youtube-frame" ref={hostRef} />;
}

export default YouTubeStation;
