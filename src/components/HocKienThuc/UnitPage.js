// SP08 · U3 — Trang một bài theo người nghe: /for/:audience/:slug/:part?
// part (#060): (trống) Bài viết · info Bảng thông tin · quiz Trắc nghiệm · listen-speak Nghe nói · true-or-false True or false
// B-Q11: lần đầu mở → Bài viết + nút "Bắt đầu luyện"; lần sau → phần đang dở.
// SP09 (#063, Đ5): trang học toàn màn hình — thanh trên tối (tên chủ đề, vòng "x/50 phần"), mục lục bên phải
// (10 bài × 5 phần, ✓ đã xong; điện thoại: kéo ra), thanh dưới "Phần trước · Phần tiếp" (UX-Q2: bỏ thanh 5 phần ngang).
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, Check, PanelRight, X } from "lucide-react";
import {
  loadUnit, loadUnitsIndex, PARTS, unitPath, readUnitProgress, writeUnitProgress, unitSummary,
  writeLastUnit, partDone, unitDoneCount,
} from "./unitData";
import { useBodyClass } from "./KtShell";
import { PART_ICONS, partMeta } from "./TopicCourse";
import {
  usePlayer, Modal, ExplainBody, ArticleView, QuestionTable, PickPart, SayPart, TrueFalsePart, UnitResults, RefButton,
} from "./UnitParts";
import "./KnowledgeLesson.css";
import "./KnowledgePages.css";
import "./UnitPage.css";
import "./kt.css";

const PRACTICE = ["quiz", "listen-speak", "true-or-false"];
// #067: hai phần luyện liên tục dùng khung cố định — trang không cuộn
const DRILL = ["quiz", "listen-speak", "true-or-false"]; // FX-Q1 (#068): thêm Trắc nghiệm

