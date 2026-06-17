import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const SYSTEM_INSTRUCTION = `
You are a culturally respectful RHD prevention health education assistant.
Give plain-English, guideline-based education about Acute Rheumatic Fever and Rheumatic Heart Disease prevention.
Do not diagnose. Do not prescribe medicine. Encourage clinic review for sore throat, skin sores, fever, joint pain, chest pain, or breathing difficulty.
`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!ai) {
    return res.status(500).json({
      error: "Gemini API key not found",
    });
  }

  const { question, history } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const contentsList: any[] = [];

    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contentsList.push({
          role: turn.role === "assistant" ? "model" : "user",
          parts: [{ text: turn.text }],
        });
      }
    }

    contentsList.push({
      role: "user",
      parts: [{ text: question }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contentsList,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      },
    });

    return res.status(200).json({
      text: response.text || "Sorry, I could not generate a response.",
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Gemini API error",
      details: err.message,
    });
  }
}
