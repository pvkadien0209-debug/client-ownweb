// SP08 · U3 — Các phần của một bài theo người nghe (bài viết + 40 câu):
// 1 Bài viết · 2 Bảng thông tin · 3 Trắc nghiệm · 4 Nghe nói (luyện nói) · 5 True or false (80 câu, luyện phân biệt đúng – sai) — tên phần #060.
// Kế hoạch: DetPro/san-pham/sp08-bai-hoc-theo-nguoi-nghe.md §3–§4, §8.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, Square, Mic, Keyboard, Check, X, ClipboardList, ArrowRight, ArrowLeft, RotateCcw, Headphones, Send, Grid3x3, Shuffle, Languages } from "lucide-react";
import { KT_STORAGE } from "./config";
import useStoredState from "./useStoredState";
import useSpeechInput, { speechSupported } from "./useSpeechInput";
import { playText, stopAudio } from "./audioPlayer";
import { matchAnswer } from "./matcher";
import { shownOptions, shuffle, newQaRun, reshuffleQaRest, qaTotal, paraKind, frameOf, hasIllustrativeCharacters } from "./unitData";
import VongDet from "./VongDet";

const html = (s) => ({ __html: s });

// ---------- Phát âm: một khoá chung cho cả trang (không phát chồng) ----------
export function usePlayer() {
  const [playing, setPlaying] = useState(null);
  const ref = useRef(null);
  ref.current = playing;
  const play = useCallback(async (id, text) => {
    if (ref.current === id) {
      stopAudio();
      setPlaying(null);
      return;
    }
    stopAudio();
    setPlaying(id);
    await playText(text);
    setPlaying((p) => (p === id ? null : p));
  }, []);
  const stop = useCallback(() => {
    stopAudio();
    setPlaying(null);
  }, []);
  useEffect(() => () => stopAudio(), []);
  return { playing, play, stop };
}

export function Listen({ player, id, text, children, className = "", title }) {
  const on = player.playing === id;
  return (
    <button
      type="button"
      className={`hkt-listen ${className} ${on ? "is-playing" : ""}`}
      onClick={() => player.play(id, text)}
      aria-pressed={on}
      title={title}
    >
      {on ? <Square size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
      {children}
    </button>
  );
}

// ---------- Popup ----------
export function Modal({ open, onClose, title, children, wide }) {
  const boxRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    boxRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      if (prev && prev.focus) prev.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="hkt-u-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`hkt-u-sheet ${wide ? "is-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={boxRef}>
        <div className="hkt-u-sheet-head">
          <h3>{title}</h3>
          <button type="button" className="hkt-btn hkt-u-close" onClick={onClose}>
            <X size={16} aria-hidden="true" /> Đóng
          </button>
        </div>
        <div className="hkt-u-sheet-body">{children}</div>
      </div>
    </div>
  );
}

/**
 * #083: câu tiếng Việt trong phần luyện không hiện sẵn — bấm "Tiếng Việt" (hoặc phím V) mới hiện.
 * Mỗi câu mới lại ẩn (đặt key theo câu ở chỗ dùng). Bảng thông tin, Giải thích, mục Đáp án vẫn hiện đủ.
 */
export function ViHint({ text, className = "hkt-u-qvi" }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "v" && e.key !== "V") return;
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  if (!text) return null;
  return open ? (
    <p className={`${className} kt-vi is-open`}>
      {text}{" "}
      <button type="button" className="kt-vibtn is-on" onClick={() => setOpen(false)} aria-pressed="true" title="Ẩn tiếng Việt (V)">
        Ẩn
      </button>
    </p>
  ) : (
    <p className={`${className} kt-vi`}>
      <button type="button" className="kt-vibtn" onClick={() => setOpen(true)} aria-pressed="false" title="Hiện câu tiếng Việt (V)">
        <Languages size={14} aria-hidden="true" /> Tiếng Việt
      </button>
    </p>
  );
}

/** Popup giải thích dùng chung (§3): câu hỏi · đáp án đúng · Trích trong bài · Giải thích thêm. */
export function ExplainBody({ q, i, para, player }) {
  return (
    <div className="hkt-u-explain">
      <p className="hkt-u-qvi">{q.vi}</p>
      <p className="hkt-u-qen" lang="en">
        {q.q} <Listen player={player} id={`ex-q-${i}`} text={q.q} className="hkt-u-ico" title="Nghe câu hỏi" />
      </p>
      <p className="hkt-u-label">Đáp án đúng</p>
      <p className="hkt-u-right" lang="en">
        <Check size={18} aria-hidden="true" /> {q.options[0]}{" "}
        <Listen player={player} id={`ex-a-${i}`} text={q.options[0]} className="hkt-u-ico" title="Nghe đáp án" />
      </p>
      <p className="hkt-u-label">Trích trong bài</p>
      <blockquote className="hkt-u-quote" dangerouslySetInnerHTML={html(para[q.para] || "")} />
      <p className="hkt-u-label">Giải thích thêm</p>
      <p>{q.explain}</p>
    </div>
  );
}

