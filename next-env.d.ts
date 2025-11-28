"use client";

import React, { useState } from "react";

export default function VideoAnalyzer({ file }: { file: File }) {
  const [analysis, setAnalysis] = useState<string>("");

  const fakeLocalAnalysis = () => {
    setAnalysis(
      `• Your stance looks balanced but slightly narrow.
• Backswing rotation appears limited—try turning your shoulders more fully.
• You may be standing a bit too upright at address.
• Your club plane at the top drifts slightly outside the ideal line.
• Impact position suggests you may be losing lag early.
• Follow-through is stable but could extend further toward your target.

(This analysis is generated locally without any AI key.)`
    );
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button
        onClick={fakeLocalAnalysis}
        style={{
          padding: "12px 24px",
          background: "#0070f3",
          color: "white",
          borderRadius: 8,
        }}
      >
        Analyze Swing
      </button>

      {analysis && (
        <pre style={{ marginTop: 20, color: "lime", whiteSpace: "pre-wrap" }}>
          {analysis}
        </pre>
      )}
    </div>
  );
}
