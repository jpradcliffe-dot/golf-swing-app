'use client';
import React, { useState } from 'react';
import VideoAnalyzer from '../components/VideoAnalyzer';

export default function Page() {
  const [analysis, setAnalysis] = useState<string | null>(null);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', color: '#fff', background: '#0b0b0b', minHeight: '100vh' }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Golf Swing Analyzer</h1>

      <p style={{ color: '#bbb', marginTop: 8 }}>
        Upload a short video (3-20s). The app will extract ~10 frames, send them to the AI, and show a detailed
        swing analysis.
      </p>

      <VideoAnalyzer onResult={(text) => setAnalysis(text)} />

      {analysis && (
        <section style={{ marginTop: 18, padding: 12, background: '#111', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>Analysis</h3>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#eaeaea', fontSize: 14 }}>{analysis}</pre>
        </section>
      )}
    </main>
  );
}
