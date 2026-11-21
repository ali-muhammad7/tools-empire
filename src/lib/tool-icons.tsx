/**
 * Icon rendering for the tool registry (`src/lib/tools.ts`).
 *
 * The registry stores icon *names* (strings) so it stays usable from
 * Server Components and build-time code. This module turns a name into
 * rendered SVG. Each branch references a module-level lucide component
 * directly — never assign a component from a lookup during render, as
 * the `react-hooks/static-components` lint rule forbids that pattern.
 *
 * All names used here were verified against the installed lucide-react
 * version — do not add an icon name without checking it exists.
 */
import {
  Binary,
  Braces,
  CaseUpper,
  FileKey,
  FileStack,
  FileText,
  Hash,
  ImageDown,
  KeyRound,
  Link2,
  Palette,
  QrCode,
  Scan,
} from "lucide-react";

interface ToolIconProps {
  /** Icon name from the tool registry. Unknown names fall back to FileText. */
  icon: string;
  className?: string;
}

export function ToolIcon({ icon, className }: ToolIconProps) {
  switch (icon) {
    case "Hash":
      return <Hash className={className} aria-hidden="true" />;
    case "CaseUpper":
      return <CaseUpper className={className} aria-hidden="true" />;
    case "Braces":
      return <Braces className={className} aria-hidden="true" />;
    case "Binary":
      return <Binary className={className} aria-hidden="true" />;
    case "Link2":
      return <Link2 className={className} aria-hidden="true" />;
    case "Scan":
      return <Scan className={className} aria-hidden="true" />;
    case "KeyRound":
      return <KeyRound className={className} aria-hidden="true" />;
    case "QrCode":
      return <QrCode className={className} aria-hidden="true" />;
    case "Palette":
      return <Palette className={className} aria-hidden="true" />;
    case "FileStack":
      return <FileStack className={className} aria-hidden="true" />;
    case "ImageDown":
      return <ImageDown className={className} aria-hidden="true" />;
    case "FileKey":
      return <FileKey className={className} aria-hidden="true" />;
    case "FileText":
    default:
      return <FileText className={className} aria-hidden="true" />;
  }
}
