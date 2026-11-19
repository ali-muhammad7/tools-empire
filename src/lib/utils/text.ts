/**
 * Text statistics and case conversion — pure functions, no React imports.
 * All functions handle empty input gracefully (return 0 / ""), never throw.
 */

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  bytes: number;
  longestWord: string;
  readingTimeMinutes: number;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?]+[.!?]+["')\]]*\s*/g);
  if (!matches) return trimmed.length > 0 ? 1 : 0;
  return matches.length;
}

export function countParagraphs(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}

export function longestWord(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  let longest = "";
  for (const w of words) {
    const clean = w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    if (clean.length > longest.length) longest = clean;
  }
  return longest;
}

export function analyzeText(text: string): TextStats {
  const words = countWords(text);
  return {
    words,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    lines: text === "" ? 0 : text.split("\n").length,
    bytes: new TextEncoder().encode(text).length,
    longestWord: longestWord(text),
    // 200 words per minute, rounded up to whole minutes for display.
    readingTimeMinutes: Math.ceil(words / 200),
  };
}

export type CaseStyle =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "snake"
  | "kebab";

function splitWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function capitalize(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function convertCase(text: string, style: CaseStyle): string {
  switch (style) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return splitWords(text).map(capitalize).join(" ");
    case "sentence": {
      const lower = text.toLowerCase();
      // Capitalize the first letter of the text and of each sentence.
      return lower.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) =>
        m.toUpperCase(),
      );
    }
    case "camel": {
      const words = splitWords(text).map((w) => w.toLowerCase());
      if (words.length === 0) return "";
      return (
        words[0] +
        words
          .slice(1)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join("")
      );
    }
    case "snake":
      return splitWords(text)
        .map((w) => w.toLowerCase())
        .join("_");
    case "kebab":
      return splitWords(text)
        .map((w) => w.toLowerCase())
        .join("-");
  }
}
