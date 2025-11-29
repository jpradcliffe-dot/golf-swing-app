import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANALYSIS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);

    // ----- 🔥 CALL YOUR REAL AI API HERE -----
    const apiResponse = await fetch("https://your-ai-endpoint.com/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "x-api-key": apiKey,
      },
      body: videoBuffer,
    });

    const result = await apiResponse.json();

    return NextResponse.json({ success: true, analysis: result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
};

module.exports = nextConfig;
