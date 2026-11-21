"use client";

import dynamic from "next/dynamic";

/**
 * Lazy wrapper for the PDF Organizer. pdf-lib and PDF.js are heavy
 * libraries; code-splitting them behind a dynamic import inside a
 * Client Component keeps them off the homepage and every other tool
 * page — same pattern as QrCodeGeneratorLazy.
 */
const PdfOrganizer = dynamic(() =>
  import("./PdfOrganizer").then((mod) => mod.PdfOrganizer),
);

export function PdfOrganizerLazy() {
  return <PdfOrganizer />;
}
