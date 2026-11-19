/**
 * Secure generators — pure functions, no React imports.
 * Randomness comes from crypto.getRandomValues / crypto.randomUUID only.
 * Math.random is NEVER used for UUIDs or passwords (it is not
 * cryptographically secure).
 */

export function generateUuid(): string {
  return crypto.randomUUID();
}

export function generateUuids(count: number): string[] {
  const n = Math.max(1, Math.min(100, Math.floor(count)));
  return Array.from({ length: n }, () => crypto.randomUUID());
}

const AMBIGUOUS = "Il1O0";

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export function buildCharset(opts: PasswordOptions): string {
  let charset = "";
  if (opts.lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
  if (opts.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.digits) charset += "0123456789";
  if (opts.symbols) charset += "!@#$%^&*()-_=+[]{};:,.<>?";
  if (opts.excludeAmbiguous) {
    charset = charset
      .split("")
      .filter((c) => !AMBIGUOUS.includes(c))
      .join("");
  }
  return charset;
}

/** Uniform random index via rejection sampling (avoids modulo bias). */
function secureRandomIndex(max: number): number {
  const range = 256 - (256 % max);
  const byte = new Uint8Array(1);
  let value: number;
  do {
    crypto.getRandomValues(byte);
    value = byte[0];
  } while (value >= range);
  return value % max;
}

export function generatePassword(opts: PasswordOptions): string {
  const charset = buildCharset(opts);
  if (!charset) return "";
  let password = "";
  for (let i = 0; i < opts.length; i++) {
    password += charset[secureRandomIndex(charset.length)];
  }
  return password;
}

export interface PasswordStrength {
  entropyBits: number;
  label: "Weak" | "Fair" | "Good" | "Strong" | "Excellent";
  score: number; // 0–4, for the meter
  charsetSize: number;
}

/** Honest entropy estimate: length × log2(charset size). */
export function passwordStrength(
  password: string,
  charsetSize: number,
): PasswordStrength {
  if (!password || charsetSize < 2) {
    return { entropyBits: 0, label: "Weak", score: 0, charsetSize };
  }
  const entropy = Math.round(password.length * Math.log2(charsetSize));
  if (entropy < 28) return { entropyBits: entropy, label: "Weak", score: 0, charsetSize };
  if (entropy < 36) return { entropyBits: entropy, label: "Fair", score: 1, charsetSize };
  if (entropy < 60) return { entropyBits: entropy, label: "Good", score: 2, charsetSize };
  if (entropy < 90) return { entropyBits: entropy, label: "Strong", score: 3, charsetSize };
  return { entropyBits: entropy, label: "Excellent", score: 4, charsetSize };
}
