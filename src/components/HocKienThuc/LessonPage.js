// SP02 · P2 — Trang bài: các phần học.
// Hướng C (#044, UXC-Q6): trang bài mở vào DANH SÁCH LƯỢT (mỗi lượt = một nhánh cây, ~5 phút),
// bài đọc (Tổng quan cũ) nằm ngay dưới cùng trang (#bai-doc) — Google vẫn đọc được.
// /knowledge/:branch/:topic/:lesson            → Lượt học + Bài đọc (mặc định)
// /knowledge/:branch/:topic/:lesson/tree       → Sơ đồ ý (Cây bản chất thông tin cũ)
// /knowledge/:branch/:topic/:lesson/quiz       → 3 Làm bài (SP01, route riêng)
// /knowledge/:branch/:topic/:lesson/summary    → Khác: Tóm tắt nhanh
// /knowledge/:branch/:topic/:lesson/glossary   → Khác: Từ khoá song ngữ
// /knowledge/:branch/:topic/:lesson/results    → Khác: Kết quả của tôi (P4, đọc tiến độ SP01 M5)
// /knowledge/:branch/:topic/:lesson/check      → Kiểm tra dữ liệu bài (N3, cho người soạn — LessonCheck.js)
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BookOpen, GitBranch, ListChecks, ListOrdered, Languages, Newspaper, BarChart3, Volume2, Square, ChevronDown, Check, ArrowRight } from "lucide-react";
import { loadLesson, loadTopic, lessonPath, readProgress, clearProgress, lessonParts, partStats, currentPart, knownCount } from "./knowledgeData";
import Results from "./Results";
import { loadArticlesIndex, isPublished, articlePath } from "./articleData";
import { useLang, LangToggle, Bi } from "./Bilingual";
import { playText, stopAudio } from "./audioPlayer";
import "./KnowledgeLesson.css"; // token màu, chữ, nút dùng chung
import "./KnowledgePages.css";

// Các phần của bài (#044): bỏ nút "Khác", mọi phần hiện thẳng; tên gọi dễ hiểu (P6).
const MAIN = [
  { key: "", label: "Lượt học", icon: ListChecks },
  { key: "tree", label: "Sơ đồ ý", icon: GitBranch },
  { key: "summary", label: "Tóm tắt", icon: ListOrdered },
  { key: "glossary", label: "Từ khoá", icon: Languages },
  { key: "articles", label: "Bài viết", icon: Newspaper }, // SP03 (Y2)
  { key: "results", label: "Kết quả của tôi", icon: BarChart3 }, // P4
];