// ---------- Khung minh hoạ (#065): mỗi loại một biểu tượng + màu; K4 giấu lời giải sau nút ----------
function FrameBox({ id, frame }) {
  const [open, setOpen] = useState(false);
  let body = frame.body;
  let answer = null;
  if (frame.code === "k4") {
    const i = body.indexOf("Lời giải:");
    if (i > 0) {
      answer = body.slice(i + "Lời giải:".length).trim();
      body = body.slice(0, i).trim();
    }
  }
  if (frame.code === "k7") body = body.replace(/\s*(Cách [AB]:)/g, (m, w) => `<br><b>${w}</b>`);
  if (frame.code === "k5") body = body.replace(/\s*(Trước:|Sau:)/g, (m, w) => `<br><b>${w}</b>`).replace(/^<br>/, "");
  return (
    <div id={id} className={`kt-frame kt-frame--${frame.code}`}>
      <span className="kt-frame-tag">
        <span aria-hidden="true">{frame.icon}</span> {frame.label}
      </span>
      <p dangerouslySetInnerHTML={html(body)} />
      {answer !== null &&
        (open ? (
          <p className="kt-frame-ans">
            <b>Lời giải:</b> <span dangerouslySetInnerHTML={html(answer)} />
          </p>
        ) : (
          <button type="button" className="kt-frame-reveal" onClick={() => setOpen(true)}>
            Nghĩ xong rồi? Xem lời giải
          </button>
        ))}
    </div>
  );
}

