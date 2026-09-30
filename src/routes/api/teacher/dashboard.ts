import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { requireTeacher } from "@/server/auth/teacher";
import { getSupabaseAdmin } from "@/server/db/admin";
import {
  getClassLessons,
  getClassProgress,
  listClassStudents,
} from "@/server/db/queries";
import { errorJson, json } from "@/server/auth/cookies";

async function assertOwnsClass(teacherId: string, classId: string) {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("classes")
    .select("id, name, join_code, active, created_at")
    .eq("id", classId)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  return data;
}

export const Route = createFileRoute("/api/teacher/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const teacher = await requireTeacher(request);
        if (!teacher) return errorJson("Unauthorized", 401);
        const classId = new URL(request.url).searchParams.get("classId");
        if (!classId) return errorJson("classId required", 400);

        try {
          const cls = await assertOwnsClass(teacher.userId, classId);
          if (!cls) return errorJson("Forbidden", 403);

          const admin = getSupabaseAdmin();
          const [students, lessons, progressByStudent] = await Promise.all([
            listClassStudents(admin, classId),
            getClassLessons(admin, classId),
            getClassProgress(admin, classId),
          ]);

          const studentIds = students.map((s) => s.id);
          const { data: logs } = studentIds.length
            ? await admin
                .from("interaction_logs")
                .select("id, student_id, lesson_id, type, payload, created_at")
                .in("student_id", studentIds)
                .order("created_at", { ascending: false })
                .limit(100)
            : { data: [] as const };

          const nameById = new Map(students.map((s) => [s.id, s.name]));

          return json({
            class: {
              id: cls.id,
              name: cls.name,
              joinCode: cls.join_code,
              active: cls.active,
              createdAt: cls.created_at,
            },
            students,
            lessons,
            progressByStudent,
            logs: (logs ?? []).map((l) => ({
              id: l.id,
              studentId: l.student_id,
              studentName: nameById.get(l.student_id) || "?",
              lessonId: l.lesson_id,
              type: l.type,
              payload: l.payload,
              createdAt: l.created_at,
            })),
          });
        } catch (err) {
          console.error(err);
          return errorJson("Dashboard error", 500);
        }
      },
    },
  },
});
