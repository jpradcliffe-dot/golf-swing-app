export const metadata = {
  title: "Golf Swing Video Analyzer",
  description: "Upload a swing and analyze positions easily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: 20,
          fontFamily: "Arial, sans-serif",
          background: "#111",
          color: "white",
        }}
      >
        {children}
      </body>
    </html>
  );
}
