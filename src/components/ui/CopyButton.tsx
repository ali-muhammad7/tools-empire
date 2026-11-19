"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CopyButtonProps {
  text: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Copies text to the clipboard (with a textarea fallback) and shows feedback. */
export function CopyButton({
  text,
  label = "Copy",
  disabled = false,
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleCopy() {
    if (!text) return;
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // Fallback for non-secure contexts / denied clipboard permission.
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleCopy}
      disabled={disabled || !text}
      aria-live="polite"
      className={className}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" aria-hidden="true" /> {label}
        </>
      )}
    </Button>
  );
}