// ---------- 1. Bài viết ----------
export function ArticleView({ unit, para, onStart, started, prev, next, questionsLink }) {
  const a = unit.article;
  return (
    <article className="hkt-u-article">
      <p className="hkt-u-intro" dangerouslySetInnerHTML={html(a.intro)} />
      <p className="hkt-u-cta">
        <button type="button" className="hkt-btn hkt-btn--primary" onClick={onStart}>
          {started ? "Luyện tiếp" : "Bắt đầu luyện"} <ArrowRight size={18} aria-hidden="true" />
        </button>
        <span className="hkt-muted">40 câu hỏi bám theo bài này</span>
      </p>
      {a.body.map((s, k) => (
        <section key={k}>
          <h2>{s.heading}</h2>
          {s.paragraphs.map((p) => {
            const kind = paraKind(p.text);
            if (kind === "frame") return <FrameBox key={p.id} id={p.id} frame={frameOf(p.text)} />;
            const text = kind === "check" ? p.text.replace(/ ☐/g, "<br>☐") : p.text;
            return <p key={p.id} id={p.id} className={kind ? `is-${kind}` : undefined} dangerouslySetInnerHTML={html(text)} />;
          })}
        </section>
      ))}
      <section>
        <h2>Kết luận</h2>
        <p dangerouslySetInnerHTML={html(a.outro)} />
        {/* KC-Q7 (#112): bài có nhân vật minh hoạ → một dòng chữ nhỏ cuối bài viết */}
        {hasIllustrativeCharacters(unit) && <p className="hkt-u-illus">Nhân vật trong bài là minh hoạ.</p>}
      </section>
      {/* U3-Q1 (#061): mục Đáp án và giải thích chi tiết — 40 câu, mỗi câu gập/mở (B-Q13: cũng là "Câu hỏi thường gặp" cho Google) */}
      <section className="hkt-u-faq" id="dap-an">
        <h2>Đáp án và giải thích chi tiết</h2>
        <p className="hkt-muted">Luyện xong rồi hãy mở. Bấm vào từng câu để xem đáp án đúng, đoạn trích trong bài và giải thích thêm.</p>
        <ol>
          {unit.questions.map((q, i) => (
            <li key={i}>
              <details>
                <summary>
                  <span lang="en">{q.q}</span>
                  <span className="hkt-muted">{q.vi}</span>
                </summary>
                <div className="hkt-u-ans">
                  <p className="hkt-u-right" lang="en">
                    <Check size={18} aria-hidden="true" /> {q.options[0]}
                  </p>
                  <p className="hkt-u-label">Trích trong bài</p>
                  <blockquote className="hkt-u-quote" dangerouslySetInnerHTML={html(para[q.para] || "")} />
                  <p className="hkt-u-label">Giải thích thêm</p>
                  <p>{q.explain}</p>
                </div>
              </details>
            </li>
          ))}
        </ol>
        <p>
          <Link to={questionsLink}>Xem Bảng thông tin: 40 câu, mỗi câu 3 đáp án</Link>
        </p>
      </section>
      {(prev || next) && (
        <nav className="hkt-u-seq" aria-label="Bài trong chuỗi">
          {prev ? (
            <Link to={prev.to}>
              <ArrowLeft size={16} aria-hidden="true" /> <span>{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={next.to}>
              <span>{next.title}</span> <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}

// ---------- 2. Bảng thông tin (bảng câu hỏi, cũng là bảng tham khảo; không đánh dấu đáp án đúng — #053) ----------
// Máy tính: bảng 5 cột · điện thoại: mỗi hàng một thẻ, 3 đáp án xếp dọc (B-Q3) — chỉ khác CSS.
export function QuestionTable({ questions, player, mode = "ref", pick, onPick, idPrefix = "t" }) {
  return (
    <div className={`hkt-u-table is-${mode}`}>
      <table>
        <thead>
          <tr>
            <th scope="col">STT</th>
            <th scope="col">Câu hỏi</th>
            <th scope="col">Câu 1</th>
            <th scope="col">Câu 2</th>
            <th scope="col">Câu 3</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, i) => (
            <tr key={i} className={pick?.ok?.[i] ? "is-done" : undefined}>
              <td className="hkt-u-no">{i + 1}</td>
              <td className="hkt-u-q">
                <span lang="en">{q.q}</span>
                <Listen player={player} id={`${idPrefix}-q-${i}`} text={q.q} className="hkt-u-ico" title="Nghe câu hỏi" />
                <span className="hkt-u-vi">{q.vi}</span>
              </td>
              {shownOptions(q).map((o, k) => {
                if (mode !== "pick")
                  return (
                    <td key={k} className="hkt-u-opt" data-label={`Câu ${k + 1}`} lang="en">
                      {o.text}
                    </td>
                  );
                const ok = pick?.ok?.[i] && o.ok;
                const bad = pick?.bad?.[`${i}-${k}`];
                return (
                  <td key={k} className="hkt-u-opt" data-label={`Câu ${k + 1}`}>
                    <button
                      type="button"
                      lang="en"
                      className={`hkt-u-cell ${ok ? "is-ok" : ""} ${bad ? "is-bad" : ""}`}
                      onClick={() => onPick(i, k, o)}
                      aria-label={`Câu ${i + 1}, đáp án ${k + 1}: ${o.text}${ok ? " — đúng" : bad ? " — sai" : ""}`}
                    >
                      {ok && <Check size={16} aria-hidden="true" />}
                      {bad && <X size={16} aria-hidden="true" />}
                      {o.text}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pill({ children, tone }) {
  return <span className={`hkt-u-pill ${tone ? `is-${tone}` : ""}`}>{children}</span>;
}

// ---------- 3. Trắc nghiệm — FX-Q1 (#068): từng câu một trong khung cố định ----------
// Đọc / nghe câu hỏi, bấm 1 trong 3 đáp án. Đúng → tô vàng, tự sang câu chưa làm sau 1,5 giây
// (bấm "Giải thích" thì dừng lại). Sai → tô đỏ, chọn lại. Ô "Câu x/40" mở lưới 40 câu để nhảy.
export function PickPart({ unit, prog, update, player, openExplain, refButton, onNextPart }) {
  const qs = unit.questions;
  const pick = prog.pick || { ok: {}, bad: {}, wrong: 0 };
  const okCount = Object.keys(pick.ok).length;
  const firstOpen = () => {
    for (let k = 0; k < qs.length; k++) if (!pick.ok[k]) return k;
    return 0;
  };
  const i = Math.min(pick.pos ?? firstOpen(), qs.length - 1);
  const q = qs[i];
  const opts = shownOptions(q);
  const solved = !!pick.ok[i];
  const [gridOpen, setGridOpen] = useState(false);
  const [hold, setHold] = useState(false); // đã bấm Giải thích → không tự sang câu
  const stageRef = useStageTop(i);
  const go = (n) => update({ pick: { ...pick, pos: Math.max(0, Math.min(qs.length - 1, n)) } });
  const nextOpen = (from = i, ok = pick.ok) => {
    for (let k = 1; k <= qs.length; k++) {
      const n = (from + k) % qs.length;
      if (!ok[n]) return n;
    }
    return null;
  };
  const n = nextOpen();
  useEffect(() => {
    setHold(false);
    player.stop();
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  // Đúng → tự sang câu chưa làm sau 1,5 giây
  const [justOk, setJustOk] = useState(null);
  useEffect(() => {
    if (justOk === null || hold) return;
    const t = setTimeout(() => {
      if (justOk.next !== null) go(justOk.next);
      setJustOk(null);
    }, 1500);
    return () => clearTimeout(t);
  }, [justOk, hold]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setJustOk(null), [i]);

  const onPick = (k) => {
    const o = opts[k];
    if (solved) {
      if (o.ok) {
        setHold(true);
        openExplain(i);
      }
      return;
    }
    if (o.ok) {
      const ok = { ...pick.ok, [i]: 1 };
      update({ pick: { ...pick, ok, pos: i } });
      setJustOk({ next: nextOpen(i, ok) });
    } else if (!pick.bad[`${i}-${k}`]) {
      update({ pick: { ...pick, bad: { ...pick.bad, [`${i}-${k}`]: 1 }, wrong: pick.wrong + 1, pos: i } });
    }
  };
  const explain = () => {
    setHold(true);
    openExplain(i);
  };
  const keys = {
    1: () => onPick(0),
    2: () => onPick(1),
    3: () => onPick(2),
    q: () => player.play(`pk-q-${i}`, q.q),
    ArrowLeft: () => i > 0 && go(i - 1),
    ArrowRight: () => i < qs.length - 1 && go(i + 1),
  };
  if (solved && n !== null) keys.Enter = () => go(n);
  useDrillKeys(keys, [i, solved, n, pick]);
  const badHere = opts.some((o, k) => pick.bad[`${i}-${k}`]);

  return (
    <div className="kt-drill">
      <div className="kt-dhead">
        <div className="hkt-u-pills">
          {/* NV-Q7 (#112): Vòng Đét lấp theo số câu đã làm đúng, đủ 40 câu thì khép */}
          <VongDet value={okCount / qs.length} size={30} label={`${okCount}/${qs.length} câu đã làm đúng`} />
          <button type="button" className="hkt-u-pill kt-dpillbtn" onClick={() => setGridOpen(true)} title="Chọn câu">
            <Grid3x3 size={14} aria-hidden="true" /> Câu {i + 1}/{qs.length}
          </button>
          <Pill tone="ok">Đúng {okCount}</Pill>
          <Pill tone="bad">Sai {pick.wrong}</Pill>
        </div>
        <div className="kt-dnav">
          <button type="button" className="kt-dicon kt-darrow" disabled={i === 0} onClick={() => go(i - 1)} aria-label="Câu trước" title="Câu trước (←)">
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className="kt-dicon kt-darrow" disabled={i === qs.length - 1} onClick={() => go(i + 1)} aria-label="Câu sau" title="Câu sau (→)">
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          {refButton}
        </div>
      </div>
      <div className="hkt-progress-bar">
        <span style={{ width: `${(okCount / qs.length) * 100}%` }} />
      </div>
      <div className="kt-dstage" ref={stageRef}>
        {okCount === qs.length && (
          <div className="hkt-u-done">
            Xong cả 40 câu Trắc nghiệm, sai {pick.wrong} lần.{" "}
            {onNextPart && (
              <button type="button" className="hkt-btn hkt-btn--primary" onClick={onNextPart}>
                Sang Nghe nói <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className="kt-q kt-dq">
          <span className="no">{i + 1}</span>
          <div>
            <b lang="en">{q.q}</b>
            <ViHint key={`pk-vi-${i}`} text={q.vi} className="vi" />
          </div>
          <Listen player={player} id={`pk-q-${i}`} text={q.q} className="hkt-u-ico" title="Nghe câu hỏi (Q)" />
        </div>
      </div>
      <div className="kt-ddock">
        <div className="kt-dchoices">
          {opts.map((o, k) => {
            const ok = solved && o.ok;
            const bad = pick.bad[`${i}-${k}`];
            return (
              <button
                key={k}
                type="button"
                lang="en"
                className={`kt-opt ${ok ? "is-ok" : ""} ${bad ? "is-bad" : ""}`}
                onClick={() => onPick(k)}
                aria-label={`Đáp án ${k + 1}: ${o.text}${ok ? " — đúng" : bad ? " — sai" : ""}`}
              >
                <i>{k + 1}</i>
                {o.text}
              </button>
            );
          })}
        </div>
        {solved ? (
          <div className="kt-drow is-ok">
            <span className="kt-dmsg">
              <Check size={18} aria-hidden="true" /> {justOk && !hold ? "Đúng! Sang câu tiếp…" : "Đúng."}
            </span>
            <button type="button" className="hkt-btn" onClick={explain}>
              Giải thích
            </button>
            {n !== null && (
              <button type="button" className="hkt-btn hkt-btn--primary kt-dnext" onClick={() => go(n)}>
                Câu tiếp <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        ) : (
          <Status fb={badHere ? { tone: "bad", text: "Chưa đúng — chọn lại." } : null} />
        )}
        <KeyHint>Phím tắt: 1 2 3 chọn đáp án · Q nghe câu hỏi · V tiếng Việt · Enter câu tiếp · ← → đổi câu</KeyHint>
      </div>
      <Modal open={gridOpen} onClose={() => setGridOpen(false)} title="Chọn câu">
        <div className="kt-dgrid">
          {qs.map((_, k) => (
            <button
              key={k}
              type="button"
              className={`${pick.ok[k] ? "is-done" : ""} ${k === i ? "is-cur" : ""}`}
              onClick={() => {
                go(k);
                setGridOpen(false);
              }}
              aria-label={`Câu ${k + 1}${pick.ok[k] ? " — đã đúng" : ""}`}
            >
              {k + 1}
            </button>
          ))}
        </div>
        {(okCount > 0 || pick.wrong > 0) && (
          <p>
            <button
              type="button"
              className="hkt-link"
              onClick={() => {
                update({ pick: { ok: {}, bad: {}, wrong: 0, pos: 0 } });
                setGridOpen(false);
              }}
            >
              Làm lại từ đầu
            </button>
          </p>
        )}
      </Modal>
    </div>
  );
}

// ---------- Ô trả lời: tab Nói / Gõ (nhớ tab đã chọn — B-Q10) ----------
export function AnswerBox({ onSubmit, placeholder, disabled, hint, quick, compact }) {
  const [mode, setMode] = useStoredState(KT_STORAGE.answerMode, speechSupported ? "speak" : "type");
  const m = speechSupported ? mode : "type";
  const [typed, setTyped] = useState("");
  const [heard, setHeard] = useState(null); // U3-Q3 (#061): câu máy nghe được — chờ người học bấm "Gửi"
  const sp = useSpeechInput((alts) => setHeard(alts));
  const inputRef = useRef(null);
  useEffect(() => {
    if (disabled) sp.abort();
    setHeard(null);
  }, [disabled]); // eslint-disable-line react-hooks/exhaustive-deps
  const send = () => {
    if (!heard || disabled) return;
    onSubmit(heard, "speak");
    setHeard(null);
  };
  const go = (e) => {
    e?.preventDefault();
    const v = typed.trim();
    if (!v || disabled) return;
    onSubmit([v], "type");
    setTyped("");
  };
  return (
    <div className={`hkt-u-answer ${compact ? "is-compact" : ""}`}>
      <div className="hkt-seg" role="tablist" aria-label="Cách trả lời">
        <button type="button" role="tab" aria-selected={m === "speak"} className={m === "speak" ? "is-on" : ""} disabled={!speechSupported} onClick={() => setMode("speak")}>
          <Mic size={14} aria-hidden="true" /> Nói
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={m === "type"}
          className={m === "type" ? "is-on" : ""}
          onClick={() => {
            sp.abort();
            setMode("type");
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <Keyboard size={14} aria-hidden="true" /> Gõ
        </button>
      </div>
      {m === "speak" ? (
        <div className="hkt-u-speak">
          <button
            type="button"
            className={`hkt-mic ${sp.recording ? "is-recording" : ""}`}
            disabled={disabled}
            onClick={() => {
              if (sp.recording) return sp.stop();
              setHeard(null);
              sp.start();
            }}
          >
            <Mic size={20} aria-hidden="true" /> {sp.recording ? "Đang nghe… bấm để dừng" : heard ? "Nói lại" : "Bấm và nói"}
          </button>
          {sp.interim && <p className="hkt-u-interim" lang="en">“{sp.interim}”</p>}
          {heard && !sp.recording && (
            <div className="hkt-u-heard">
              <p lang="en">
                <span className="hkt-u-label-in">Máy nghe được:</span> “{heard[0]}”
              </p>
              <button type="button" className="hkt-btn hkt-btn--primary" onClick={send} disabled={disabled}>
                <Send size={16} aria-hidden="true" /> Gửi
              </button>
            </div>
          )}
          {sp.error && <p className="hkt-u-err">{sp.error}</p>}
          {hint && !compact && <p className="hkt-hint-sm">{hint}</p>}
        </div>
      ) : (
        <form className="hkt-type" onSubmit={go}>
          <input ref={inputRef} value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={placeholder} lang="en" disabled={disabled} aria-label={placeholder} />
          <button type="submit" className="hkt-btn hkt-btn--primary" disabled={disabled || !typed.trim()}>
            <Send size={16} aria-hidden="true" /> Gửi
          </button>
        </form>
      )}
      {quick}
    </div>
  );
}

/** U3-Q3 (#061): máy không hiểu câu trả lời → hỏi lại bằng tiếng. */
const askAgain = (player) => player.play(`again-${Date.now()}`, "Sorry, what did you say?");

/** Chọn phương án nhận dạng khớp được (nếu có), rồi so khớp với 3 đáp án theo thứ tự hiện. */
function matchAlts(alts, opts) {
  const options = opts.map((o, k) => ({ key: k, text: o.text }));
  let first = null;
  for (const a of alts) {
    const r = matchAnswer(a, options);
    if (!first) first = { ...r, said: a };
    if (r.status === "match") return { ...r, said: a };
  }
  return first;
}

// ---------- Khung luyện tập cố định (#067) ----------
// Nghe nói và True or false: đầu khung (số câu, điểm) + vùng câu hỏi + "dock" thao tác luôn nằm ở đáy khung.
// Trang không cuộn; câu mới luôn bắt đầu ở đầu khung; phím tắt cho máy tính.
function useDrillKeys(map, deps) {
  useEffect(() => {
    const h = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (document.querySelector(".hkt-modal-back, [role='dialog']")) return;
      const fn = map[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
function useStageTop(key) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.scrollTo?.(0, 0);
  }, [key]);
  return ref;
}
/** #073: nút đảo thứ tự câu (Nghe nói, True or false) — câu đã làm giữ kết quả. */
function ShuffleButton({ onClick }) {
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(false), 1600);
    return () => clearTimeout(t);
  }, [flash]);
  return (
    <button
      type="button"
      className={`kt-dicon ${flash ? "is-flash" : ""}`}
      onClick={() => {
        onClick();
        setFlash(true);
      }}
      aria-label="Đảo thứ tự các câu chưa làm"
      title={flash ? "Đã đảo thứ tự" : "Đảo thứ tự các câu chưa làm"}
    >
      <Shuffle size={18} aria-hidden="true" />
    </button>
  );
}
const canHover = () => typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches;
function KeyHint({ children }) {
  return canHover() ? <p className="kt-dkeys">{children}</p> : null;
}
function Status({ fb }) {
  return (
    <div className={`kt-dstatus ${fb ? `is-${fb.tone}` : ""}`} role="status" aria-live="polite">
      {fb && (
        <>
          <span>{fb.text}</span>
          {fb.said && <span className="hkt-u-said" lang="en">Máy nghe được: “{fb.said}”</span>}
        </>
      )}
    </div>
  );
}

// ---------- 4. Nghe nói — luyện nói: nghe câu hỏi, đọc / gõ câu trả lời (không hiện chữ — #050) ----------
export function SayPart({ unit, prog, update, player, openExplain, refButton, onNextPart }) {
  const qs = unit.questions;
  const say = prog.say || { pos: 0, ok: {}, wrong: 0 };
  const i = Math.min(say.pos || 0, qs.length - 1);
  const q = qs[i];
  // #073: thứ tự câu (mặc định 1→40; bấm "Đảo" để trộn). say.pos vẫn là số thứ tự câu hỏi gốc.
  const order = say.order?.length === qs.length ? say.order : [...Array(qs.length).keys()];
  const at = order.indexOf(i);
  const opts = shownOptions(q);
  const [fb, setFb] = useState(null);
  const stageRef = useStageTop(i);
  useEffect(() => {
    setFb(null);
    player.stop();
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  const solved = !!say.ok[i];
  const okCount = Object.keys(say.ok).length;
  const go = (n) => update({ say: { ...say, pos: Math.max(0, Math.min(qs.length - 1, n)) } });
  const goAt = (k) => k >= 0 && k < order.length && go(order[k]);
  const nextOpen = () => {
    for (let k = 1; k <= qs.length; k++) {
      const n = order[(at + k) % qs.length];
      if (!say.ok[n]) return n;
    }
    return null;
  };
  const reshuffle = () => {
    const o = shuffle([...Array(qs.length).keys()]);
    const first = o.find((k) => !say.ok[k]);
    update({ say: { ...say, order: o, pos: first ?? o[0] } });
  };

  const onSubmit = (alts) => {
    if (solved) return;
    const r = matchAlts(alts, opts);
    if (r.status === "match" && opts[r.key].ok) {
      update({ say: { ...say, ok: { ...say.ok, [i]: k1(r.key) } } });
      setFb(null);
    } else if (r.status === "match") {
      update({ say: { ...say, wrong: say.wrong + 1 } });
      setFb({ tone: "bad", text: `Bạn vừa nói đáp án ${r.key + 1} — chưa đúng. Nghe lại và thử tiếp.`, said: r.said });
    } else {
      // U3-Q3 (#061): máy không hiểu (không khớp / gần nhiều đáp án) → không tính Sai, hỏi lại
      askAgain(player);
      setFb({ tone: "warn", text: "“What did you say?” — máy chưa hiểu, nói lại (hoặc gõ) đầy đủ hơn. Không tính Sai.", said: r.said });
    }
  };
  const solvedKey = solved ? say.ok[i] - 1 : null;
  const n = nextOpen();
  const keys = {
    q: () => player.play(`sy-q-${i}`, q.q),
    1: () => player.play(`sy-o-${i}-0`, opts[0].text),
    2: () => player.play(`sy-o-${i}-1`, opts[1].text),
    3: () => player.play(`sy-o-${i}-2`, opts[2].text),
    ArrowLeft: () => goAt(at - 1),
    ArrowRight: () => goAt(at + 1),
  };
  if (solved && n !== null) keys.Enter = () => go(n);
  useDrillKeys(keys, [i, solved, n, say]);

  return (
    <div className="kt-drill">
      <div className="kt-dhead">
        <div className="hkt-u-pills">
          <VongDet value={okCount / qs.length} size={30} label={`${okCount}/${qs.length} câu đã nói đúng`} />
          <Pill>Câu {at + 1}/{qs.length}</Pill>
          <Pill tone="ok">Đúng {okCount}</Pill>
          <Pill tone="bad">Sai {say.wrong}</Pill>
        </div>
        <div className="kt-dnav">
          <ShuffleButton onClick={reshuffle} />
          <button type="button" className="kt-dicon kt-darrow" disabled={at === 0} onClick={() => goAt(at - 1)} aria-label="Câu trước" title="Câu trước (←)">
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className="kt-dicon kt-darrow" disabled={at === qs.length - 1} onClick={() => goAt(at + 1)} aria-label="Câu sau" title="Câu sau (→)">
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          {refButton}
        </div>
      </div>
      <div className="hkt-progress-bar">
        <span style={{ width: `${(okCount / qs.length) * 100}%` }} />
      </div>
      <div className="kt-dstage" ref={stageRef}>
        {okCount === qs.length && (
          <div className="hkt-u-done">
            Xong cả 40 câu Nghe nói, sai {say.wrong} lần.{" "}
            {onNextPart && (
              <button type="button" className="hkt-btn hkt-btn--primary" onClick={onNextPart}>
                Sang True or false <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <Listen player={player} id={`sy-q-${i}`} text={q.q} className="hkt-listen--lg">
          Nghe câu hỏi
        </Listen>
        {solved ? (
          <div className="hkt-u-reveal">
            <p className="hkt-u-qen" lang="en">{q.q}</p>
            <ViHint key={`sy-vi-${i}`} text={q.vi} />
          </div>
        ) : (
          <p className="kt-dnote">
            <Headphones size={15} aria-hidden="true" /> Chỉ nghe — chữ hiện khi bạn nói đúng đáp án
          </p>
        )}
        {solved ? (
          // #074: đã đúng → chỉ hiện chữ đáp án đúng; 3 đáp án vẫn nghe lại được bằng hàng nút
          <>
            <div className="kt-dopts">
              {opts.map((o, k) => (
                <Listen key={k} player={player} id={`sy-o-${i}-${k}`} text={o.text} className={`kt-dopt ${k === solvedKey ? "is-ok" : ""}`}>
                  Đáp án {k + 1}
                </Listen>
              ))}
            </div>
            <p className="kt-dans" lang="en">
              <Check size={16} aria-hidden="true" /> {opts[solvedKey].text}
            </p>
          </>
        ) : (
          <div className="kt-dopts">
            {opts.map((o, k) => (
              <Listen key={k} player={player} id={`sy-o-${i}-${k}`} text={o.text} className="kt-dopt">
                Đáp án {k + 1}
              </Listen>
            ))}
          </div>
        )}
      </div>
      <div className="kt-ddock">
        {solved ? (
          <div className="kt-drow is-ok">
            <span className="kt-dmsg">
              <Check size={18} aria-hidden="true" /> Đúng — đáp án {solvedKey + 1}.
            </span>
            <button type="button" className="hkt-btn" onClick={() => openExplain(i)}>
              Giải thích
            </button>
            {n !== null && (
              <button type="button" className="hkt-btn hkt-btn--primary kt-dnext" onClick={() => go(n)}>
                Câu tiếp <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        ) : (
          <>
            <Status fb={fb} />
            <AnswerBox onSubmit={onSubmit} placeholder="Gõ đáp án đúng…" hint="Nghe 3 đáp án rồi nói lại đáp án đúng." compact />
          </>
        )}
        <KeyHint>Phím tắt: Q nghe câu hỏi · 1 2 3 nghe đáp án · V tiếng Việt (khi đã đúng) · Enter câu tiếp · ← → đổi câu</KeyHint>
      </div>
    </div>
  );
}
// lưu số thứ tự đáp án đúng (+1 để khác 0)
const k1 = (k) => k + 1;

// ---------- 5. True or false: 80 câu (#060) — nghe câu hỏi + câu trả lời, phân biệt đúng / sai ----------
// Không hiện chữ (#049); +1 / −1, không chọn lại; 40 TRUE + 40 FALSE, rải đều (unitData.newQaRun).
export function TrueFalsePart({ unit, prog, update, player, openExplain, refButton, results, onNextPart }) {
  const qs = unit.questions;
  const qa = prog.qa && prog.qa.items?.length === qaTotal(qs.length) ? prog.qa : null;
  useEffect(() => {
    if (!qa) update({ qa: newQaRun(qs.length) });
  }, [qa]); // eslint-disable-line react-hooks/exhaustive-deps
  const pos = qa?.pos ?? 0;
  const it = qa?.items[pos];
  const [fb, setFb] = useState(null);
  const stageRef = useStageTop(`${pos}-${qa?.runs}`);
  useEffect(() => {
    setFb(null);
    player.stop();
  }, [pos, qa?.runs]); // eslint-disable-line react-hooks/exhaustive-deps
  const live = qa && it && !qa.finished;
  const q = live ? qs[it.i] : null;
  const doneHere = live ? qa.done[pos] : null;
  const set = (patch) => update({ qa: { ...qa, ...patch } });
  const next = () => (pos + 1 >= qa.items.length ? set({ finished: true }) : set({ pos: pos + 1 }));
  const cand = live ? q.options[it.cand] : "";
  const judge = (v) => {
    if (!live || doneHere) return;
    const right = v === it.truth;
    setFb(null);
    set({ d2pt: qa.d2pt + (right ? 1 : -1), d2n: qa.d2n + 1, done: { ...qa.done, [pos]: { right, chose: v } } });
  };
  const keys = live
    ? doneHere
      ? { Enter: next, n: next, q: () => player.play(`tf-q-${pos}`, q.q), a: () => player.play(`tf-a-${pos}`, cand) }
      : { t: () => judge(true), f: () => judge(false), q: () => player.play(`tf-q-${pos}`, q.q), a: () => player.play(`tf-a-${pos}`, cand) }
    : {};
  useDrillKeys(keys, [pos, !!doneHere, live, qa?.runs]);

  if (!qa || !it) return <p className="hkt-message-inline">Đang chuẩn bị…</p>;

  if (qa.finished) {
    return (
      <div className="kt-drill">
        <div className="kt-dstage">
          <h2 className="hkt-h2">Xong phần True or false</h2>
          {results}
          <p>
            <button
              type="button"
              className="hkt-btn hkt-btn--primary"
              onClick={() => update({ qa: { ...newQaRun(qs.length), runs: (qa.runs || 1) + 1 } })}
            >
              <RotateCcw size={16} aria-hidden="true" /> Làm lại (trộn mới)
            </button>{" "}
            {onNextPart && (
              <button type="button" className="hkt-btn" onClick={onNextPart}>
                Sang bài tiếp <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
          </p>
        </div>
      </div>
    );
  }

  const okN = Object.values(qa.done).filter((d) => d.right).length;
  const badN = Object.keys(qa.done).length - okN;
  const onSubmit = (alts) => {
    const s = alts.join(" ").toLowerCase();
    if (/\b(true|right|correct|yes)\b|đúng/.test(s)) judge(true);
    else if (/\b(false|wrong|no|not)\b|sai/.test(s)) judge(false);
    else {
      askAgain(player);
      setFb({ tone: "warn", text: "“What did you say?” — máy chưa hiểu, hãy nói “true” hoặc “false”.", said: alts[0] });
    }
  };
  return (
    <div className="kt-drill">
      <div className="kt-dhead">
        <div className="hkt-u-pills">
          <Pill>Câu {pos + 1}/{qa.items.length}</Pill>
          <Pill tone="ok">Đúng {okN}</Pill>
          <Pill tone="bad">Sai {badN}</Pill>
          <Pill tone={qa.d2pt < 0 ? "bad" : "ok"}>{qa.d2pt} điểm</Pill>
        </div>
        <div className="kt-dnav">
          <ShuffleButton onClick={() => set({ items: reshuffleQaRest(qa.items, doneHere ? pos + 1 : pos) })} />
          {refButton}
        </div>
      </div>
      <div className="hkt-progress-bar">
        <span style={{ width: `${(Object.keys(qa.done).length / qa.items.length) * 100}%` }} />
      </div>
      <div className="kt-dstage" ref={stageRef}>
        <div className="hkt-u-btns">
          <Listen player={player} id={`tf-q-${pos}`} text={q.q}>
            Nghe câu hỏi
          </Listen>
          <Listen player={player} id={`tf-a-${pos}`} text={cand}>
            Nghe câu trả lời
          </Listen>
        </div>
        {doneHere ? (
          <div className="hkt-u-reveal">
            <p className="hkt-u-qen" lang="en">{q.q}</p>
            <ViHint key={`tf-vi-${pos}`} text={q.vi} />
            <blockquote className="hkt-u-cand" lang="en">{cand}</blockquote>
          </div>
        ) : (
          <p className="kt-dnote">
            <Headphones size={15} aria-hidden="true" /> Chỉ nghe — câu trả lời vừa nghe đúng hay sai? Đúng +1, sai −1, không chọn lại.
          </p>
        )}
      </div>
      <div className="kt-ddock">
        <div className="hkt-u-tf">
          {[true, false].map((v) => {
            const cls = doneHere ? (v === it.truth ? "is-ok" : v === doneHere.chose ? "is-bad" : "") : "";
            return (
              <button key={String(v)} type="button" className={`hkt-btn hkt-u-tfbtn ${cls}`} disabled={!!doneHere} onClick={() => judge(v)}>
                {v ? <Check size={18} aria-hidden="true" /> : <X size={18} aria-hidden="true" />} {v ? "True" : "False"}
              </button>
            );
          })}
        </div>
        {doneHere ? (
          <div className={`kt-drow ${doneHere.right ? "is-ok" : "is-bad"}`}>
            <span className="kt-dmsg">
              {doneHere.right ? "Chính xác! +1" : "Chưa đúng −1"} · Câu này là <b>{it.truth ? "TRUE" : "FALSE"}</b>
            </span>
            <button type="button" className="hkt-btn" onClick={() => openExplain(it.i)}>
              Giải thích
            </button>
            <button type="button" className="hkt-btn hkt-btn--primary kt-dnext" onClick={next}>
              Tiếp <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            <Status fb={fb} />
            <AnswerBox onSubmit={onSubmit} placeholder="Gõ true hoặc false…" hint="Bấm nút, hoặc nói “true” / “false”." compact />
          </>
        )}
        <KeyHint>Phím tắt: Q nghe câu hỏi · A nghe câu trả lời · T true · F false · V tiếng Việt (khi đã chọn) · Enter tiếp</KeyHint>
      </div>
    </div>
  );
}

/** 3 kết quả hiện riêng, không gộp (B-Q14). */
export function UnitResults({ s }) {
  if (!s) return null;
  return (
    <dl className="hkt-u-results">
      <div>
        <dt>Trắc nghiệm</dt>
        <dd>
          Đúng {s.pickOk}/{s.total} · sai {s.pickWrong} lần
        </dd>
      </div>
      <div>
        <dt>Nghe nói</dt>
        <dd>
          Đúng {s.sayOk}/{s.total} · sai {s.sayWrong} lần
        </dd>
      </div>
      <div>
        <dt>True or false</dt>
        <dd>
          {s.d2pt} điểm / {s.d2n} câu
        </dd>
      </div>
    </dl>
  );
}

export function RefButton({ onOpen, count }) {
  return (
    <button type="button" className="hkt-btn hkt-u-refbtn" onClick={onOpen}>
      <ClipboardList size={16} aria-hidden="true" /> Bảng thông tin
      {count > 0 && <span className="hkt-u-count" title="Số lần đã mở (chỉ bạn thấy)">{count}</span>}
    </button>
  );
}
