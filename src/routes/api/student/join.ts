import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { getSupabaseAdmin } from "@/server/db/admin";
import { findClassByJoinCode, mapStudent } from "@/server/db/queries";
import { createStudentSession } from "@/server/auth/student";
import { errorJson, json } from "@/server/auth/cookies";
import { normalizeStudentCode } from "@/shared/lib/student-code";

type JoinBody = {
  joinCode?: string;
  studentCode?: string;
};

export const Route = createFileRoute("/api/student/join")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const joinCode = url.searchParams.get("joinCode") || "";
        if (!joinCode.trim()) return errorJson("joinCode required", 400);
        try {
          const admin = getSupabaseAdmin();
          const cls = await findClassByJoinCode(admin, joinCode);
          if (!cls) return errorJson("Clase no encontrada", 404);
          return json({
            class: cls,
            hint: "Ingresa tu código de estudiante (ej. 024). No uses tu nombre real.",
          });
        } catch (err) {
          console.error(err);
          return errorJson("Error al buscar la clase", 500);
        }
      },
      POST: async ({ request }: { request: Request }) => {
        const body = (await request.json()) as JoinBody;
        const joinCode = body.joinCode?.trim() || "";
        const studentCode = normalizeStudentCode(body.studentCode || "");
        if (!joinCode || !studentCode) {
          return errorJson("Código de clase y código de estudiante son requeridos", 400);
        }
        try {
          const admin = getSupabaseAdmin();
          const cls = await findClassByJoinCode(admin, joinCode);
          if (!cls) return errorJson("Clase no encontrada", 404);

          const { data: studentRow, error } = await admin
            .from("class_students")
            .select("*")
            .eq("class_id", cls.id)
            .eq("student_code", studentCode)
            .eq("active", true)
            .maybeSingle();

          if (error || !studentRow) {
            return errorJson("Código de estudiante no está en la lista de esta clase", 404);
          }

          const student = mapStudent(studentRow);
          const { setCookie } = await createStudentSession(student.id);
          return json({ student, class: cls }, { headers: { "Set-Cookie": setCookie } });
        } catch (err) {
          console.error(err);
          return errorJson("No se pudo iniciar sesión", 500);
        }
      },
    },
  },
});
