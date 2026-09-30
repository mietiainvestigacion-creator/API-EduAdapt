import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { requireTeacher } from "@/server/auth/teacher";
import { getSupabaseAdmin } from "@/server/db/admin";
import { getClassLessons } from "@/server/db/queries";
import { errorJson, json } from "@/server/auth/cookies";

async function assertOwnsClass(teacherId: string, classId: string) {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  return !!data;
}

export const Route = createFileRoute("/api/teacher/lessons")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const teacher = await requireTeacher(request);
        if (!teacher) return errorJson("Unauthorized", 401);
        const classId = new URL(request.url).searchParams.get("classId");
        if (!classId) return errorJson("classId required", 400);
        if (!(await assertOwnsClass(teacher.userId, classId))) {
          return errorJson("Forbidden", 403);
        }
        try {
          const lessons = await getClassLessons(getSupabaseAdmin(), classId);
          return json({ lessons });
        } catch (err) {
          console.error(err);
          return errorJson("Error listando lecciones", 500);
        }
      },
      PATCH: async ({ request }: { request: Request }) => {
        const teacher = await requireTeacher(request);
        if (!teacher) return errorJson("Unauthorized", 401);
        const body = (await request.json()) as {
          classId?: string;
          lessonId?: string;
          enabled?: boolean;
          title?: string;
          objective?: string;
          competency?: string;
          difficulty?: 1 | 2 | 3;
          preTestQuestion?: string;
          preTestAnswer?: string;
          postTestQuestion?: string;
          postTestAnswer?: string;
        };
        if (!body.classId || !body.lessonId) {
          return errorJson("classId and lessonId required", 400);
        }
        if (!(await assertOwnsClass(teacher.userId, body.classId))) {
          return errorJson("Forbidden", 403);
        }

        try {
          const admin = getSupabaseAdmin();

          if (typeof body.enabled === "boolean") {
            const { error } = await admin.from("class_lessons").upsert({
              class_id: body.classId,
              lesson_id: body.lessonId,
              enabled: body.enabled,
            });
            if (error) return errorJson(error.message, 500);
          }

          const lessonPatch: Record<string, unknown> = {};
          if (body.title !== undefined) lessonPatch.title = body.title;
          if (body.objective !== undefined) lessonPatch.objective = body.objective;
          if (body.competency !== undefined) lessonPatch.competency = body.competency;
          if (body.difficulty !== undefined) lessonPatch.difficulty = body.difficulty;
          if (body.preTestQuestion !== undefined) {
            lessonPatch.pre_test_question = body.preTestQuestion;
          }
          if (body.preTestAnswer !== undefined) lessonPatch.pre_test_answer = body.preTestAnswer;
          if (body.postTestQuestion !== undefined) {
            lessonPatch.post_test_question = body.postTestQuestion;
          }
          if (body.postTestAnswer !== undefined) lessonPatch.post_test_answer = body.postTestAnswer;

          if (Object.keys(lessonPatch).length) {
            const { error } = await admin
              .from("lessons")
              .update(lessonPatch)
              .eq("id", body.lessonId);
            if (error) return errorJson(error.message, 500);
          }

          const lessons = await getClassLessons(admin, body.classId);
          const lesson = lessons.find((l) => l.id === body.lessonId);
          return json({ lesson });
        } catch (err) {
          console.error(err);
          return errorJson("Error actualizando lección", 500);
        }
      },
    },
  },
});
