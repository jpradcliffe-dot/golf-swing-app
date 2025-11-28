"use client";

import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";

type Phase =
  | "Address"
  | "Takeaway"
  | "Top"
  | "Downswing"
  | "Impact"
  | "FollowThrough"
  | "Unknown";

type FrameResult = {
  time: number;
  keypoints: posedetection.Keypoint[] | null;
  shoulderAngle?: number;
  hipAngle?: number;
  handZ?: number;
  handY?: number;
  clubVel?: number;
  phase?: Phase;
};

export default function VideoAnalyzer({ file }: { file: File }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [frames, setFrames] = useState<FrameResult[]>([]);
  const [phases, setPhases] = useState<{ phase: Phase; time: number }[]>([]);
  const detectorRef = useRef<posedetection.PoseDetector | null>(null);

  // load model
  useEffect(() => {
    let mounted = true;
    async function loadModel() {
      setStatus("loading model...");
      await tf.ready();
      const detector = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      if (!mounted) return;
      detectorRef.current = detector;
      setStatus("model ready");
    }
    loadModel();
    return () => {
      mounted = false;
      if (detectorRef.current) detectorRef.current.dispose?.();
    };
  }, []);

  // When file changes, load into video element
  useEffect(() => {
    if (!file || !videoRef.current) return;
    const url = URL.createObjectURL(file);
    videoRef.current.src = url;
    videoRef.current.load();
    setFrames([]);
    setPhases([]);
    setStatus("video loaded");
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // utility: extract frames (timestamps evenly spaced)
  async function extractFrames(video: HTMLVideoElement, count = 16) {
    setStatus("seeking frames...");
    const results: FrameResult[] = [];
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext("2d")!;
    const duration = video.duration || 0;
    if (!duration || duration === Infinity) {
      throw new Error("Invalid video duration");
    }
    const times = [];
    // center frames around swing; pick from 10% to 90% of video
    const start = Math.max(0, duration * 0.05);
    const end = Math.max(start + 0.1, duration * 0.95);
    for (let i = 0; i < count; i++) times.push(start + ((end - start) * i) / (count - 1));
    // helper to seek
    for (const t of times) {
      await seekVideo(video, t);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageBitmap = await createImageBitmap(canvas);
      results.push({ time: t, keypoints: null });
      imageBitmap.close();
    }
    return { canvas, frames: results };
  }

  function seekVideo(video: HTMLVideoElement, time: number) {
    return new Promise<void>((resolve, reject) => {
      const handler = () => {
        video.removeEventListener("seeked", handler);
        setTimeout(() => resolve(), 30); // small wait to ensure frame painted
      };
      video.addEventListener("seeked", handler);
      video.currentTime = Math.min(video.duration - 0.01, Math.max(0, time));
      // fallback timeout
      setTimeout(() => {
        video.removeEventListener("seeked", handler);
        resolve();
      }, 2000);
    });
  }

  // compute angles & features helper
  function computeFeatures(keypoints: posedetection.Keypoint[] | null) {
    if (!keypoints) return {};
    const find = (name: string) => keypoints.find((k) => k.name === name || (k as any).part === name);
    const leftShoulder = find("left_shoulder") || find("leftShoulder");
    const rightShoulder = find("right_shoulder") || find("rightShoulder");
    const leftHip = find("left_hip") || find("leftHip");
    const rightHip = find("right_hip") || find("rightHip");
    const leftWrist = find("left_wrist") || find("leftWrist");
    const rightWrist = find("right_wrist") || find("rightWrist");

    const shoulderAngle = (() => {
      if (!leftShoulder || !rightShoulder) return undefined;
      const dx = (rightShoulder.x - leftShoulder.x);
      const dy = (rightShoulder.y - leftShoulder.y);
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    })();

    const hipAngle = (() => {
      if (!leftHip || !rightHip) return undefined;
      const dx = (rightHip.x - leftHip.x);
      const dy = (rightHip.y - leftHip.y);
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    })();

    // choose dominant hand as club-hand; prefer rightHand if exists
    const hand = rightWrist || leftWrist;
    const handY = hand?.y;
    const handZ = (hand as any)?.z ?? undefined;

    return { shoulderAngle, hipAngle, handY, handZ };
  }

  // run pose detection on extracted frames
  async function analyze() {
    if (!videoRef.current || !detectorRef.current) {
      setStatus("model or video not ready");
      return;
    }
    try {
      setStatus("extracting frames...");
      const { canvas, frames: frameObjs } = await extractFrames(videoRef.current, 16);
      const ctx = canvas.getContext("2d")!;
      const newFrames: FrameResult[] = [];
      setStatus("running pose detection...");
      for (const f of frameObjs) {
        await seekVideo(videoRef.current!, f.time);
        ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
        // convert canvas to tensor-compatible image
        const input = tf.browser.fromPixels(canvas);
        const poses = await detectorRef.current.estimatePoses(canvas);
        input.dispose();
        const kp = poses?.[0]?.keypoints ?? null;
        const feat = computeFeatures(kp);
        newFrames.push({ ...f, keypoints: kp, ...feat });
      }
      setFrames(newFrames);
      setStatus("detecting phases...");
      const detected = detectPhases(newFrames);
      setPhases(detected);
      setStatus("done");
    } catch (err: any) {
      console.error(err);
      setStatus("error: " + (err?.message || err));
    }
  }

  // phase detection heuristics
  function detectPhases(results: FrameResult[]) {
    if (results.length === 0) return [];
    // compute shoulder rotation delta (approx)
    const shoulders = results.map((r) => r.shoulderAngle ?? 0);
    const hips = results.map((r) => r.hipAngle ?? 0);
    const handYs = results.map((r) => r.handY ?? 0);

    // simple heuristic:
    // - Address: first frame
    // - Takeaway: first rising shoulder rotation magnitude
    // - Top: max abs shoulder rotation
    // - Downswing: after top, fast downward handY velocity
    // - Impact: point where handY minimal (closest to ball) after downswing
    // - FollowThrough: final frames

    const idxOfMaxShoulder = shoulders
      .map((v, i) => ({ v: Math.abs(v), i }))
      .sort((a, b) => b.v - a.v)[0].i;

    // compute handY velocity
    const velocities = new Array<number>(handYs.length).fill(0);
    for (let i = 1; i < handYs.length; i++) {
      velocities[i] = handYs[i] - handYs[i - 1]; // positive = downwards on screen (camera coords)
    }

    // find big negative velocity after top (fast upward or downward depending camera)
    // We assume impact is around the largest change in velocity after top
    const afterTopIdx = Math.max(idxOfMaxShoulder, 0);
    let idxOfImpact = afterTopIdx;
    let maxVel = -Infinity;
    for (let i = afterTopIdx; i < velocities.length; i++) {
      const mag = Math.abs(velocities[i]);
      if (mag > maxVel) {
        maxVel = mag;
        idxOfImpact = i;
      }
    }

    // Boundaries:
    const idxAddress = 0;
    let idxTakeaway = Math.max(1, Math.min(idxOfMaxShoulder - 1, results.length - 3));
    // ensure takeaway is before top
    if (idxTakeaway >= idxOfMaxShoulder) idxTakeaway = Math.max(0, idxOfMaxShoulder - 1);
    const idxTop = idxOfMaxShoulder;
    const idxDownswing = Math.max(idxTop + 1, idxOfImpact - 1);
    const idxFollow = Math.min(results.length - 1, idxOfImpact + 1);

    const phases: { phase: Phase; time: number }[] = [
      { phase: "Address", time: results[idxAddress].time },
      { phase: "Takeaway", time: results[idxTakeaway]?.time ?? results[0].time },
      { phase: "Top", time: results[idxTop]?.time ?? results[0].time },
      { phase: "Downswing", time: results[idxDownswing]?.time ?? results[idxTop]?.time ?? results[0].time },
      { phase: "Impact", time: results[idxOfImpact]?.time ?? results[idxTop]?.time ?? results[0].time },
      { phase: "FollowThrough", time: results[idxFollow]?.time ?? results[results.length - 1].time },
    ];

    // attach phase labels to frames
    const labelled = results.map((r, i) => {
      let phase: Phase = "Unknown";
      if (i <= idxTakeaway) phase = i === idxAddress ? "Address" : "Takeaway";
      else if (i === idxTop) phase = "Top";
      else if (i > idxTop && i < idxOfImpact) phase = "Downswing";
      else if (i === idxOfImpact) phase = "Impact";
      else if (i > idxOfImpact) phase = "FollowThrough";
      return { ...r, phase };
    });

    setFrames(labelled);
    return phases;
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <video
          ref={videoRef}
          controls
          style={{ width: "100%", maxHeight: 360, background: "#000" }}
        />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={() => analyze()}
          disabled={!file || !detectorRef.current || status === "loading model" || status.startsWith("error")}
          style={{
            padding: "12px 20px",
            background: "#0b84ff",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Analyze Swing
        </button>
        <div style={{ color: "#aaa" }}>{status}</div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h4>Detected phases</h4>
        <div style={{ color: "limegreen", fontFamily: "monospace" }}>
          {phases.map((p) => (
            <div key={p.phase + p.time}>
              • {p.phase} @ {p.time.toFixed(2)}s
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h4>Frame debug</h4>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
          {frames.map((f, i) => (
            <div key={i} style={{ minWidth: 140, border: "1px solid #333", padding: 8, borderRadius: 6 }}>
              <div style={{ fontSize: 12, color: "#ddd" }}>{f.time.toFixed(2)}s</div>
              <div style={{ fontSize: 13, color: f.phase === "Impact" ? "yellow" : "#9f9" }}>{f.phase}</div>
              <div style={{ fontSize: 12, color: "#bbb" }}>
                shoulder: {f.shoulderAngle?.toFixed(1) ?? "-"}
                <br />
                hip: {f.hipAngle?.toFixed(1) ?? "-"}
                <br />
                handY: {f.handY?.toFixed(1) ?? "-"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
