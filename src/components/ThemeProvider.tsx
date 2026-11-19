"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Class-based theming (`attribute="class"`) so Tailwind's `dark:` variant
 * follows the `.dark` class on <html>. `enableSystem` respects the OS
 * preference until the user picks a theme; next-themes injects a small
 * blocking script that applies the stored theme before paint, so there is
 * no flash of the wrong theme.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
