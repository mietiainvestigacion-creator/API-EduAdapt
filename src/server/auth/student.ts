import { getSupabaseAdmin } from "@/server/db/admin";
import {
  STUDENT_COOKIE,
  SESSION_TTL_SECONDS,
  parseCookies,
  randomToken,
  sha256Hex,
  studentCookieHeader,
  clearStudentCookieHeader,
} from "./cookies";
import { mapStudent } from "@/server/db/queries";
import type { StudentProfile } from "@/shared/types/domain";

export type StudentSessionContext = {
  sessionId: string;
  student: StudentProfile;
  classId: string;
  className: string;
  joinCode: string;
};

export async function createStudentSession(studentId: string): Promise<{
  token: string;
  setCookie: string;
}> {
  const admin = getSupabaseAdmin();
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  const { error } = await admin.from("student_sessions").insert({
    student_id: studentId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);

  return { token, setCookie: studentCookieHeader(token) };
}

export async function revokeStudentSession(request: Request): Promise<string> {
  const cookies = parseCookies(request);
  const token = cookies[STUDENT_COOKIE];
  if (token) {
    const admin = getSupabaseAdmin();
    const tokenHash = await sha256Hex(token);
    await admin.from("student_sessions").delete().eq("token_hash", tokenHash);
  }
  return clearStudentCookieHeader();
}

export async function requireStudentSession(
  request: Request,
): Promise<StudentSessionContext | null> {
  const cookies = parseCookies(request);
  const token = cookies[STUDENT_COOKIE];
  if (!token) return null;

  const admin = getSupabaseAdmin();
  const tokenHash = await sha256Hex(token);
  const { data: session, error } = await admin
    .from("student_sessions")
    .select("id, student_id, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await admin.from("student_sessions").delete().eq("id", session.id);
    return null;
  }

  const { data: student, error: studentError } = await admin
    .from("class_students")
    .select("*")
    .eq("id", session.student_id)
    .maybeSingle();

  if (studentError || !student || !student.active) return null;

  const { data: cls } = await admin
    .from("classes")
    .select("id, name, join_code, active")
    .eq("id", student.class_id)
    .maybeSingle();

  if (!cls || !cls.active) return null;

  return {
    sessionId: session.id,
    student: mapStudent(student),
    classId: cls.id,
    className: cls.name,
    joinCode: cls.join_code,
  };
}
