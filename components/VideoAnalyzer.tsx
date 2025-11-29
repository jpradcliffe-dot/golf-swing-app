// components/VideoAnalyzer.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = { file?: File | null };

export default function VideoAnalyzer({ file }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<string>("Idle — select a video");
  const detectorRef = useRef<any>(null);

  // lazy-load TF/MoveNet only in the browser
  async function loadDetector() {
    if (detectorRef.current) return detectorRef.current;
    setStatus("Loading MoveNet model…");
    const tf = await import("@tensorflow/tfjs-backend-webgl");
    await tf.setBackend("webgl");
    await tf.ready();

    const posedetection = await import("@tensorflow-models/pose-detection");
    const model = posedetection.SupportedModels.MoveNet;

    // create detector with Lightning single-pose
    const detector = await posedetection.createDetector(model, {
      modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    });

    detectorRef.current = detector;
    setStatus("Model loaded.");
    return detector;
  }

  // utility to compute angle (degrees) between three points A-B-C (B is vertex)
  function angleBetweenPoints(A: { x: number; y: number }, B: { x: number; y: number }, C: { x: number; y: number }) {
    const ABx = A.x - B.x;
    const ABy = A.y - B.y;
    const CBx = C.x - B.x;
    const CBy = C.y - B.y;
    const dot = ABx * CBx + ABy * CBy;
    const magAB = Math.sqrt(ABx * ABx + ABy * ABy);
    const magCB = Math.sqrt(CBx * CBx + CBy * CBy);
    if (magAB * magCB === 0) return 0;
    let cos = dot / (magAB * magCB);
    cos = Math.max(-1, Math.min(1, cos));
    return (Math.acos(cos) * 180) / Math.PI;
  }

  // draw utils
  function drawOverlay(ctx: CanvasRenderingContext2D, keypoints: any[], canvasWidth: number, canvasHeight: number) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // simple styling
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#00ff00";
    ctx.fillStyle = "#00ff00";

    // draw keypoints
    keypoints.forEach((kp) => {
      if (!kp || kp.score == null || kp.score < 0.3) return;
      const x = kp.x * canvasWidth;
      const y = kp.y * canvasHeight;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // common skeleton pairs (MoveNet / COCO-ish)
    const pairs: [number, number][] = [
      [0, 1], // nose-eyes etc - depending on model indexing
      [1, 3], // right eye -> right ear etc (indexes vary slightly by model)
      [2, 4],
      [5, 7], // left shoulder -> left elbow
      [7, 9], // left elbow -> left wrist
      [6, 8], // right shoulder -> right elbow
      [8, 10], // ...
      [5, 6], // shoulders
      [11, 12], // hips
      [5, 11], // left shoulder -> left hip
      [6, 12], // right shoulder -> right hip
    ];

    // If MoveNet model uses different indexing just attempt only if points exist
    pairs.forEach(([a, b]) => {
      const A = keypoints[a];
      const B = keypoints[b];
      if (!A || !B || A.score == null || B.score == null || A.score < 0.25 || B.score < 0.25) return;
      ctx.beginPath();
      ctx.moveTo(A.x * canvasWidth, A.y * canvasHeight);
      ctx.lineTo(B.x * canvasWidth, B.y * canvasHeight);
      ctx.stroke();
    });

    // compute and draw shoulder line and hip line + angles
    const leftShoulder = keypoints[5]; // typical MoveNet mapping: 5 = left_shoulder
    const rightShoulder = keypoints[6];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];
    const leftWrist = keypoints[9];
    const rightWrist = keypoints[10];

    if (leftShoulder && rightShoulder && leftShoulder.score > 0.25 && rightShoulder.score > 0.25) {
      const sx1 = leftShoulder.x * canvasWidth;
      const sy1 = leftShoulder.y * canvasHeight;
      const sx2 = rightShoulder.x * canvasWidth;
      const sy2 = rightShoulder.y * canvasHeight;
      ctx.strokeStyle = "#00aaff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();
    }

    if (leftHip && rightHip && leftHip.score > 0.25 && rightHip.score > 0.25) {
      ctx.strokeStyle = "#ffaa00";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(leftHip.x * canvasWidth, leftHip.y * canvasHeight);
      ctx.lineTo(rightHip.x * canvasWidth, rightHip.y * canvasHeight);
      ctx.stroke();
    }

    // club plane: approximate from shoulder to wrist on dominant side
    // If right wrist is detected, draw shoulder->wrist as "club" indicator
    ctx.strokeStyle = "#ff0077";
    ctx.lineWidth = 2;
    if (rightWrist && rightShoulder && rightWrist.score > 0.25 && rightShoulder.score > 0.25) {
      ctx.beginPath();
      ctx.moveTo(rightShoulder.x * canvasWidth, rightShoulder.y * canvasHeight);
      ctx.lineTo(rightWrist.x * canvasWidth, rightWrist.y * canvasHeight);
      ctx.stroke();
    }
    if (leftWrist && leftShoulder && leftWrist.score > 0.25 && leftShoulder.score > 0.25) {
      ctx.beginPath();
      ctx.moveTo(leftShoulder.x * canvasWidth, leftShoulder.y * canvasHeight);
      ctx.lineTo(leftWrist.x * canvasWidth, leftWrist.y * canvasHeight);
      ctx.stroke();
    }

    // compute some simple angles and render text
    ctx.fillStyle = "#00ff00";
    ctx.font = "14px monospace";
    let lines: string[] = [];

    if (leftShoulder && rightShoulder && leftHip && rightHip && leftShoulder.score > 0.25 && rightShoulder.score > 0.25 && leftHip.score > 0.25 && rightHip.score > 0.25) {
      // shoulder turn (angle between shoulders and hips)
      const shoulderMid = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
      const hipMid = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
      // approximate facing vector vs camera vertical
      const turn = Math.abs((shoulderMid.x - hipMid.x) * 100); // simple proxy
      lines.push(`Turn proxy: ${turn.toFixed(1)}`);
    }

    // Example: compute elbow angle (left)
    if (keypoints[7] && keypoints[5] && keypoints[9]) {
      const elbow = angleBetweenPoints(keypoints[5], keypoints[7], keypoints[9]);
      lines.push(`L elbow: ${elbow.toFixed(0)}°`);
    }
    if (keypoints[6] && keypoints[8] && keypoints[10]) {
      const elbowR = angleBetweenPoints(keypoints[6], keypoints[8], keypoints[10]);
      lines.push(`R elbow: ${elbowR.toFixed(0)}°`);
    }

    // render lines at top-left
    ctx.fillStyle = "#00ff00";
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 8, 18 + i * 16);
    }
  }

  // main loop – runs pose detection on the playing video
  async function runLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const detector = await loadDetector();
    setStatus("Analyzing frames…");

    const detect = async () => {
      if (!video || video.paused || video.ended) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }
      try {
        // note: MoveNet expects image-like input
        const poses = await detector.estimatePoses(video);
        // MoveNet returns array with one pose object and keypoints[] containing {x,y,score}
        const pose = poses && poses.length ? poses[0] : null;

        const videoWidth = video.videoWidth || video.clientWidth;
        const videoHeight = video.videoHeight || video.clientHeight;
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        if (pose && pose.keypoints) {
          // keypoints are normalized (0..1) in latest TF models — if they're absolute, normalize below
          // determine if keypoints are normalized or absolute
          const normalized = pose.keypoints[0] && pose.keypoints[0].x <= 1;
          let keypointsNorm = pose.keypoints.map((kp: any) => {
            if (normalized) return { x: kp.x, y: kp.y, score: kp.score ?? 0 };
            return { x: kp.x / videoWidth, y: kp.y / videoHeight, score: kp.score ?? 0 };
          });

          drawOverlay(ctx, keypointsNorm, videoWidth, videoHeight);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (err) {
        console.error("detection error", err);
      }
      rafRef.current = requestAnimationFrame(detect);
    };

    // start loop
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(detect);
    }
  }

  // When a new file arrives, load it into the video element
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    setLoaded(false);
    if (!file) {
      setStatus("Idle — select a video");
      return;
    }
    setStatus("Loading video...");
    const url = URL.createObjectURL(file);
    v.src = url;
    v.onloadedmetadata = () => {
      setLoaded(true);
      setStatus("Video loaded. Click Play to analyze.");
      // auto-play muted to let loop run on mobile if user started it
      v.muted = true;
      // don't auto-play to avoid browser policies — user can press play, analysis will run
    };
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // When video plays, start detection
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => {
      runLoop().catch(console.error);
    };
    const onPause = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onPause);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 960 }}>
        <video
          ref={videoRef}
          controls
          style={{ width: "100%", height: "auto", display: "block", background: "#000" }}
          playsInline
        />
        {/* canvas positioned on top */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            pointerEvents: "none",
            width: "100%",
            height: "100%",
            mixBlendMode: "normal",
          }}
        />
      </div>

      <div style={{ color: "#00FF00", whiteSpace: "pre-line", fontFamily: "monospace" }}>{status}</div>

      <div>
        <button
          onClick={() => {
            const v = videoRef.current;
            if (!v) return;
            if (v.paused) v.play().catch(() => {});
            else v.pause();
          }}
          style={{
            padding: "10px 18px",
            background: "#1184ff",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Play / Pause
        </button>
      </div>
    </div>
  );
}
