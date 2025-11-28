export const metadata = {
  title: "Golf Swing Analyzer",
  description: "Upload a golf swing video and analyze key positions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#111",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
