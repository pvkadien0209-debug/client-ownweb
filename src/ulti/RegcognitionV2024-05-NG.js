import React, { useEffect, useRef, useState, useMemo } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import stringSimilarity from "string-similarity";
import ReadMessage from "./ReadMessage_2024";

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
  const { transcript, resetTranscript, listening } = useSpeechRecognition({
    continuous: true,
  });
  const [isExiting, setIsExiting] = useState(false);

  // ── FIX 3: ref giữ trạng thái "đang active session" để guard restart ──
  const isActiveRef = useRef(false);
  // ── FIX 3: timeout ref để restart khi mobile tự ngắt ──────────────────
  const restartTimerRef = useRef(null);

  /* ── Pre-normalize CMDlist 1 lần khi CMDlist thay đổi ─────────────── */
  const normalizedCMD = useMemo(() => {
    return CMDlist.map((qObj) => ({
      ref: qObj,
      nqs: qObj.qs.map((q) => ({
        norm: removeAccentsAndLowercase(q),
        len: q.length,
      })),
    }));
  }, [CMDlist]);

  /* ── Threshold tối thiểu 50% ───────────────────────────────────────── */
  const THRESHOLD = Math.max(
    typeof regRate_01 === "number" ? regRate_01 : 0.5,
    0.5,
  );

  const exitWithAnimation = (afterFn) => {
    isActiveRef.current = false;
    clearRestartTimer();
    setIsExiting(true);
    setTimeout(() => {
      afterFn?.();
      setGetSTTDictaphone(false);
    }, 290);
  };

  /* ── FIX 1 + FIX 2: reset transcript trước, delay 350ms rồi mới start ─
     Mobile cần khoảng thời gian sau khi session trước đã fully closed.
     350ms đủ cho cả Android Chrome lẫn iOS Safari.                       */
  useEffect(() => {
    if (getSTTDictaphone) {
      isActiveRef.current = true;
      setIsExiting(false);
      resetTranscript();                     // FIX 1: xóa transcript cũ
      const t = setTimeout(() => {
        if (isActiveRef.current) startListening(); // FIX 2: delay 350ms
      }, 350);
      return () => clearTimeout(t);
    } else {
      isActiveRef.current = false;
      clearRestartTimer();
    }
  }, [getSTTDictaphone]);

  /* ── FIX 3: mobile tự dừng recognition sau silence → tự restart ───────
     listening === false  +  session đang active  +  chưa exiting
     → restart sau 200ms (tránh vòng lặp nếu đang tắt thật)              */
  useEffect(() => {
    if (!listening && isActiveRef.current && !isExiting) {
      restartTimerRef.current = setTimeout(() => {
        if (isActiveRef.current) startListening();
      }, 200);
    }
    return () => clearRestartTimer();
  }, [listening]);

  /* ── Cleanup toàn bộ khi component unmount ────────────────────────── */
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      clearRestartTimer();
      SpeechRecognition.stopListening();
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      stopListening();
      exitWithAnimation();
    };
    window.addEventListener("dtph-soft-exit", handler);
    return () => window.removeEventListener("dtph-soft-exit", handler);
  }, []);

  const clearRestartTimer = () => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  };

  const startListening = () =>
    SpeechRecognition.startListening({
      continuous: true,
      language: Lang || "en-US",
    });

  const stopListening = () => {
    clearRestartTimer();
    SpeechRecognition.stopListening();
  };

  /* ── CHECK: so sánh transcript với CMDlist ─────────────────────────
     - Tìm câu giống nhất (sim > 50%)
     - Dùng ReadMessage với id mp3 từ aw01 (hỗ trợ mobile)             */
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
      const randomIndex = Math.floor(Math.random() * (awArr.length || 1));
      const answer = awArr[randomIndex];
      const audioEntry = aw01Arr[randomIndex];

      if (answer) {
        ReadMessage(
          ObjVoices,
          answer,
          GENDER,
          audioEntry?.id ? [{ id: audioEntry.id }] : undefined,
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

    stopListening();
    exitWithAnimation();
  }

  const hasTranscript = transcript.trim().length > 0;

  return (
    <div className={`dtph-wrap ${isExiting ? "dtph-exiting" : ""}`}>
      {/* ── Phần transcript: nói → hiện ra ── */}
      <div className="dtph-transcript-box">
        <div className="dtph-row-label">
          {/* FIX 3: hiển thị đúng trạng thái mic thực tế (listening state) */}
          <span className="dtph-badge dtph-badge-1">
            {listening ? "🎙️" : "⏸️"}
          </span>
          <span className="dtph-transcript-text">
            {transcript || (
              <span className="dtph-placeholder">Hãy nói gì đó…</span>
            )}
          </span>
        </div>
      </div>

      {/* ── Nút hành động ── */}
      <div className="dtph-actions">
        <button
          className="dtph-btn dtph-btn-clear"
          onClick={() => resetTranscript()}
          title="Xóa nội dung"
        >
          <i className="bi bi-trash3" />
          <span className="dtph-btn-label">Xóa</span>
        </button>

        {/* CHECK: chỉ active khi đã có transcript */}
        <button
          className="dtph-btn dtph-btn-submit"
          disabled={!hasTranscript}
          onClick={() => check(transcript)}
          title="Kiểm tra câu trả lời"
        >
          <i className="bi bi-check2-circle" />
          <span className="dtph-btn-label">Check</span>
        </button>

        <button
          className="dtph-btn dtph-btn-exit"
          onClick={() => {
            stopListening();
            exitWithAnimation();
          }}
          title="Thoát"
        >
          <i className="bi bi-x-circle" />
          <span className="dtph-btn-label">Thoát</span>
        </button>
      </div>

      <div className="dtph-info-strip">
        <span>🎙️ Nói → bấm Check</span>
        <span className="dtph-info-sep">·</span>
        <span>≥ 50% khớp mới tính</span>
        <span className="dtph-info-sep">·</span>
        <span>🏃 Luyện nhanh &gt; hoàn hảo</span>
      </div>

      <button
        id="stopListenBTN"
        style={{ display: "none" }}
        onClick={stopListening}
      />
    </div>
  );
};

export default Dictaphone;

// ── Helpers ──────────────────────────────────────────────────────────

function removeAccentsAndLowercase(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,?]/g, "")
    .toLowerCase();
}

/**
 * Tìm câu khớp nhất — pre-filter theo length ratio, early exit khi sim===1.
 * Trả về object gốc (ref) từ CMDlist nếu sim >= threshold, ngược lại null.
 */
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
        if (sim === 1) break outer;
      }
    }
  }
  return best;
}