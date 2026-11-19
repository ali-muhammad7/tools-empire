"use client";

import dynamic from "next/dynamic";

/**
 * Lazy wrapper for the QR tool. The `qrcode` library is the only
 * non-trivial dependency on the site, so it is code-split behind a
 * dynamic import *inside a Client Component* — that is what makes the
 * chunk load only when the QR page actually renders it.
 *
 * (A `next/dynamic` import directly in the Server Component tool page
 * did not split it: the chunk was still in a `<script src>` on every
 * tool page. Verified by inspecting the built HTML — see STAGE6-REPORT.)
 */
const QrCodeGenerator = dynamic(() =>
  import("./QrCodeGenerator").then((mod) => mod.QrCodeGenerator),
);

export function QrCodeGeneratorLazy() {
  return <QrCodeGenerator />;
}
