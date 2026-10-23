// SP09 (#063) — Vỏ ứng dụng cho các trang học kiến thức (tham khảo F8, research/2026-10-16-ux-ui-tham-khao-f8.md).
//   Máy tính: thanh trên (logo, ô tìm kiếm, nút Học tiếp) + thanh trái 5 mục.
//   Điện thoại: thanh trên gọn + thanh dưới 5 mục.
// Khi vỏ đang hiện, thanh menu cũ của app (A1_Header) được ẩn (body.kt-shell).
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, LayoutGrid, PlayCircle, Users, BarChart3, Search, Check, Clapperboard } from "lucide-react";
import { loadUnitsIndex, readLastUnit, unitPath, audiencePath, topicColor, lowerFirst } from "./unitData";
import "./kt.css";
import TopicArt, { TOPIC_ART } from "./topicArt";
import { VongDetLoading } from "./VongDet";

export const NAV = [
  { key: "home", to: "/", label: "Trang chủ", Icon: Home },
  { key: "topics", to: "/knowledge", label: "Chủ đề", Icon: LayoutGrid },
  { key: "continue", to: null, label: "Học tiếp", Icon: PlayCircle },
  { key: "for", to: "/for", label: "Hoàn cảnh", Icon: Users },
  { key: "videos", to: "/videos", label: "Video", Icon: Clapperboard }, // #163
  { key: "me", to: "/me", label: "Của tôi", Icon: BarChart3 },
];

/** Đường dẫn của nút "Học tiếp": bài đang học gần nhất, chưa học thì trang Chủ đề. */
export function continuePath() {
  const l = readLastUnit();
  return l ? unitPath(l.audience, l.slug, l.part) : "/knowledge";
}

/** Thêm class cho body khi một trang dùng vỏ mới (ẩn thanh menu cũ). */
export function useBodyClass(cls) {
  useEffect(() => {
    document.body.classList.add(cls);
    return () => document.body.classList.remove(cls);
  }, [cls]);
}

function SearchBox() {
  const [idx, setIdx] = useState(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef(null);
  useEffect(() => {
    if (open && !idx) loadUnitsIndex().then(setIdx).catch(() => {});
  }, [open, idx]);
  useEffect(() => {
    const off = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, []);
  const results = useMemo(() => {
    const n = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
    const words = n(q).split(/\s+/).filter(Boolean);
    if (!idx || !words.length) return [];
    const hit = (s) => words.every((w) => n(s).includes(w));
    const out = [];
    idx.branches.forEach((b) =>
      b.topics.forEach((t) => {
        if (hit(t.title.vi + " " + t.title.en)) out.push({ kind: "Chủ đề", title: t.title.vi, to: `/knowledge/${b.slug}/${t.slug}` });
        t.units.forEach((u) => hit(u.title + " " + u.titleEn) && out.push({ kind: "Bài", title: u.title, to: unitPath(u.audience, u.slug) }));
      })
    );
    idx.audiences.forEach((a) => hit(a.title) && out.push({ kind: "Hoàn cảnh", title: a.title, to: audiencePath(a.slug) }));
    return out.slice(0, 8);
  }, [q, idx]);
  const go = (to) => {
    setOpen(false);
    setQ("");
    navigate(to);
  };
  return (
    <div className="kt-search" ref={boxRef}>
      <Search size={18} aria-hidden="true" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && results[0] && go(results[0].to)}
        placeholder="Tìm chủ đề, bài: phỏng vấn, thuê trọ, bán hàng online…"
        aria-label="Tìm chủ đề, bài"
      />
      {open && q.trim() && (
        <ul className="kt-search-res" role="listbox">
          {!idx && (
            <li className="kt-muted">
              <VongDetLoading size={18} />
            </li>
          )}
          {idx && !results.length && <li className="kt-muted">Không thấy kết quả cho “{q}”. Thử từ khác, ví dụ: phỏng vấn, du lịch.</li>}
          {results.map((r, i) => (
            <li key={i}>
              <button type="button" onClick={() => go(r.to)}>
                <small>{r.kind}</small>
                {r.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function KtShell({ active, children }) {
  useBodyClass("kt-shell");
  const cont = continuePath();
  const href = (n) => (n.key === "continue" ? cont : n.to);
  return (
    <div className="kt">
      <header className="kt-top">
        <Link className="kt-logo" to="/">
          <i aria-hidden="true">
            <Check size={20} strokeWidth={3} />
          </i>
          <span>Mỗi ngày biết thêm</span>
        </Link>
        <SearchBox />
        <Link className="kt-go" to={cont}>
          <b aria-hidden="true" />
          Học tiếp
        </Link>
      </header>
      <nav className="kt-rail" aria-label="Chính">
        {NAV.filter((n) => n.key !== "continue").map(({ key, label, Icon, ...n }) => (
          <Link key={key} to={href({ key, ...n })} className={active === key ? "is-on" : ""} aria-current={active === key ? "page" : undefined}>
            <Icon size={22} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      <main className="kt-page">{children}</main>
      <nav className="kt-tabbar" aria-label="Chính">
        {NAV.map(({ key, label, Icon, ...n }) => (
          <Link key={key} to={href({ key, ...n })} className={active === key ? "is-on" : ""} aria-current={active === key ? "page" : undefined}>
            <Icon size={22} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/** Ảnh bìa chủ đề: màu đậm + nhánh + tên to + "Dành cho …" (UX-Q4). */
export function TopicThumb({ idx, topic, branchTitle, small, className = "" }) {
  return (
    <div className={`kt-thumb ${small ? "is-small" : ""} ${className}`} style={{ background: topicColor(idx, topic.slug) }}>
      {branchTitle && <span className="kt-thumb-cat">{branchTitle}</span>}
      {TOPIC_ART[topic.slug] ? <TopicArt slug={topic.slug} /> : <span className="kt-thumb-q" aria-hidden="true">?</span>}
      <span className="kt-thumb-t">{topic.title?.vi || topic.title}</span>
      {!small && topic.audienceTitle && <span className="kt-thumb-who">Dành cho {lowerFirst(topic.audienceTitle)}</span>}
    </div>
  );
}
