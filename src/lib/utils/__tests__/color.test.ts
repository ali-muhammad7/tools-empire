import { describe, expect, it } from "vitest";
import {
  convertColor,
  hexToRgb,
  hslToRgb,
  normalizeHex,
  rgbToHex,
  rgbToHsl,
} from "../color";

describe("normalizeHex", () => {
  it("expands 3-digit hex", () => {
    expect(normalizeHex("#f80")).toBe("#ff8800");
    expect(normalizeHex("f80")).toBe("#ff8800");
  });

  it("lowercases and adds the leading #", () => {
    expect(normalizeHex("FF8800")).toBe("#ff8800");
    expect(normalizeHex("#FF8800")).toBe("#ff8800");
  });

  it("returns null for invalid input", () => {
    expect(normalizeHex("#xyz")).toBeNull();
    expect(normalizeHex("#ff88")).toBeNull();
    expect(normalizeHex("")).toBeNull();
    expect(normalizeHex("red")).toBeNull();
  });
});

describe("hexToRgb / rgbToHex", () => {
  it("converts #ff8800 to RGB", () => {
    expect(hexToRgb("#ff8800")).toEqual({ r: 255, g: 136, b: 0 });
  });

  it("converts RGB back to hex", () => {
    expect(rgbToHex({ r: 255, g: 136, b: 0 })).toBe("#ff8800");
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe("#ffffff");
  });

  it("clamps out-of-range channels", () => {
    expect(rgbToHex({ r: 300, g: -5, b: 128 })).toBe("#ff0080");
  });
});

describe("rgbToHsl / hslToRgb", () => {
  it("converts primary colours", () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 });
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 });
  });

  it("gives a grey zero saturation", () => {
    expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50 });
  });

  it("converts HSL back to RGB", () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 });
    expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 });
    expect(hslToRgb({ h: 0, s: 0, l: 50 })).toEqual({ r: 128, g: 128, b: 128 });
  });

  it("round-trips red exactly", () => {
    expect(hslToRgb(rgbToHsl({ r: 255, g: 0, b: 0 }))).toEqual({
      r: 255,
      g: 0,
      b: 0,
    });
  });
});

describe("convertColor", () => {
  it("returns all formats for a valid hex", () => {
    const result = convertColor("#ff8800");
    expect(result).not.toBeNull();
    expect(result?.hex).toBe("#ff8800");
    expect(result?.rgb).toEqual({ r: 255, g: 136, b: 0 });
    expect(result?.rgbString).toBe("rgb(255, 136, 0)");
    expect(result?.hsl).toEqual({ h: 32, s: 100, l: 50 });
    expect(result?.hslString).toBe("hsl(32, 100%, 50%)");
  });

  it("accepts 3-digit hex", () => {
    expect(convertColor("#f80")?.hex).toBe("#ff8800");
  });

  it("returns null for invalid input", () => {
    expect(convertColor("not-a-color")).toBeNull();
    expect(convertColor("#12")).toBeNull();
  });
});
