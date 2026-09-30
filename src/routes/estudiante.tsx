import { createFileRoute } from "@tanstack/react-router";
import { StudentApp } from "@/features/student/StudentApp";

export const Route = createFileRoute("/estudiante")({
  component: StudentApp,
});
