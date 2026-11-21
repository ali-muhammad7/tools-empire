"use client";

import { useMemo, useState } from "react";
import {
  CircleCheck,
  Info,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import {
  CLAIM_DESCRIPTIONS,
  claimDate,
  decodeJwt,
  inspectJwt,
  verifyHs256,
  type DecodedJwt,
} from "@/lib/utils/jwt";

// The classic jwt.io demo token (HS256, secret "your-256-bit-secret").
// Safe to ship: it is a public example, not a real credential.
const EXAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

type VerifyState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid" }
  | { status: "invalid" }
  | { status: "error"; message: string };

function ClaimValue({ name, value }: { name: string; value: unknown }) {
  const date = ["exp", "iat", "nbf"].includes(name) ? claimDate(value) : null;
  return (
    <span className="min-w-0 break-all">
      <code className="font-mono text-sm">{JSON.stringify(value)}</code>
      {date && (
        <span className="block text-xs text-muted-foreground">
          {date.toUTCString()} ({date.toLocaleString()})
        </span>
      )}
    </span>
  );
}

function ClaimsTable({ claims }: { claims: Record<string, unknown> }) {
  const entries = Object.entries(claims);
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No claims present.</p>;
  }
  return (
    <dl className="divide-y divide-border">
      {entries.map(([name, value]) => (
        <div key={name} className="grid gap-1 py-2 sm:grid-cols-[10rem_1fr]">
          <dt className="text-sm font-medium">
            <code className="font-mono">{name}</code>
            {CLAIM_DESCRIPTIONS[name] && (
              <span className="block text-xs font-normal text-muted-foreground">
                {CLAIM_DESCRIPTIONS[name]}
              </span>
            )}
          </dt>
          <dd>
            <ClaimValue name={name} value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function JwtDecoder() {
  const [input, setInput] = useState("");
  const [secret, setSecret] = useState("");
  const [verify, setVerify] = useState<VerifyState>({ status: "idle" });

  const decoded: { ok: true; value: DecodedJwt } | { ok: false; error: string } | null =
    useMemo(() => {
      if (input.trim() === "") return null;
      try {
        return { ok: true, value: decodeJwt(input) };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "Could not decode this token.",
        };
      }
    }, [input]);

  const issues = useMemo(
    () => (decoded?.ok ? inspectJwt(decoded.value) : []),
    [decoded],
  );

  async function handleVerify() {
    setVerify({ status: "checking" });
    try {
      const valid = await verifyHs256(input, secret);
      setVerify({ status: valid ? "valid" : "invalid" });
    } catch (err) {
      setVerify({
        status: "error",
        message: err instanceof Error ? err.message : "Verification failed.",
      });
    }
  }

  const isHs256 =
    decoded?.ok &&
    typeof decoded.value.header.alg === "string" &&
    decoded.value.header.alg.toUpperCase() === "HS256";

  return (
    <ToolLayout>
      <div
        role="note"
        className="mb-5 flex gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
      >
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          <strong>Decoding is not verifying.</strong> Anyone can read a
          JWT&apos;s header and payload — never put secrets in one. Only a
          valid signature proves the token is genuine. This tool decodes
          locally; use the optional HS256 check below to verify a signature.
        </span>
      </div>

      <label htmlFor="jwt-input" className="mb-2 block text-sm font-medium">
        JWT input
      </label>
      <textarea
        id="jwt-input"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setVerify({ status: "idle" });
        }}
        placeholder="Paste a JWT here — xxxxx.yyyyy.zzzzz"
        rows={5}
        spellCheck={false}
        className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm leading-6 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setInput(EXAMPLE);
            setVerify({ status: "idle" });
          }}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Example token
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setInput("");
            setSecret("");
            setVerify({ status: "idle" });
          }}
          disabled={!input}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Clear
        </Button>
      </div>

      {decoded && !decoded.ok && (
        <div
          role="alert"
          className="mt-5 flex gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">
            <strong>Invalid JWT:</strong> {decoded.error}
          </span>
        </div>
      )}

      {decoded?.ok && (
        <div className="mt-6 space-y-6">
          {issues.length > 0 && (
            <ul className="space-y-2" aria-label="Token findings">
              {issues.map((issue, i) => (
                <li
                  key={i}
                  className={`flex gap-2 rounded-xl border p-3 text-sm ${
                    issue.level === "error"
                      ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
                      : issue.level === "warning"
                        ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
                        : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {issue.level === "info" ? (
                    <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span className="min-w-0 break-words">{issue.message}</span>
                </li>
              ))}
            </ul>
          )}

          <section aria-label="Decoded header">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Header</h2>
              <CopyButton
                text={JSON.stringify(decoded.value.header, null, 2)}
                label="Copy JSON"
              />
            </div>
            <ClaimsTable claims={decoded.value.header} />
          </section>

          <section aria-label="Decoded payload">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Payload (claims)</h2>
              <CopyButton
                text={JSON.stringify(decoded.value.payload, null, 2)}
                label="Copy JSON"
              />
            </div>
            <ClaimsTable claims={decoded.value.payload} />
          </section>

          <section aria-label="Signature">
            <h2 className="mb-2 text-sm font-semibold">Signature</h2>
            <code className="block rounded-lg border border-border bg-muted p-3 font-mono text-sm break-all">
              {decoded.value.signature || "(empty — unsigned token)"}
            </code>

            {isHs256 ? (
              <div className="mt-4">
                <label
                  htmlFor="jwt-secret"
                  className="mb-2 block text-sm font-medium"
                >
                  Verify HS256 signature (optional)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="jwt-secret"
                    type="password"
                    value={secret}
                    onChange={(e) => {
                      setSecret(e.target.value);
                      setVerify({ status: "idle" });
                    }}
                    placeholder="Shared secret used to sign this token"
                    autoComplete="off"
                    className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-10"
                    onClick={handleVerify}
                    disabled={verify.status === "checking" || secret === ""}
                  >
                    {verify.status === "checking" ? "Verifying…" : "Verify signature"}
                  </Button>
                </div>
                {verify.status === "valid" && (
                  <p className="mt-3 flex gap-2 text-sm text-green-700 dark:text-green-300" role="status">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    Signature valid — this token was signed with that secret.
                    (Expiry and other claims are checked separately above.)
                  </p>
                )}
                {verify.status === "invalid" && (
                  <p className="mt-3 flex gap-2 text-sm text-red-700 dark:text-red-300" role="alert">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    Signature does not match — wrong secret, or the token was
                    altered after signing.
                  </p>
                )}
                {verify.status === "error" && (
                  <p className="mt-3 flex gap-2 text-sm text-red-700 dark:text-red-300" role="alert">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {verify.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  The secret is used only in this tab to compute the check —
                  it is never stored or sent anywhere.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Signature verification here supports HS256 only. This token
                uses a different algorithm, so it can be decoded but not
                verified with a shared secret.
              </p>
            )}
          </section>
        </div>
      )}
    </ToolLayout>
  );
}
