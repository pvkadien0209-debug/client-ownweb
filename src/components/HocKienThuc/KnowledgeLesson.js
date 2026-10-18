// SP01 — Màn hình học kiến thức qua trắc nghiệm Nghe – Nói.
// M1: nghe câu hỏi / đáp án, ẩn–hiện chữ đáp án, khoá chồng chéo khi đang phát.
// M2: chế độ Gõ + so khớp (matcher.js), tô vàng đáp án khớp.
// M3: chế độ Nói (Web Speech API, en-US), tự dừng khi im lặng hoặc sau 10 giây.
// M4: Đồng ý → chấm, giải thích song ngữ trong khung cố định có "… Xem thêm", Câu tiếp.
// M5: lưu tiến độ, Làm tiếp / Làm lại, màn hình kết quả, làm lại câu sai.
// Kế hoạch: DetPro/san-pham/sp01-trac-nghiem-nghe-noi.md
// Hướng C "Hỏi trước, hiểu sau" (#044, research/2026-10-14-phan-tich-ux-ui.md):
//   làm theo LƯỢT (?part=N, một nhánh cây), đầu màn hình gọn, mặc định hiện chữ ("Chỉ nghe" là tuỳ chọn),
//   mic là nút chính, khung "Điều bạn vừa biết" (tiếng Việt trước, không cắt), màn hình hết lượt.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Volume2, Square, Mic, Keyboard, Check, X, Headphones, ArrowRight, RotateCcw, BookOpen } from "lucide-react";
import { KT_STORAGE, dataUrl, MIC_WATCHDOG_MS } from "./config";
import useStoredState from "./useStoredState";
import { playText, stopAudio, releaseAudioForMic } from "./audioPlayer";
import { matchAnswer } from "./matcher";
import {
  readProgress, writeProgress, clearProgress, newProgress, tally, wrongIndexes, lessonPath,
  lessonParts, partStats, partOfQuestion, currentPart,
} from "./knowledgeData";
import { useLang, LangToggle, Bi } from "./Bilingual";
import Results, { ConfirmButton } from "./Results";
import "./KnowledgeLesson.css";
import "./KnowledgePages.css";

const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const speechSupported = !!SR;
const MAX_REC_MS = 10000; // M3: tối đa 10 giây mỗi lần nói
// #045 — Đo thời gian micro sẵn sàng để thử trên iPhone: mở trang với ?micdebug=1 (máy nhớ), ?micdebug=0 để tắt.
const MIC_DEBUG = (() => {
  try {
    const m = window.location.search.match(/micdebug=(\d)/) || window.location.href.match(/micdebug=(\d)/);
    if (m) window.localStorage.setItem("hkt.micDebug", m[1]);
    return window.localStorage.getItem("hkt.micDebug") === "1";
  } catch {
    return false;
  }
})();

const SPEECH_ERRORS = {
  "not-allowed": "Bạn chưa cho phép dùng micro. Bấm biểu tượng ổ khoá trên thanh địa chỉ để cho phép, hoặc chuyển sang Gõ.",
  "service-not-allowed": "Trình duyệt không cho dùng nhận giọng nói. Hãy chuyển sang Gõ.",
  "no-speech": "Chưa nghe thấy gì. Bấm Nói rồi nói gần micro hơn.",
  "audio-capture": "Không tìm thấy micro. Kiểm tra micro hoặc chuyển sang Gõ.",
  network: "Nhận giọng nói cần mạng. Kiểm tra kết nối hoặc chuyển sang Gõ.",
};

