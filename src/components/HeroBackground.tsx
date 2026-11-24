"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServer() {
  return false;
}

/**
 * Ambient glass background loop for the hero.
 *
 * Performance & accessibility rules:
 * - preload="none": the video bytes are not fetched until the hero is
 *   actually on screen (IntersectionObserver), and playback pauses
 *   when it scrolls away.
 * - prefers-reduced-motion: renders the static poster image only.
 * - WebM (VP9) first, MP4 (H.264) fallback; muted + playsInline so
 *   mobile browsers allow autoplay.
 */
export function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionServer,
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void video.play().catch(() => {
              /* autoplay blocked: poster remains visible */
            });
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/media/hero-glass-poster.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      poster="/media/hero-glass-poster.png"
      preload="none"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src="/media/hero-glass-loop.webm" type="video/webm" />
      <source src="/media/hero-glass-loop.mp4" type="video/mp4" />
    </video>
  );
}
