import { createUserSupabase, getSupabaseAdmin } from "@/server/db/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/server/db/types";

export type TeacherContext = {
  userId: string;
  supabase: SupabaseClient<Database>;
  fullName: string;
};

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

export async function requireTeacher(request: Request): Promise<TeacherContext | null> {
  const token = bearerToken(request);
  if (!token) return null;

  const supabase = createUserSupabase(token);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  const userId = data.user.id;
  const admin = getSupabaseAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    await admin.from("profiles").upsert({
      id: userId,
      full_name:
        (data.user.user_metadata?.full_name as string | undefined) ||
        data.user.email?.split("@")[0] ||
        "Docente",
      role: "teacher",
    });
  }

  return {
    userId,
    supabase,
    fullName: profile?.full_name || data.user.email || "Docente",
  };
}
