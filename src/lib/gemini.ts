import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

// Log masked key status on load for debugging
console.log(
  "[Gemini] API key status:",
  apiKey ? `loaded (${apiKey.substring(0, 10)}...)` : "MISSING"
);

/**
 * Helper: wait for `ms` milliseconds.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send user input to Gemini and get a structured response.
 * Falls back through multiple models and retries on rate-limit (429).
 */
export async function getGeminiResponse(
  input: string,
  context: string = "",
  preferredLanguage: string = ""
) {
  if (!apiKey || apiKey === "your_api_key_here") {
    console.error("[Gemini] API key is missing or not set in .env");
    return {
      language: "unknown",
      response:
        "API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file and restart the dev server.",
    };
  }

  try {
    const langHint = preferredLanguage
      ? `The user's preferred language is ${preferredLanguage}.`
      : "";

    const prompt = `
You are *Aarogya*, a warm, professional AI receptionist for a multi-specialty medical clinic called **ClinicOS**.
You assist patients, doctors, and staff in **English, Hindi (हिन्दी), and Marathi (मराठी)**.

${langHint}

**User said:** "${input}"
**Context:** ${context || "General inquiry"}

### Linguistic & Cultural Instructions
1. **Detect Language**: Identify if the user is speaking English, Hindi, or Marathi.
2. **Respond in Kind**: Match the user's language and style (including Hinglish/mixed-code).
3. **Hindi NLP**: 
   - Use the formal **"Aap" (आप)** instead of "Tum".
   - Use polite honorifics like **"Ji" (जी)** when appropriate (e.g., "Namaste Ji").
   - Use warm, respectful phrasing like "Main aapki kya sahayata kar sakti hoon?"
4. **Marathi NLP**:
   - Use the formal **"Aapan" (आपण)**.
   - Use polite verb endings and respectful address (e.g., "Namaskar, me tumchi kay madat karu shakte?").
   - Maintain a culturally appropriate, helpful tone.
5. **Speech Optimized**: 
   - Tone must be **warm and empathetic**.
   - Use short, clear sentences. 
   - Use commas for natural pausing in text-to-speech.
   - Avoid all markdown, bullet points, and special symbols (like * or #).
6. **Appointment Flow**: If booking, ask for: name, specialty/reason, and preferred time.
7. **Health Queries**: Be helpful but remind them to consult a professional for medical advice.
8. **Greetings**: If the user just says hello, respond with a warm welcome in their language.

### Response Format
Return ONLY a valid JSON object:
{
  "language": "english" | "hindi" | "marathi",
  "response": "your spoken response here",
  "action": null | {
    "type": "book_appointment" | "cancel_appointment" | "reschedule_appointment",
    "patient_name": "extracted patient name or null",
    "doctor_name": "extracted doctor name or null",
    "reason": "extracted reason or null",
    "time": "extracted time or null"
  }
}

**Action rules:**
- Set "action" ONLY when the user clearly wants to book/cancel/reschedule and has provided enough info (at least their intent).
- For booking: extract patient name, doctor, reason, and time if mentioned. Set type to "book_appointment".
- For cancellation: set type to "cancel_appointment".
- For rescheduling: set type to "reschedule_appointment".
- If the user is just chatting, greeting, or asking questions, set action to null.
- Always provide a conversational "response" regardless of whether action is set.
`;

    // Current Gemini models, ordered by cost/speed (cheapest first for free tier)
    const modelNames = [
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash",
      "gemini-2.5-flash",
    ];
    let lastError: any = null;

    for (const modelName of modelNames) {
      // Retry up to 2 times per model (for 429 rate-limit errors)
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          console.log(
            `[Gemini] Trying ${modelName} (attempt ${attempt + 1})...`
          );
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          // Attempt to parse JSON from the response
          try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              console.log(
                `[Gemini] Success with ${modelName}, language: ${parsed.language}`
              );
              return parsed;
            }
          } catch (e) {
            console.warn(
              `[Gemini] Failed to parse JSON from ${modelName}, using raw text`,
              e
            );
          }

          return {
            language: "unknown",
            response: text,
          };
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.httpStatusCode;
          console.warn(
            `[Gemini] ${modelName} attempt ${attempt + 1} failed:`,
            err.message,
            `(status: ${status})`
          );

          // If rate-limited (429), wait before retrying the same model
          if (status === 429 && attempt === 0) {
            console.log("[Gemini] Rate limited, waiting 3s before retry...");
            await delay(3000);
            continue;
          }

          // For other errors, move to the next model immediately
          break;
        }
      }
    }

    // All models failed
    console.error("[Gemini] All models failed. Last error:", lastError?.message);
    return {
      language: "english",
      response:
        "I'm sorry, I'm having a small connection issue right now. Please try again in a moment, or you can call our clinic directly for immediate assistance.",
    };
  } catch (error: any) {
    console.error("[Gemini] Unexpected error:", error);
    return {
      language: "error",
      response: `Sorry, something went wrong: ${error.message || "Unknown error"}. Please try again.`,
    };
  }
}
