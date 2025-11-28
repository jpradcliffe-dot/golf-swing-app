"use client";

import { useRef, useState } from "react";

export default function VideoAnalyzer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoURL(url);
  }

  function seekTo(percent: number) {
    if (!videoRef.current) return;
    const vid = videoRef.current;
    vid.currentTime = vid.duration * percent;
  }

  return (
    <div style={{ marginTop: 20 }}>
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        style={{ marginBottom: 20 }}
      />

      {videoURL && (
        <>
          <video
            ref={videoRef}
            src={videoURL}
            controls
            style={{ width: "100%", borderRadius: 8 }}
          />

          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button onClick={() => seekTo(0)}>Start</button>
            <button onClick={() => seekTo(0.25)}>25%</button>
            <button onClick={() => seekTo(0.5)}>50%</button>
            <button onClick={() => seekTo(0.75)}>75%</button>
            <button onClick={() => seekTo(0.95)}>Impact</button>
          </div>
        </>
      )}
    </div>
  );
}
