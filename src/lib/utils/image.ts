/**
 * Image helpers — pure functions, no React or DOM imports.
 *
 * The actual pixel work (canvas encoding) lives in the component; these
 * helpers cover the testable logic around it: file-size formatting,
 * output naming, dimension clamping and the target-size quality search.
 */

export type ImageFormat = "jpeg" | "png" | "webp";

export const FORMAT_MIME: Record<ImageFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const FORMAT_EXTENSION: Record<ImageFormat, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

/** Map a MIME type to a supported format, or null when unsupported. */
export function formatFromMime(mime: string): ImageFormat | null {
  switch (mime.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return "jpeg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

/** Human-readable byte size, e.g. 1536 → "1.5 KB". */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

/** Percentage saved going from `before` to `after` bytes (negative if it grew). */
export function reductionPercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.round(((before - after) / before) * 1000) / 10;
}

/**
 * Output file name for a converted/compressed image:
 * "Photo.PNG" + webp → "Photo.webp". Adds "-compressed" when the format
 * is unchanged so downloads never silently overwrite the original.
 */
export function outputFilename(
  originalName: string,
  format: ImageFormat,
  originalFormat: ImageFormat | null,
): string {
  const base = originalName.replace(/\.[^.]*$/, "") || "image";
  const ext = FORMAT_EXTENSION[format];
  return format === originalFormat
    ? `${base}-compressed.${ext}`
    : `${base}.${ext}`;
}

/**
 * Clamp dimensions so the longest side is at most `maxDimension`,
 * preserving aspect ratio. Returns the original size when already within
 * bounds or when maxDimension is 0/undefined (no limit).
 */
export function clampDimensions(
  width: number,
  height: number,
  maxDimension?: number,
): { width: number; height: number } {
  if (!maxDimension || maxDimension <= 0) return { width, height };
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height };
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export interface TargetSizeResult {
  quality: number;
  size: number;
  /** True when the encoded size is at or below the target. */
  metTarget: boolean;
  attempts: number;
}

/**
 * Binary-search the highest encoder quality (0.05–1) whose output fits
 * within `targetBytes`. `encode` is injected so this logic is testable
 * without a canvas. PNG ignores quality, so callers should only use this
 * for jpeg/webp.
 */
export async function findQualityForTarget(
  encode: (quality: number) => Promise<number>,
  targetBytes: number,
  maxAttempts = 8,
): Promise<TargetSizeResult> {
  let low = 0.05;
  let high = 1;
  let attempts = 0;

  // Try full quality first — many images already fit.
  attempts++;
  const fullSize = await encode(1);
  if (fullSize <= targetBytes) {
    return { quality: 1, size: fullSize, metTarget: true, attempts };
  }

  let best: TargetSizeResult = {
    quality: 1,
    size: fullSize,
    metTarget: false,
    attempts,
  };

  while (attempts < maxAttempts) {
    const mid = (low + high) / 2;
    attempts++;
    const size = await encode(mid);
    if (size <= targetBytes) {
      best = { quality: mid, size, metTarget: true, attempts };
      low = mid;
    } else {
      if (!best.metTarget && size < best.size) {
        best = { quality: mid, size, metTarget: false, attempts };
      }
      high = mid;
    }
    if (high - low < 0.02) break;
  }

  return { ...best, attempts };
}
