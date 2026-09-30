import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { requireStudentSession, revokeStudentSession } from "@/server/auth/student";
import { getSupabaseAdmin } from "@/server/db/admin";
import { getEnabledClassLessons, getStudentProgressMap } from "@/server/db/queries";
import { errorJson, json } from "@/server/auth/cookies";

export const Route = createFileRoute("/api/student/session")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const ctx = await requireStudentSession(request);
          if (!ctx) return errorJson("Unauthorized", 401);
          const admin = getSupabaseAdmin();
          const [lessons, progress] = await Promise.all([
            getEnabledClassLessons(admin, ctx.classId),
            getStudentProgressMap(admin, ctx.student.id),
          ]);
          return json({
            student: ctx.student,
            class: { id: ctx.classId, name: ctx.className, joinCode: ctx.joinCode },
            lessons,
            progress,
          });
        } catch (err) {
          console.error(err);
          return errorJson("Session error", 500);
        }
      },
      DELETE: async ({ request }: { request: Request }) => {
        try {
          const clear = await revokeStudentSession(request);
          return json({ ok: true }, { headers: { "Set-Cookie": clear } });
        } catch (err) {
          console.error(err);
          return errorJson("Logout error", 500);
        }
      },
    },
  },
});
