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
  lessons: "eduadapt.lessons.v2",
  profile: "eduadapt.profile.v1",
  progress: "eduadapt.progress.v1",
  logs: "eduadapt.logs.v1",
  students: "eduadapt.students.v1",
};

// Unidad: Sistemas operativos (según prompt maestro pedagógico)
export const DEFAULT_LESSONS: Lesson[] = [
  {
    id: "so-01",
    title: "¿Qué es un sistema operativo?",
    objective:
      "Construir una definición técnica de sistema operativo partiendo de experiencias cotidianas.",
    competency: "Reconozco principios y conceptos propios de la tecnología y la informática.",
    difficulty: 1,
    enabled: true,
    preTestQuestion: "En tus palabras, ¿qué crees que es un sistema operativo?",
    preTestAnswer: "programa",
    postTestQuestion:
      "¿Cómo le explicarías a un amigo qué es un sistema operativo y por qué el dispositivo lo necesita?",
    postTestAnswer: "coordina",
  },
  {
    id: "so-02",
    title: "¿Para qué sirve un sistema operativo?",
    objective:
      "Identificar las funciones que cumple el sistema operativo para que las aplicaciones funcionen.",
    competency: "Analizo el funcionamiento de artefactos y sistemas tecnológicos.",
    difficulty: 1,
    enabled: true,
    preTestQuestion: "¿Qué crees que pasaría si un computador no tuviera sistema operativo?",
    preTestAnswer: "programas",
    postTestQuestion:
      "Menciona dos funciones del sistema operativo y explica por qué son necesarias.",
    postTestAnswer: "gestiona",
  },
  {
    id: "so-03",
    title: "Partes de un sistema operativo",
    objective: "Reconocer los componentes del sistema operativo y la relación entre ellos.",
    competency: "Identifico componentes y relaciones dentro de un sistema tecnológico.",
    difficulty: 2,
    enabled: true,
    preTestQuestion: "¿Qué partes o componentes crees que tiene un sistema operativo por dentro?",
    preTestAnswer: "interfaz",
    postTestQuestion:
      "¿Qué diferencia hay entre la interfaz que ves y lo que el sistema hace por dentro?",
    postTestAnswer: "kernel",
  },
  {
    id: "so-04",
    title: "Windows",
    objective:
      "Comprender qué es Windows, sus características y su relación con el sistema operativo.",
    competency: "Comparo características de artefactos y sistemas tecnológicos.",
    difficulty: 2,
    enabled: true,
    preTestQuestion: "¿Qué es Windows y en qué dispositivos lo has visto?",
    preTestAnswer: "sistema",
    postTestQuestion: "Nombra dos características de Windows y explica para qué sirven.",
    postTestAnswer: "microsoft",
  },
  {
    id: "so-05",
    title: "Historia de Windows",
    objective: "Analizar la evolución de Windows como respuesta a necesidades tecnológicas.",
    competency: "Relaciono la evolución de la tecnología con el contexto y las necesidades.",
    difficulty: 2,
    enabled: true,
    preTestQuestion: "¿Por qué crees que las versiones de Windows han ido cambiando con el tiempo?",
    preTestAnswer: "cambios",
    postTestQuestion:
      "¿Qué cambio importante en la historia de Windows te parece más útil y por qué?",
    postTestAnswer: "interfaz",
  },
  {
    id: "so-06",
    title: "macOS y Apple",
    objective: "Diferenciar empresa (Apple), ecosistema y sistema operativo (macOS).",
    competency: "Distingo conceptos tecnológicos relacionados pero diferentes.",
    difficulty: 2,
    enabled: true,
    preTestQuestion: "¿Qué diferencia hay entre Apple y macOS?",
    preTestAnswer: "empresa",
    postTestQuestion: "Explica la relación entre Apple, su ecosistema y macOS.",
    postTestAnswer: "sistema",
  },
  {
    id: "so-07",
    title: "Historia de macOS/Apple",
    objective: "Analizar la evolución de macOS y Apple relacionándola con el contexto tecnológico.",
    competency: "Relaciono la evolución de la tecnología con el contexto y las necesidades.",
    difficulty: 2,
    enabled: true,
    preTestQuestion: "¿Qué sabes sobre cómo empezó Apple o macOS?",
    preTestAnswer: "apple",
    postTestQuestion:
      "¿Qué transformación en la historia de macOS/Apple consideras significativa y por qué?",
    postTestAnswer: "evolucion",
  },
  {
    id: "so-08",
    title: "Comparación entre Windows y macOS",
    objective:
      "Comparar Windows y macOS con criterios y evidencias, distinguiendo preferencia de argumento.",
    competency: "Tomo decisiones tecnológicas fundamentadas en criterios y evidencias.",
    difficulty: 3,
    enabled: true,
    preTestQuestion:
      "Si tuvieras que elegir entre Windows y macOS, ¿qué compararías antes de decidir?",
    preTestAnswer: "caracteristicas",
    postTestQuestion:
      "Elige un caso de uso y justifica con criterios qué sistema operativo sería más adecuado.",
    postTestAnswer: "porque",
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
