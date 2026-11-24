"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in seconds (via the --reveal-delay custom property). */
  delay?: number;
  className?: string;
  as?: "div" | "section";
}

/**
 * Scroll-triggered reveal wrapper.
 *
 * Progressive enhancement by design: content renders fully visible on the
 * server and without JS. After mount (and only when the user has not
 * asked for reduced motion), the wrapper arms itself with `.reveal-armed`
 * and an IntersectionObserver adds `.is-visible` when it scrolls into
 * view. Elements already on screen at load reveal immediately.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    // Arm in a rAF so the hidden state applies after first paint
    // (avoids a flash for above-the-fold content, which the observer
    // then reveals right away).
    const frame = requestAnimationFrame(() => setArmed(true));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const style = {
    "--reveal-delay": `${delay}s`,
  } as CSSProperties;
  const classes = `${armed ? "reveal-armed" : ""} ${visible ? "is-visible" : ""} ${className}`.trim();

  if (as === "section") {
    return (
      <section
        ref={ref as React.RefObject<HTMLElement>}
        style={style}
        className={classes}
      >
        {children}
      </section>
    );
  }
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} style={style} className={classes}>
      {children}
    </div>
  );
}
