import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import stringSimilarity from "string-similarity";
import ReadMessage from "./ReadMessage_2024";

/* ══════════════════════════════════════════════════════════════════════
   NGUYÊN TẮC
   • Mic LUÔN chạy — không bao giờ stop/start trừ khi user bấm Thoát
   • check() đọc text từ REF (không dùng transcript state trực tiếp)
     → reset ngay lập tức → xử lý text đã capture
     → tránh stale-state, tránh lag trên mobile
   • transcript state chỉ dùng để HIỂN THỊ lên màn hình
══════════════════════════════════════════════════════════════════════ */

/* ── Debug helpers ─────────────────────────────────────────────────── */
const MAX_LOGS = 50;
const ts = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(d.getMilliseconds()).padStart(3, "0")}`;
};
const LOG_COLOR = {
  info: "#4fc3f7",
  ok: "#81c784",
  warn: "#ffb74d",
  error: "#e57373",
  check: "#ce93d8",
  restart: "#fff176",
};

/* ══════════════════════════════════════════════════════════════════════ */

const Dictaphone = ({
  getSTTDictaphone,
  setGetSTTDictaphone,
  CMDlist,
  GENDER,
  setScore,
  addElementIfNotExist,
  ObjVoices,
  Lang,
  regRate_01,
  setStartSTT,
  setMessage,
}) => {
  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  /* ── transcriptRef: luôn là giá trị MỚI NHẤT của transcript ────────
     check() đọc ref này thay vì state → không bao giờ stale         */
  const transcriptRef = useRef("");
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const [micEnabled, setMicEnabled] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [logs, setLogs] = useState([]);

  const micEnabledRef = useRef(true);
  const restartRef = useRef(null);
  const logEndRef = useRef(null);

  /* ── Logger ─────────────────────────────────────────────────────── */
  const log = useCallback((msg, type = "info") => {
    setLogs((prev) => {
      const next = [
        ...prev,
        { t: ts(), msg, type, id: Date.now() + Math.random() },
      ];
      return next.length > MAX_LOGS ? next.slice(-MAX_LOGS) : next;
    });
  }, []);

  /* ── Pre-normalize CMDlist ──────────────────────────────────────── */
  const normalizedCMD = useMemo(() => {
    return (CMDlist || []).map((qObj) => ({
      ref: qObj,
      nqs: (qObj.qs || []).map((q) => ({
        norm: normalizeStr(q),
        len: q.length,
      })),
    }));
  }, [CMDlist]);

  const THRESHOLD = Math.max(
    typeof regRate_01 === "number" ? regRate_01 : 0.5,
    0.5,
  );

  /* ══════════════════════════════════════════════════════════════════
     startListening — hàm duy nhất gọi API
  ══════════════════════════════════════════════════════════════════ */
  const startListening = useCallback(() => {
    SpeechRecognition.startListening({
      continuous: true,
      language: Lang || "en-US",
    });
  }, [Lang]);

  /* ══════════════════════════════════════════════════════════════════
     MOUNT: bật mic 1 lần
  ══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!getSTTDictaphone) return;
    log("▶ mount — bật mic", "info");
    micEnabledRef.current = true;
    setMicEnabled(true);
    setIsExiting(false);
    resetTranscript();
    transcriptRef.current = "";

    const t = setTimeout(() => {
      log("startListening() — delay 300ms xong", "info");
      startListening();
    }, 300);

    return () => {
      clearTimeout(t);
      clearRestart();
      SpeechRecognition.stopListening();
      log("◀ unmount — mic dừng", "warn");
    };
  }, [getSTTDictaphone]); // eslint-disable-line

  /* ══════════════════════════════════════════════════════════════════
     AUTO-RESTART khi mobile tự ngắt (listening → false)
  ══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (listening) {
      log("✅ listening = TRUE", "ok");
      return;
    }
    log("⚠️ listening = FALSE", "warn");
    if (micEnabledRef.current && !isExiting) {
      log("🔄 auto-restart sau 300ms…", "restart");
      restartRef.current = setTimeout(() => {
        if (micEnabledRef.current) {
          log("🔄 startListening() lại", "restart");
          startListening();
        }
      }, 300);
    }
    return () => clearRestart();
  }, [listening]); // eslint-disable-line

  /* ══════════════════════════════════════════════════════════════════
     LOG transcript mới (chỉ debug)
  ══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (transcript.trim()) log(`🗣 "${transcript.trim()}"`, "info");
  }, [transcript]); // eslint-disable-line

  /* ── Auto-scroll debug ──────────────────────────────────────────── */
  useEffect(() => {
    if (showDebug) logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, showDebug]);

  /* ── Soft-exit event ────────────────────────────────────────────── */
  useEffect(() => {
    const h = () => {
      log("dtph-soft-exit", "warn");
      hardExit();
    };
    window.addEventListener("dtph-soft-exit", h);
    return () => window.removeEventListener("dtph-soft-exit", h);
  }, []); // eslint-disable-line

  /* ── clearRestart ───────────────────────────────────────────────── */
  const clearRestart = () => {
    if (restartRef.current) {
      clearTimeout(restartRef.current);
      restartRef.current = null;
    }
  };

  /* ── Toggle mic ─────────────────────────────────────────────────── */
  const toggleMic = () => {
    if (micEnabled) {
      log("🔇 user TẮT mic", "warn");
      micEnabledRef.current = false;
      setMicEnabled(false);
      clearRestart();
      SpeechRecognition.stopListening();
    } else {
      log("🎙️ user BẬT mic", "ok");
      micEnabledRef.current = true;
      setMicEnabled(true);
      resetTranscript();
      transcriptRef.current = "";
      startListening();
    }
  };

  /* ── hardExit ───────────────────────────────────────────────────── */
  const hardExit = () => {
    log("🚪 hardExit", "warn");
    micEnabledRef.current = false;
    clearRestart();
    SpeechRecognition.stopListening();
    setIsExiting(true);
    setTimeout(() => setGetSTTDictaphone(false), 290);
  };

  /* ══════════════════════════════════════════════════════════════════
     CHECK — đọc REF (không dùng state transcript)
     Thứ tự:
       1. Capture text từ ref  ← lấy ngay, không chờ render
       2. resetTranscript()    ← xóa ngay, mic tiếp tục nghe
       3. Xử lý text đã capture (findBest, ReadMessage, action…)
  ══════════════════════════════════════════════════════════════════ */
  function check() {
    // ① Capture & reset NGAY — mic không bị gián đoạn
    const input = transcriptRef.current.trim();
    resetTranscript();
    transcriptRef.current = "";

    if (!input) {
      log("check() — input rỗng, bỏ qua", "warn");
      return;
    }

    log(`🔍 check: "${input}"`, "check");
    setMessage(input);

    // ② Xử lý bất đồng bộ để không block render
    setTimeout(() => {
      const objTR = findBest(input, normalizedCMD, THRESHOLD);

      if (!objTR) {
        log(`❌ không khớp (threshold=${THRESHOLD})`, "error");
        ReadMessage(
          ObjVoices,
          "Sorry, what did you say?",
          GENDER,
          GENDER === 1 ? [{ id: "sorryFemale" }] : [{ id: "sorryMale" }],
        );
        return;
      }

      const awArr = objTR.aw || [];
      const aw01Arr = objTR.aw01 || [];
      const idx = Math.floor(Math.random() * (awArr.length || 1));
      const answer = awArr[idx];
      const audio = aw01Arr[idx];

      log(`✅ khớp → "${answer}" | ${audio?.id || "TTS"}`, "ok");

      if (answer) {
        ReadMessage(
          ObjVoices,
          answer,
          GENDER,
          audio?.id ? [{ id: audio.id }] : undefined,
        );
      }

      if (objTR.action?.[0]) {
        if (objTR.action[0] === "WRONG") {
          log("⚡ WRONG action", "warn");
          const btn = document.getElementById("btnBoQua");
          if (btn) btn.click();
          else setScore((S) => S - 2);
        } else {
          log(`⚡ addElement(${objTR.action[0]})`, "ok");
          addElementIfNotExist(objTR.action[0]);
        }
      }
    }, 0); // setTimeout 0 — nhường main thread, tránh jank
  }

  /* ══════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════ */
  const hasTranscript = transcript.trim().length > 0;

  const micStatus = !micEnabled
    ? { icon: "🔇", label: "Mic đang tắt", cls: "dtph-mic-off" }
    : listening
      ? { icon: "🎙️", label: "Đang nghe…", cls: "dtph-mic-on" }
      : { icon: "⏳", label: "Đang kết nối…", cls: "dtph-mic-wait" };

  return (
    <div className={`dtph-wrap ${isExiting ? "dtph-exiting" : ""}`}>
      {/* ── Transcript hiển thị (chỉ để đọc, không dùng để check) ── */}
      <div className="dtph-transcript-box">
        <div className={`dtph-row-label ${micStatus.cls}`}>
          <span className="dtph-badge">{micStatus.icon}</span>
          <span className="dtph-transcript-text" id="dtph-display-text">
            {transcript || (
              <span className="dtph-placeholder">{micStatus.label}</span>
            )}
          </span>
        </div>
      </div>

      {/* ── Nút ── */}
      <div className="dtph-actions">
        <button
          className="dtph-btn dtph-btn-clear"
          onClick={() => {
            resetTranscript();
            transcriptRef.current = "";
          }}
          title="Xóa"
        >
          <i className="bi bi-trash3" />
          <span className="dtph-btn-label">Xóa</span>
        </button>

        {/* Check: disabled khi rỗng, đọc từ ref bên trong */}
        <button
          className="dtph-btn dtph-btn-submit"
          disabled={!hasTranscript}
          onClick={check}
          title="Check"
        >
          <i className="bi bi-check2-circle" />
          <span className="dtph-btn-label">Check</span>
        </button>

        <button
          className={`dtph-btn ${micEnabled ? "dtph-btn-mic-on" : "dtph-btn-mic-off"}`}
          onClick={toggleMic}
          title={micEnabled ? "Tắt mic" : "Bật mic"}
        >
          <i className={`bi ${micEnabled ? "bi-mic" : "bi-mic-mute"}`} />
          <span className="dtph-btn-label">
            {micEnabled ? "Mic" : "Bật mic"}
          </span>
        </button>

        <button
          className="dtph-btn dtph-btn-exit"
          onClick={hardExit}
          title="Thoát"
        >
          <i className="bi bi-x-circle" />
          <span className="dtph-btn-label">Thoát</span>
        </button>
      </div>

      <div className="dtph-info-strip">
        <span>Nói → Check → nói tiếp</span>
        <span className="dtph-info-sep">·</span>
        <span>≥ 50% khớp</span>
      </div>

      {/* ══ DEBUG PANEL ══════════════════════════════════════════════ */}
      <div style={S.row}>
        <button style={S.btnDebug} onClick={() => setShowDebug((v) => !v)}>
          🐛 {showDebug ? "Ẩn" : "Debug"} ({logs.length})
        </button>
        {showDebug && (
          <button style={S.btnClear} onClick={() => setLogs([])}>
            🗑 Clear
          </button>
        )}
        {showDebug && (
          <span style={S.badgeRow}>
            <span
              style={{
                ...S.badge,
                background: listening ? "#81c784" : "#e57373",
              }}
            >
              {listening ? "MIC ON" : "MIC OFF"}
            </span>
            <span
              style={{
                ...S.badge,
                background: micEnabled ? "#4fc3f7" : "#9e9e9e",
              }}
            >
              {micEnabled ? "enabled" : "disabled"}
            </span>
          </span>
        )}
      </div>

      {showDebug && (
        <div style={S.panel}>
          {logs.length === 0 && <div style={S.empty}>Chưa có log…</div>}
          {logs.map((e) => (
            <div key={e.id} style={S.logRow}>
              <span style={S.time}>{e.t}</span>
              <span style={{ ...S.msg, color: LOG_COLOR[e.type] || "#fff" }}>
                {e.msg}
              </span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}

      <button
        id="stopListenBTN"
        style={{ display: "none" }}
        onClick={hardExit}
      />
    </div>
  );
};

export default Dictaphone;

/* ══════════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════════ */
function normalizeStr(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,?!]/g, "")
    .toLowerCase();
}

function findBest(statement, normalizedCMD, threshold) {
  if (!statement) return null;
  const norm = normalizeStr(statement);
  const normLen = norm.length;
  if (!normLen) return null;

  let maxSim = -1,
    best = null;

  outer: for (const { ref, nqs } of normalizedCMD) {
    for (const { norm: q, len: qLen } of nqs) {
      const minL = Math.min(normLen, qLen);
      const maxL = Math.max(normLen, qLen);
      if (maxL === 0 || minL / maxL < threshold * 0.6) continue;
      const sim = stringSimilarity.compareTwoStrings(norm, q);
      if (sim >= threshold && sim > maxSim) {
        maxSim = sim;
        best = ref;
        if (sim === 1) break outer;
      }
    }
  }
  return best;
}

/* ── Debug styles ─────────────────────────────────────────────────── */
const S = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  btnDebug: {
    background: "#37474f",
    color: "#eceff1",
    border: "1px solid #546e7a",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
  },
  btnClear: {
    background: "#b71c1c",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
  },
  badgeRow: { display: "flex", gap: 4 },
  badge: {
    borderRadius: 4,
    padding: "2px 7px",
    fontSize: 11,
    fontWeight: 700,
    color: "#111",
  },
  panel: {
    background: "#1a1a2e",
    border: "1px solid #37474f",
    borderRadius: 8,
    padding: "8px 6px",
    marginTop: 4,
    maxHeight: 260,
    overflowY: "auto",
    fontFamily: "monospace",
  },
  empty: { color: "#546e7a", fontSize: 12, textAlign: "center", padding: 8 },
  logRow: {
    display: "flex",
    gap: 6,
    marginBottom: 3,
    lineHeight: 1.35,
    fontSize: 11.5,
    flexWrap: "wrap",
  },
  time: { color: "#546e7a", flexShrink: 0 },
  msg: { wordBreak: "break-word", flex: 1 },
};
