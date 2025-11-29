// app/page.tsx
"use client";

import React, { useState } from "react";
import VideoUploader from "../components/VideoUploader";
import VideoAnalyzer from "../components/VideoAnalyzer";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <main style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 12 }}>Golf Swing Analyzer (MoveNet)</h1>
      <p style={{ marginBottom: 18 }}>
        Upload a video (mp4/webm). The analysis runs locally in the browser using MoveNet.
      </p>

      <VideoUploader onFileSelected={(f) => setFile(f)} />

      {file ? (
        <div style={{ marginTop: 20 }}>
          <VideoAnalyzer file={file} />
        </div>
      ) : (
        <div style={{ marginTop: 20, color: "#888" }}>No video selected.</div>
      )}
    </main>
  );
}
