import { createFileRoute } from "@tanstack/react-router";
import { TeacherLogin } from "@/features/teacher/TeacherLogin";

export const Route = createFileRoute("/docente/login")({
  component: TeacherLogin,
});