function Wave() {
  return (
    <span className="hkt-wave" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

/** Nút nghe: đang phát thì bấm lại để dừng; khi nút khác đang phát (hoặc đang ghi âm) thì bị khoá. */
function ListenButton({ id, text, label, playing, onPlay, size = "sm", blocked = false }) {
  const isMe = playing === id;
  const locked = blocked || (playing !== null && !isMe);
  return (
    <button
      type="button"
      className={`hkt-listen hkt-listen--${size}${isMe ? " is-playing" : ""}`}
      onClick={() => onPlay(id, text)}
      disabled={locked}
      aria-pressed={isMe}
      aria-label={isMe ? `Dừng ${label}` : label}
      title={locked ? (blocked ? "Đang ghi âm" : "Đang phát âm thanh khác") : undefined}
    >
      {isMe ? <Square size={size === "lg" ? 22 : 16} /> : <Volume2 size={size === "lg" ? 24 : 18} />}
      <span className="hkt-listen-label">{isMe ? "Dừng" : label}</span>
      {isMe && <Wave />}
    </button>
  );
}

/** UC4 (#044) — "Điều bạn vừa biết": lời giải thích là phần DẠY KIẾN THỨC, chữ to, tiếng Việt trước, không cắt ngắn.
 *  Câu hỏi và 4 đáp án đã tô màu ngay trên danh sách đáp án nên không nhắc lại ở đây. */
function Explanation({ q, lang, setLang, readMore }) {
  const right = q.options.find((o) => o.key === q.answer);
  const others = [...(right?.variants || [])];
  return (
    <div className="hkt-learn">
      <div className="hkt-explain-head">
        <p className="hkt-eyebrow">Điều bạn vừa biết</p>
        <LangToggle lang={lang} setLang={setLang} />
      </div>
      <Bi value={q.explanation} lang={lang} viFirst className="hkt-learn-text" />
      {others.length > 0 && (
        <p className="hkt-ex-ways">
          Cách nói khác của đáp án đúng:{" "}
          {others.map((v, i) => (
            <span key={i} lang="en">
              {i ? " · " : ""}“{v}”
            </span>
          ))}
        </p>
      )}
      {readMore && (
        <Link className="hkt-readmore" to={readMore}>
          <BookOpen size={16} aria-hidden="true" /> Đọc thêm trong bài đọc
        </Link>
      )}
    </div>
  );
}

/** UC5 (#044) — Hết lượt: "Bạn vừa biết thêm N điều" (các ý nhỏ của nhánh cây), câu sai để ôn, lượt tiếp. */
function PartDone({ part, stats, lang, isRetry, nextPart, allDone, onRetryWrong, onNext, onFull, lessonHome }) {
  const wrong = stats.done - stats.correct;
  return (
    <section className="hkt-panel hkt-partdone">
      <p className="hkt-eyebrow">{isRetry ? "Xong phần ôn câu sai" : "Xong lượt"} {part.no} · {part.title?.vi}</p>
      <h2>{part.points.length ? `Bạn vừa biết thêm ${part.points.length} điều` : "Bạn đã làm xong lượt này"}</h2>
      <p className="hkt-muted">
        {stats.correct}/{stats.total} câu đúng
      </p>
      {part.points.length > 0 && (
        <ol className="hkt-known">
          {part.points.map((c, i) => (
            <li key={i}>
              <Bi value={c.title} lang={lang} viFirst as="span" className="hkt-known-t" />
              {c.note && <Bi value={c.note} lang={lang} viFirst className="hkt-known-n" />}
            </li>
          ))}
        </ol>
      )}
      <div className="hkt-result-actions">
        {nextPart ? (
          <button type="button" className="hkt-btn hkt-btn--primary" onClick={onNext}>
            Lượt {nextPart.no} · {nextPart.title?.vi} <ArrowRight size={18} />
          </button>
        ) : (
          allDone && (
            <button type="button" className="hkt-btn hkt-btn--primary" onClick={onFull}>
              Xem kết quả cả bài <ArrowRight size={18} />
            </button>
          )
        )}
        {wrong > 0 && (
          <button type="button" className="hkt-btn" onClick={onRetryWrong}>
            <RotateCcw size={18} /> Ôn lại {wrong} câu sai
          </button>
        )}
        <Link className="hkt-btn" to={lessonHome}>
          Về trang bài
        </Link>
      </div>
    </section>
  );
}

export default function KnowledgeLesson() {
  const { branch, topic, lesson } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [topicData, setTopicData] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [error, setError] = useState(null);
  const [prog, setProg] = useState(null); // tiến độ (M5)
  const [stage, setStage] = useState("loading"); // loading | resume | quiz | results
  const [playing, setPlaying] = useState(null);
  const [openVariants, setOpenVariants] = useState(null);
  const [listenOnly, setListenOnly] = useStoredState(KT_STORAGE.listenOnly, false); // UXC-Q3
  const [showFull, setShowFull] = useState(false); // xem kết quả cả bài sau khi xong mọi lượt
  const [mode] = useStoredState(KT_STORAGE.answerMode, speechSupported ? "speak" : "type");
  const [lang, setLang] = useLang();
  // trạng thái của câu đang làm
  const [typed, setTyped] = useState("");
  const [heard, setHeard] = useState(null); // { text, via }
  const [match, setMatch] = useState(null); // kết quả matchAnswer
  const [attempts, setAttempts] = useState(0);
  const [graded, setGraded] = useState(null); // { chosen, correct }
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [speechErr, setSpeechErr] = useState(null);
  const recRef = useRef(null);
  const timerRef = useRef(null);
  const watchRef = useRef(null); // #045 canh giờ micro
  const [micMs, setMicMs] = useState(null); // #045 đo (chỉ hiện khi ?micdebug=1)
  const inputRef = useRef(null);
  const nextRef = useRef(null);
  const ctlRef = useRef(null);

  const answerMode = speechSupported ? mode : "type";

  // ---------- Tải dữ liệu + tiến độ ----------
  useEffect(() => {
    let alive = true;
    setError(null);
    setLessonData(null);
    setStage("loading");
    Promise.all([
      fetch(dataUrl(branch, topic, "topic")).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(dataUrl(branch, topic, lesson)).then((r) => {
        if (!r.ok) throw new Error("not-found");
        return r.json();
      }),
    ])
      .then(([t, l]) => {
        if (!alive) return;
        setTopicData(t);
        setLessonData(l);
      })
      .catch(() => alive && setError("not-found"));
    return () => {
      alive = false;
      stopAudio();
    };
  }, [branch, topic, lesson]);

  // Quyết định màn hình đầu: theo ?part= / ?q= / ?retry= / ?restart= hoặc tiến độ đã lưu
  useEffect(() => {
    if (!lessonData) return;
    const qs = lessonData.questions || [];
    const total = qs.length;
    const parts = lessonParts(lessonData);
    const saved = readProgress(branch, topic, lesson);
    const qParam = parseInt(searchParams.get("q"), 10);
    const partParam = parseInt(searchParams.get("part"), 10);
    const retry = searchParams.get("retry");
    const restart = searchParams.get("restart");
    let p = saved && saved.queue.every((i) => i < total) ? saved : null;
    let next = "quiz";
    if (restart) {
      clearProgress(branch, topic, lesson);
      p = startPart(newProgress(total), parts[0], qs);
    } else if (retry && p) {
      p = startRetry(p, qs, retry === "part" && p.part ? parts[p.part - 1]?.qIdx : null);
    } else if (qParam >= 1 && qParam <= total) {
      // từ Sơ đồ ý hoặc danh sách câu sai → mở thẳng câu N, trong lượt chứa câu đó
      const pt = partOfQuestion(parts, qParam - 1);
      p = tally({ ...(p || newProgress(total)), queue: pt.qIdx, mode: "part", part: pt.no, current: pt.qIdx.indexOf(qParam - 1) });
    } else if (partParam >= 1 && partParam <= parts.length) {
      p = startPart(p || newProgress(total), parts[partParam - 1], qs);
    } else if (!p) {
      p = startPart(newProgress(total), parts[0], qs);
    } else if (p.current >= p.queue.length) {
      next = "results";
    } else if (p.current > 0) {
      next = "resume"; // đang làm dở giữa lượt (hoặc giữa phần ôn câu sai)
    }
    if (restart || retry || qParam || partParam) setSearchParams({}, { replace: true });
    setProg(tally(p));
    setStage(next);
    setShowFull(false);
    resetQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonData]);

  // Ghi tiến độ mỗi khi đổi (chỉ khi đã có ít nhất một câu trả lời)
  useEffect(() => {
    if (prog && (prog.done > 0 || prog.mode === "retry")) writeProgress(branch, topic, lesson, prog);
  }, [prog, branch, topic, lesson]);

  // Dọn dẹp ghi âm khi rời trang
  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      clearTimeout(watchRef.current);
      if (recRef.current) {
        recRef.current.onend = null;
        recRef.current.abort();
      }
    },
    []
  );

  function startRetry(p, qs, onlyIdx = null) {
    const wrong = wrongIndexes(p, qs).filter((i) => !onlyIdx || onlyIdx.includes(i));
    if (!wrong.length) return p;
    // giữ câu trả lời cũ cho tới khi làm lại câu đó (để "Kết quả của tôi" vẫn hiện câu sai)
    // onlyIdx: chỉ ôn câu sai của một lượt (giữ p.part để hết phần ôn quay về màn hình hết lượt)
    return tally({ ...p, queue: wrong, current: 0, mode: "retry", part: onlyIdx ? p.part : null, retryAt: Date.now(), updatedAt: Date.now() });
  }
  /** Bắt đầu / làm tiếp một lượt: hàng đợi = các câu của lượt; nhảy tới câu đầu tiên chưa làm. */
  function startPart(p, part, qs) {
    if (!part) return p;
    const first = part.qIdx.findIndex((i) => !p.answers[qs[i].id]);
    return tally({ ...p, queue: part.qIdx, mode: "part", part: part.no, current: first >= 0 ? first : 0, updatedAt: Date.now() });
  }

  function resetQuestion() {
    stopAudio();
    setPlaying(null);
    setOpenVariants(null);
    setTyped("");
    setHeard(null);
    setMatch(null);
    setAttempts(0);
    setGraded(null);
    setInterim("");
    setSpeechErr(null);
  }

  // ---------- Nghe ----------
  const play = useCallback(
    async (id, text) => {
      if (recording) return;
      if (playing === id) {
        stopAudio();
        setPlaying(null);
        return;
      }
      if (playing !== null) return; // khoá chồng chéo (§4)
      setPlaying(id);
      await playText(text);
      setPlaying((p) => (p === id ? null : p));
    },
    [playing, recording]
  );

  const questions = lessonData?.questions || [];
  const total = questions.length;
  const qIndex = prog && stage === "quiz" ? prog.queue[prog.current] : null;
  const q = qIndex !== null && qIndex !== undefined ? questions[qIndex] : null;

  // ---------- So khớp (M2) ----------
  const submit = useCallback(
    (text, via) => {
      if (!q || graded) return;
      const r = matchAnswer(text, q.options);
      setHeard({ text, via });
      setMatch(r);
      setAttempts((n) => n + 1);
    },
    [q, graded]
  );
  const submitRef = useRef(submit);
  submitRef.current = submit;

  // ---------- Nói (M3) ----------
  const stopRec = () => {
    clearTimeout(timerRef.current);
    if (recRef.current) recRef.current.stop();
  };
  // #045: micro không phản hồi (iPhone sau khi phát âm thanh) → mời gõ, đặt sẵn con trỏ vào ô gõ
  const micFailed = (msg) => {
    setSpeechErr(msg);
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  const startRec = (attempt = 0) => {
    if (!SR || (recording && attempt === 0) || graded) return;
    // #045: dừng HẲN mọi âm thanh + tạm ngưng AudioContext để iOS trả micro nhanh
    releaseAudioForMic();
    setPlaying(null);
    setSpeechErr(null);
    setInterim("");
    const rec = new SR(); // luôn tạo mới (iOS dùng lại đối tượng cũ dễ treo)
    let alive = false; // micro đã thật sự bắt đầu nghe chưa
    const t0 = Date.now();
    const markAlive = () => {
      if (alive) return;
      alive = true;
      if (MIC_DEBUG) setMicMs(`${Date.now() - t0} ms${attempt ? " (lần thử 2)" : ""}`);
      clearTimeout(watchRef.current);
    };
    rec.onaudiostart = markAlive;
    rec.onspeechstart = markAlive;
    rec.onstart = () => {
      // một số trình duyệt không bắn onaudiostart; onstart đủ cho máy tính
      if (!/iPhone|iPad|iPod/.test(navigator.userAgent)) markAlive();
    };
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false; // tự dừng khi người nói im lặng
    rec.maxAlternatives = 3;
    let finals = [];
    let lastInterim = "";
    rec.onresult = (e) => {
      let fin = [];
      let inter = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) fin.push(Array.from(res).map((a) => a.transcript));
        else inter += res[0].transcript;
      }
      markAlive();
      finals = fin;
      lastInterim = inter;
      setInterim((fin.map((f) => f[0]).join(" ") + " " + inter).trim());
    };
    rec.onerror = (e) => {
      markAlive();
      if (e.error !== "aborted") micFailed(SPEECH_ERRORS[e.error] || "Không nhận được giọng nói. Bấm mic thử lại, hoặc gõ đáp án ở ô bên dưới.");
    };
    rec.onend = () => {
      clearTimeout(timerRef.current);
      clearTimeout(watchRef.current);
      if (rec._watchdogFired) return; // đã xử lý ở watchdog
      recRef.current = null;
      setRecording(false);
      setInterim("");
      // Ghép các đoạn cuối; với đoạn đầu thử từng phương án nhận dạng, ưu tiên phương án khớp được
      const head = finals.map((f) => f[0]).join(" ").trim() || lastInterim.trim();
      if (!head) return;
      let pick = head;
      if (finals.length === 1 && finals[0].length > 1) {
        const qNow = questions[prog?.queue[prog.current]];
        const good = qNow && finals[0].find((alt) => matchAnswer(alt, qNow.options).status === "match");
        if (good) pick = good.trim();
      }
      submitRef.current(pick, "speak");
    };
    recRef.current = rec;
    try {
      rec.start();
      setRecording(true);
      timerRef.current = setTimeout(() => rec.stop(), MAX_REC_MS);
      // #045 — Canh giờ: micro chưa nghe được sau MIC_WATCHDOG_MS → huỷ, thử lại 1 lần, rồi mời gõ
      clearTimeout(watchRef.current);
      watchRef.current = setTimeout(() => {
        if (alive) return;
        rec._watchdogFired = true;
        try {
          rec.onresult = rec.onerror = rec.onend = null;
          rec.abort();
        } catch {
          /* bỏ qua */
        }
        clearTimeout(timerRef.current);
        recRef.current = null;
        setRecording(false);
        setInterim("");
        if (attempt === 0) {
          setTimeout(() => startRecRef.current(1), 250);
        } else {
          micFailed("Micro chưa sẵn sàng (thường gặp trên iPhone ngay sau khi phát âm thanh). Bấm mic lần nữa, hoặc gõ đáp án ở ô bên dưới.");
        }
      }, MIC_WATCHDOG_MS);
    } catch {
      micFailed("Không bật được micro. Bấm mic thử lại, hoặc gõ đáp án ở ô bên dưới.");
    }
  };
  const startRecRef = useRef(startRec);
  startRecRef.current = startRec;

  // ---------- Chấm (M4) + lưu (M5) ----------
  const confirm = () => {
    if (!q || !match || match.status !== "match" || graded || recording) return;
    stopAudio();
    setPlaying(null);
    const correct = match.key === q.answer;
    setGraded({ chosen: match.key, correct });
    setProg((p) =>
      tally({
        ...p,
        answers: {
          ...p.answers,
          [q.id]: {
            chosen: match.key,
            correct,
            mode: heard?.via || answerMode,
            input: heard?.text || "",
            sim: Math.round(match.sim * 100) / 100,
            attempts,
            at: Date.now(),
          },
        },
        updatedAt: Date.now(),
      })
    );
  };
  const goNext = () => {
    resetQuestion();
    if (prog.current + 1 >= prog.queue.length) setStage("results");
    setProg((p) => ({ ...p, current: p.current + 1, updatedAt: Date.now() }));
    window.scrollTo(0, 0);
  };

  // Sau khi chấm: đưa khung "Điều bạn vừa biết" vào tầm mắt (điện thoại) và đặt focus vào Câu tiếp
  useEffect(() => {
    if (graded && nextRef.current) {
      nextRef.current.focus({ preventScroll: true });
      if (ctlRef.current && ctlRef.current.scrollIntoView && window.innerWidth <= 860) {
        ctlRef.current.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    }
  }, [graded]);

  const parts = lessonData ? lessonParts(lessonData) : [];
  const restartAll = () => {
    clearProgress(branch, topic, lesson);
    resetQuestion();
    setShowFull(false);
    setProg(startPart(newProgress(total), parts[0], questions));
    setStage("quiz");
  };
  // Còn câu chưa làm → làm tiếp lượt chưa xong đầu tiên
  const continueUnanswered = () => {
    resetQuestion();
    setShowFull(false);
    setProg((p) => startPart(p, currentPart(p, parts, questions) || parts[0], questions));
    setStage("quiz");
  };
  const retryWrong = (onlyPart = false) => {
    resetQuestion();
    setShowFull(false);
    setProg((p) => startRetry(p, questions, onlyPart && p.part ? parts[p.part - 1]?.qIdx : null));
    setStage("quiz");
  };
  const goPart = (pt) => {
    resetQuestion();
    setShowFull(false);
    setProg((p) => startPart(p, pt, questions));
    setStage("quiz");
    window.scrollTo(0, 0);
  };

  // ---------- Hiển thị ----------
  if (error) {
    return (
      <main className="hkt-page">
        <div className="hkt-message">
          <h1>Không tìm thấy bài học này</h1>
          <p>
            Kiểm tra lại đường dẫn. Bài học được tìm ở{" "}
            <code>/jsonData/knowledge/{branch}/{topic}/{lesson}.json</code>.
          </p>
        </div>
      </main>
    );
  }
  if (!lessonData || !prog || stage === "loading") {
    return (
      <main className="hkt-page">
        <div className="hkt-message" aria-busy="true">
          <p>Đang tải bài học…</p>
        </div>
      </main>
    );
  }

  const topicTitle = topicData?.title?.vi || topic;
  const lessonNo = (lesson.match(/\d+/) || [""])[0];
  const lessonHome = lessonPath(branch, topic, lesson);
  const isRetry = prog.mode === "retry";
  const part = prog.part ? parts[prog.part - 1] : null;
  const pos = Math.min(prog.current + (graded ? 1 : 0), prog.queue.length);
  // đếm đúng/sai trong hàng đợi hiện tại (lượt hoặc phần ôn), không phải cả bài
  const qStats = prog.queue.reduce(
    (s, i) => {
      const a = prog.answers[questions[i]?.id];
      if (a && (!isRetry || a.at >= (prog.retryAt || 0))) a.correct ? s.r++ : s.w++;
      return s;
    },
    { r: 0, w: 0 }
  );

  // UC3 (#044): đầu màn hình gọn — ✕ về trang bài · "Lượt 2 · câu 4/9" · Chỉ nghe
  const header = (
    <header className="hkt-qbar-wrap">
      <div className="hkt-qbar">
        <Link to={lessonHome} className="hkt-qbar-x" aria-label="Thoát, về trang bài">
          <X size={22} />
        </Link>
        <div className="hkt-qbar-mid">
          <span className="hkt-qbar-t">
            {isRetry ? "Ôn câu sai" : part ? `Lượt ${part.no}` : `Bài ${lessonNo}`}
            {stage === "quiz" && ` · câu ${prog.current + 1}/${prog.queue.length}`}
          </span>
          <span className="hkt-qbar-s">
            Bài {lessonNo} · {part && !isRetry ? part.title?.vi : lessonData.title?.vi}
          </span>
        </div>
        {stage === "quiz" ? (
          <button
            type="button"
            className="hkt-switch hkt-switch--sm"
            role="switch"
            aria-checked={listenOnly}
            onClick={() => setListenOnly((v) => !v)}
            title="Thử thách: ẩn chữ câu hỏi và đáp án, chỉ nghe"
          >
            <Headphones size={16} />
            <span>Chỉ nghe</span>
          </button>
        ) : (
          <span />
        )}
      </div>
      {stage === "quiz" && (
        <div className="hkt-progress">
          <div className="hkt-progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={prog.queue.length} aria-valuenow={pos}>
            <span style={{ width: `${(pos / prog.queue.length) * 100}%` }} />
          </div>
          <span className="hkt-tally" aria-label={`${qStats.r} câu đúng, ${qStats.w} câu sai`}>
            <span className="is-right"><Check size={15} /> {qStats.r}</span>
            <span className="is-wrong"><X size={15} /> {qStats.w}</span>
          </span>
        </div>
      )}
    </header>
  );

  const helmet = (
    <Helmet>
      <title>{`${topicTitle} — Bài ${lessonNo}: ${lessonData.title?.vi || ""} (làm bài)`}</title>
      <meta
        name="description"
        content={`Học kiến thức "${topicTitle}" qua ${total} câu hỏi trắc nghiệm, trả lời bằng cách nghe và nói tiếng Anh.`}
      />
      <meta name="robots" content="noindex, follow" />
    </Helmet>
  );

  if (stage === "resume") {
    const st = part && !isRetry ? partStats(prog, part, questions) : null;
    return (
      <main className="hkt-page hkt-quizpage">
        {helmet}
        {header}
        <section className="hkt-panel hkt-resume">
          <h2>
            {st
              ? `Bạn đang làm Lượt ${part.no}: ${st.done}/${st.total} câu`
              : `Bạn đang ${isRetry ? "ôn câu sai" : "làm bài"}: câu ${prog.current + 1}/${prog.queue.length}`}
          </h2>
          <p className="hkt-muted">Máy đã lưu tiến độ trên trình duyệt này.</p>
          <div className="hkt-result-actions">
            <button type="button" className="hkt-btn hkt-btn--primary" onClick={() => setStage("quiz")}>
              <ArrowRight size={18} /> Làm tiếp từ câu {prog.current + 1}
            </button>
            <ConfirmButton question="Xoá kết quả cũ của cả bài và làm lại từ Lượt 1?" confirmLabel="Xoá và làm lại" onConfirm={restartAll}>
              <RotateCcw size={18} /> Làm lại từ đầu
            </ConfirmButton>
          </div>
        </section>
      </main>
    );
  }

  if (stage === "results") {
    const allDone = parts.every((pt) => partStats(prog, pt, questions).complete);
    if (part && !showFull) {
      const nextPart = parts.find((pt) => pt.no > part.no && !partStats(prog, pt, questions).complete) || parts.find((pt) => !partStats(prog, pt, questions).complete);
      return (
        <main className="hkt-page hkt-quizpage">
          {helmet}
          {header}
          <PartDone
            part={part}
            stats={partStats(prog, part, questions)}
            lang={lang}
            isRetry={isRetry}
            nextPart={nextPart && nextPart.no !== part.no ? nextPart : null}
            allDone={allDone}
            onNext={() => goPart(nextPart)}
            onRetryWrong={() => retryWrong(true)}
            onFull={() => setShowFull(true)}
            lessonHome={lessonHome}
          />
        </main>
      );
    }
    return (
      <main className="hkt-page hkt-quizpage">
        {helmet}
        {header}
        <section className="hkt-panel">
          <h2 className="hkt-results-title">{isRetry && !part ? "Xong phần làm lại câu sai" : allDone ? "Bạn đã làm xong cả bài" : "Kết quả đến lúc này"}</h2>
          <Results
            questions={questions}
            progress={prog}
            quizPath={null}
            backTo={lessonHome}
            onRetryWrong={() => retryWrong(false)}
            onRestart={restartAll}
            onContinue={prog.done < total ? continueUnanswered : null}
          />
        </section>
      </main>
    );
  }

  // ---------- Màn hình làm bài ----------
  const matchedKey = match?.status === "match" ? match.key : null;
  const revealText = !listenOnly || !!graded;
  const busy = recording;

  return (
    <main className="hkt-page hkt-quizpage">
      {helmet}
      {header}

      {!speechSupported && (
        <p className="hkt-notice">
          Trình duyệt này chưa nhận được giọng nói, nên bạn trả lời bằng cách <strong>gõ</strong>. Muốn nói, hãy mở
          bằng Chrome hoặc Edge trên máy tính.
        </p>
      )}

      <section className="hkt-stage" aria-label={`Câu ${qIndex + 1}`}>
        {/* ① Câu hỏi: có chữ (trừ khi bật Chỉ nghe) + dòng tiếng Việt (UXC-Q3, Q4) */}
        <div className="hkt-ask">
          <ListenButton id="q" text={q.question.text} label="Nghe câu hỏi" playing={playing} onPlay={play} blocked={busy} />
          {revealText ? (
            <>
              <p className="hkt-q-text" lang="en">{q.question.text}</p>
              {q.question.vi && lang !== "en" && <p className="hkt-q-vi">{q.question.vi}</p>}
            </>
          ) : (
            <p className="hkt-hint">Chế độ chỉ nghe: nghe câu hỏi và bốn đáp án rồi trả lời.</p>
          )}
        </div>

        {/* ② Bốn đáp án */}
        <ol className="hkt-options" aria-label="Các đáp án">
          {q.options.map((o) => {
            const variants = o.variants || [];
            const ways = variants.length + 1;
            const isOpen = openVariants === o.key && revealText;
            const cls = [
              "hkt-option",
              playing === `o-${o.key}` ? "is-playing" : "",
              !graded && matchedKey === o.key ? "is-match" : "",
              graded && o.key === q.answer ? "is-right" : "",
              graded && !graded.correct && o.key === graded.chosen ? "is-wrong" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <li key={o.key} className={cls}>
                <span className="hkt-letter" aria-hidden="true">
                  {o.key}
                </span>
                <div className="hkt-option-body">
                  {revealText ? (
                    <p className="hkt-option-text" lang="en">
                      {o.text}
                    </p>
                  ) : (
                    <p className="hkt-option-hidden">Đáp án {o.key}</p>
                  )}
                  {graded && o.key === q.answer && <span className="hkt-opt-tag is-right">Đáp án đúng</span>}
                  {graded && !graded.correct && o.key === graded.chosen && <span className="hkt-opt-tag is-wrong">Bạn chọn</span>}
                  {ways > 1 &&
                    (revealText ? (
                      <button type="button" className="hkt-ways" aria-expanded={isOpen} onClick={() => setOpenVariants(isOpen ? null : o.key)}>
                        +{variants.length} cách nói
                      </button>
                    ) : (
                      <span className="hkt-ways hkt-ways--static">{ways} cách nói</span>
                    ))}
                  {isOpen && (
                    <ul className="hkt-variants">
                      {variants.map((v, i) => (
                        <li key={i}>
                          <span lang="en">{v}</span>
                          <ListenButton id={`v-${o.key}-${i}`} text={v} label="Nghe" playing={playing} onPlay={play} blocked={busy} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <ListenButton id={`o-${o.key}`} text={o.text} label={`Nghe ${o.key}`} playing={playing} onPlay={play} blocked={busy} />
              </li>
            );
          })}
        </ol>

        {/* ③ Trả lời: mic là nút chính, Gõ là lựa chọn phụ; sau khi chấm: "Điều bạn vừa biết" */}
        <div className={`hkt-controls${graded ? " is-result" : ""}`} ref={ctlRef}>
          {!graded && (
            <>
              {/* #045 — Luôn có cả hai cách: mic (nếu trình duyệt nghe được) VÀ ô gõ ngay bên dưới.
                  Không đọc được / không muốn nói / micro lỗi → gõ luôn, không phải chuyển chế độ. */}
              {speechSupported && (
                <div className="hkt-speak">
                  <button
                    type="button"
                    className={`hkt-mic${recording ? " is-recording" : ""}`}
                    onClick={recording ? stopRec : () => startRec(0)}
                    disabled={playing !== null}
                    aria-pressed={recording}
                  >
                    {recording ? <Square size={20} /> : <Mic size={24} />}
                    <span>{recording ? "Đang nghe… bấm để dừng" : heard?.via === "speak" ? "Nói lại" : "Bấm và nói đáp án"}</span>
                    {recording && <Wave />}
                  </button>
                  <p className="hkt-hint-sm">
                    Nói nội dung đáp án bằng tiếng Anh, máy tự dừng khi bạn ngừng nói.
                    {MIC_DEBUG && micMs && <span className="hkt-micdebug"> · micro sẵn sàng sau {micMs}</span>}
                  </p>
                </div>
              )}
              <form
                className={`hkt-type${speechSupported ? " hkt-type--alt" : ""}`}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (matchedKey && heard?.text === typed.trim()) confirm();
                  else if (typed.trim()) submit(typed.trim(), "type");
                }}
              >
                <label htmlFor="hkt-typed" className={speechSupported ? "hkt-type-label" : "hkt-sr"}>
                  <Keyboard size={14} aria-hidden="true" /> {speechSupported ? "Hoặc gõ đáp án" : "Gõ đáp án bằng tiếng Anh"}
                </label>
                <div className="hkt-type-row">
                  <input
                    id="hkt-typed"
                    ref={inputRef}
                    type="text"
                    lang="en"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                    enterKeyHint="done"
                    placeholder="Gõ nội dung đáp án bằng tiếng Anh…"
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    disabled={recording}
                  />
                  <button type="submit" className="hkt-btn" disabled={!typed.trim() || recording}>
                    Kiểm tra
                  </button>
                </div>
              </form>

              {(recording || speechErr || heard) && (
                <div className="hkt-answer-box" aria-live="polite">
                  {recording ? (
                    <p className="hkt-heard is-live" lang="en">{interim || "…"}</p>
                  ) : speechErr ? (
                    <p className="hkt-answer-msg is-warn">{speechErr}</p>
                  ) : (
                    <>
                      <p className="hkt-heard-label">{heard.via === "speak" ? "Bạn nói:" : "Bạn gõ:"}</p>
                      <p className="hkt-heard" lang="en">“{heard.text}”</p>
                      {match.status === "match" && (
                        <p className="hkt-answer-msg is-ok">
                          Khớp đáp án <span className="hkt-mark">{match.key}</span>. Bấm <strong>Đồng ý</strong> để chấm, hoặc{" "}
                          {heard.via === "speak" ? "nói lại" : "gõ lại"} nếu chưa đúng ý.
                        </p>
                      )}
                      {match.status === "none" && (
                        <p className="hkt-answer-msg is-warn">
                          Chưa khớp đáp án nào. Nghe lại các đáp án rồi {heard.via === "speak" ? "nói lại rõ hơn" : "gõ lại"}.
                        </p>
                      )}
                      {match.status === "ambiguous" && (
                        <p className="hkt-answer-msg is-warn">
                          Câu này giống nhiều đáp án cùng lúc. Hãy {heard.via === "speak" ? "nói" : "gõ"} đầy đủ hơn.
                        </p>
                      )}
                      {attempts > 1 && <p className="hkt-attempts">Lần thử: {attempts}</p>}
                    </>
                  )}
                </div>
              )}

              {heard && !recording && (
                <div className="hkt-actions">
                  <button type="button" className="hkt-btn hkt-btn--primary" onClick={confirm} disabled={!matchedKey || busy}>
                    <Check size={18} /> Đồng ý{matchedKey ? ` chọn ${matchedKey}` : ""}
                  </button>
                </div>
              )}
            </>
          )}

          {graded && (
            <>
              <p className={`hkt-verdict ${graded.correct ? "is-right" : "is-wrong"}`} role="status">
                {graded.correct ? <Check size={22} /> : <X size={22} />}
                {graded.correct
                  ? `Đúng rồi! Đáp án ${q.answer}.`
                  : `Chưa đúng. Bạn chọn ${graded.chosen}, đáp án đúng là ${q.answer}.`}
              </p>
              <Explanation q={q} lang={lang} setLang={setLang} readMore={`${lessonHome}#bai-doc`} />
              <div className="hkt-actions">
                <button type="button" ref={nextRef} className="hkt-btn hkt-btn--primary hkt-btn--wide" onClick={goNext}>
                  {prog.current + 1 >= prog.queue.length ? (part && !isRetry ? "Xong lượt" : "Xem kết quả") : "Câu tiếp"} <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
