"use client";
import React from "react";

export default function VideoAnalyzer({ frames }: { frames: string[] }) {
  // Fake local analysis (no backend, no AI)
  const analysis = `
• Your stance looks balanced but slightly narrow.
• Backswing rotation appears limited — try turning your shoulders more fully.
• You may be standing a bit too upright at address.
• Your club plane at the top drifts slightly outside the ideal line.
• Impact position suggests you might be losing lag early.
• Follow-through is stable but could extend further toward your target.
`;

  return (
    <pre
      style={{
        whiteSpace: "pre-wrap",
        background: "black",
        color: "lime",
        padding: "20px",
        borderRadius: "8px",
        marginTop: "20px",
        fontSize: "16px",
      }}
    >
      Golf Swing Analysis (Local Mode):

{analysis}

(This analysis is generated locally without any AI key.)
    </pre>
  );
}
