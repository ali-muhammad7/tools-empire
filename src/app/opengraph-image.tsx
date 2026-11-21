import { ImageResponse } from "next/og";

/**
 * Site-wide social share image (Stage 8 SEO fix: og:image was empty on
 * every page). Generated at build time with next/og — no image assets,
 * no new dependencies.
 */
export const alt = "Tools Empire — Free Online Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              borderRadius: 20,
              background: "#ffffff",
              color: "#4f46e5",
              fontSize: 52,
              fontWeight: 800,
            }}
          >
            T
          </div>
          Tools Empire
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 40,
            textAlign: "center",
            lineHeight: 1.3,
            color: "#e0e7ff",
          }}
        >
          Free online tools that actually work
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            textAlign: "center",
            color: "#c7d2fe",
          }}
        >
          Word counter · JSON formatter · Password &amp; QR generators · and more
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 26,
            color: "#a5b4fc",
          }}
        >
          tools-empire.vercel.app — free, private, no sign-up
        </div>
      </div>
    ),
    { ...size },
  );
}
