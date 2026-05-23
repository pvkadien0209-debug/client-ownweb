import React, { useEffect, useState, useMemo } from "react";
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
  // ── Chỉ cần transcript (bỏ interimTranscript) ──────────────────────
  const { transcript, resetTranscript } = useSpeechRecognition({
    continuous: true,
  });
  const [isExiting, setIsExiting] = useState(false);

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
    setIsExiting(true);
    setTimeout(() => {
      afterFn?.();
      setGetSTTDictaphone(false);
    }, 290);
  };

  useEffect(() => {
    if (getSTTDictaphone) startListening();
  }, [getSTTDictaphone]);

  useEffect(() => {
    const handler = () => {
      stopListening();
      exitWithAnimation();
    };
    window.addEventListener("dtph-soft-exit", handler);
    return () => window.removeEventListener("dtph-soft-exit", handler);
  }, []);

  const startListening = () =>
    SpeechRecognition.startListening({
      continuous: true,
      language: Lang || "en-US",
    });

  const stopListening = () => SpeechRecognition.stopListening();

  /* ── CHECK: so sánh transcript với CMDlist ─────────────────────────
     - Tìm câu giống nhất (sim > 50%)
     - Dùng ReadMessage với id mp3 từ aw01 (hỗ trợ mobile)             */
  function check(RegInput) {
    const input = (RegInput || "").trim();
    if (!input) return;

    setMessage(input);
    const objTR = findBest(input, normalizedCMD, THRESHOLD);

    if (!objTR) {
      // Không tìm được câu khớp trên 50%
      ReadMessage(
        ObjVoices,
        "Sorry, what did you say?",
        GENDER,
        GENDER === 1 ? [{ id: "sorryFemale" }] : [{ id: "sorryMale" }],
      );
    } else {
      /* ── Chọn answer ngẫu nhiên, lấy đúng aw01 cùng index ──────────
         aw:  ["We'd like a table.", "Dine in, please.", ...]
         aw01:[{ st:"We'd like a table.", id:"A13_a1b1" }, ...]
         → phải cùng index để id mp3 khớp với câu nói ra               */
      const awArr = objTR.aw || [];
      const aw01Arr = objTR.aw01 || [];
      const randomIndex = Math.floor(Math.random() * (awArr.length || 1));
      const answer = awArr[randomIndex];
      const audioEntry = aw01Arr[randomIndex]; // { st, id }

      if (answer) {
        ReadMessage(
          ObjVoices,
          answer,
          GENDER,
          // Mobile chỉ dùng mp3 theo id → truyền [{ id }]
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
          <span className="dtph-badge dtph-badge-1">🎙️</span>
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
      // Length-ratio pre-filter: Dice không thể vượt 2*min/(a+b)
      const minL = Math.min(normLen, qLen);
      const maxL = Math.max(normLen, qLen);
      if (maxL === 0 || minL / maxL < threshold * 0.6) continue;

      const sim = stringSimilarity.compareTwoStrings(norm, q);
      if (sim >= threshold && sim > maxSim) {
        maxSim = sim;
        best = ref;
        if (sim === 1) break outer; // perfect match
      }
    }
  }
  return best;
}
