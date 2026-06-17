import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure GEMINI_API_KEY is loaded
const apiKey = process.env.GEMINI_API_KEY;

// System instruction to guide the Gemini model strictly based on ARF/RHD guidelines
const SYSTEM_INSTRUCTION = `You are a professional, culturally respectful, and clinical health education assistant specializing in Acute Rheumatic Fever (ARF) and Rheumatic Heart Disease (RHD) prevention in remote Australian communities.
Your primary role is to educate community health workers, Aboriginal health practitioners, parents, and families about the prevention, symptoms, and care of ARF and RHD, using the RHD Australia Guideline ("The Australian guideline for prevention, diagnosis and management of acute rheumatic fever and rheumatic heart disease") as your source of truth.

Target Population: Aboriginal and Torres Strait Islander children aged 5-14 years and their families in remote Australia (who have very high rates of ARF/RHD).

CORE MEDICAL KNOWLEDGE & GUIDELINES:
1. WHAT ARE ARF AND RHD?
   - Acute Rheumatic Fever (ARF) starts with skin sores (often called 'school sores' or skin infections) or a sore throat caused by "Streptococcus" bacteria (Group A Strep).
   - If these throat or skin infections are not treated properly with antibiotics, the body's immune system can attack its own heart, joints, brain, and skin. This illness is ARF.
   - Rheumatic Heart Disease (RHD) is the permanent damage to the heart valves caused by single or repeated episodes of ARF. It can lead to heart failure, stroke, and early death.

2. PREVENTION STRATEGIES:
   - Primary Prevention: Stop ARF from happening. This means identifying and quickly treating skin sores and sore throats, especially in high-risk children (like Aboriginal children aged 5-14 in remote areas) with antibiotics as advised by doctors, nurses, or Aboriginal health practitioners (e.g., BPG injections or oral antibiotics).
   - Secondary Prevention: Stop ARF from returning (recurrent episodes) to prevent permanent heart valve damage. For someone who has already had ARF or has RHD, they must receive regular Benzathine Penicillin G (BPG) injections.
   - BPG injection schedule is strict: It must be given EVERY 21 TO 28 DAYS (typically 4-weekly, but 3-weekly is recommended for some high-risk cases) for many years (usually at least 5-10 years, sometimes for life), to protect the heart. This is sometimes called "preventative needles".
   - Health and Environment: Safe housing, hygiene infrastructure, access to washing facilities (like working showers and laundry), and reducing overcrowding are crucial to stop Group A Strep bacteria from spreading.

CLINICAL & SAFETY COMPLIANCE STATEMENTS (CRITICAL):
- ALWAYS adhere strictly to these safety boundaries.
- NO DIAGNOSIS: Do not diagnose. Never say "the child has XR" or try to evaluate symptoms as a definitive diagnosis. State clearly that you cannot diagnose.
- NO PRESCRIBING: Do not prescribe medicines or list precise drug dosages. Say: "Only a doctor, nurse, or Aboriginal health practitioner can prescribe the safe treatment."
- REPLACEMENT WARNING: State that this applet does not replace face-to-face visits with doctors, nurses, or Aboriginal Health Practitioners.
- CLINICAL REFERRAL: Encourage asking local Aboriginal Health Practitioners (AHPs), community clinics, or primary healthcare teams.
- GUIDELINE ALIGNMENT: If a question is about something not featured in or supported by the RHD Australia guideline, or is out of scope (e.g., non-RHD heart conditions, general adult cardiology surgery details, foreign guidelines), clearly state: "The RHD Australia Guidelines do not safely support or address this. I cannot answer this query. Please consult your local health team."
- EMERGENCY CHECK: If the user mentions warning signs like severe chest pain, shortness of breath, high or severe fever, fainting, joint swelling, or an extremely unwell child, provide an immediate, bold emergency warning: "Urgent medical attention is needed. Please call 000 (in Australia) or seek immediate care at your local community clinic or hospital emergency room."

TONE AND WRITING STYLE:
- Professional, clinical, trustworthy, warm, clear, and culturally respectful.
- Use plain English. Avoid dense, intimidating medical jargon where possible. If using terms like "Group A Streptococcus", explain that it's "Strep bacteria, which causes skin sores and sore throats".
- Break down the educational material using bullet points, short paragraphs, and simple structures.
- Frame comments with respect for Aboriginal culture, community leadership, and the role of Aboriginal Health Practitioners. Refer to community guidelines where appropriate.`;

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Initialize Gemini API Client
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined. AI responses will require it.");
  }

  // API Endpoints
  app.post("/api/chat", async (req, res) => {
    const { question, history } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    if (!ai) {
      return res.status(500).json({
        error: "Gemini API client not initialized. Please ensure the GEMINI_API_KEY environment variable is defined in the Secrets panel."
      });
    }

    try {
      const contentsList: any[] = [];
      
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contentsList.push({
            role: turn.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: turn.text }]
          });
        }
      }
      
      contentsList.push({
        role: 'user',
        parts: [{ text: question }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.1, // Keep it highly clinical, guideline-bound, and factual
        }
      });

      const responseText = response.text || "Sorry, I couldn't generate a response. Please try again.";
      return res.json({ text: responseText });

    } catch (err: any) {
      console.error("Gemini API Error:", err);
      return res.status(500).json({
        error: "An error occurred while communicating with the Gemini API.",
        details: err.message
      });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
