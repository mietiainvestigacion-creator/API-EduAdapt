import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/server/db/types";
import type { ClassInfo, Interest, Lesson, Pace, ProgressEntry, StudentProfile } from "@/shared/types/domain";

type Admin = SupabaseClient<Database>;

export function mapLesson(
  row: Database["public"]["Tables"]["lessons"]["Row"],
  enabled = true,
): Lesson {
  return {
    id: row.id,
    title: row.title,
    objective: row.objective,
    competency: row.competency,
    difficulty: row.difficulty as 1 | 2 | 3,
    enabled,
    sortOrder: row.sort_order,
    preTestQuestion: row.pre_test_question,
    preTestAnswer: row.pre_test_answer,
    postTestQuestion: row.post_test_question,
    postTestAnswer: row.post_test_answer,
  };
}

export function mapProgress(row: Database["public"]["Tables"]["progress"]["Row"]): ProgressEntry {
  return {
    lessonId: row.lesson_id,
    stage: row.stage as ProgressEntry["stage"],
    startedAt: row.started_at,
    completedAt: row.completed_at,
    preTestScore: row.pre_test_score,
    postTestScore: row.post_test_score,
    messagesCount: row.messages_count,
    reflection: row.reflection,
    autonomyLevel: row.autonomy_level,
    motivation: row.motivation,
    difficultyAdjustment: row.difficulty_adjustment,
  };
}

export function mapStudent(row: Database["public"]["Tables"]["class_students"]["Row"]): StudentProfile {
  const code = row.student_code || row.display_name;
  return {
    id: row.id,
    classId: row.class_id,
    code,
    name: code,
    interest: row.interest as Interest | null,
    pace: row.pace as Pace | null,
    tutorProfile: row.tutor_profile,
    createdAt: row.created_at,
  };
}

export function mapClass(row: Database["public"]["Tables"]["classes"]["Row"]): ClassInfo {
  return {
    id: row.id,
    name: row.name,
    joinCode: row.join_code,
    active: row.active,
    createdAt: row.created_at,
  };
}

export async function listTeacherClasses(admin: Admin, teacherId: string) {
  const { data, error } = await admin
    .from("classes")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapClass);
}

export async function ensureClassLessons(admin: Admin, classId: string) {
  const { data: lessons, error } = await admin.from("lessons").select("id, sort_order");
  if (error) throw new Error(error.message);
  if (!lessons?.length) return;

  const rows = lessons.map((l) => ({
    class_id: classId,
    lesson_id: l.id,
    enabled: true,
    sort_order: l.sort_order,
  }));
  const { error: upsertError } = await admin.from("class_lessons").upsert(rows, {
    onConflict: "class_id,lesson_id",
    ignoreDuplicates: true,
  });
  if (upsertError) throw new Error(upsertError.message);
}

export async function getClassLessons(admin: Admin, classId: string): Promise<Lesson[]> {
  await ensureClassLessons(admin, classId);
  const { data: lessons, error } = await admin
    .from("lessons")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const { data: overrides } = await admin
    .from("class_lessons")
    .select("*")
    .eq("class_id", classId);

  const enabledMap = new Map((overrides ?? []).map((o) => [o.lesson_id, o.enabled]));
  return (lessons ?? []).map((l) => mapLesson(l, enabledMap.get(l.id) ?? true));
}

export async function getEnabledClassLessons(admin: Admin, classId: string): Promise<Lesson[]> {
  const all = await getClassLessons(admin, classId);
  return all.filter((l) => l.enabled);
}

export async function findClassByJoinCode(admin: Admin, joinCode: string) {
  const code = joinCode.trim().toUpperCase();
  const { data, error } = await admin
    .from("classes")
    .select("*")
    .eq("join_code", code)
    .eq("active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapClass(data) : null;
}

export async function listClassStudents(admin: Admin, classId: string) {
  const { data, error } = await admin
    .from("class_students")
    .select("*")
    .eq("class_id", classId)
    .eq("active", true)
    .order("student_code", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapStudent);
}

export async function getStudentProgressMap(admin: Admin, studentId: string) {
  const { data, error } = await admin.from("progress").select("*").eq("student_id", studentId);
  if (error) throw new Error(error.message);
  const map: Record<string, ProgressEntry> = {};
  for (const row of data ?? []) {
    map[row.lesson_id] = mapProgress(row);
  }
  return map;
}

export async function getClassProgress(
  admin: Admin,
  classId: string,
): Promise<Record<string, Record<string, ProgressEntry>>> {
  const students = await listClassStudents(admin, classId);
  const out: Record<string, Record<string, ProgressEntry>> = {};
  for (const s of students) {
    out[s.id] = await getStudentProgressMap(admin, s.id);
  }
  return out;
}
