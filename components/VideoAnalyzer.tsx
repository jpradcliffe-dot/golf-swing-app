'use client';
import React, { useRef, useState } from 'react';

type Props = {
  onResult?: (text: string) => void;
};

export default function VideoAnalyzer({ onResult }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [framesCount, setFramesCount] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFramesCount(0);
    setProgress(null);
  }

  // extract `n` frames evenly across the video's duration
  async function extractFramesFromVideo(file: File, n = 10) {
    return new Promise<string[]>(async (resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'auto';
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = async () => {
        const duration = video.duration;
        if (!isFinite(duration) || duration <= 0) {
          reject(new Error('Could not read video duration'));
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not create canvas'));
          return;
        }

        const frames: string[] = [];
        // choose up to n samples, spaced evenly but not beyond duration
        const samples = Math.min(n, Math.max(1, Math.floor(duration * 2))); // avoid too many frames for very long video
        for (let i = 0; i < samples; i++) {
          const t = Math.min(duration - 0.05, (i / Math.max(1, samples - 1)) * duration);
          await seekVideo(video, t);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // compress with toDataURL
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          frames.push(dataUrl);
        }
        URL.revokeObjectURL(url);
        resolve(frames);
      };

      video.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error('Video load failed'));
      };
      // if it doesn't load metadata in a reasonable time, timeout
      setTimeout(() => {
        if (!video.duration || !isFinite(video.duration)) {
          // still try — sometimes metadata takes time
        }
      }, 2000);
    });
  }

  function seekVideo(video: HTMLVideoElement, time: number) {
    return new Promise<void>((resolve) => {
      const handler = () => {
        video.removeEventListener('seeked', handler);
        // allow a short pause to ensure frame is ready
        setTimeout(() => resolve(), 50);
      };
      video.addEventListener('seeked', handler);
      video.currentTime = time;
    });
  }

  async function analyze() {
    if (!file) return;
    setProgress('Extracting frames...');
    try {
      const frames = await extractFramesFromVideo(file, 10);
      setFramesCount(frames.length);
      setProgress('Uploading frames and analyzing...');
      // Send frames to server
      const body = { frames }; // array of dataURLs
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        setProgress(null);
        alert('Server error: ' + text);
        return;
      }
      const json = await res.json();
      setProgress(null);
      const resultText = json.result ?? 'No analysis returned.';
      if (onResult) onResult(resultText);
    } catch (err: any) {
      setProgress(null);
      alert('Error: ' + (err?.message ?? err));
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <label style={{ display: 'block', marginBottom: 8 }}>
        <input type="file" accept="video/*" onChange={handleFileChange} />
      </label>

      {file && (
        <div style={{ marginTop: 8 }}>
          <video
            ref={videoRef}
            src={URL.createObjectURL(file)}
            controls
            style={{ maxWidth: '100%', borderRadius: 6, background: '#000' }}
          />
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={analyze}
          disabled={!file || !!progress}
          style={{
            background: '#e6e6e6',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 6,
            cursor: file ? 'pointer' : 'not-allowed',
          }}
        >
          Analyze video (frames)
        </button>

        <div style={{ color: '#aaa', fontSize: 13 }}>
          {progress ?? (framesCount ? `${framesCount} frames extracted` : 'No frames yet')}
        </div>
      </div>
    </div>
  );
}
