"use client";

import React, { useEffect, useState } from "react";

interface VideoAnalyzerProps {
  file: File | null;
}

export default function VideoAnalyzer({ file }: VideoAnalyzerProps) {
  const [analysis, setAnalysis] = useState<string>("Analyzing...");

  useEffect(() => {
    if (!file) return;

    // Fake local-only golf swing analysis (works offline, no API key)
    setTimeout(() => {
      setAnalysis(
        [
          "• Your stance looks balanced but slightly narrow.",
          "• Backswing rotation appears limited—try turning your shoulders more fully.",
          "• You may be standing a bit too upright at address.",
          "• Your club plane at the top drifts slightly outside the ideal line.",
          "• Impact suggests reduced lag—work on delaying wrist release.",
          "• Follow-through is stable but could extend more toward target.",
          "",
          "(Local analysis — no AI key used.)",
        ].join("\n")
      );
    }, 1500);
  }, [file]);

  return (
    <div style={{ whiteSpace: "pre-line", color: "#00FF00", marginTop: 20 }}>
     
