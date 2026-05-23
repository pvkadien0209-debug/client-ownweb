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
  const { interimTranscript, transcript, listening, resetTranscript } =
    useSpeechRecognition({ continuous: true, interimResults: true });

  const [SttProcessing, setSttProcessing] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const isWaiting = transcript === "" && interimTranscript === "";
  const isProcessing = interimTranscript !== "";
  const isReady = transcript !== "" && interimTranscript === "";

  /* ── Pre-normalize CMDlist 1 lần khi CMDlist thay đổi ──
     Tránh gọi removeAccentsAndLowercase() lặp lại trong mỗi check()  */
  const normalizedCMD = useMemo(() => {
    return CMDlist.map((qObj) => ({
      ref: qObj, // giữ ref gốc
      nqs: qObj.qs.map((q) => ({
        norm: removeAccentsAndLowercase(q),
        len: q.length,
      })),
    }));
  }, [CMDlist]);

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

  function check(RegInput) {
    if (!RegInput) return;
    setMessage(RegInput);

    const objTR = findBest(RegInput, normalizedCMD, regRate_01);

    if (!objTR) {
      ReadMessage(
        ObjVoices,
        "Sorry, what did you say?",
        GENDER,
        GENDER === 1 ? [{ id: "sorryFemale" }] : [{ id: "sorryMale" }],
      );
    } else {
      const answer = objTR.aw?.[Math.floor(Math.random() * objTR.aw.length)];
      if (answer)
        ReadMessage(
          ObjVoices,
          answer,
          GENDER,
          objTR.aw01 ? [{ id: objTR.aw01 }] : undefined,
        );
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

  return (
    <div className={`dtph-wrap ${isExiting ? "dtph-exiting" : ""}`}>
      <div className="dtph-transcript-box">
        <div className="dtph-row-label">
          <span className="dtph-badge dtph-badge-1">1</span>
          <span className="dtph-transcript-text">
            {transcript || interimTranscript || (
              <span className="dtph-placeholder">Hãy nói gì đó…</span>
            )}
          </span>
        </div>
      </div>

      <div
        className={`dtph-status ${isWaiting ? "status-wait" : isProcessing ? "status-proc" : "status-ready"}`}
      >
        {isWaiting && (
          <>
            <span className="dtph-status-dot" />
            Đang nghe…
          </>
        )}
        {isProcessing && (
          <>
            <span className="dtph-status-dot dtph-pulse" />
            Chờ…
          </>
        )}
        {isReady && (
          <>
            <span className="dtph-status-dot dtph-ready-dot" />
            Sẵn sàng gửi
          </>
        )}
      </div>

      <div className="dtph-actions">
        <button
          className="dtph-btn dtph-btn-clear"
          onClick={() => resetTranscript()}
          title="Xóa nội dung"
        >
          <i className="bi bi-trash3" />
          <span className="dtph-btn-label">Xóa</span>
        </button>
        {SttProcessing ? (
          <button className="dtph-btn dtph-btn-processing" disabled>
            <i className="bi bi-hourglass-split dtph-spin" />
            <span className="dtph-btn-label">Xử lý…</span>
          </button>
        ) : (
          <button
            className="dtph-btn dtph-btn-submit"
            disabled={isProcessing || isWaiting}
            onClick={() => check(transcript)}
            title="Gửi câu trả lời"
          >
            <i className="bi bi-send-check" />
            <span className="dtph-btn-label">Gửi</span>
          </button>
        )}
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
        <span>🎙️ Nói rõ — tự khớp gần nhất</span>
        <span className="dtph-info-sep">·</span>
        <span>🏃 Luyện nhanh &gt; hoàn hảo</span>
        <span className="dtph-info-sep">·</span>
        <span>🌱 Cải thiện dần</span>
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
 * Tìm câu khớp nhất — dùng pre-normalized list để tránh normalize lại.
 * Pre-filter theo length ratio trước khi tính Dice → bỏ qua ~70% câu không cần so.
 * Early exit ngay khi sim === 1.
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
      // ── Length-ratio pre-filter ──────────────────────────────────
      // Dice coefficient không thể vượt 2*min/(a+b).
      // Nếu tỉ lệ độ dài < threshold thì bỏ qua ngay.
      const minL = Math.min(normLen, qLen);
      const maxL = Math.max(normLen, qLen);
      if (maxL === 0 || minL / maxL < threshold * 0.6) continue;

      const sim = stringSimilarity.compareTwoStrings(norm, q);
      if (sim >= threshold && sim > maxSim) {
        maxSim = sim;
        best = ref;
        if (sim === 1) break outer; // perfect match — dừng ngay
      }
    }
  }

  return best;
}

function removeDuplicates(sentence) {
  const seen = new Set();
  return sentence
    .split(" ")
    .filter((w) => {
      if (seen.has(w)) return false;
      seen.add(w);
      return true;
    })
    .join(" ");
}
