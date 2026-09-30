/** XSS-safe markdown subset for tutor messages */

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

export function Markdown({ text }: { text: string }) {
  return <div dangerouslySetInnerHTML={{ __html: markdownToHtml(text) }} />;
}
