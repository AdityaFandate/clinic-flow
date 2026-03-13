import { GoogleGenerativeAI } from "@google/generative-ai";

// NOTE: In the browser app, the key comes from VITE_GEMINI_API_KEY in .env.
// This test script uses the key directly for quick CLI testing.
const apiKey = "AIzaSyCARNVztD2vzAnuxGh_zYCidOa-uBWUrrg";
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  console.log("=== Gemini API Test ===");
  console.log("Key:", apiKey.substring(0, 10) + "...\n");

  const models = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"];

  for (const modelName of models) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello in one sentence.");
      const text = result.response.text();
      console.log(`  ✅ SUCCESS: ${text.substring(0, 100)}\n`);
      // If one model works, that's enough to confirm the key is valid
      break;
    } catch (err) {
      console.log(`  ❌ FAILED: ${err.message}\n`);
    }
  }

  // Test Hindi
  try {
    console.log("Testing Hindi response...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent("नमस्ते, एक वाक्य में जवाब दो।");
    console.log(`  ✅ Hindi: ${result.response.text().substring(0, 100)}\n`);
  } catch (err) {
    console.log(`  ❌ Hindi test failed: ${err.message}\n`);
  }

  console.log("=== Test Complete ===");
}

run();
