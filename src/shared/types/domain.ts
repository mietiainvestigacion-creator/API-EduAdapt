export type Interest = "videojuegos" | "deportes" | "musica" | "arte" | "ciencia";
export type Pace = "rapido" | "medio" | "reflexivo";

export type LessonStage =
  | "hub"
  | "pre-test"
  | "chat"
  | "post-test"
  | "reflection"
  | "summary";

export interface Lesson {
  id: string;
  title: string;
  objective: string;
  competency: string;
  difficulty: 1 | 2 | 3;
  enabled: boolean;
  sortOrder: number;
  preTestQuestion: string;
  preTestAnswer: string;
  postTestQuestion: string;
  postTestAnswer: string;
}

export interface StudentProfile {
  id: string;
  classId: string;
  /** Anonymous Explora-TIC code (e.g. 024). Shown as label, never a real name. */
  code: string;
  /** @deprecated alias of code for older UI bits */
  name: string;
  interest: Interest | null;
  pace: Pace | null;
  /** Teacher-authored paragraph injected into the tutor system prompt */
  tutorProfile: string | null;
  createdAt: string;
}

export interface ProgressEntry {
  lessonId: string;
  stage: LessonStage;
  startedAt: string;
  completedAt?: string | null;
  preTestScore?: number | null;
  postTestScore?: number | null;
  messagesCount: number;
  reflection?: string | null;
  autonomyLevel: number;
  motivation: number;
  difficultyAdjustment: number;
}

export interface InteractionLog {
  id: string;
  studentId: string;
  studentName: string;
  lessonId: string | null;
  type: "message" | "hint" | "pre-test" | "post-test" | "reflection" | "complete";
  payload?: string | null;
  createdAt: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  joinCode: string;
  active: boolean;
  createdAt: string;
}

export interface TeacherProfile {
  id: string;
  fullName: string;
  role: "teacher";
}
