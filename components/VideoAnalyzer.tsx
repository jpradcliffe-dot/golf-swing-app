"use client";

import { useRef, useState } from "react";

export default function VideoAnalyzer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoURL(url);
  }

  return (
    <div style={{ marginTop: 20 }}>
      <input type="file" accept="video/*" onChange={handleUpload} />

      {videoURL && (
        <div style={{ marginTop: 20 }}>
          <video
            ref={videoRef}
            src={videoURL}
            controls
            style={{
              width: "100%",
              maxWidth: 600,
              borderRadius: 10,
              border: "2px solid #444",
            }}
          />
        </div>
      )}
    </div>
  );
}
