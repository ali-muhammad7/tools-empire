"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import {
  buildCharset,
  generatePassword,
  passwordStrength,
  type PasswordOptions,
} from "@/lib/utils/generators";

const STRENGTH_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
];

const INITIAL_OPTS: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  // crypto.getRandomValues() is unstable during prerender (Next 16 rejects
  // it), so the first password is generated after mount, inside a rAF
  // callback — the same deferral pattern as CurrentYear.
  const [password, setPassword] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPassword(generatePassword(INITIAL_OPTS));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const opts: PasswordOptions = {
    length,
    uppercase,
    lowercase,
    digits,
    symbols,
    excludeAmbiguous,
  };
  const charsetSize = buildCharset(opts).length;
  // Cheap pure computation — no useMemo needed (memoizing it tripped the
  // react-hooks/preserve-manual-memoization rule).
  const strength = passwordStrength(password, charsetSize);

  function regenerate(next?: Partial<PasswordOptions>) {
    const merged = { ...opts, ...next };
    setPassword(generatePassword(merged));
  }

  const toggle = (
    label: string,
    checked: boolean,
    onChange: (v: boolean) => void,
    key: keyof PasswordOptions,
  ) => (
    <label
      key={label}
      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          onChange(e.target.checked);
          regenerate({ [key]: e.target.checked });
        }}
        className="h-4 w-4 accent-brand"
      />
      {label}
    </label>
  );

  return (
    <ToolLayout>
      <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
        <code className="min-w-0 flex-1 break-all font-mono text-base font-semibold sm:text-lg">
          {password || "Select at least one character set"}
        </code>
        <CopyButton text={password} label="Copy" className="shrink-0" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={() => regenerate()}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Generate
        </Button>
      </div>

      <div className="mt-6">
        <label
          htmlFor="password-length"
          className="flex justify-between text-sm font-medium"
        >
          <span>Length</span>
          <span className="tabular-nums">{length} characters</span>
        </label>
        <input
          id="password-length"
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => {
            const n = Number(e.target.value);
            setLength(n);
            regenerate({ length: n });
          }}
          className="mt-2 w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>8</span>
          <span>64</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {toggle("Uppercase (A–Z)", uppercase, setUppercase, "uppercase")}
        {toggle("Lowercase (a–z)", lowercase, setLowercase, "lowercase")}
        {toggle("Digits (0–9)", digits, setDigits, "digits")}
        {toggle("Symbols (!@#$…)", symbols, setSymbols, "symbols")}
        <label className="col-span-2 flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm sm:col-span-1">
          <input
            type="checkbox"
            checked={excludeAmbiguous}
            onChange={(e) => {
              setExcludeAmbiguous(e.target.checked);
              regenerate({ excludeAmbiguous: e.target.checked });
            }}
            className="h-4 w-4 accent-brand"
          />
          Exclude ambiguous (I, l, 1, O, 0)
        </label>
      </div>

      {password && (
        <div className="mt-6">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Strength: {strength.label}</span>
            <span className="text-muted-foreground tabular-nums">
              ~{strength.entropyBits} bits of entropy
            </span>
          </div>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {STRENGTH_COLORS.map((color, i) => (
              <div
                key={color}
                className={`h-2 flex-1 rounded-full ${
                  i <= strength.score ? color : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Strength is estimated from length × log₂(character-set size).
            Generated with{" "}
            <code className="font-mono">crypto.getRandomValues()</code> —
            never <code className="font-mono">Math.random</code>. Passwords are
            never stored or sent anywhere.
          </p>
        </div>
      )}
    </ToolLayout>
  );
}
