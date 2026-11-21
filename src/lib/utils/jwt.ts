/**
 * JWT helpers — pure functions, no React imports.
 *
 * A JSON Web Token is three Base64URL segments joined by dots:
 * header.payload.signature. Decoding only reads the first two segments —
 * it does NOT prove the token is genuine. Only signature verification
 * (with the correct key) does that. These helpers keep that distinction
 * explicit: `decodeJwt` never claims validity, and `verifyHs256` is a
 * separate, explicit step.
 */

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  /** Raw Base64URL signature segment (may be empty for alg "none"). */
  signature: string;
  /** The exact "header.payload" text that the signature covers. */
  signingInput: string;
}

export interface JwtIssue {
  level: "error" | "warning" | "info";
  message: string;
}

/** Decode one Base64URL segment to a UTF-8 string. Throws on bad input. */
export function base64UrlDecode(segment: string): string {
  const cleaned = segment.trim();
  if (!/^[A-Za-z0-9_-]*$/.test(cleaned)) {
    throw new Error(
      "Contains characters outside the Base64URL alphabet (A–Z, a–z, 0–9, -, _).",
    );
  }
  const base64 = cleaned.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  let binary: string;
  try {
    binary = atob(padded);
  } catch {
    throw new Error("Not valid Base64URL data.");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("Decoded bytes are not valid UTF-8 text.");
  }
}

function parseJsonSegment(segment: string, label: string): Record<string, unknown> {
  let text: string;
  try {
    text = base64UrlDecode(segment);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Invalid encoding.";
    throw new Error(`${label} segment: ${detail}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`${label} segment does not contain valid JSON.`);
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} segment must be a JSON object.`);
  }
  return parsed as Record<string, unknown>;
}

/**
 * Split and decode a JWT. Throws an Error with a user-readable message
 * when the token is structurally invalid.
 */
export function decodeJwt(token: string): DecodedJwt {
  const trimmed = token.trim();
  if (trimmed === "") {
    throw new Error("Paste a JWT first — it looks like xxxxx.yyyyy.zzzzz.");
  }
  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    throw new Error(
      `A JWT has exactly 3 dot-separated parts (header.payload.signature); this input has ${parts.length}.`,
    );
  }
  const [headerSeg, payloadSeg, signature] = parts;
  if (headerSeg === "" || payloadSeg === "") {
    throw new Error("The header and payload segments must not be empty.");
  }
  return {
    header: parseJsonSegment(headerSeg, "Header"),
    payload: parseJsonSegment(payloadSeg, "Payload"),
    signature,
    signingInput: `${headerSeg}.${payloadSeg}`,
  };
}

/** Human-readable explanations for the registered JWT claims (RFC 7519). */
export const CLAIM_DESCRIPTIONS: Record<string, string> = {
  iss: "Issuer — who created and signed this token",
  sub: "Subject — who or what this token is about (often a user ID)",
  aud: "Audience — who this token is intended for",
  exp: "Expiration time — after this moment the token must be rejected",
  nbf: "Not before — the token is not valid before this moment",
  iat: "Issued at — when the token was created",
  jti: "JWT ID — a unique identifier for this token",
  alg: "Algorithm used to sign the token",
  typ: "Token type (usually \"JWT\")",
  kid: "Key ID — which key was used to sign",
};

/** Convert a NumericDate claim (seconds since epoch) to a Date, if valid. */
export function claimDate(value: unknown): Date | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const date = new Date(value * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Structural checks beyond decoding: algorithm sanity, time-claim types
 * and expiry status. Returns findings for display — never a "valid" verdict,
 * because validity requires signature verification.
 */
export function inspectJwt(decoded: DecodedJwt, now: Date = new Date()): JwtIssue[] {
  const issues: JwtIssue[] = [];
  const { header, payload, signature } = decoded;

  const alg = header.alg;
  if (typeof alg !== "string" || alg === "") {
    issues.push({ level: "error", message: "Header is missing the \"alg\" (algorithm) claim." });
  } else if (alg.toLowerCase() === "none") {
    issues.push({
      level: "warning",
      message:
        "Algorithm is \"none\" — this token is unsigned. Any system that accepts it without checking is insecure.",
    });
  }

  if (signature === "" && typeof alg === "string" && alg.toLowerCase() !== "none") {
    issues.push({
      level: "warning",
      message: "The signature segment is empty even though the algorithm expects one.",
    });
  }

  const exp = claimDate(payload.exp);
  if (payload.exp !== undefined && exp === null) {
    issues.push({ level: "warning", message: "\"exp\" is present but is not a valid NumericDate (seconds since epoch)." });
  } else if (exp !== null) {
    if (exp.getTime() <= now.getTime()) {
      issues.push({ level: "warning", message: `This token expired on ${exp.toUTCString()}.` });
    } else {
      issues.push({ level: "info", message: `This token expires on ${exp.toUTCString()}.` });
    }
  } else {
    issues.push({ level: "info", message: "No \"exp\" claim — this token does not expire on its own." });
  }

  const nbf = claimDate(payload.nbf);
  if (nbf !== null && nbf.getTime() > now.getTime()) {
    issues.push({ level: "warning", message: `This token is not valid before ${nbf.toUTCString()}.` });
  }

  return issues;
}

function base64UrlToBytes(segment: string): Uint8Array {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Verify an HS256 (HMAC-SHA256) signature with a shared secret using
 * WebCrypto. Returns true only when the signature matches. Throws when
 * the token does not use HS256 or the signature is malformed.
 *
 * Note: this proves the token was signed with this secret — it does not
 * check expiry or any other claim.
 */
export async function verifyHs256(token: string, secret: string): Promise<boolean> {
  const decoded = decodeJwt(token);
  const alg = decoded.header.alg;
  if (typeof alg !== "string" || alg.toUpperCase() !== "HS256") {
    throw new Error(
      `This verifier only supports HS256 tokens; this token uses ${typeof alg === "string" ? alg : "an unknown algorithm"}.`,
    );
  }
  if (secret === "") {
    throw new Error("Enter the shared secret used to sign the token.");
  }
  let signatureBytes: Uint8Array;
  try {
    signatureBytes = base64UrlToBytes(decoded.signature);
  } catch {
    throw new Error("The signature segment is not valid Base64URL.");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes as BufferSource,
    new TextEncoder().encode(decoded.signingInput),
  );
}
