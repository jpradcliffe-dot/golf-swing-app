// components/VideoUploader.tsx
"use client";

import React, { useCallback, useRef } from "react";

type Props = {
  onFileSelected: (file: File | null) => void;
};

export default function VideoUploader({ onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        onFileSelected(null);
        return;
      }
      const f = files[0];
      onFileSelected(f);
    },
    [onFileSelected]
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          onClick={() => {
            inputRef.current?.click();
          }}
          style={{
            padding: "8px 14px",
            background: "#0b63d6",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Choose Video
        </button>
      </div>
      <div style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
        Tip: short clips (5–15s) work best for testing.
      </div>
    </div>
  );
}
