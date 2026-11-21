"use client";

import dynamic from "next/dynamic";

/**
 * Lazy wrapper for the image compressor. The component pulls in JSZip
 * (for batch downloads) on demand; code-splitting it behind a dynamic
 * import inside a Client Component keeps that weight off every other
 * page — same pattern as QrCodeGeneratorLazy.
 */
const ImageCompressor = dynamic(() =>
  import("./ImageCompressor").then((mod) => mod.ImageCompressor),
);

export function ImageCompressorLazy() {
  return <ImageCompressor />;
}
