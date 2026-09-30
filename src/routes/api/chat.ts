import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { requireStudentSession } from "@/server/auth/student";
import { getSupabaseAdmin } from "@/server/db/admin";
import { createGoogleGenerativeAiProvider } from "@/server/ai/gateway";
import { buildSystemPrompt } from "@/server/ai/prompt";
import { rateLimit } from "@/server/ai/rate-limit";
import { errorJson } from "@/server/auth/cookies";

type ChatRequestBody = {
  messages?: unknown;
  lessonId?: string;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const ctx = await requireStudentSession(request);
        if (!ctx) return errorJson("Unauthorized", 401);

        if (!rateLimit(`chat:${ctx.student.id}`, 40, 60_000)) {
          return errorJson("Too many requests", 429);
        }

        const body = (await request.json()) as ChatRequestBody;
        const { messages, lessonId } = body;
        if (!Array.isArray(messages)) {
          return errorJson("Messages are required", 400);
        }
        if (!lessonId) return errorJson("lessonId required", 400);

        const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!key) {
          return errorJson("Missing GOOGLE_GENERATIVE_AI_API_KEY", 500);
        }

        try {
          const admin = getSupabaseAdmin();
          const { data: lesson, error } = await admin
            .from("lessons")
            .select("id, title, objective")
            .eq("id", lessonId)
            .maybeSingle();
          if (error || !lesson) return errorJson("Lesson not found", 404);

          const provider = createGoogleGenerativeAiProvider(key);
          const model = provider("gemini-3.6-flash");
          const result = streamText({
            model,
            system: buildSystemPrompt({
              studentCode: ctx.student.code,
              studentName: ctx.student.code,
              interest: ctx.student.interest,
              lessonTitle: lesson.title,
              lessonObjective: lesson.objective,
              pace: ctx.student.pace,
              tutorProfile: ctx.student.tutorProfile,
            }),
            messages: await convertToModelMessages(messages as UIMessage[]),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            onError: (err) => {
              console.error("chat stream error", err);
              return "No pude conectar con el tutor. Intenta de nuevo.";
            },
          });
        } catch (err) {
          console.error("chat error", err);
          return errorJson("AI error", 500);
        }
      },
    },
  },
});
