"use client";

import { useState } from "react";
import VideoAnalyzer from "../components/VideoAnalyzer";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div style={{ padding: 20 }}>
      <h1>Golf Swing Analyzer</h1>

      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        style={{ marginTop: 20 }}
      />

      {file && (
        <div style={{ marginTop: 20 }}>
          <VideoAnalyzer file={file} />
        </div>
      )}
    </div>
  );
}
