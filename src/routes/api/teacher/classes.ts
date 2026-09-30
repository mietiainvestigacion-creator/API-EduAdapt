import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { requireTeacher } from "@/server/auth/teacher";
import { getSupabaseAdmin } from "@/server/db/admin";
import {
  ensureClassLessons,
  listTeacherClasses,
  mapClass,
} from "@/server/db/queries";
import { errorJson, generateJoinCode, json } from "@/server/auth/cookies";

export const Route = createFileRoute("/api/teacher/classes")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const teacher = await requireTeacher(request);
        if (!teacher) return errorJson("Unauthorized", 401);
        try {
          const admin = getSupabaseAdmin();
          const classes = await listTeacherClasses(admin, teacher.userId);
          return json({ classes, teacher: { id: teacher.userId, fullName: teacher.fullName } });
        } catch (err) {
          console.error(err);
          return errorJson("Error listando clases", 500);
        }
      },
      POST: async ({ request }: { request: Request }) => {
        const teacher = await requireTeacher(request);
        if (!teacher) return errorJson("Unauthorized", 401);
        const body = (await request.json()) as { name?: string };
        if (!body.name?.trim()) return errorJson("name required", 400);

        try {
          const admin = getSupabaseAdmin();
          let joinCode = generateJoinCode();
          for (let i = 0; i < 5; i++) {
            const { data: clash } = await admin
              .from("classes")
              .select("id")
              .eq("join_code", joinCode)
              .maybeSingle();
            if (!clash) break;
            joinCode = generateJoinCode();
          }

          const { data, error } = await admin
            .from("classes")
            .insert({
              teacher_id: teacher.userId,
              name: body.name.trim(),
              join_code: joinCode,
            })
            .select("*")
            .single();
          if (error) return errorJson(error.message, 500);

          await ensureClassLessons(admin, data.id);
          return json({ class: mapClass(data) }, { status: 201 });
        } catch (err) {
          console.error(err);
          return errorJson("Error creando clase", 500);
        }
      },
    },
  },
});
