import { OpenAIClient } from "@azure/openai";
import { AzureKeyCredential } from "@azure/core-auth"; 

// ✅ Replace these with your Azure details
const AZURE_ENDPOINT = "https://customergenie.cognitiveservices.azure.com/"; // Your endpoint
const AZURE_API_KEY = "1N2E90FqpwR3jMVtRYT8NZbZVB7RgParyxLARYI0YtZKhxWa2thNJQQJ99BBACYeBjFXJ3w3AAAAACOGlW1p"; // Your API key
const DEPLOYMENT_NAME = "gpt-35-turbo"; // The name of your model deployment

const client = new OpenAIClient(AZURE_ENDPOINT, new AzureKeyCredential(AZURE_API_KEY));

export const generateMotivation = async (problemName, difficulty) => {
  const prompt = `
  You are Elle Woods from Legally Blonde, giving motivational advice.
  A user just solved a LeetCode problem called "${problemName}" at ${difficulty} difficulty.
  Generate a fun, sassy, and supportive motivational message like Elle Woods, 1-2 sentences only.
  Keep it high-energy, positive, and related to coding!`;

  try {
    console.log("🔹 Sending request to Azure AI...");
    const response = await client.getChatCompletions(DEPLOYMENT_NAME, [{ role: "user", content: prompt }]);

    console.log("✅ Azure AI response:", response.choices);
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ Error generating motivation:", error);
    return "Oops! Elle got distracted by her manicure. Try again! 💅";
  }
};
