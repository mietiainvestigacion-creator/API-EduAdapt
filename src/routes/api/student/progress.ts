import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { requireStudentSession } from "@/server/auth/student";
import { getSupabaseAdmin } from "@/server/db/admin";
import { mapProgress } from "@/server/db/queries";
import { errorJson, json } from "@/server/auth/cookies";
import type { LessonStage } from "@/shared/types/domain";

type ProgressBody = {
  lessonId?: string;
  stage?: LessonStage;
  preTestScore?: number;
  postTestScore?: number;
  messagesCount?: number;
  reflection?: string;
  autonomyLevel?: number;
  motivation?: number;
  difficultyAdjustment?: number;
  completed?: boolean;
  logType?: "message" | "hint" | "pre-test" | "post-test" | "reflection" | "complete";
  logPayload?: string;
};

export const Route = createFileRoute("/api/student/progress")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const ctx = await requireStudentSession(request);
        if (!ctx) return errorJson("Unauthorized", 401);

        const body = (await request.json()) as ProgressBody;
        if (!body.lessonId) return errorJson("lessonId required", 400);

        try {
          const admin = getSupabaseAdmin();
          const now = new Date().toISOString();

          const { data: existing } = await admin
            .from("progress")
            .select("*")
            .eq("student_id", ctx.student.id)
            .eq("lesson_id", body.lessonId)
            .maybeSingle();

          const patch: Record<string, unknown> = {
            updated_at: now,
          };
          if (body.stage) patch.stage = body.stage;
          if (body.preTestScore !== undefined) patch.pre_test_score = body.preTestScore;
          if (body.postTestScore !== undefined) patch.post_test_score = body.postTestScore;
          if (body.messagesCount !== undefined) patch.messages_count = body.messagesCount;
          if (body.reflection !== undefined) patch.reflection = body.reflection;
          if (body.autonomyLevel !== undefined) patch.autonomy_level = body.autonomyLevel;
          if (body.motivation !== undefined) patch.motivation = body.motivation;
          if (body.difficultyAdjustment !== undefined) {
            patch.difficulty_adjustment = body.difficultyAdjustment;
          }
          if (body.completed) patch.completed_at = now;

          let row;
          if (existing) {
            const { data, error } = await admin
              .from("progress")
              .update(patch)
              .eq("id", existing.id)
              .select("*")
              .single();
            if (error) return errorJson(error.message, 500);
            row = data;
          } else {
            const { data, error } = await admin
              .from("progress")
              .insert({
                student_id: ctx.student.id,
                lesson_id: body.lessonId,
                stage: body.stage || "pre-test",
                started_at: now,
                ...patch,
              })
              .select("*")
              .single();
            if (error) return errorJson(error.message, 500);
            row = data;
          }

          if (body.logType) {
            await admin.from("interaction_logs").insert({
              student_id: ctx.student.id,
              lesson_id: body.lessonId,
              type: body.logType,
              payload: body.logPayload?.slice(0, 200) ?? null,
            });
          }

          return json({ progress: mapProgress(row) });
        } catch (err) {
          console.error(err);
          return errorJson("Progress error", 500);
        }
      },
    },
  },
});
