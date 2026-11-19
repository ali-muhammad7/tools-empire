/**
 * Encoding helpers — pure functions, no React imports.
 * Base64 uses TextEncoder/TextDecoder so non-ASCII (Unicode) text round-trips
 * correctly; plain btoa/atob would throw on characters above U+00FF.
 */

export function base64Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function base64Decode(input: string): string {
  const cleaned = input.trim().replace(/\s+/g, "");
  if (cleaned === "") return "";
  // Strict-ish validation: only Base64 alphabet + up to two trailing "=".
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) || cleaned.length % 4 !== 0) {
    throw new Error(
      "Not valid Base64. Use only A–Z, a–z, 0–9, +, / and up to two trailing = padding.",
    );
  }
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function urlEncode(text: string, fullUrl: boolean): string {
  return fullUrl ? encodeURI(text) : encodeURIComponent(text);
}

export function urlDecode(text: string): string {
  return decodeURIComponent(text);
}

export interface JsonResult {
  ok: boolean;
  output: string;
  error: string | null;
}

/** Recursively sort object keys (arrays keep their order). */
export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep(
        (value as Record<string, unknown>)[key],
      );
    }
    return sorted;
  }
  return value;
}

export function formatJson(
  input: string,
  opts: { minify: boolean; sortKeys: boolean },
): JsonResult {
  if (input.trim() === "") {
    return { ok: false, output: "", error: "Input is empty — paste some JSON first." };
  }
  try {
    let parsed: unknown = JSON.parse(input);
    if (opts.sortKeys) parsed = sortKeysDeep(parsed);
    const output = opts.minify
      ? JSON.stringify(parsed)
      : JSON.stringify(parsed, null, 2);
    return { ok: true, output, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON.";
    return { ok: false, output: "", error: message };
  }
}
