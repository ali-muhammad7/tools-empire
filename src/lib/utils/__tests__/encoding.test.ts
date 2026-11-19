import { describe, expect, it } from "vitest";
import {
  base64Decode,
  base64Encode,
  formatJson,
  sortKeysDeep,
  urlDecode,
  urlEncode,
} from "../encoding";

describe("base64Encode / base64Decode", () => {
  it("encodes plain ASCII", () => {
    expect(base64Encode("Hello, World!")).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  it("round-trips Unicode text (emoji, accented chars)", () => {
    const text = "héllo 🌍 — ünïcode";
    expect(base64Decode(base64Encode(text))).toBe(text);
  });

  it("decodes a known value", () => {
    expect(base64Decode("SGVsbG8=")).toBe("Hello");
  });

  it("returns an empty string for empty input", () => {
    expect(base64Encode("")).toBe("");
    expect(base64Decode("")).toBe("");
  });

  it("rejects characters outside the Base64 alphabet", () => {
    expect(() => base64Decode("!!!not-base64!!!")).toThrow(/Not valid Base64/);
  });

  it("rejects input whose length is not a multiple of 4", () => {
    expect(() => base64Decode("abc")).toThrow(/Not valid Base64/);
  });
});

describe("urlEncode / urlDecode", () => {
  it("full-URL mode keeps URL structure, encodes spaces", () => {
    expect(urlEncode("https://example.com/a b?x=1&y=2", true)).toBe(
      "https://example.com/a%20b?x=1&y=2",
    );
  });

  it("component mode encodes &, = and other reserved chars", () => {
    expect(urlEncode("a b&c=d", false)).toBe("a%20b%26c%3Dd");
  });

  it("decodes percent-encoded text", () => {
    expect(urlDecode("a%20b%26c")).toBe("a b&c");
  });

  it("round-trips through component mode", () => {
    const text = "hello world & friends?=yes";
    expect(urlDecode(urlEncode(text, false))).toBe(text);
  });

  it("throws on invalid percent-encoding", () => {
    expect(() => urlDecode("%")).toThrow();
    expect(() => urlDecode("%zz")).toThrow();
  });
});

describe("formatJson", () => {
  it("pretty-prints with 2-space indent", () => {
    const result = formatJson('{"b":1,"a":2}', { minify: false, sortKeys: false });
    expect(result.ok).toBe(true);
    expect(result.error).toBeNull();
    expect(result.output).toBe('{\n  "b": 1,\n  "a": 2\n}');
  });

  it("minifies", () => {
    const result = formatJson('{ "a": 1, "b": [1, 2] }', {
      minify: true,
      sortKeys: false,
    });
    expect(result.ok).toBe(true);
    expect(result.output).toBe('{"a":1,"b":[1,2]}');
  });

  it("sorts keys recursively", () => {
    const result = formatJson('{"b":{"d":1,"c":2},"a":3}', {
      minify: false,
      sortKeys: true,
    });
    expect(result.ok).toBe(true);
    expect(result.output).toBe('{\n  "a": 3,\n  "b": {\n    "c": 2,\n    "d": 1\n  }\n}');
  });

  it("sortKeysDeep keeps array order", () => {
    expect(sortKeysDeep({ b: [3, 2, 1], a: 1 })).toEqual({ a: 1, b: [3, 2, 1] });
  });

  it("rejects invalid JSON with an error message", () => {
    const result = formatJson("{bad json", { minify: false, sortKeys: false });
    expect(result.ok).toBe(false);
    expect(result.output).toBe("");
    expect(result.error).toBeTruthy();
  });

  it("rejects empty input", () => {
    const result = formatJson("   ", { minify: false, sortKeys: false });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/empty/i);
  });
});
