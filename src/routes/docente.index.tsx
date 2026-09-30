import { createFileRoute } from "@tanstack/react-router";
import { TeacherApp } from "@/features/teacher/TeacherApp";

export const Route = createFileRoute("/docente/")({
  component: TeacherApp,
});
