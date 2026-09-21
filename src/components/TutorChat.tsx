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
          const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          if (m.role === "assistant") {
            return (
              <div key={m.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-hero text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1 pt-1 text-sm leading-relaxed text-foreground">
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

// --- Lightweight, XSS-safe markdown renderer ---
// Supports: headings, bold, italic, inline code, links, ordered/unordered
// lists, blockquotes, horizontal rules and GitHub-style tables. Enough for
// the tutor's visual resources (comparaciones, diagramas en texto, tablas).

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineMd(raw: string): string {
  let s = escapeHtml(raw);
  // inline code first, protected from further formatting
  s = s.replace(
    /`([^`]+?)`/g,
    '<code class="rounded bg-secondary px-1.5 py-0.5 text-[0.8em]">$1</code>',
  );
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1<em>$2</em>");
  // links: only http(s), open in new tab
  s = s.replace(
    /\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2">$1</a>',
  );
  return s;
}

function renderCells(row: string): string[] {
  return row
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

function markdownToHtml(src: string): string {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  const flushList = (ordered: boolean, items: string[]) => {
    if (!items.length) return;
    const tag = ordered ? "ol" : "ul";
    const cls = ordered ? "my-2 list-decimal space-y-1 pl-5" : "my-2 list-disc space-y-1 pl-5";
    out.push(
      `<${tag} class="${cls}">${items.map((it) => `<li>${inlineMd(it)}</li>`).join("")}</${tag}>`,
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    // blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // horizontal rule
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      out.push('<hr class="my-3 border-border" />');
      i++;
      continue;
    }

    // heading
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const size = ["text-lg", "text-base", "text-sm", "text-sm"][level - 1];
      out.push(
        `<h${level} class="mt-3 mb-1 font-display font-semibold ${size}">${inlineMd(h[2])}</h${level}>`,
      );
      i++;
      continue;
    }

    // table: header row + separator row of dashes
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) &&
      lines[i + 1].includes("-")
    ) {
      const header = renderCells(line);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(renderCells(lines[i]));
        i++;
      }
      const thead = `<thead><tr>${header
        .map(
          (c) =>
            `<th class="border border-border bg-secondary/50 px-3 py-1.5 text-left font-semibold">${inlineMd(c)}</th>`,
        )
        .join("")}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map(
          (r) =>
            `<tr>${r
              .map(
                (c) => `<td class="border border-border px-3 py-1.5 align-top">${inlineMd(c)}</td>`,
              )
              .join("")}</tr>`,
        )
        .join("")}</tbody>`;
      out.push(
        `<div class="my-3 overflow-x-auto"><table class="w-full border-collapse text-xs">${thead}${tbody}</table></div>`,
      );
      continue;
    }

    // blockquote
    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push(
        `<blockquote class="my-2 border-l-2 border-primary/60 pl-3 text-muted-foreground">${inlineMd(quote.join(" "))}</blockquote>`,
      );
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      flushList(false, items);
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      flushList(true, items);
      continue;
    }

    // paragraph (merge consecutive non-empty, non-block lines)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*(#{1,4}\s|[-*]\s|\d+\.\s|>|---|\*\*\*|___)/.test(lines[i]) &&
      !(
        lines[i].includes("|") &&
        i + 1 < lines.length &&
        /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])
      )
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p class="my-1.5">${inlineMd(para.join(" "))}</p>`);
  }

  return out.join("");
}

function Markdown({ text }: { text: string }) {
  return <div dangerouslySetInnerHTML={{ __html: markdownToHtml(text) }} />;
}
