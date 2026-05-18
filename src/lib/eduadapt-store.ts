// Centralized localStorage store for EduAdapt
// Keys are namespaced to avoid collisions.

export type Interest = "videojuegos" | "deportes" | "musica" | "arte" | "ciencia";
export type Pace = "rapido" | "medio" | "reflexivo";

export interface Lesson {
  id: string;
  title: string;
  objective: string;
  competency: string;
  difficulty: 1 | 2 | 3;
  enabled: boolean;
  preTestQuestion: string;
  preTestAnswer: string; // expected keyword
  postTestQuestion: string;
  postTestAnswer: string;
}

export interface StudentProfile {
  name: string;
  interest: Interest;
  pace: Pace;
  createdAt: number;
}

export interface ProgressEntry {
  lessonId: string;
  startedAt: number;
  completedAt?: number;
  preTestScore?: number;
  postTestScore?: number;
  messagesCount: number;
  reflection?: string;
  autonomyLevel: number; // 0-100
  motivation: number; // 0-100
  difficultyAdjustment: number; // -1 -> easier, 0 neutral, 1 harder
}

export interface InteractionLog {
  id: string;
  studentName: string;
  lessonId: string;
  timestamp: number;
  type: "message" | "hint" | "pre-test" | "post-test" | "reflection" | "complete";
  payload?: string;
}

const KEYS = {
  lessons: "eduadapt.lessons.v1",
  profile: "eduadapt.profile.v1",
  progress: "eduadapt.progress.v1",
  logs: "eduadapt.logs.v1",
  students: "eduadapt.students.v1",
};

export const DEFAULT_LESSONS: Lesson[] = [
  {
    id: "hw-01",
    title: "Hardware: CPU y memoria",
    objective: "Diferenciar componentes principales del computador y sus funciones.",
    competency: "Reconozco principios y conceptos propios de la tecnología.",
    difficulty: 1,
    enabled: true,
    preTestQuestion: "¿Cuál componente ejecuta las instrucciones en un computador?",
    preTestAnswer: "cpu",
    postTestQuestion: "¿Qué componente guarda la información de forma permanente?",
    postTestAnswer: "disco",
  },
  {
    id: "alg-01",
    title: "Pensamiento algorítmico",
    objective: "Construir secuencias lógicas para resolver problemas simples.",
    competency: "Resuelvo problemas tecnológicos mediante procesos algorítmicos.",
    difficulty: 2,
    enabled: true,
    preTestQuestion: "¿Qué es un algoritmo en tus palabras?",
    preTestAnswer: "pasos",
    postTestQuestion: "¿Qué estructura usarías para repetir una acción varias veces?",
    postTestAnswer: "ciclo",
  },
  {
    id: "net-01",
    title: "Redes e Internet",
    objective: "Comprender cómo viaja la información en internet.",
    competency: "Identifico el impacto de las redes en la sociedad.",
    difficulty: 2,
    enabled: true,
    preTestQuestion: "¿Qué necesita un dispositivo para conectarse a internet?",
    preTestAnswer: "red",
    postTestQuestion: "¿Qué función cumple un router en una red doméstica?",
    postTestAnswer: "dirige",
  },
  {
    id: "saf-01",
    title: "Seguridad digital",
    objective: "Aplicar buenas prácticas para proteger información personal.",
    competency: "Tomo decisiones éticas frente al uso de la tecnología.",
    difficulty: 1,
    enabled: false,
    preTestQuestion: "¿Qué hace fuerte a una contraseña?",
    preTestAnswer: "larga",
    postTestQuestion: "¿Qué deberías hacer ante un correo sospechoso?",
    postTestAnswer: "no",
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  // Lessons
  getLessons(): Lesson[] {
    const cur = read<Lesson[] | null>(KEYS.lessons, null);
    if (!cur) {
      write(KEYS.lessons, DEFAULT_LESSONS);
      return DEFAULT_LESSONS;
    }
    return cur;
  },
  saveLessons(lessons: Lesson[]) {
    write(KEYS.lessons, lessons);
  },

  // Profile (current student in this browser session)
  getProfile(): StudentProfile | null {
    return read<StudentProfile | null>(KEYS.profile, null);
  },
  setProfile(profile: StudentProfile | null) {
    if (profile === null) {
      if (typeof window !== "undefined") localStorage.removeItem(KEYS.profile);
    } else {
      write(KEYS.profile, profile);
    }
  },

  // Progress
  getProgress(studentName: string): Record<string, ProgressEntry> {
    const all = read<Record<string, Record<string, ProgressEntry>>>(KEYS.progress, {});
    return all[studentName] || {};
  },
  upsertProgress(studentName: string, entry: ProgressEntry) {
    const all = read<Record<string, Record<string, ProgressEntry>>>(KEYS.progress, {});
    all[studentName] = all[studentName] || {};
    all[studentName][entry.lessonId] = entry;
    write(KEYS.progress, all);
  },
  getAllProgress(): Record<string, Record<string, ProgressEntry>> {
    return read<Record<string, Record<string, ProgressEntry>>>(KEYS.progress, {});
  },

  // Logs
  log(entry: InteractionLog) {
    const all = read<InteractionLog[]>(KEYS.logs, []);
    all.unshift(entry);
    write(KEYS.logs, all.slice(0, 500));
  },
  getLogs(): InteractionLog[] {
    return read<InteractionLog[]>(KEYS.logs, []);
  },

  // Students registry
  registerStudent(profile: StudentProfile) {
    const all = read<StudentProfile[]>(KEYS.students, []);
    const filtered = all.filter((s) => s.name !== profile.name);
    filtered.push(profile);
    write(KEYS.students, filtered);
  },
  getStudents(): StudentProfile[] {
    return read<StudentProfile[]>(KEYS.students, []);
  },
  reset() {
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

// Adaptive engine
export function adaptiveDecision(progress: ProgressEntry): {
  next: "repeat" | "advance" | "challenge";
  reason: string;
} {
  const pre = progress.preTestScore ?? 0;
  const post = progress.postTestScore ?? 0;
  const delta = post - pre;
  if (post >= 80 && delta >= 20) {
    return { next: "challenge", reason: "Dominio sólido y crecimiento significativo." };
  }
  if (post >= 60) {
    return { next: "advance", reason: "Comprensión adecuada para avanzar." };
  }
  return { next: "repeat", reason: "Conviene reforzar el concepto con otra analogía." };
}
