import type { Clue } from "../types";

export interface VerifyResult {
  verified: boolean;
  confidence: number;
  reasoning: string;
  source: "ai" | "manual";
}

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
const MODEL = (import.meta.env.VITE_ANTHROPIC_MODEL as string | undefined) ?? "claude-opus-4-8";

export const isAiVerificationEnabled = Boolean(API_KEY);

function dataUrlToBase64(dataUrl: string): { mediaType: string; data: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.*)$/);
  if (!match) throw new Error("Unsupported image format for verification.");
  return { mediaType: match[1], data: match[2] };
}

export async function verifyPhoto(
  imageDataUrl: string,
  clue: Clue,
): Promise<VerifyResult> {
  if (!API_KEY) {
    return {
      verified: true,
      confidence: 0,
      reasoning:
        "AI verification is not configured (no VITE_ANTHROPIC_API_KEY set), so this photo was accepted automatically. Add an API key in .env to enable real photo verification.",
      source: "manual",
    };
  }

  const { mediaType, data } = dataUrlToBase64(imageDataUrl);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data },
            },
            {
              type: "text",
              text:
                `A player is on a treasure hunt looking for this location: "${clue.locationName}".\n` +
                `Expected surroundings: ${clue.verificationDescription}\n\n` +
                `Look at the attached photo. Does it plausibly show this location, based on the description? ` +
                `Reply with strict JSON only, no other text: {"verified": boolean, "confidence": number between 0 and 1, "reasoning": "one short sentence"}`,
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
  const text: string = json.content?.[0]?.text ?? "{}";
  const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));

  return {
    verified: Boolean(parsed.verified),
    confidence: Number(parsed.confidence ?? 0),
    reasoning: String(parsed.reasoning ?? ""),
    source: "ai",
  };
}
