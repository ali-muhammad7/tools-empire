import { describe, expect, it } from "vitest";
import {
  clampDimensions,
  findQualityForTarget,
  formatBytes,
  formatFromMime,
  outputFilename,
  reductionPercent,
} from "../image";

describe("formatBytes", () => {
  it("formats bytes, KB and MB", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatBytes(250 * 1024)).toBe("250 KB");
  });

  it("handles invalid input", () => {
    expect(formatBytes(-1)).toBe("0 B");
    expect(formatBytes(NaN)).toBe("0 B");
  });
});

describe("reductionPercent", () => {
  it("computes savings", () => {
    expect(reductionPercent(1000, 250)).toBe(75);
    expect(reductionPercent(1000, 1000)).toBe(0);
    expect(reductionPercent(1000, 1500)).toBe(-50);
  });

  it("guards against zero input", () => {
    expect(reductionPercent(0, 100)).toBe(0);
  });
});

describe("formatFromMime", () => {
  it("maps supported types", () => {
    expect(formatFromMime("image/jpeg")).toBe("jpeg");
    expect(formatFromMime("image/png")).toBe("png");
    expect(formatFromMime("image/webp")).toBe("webp");
  });

  it("returns null for unsupported types", () => {
    expect(formatFromMime("image/gif")).toBeNull();
    expect(formatFromMime("image/heic")).toBeNull();
    expect(formatFromMime("application/pdf")).toBeNull();
  });
});

describe("outputFilename", () => {
  it("changes the extension when the format changes", () => {
    expect(outputFilename("Photo.PNG", "webp", "png")).toBe("Photo.webp");
  });

  it("adds -compressed when the format is unchanged", () => {
    expect(outputFilename("scan.jpg", "jpeg", "jpeg")).toBe("scan-compressed.jpg");
  });

  it("handles names without an extension", () => {
    expect(outputFilename("image", "png", null)).toBe("image.png");
  });
});

describe("clampDimensions", () => {
  it("keeps size when within bounds", () => {
    expect(clampDimensions(800, 600, 1024)).toEqual({ width: 800, height: 600 });
  });

  it("scales down preserving aspect ratio", () => {
    expect(clampDimensions(4000, 3000, 1000)).toEqual({ width: 1000, height: 750 });
  });

  it("ignores a missing limit", () => {
    expect(clampDimensions(4000, 3000)).toEqual({ width: 4000, height: 3000 });
    expect(clampDimensions(4000, 3000, 0)).toEqual({ width: 4000, height: 3000 });
  });
});

describe("findQualityForTarget", () => {
  /** Fake encoder: size grows linearly with quality (1000 * q + 100). */
  const linearEncoder = async (q: number) => Math.round(1000 * q + 100);

  it("returns quality 1 when the full-quality output already fits", async () => {
    const result = await findQualityForTarget(linearEncoder, 5000);
    expect(result.quality).toBe(1);
    expect(result.metTarget).toBe(true);
    expect(result.attempts).toBe(1);
  });

  it("finds a quality that meets the target", async () => {
    const result = await findQualityForTarget(linearEncoder, 600);
    expect(result.metTarget).toBe(true);
    expect(result.size).toBeLessThanOrEqual(600);
    expect(result.quality).toBeGreaterThan(0.3);
    expect(result.quality).toBeLessThanOrEqual(0.5);
  });

  it("reports honestly when even low quality cannot meet the target", async () => {
    const result = await findQualityForTarget(linearEncoder, 50);
    expect(result.metTarget).toBe(false);
    expect(result.size).toBeGreaterThan(50);
    expect(result.attempts).toBeLessThanOrEqual(8);
  });

  it("respects the attempt budget", async () => {
    let calls = 0;
    const counting = async (q: number) => {
      calls++;
      return linearEncoder(q);
    };
    await findQualityForTarget(counting, 600, 4);
    expect(calls).toBeLessThanOrEqual(4);
  });
});
