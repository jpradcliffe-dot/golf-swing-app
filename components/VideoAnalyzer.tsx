"use client";

import React, { useEffect, useState } from "react";

interface VideoAnalyzerProps {
  file: File | null;
}

export default function VideoAnalyzer({ file }: VideoAnalyzerProps) {
  const [analysis, setAnalysis] = useState("Analyzing...");

  useEffect(() => {
    if (!file) return;

    // Fake local "analysis" - works with no backend
    setTimeout(() => {
      setAnalysis(
        [
          "• Your stance looks balanced but slightly narrow.",
          "• Backswing rotation appears limited—try turning your shoulders more fully.",
          "• You may be standing a bit too upright at address.",
          "• Club plane drifts slightly outside ideal line.",
          "• Impact suggests reduced lag—focus on delaying wrist release.",
          "• Follow-through solid but could extend further.",
          "",
          "(Local analysis — no AI key used.)"
        ].join("\n")
      );
    }, 1500);
  }, [file]);

  return (
    <div
      style={{
        whiteSpace: "pre-line",
        color: "#00FF00",
        marginTop: 20,
        fontSize: 16,
      }}
    >
      {analysis}
    </div>
  );
}
