import type { Clue } from "../types";

export interface VerifyResult {
  verified: boolean;
  confidence: number;
  reasoning: string;
  source: "ai" | "manual";
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
const GROQ_MODEL = (import.meta.env.VITE_GROQ_MODEL as string | undefined) ?? "qwen/qwen3.6-27b";

export const isAiVerificationEnabled = Boolean(GROQ_API_KEY);

export async function verifyPhoto(
  imageDataUrl: string,
  clue: Clue,
): Promise<VerifyResult> {
  if (!GROQ_API_KEY) {
    return {
      verified: true,
      confidence: 0,
      reasoning:
        "AI verification is not configured (no VITE_GROQ_API_KEY set), so this photo was accepted automatically. Add an API key in .env to enable real photo verification.",
      source: "manual",
    };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `A player is on a treasure hunt looking for this location: "${clue.locationName}".\n` +
                `Expected surroundings: ${clue.verificationDescription}\n\n` +
                `Look at the attached photo. Does it plausibly show this location, based on the description? ` +
                `Reply with strict JSON only, no other text: {"verified": boolean, "confidence": number between 0 and 1, "reasoning": "one short sentence"}`,
            },
            {
              type: "image_url",
              image_url: { url: imageDataUrl },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Verification request failed (${response.status}): ${body}`);
  }

  const json = await response.json();
  const text: string = json.choices?.[0]?.message?.content ?? "{}";

  // The model occasionally wraps its JSON in prose, or returns none at all. Treat an
  // unparseable reply as "couldn't verify" rather than throwing a raw SyntaxError at
  // the player.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  let parsed: { verified?: unknown; confidence?: unknown; reasoning?: unknown };
  try {
    if (start === -1 || end === -1) throw new Error("no JSON object in reply");
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return {
      verified: false,
      confidence: 0,
      reasoning: "Couldn't read the AI's response for this photo — please try scanning again.",
      source: "ai",
    };
  }

  return {
    verified: Boolean(parsed.verified),
    confidence: Number(parsed.confidence ?? 0),
    reasoning: String(parsed.reasoning ?? ""),
    source: "ai",
  };
}
