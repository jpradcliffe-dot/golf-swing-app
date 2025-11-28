"use client";

import React, { useState } from "react";
import VideoAnalyzer from "../components/VideoAnalyzer";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <main style={{ padding: 20 }}>
      <h1>Golf Swing Analyzer</h1>
      <p>Upload a short video (3-20s). The app extracts frames, runs local pose detection, and shows a phase breakdown.</p>

      <div style={{ marginBottom: 12 }}>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
          }}
        />
      </div>

      {file ? <VideoAnalyzer file={file} /> : <div>No file chosen</div>}
    </main>
  );
}
