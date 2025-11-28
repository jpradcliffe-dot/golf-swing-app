"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ------------------------
  // Extract ~8 frames locally
  // ------------------------
  async function extractFrames(videoFile: File): Promise<string[]> {
    return new Promise((resolve) => {
      const videoEl = document.createElement("video");
      const url = URL.createObjectURL(videoFile);
      videoEl.src = url;
      videoEl.crossOrigin = "anonymous";
      videoEl.load();

      videoEl.onloadedmetadata = async () => {
        const duration = videoEl.duration;
        const frameCount = 8;
        const timestamps = Array.from(
          { length: frameCount },
          (_, i) => (duration / (frameCount + 1)) * (i + 1)
        );

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const frames: string[] = [];

        for (let t of timestamps) {
          videoEl.currentTime = t;

          await new Promise((r) => {
            videoEl.onseeked = () => {
              canvas.width = videoEl.videoWidth;
              canvas.height = videoEl.videoHeight;
              ctx.drawImage(videoEl, 0, 0);
              frames.push(canvas.toDataURL("image/jpeg", 0.8));
              r(null);
            };
          });
        }

        resolve(frames);
      };
    });
  }

  // ------------------------
  // Fake AI – local analysis
  // ------------------------
  function generateLocalAnalysis(frames: string[]): string {
    return `
Golf Swing Analysis (Local Mode)

• Your stance looks balanced but slightly narrow.
• Backswing rotation appears limited—try turning your shoulders more fully.
• You may be standing a bit too upright at address.
• Your club plane at the top drifts slightly outside the ideal line.
• Impact position suggests you might be losing lag early.
• Follow-through is stable but could extend further toward your target.

(This analysis is generated locally without any AI key.)
`;
  }

  // ------------------------
  // Main handler
  // ------------------------
  async function handleAnalyze() {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalysis(null);

    const frames = await extractFrames(file);
    const result = generateLocalAnalysis(frames);

    setAnalysis(result);
    setIsAnalyzing(false);
  }

  return (
    <div style={{ padding: 30, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        Golf Swing Analyzer (Local Mode)
      </h1>

      <p style={{ opacity: 0.7 }}>
        Upload a swing video (3–20 seconds).  
        Your device extracts frames locally — no server, no OpenAI key, no API.
      </p>

      {/* FILE INPUT */}
      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setFile(f);
            setVideoURL(URL.createObjectURL(f));
            setAnalysis(null);
          }
        }}
        style={{ marginTop: 20 }}
      />

      {/* VIDEO PREVIEW */}
      {videoURL && (
        <video
          src={videoURL}
          controls
          style={{ marginTop: 20, width: "100%", borderRadius: 8 }}
        />
      )}

      {/* ANALYZE BUTTON */}
      <button
        onClick={handleAnalyze}
        disabled={!file || isAnalyzing}
        style={{
          marginTop: 20,
          padding: "12px 20px",
          fontSize: 18,
          background: isAnalyzing ? "#999" : "#0a84ff",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: isAnalyzing ? "default" : "pointer",
          width: "100%",
        }}
      >
        {isAnalyzing ? "Analyzing…" : "Analyze Swing"}
      </button>

      {/* ANALYSIS RESULT */}
      {analysis && (
        <pre
          style={{
            marginTop: 25,
            background: "#111",
            color: "#0f0",
            padding: 20,
            borderRadius: 8,
            whiteSpace: "pre-wrap",
            fontSize: 16,
          }}
        >
          {analysis}
        </pre>
      )}
    </div>
  );
}
