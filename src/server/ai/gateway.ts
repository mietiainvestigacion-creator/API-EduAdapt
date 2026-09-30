import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const createGoogleGenerativeAiProvider = (apiKey: string) =>
  createOpenAICompatible({
    name: "google",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey,
  });
