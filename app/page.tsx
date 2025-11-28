"use client";

import VideoAnalyzer from "@/components/VideoAnalyzer";

export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Golf Swing Analyzer</h1>
      <p>Upload your swing video to view it with controls.</p>
      <VideoAnalyzer />
    </main>
  );
}
