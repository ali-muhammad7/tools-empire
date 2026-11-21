import { describe, expect, it } from "vitest";
import {
  base64UrlDecode,
  claimDate,
  decodeJwt,
  inspectJwt,
  verifyHs256,
} from "../jwt";

/** Build a JWT from JSON objects (unsigned test tokens). */
function makeToken(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  signature = "c2ln",
): string {
  const enc = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj), "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return `${enc(header)}.${enc(payload)}.${signature}`;
}

describe("base64UrlDecode", () => {
  it("decodes plain text", () => {
    expect(base64UrlDecode("SGVsbG8")).toBe("Hello");
  });

  it("decodes UTF-8 text", () => {
    const encoded = Buffer.from("héllo ✓", "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(base64UrlDecode(encoded)).toBe("héllo ✓");
  });

  it("rejects characters outside the alphabet", () => {
    expect(() => base64UrlDecode("abc!")).toThrow(/Base64URL alphabet/);
  });
});

describe("decodeJwt", () => {
  it("decodes a well-formed token", () => {
    const token = makeToken(
      { alg: "HS256", typ: "JWT" },
      { sub: "123", name: "Ali" },
    );
    const decoded = decodeJwt(token);
    expect(decoded.header.alg).toBe("HS256");
    expect(decoded.payload.sub).toBe("123");
    expect(decoded.signature).toBe("c2ln");
    expect(decoded.signingInput).toBe(token.split(".").slice(0, 2).join("."));
  });

  it("rejects empty input", () => {
    expect(() => decodeJwt("   ")).toThrow(/Paste a JWT/);
  });

  it("rejects tokens without exactly 3 parts", () => {
    expect(() => decodeJwt("onlyone")).toThrow(/exactly 3/);
    expect(() => decodeJwt("a.b")).toThrow(/exactly 3/);
    expect(() => decodeJwt("a.b.c.d")).toThrow(/exactly 3/);
  });

  it("rejects a header that is not JSON", () => {
    expect(() => decodeJwt("bm90anNvbg.eyJhIjoxfQ.c2ln")).toThrow(/Header/);
  });

  it("rejects a payload that is not a JSON object", () => {
    const arraySeg = Buffer.from("[1,2]").toString("base64url");
    const token = `${Buffer.from('{"alg":"HS256"}').toString("base64url")}.${arraySeg}.c2ln`;
    expect(() => decodeJwt(token)).toThrow(/must be a JSON object/);
  });

  it("rejects empty header/payload segments", () => {
    expect(() => decodeJwt(".eyJhIjoxfQ.c2ln")).toThrow(/must not be empty/);
  });
});

describe("claimDate", () => {
  it("converts NumericDate seconds to a Date", () => {
    expect(claimDate(1700000000)?.getTime()).toBe(1700000000000);
  });

  it("returns null for non-numbers", () => {
    expect(claimDate("1700000000")).toBeNull();
    expect(claimDate(undefined)).toBeNull();
    expect(claimDate(NaN)).toBeNull();
  });
});

describe("inspectJwt", () => {
  const now = new Date("2026-11-22T00:00:00Z");

  it("flags an expired token", () => {
    const token = makeToken({ alg: "HS256" }, { exp: 1700000000 });
    const issues = inspectJwt(decodeJwt(token), now);
    expect(issues.some((i) => /expired/.test(i.message))).toBe(true);
  });

  it("reports a future expiry as info", () => {
    const token = makeToken({ alg: "HS256" }, { exp: 1893456000 });
    const issues = inspectJwt(decodeJwt(token), now);
    expect(issues.some((i) => i.level === "info" && /expires on/.test(i.message))).toBe(true);
  });

  it("warns about alg none", () => {
    const token = makeToken({ alg: "none" }, { sub: "1" }, "");
    const issues = inspectJwt(decodeJwt(token), now);
    expect(issues.some((i) => /unsigned/.test(i.message))).toBe(true);
  });

  it("errors when alg is missing", () => {
    const token = makeToken({ typ: "JWT" }, { sub: "1" });
    const issues = inspectJwt(decodeJwt(token), now);
    expect(issues.some((i) => i.level === "error")).toBe(true);
  });

  it("flags a not-yet-valid token", () => {
    const token = makeToken({ alg: "HS256" }, { nbf: 1893456000 });
    const issues = inspectJwt(decodeJwt(token), now);
    expect(issues.some((i) => /not valid before/.test(i.message))).toBe(true);
  });
});

describe("verifyHs256", () => {
  // Token signed with HMAC-SHA256 using secret "test-secret"
  // (generated with Node's crypto for this test).
  const secret = "test-secret";

  async function signedToken(payload: Record<string, unknown>): Promise<string> {
    const { createHmac } = await import("node:crypto");
    const enc = (obj: Record<string, unknown>) =>
      Buffer.from(JSON.stringify(obj), "utf8").toString("base64url");
    const signingInput = `${enc({ alg: "HS256", typ: "JWT" })}.${enc(payload)}`;
    const sig = createHmac("sha256", secret).update(signingInput).digest("base64url");
    return `${signingInput}.${sig}`;
  }

  it("accepts a correctly signed token", async () => {
    const token = await signedToken({ sub: "42" });
    await expect(verifyHs256(token, secret)).resolves.toBe(true);
  });

  it("rejects a wrong secret", async () => {
    const token = await signedToken({ sub: "42" });
    await expect(verifyHs256(token, "wrong-secret")).resolves.toBe(false);
  });

  it("rejects a tampered payload", async () => {
    const token = await signedToken({ sub: "42" });
    const parts = token.split(".");
    parts[1] = Buffer.from(JSON.stringify({ sub: "admin" })).toString("base64url");
    await expect(verifyHs256(parts.join("."), secret)).resolves.toBe(false);
  });

  it("throws for non-HS256 tokens", async () => {
    const token = makeToken({ alg: "RS256" }, { sub: "1" });
    await expect(verifyHs256(token, secret)).rejects.toThrow(/HS256/);
  });

  it("throws when the secret is empty", async () => {
    const token = await signedToken({ sub: "42" });
    await expect(verifyHs256(token, "")).rejects.toThrow(/secret/);
  });
});
