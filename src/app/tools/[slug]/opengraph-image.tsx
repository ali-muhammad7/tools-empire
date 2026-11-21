import { ImageResponse } from "next/og";
import { TOOLS, getToolBySlug } from "@/lib/tools";

/**
 * Per-tool social share image (Stage 8 SEO fix). One image per registry
 * slug, generated at build time — no image assets, no new dependencies.
 */
export const alt = "Tools Empire tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  const name = tool?.name ?? "Tools Empire";
  const category = tool?.category ?? "Free Online Tools";

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
            fontSize: 30,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#a5b4fc",
          }}
        >
          {category}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 84,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {name}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 32,
            textAlign: "center",
            color: "#e0e7ff",
          }}
        >
          Free · Private · Runs in your browser
        </div>
        <div
          style={{
            marginTop: 56,
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 13,
              background: "#ffffff",
              color: "#4f46e5",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            T
          </div>
          Tools Empire
        </div>
      </div>
    ),
    { ...size },
  );
}
