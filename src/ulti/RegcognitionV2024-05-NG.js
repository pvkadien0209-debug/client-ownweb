import React, { useEffect, useRef, useState, useMemo } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import stringSimilarity from "string-similarity";
import ReadMessage from "./ReadMessage_2024";

/* ════════════════════════════════════════════════════════════════════════
   NGUYÊN TẮC HOẠT ĐỘNG (mobile-safe)
   ─────────────────────────────────
   • Mic BẬT 1 lần khi component mount, KHÔNG bao giờ tắt giữa chừng
   • check() chỉ gọi resetTranscript() — KHÔNG đụng đến mic
   • Chuyển câu mới (CMDlist thay đổi) → KHÔNG đụng đến mic
   • Mobile tự ngắt sau silence → auto-restart ngầm (useEffect listening)
   • Duy nhất 2 cách tắt mic thật sự:
       1. User bấm nút "Tắt mic"  (toggle tạm)
       2. User bấm "Thoát"        (đóng hẳn component)
════════════════════════════════════════════════════════════════════════ */

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

  // micEnabled: ý định của user (bật/tắt chủ động)
  // listening:  trạng thái thật của Web Speech API
  const [micEnabled, setMicEnabled] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Ref để các useEffect không bị stale closure
  const micEnabledRef = useRef(true);
  const restartRef = useRef(null);

  /* ── Pre-normalize CMDlist ─────────────────────────────────────────── */
  const normalizedCMD = useMemo(() => {
    return (CMDlist || []).map((qObj) => ({
      ref: qObj,
      nqs: (qObj.qs || []).map((q) => ({
        norm: removeAccentsAndLowercase(q),
        len: q.length,
      })),
    }));
  }, [CMDlist]); // ← CMDlist thay đổi chỉ re-normalize, KHÔNG tắt mic

  const THRESHOLD = Math.max(
    typeof regRate_01 === "number" ? regRate_01 : 0.5,
    0.5,
  );

  /* ════════════════════════════════════════════════════════════════════
     1. MOUNT / UNMOUNT
     ─ Khi component hiện ra: bật mic 1 lần (delay 300ms cho mobile)
     ─ Khi unmount: dọn hết timer + tắt mic
  ════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!getSTTDictaphone) return;

    micEnabledRef.current = true;
    setMicEnabled(true);
    setIsExiting(false);
    resetTranscript();

    const t = setTimeout(() => startListening(), 300);

    return () => {
      clearTimeout(t);
      clearRestart();
      SpeechRecognition.stopListening();
    };
  }, [getSTTDictaphone]); // eslint-disable-line

  /* ════════════════════════════════════════════════════════════════════
     2. AUTO-RESTART — mobile tự ngắt sau silence
     ─ Chỉ restart khi: mic đang tắt (listening=false) + user chưa tắt
       chủ động (micEnabled=true) + component chưa đóng (!isExiting)
  ════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!listening && micEnabledRef.current && !isExiting) {
      restartRef.current = setTimeout(() => {
        if (micEnabledRef.current) startListening();
      }, 300);
    }
    return () => clearRestart();
  }, [listening]); // eslint-disable-line

  /* ════════════════════════════════════════════════════════════════════
     3. SOFT-EXIT từ bên ngoài (event dtph-soft-exit)
  ════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const handler = () => hardExit();
    window.addEventListener("dtph-soft-exit", handler);
    return () => window.removeEventListener("dtph-soft-exit", handler);
  }, []); // eslint-disable-line

  /* ── Internal helpers ─────────────────────────────────────────────── */
  const clearRestart = () => {
    if (restartRef.current) {
      clearTimeout(restartRef.current);
      restartRef.current = null;
    }
  };

  const startListening = () =>
    SpeechRecognition.startListening({
      continuous: true,
      language: Lang || "en-US",
    });

  /* ── Toggle mic (bật / tắt chủ động) ─────────────────────────────── */
  const toggleMic = () => {
    if (micEnabled) {
      // Tắt mic chủ động
      micEnabledRef.current = false;
      setMicEnabled(false);
      clearRestart();
      SpeechRecognition.stopListening();
    } else {
      // Bật lại mic
      micEnabledRef.current = true;
      setMicEnabled(true);
      resetTranscript();
      startListening();
    }
  };

  /* ── Thoát hẳn component ──────────────────────────────────────────── */
  const hardExit = () => {
    micEnabledRef.current = false;
    clearRestart();
    SpeechRecognition.stopListening();
    setIsExiting(true);
    setTimeout(() => setGetSTTDictaphone(false), 290);
  };

  /* ════════════════════════════════════════════════════════════════════
     4. CHECK — KHÔNG đụng đến mic, chỉ resetTranscript
  ════════════════════════════════════════════════════════════════════ */
  function check(RegInput) {
    const input = (RegInput || "").trim();
    if (!input) return;

    setMessage(input);
    const objTR = findBest(input, normalizedCMD, THRESHOLD);

    if (!objTR) {
      ReadMessage(
        ObjVoices,
        "Sorry, what did you say?",
        GENDER,
        GENDER === 1 ? [{ id: "sorryFemale" }] : [{ id: "sorryMale" }],
      );
    } else {
      const awArr = objTR.aw || [];
      const aw01Arr = objTR.aw01 || [];
      const idx = Math.floor(Math.random() * (awArr.length || 1));
      const answer = awArr[idx];
      const audio = aw01Arr[idx];

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
          const btn = document.getElementById("btnBoQua");
          if (btn) btn.click();
          else setScore((S) => S - 2);
        } else {
          addElementIfNotExist(objTR.action[0]);
        }
      }
    }

    // ✅ Chỉ xóa text — mic KHÔNG bị đụng
    resetTranscript();
  }

  /* ════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════ */
  const hasTranscript = transcript.trim().length > 0;

  // Trạng thái mic hiển thị cho user
  const micStatus = !micEnabled
    ? { icon: "🔇", label: "Mic đang tắt", css: "dtph-mic-off" }
    : listening
      ? { icon: "🎙️", label: "Đang nghe…", css: "dtph-mic-on" }
      : { icon: "⏳", label: "Đang kết nối…", css: "dtph-mic-wait" };

  return (
    <div className={`dtph-wrap ${isExiting ? "dtph-exiting" : ""}`}>
      {/* ── Trạng thái mic + transcript ── */}
      <div className="dtph-transcript-box">
        <div className={`dtph-row-label ${micStatus.css}`}>
          <span className="dtph-badge">{micStatus.icon}</span>
          <span className="dtph-transcript-text">
            {transcript || (
              <span className="dtph-placeholder">{micStatus.label}</span>
            )}
          </span>
        </div>
      </div>

      {/* ── Nút hành động ── */}
      <div className="dtph-actions">
        {/* Xóa text */}
        <button
          className="dtph-btn dtph-btn-clear"
          onClick={() => resetTranscript()}
          title="Xóa nội dung"
        >
          <i className="bi bi-trash3" />
          <span className="dtph-btn-label">Xóa</span>
        </button>

        {/* Check */}
        <button
          className="dtph-btn dtph-btn-submit"
          disabled={!hasTranscript}
          onClick={() => check(transcript)}
          title="Kiểm tra câu trả lời"
        >
          <i className="bi bi-check2-circle" />
          <span className="dtph-btn-label">Check</span>
        </button>

        {/* Toggle mic — bật / tắt chủ động */}
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

        {/* Thoát hẳn */}
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
        <span>≥ 50% khớp mới tính</span>
      </div>

      {/* Hidden stop button cho external caller */}
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

function removeAccentsAndLowercase(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,?!]/g, "")
    .toLowerCase();
}

function findBest(statement, normalizedCMD, threshold) {
  if (!statement) return null;
  const norm = removeAccentsAndLowercase(statement);
  const normLen = norm.length;
  if (!normLen) return null;

  let maxSim = -1;
  let best = null;

  outer: for (const { ref, nqs } of normalizedCMD) {
    for (const { norm: q, len: qLen } of nqs) {
      const minL = Math.min(normLen, qLen);
      const maxL = Math.max(normLen, qLen);
      if (maxL === 0 || minL / maxL < threshold * 0.6) continue;

      const sim = stringSimilarity.compareTwoStrings(norm, q);
      if (sim >= threshold && sim > maxSim) {
        maxSim = sim;
        best = ref;
        if (sim === 1) break outer; // perfect match → dừng sớm
      }
    }
  }
  return best;
}
