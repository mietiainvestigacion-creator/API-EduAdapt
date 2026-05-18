import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, ShieldAlert, Loader2 } from "lucide-react";
import type { Lesson, StudentProfile } from "@/lib/eduadapt-store";
import { store } from "@/lib/eduadapt-store";

interface Props {
  profile: StudentProfile;
  lesson: Lesson;
  onComplete: (messagesCount: number) => void;
}

export function TutorChat({ profile, lesson, onComplete }: Props) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          studentName: profile.name,
          interest: profile.interest,
          lessonTitle: lesson.title,
          lessonObjective: lesson.objective,
          pace: profile.pace,
        },
      }),
    [profile.name, profile.interest, profile.pace, lesson.id, lesson.title, lesson.objective],
  );

  const initial: UIMessage[] = useMemo(
    () => [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: `¡Hola **${profile.name}**! Soy **EduAdapt**, tu tutor inteligente 👋\n\nHoy vamos a explorar **${lesson.title}**. Mi objetivo es acompañarte para que tú mismo construyas las ideas, no para darte las respuestas hechas.\n\nCuéntame: ¿qué sabes ya sobre este tema? Aunque sea muy poco, lo que pienses me sirve para arrancar.`,
          },
        ],
      },
    ],
    [profile.name, lesson.id, lesson.title],
  );

  const chatId = `${profile.name}-${lesson.id}`;

  const { messages, sendMessage, status, error } = useChat({
    id: chatId,
    messages: initial,
    transport,
  });

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (!isLoading) textareaRef.current?.focus();
  }, [isLoading, chatId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    store.log({
      id: crypto.randomUUID(),
      studentName: profile.name,
      lessonId: lesson.id,
      timestamp: Date.now(),
      type: "message",
      payload: text.slice(0, 200),
    });
    await sendMessage({ text });
  };

  const userTurns = messages.filter((m) => m.role === "user").length;

  return (
    <div className="flex h-[600px] flex-col rounded-2xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Tutor EduAdapt</div>
            <div className="text-xs text-muted-foreground">{lesson.title}</div>
          </div>
        </div>
        <button
          onClick={() => onComplete(userTurns)}
          disabled={userTurns < 2}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40"
        >
          Terminar lección
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {messages.map((m) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          if (m.role === "assistant") {
            return (
              <div key={m.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-hero text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 pt-1 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  <Markdown text={text} />
                </div>
              </div>
            );
          }
          return (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground whitespace-pre-wrap">
                {text}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-hero text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Pensando...
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <ShieldAlert className="h-4 w-4" />
            No pude conectarme con el tutor. Intenta de nuevo en un momento.
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex gap-2 border-t border-border p-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(e as unknown as React.FormEvent);
            }
          }}
          rows={1}
          placeholder="Escribe tu respuesta o duda..."
          className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-hero text-white shadow-glow transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  // Lightweight: bold + line breaks. Enough for tutor responses.
  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+?)`/g, '<code class="rounded bg-secondary px-1.5 py-0.5 text-xs">$1</code>');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
