async function analyzeVideo(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.analysis;
}
// app/page.tsx
"use client";

import React, { useState } from "react";
import VideoAnalyzer from "../components/VideoAnalyzer"; // relative path from app/page.tsx -> components folder

export default function Page() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <main style={{ padding: 20 }}>
      <h1>Golf Swing Analyzer</h1>

      <label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
          }}
        />
      </label>

      <div style={{ marginTop: 24 }}>
        <VideoAnalyzer file={file} />
      </div>
    </main>
  );
}
