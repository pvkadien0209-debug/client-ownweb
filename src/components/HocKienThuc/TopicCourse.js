// SP09 (#063, Đ4) — Trang chủ đề kiểu trang khoá học (tham khảo F8):
// tên to · mô tả · "Chuỗi này viết cho …" · "Bạn sẽ biết cách" (10 dòng ✓) · "Nội dung chuỗi" mở/gập 10 bài × 5 phần (✓ đã xong)
// · thẻ dính bên phải với nút Bắt đầu học / Học tiếp bài N · điện thoại: nút dính dưới.
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Check, ChevronDown, Layers, Clock, BookOpen, Mic, Users, Table2, MousePointerClick, ListChecks } from "lucide-react";
import KtShell, { TopicThumb } from "./KtShell";
import { loadUnitsIndex, unitPath, audiencePath, readUnitProgress, partDone, unitDoneCount, PARTS } from "./unitData";

export const PART_ICONS = { "": BookOpen, info: Table2, quiz: MousePointerClick, "listen-speak": Mic, "true-or-false": ListChecks };
export const partMeta = (key, u) => ({ "": `${u.readMin || 6} phút đọc`, info: "40 câu", quiz: "40 câu", "listen-speak": "40 câu", "true-or-false": "80 câu" }[key]);

/** Bài nên học tiếp trong chuỗi: bài đầu tiên chưa xong đủ 5 phần. */
export function nextUnit(units) {
  return units.find((u) => unitDoneCount(readUnitProgress(u.audience, u.slug)) < PARTS.length) || units[0];
}

export default function TopicCourse({ topic, persona, active = "topics" }) {
  const [idx, setIdx] = useState(null);
  const units = topic.units;
  const nu = nextUnit(units);
  const nuNo = units.indexOf(nu);
  const started = units.some((u) => readUnitProgress(u.audience, u.slug));
  const [open, setOpen] = useState(() => new Set([nuNo]));
  useEffect(() => {
    loadUnitsIndex().then(setIdx).catch(() => {});
  }, []);
  const minutes = units.reduce((n, u) => n + (u.readMin || 6) + 30, 0);
  const label = (k) => (units[k].kind === "tong" ? "Bài tổng" : `Bài ${k}`);
  const ctaText = started ? `Học tiếp ${label(nuNo).toLowerCase()}` : "Bắt đầu học";
  const cta = unitPath(nu.audience, nu.slug);
  const toggle = (k) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });

  return (
    <KtShell active={active}>
      <Helmet>
        <title>{`${topic.title.vi} — ${units.length} bài kiến thức, luyện nghe nói tiếng Anh`}</title>
        <meta name="description" content={topic.intro} />
      </Helmet>
      <div className="kt-course">
        <div>
          <TopicThumb idx={idx} topic={topic} branchTitle={topic.branchTitle.vi} className="kt-mthumb" />
          <nav className="kt-crumbs" aria-label="Vị trí">
            <Link to="/">Trang chủ</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/knowledge#${topic.branch}`}>{topic.branchTitle.vi}</Link>
          </nav>
          <h1>{topic.title.vi}</h1>
          <p className="kt-lead">{topic.intro}</p>
          <div className="kt-meta">
            <span>
              <Layers size={15} aria-hidden="true" />
              {units.length} bài
            </span>
            <span>
              <Clock size={15} aria-hidden="true" />
              khoảng {Math.round(minutes / 60)} giờ
            </span>
            <span>Trình độ {topic.level}</span>
          </div>
          <div className="kt-for">
            <Users size={22} aria-hidden="true" />
            <div>
              <b>
                Chuỗi này viết cho <Link to={audiencePath(topic.audience)}>{topic.audienceTitle.toLowerCase()}</Link>
              </b>
              {persona && <p>{persona}</p>}
            </div>
          </div>

          <h2 className="kt-sec">Bạn sẽ biết cách</h2>
          <ul className="kt-learnlist">
            {units.map((u) => (
              <li key={u.slug}>
                <Check size={20} aria-hidden="true" />
                <span>{u.title.replace(/\?$/, "")}</span>
              </li>
            ))}
          </ul>

          <h2 className="kt-sec">Nội dung chuỗi</h2>
          <div className="kt-syl-head">
            <span>
              <b>{units.length}</b> bài · <b>{units.length * 5}</b> phần luyện · <b>{units.length * 200}</b> câu trả lời
            </span>
            <button type="button" className="kt-link" onClick={() => setOpen(open.size === units.length ? new Set() : new Set(units.map((_, k) => k)))}>
              {open.size === units.length ? "Thu gọn tất cả" : "Mở rộng tất cả"}
            </button>
          </div>
          {units.map((u, k) => {
            const p = readUnitProgress(u.audience, u.slug);
            const n = unitDoneCount(p);
            const isOpen = open.has(k);
            return (
              <div key={u.slug} className={`kt-unit ${isOpen ? "is-open" : ""}`}>
                <button type="button" onClick={() => toggle(k)} aria-expanded={isOpen}>
                  <span className={`kt-n ${n === 5 ? "is-done" : ""}`}>{n === 5 ? <Check size={16} aria-hidden="true" /> : u.kind === "tong" ? "T" : k}</span>
                  <span className="tt">
                    {u.title}
                    <small>
                      {label(k)} · {n}/5 phần đã xong
                    </small>
                  </span>
                  <span className="cnt">5 phần</span>
                  <ChevronDown size={18} className="kt-chev" aria-hidden="true" />
                </button>
                {isOpen && (
                  <ol className="kt-parts">
                    {PARTS.map((pt) => {
                      const Icon = PART_ICONS[pt.key];
                      const d = partDone(p, pt.key);
                      return (
                        <li key={pt.key}>
                          <Link to={unitPath(u.audience, u.slug, pt.key)} state={{ tab: true }}>
                            <Icon size={18} aria-hidden="true" />
                            {pt.label}
                            <span className={`r ${d ? "is-done" : ""}`}>{d ? "Đã xong" : partMeta(pt.key, u)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            );
          })}
        </div>

        <aside className="kt-side">
          <div className="kt-side-box">
            <TopicThumb idx={idx} topic={topic} branchTitle={topic.branchTitle.vi} />
            <p className="kt-free">Miễn phí</p>
            <Link className="kt-btn kt-btn--pri kt-btn--big" to={cta}>
              {ctaText}
            </Link>
            <ul>
              <li>
                <Layers size={18} aria-hidden="true" />
                {units.length} bài, bài tổng mở đầu
              </li>
              <li>
                <BookOpen size={18} aria-hidden="true" />
                Mỗi bài: bài viết + 40 câu
              </li>
              <li>
                <Mic size={18} aria-hidden="true" />
                Luyện nghe nói tiếng Anh
              </li>
              <li>
                <Clock size={18} aria-hidden="true" />
                Học lúc nào cũng được, máy nhớ chỗ dừng
              </li>
            </ul>
          </div>
        </aside>
      </div>
      <div className="kt-mcta">
        <Link className="kt-btn kt-btn--pri kt-btn--big" to={cta}>
          {ctaText}
        </Link>
      </div>
    </KtShell>
  );
}
