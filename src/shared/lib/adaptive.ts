import type { ProgressEntry } from "@/shared/types/domain";

export function adaptiveDecision(progress: Pick<ProgressEntry, "preTestScore" | "postTestScore">): {
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

export function scoreAnswer(expected: string, given: string): number {
  const g = given.toLowerCase().trim();
  if (!g) return 0;
  if (g.includes(expected.toLowerCase())) return 100;
  if (g.length > 8) return 50;
  return 20;
}

export function avg(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
