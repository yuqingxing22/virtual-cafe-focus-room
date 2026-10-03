import { useEffect, useRef, useState } from "react";
import { DEFAULT_BACKDROP } from "../lib/paths.js";

function SceneBackdrop({ media }) {
  const images = media?.images?.length ? media.images : [media?.fallback ?? DEFAULT_BACKDROP];
  const fallback = media?.fallback ?? DEFAULT_BACKDROP;
  const [imageIndex, setImageIndex] = useState(0);
  const [failedSources, setFailedSources] = useState({});
  const [imageLayers, setImageLayers] = useState(() => [
    { id: 0, src: images[0] ?? fallback, active: true },
  ]);
  const layerIdRef = useRef(1);
  const activeImageSrcRef = useRef(images[0] ?? fallback);

  useEffect(() => {
    setImageIndex(0);
    setFailedSources({});
    layerIdRef.current += 1;
    activeImageSrcRef.current = images[0] ?? fallback;
    setImageLayers([{ id: layerIdRef.current, src: activeImageSrcRef.current, active: true }]);
  }, [media]);

  useEffect(() => {
    if (images.length <= 1) return undefined;
    const imageTimer = window.setInterval(() => {
      setImageIndex((index) => (index + 1) % images.length);
    }, media?.intervalMs ?? 7200);

    return () => window.clearInterval(imageTimer);
  }, [images.length, media?.intervalMs]);

  const activeImage = images[imageIndex % images.length];
  const src = failedSources[activeImage] ? fallback : activeImage;

  useEffect(() => {
    if (activeImageSrcRef.current === src) return undefined;

    activeImageSrcRef.current = src;
    layerIdRef.current += 1;
    const nextLayerId = layerIdRef.current;

    setImageLayers((currentLayers) => {
      return [
        ...currentLayers.map((layer) => ({ ...layer, active: true })),
        { id: nextLayerId, src, active: false },
      ].slice(-2);
    });

    const fadeFrame = window.requestAnimationFrame(() => {
      setImageLayers((currentLayers) =>
        currentLayers.map((layer) => ({ ...layer, active: layer.id === nextLayerId })),
      );
    });

    const cleanupTimer = window.setTimeout(() => {
      setImageLayers((currentLayers) => currentLayers.filter((layer) => layer.active));
    }, 2400);

    return () => {
      window.cancelAnimationFrame(fadeFrame);
      window.clearTimeout(cleanupTimer);
    };
  }, [src]);

  if (media?.video) {
    return (
      <video
        className="scene-backdrop"
        key={media.video}
        src={media.video}
        autoPlay
        loop={media.loop ?? true}
        muted
        playsInline
        aria-hidden="true"
      />
    );
  }

  return (
    <>
      {imageLayers.map((layer) => (
        <img
          className={`scene-backdrop scene-backdrop-image${layer.active ? " active" : ""}`}
          key={layer.id}
          src={layer.src}
          alt=""
          aria-hidden="true"
          onError={() => setFailedSources((current) => ({ ...current, [layer.src]: true }))}
        />
      ))}
    </>
  );
}

export default SceneBackdrop;
