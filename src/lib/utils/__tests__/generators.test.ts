import { describe, expect, it } from "vitest";
import {
  buildCharset,
  generatePassword,
  generateUuid,
  generateUuids,
  passwordStrength,
  type PasswordOptions,
} from "../generators";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALL_SETS: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

describe("generateUuid", () => {
  it("produces a valid UUID v4", () => {
    expect(generateUuid()).toMatch(UUID_V4);
  });

  it("produces unique values", () => {
    const a = generateUuid();
    const b = generateUuid();
    expect(a).not.toBe(b);
  });
});

describe("generateUuids", () => {
  it("returns the requested count of valid UUIDs", () => {
    const uuids = generateUuids(5);
    expect(uuids).toHaveLength(5);
    for (const uuid of uuids) expect(uuid).toMatch(UUID_V4);
    expect(new Set(uuids).size).toBe(5);
  });

  it("clamps the count to 1–100", () => {
    expect(generateUuids(0)).toHaveLength(1);
    expect(generateUuids(200)).toHaveLength(100);
  });
});

describe("buildCharset", () => {
  it("includes all four sets when all are enabled", () => {
    const charset = buildCharset(ALL_SETS);
    expect(charset).toContain("a");
    expect(charset).toContain("Z");
    expect(charset).toContain("5");
    expect(charset).toContain("!");
  });

  it("includes only the enabled sets", () => {
    const charset = buildCharset({
      ...ALL_SETS,
      uppercase: false,
      digits: false,
      symbols: false,
    });
    expect(charset).toBe("abcdefghijklmnopqrstuvwxyz");
  });

  it("removes ambiguous characters when asked", () => {
    const charset = buildCharset({ ...ALL_SETS, excludeAmbiguous: true });
    for (const c of ["I", "l", "1", "O", "0"]) {
      expect(charset).not.toContain(c);
    }
  });

  it("returns an empty string when no set is enabled", () => {
    expect(
      buildCharset({
        length: 16,
        uppercase: false,
        lowercase: false,
        digits: false,
        symbols: false,
        excludeAmbiguous: false,
      }),
    ).toBe("");
  });
});

describe("generatePassword", () => {
  it("generates a password of the requested length", () => {
    expect(generatePassword(ALL_SETS)).toHaveLength(16);
    expect(generatePassword({ ...ALL_SETS, length: 32 })).toHaveLength(32);
  });

  it("uses only characters from the chosen charset", () => {
    const password = generatePassword({
      length: 64,
      uppercase: false,
      lowercase: true,
      digits: false,
      symbols: false,
      excludeAmbiguous: false,
    });
    expect(password).toMatch(/^[a-z]{64}$/);
  });

  it("returns an empty string when no character set is enabled", () => {
    expect(
      generatePassword({
        length: 16,
        uppercase: false,
        lowercase: false,
        digits: false,
        symbols: false,
        excludeAmbiguous: false,
      }),
    ).toBe("");
  });
});

describe("passwordStrength", () => {
  it("rates an empty password as Weak with 0 bits", () => {
    const result = passwordStrength("", 94);
    expect(result.label).toBe("Weak");
    expect(result.entropyBits).toBe(0);
    expect(result.score).toBe(0);
  });

  it("rates a 3-char lowercase password as Weak", () => {
    // 3 × log2(26) ≈ 14 bits.
    expect(passwordStrength("abc", 26).label).toBe("Weak");
  });

  it("rates a 6-char lowercase password as Fair", () => {
    // 6 × log2(26) ≈ 28 bits.
    expect(passwordStrength("abcdef", 26).label).toBe("Fair");
  });

  it("rates an 8-char lowercase password as Good", () => {
    // 8 × log2(26) ≈ 38 bits.
    expect(passwordStrength("abcdefgh", 26).label).toBe("Good");
  });

  it("rates a 16-char full-charset password as Excellent", () => {
    // 16 × log2(94) ≈ 105 bits.
    const password = generatePassword(ALL_SETS);
    const charsetSize = buildCharset(ALL_SETS).length;
    const result = passwordStrength(password, charsetSize);
    expect(result.label).toBe("Excellent");
    expect(result.score).toBe(4);
    expect(result.entropyBits).toBeGreaterThanOrEqual(90);
  });

  it("reports the charset size it was given", () => {
    expect(passwordStrength("abcdefgh", 26).charsetSize).toBe(26);
  });
});
