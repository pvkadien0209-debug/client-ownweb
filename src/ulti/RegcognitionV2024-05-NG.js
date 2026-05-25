import React, { useEffect, useState, useMemo, useCallback } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import stringSimilarity from "string-similarity";
import ReadMessage from "./ReadMessage_2024";
import { json } from "react-router-dom";

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

  const [micEnabled, setMicEnabled] = useState(false);
  // isClosing: CHỈ true khi bấm Thoát — check() KHÔNG bao giờ set true
  const [isClosing, setIsClosing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [logs, setLogs] = useState([]);

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

  /* ── Mount: reset, KHÔNG tự bật mic ────────────────────────────── */
  useEffect(() => {
    if (!getSTTDictaphone) return;
    log("▶ mount — chờ bấm Bắt đầu", "info");
    setMicEnabled(false);
    resetTranscript();
    return () => {
      SpeechRecognition.stopListening();
      log("◀ unmount", "warn");
    };
  }, [getSTTDictaphone]); // eslint-disable-line

  /* ── Log listening state ────────────────────────────────────────── */
  useEffect(() => {
    log(
      listening ? "✅ listening = TRUE" : "⚠️ listening = FALSE",
      listening ? "ok" : "warn",
    );
  }, [listening]); // eslint-disable-line

  /* ── Log transcript ─────────────────────────────────────────────── */
  // useEffect(() => {
  //   if (transcript.trim()) log(`🗣 "${transcript.trim()}"`, "info");
  // }, [transcript]); // eslint-disable-line

  /* ── Soft-exit ──────────────────────────────────────────────────── */
  useEffect(() => {
    const h = () => {
      log("dtph-soft-exit", "warn");
      hardExit();
    };
    window.addEventListener("dtph-soft-exit", h);
    return () => window.removeEventListener("dtph-soft-exit", h);
  }, []); // eslint-disable-line

  /* ── startListening ─────────────────────────────────────────────── */
  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: Lang || "en-US",
    });
    log("🎙️ startListening()", "ok");
  };

  /* ── BẮT ĐẦU ───────────────────────────────────────────────────── */
  const handleStartMic = () => {
    log("▶ Bắt đầu nghe", "ok");
    resetTranscript();
    setMicEnabled(true);
    startListening();
  };

  /* ── DỪNG (không check) ─────────────────────────────────────────── */
  const handleStopMic = () => {
    log("⏹ Dừng mic", "warn");
    SpeechRecognition.stopListening();
    setMicEnabled(false);
  };

  /* ── Thoát — DUY NHẤT nơi ẩn div ───────────────────────────────── */
  const hardExit = () => {
    if (isClosing) return; // tránh gọi 2 lần
    setIsClosing(true);
    log("🚪 hardExit → ẩn div", "warn");
    SpeechRecognition.stopListening();
    setGetSTTDictaphone(false); // ← CHỈ dòng này ẩn div
  };

  /* ══════════════════════════════════════════════════════════════════
     CHECK — nhận transcript trực tiếp, gọi resetTranscript ngay
  ══════════════════════════════════════════════════════════════════ */
  const handleCheckAndStop = () => {
    // KHÔNG gọi hardExit, KHÔNG setGetSTTDictaphone → div giữ nguyên
    SpeechRecognition.stopListening();
    const input = document.getElementById("dtphTranscript")?.textContent || "";
    resetTranscript();
    setMicEnabled(false);
    log("⏹ stop + reset — div GIỮ NGUYÊN", "warn");
    check("là sao ta");
  };

  function check(input) {
    // if (!input) {
    //   log("check() — rỗng", "warn");
    //   return;
    // }
    alert(input, JSON.stringify(normalizedCMD));
    // log(`🔍 "${input}"`, "check");
    // setMessage(input);

    // const objTR = findBest(input, normalizedCMD, THRESHOLD);

    // if (!objTR) {
    //   log(`❌ không khớp`, "error");
    //   ReadMessage(
    //     ObjVoices,
    //     "Sorry, what did you say?",
    //     GENDER,
    //     GENDER === 1 ? [{ id: "sorryFemale" }] : [{ id: "sorryMale" }],
    //   );
    //   return;
    // }

    // const awArr = objTR.aw || [];
    // const aw01Arr = objTR.aw01 || [];
    // const idx = Math.floor(Math.random() * (awArr.length || 1));
    // const answer = awArr[idx];
    // const audio = aw01Arr[idx];

    // log(`✅ "${answer}" | ${audio?.id || "TTS"}`, "ok");
    // if (answer)
    //   ReadMessage(
    //     ObjVoices,
    //     answer,
    //     GENDER,
    //     audio?.id ? [{ id: audio.id }] : undefined,
    //   );

    // if (objTR.action?.[0]) {
    //   if (objTR.action[0] === "WRONG") {
    //     log("⚡ WRONG", "warn");
    //     const btn = document.getElementById("btnBoQua");
    //     if (btn) btn.click();
    //     else setScore((S) => S - 2);
    //   } else {
    //     log(`⚡ addElement(${objTR.action[0]})`, "ok");
    //     addElementIfNotExist(objTR.action[0]);
    //   }
    // }
  }

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  const hasTranscript = transcript.trim().length > 0;

  const micStatus = !micEnabled
    ? { icon: "🔇", label: "Chưa bắt đầu nghe", cls: "dtph-mic-off" }
    : listening
      ? { icon: "🎙️", label: "Đang nghe…", cls: "dtph-mic-on" }
      : { icon: "⏳", label: "Đang kết nối…", cls: "dtph-mic-wait" };

  return (
    <div className="dtph-wrap">
      {/* ── Transcript ── */}
      <div className="dtph-transcript-box">
        <div className={`dtph-row-label ${micStatus.cls}`}>
          <span className="dtph-badge">{micStatus.icon}</span>
          <span className="dtph-transcript-text" id="dtphTranscript">
            {<span id="dtphTranscript">{transcript}</span> || (
              <span className="dtph-placeholder">{micStatus.label}</span>
            )}
          </span>
        </div>
      </div>

      {/* ── Nút ── */}
      <div className="dtph-actions">
        {/* XÓA */}
        <button
          className="dtph-btn dtph-btn-clear"
          onClick={() => resetTranscript()}
          title="Xóa"
        >
          <i className="bi bi-trash3" />
          <span className="dtph-btn-label">Xóa</span>
        </button>

        {/* BẮT ĐẦU / CHECK+DỪNG */}
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
            disabled={!hasTranscript}
            onClick={handleCheckAndStop}
            title="Check & Dừng"
          >
            <i className="bi bi-stop-circle" />
            <span className="dtph-btn-label">Check</span>
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
          <span>
            Nói → bấm <strong>Check</strong> → bấm lại để tiếp tục
          </span>
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
