/**
 * Tools Empire — Tool Registry
 *
 * Single source of truth for every tool on the platform. The homepage,
 * search, category sections, tool pages (`/tools/[slug]`) and (in Stage 6)
 * the sitemap are all driven from this file — add a new tool here and it
 * shows up everywhere automatically.
 *
 * `icon` is the name of a lucide-react icon (see `src/lib/tool-icons.tsx`
 * for the name → component map). Keeping the registry free of component
 * imports keeps it usable from Server Components and from build-time code
 * such as `generateStaticParams`.
 */

export type ToolCategory =
  | "Text Tools"
  | "Encoding & Data"
  | "Generators"
  | "Design Tools"
  | "PDF Tools"
  | "Image Tools";

export const CATEGORIES: ToolCategory[] = [
  "Text Tools",
  "Encoding & Data",
  "Generators",
  "Design Tools",
  "PDF Tools",
  "Image Tools",
];

/** One-line description per category, shown on category pages. */
export const CATEGORY_DESCRIPTIONS: Record<ToolCategory, string> = {
  "Text Tools":
    "Count, convert and shape your words — word and character counts, case conversion and more, all as you type.",
  "Encoding & Data":
    "Encode, decode, format and validate data — JSON, Base64, URLs and JWTs, with clear errors when input is invalid.",
  Generators:
    "Create secure passwords, unique UUIDs and shareable QR codes in one click — generated locally, never uploaded.",
  "Design Tools":
    "Convert and preview colours between HEX, RGB and HSL, and find the exact shade you need.",
  "PDF Tools":
    "Merge, split, extract, rotate and reorder PDF pages — your files are processed on your device and never uploaded.",
  "Image Tools":
    "Compress, resize and convert images between JPG, PNG and WebP in batches — privately, right in your browser.",
};

export interface Tool {
  /** URL slug, e.g. `/tools/word-counter`. */
  slug: string;
  name: string;
  /** One-line description shown on cards and tool pages. */
  description: string;
  category: ToolCategory;
  /** Search terms matched by the homepage search (lowercased at use). */
  keywords: string[];
  /** Name of a lucide-react icon — see `src/lib/tool-icons.tsx`. */
  icon: string;
}

export const TOOLS: Tool[] = [
  {
    slug: "word-counter",
    name: "Word Counter",
    description:
      "Count words, characters, sentences and paragraphs in any text — instantly, as you type.",
    category: "Text Tools",
    keywords: ["words", "count", "text", "sentences", "paragraphs", "reading time"],
    icon: "FileText",
  },
  {
    slug: "character-counter",
    name: "Character Counter",
    description:
      "Count characters with and without spaces, plus lines and bytes — perfect for limits on social posts and forms.",
    category: "Text Tools",
    keywords: ["characters", "chars", "count", "letters", "length", "twitter", "limit"],
    icon: "Hash",
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    description:
      "Convert text between UPPERCASE, lowercase, Title Case, sentence case and more in one click.",
    category: "Text Tools",
    keywords: ["uppercase", "lowercase", "title case", "sentence case", "capitalize", "transform"],
    icon: "CaseUpper",
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description:
      "Beautify, minify and validate JSON with clear error messages that point to the exact problem.",
    category: "Encoding & Data",
    keywords: ["json", "format", "beautify", "minify", "validate", "pretty print"],
    icon: "Braces",
  },
  {
    slug: "base64-encoder-decoder",
    name: "Base64 Encoder/Decoder",
    description:
      "Encode text to Base64 or decode Base64 back to readable text — fast and fully private.",
    category: "Encoding & Data",
    keywords: ["base64", "encode", "decode", "binary", "encryption"],
    icon: "Binary",
  },
  {
    slug: "url-encoder-decoder",
    name: "URL Encoder/Decoder",
    description:
      "Percent-encode URLs for safe sharing, or decode an encoded URL back to its original form.",
    category: "Encoding & Data",
    keywords: ["url", "encode", "decode", "percent", "uri", "query string"],
    icon: "Link2",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description:
      "Generate random UUID v4 identifiers, one at a time or in bulk, ready to copy.",
    category: "Generators",
    keywords: ["uuid", "guid", "unique", "identifier", "random", "id"],
    icon: "Scan",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    description:
      "Create strong, random passwords with the length and character sets you choose.",
    category: "Generators",
    keywords: ["password", "secure", "random", "generate", "passphrase", "strength"],
    icon: "KeyRound",
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    description:
      "Turn any URL or text into a QR code you can download and share anywhere.",
    category: "Generators",
    keywords: ["qr", "code", "barcode", "scan", "link", "share"],
    icon: "QrCode",
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description:
      "Convert colors between HEX, RGB and HSL, and preview the result instantly.",
    category: "Design Tools",
    keywords: ["color", "colour", "hex", "rgb", "hsl", "palette", "picker"],
    icon: "Palette",
  },
  {
    slug: "pdf-organizer",
    name: "PDF Organizer",
    description:
      "Merge, split, extract, rotate and reorder PDF pages — free, unlimited, and your files never leave your device.",
    category: "PDF Tools",
    keywords: [
      "pdf",
      "merge pdf",
      "split pdf",
      "extract pages",
      "rotate pdf",
      "reorder pages",
      "combine pdf",
      "pdf editor",
    ],
    icon: "FileStack",
  },
  {
    slug: "image-compressor",
    name: "Image Compressor & Converter",
    description:
      "Compress and convert JPG, PNG and WebP images in batches — hit an exact target size for forms and uploads, privately in your browser.",
    category: "Image Tools",
    keywords: [
      "image",
      "compress image",
      "resize image",
      "jpg to png",
      "png to jpg",
      "webp converter",
      "reduce image size",
      "photo compressor",
    ],
    icon: "ImageDown",
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description:
      "Decode a JSON Web Token's header and payload, inspect its claims and expiry, and optionally verify an HS256 signature — without sending the token anywhere.",
    category: "Encoding & Data",
    keywords: [
      "jwt",
      "json web token",
      "decode token",
      "jwt debugger",
      "verify jwt",
      "hs256",
      "bearer token",
    ],
    icon: "FileKey",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter((tool) => tool.category === category);
}

/** URL slug for a category, e.g. "text-tools" → `/categories/text-tools`. */
export function categorySlug(category: ToolCategory): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function getCategoryBySlug(slug: string): ToolCategory | undefined {
  return CATEGORIES.find((category) => categorySlug(category) === slug);
}

/** Anchor id used for a category section on the homepage (same as its slug). */
export function categoryAnchorId(category: ToolCategory): string {
  return categorySlug(category);
}

/** Case-insensitive match against name, description, category and keywords. */
export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;
  return TOOLS.filter((tool) => {
    const haystack = [tool.name, tool.description, tool.category, ...tool.keywords]
      .join(" ")
      .toLowerCase();
    return q.split(/\s+/).every((word) => haystack.includes(word));
  });
}
