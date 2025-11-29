"use client";

import { useState } from "react";
import VideoAnalyzer from "@/components/VideoAnalyzer";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        padding: "40px 20px",
        color: "white",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          background: "#111",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 0 25px rgba(0,255,0,0.15)",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "12px",
          }}
        >
          Golf Swing Analyzer
        </h1>

        <p
          style={{
            opacity: 0.75,
            fontSize: "15px",
            textAlign: "center",
            marginBottom: "30px",
            lineHeight: "1.5",
          }}
        >
          Upload a short golf swing video (3–20 seconds).  
          The app extracts frames and generates an instant local analysis.  
          <span style={{ color: "#00FF00" }}>(Runs without API keys.)</span>
        </p>

        <div
          style={{
            background: "#191919",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #222",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <label
            style={{
              fontSize: "16px",
              opacity: 0.9,
              marginBottom: "-8px",
            }}
          >
            Select Video File:
          </label>

          <input
            type="file"
            accept="video/*"
            onChange={handleFile}
            style={{
              padding: "10px",
              borderRadius: "8px",
              background: "#000",
              border: "1px solid #333",
              color: "white",
            }}
          />

          {file && (
            <div
              style={{
                background: "#000",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #333",
                marginTop: "10px",
              }}
            >
              <video
                src={URL.createObjectURL(file)}
                controls
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              />
            </div>
          )}
        </div>

        {/* Analysis Section */}
        {file && (
          <div style={{ marginTop: "40px" }}>
            <VideoAnalyzer file={file} />
          </div>
        )}
      </div>
    </main>
  );
}
