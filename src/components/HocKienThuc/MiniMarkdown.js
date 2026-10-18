// Bộ hiển thị Markdown nhỏ (SP03, Y6): đủ cho bài viết, không cần cài thư viện.
// Hỗ trợ: ## / ### tiêu đề · đoạn văn · danh sách - và 1. · > trích dẫn · **đậm** · *nghiêng* · [liên kết](url)
// và khối ```phrases (mỗi dòng "tiếng Anh | tiếng Việt") → khung cụm từ có nút nghe.
// Tạo phần tử React, KHÔNG dùng innerHTML.
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, Square } from "lucide-react";
import { playText, stopAudio } from "./audioPlayer";

export const headingId = (text) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function inline(text, keyBase = "i") {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    const k = `${keyBase}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={k}>{p.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(p)) return <em key={k}>{p.slice(1, -1)}</em>;
    const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      return m[2].startsWith("/") ? (
        <Link key={k} to={m[2]}>{m[1]}</Link>
      ) : (
        <a key={k} href={m[2]} target="_blank" rel="noopener noreferrer">{m[1]}</a>
      );
    }
    return p;
  });
}

/** Tách Markdown thành các khối. */
export function parseBlocks(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++]);
      i++;
      blocks.push({ type: "fence", lang: fence[1], lines: body });
      continue;
    }
    const h = line.match(/^(#{2,3})\s+(.*)$/);
    if (h) { blocks.push({ type: `h${h[1].length}`, text: h[2] }); i++; continue; }
    if (/^>\s?/.test(line)) {
      const body = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) body.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push({ type: "quote", text: body.join(" ") });
      continue;
    }
    if (/^-\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^-\s+/.test(lines[i])) items.push(lines[i++].replace(/^-\s+/, ""));
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s+/, ""));
      blocks.push({ type: "ol", items });
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|```|>|-\s|\d+\.\s)/.test(lines[i])) para.push(lines[i++].trim());
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

function Phrases({ lines }) {
  const [playing, setPlaying] = useState(null);
  const rows = lines
    .map((l) => l.split("|").map((s) => s.trim()))
    .filter((r) => r[0]);
  const play = async (i, text) => {
    if (playing === i) { stopAudio(); setPlaying(null); return; }
    if (playing !== null) return;
    setPlaying(i);
    await playText(text);
    setPlaying((p) => (p === i ? null : p));
  };
  return (
    <ul className="hkt-phrases">
      {rows.map(([en, vi], i) => (
        <li key={i}>
          <button
            type="button"
            className={`hkt-listen-mini${playing === i ? " is-playing" : ""}`}
            disabled={playing !== null && playing !== i}
            onClick={() => play(i, en)}
            aria-label={playing === i ? `Dừng: ${en}` : `Nghe: ${en}`}
          >
            {playing === i ? <Square size={14} /> : <Volume2 size={16} />}
          </button>
          <span>
            <span className="hkt-phr-en" lang="en">{en}</span>
            {vi && <span className="hkt-phr-vi">{vi}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function MiniMarkdown({ blocks }) {
  return (
    <>
      {blocks.map((b, i) => {
        const k = `b${i}`;
        switch (b.type) {
          case "h2": return <h2 key={k} id={headingId(b.text)}>{inline(b.text, k)}</h2>;
          case "h3": return <h3 key={k}>{inline(b.text, k)}</h3>;
          case "quote": return <blockquote key={k}>{inline(b.text, k)}</blockquote>;
          case "ul": return <ul key={k}>{b.items.map((t, j) => <li key={j}>{inline(t, `${k}-${j}`)}</li>)}</ul>;
          case "ol": return <ol key={k}>{b.items.map((t, j) => <li key={j}>{inline(t, `${k}-${j}`)}</li>)}</ol>;
          case "fence":
            return b.lang === "phrases" ? <Phrases key={k} lines={b.lines} /> : <pre key={k}>{b.lines.join("\n")}</pre>;
          default: return <p key={k}>{inline(b.text, k)}</p>;
        }
      })}
    </>
  );
}
