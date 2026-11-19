"use client";

import { useEffect, useState } from "react";

/**
 * Current year. Next.js 16 Cache Components rejects `new Date()` during
 * prerendering, so the year is read after mount — inside a
 * requestAnimationFrame callback, not directly in the effect body
 * (the `react-hooks/set-state-in-effect` rule forbids the direct form).
 */
export function CurrentYear() {
  // Initial value is corrected on mount; it only shows before hydration.
  const [year, setYear] = useState(2026);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setYear(new Date().getFullYear());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return <>{year}</>;
}
