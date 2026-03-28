import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { AI_PERSONAS, type AIPersonaMode } from "@/lib/ai-personas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, dashboardPayload, mode, history } = body as {
      message: string;
      dashboardPayload: string;
      mode: AIPersonaMode | string;
      history?: { role: string; text: string }[];
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const safeMode: AIPersonaMode =
      mode in AI_PERSONAS ? (mode as AIPersonaMode) : "assistant";
    const systemInstruction = AI_PERSONAS[safeMode];

    const contents: { role: string; parts: { text: string }[] }[] = [];

    contents.push({
      role: "user",
      parts: [
        {
          text: `Here is my current dashboard data:\n${dashboardPayload}`,
        },
      ],
    });

    contents.push({
      role: "model",
      parts: [
        {
          text: "Understood. I have your dashboard data. How can I help?",
        },
      ],
    });

    if (history && history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const primaryModel = "gemini-2.5-flash";
    const fallbackModel = "gemini-3-flash-preview";

    const run = async (model: string) =>
      await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
        },
      });

    let response;
    try {
      response = await run(primaryModel);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("models/") && msg.includes("not found")) {
        response = await run(fallbackModel);
      } else {
        throw e;
      }
    }

    const text = response.text ?? "";

    return NextResponse.json({ text });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Gemini API error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
