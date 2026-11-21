/**
 * Browser-only download helpers (uses DOM APIs — never import from
 * Server Components or Node tests).
 */

/** Trigger a browser download for in-memory bytes. */
export function downloadBytes(
  bytes: Uint8Array,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([bytes as BlobPart], { type: mimeType });
  downloadBlob(blob, filename);
}

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke after a tick so the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
