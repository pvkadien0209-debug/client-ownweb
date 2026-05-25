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
   • Mic KHÔNG tự bật — user bấm "Bắt đầu nghe" mới chạy
   • Một khi đã bật: mic ở liên tục, KHÔNG auto-restart
   • check() đọc transcriptRef → resetTranscript → xử lý async
   • Chỉ 2 cách tắt mic: nút "Dừng mic" hoặc nút "Thoát"
══════════════════════════════════════════════════════════════════════ */

/* ── Debug helpers ──────────────────────────────────────────────────── */
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

/* ════════════════════════════════════════════════════════════════════ */

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

  // transcriptRef: luôn sync với transcript, check() đọc từ đây
  const transcriptRef = useRef("");
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // micEnabled: ý định user (true = đang muốn nghe)
  const [micEnabled, setMicEnabled] = useState(false); // ← mặc định OFF
  const [isExiting, setIsExiting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [logs, setLogs] = useState([]);

  const micEnabledRef = useRef(false); // sync với micEnabled
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

  /* ── startListening — hàm gọi API ──────────────────────────────── */
  const startListening = useCallback(() => {
    SpeechRecognition.startListening({
      continuous: true,
      language: Lang || "en-US",
    });
    log("🎙️ startListening() được gọi", "ok");
  }, [Lang, log]);

  /* ══════════════════════════════════════════════════════════════════
     MOUNT — chỉ reset state, KHÔNG bật mic
  ══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!getSTTDictaphone) return;
    log("▶ Component mount — chờ user bấm Bắt đầu nghe", "info");
    micEnabledRef.current = false;
    setMicEnabled(false);
    setIsExiting(false);
    resetTranscript();
    transcriptRef.current = "";

    return () => {
      micEnabledRef.current = false;
      SpeechRecognition.stopListening();
      log("◀ unmount — mic dừng", "warn");
    };
  }, [getSTTDictaphone]); // eslint-disable-line

  /* ══════════════════════════════════════════════════════════════════
     THEO DÕI listening — CHỈ LOG, không auto-restart
  ══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (listening) {
      log("✅ listening = TRUE", "ok");
    } else {
      log("⚠️ listening = FALSE — mic đã dừng", "warn");
      // Không auto-restart — user phải bấm lại thủ công nếu muốn
    }
  }, [listening]); // eslint-disable-line

  /* ── Log transcript mới (debug) ─────────────────────────────────── */
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

  /* ══════════════════════════════════════════════════════════════════
     BẮT ĐẦU NGHE — user bấm thủ công
  ══════════════════════════════════════════════════════════════════ */
  const handleStartMic = () => {
    log("▶ User bấm Bắt đầu nghe", "ok");
    micEnabledRef.current = true;
    setMicEnabled(true);
    resetTranscript();
    transcriptRef.current = "";
    startListening();
  };

  /* ══════════════════════════════════════════════════════════════════
     DỪNG MIC — user bấm thủ công
  ══════════════════════════════════════════════════════════════════ */
  const handleStopMic = () => {
    log("⏹ User bấm Dừng mic", "warn");
    micEnabledRef.current = false;
    setMicEnabled(false);
    SpeechRecognition.stopListening();
  };

  /* ── hardExit ───────────────────────────────────────────────────── */
  const hardExit = () => {
    log("🚪 hardExit", "warn");
    micEnabledRef.current = false;
    SpeechRecognition.stopListening();
    setIsExiting(true);
    setTimeout(() => setGetSTTDictaphone(false), 290);
  };

  /* ══════════════════════════════════════════════════════════════════
     CHECK
     ① capture từ ref  →  ② resetTranscript ngay  →  ③ xử lý async
  ══════════════════════════════════════════════════════════════════ */
  function check() {
    // ── Đồng thời: capture + stop + reset ──────────────────────────
    const input = transcriptRef.current.trim();
    SpeechRecognition.stopListening(); // ← cùng tick với capture
    resetTranscript();
    transcriptRef.current = "";
    micEnabledRef.current = false;
    setMicEnabled(false);
    log("⏹ stopListening + reset — cùng lúc bấm Check", "warn");

    if (!input) {
      log("check() — input rỗng", "warn");
      return;
    }

    log(`🔍 check: "${input}"`, "check");
    setMessage(input);

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
      if (answer)
        ReadMessage(
          ObjVoices,
          answer,
          GENDER,
          audio?.id ? [{ id: audio.id }] : undefined,
        );

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
    }, 0);
  }

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  const hasTranscript = transcript.trim().length > 0;

  // Trạng thái hiển thị
  const micStatus = !micEnabled
    ? { icon: "🔇", label: "Chưa bắt đầu nghe", cls: "dtph-mic-off" }
    : listening
      ? { icon: "🎙️", label: "Đang nghe…", cls: "dtph-mic-on" }
      : { icon: "⏳", label: "Đang kết nối mic…", cls: "dtph-mic-wait" };

  return (
    <div className={`dtph-wrap ${isExiting ? "dtph-exiting" : ""}`}>
      {/* ── Transcript box ── */}
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

      {/* ── Nút chính ── */}
      <div className="dtph-actions">
        {/* XÓA */}
        <button
          className="dtph-btn dtph-btn-clear"
          onClick={() => {
            resetTranscript();
            transcriptRef.current = "";
          }}
          title="Xóa text"
        >
          <i className="bi bi-trash3" />
          <span className="dtph-btn-label">Xóa</span>
        </button>

        {/* CHECK */}
        <button
          className="dtph-btn dtph-btn-submit"
          disabled={!hasTranscript}
          onClick={check}
          title="Check"
        >
          <i className="bi bi-check2-circle" />
          <span className="dtph-btn-label">Check</span>
        </button>

        {/* BẮT ĐẦU / DỪNG mic — 2 nút riêng biệt, rõ ràng */}
        {!micEnabled ? (
          <button
            className="dtph-btn dtph-btn-mic-start"
            onClick={handleStartMic}
            title="Bắt đầu nghe"
          >
            <i className="bi bi-mic-fill" />
            <span className="dtph-btn-label">Bắt đầu</span>
          </button>
        ) : (
          <button
            className="dtph-btn dtph-btn-mic-stop"
            onClick={handleStopMic}
            title="Dừng mic"
          >
            <i className="bi bi-stop-circle" />
            <span className="dtph-btn-label">Dừng mic</span>
          </button>
        )}

        {/* THOÁT */}
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
        {micEnabled ? (
          <span>Nói → Check → nói tiếp (mic luôn bật)</span>
        ) : (
          <span>
            Bấm <strong>Bắt đầu</strong> để bật mic
          </span>
        )}
        <span className="dtph-info-sep">·</span>
        <span>≥ 50% khớp</span>
      </div>

      {/* ══ DEBUG PANEL ════════════════════════════════════════════ */}
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
              {listening ? "LISTENING" : "STOPPED"}
            </span>
            <span
              style={{
                ...S.badge,
                background: micEnabled ? "#4fc3f7" : "#9e9e9e",
              }}
            >
              {micEnabled ? "mic ON" : "mic OFF"}
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