export default function UnitPage() {
  const { audience, slug, part = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [unit, setUnit] = useState(null);
  const [index, setIndex] = useState(null);
  const [error, setError] = useState(false);
  const [prog, setProg] = useState(() => readUnitProgress(audience, slug) || {});
  const [explainI, setExplainI] = useState(null);
  const [refOpen, setRefOpen] = useState(false);
  const player = usePlayer();
  const [sideOpen, setSideOpen] = useState(() => typeof window === "undefined" || window.innerWidth > 960);
  const [sideUnits, setSideUnits] = useState(() => new Set());
  const mainRef = useRef(null);
  useBodyClass("kt-shell");

  useEffect(() => {
    setUnit(null);
    setError(false);
    setProg(readUnitProgress(audience, slug) || {});
    loadUnit(audience, slug).then(setUnit).catch(() => setError(true));
    loadUnitsIndex().then(setIndex).catch(() => {});
  }, [audience, slug]);

  const partOk = PARTS.some((p) => p.key === part);

  // B-Q11: vào bài không ghi phần (không phải bấm thanh phần) → phần đang dở
  useEffect(() => {
    if (part || location.state?.tab) return;
    const p = readUnitProgress(audience, slug);
    if (p?.lastPart && PARTS.some((x) => x.key === p.lastPart)) navigate(unitPath(audience, slug, p.lastPart), { replace: true });
  }, [audience, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback(
    (patch) =>
      setProg((p) => {
        const n = { ...p, ...patch };
        writeUnitProgress(audience, slug, n);
        return n;
      }),
    [audience, slug]
  );

  // Nhớ phần đang luyện (chỉ 3 phần luyện) + bài đang học (nút "Học tiếp")
  useEffect(() => {
    if (PRACTICE.includes(part) && prog.lastPart !== part) update({ lastPart: part });
    writeLastUnit(audience, slug, part);
    player.stop();
    mainRef.current?.scrollTo(0, 0);
    if (window.innerWidth <= 960) setSideOpen(false);
  }, [part, audience, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const para = useMemo(() => {
    const m = {};
    unit?.article.body.forEach((s) => s.paragraphs.forEach((p) => (m[p.id] = p.text)));
    return m;
  }, [unit]);

  const place = useMemo(() => {
    if (!index || !unit) return null;
    const m = unit.meta;
    const b = index.branches.find((x) => x.slug === m.branch);
    const t = b?.topics.find((x) => x.slug === m.topic);
    const list = t?.units || [];
    const k = list.findIndex((u) => u.slug === m.slug && u.audience === m.audience);
    return { b, t, list, k };
  }, [index, unit]);
  useEffect(() => {
    if (place) setSideUnits((s) => new Set([...s, place.k]));
  }, [place]);

  const openRef = () => {
    setRefOpen(true);
    update({ refOpens: (prog.refOpens || 0) + 1 }); // C-1: chỉ để người học tự xem
  };
  const closeExplain = useCallback(() => setExplainI(null), []);
  const closeRef = useCallback(() => setRefOpen(false), []);

  if (error || (!partOk && unit))
    return (
      <div className="kt-learn hkt-page">
        <div className="kt-lcontent">
          <h1 className="kt-h1">Không tìm thấy bài này</h1>
          <p>
            <Link className="kt-btn" to="/knowledge">
              Xem tất cả chủ đề
            </Link>
          </p>
        </div>
      </div>
    );
  if (!unit)
    return (
      <div className="kt-learn hkt-page">
        <p className="kt-lcontent kt-muted">Đang tải…</p>
      </div>
    );

  const m = unit.meta;
  const qs = unit.questions;
  const summary = unitSummary(prog, qs.length);
  const refButton = <RefButton onOpen={openRef} count={prog.refOpens || 0} />;
  const common = { unit, prog, update, player, openExplain: setExplainI, refButton };
  // nút "Sang phần tiếp" khi xong một phần (thanh dưới bị ẩn trên điện thoại khi đang luyện — FX-Q3)
  const onNextPart = () => goStep(nextStep, true);
  const startPart = PRACTICE.includes(prog.lastPart) ? prog.lastPart : "quiz";

  // Mục lục cả chuỗi + thứ tự đi: bài 0 phần 1…5, bài 1 phần 1…5, …
  const list = place?.list || [{ audience, slug, title: m.title, kind: m.kind }];
  const k = place ? place.k : 0;
  const progOf = (u, i) => (i === k ? prog : readUnitProgress(u.audience, u.slug));
  const flat = list.flatMap((u, i) => PARTS.map((p) => ({ i, u, key: p.key })));
  const pos = flat.findIndex((x) => x.i === k && x.key === part);
  const prevStep = flat[pos - 1];
  const nextStep = flat[pos + 1];
  const doneAll = list.reduce((n, u, i) => n + unitDoneCount(progOf(u, i)), 0);
  const totalAll = list.length * PARTS.length;
  const C = 2 * Math.PI * 15;
  const markSeen = () => {
    if (part === "" || part === "info") update({ seen: { ...(prog.seen || {}), [part === "" ? "article" : "info"]: 1 } });
  };
  const goStep = (st, mark) => {
    if (!st) return;
    if (mark) markSeen();
    navigate(unitPath(st.u.audience, st.u.slug, st.key), { state: { tab: true } });
  };
  const partInfo = PARTS.find((p) => p.key === part);
  const drill = DRILL.includes(part);
  const PartIcon = PART_ICONS[part];
  const unitLabel = (u, i) => (u.kind === "tong" ? "Bài tổng" : `Bài ${i}`);
  const toggleUnit = (i) =>
    setSideUnits((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  return (
    <div className={`kt-learn hkt-page ${drill ? "is-drill" : ""}`}>
      <Helmet>
        <title>{`${m.title} — dành cho ${m.audienceTitle.toLowerCase()}`}</title>
        <meta name="description" content={m.description} />
        {/* U3-Q1 (#061): 40 câu + đáp án đúng + giải thích cho Google (dạng Câu hỏi thường gặp) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: qs.map((q) => ({
              "@type": "Question",
              name: q.q,
              acceptedAnswer: { "@type": "Answer", text: `${q.options[0]}. ${q.explain}` },
            })),
          })}
        </script>
      </Helmet>
      <header className="kt-ltop">
        <Link className="kt-back" to={`/knowledge/${m.branch}/${m.topic}`} aria-label="Về trang chủ đề">
          <ChevronLeft size={24} aria-hidden="true" />
        </Link>
        <Link className="ttl" to={`/knowledge/${m.branch}/${m.topic}`}>
          {place?.t?.title.vi || m.series}
        </Link>
        {drill && (
          <button type="button" className="kt-ltoc" onClick={() => setSideOpen((v) => !v)} aria-label={sideOpen ? "Ẩn mục lục" : "Hiện mục lục"} aria-pressed={sideOpen}>
            <PanelRight size={20} aria-hidden="true" />
          </button>
        )}
        <div className="kt-ring" title={`${doneAll}/${totalAll} phần đã xong`}>
          <svg width="38" height="38" viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#3a4560" strokeWidth="4" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#ffd23f" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(C * doneAll) / totalAll} ${C}`} transform="rotate(-90 18 18)" />
          </svg>
          <span>
            <b>
              {doneAll}/{totalAll}
            </b>{" "}
            phần đã xong
          </span>
        </div>
      </header>

      <div className={`kt-lwrap ${sideOpen ? "is-sideopen" : "is-noside"}`}>
        <div className={`kt-lmain ${drill ? "is-drill" : ""}`} ref={mainRef}>
          <div className="kt-lcontent">
            {drill ? (
              <h1 className="kt-dtitle">
                <span className="kt-kicker">
                  {PartIcon && <PartIcon size={16} aria-hidden="true" />}
                  {unitLabel(list[k] || m, k)} · {partInfo?.label}
                </span>
                <span className="t">{m.title}</span>
              </h1>
            ) : (
              <>
                <span className="kt-kicker">
                  {PartIcon && <PartIcon size={16} aria-hidden="true" />}
                  {unitLabel(list[k] || m, k)} · {partInfo?.label}
                  {part === "" && ` · ${list[k]?.readMin || 6} phút đọc`}
                </span>
                <h1 className="kt-h1">{m.title}</h1>
                <p className="kt-sub">Dành cho {m.audienceTitle.toLowerCase()} · bản nháp chờ duyệt</p>
              </>
            )}
            {part === "" && (
              <ArticleView
                unit={unit}
                para={para}
                started={summary?.started}
                onStart={() => {
                  markSeen();
                  navigate(unitPath(audience, slug, startPart), { state: { tab: true } });
                }}
                questionsLink={unitPath(audience, slug, "info")}
              />
            )}
            {part === "info" && (
              <>
                <p className="kt-muted">
                  Bảng thông tin (bảng câu hỏi) cũng là bảng tham khảo: 40 câu, mỗi câu 3 đáp án, <b>không đánh dấu đáp án đúng</b> — đọc bài viết để tự tìm.
                </p>
                <QuestionTable questions={qs} player={player} />
              </>
            )}
            {part === "quiz" && <PickPart {...common} onNextPart={nextStep ? onNextPart : null} />}
            {part === "listen-speak" && <SayPart {...common} onNextPart={nextStep ? onNextPart : null} />}
            {part === "true-or-false" && <TrueFalsePart {...common} results={<UnitResults s={summary} />} onNextPart={nextStep ? onNextPart : null} />}
            {summary?.started && !drill && part !== "" && (
              <details className="hkt-u-summary">
                <summary>Kết quả của bạn ở bài này</summary>
                <UnitResults s={summary} />
                {prog.refOpens > 0 && <p className="kt-muted">Đã mở Bảng thông tin {prog.refOpens} lần.</p>}
              </details>
            )}
          </div>
        </div>

        <aside className="kt-lside" aria-label="Nội dung chuỗi">
          <h3>
            Nội dung chuỗi
            <button type="button" onClick={() => setSideOpen(false)} aria-label="Đóng mục lục">
              <X size={20} aria-hidden="true" />
            </button>
          </h3>
          {list.map((u, i) => {
            const p = progOf(u, i);
            const open = sideUnits.has(i);
            return (
              <div key={u.audience + u.slug} className="kt-lunit">
                <button type="button" onClick={() => toggleUnit(i)} aria-expanded={open}>
                  <span className="tt">
                    {unitLabel(u, i)}. {u.title}
                    <small>{unitDoneCount(p)}/5 phần</small>
                  </span>
                </button>
                {open && (
                  <ol>
                    {PARTS.map((pt) => {
                      const d = partDone(p, pt.key);
                      const cur = i === k && pt.key === part;
                      return (
                        <li key={pt.key}>
                          <Link className={cur ? "is-cur" : ""} to={unitPath(u.audience, u.slug, pt.key)} state={{ tab: true }} aria-current={cur ? "step" : undefined}>
                            <span className={`kt-st ${d ? "is-done" : ""}`}>{d && <Check size={12} aria-hidden="true" />}</span>
                            {pt.label}
                            <span className="r">{partMeta(pt.key, u)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            );
          })}
        </aside>
      </div>

      <footer className={`kt-lbot ${drill ? "is-drill" : ""}`}>
        <button type="button" className="kt-nav" disabled={!prevStep} onClick={() => goStep(prevStep)}>
          ‹ Phần trước
        </button>
        <button type="button" className="kt-nav kt-nav--next" disabled={!nextStep} onClick={() => goStep(nextStep, true)}>
          Phần tiếp ›
        </button>
        <div className="kt-where">
          <span>{partInfo?.label}</span>
          <button type="button" onClick={() => setSideOpen((v) => !v)} aria-label={sideOpen ? "Ẩn mục lục" : "Hiện mục lục"} aria-pressed={sideOpen}>
            <PanelRight size={20} aria-hidden="true" />
          </button>
        </div>
      </footer>

      <Modal open={explainI !== null} onClose={closeExplain} title={explainI !== null ? `Câu ${explainI + 1} · Giải thích` : ""}>
        {explainI !== null && <ExplainBody q={qs[explainI]} i={explainI} para={para} player={player} />}
      </Modal>
      <Modal open={refOpen} onClose={closeRef} title="Bảng thông tin" wide>
        <QuestionTable questions={qs} player={player} idPrefix="rf" />
      </Modal>
    </div>
  );
}
