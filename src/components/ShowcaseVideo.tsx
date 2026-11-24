"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Cinematic showcase (Video 1). Poster-only until clicked, so the
 * 1440×1152 MP4 costs zero bytes on page load. Once playing, native
 * controls take over. Reduced-motion users simply never autoplay —
 * playback is always an explicit click.
 */
export function ShowcaseVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/50 shadow-2xl dark:border-white/10">
      {playing ? (
        <video
          className="aspect-[1440/1152] w-full object-cover"
          poster="/media/showcase-poster.png"
          controls
          autoPlay
          playsInline
          preload="auto"
        >
          <source src="/media/showcase.webm" type="video/webm" />
          <source src="/media/showcase.mp4" type="video/mp4" />
        </video>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="block w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label="Play the Tools Empire cinematic showcase video"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/showcase-poster.png"
            alt="Tools Empire cinematic showcase — 3D fly-over of the website"
            className="aspect-[1440/1152] w-full object-cover"
            loading="lazy"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/90 text-brand-foreground shadow-xl transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-1 h-7 w-7" aria-hidden="true" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