export default function LessonPage() {
  const { branch, topic, lesson, section = "" } = useParams();
  const [data, setData] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [error, setError] = useState(false);
  const [lang, setLang] = useLang();

  useEffect(() => {
    setData(null);
    setError(false);
    loadLesson(branch, topic, lesson).then(setData).catch(() => setError(true));
    loadTopic(branch, topic).then(setTopicData).catch(() => {});
    return () => stopAudio();
  }, [branch, topic, lesson]);

  useEffect(() => {
    if (window.location.hash === "#bai-doc" && data) {
      const el = document.getElementById("bai-doc");
      if (el) el.scrollIntoView();
    } else window.scrollTo(0, 0); // chuyển phần → về đầu trang
  }, [section, lesson, data]);

  const to = (key) => lessonPath(branch, topic, lesson, key);
  const known = MAIN.map((m) => m.key);

  if (error)
    return (
      <main className="hkt-page">
        <div className="hkt-wrap">
          <h1>Không tìm thấy bài học này</h1>
          <p>
            <Link to={`/knowledge/${branch}/${topic}`}>Về chủ đề</Link>
          </p>
        </div>
      </main>
    );
  if (!data)
    return (
      <main className="hkt-page">
        <div className="hkt-wrap">
          <p className="hkt-message-inline">Đang tải…</p>
        </div>
      </main>
    );

  const lessonNo = (lesson.match(/\d+/) || [""])[0];

  return (
    <main className="hkt-page">
      <Helmet>
        <title>{`${data.title.vi} — ${topicData?.title?.vi || ""}`}</title>
        <meta name="description" content={data.overview?.[0]?.paragraphs?.[0]?.vi || data.title.vi} />
      </Helmet>
      <div className="hkt-wrap">
        <nav className="hkt-crumbs" aria-label="Vị trí">
          <Link to="/knowledge">Học kiến thức</Link>
          <span aria-hidden="true">›</span>
          <Link to={`/knowledge/${branch}/${topic}`}>{topicData?.title?.vi || topic}</Link>
          <span aria-hidden="true">›</span>
          <span>Bài {lessonNo}</span>
        </nav>
        <header className="hkt-topic-head">
          <div>
            <h1>
              {data.title.vi} <span className="hkt-level">{data.level}</span>
            </h1>
            <p className="hkt-topic-en" lang="en">{data.title.en}</p>
          </div>
          <LangToggle lang={lang} setLang={setLang} />
        </header>

        <div className="hkt-lesson-layout">
          <nav className="hkt-sections" aria-label="Các phần của bài">
            <ol>
              {MAIN.map(({ key, label, icon: Icon }) => (
                <li key={key || "home"}>
                  <NavLink end to={to(key)} className={({ isActive }) => `hkt-sec${isActive ? " is-active" : ""}`}>
                    <Icon size={18} aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ol>
          </nav>

          <section className="hkt-content" aria-live="polite">
            {!known.includes(section) && <p>Không có phần này trong bài.</p>}
            {section === "" && (
              <>
                <Parts data={data} branch={branch} topic={topic} lesson={lesson} quizPath={to("quiz")} to={to} />
                <h2 className="hkt-h2 hkt-read-title" id="bai-doc">
                  <BookOpen size={20} aria-hidden="true" /> Bài đọc
                </h2>
                <Overview data={data} lang={lang} />
              </>
            )}
            {section === "tree" && <Tree data={data} lang={lang} quizPath={to("quiz")} />}
            {section === "summary" && <Summary data={data} lang={lang} />}
            {section === "glossary" && <Glossary data={data} lang={lang} />}
            {section === "articles" && <RelatedArticles lessonKey={`${branch}/${topic}/${lesson}`} />}
            {section === "results" && (
              <MyResults data={data} branch={branch} topic={topic} lesson={lesson} quizPath={to("quiz")} />
            )}
            {["tree", "summary", "glossary", "articles"].includes(section) && (
              <div className="hkt-next">
                <Link className="hkt-btn hkt-btn--primary" to={to("")}>
                  Học theo lượt <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/** UC1–UC2 (#044) — Danh sách lượt: khung "lượt đang làm" với nút lớn, rồi các lượt (xong / đang làm / chưa làm). */
function Parts({ data, branch, topic, lesson, quizPath, to }) {
  const qs = data.questions || [];
  const parts = lessonParts(data);
  const prog = readProgress(branch, topic, lesson);
  const cur = currentPart(prog, parts, qs);
  const curSt = cur ? partStats(prog, cur, qs) : null;
  const known = knownCount(prog, parts, qs);
  const doneParts = parts.filter((pt) => partStats(prog, pt, qs).complete).length;
  return (
    <div className="hkt-parts">
      <p className="hkt-parts-meta">
        {parts.length} lượt · mỗi lượt khoảng 5 phút · {qs.length} câu
        {known > 0 && <> · <strong>bạn đã biết thêm {known} điều</strong></>}
      </p>
      {cur ? (
        <div className="hkt-part-now">
          <p className="hkt-eyebrow">
            Lượt {cur.no} / {parts.length}
          </p>
          <h2>{cur.title?.vi}</h2>
          <div className="hkt-progress-bar" aria-hidden="true">
            <span style={{ width: `${(curSt.done / curSt.total) * 100}%` }} />
          </div>
          <p className="hkt-muted">
            {curSt.done ? `Đã làm ${curSt.done}/${curSt.total} câu` : `${curSt.total} câu · chưa bắt đầu`}
          </p>
          <Link className="hkt-btn hkt-btn--primary hkt-btn--wide" to={`${quizPath}?part=${cur.no}`}>
            {curSt.done ? "Làm tiếp" : "Bắt đầu"} lượt {cur.no} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="hkt-part-now">
          <p className="hkt-eyebrow">Xong cả bài</p>
          <h2>Bạn đã làm hết {parts.length} lượt</h2>
          <Link className="hkt-btn hkt-btn--primary" to={to("results")}>
            Xem kết quả của tôi <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      )}
      <ol className="hkt-part-list" aria-label={`Các lượt (${doneParts}/${parts.length} đã xong)`}>
        {parts.map((pt) => {
          const st = partStats(prog, pt, qs);
          const state = st.complete ? "is-done" : cur && pt.no === cur.no ? "is-now" : "";
          return (
            <li key={pt.no}>
              <Link className={`hkt-part ${state}`} to={`${quizPath}?part=${pt.no}`}>
                <span className="hkt-part-no" aria-hidden="true">
                  {st.complete ? <Check size={16} /> : pt.no}
                </span>
                <span className="hkt-part-t">
                  Lượt {pt.no} · {pt.title?.vi}
                  <span className="hkt-muted">
                    {st.complete ? `${st.correct}/${st.total} đúng` : st.done ? `đang làm · ${st.done}/${st.total}` : `${st.total} câu`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="hkt-deep">
        <span className="hkt-eyebrow">Muốn đọc kỹ?</span>
        <a className="hkt-chip-link" href="#bai-doc">Bài đọc</a>
        <Link className="hkt-chip-link" to={to("tree")}>Sơ đồ ý</Link>
        <Link className="hkt-chip-link" to={to("glossary")}>Từ khoá</Link>
      </p>
    </div>
  );
}

function Overview({ data, lang }) {
  return (
    <article className="hkt-article">
      {(data.overview || []).map((sec, i) => (
        <section key={i}>
          <Bi value={sec.heading} lang={lang} as="h3" viFirst className="hkt-art-h" />
          {sec.paragraphs.map((p, j) => (
            <Bi key={j} value={p} lang={lang} viFirst className="hkt-art-p" />
          ))}
        </section>
      ))}
    </article>
  );
}

function Tree({ data, lang, quizPath }) {
  const roots = data.tree || [];
  const [open, setOpen] = useState(() => new Set([0]));
  const toggle = (i) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  const qNo = (id) => parseInt(id.replace(/\D/g, ""), 10);
  return (
    <div className="hkt-tree">
      <div className="hkt-tree-tools">
        <button type="button" className="hkt-link" onClick={() => setOpen(new Set(roots.map((_, i) => i)))}>
          Mở tất cả
        </button>
        <button type="button" className="hkt-link" onClick={() => setOpen(new Set())}>
          Gập tất cả
        </button>
      </div>
      <ul className="hkt-tree-root">
        {roots.map((node, i) => {
          const isOpen = open.has(i);
          return (
            <li key={i} className={isOpen ? "is-open" : ""}>
              <button type="button" className="hkt-tree-node" aria-expanded={isOpen} onClick={() => toggle(i)}>
                <ChevronDown size={18} className="hkt-tree-chev" aria-hidden="true" />
                <Bi value={node.title} lang={lang} as="span" />
              </button>
              {isOpen && (
                <ul className="hkt-tree-children">
                  {node.children.map((c, j) => (
                    <li key={j}>
                      <Bi value={c.title} lang={lang} as="span" className="hkt-tree-leaf" />
                      {c.note && <Bi value={c.note} lang={lang} className="hkt-tree-note" />}
                      {c.questions?.length > 0 && (
                        <p className="hkt-tree-qs">
                          Luyện câu:{" "}
                          {c.questions.map((q) => (
                            <Link key={q} to={`${quizPath}?q=${qNo(q)}`} className="hkt-chip">
                              {qNo(q)}
                            </Link>
                          ))}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Summary({ data, lang }) {
  return (
    <ol className="hkt-summary">
      {(data.summary || []).map((s, i) => (
        <li key={i}>
          <Bi value={s} lang={lang} viFirst />
        </li>
      ))}
    </ol>
  );
}

function Glossary({ data, lang }) {
  const [playing, setPlaying] = useState(null);
  const play = async (i, text) => {
    if (playing === i) {
      stopAudio();
      setPlaying(null);
      return;
    }
    if (playing !== null) return;
    setPlaying(i);
    await playText(text);
    setPlaying((p) => (p === i ? null : p));
  };
  return (
    <table className="hkt-glossary">
      <thead>
        <tr>
          {lang !== "vi" && <th scope="col">Tiếng Anh</th>}
          {lang !== "en" && <th scope="col">Tiếng Việt</th>}
          <th scope="col"><span className="hkt-sr">Nghe</span></th>
        </tr>
      </thead>
      <tbody>
        {(data.glossary || []).map((g, i) => (
          <tr key={i}>
            {lang !== "vi" && <td lang="en" className="hkt-gl-en">{g.en}</td>}
            {lang !== "en" && <td lang="vi">{g.vi}</td>}
            <td className="hkt-gl-act">
              <button
                type="button"
                className={`hkt-listen-mini${playing === i ? " is-playing" : ""}`}
                disabled={playing !== null && playing !== i}
                onClick={() => play(i, g.en)}
                aria-label={playing === i ? `Dừng ${g.en}` : `Nghe ${g.en}`}
              >
                {playing === i ? <Square size={14} /> : <Volume2 size={16} />}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RelatedArticles({ lessonKey }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    loadArticlesIndex()
      .then((idx) => {
        const out = [];
        idx.series.forEach((s) =>
          s.articles.forEach((a) => {
            if (a.lesson === lessonKey && isPublished(a)) out.push({ ...a, series: s.slug });
          })
        );
        setItems(out);
      })
      .catch(() => setItems([]));
  }, [lessonKey]);
  if (!items) return <p className="hkt-muted">Đang tải…</p>;
  if (!items.length) return <p className="hkt-muted">Chưa có bài viết cho bài học này.</p>;
  return (
    <ul className="hkt-related-list">
      {items.map((a) => (
        <li key={a.slug}>
          <Link to={articlePath(a.series, a.slug)}>{a.title}</Link>
          {a.description && <p className="hkt-muted">{a.description}</p>}
        </li>
      ))}
    </ul>
  );
}

/** P4 — Kết quả của tôi: đọc tiến độ đã lưu trên trình duyệt này. */
function MyResults({ data, branch, topic, lesson, quizPath }) {
  const navigate = useNavigate();
  const prog = readProgress(branch, topic, lesson);
  if (!prog || !prog.done)
    return (
      <div>
        <p>Bạn chưa làm bài này trên trình duyệt này.</p>
        <Link className="hkt-btn hkt-btn--primary" to={quizPath}>
          Bắt đầu lượt 1
        </Link>
      </div>
    );
  return (
    <div>
      <p className="hkt-muted">
        Kết quả được lưu trên trình duyệt này. Bắt đầu lúc {new Date(prog.startedAt).toLocaleString("vi-VN")}, cập nhật{" "}
        {new Date(prog.updatedAt).toLocaleString("vi-VN")}.
      </p>
      <Results
        questions={data.questions}
        progress={prog}
        quizPath={quizPath}
        onContinue={prog.current < prog.queue.length ? () => navigate(quizPath) : null} // đang làm dở (kể cả đang làm lại câu sai)
        onRetryWrong={() => navigate(`${quizPath}?retry=wrong`)}
        onRestart={() => {
          clearProgress(branch, topic, lesson);
          navigate(`${quizPath}?restart=1`);
        }}
      />
    </div>
  );
}
