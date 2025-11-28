import VideoAnalyzer from "../components/VideoAnalyzer";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      <h1>Golf Swing Analyzer</h1>

      <p>Upload your golf swing video to analyze it.</p>

      <VideoAnalyzer />
    </main>
  );
}
