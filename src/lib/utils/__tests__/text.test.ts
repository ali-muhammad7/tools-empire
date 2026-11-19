import { describe, expect, it } from "vitest";
import {
  analyzeText,
  convertCase,
  countParagraphs,
  countSentences,
  countWords,
  longestWord,
} from "../text";

describe("countWords", () => {
  it("counts words separated by spaces", () => {
    expect(countWords("hello world")).toBe(2);
  });

  it("ignores leading/trailing and repeated whitespace", () => {
    expect(countWords("  hello   world  ")).toBe(2);
  });

  it("returns 0 for empty or whitespace-only text", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   \n\t  ")).toBe(0);
  });
});

describe("countSentences", () => {
  it("counts sentences ending in . ? !", () => {
    expect(countSentences("Hello world. How are you? Fine!")).toBe(3);
  });

  it("counts unpunctuated text as one sentence", () => {
    expect(countSentences("No punctuation here")).toBe(1);
  });

  it("returns 0 for empty text", () => {
    expect(countSentences("")).toBe(0);
  });
});

describe("countParagraphs", () => {
  it("splits on blank lines", () => {
    expect(countParagraphs("First.\n\nSecond.\n\nThird.")).toBe(3);
  });

  it("counts a single block as one paragraph", () => {
    expect(countParagraphs("Just one block.")).toBe(1);
  });
});

describe("longestWord", () => {
  it("returns the longest word stripped of surrounding punctuation", () => {
    expect(longestWord("a bb, ccc! dddd.")).toBe("dddd");
  });

  it("returns an empty string for empty text", () => {
    expect(longestWord("")).toBe("");
  });
});

describe("analyzeText", () => {
  it("computes the full stats for a two-paragraph text", () => {
    const stats = analyzeText("Hello world.\n\nSecond paragraph here.");
    expect(stats.words).toBe(5);
    expect(stats.sentences).toBe(2);
    expect(stats.paragraphs).toBe(2);
    expect(stats.lines).toBe(3);
    expect(stats.characters).toBe("Hello world.\n\nSecond paragraph here.".length);
    expect(stats.longestWord).toBe("paragraph");
    expect(stats.readingTimeMinutes).toBe(1);
  });

  it("counts characters without spaces and UTF-8 bytes", () => {
    const stats = analyzeText("héllo world");
    expect(stats.characters).toBe(11);
    expect(stats.charactersNoSpaces).toBe(10);
    // "é" is 2 bytes in UTF-8, so 11 chars = 12 bytes.
    expect(stats.bytes).toBe(12);
  });

  it("returns zeros for empty text", () => {
    const stats = analyzeText("");
    expect(stats.words).toBe(0);
    expect(stats.sentences).toBe(0);
    expect(stats.paragraphs).toBe(0);
    expect(stats.lines).toBe(0);
    expect(stats.readingTimeMinutes).toBe(0);
  });

  it("rounds reading time up at 200 wpm", () => {
    const text = Array.from({ length: 201 }, () => "word").join(" ");
    expect(analyzeText(text).readingTimeMinutes).toBe(2);
  });
});

describe("convertCase — all 7 styles", () => {
  it("upper", () => {
    expect(convertCase("hello world", "upper")).toBe("HELLO WORLD");
  });

  it("lower", () => {
    expect(convertCase("Hello WORLD", "lower")).toBe("hello world");
  });

  it("title", () => {
    expect(convertCase("hello world", "title")).toBe("Hello World");
    expect(convertCase("hello-world_test", "title")).toBe("Hello World Test");
  });

  it("sentence", () => {
    expect(convertCase("hello world. how are you?", "sentence")).toBe(
      "Hello world. How are you?",
    );
  });

  it("camel", () => {
    expect(convertCase("hello world test", "camel")).toBe("helloWorldTest");
    expect(convertCase("hello_world-test", "camel")).toBe("helloWorldTest");
  });

  it("snake", () => {
    expect(convertCase("HelloWorld test", "snake")).toBe("hello_world_test");
  });

  it("kebab", () => {
    expect(convertCase("HelloWorld test", "kebab")).toBe("hello-world-test");
  });

  it("returns an empty string for empty input in every style", () => {
    for (const style of [
      "upper",
      "lower",
      "title",
      "sentence",
      "camel",
      "snake",
      "kebab",
    ] as const) {
      expect(convertCase("", style)).toBe("");
    }
  });
});
