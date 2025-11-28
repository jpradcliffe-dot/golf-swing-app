import OpenAI from "openai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { frames } = await req.json();

    if (!frames || frames.length === 0) {
      return new Response(JSON.stringify({ error: "No frames received" }), { status: 400 });
    }

    const msgs = [
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this golf swing step-by-step." },
          ...frames.map((f: string) => ({
            type: "input_image",
            image_url: f,
          }))
        ]
      }
    ];

    const completion = await openai.responses.create({
      model: "gpt-4.1",
      input: msgs
    });

    return new Response(
      JSON.stringify({ analysis: completion.output_text }),
      { status: 200 }
    );

  } catch (err: any) {
    console.error("API ERROR:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
