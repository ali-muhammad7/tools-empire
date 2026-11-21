"use client";

import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { Upload } from "lucide-react";

interface FileDropzoneProps {
  /** `accept` attribute for the file picker, e.g. "application/pdf". */
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  /** Called with the chosen/dropped files (already filtered to File objects). */
  onFiles: (files: File[]) => void;
  /** Main instruction line, e.g. "Drop PDF files here". */
  label: string;
  /** Secondary hint, e.g. "or click to browse — files never leave your device". */
  hint?: string;
}

/**
 * Shared drag-and-drop file picker for file-based tools.
 * Keyboard accessible (Enter/Space opens the picker) and fully local:
 * files are handed to the tool component, never uploaded anywhere.
 */
export function FileDropzone({
  accept,
  multiple = false,
  disabled = false,
  onFiles,
  label,
  hint = "or click to browse — files never leave your device",
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function openPicker() {
    if (!disabled) inputRef.current?.click();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = [...event.dataTransfer.files];
    if (files.length > 0) onFiles(multiple ? files : files.slice(0, 1));
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        dragging
          ? "border-brand bg-brand-soft"
          : "border-border bg-muted/40 hover:border-brand/60 hover:bg-muted"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <Upload className="h-8 w-8 text-brand-text" aria-hidden="true" />
      <p className="text-base font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          const files = event.target.files ? [...event.target.files] : [];
          if (files.length > 0) onFiles(files);
          // Reset so picking the same file again still fires onChange.
          event.target.value = "";
        }}
      />
    </div>
  );
}
