import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { requireTeacher } from "@/server/auth/teacher";
import { getSupabaseAdmin } from "@/server/db/admin";
import { listClassStudents, mapStudent } from "@/server/db/queries";
import { errorJson, json } from "@/server/auth/cookies";
import { normalizeStudentCode } from "@/shared/lib/student-code";

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

export const Route = createFileRoute("/api/teacher/students")({
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
          const students = await listClassStudents(getSupabaseAdmin(), classId);
          return json({ students });
        } catch (err) {
          console.error(err);
          return errorJson("Error listando estudiantes", 500);
        }
      },
      POST: async ({ request }: { request: Request }) => {
        const teacher = await requireTeacher(request);
        if (!teacher) return errorJson("Unauthorized", 401);
        const body = (await request.json()) as {
          classId?: string;
          codes?: string[];
          code?: string;
          /** @deprecated */
          names?: string[];
          name?: string;
        };
        if (!body.classId) return errorJson("classId required", 400);
        if (!(await assertOwnsClass(teacher.userId, body.classId))) {
          return errorJson("Forbidden", 403);
        }

        const raw = body.codes?.length
          ? body.codes
          : body.code
            ? [body.code]
            : body.names?.length
              ? body.names
              : body.name
                ? [body.name]
                : [];

        const codes = [
          ...new Set(raw.map((c) => normalizeStudentCode(c)).filter(Boolean)),
        ];
        if (!codes.length) return errorJson("codes required", 400);

        try {
          const admin = getSupabaseAdmin();
          const rows = codes.map((student_code) => ({
            class_id: body.classId!,
            student_code,
            display_name: student_code,
            active: true,
          }));
          const { data, error } = await admin
            .from("class_students")
            .upsert(rows, { onConflict: "class_id,student_code" })
            .select("*");
          if (error) return errorJson(error.message, 500);
          return json({ students: (data ?? []).map(mapStudent) }, { status: 201 });
        } catch (err) {
          console.error(err);
          return errorJson("Error agregando estudiantes", 500);
        }
      },
      PATCH: async ({ request }: { request: Request }) => {
        const teacher = await requireTeacher(request);
        if (!teacher) return errorJson("Unauthorized", 401);
        const body = (await request.json()) as {
          classId?: string;
          studentId?: string;
          tutorProfile?: string | null;
        };
        if (!body.classId || !body.studentId) {
          return errorJson("classId and studentId required", 400);
        }
        if (!(await assertOwnsClass(teacher.userId, body.classId))) {
          return errorJson("Forbidden", 403);
        }
        try {
          const admin = getSupabaseAdmin();
          const { data, error } = await admin
            .from("class_students")
            .update({
              tutor_profile: body.tutorProfile?.trim() ? body.tutorProfile.trim() : null,
            })
            .eq("id", body.studentId)
            .eq("class_id", body.classId)
            .select("*")
            .single();
          if (error) return errorJson(error.message, 500);
          return json({ student: mapStudent(data) });
        } catch (err) {
          console.error(err);
          return errorJson("Error actualizando perfil", 500);
        }
      },
      DELETE: async ({ request }: { request: Request }) => {
        const teacher = await requireTeacher(request);
        if (!teacher) return errorJson("Unauthorized", 401);
        const url = new URL(request.url);
        const classId = url.searchParams.get("classId");
        const studentId = url.searchParams.get("studentId");
        if (!classId || !studentId) return errorJson("classId and studentId required", 400);
        if (!(await assertOwnsClass(teacher.userId, classId))) {
          return errorJson("Forbidden", 403);
        }
        const admin = getSupabaseAdmin();
        const { error } = await admin
          .from("class_students")
          .update({ active: false })
          .eq("id", studentId)
          .eq("class_id", classId);
        if (error) return errorJson(error.message, 500);
        return json({ ok: true });
      },
    },
  },
});
