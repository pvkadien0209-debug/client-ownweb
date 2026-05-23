import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import stringSimilarity from "string-similarity";
import ReadMessage from "./ReadMessage_2024";

let commands = [];

const Dictaphone = ({
  getSTTDictaphone,
  setGetSTTDictaphone,
  CMDlist,
  GENDER,
  setScore,
  addElementIfNotExist,
  ObjVoices,
  Lang,
  regRate,
  regRate_01,
  setStartSTT,
  setMessage,
}) => {
  const { interimTranscript, transcript, listening, resetTranscript } =
    useSpeechRecognition({ commands, continuous: true, interimResults: true });

  const [otherGetInterim, setotherGetInterim] = useState("");
  const [SttProcessing, setSttProcessing] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const isWaiting = interimTranscript === "" && otherGetInterim === "";
  const isProcessing = interimTranscript !== "" && otherGetInterim === "";
  const isReady = otherGetInterim !== "";

  // Delayed exit: play slide-out animation THEN unmount
  const exitWithAnimation = (afterFn) => {
    setIsExiting(true);
    setTimeout(() => {
      afterFn?.();
      setGetSTTDictaphone(false);
    }, 290);
  };

  useEffect(() => {
    let cmd_short = [],
      cmd_long = [];
    CMDlist.forEach((e0) => {
      e0.qs.forEach((e1) => {
        (e1.length > 40 ? cmd_long : cmd_short).push(e1);
      });
    });
    commands = [
      {
        command: cmd_short,
        callback: (command) => {
          try {
            setotherGetInterim(command);
          } catch {}
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: regRate,
        bestMatchOnly: true,
      },
      {
        command: cmd_long,
        callback: (command) => {
          try {
            setotherGetInterim(command);
          } catch {}
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: regRate > 0.7 ? regRate : 0.7,
        bestMatchOnly: true,
      },
    ];
  }, [CMDlist]);

  useEffect(() => {
    if (getSTTDictaphone) startListening();
  }, [getSTTDictaphone]);

  // Listen for soft-exit from parent (toggle collapse button)
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
    let objTR = findMostSimilarQuestion(RegInput, CMDlist, regRate_01);
    if (!objTR)
      objTR = findMostSimilarQuestion(otherGetInterim, CMDlist, regRate_01);
    if (!objTR) {
      const processed = removeDuplicates(RegInput);
      objTR = findMostSimilarQuestion(processed, CMDlist, regRate_01);
    }
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
    // exit with slide-out
    stopListening();
    exitWithAnimation();
  }

  return (
    <div className={`dtph-wrap ${isExiting ? "dtph-exiting" : ""}`}>
      {/* ── Transcript display ── */}
      <div className="dtph-transcript-box">
        <div className="dtph-row-label">
          <span className="dtph-badge dtph-badge-1">1</span>
          <span className="dtph-transcript-text">
            {transcript || (
              <span className="dtph-placeholder">Hãy nói gì đó…</span>
            )}
          </span>
        </div>
        <div className="dtph-row-label">
          <span className="dtph-badge dtph-badge-2">2</span>
          <span className="dtph-interim-text">
            {isProcessing ? (
              <span className="dtph-processing">⏳ Đang nhận dạng…</span>
            ) : (
              otherGetInterim || <span className="dtph-placeholder">—</span>
            )}
          </span>
        </div>
      </div>

      {/* ── Status indicator ── */}
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
            Chờ 3s…
          </>
        )}
        {isReady && (
          <>
            <span className="dtph-status-dot dtph-ready-dot" />
            Sẵn sàng gửi
          </>
        )}
      </div>

      {/* ── Action buttons ── */}
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
            disabled={isProcessing}
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

      {/* ── Info strip ── */}
      <div className="dtph-info-strip">
        <span title="Chỉ cần (1) hoặc (2) đúng là đủ">
          💡 (1) hoặc (2) đúng là đủ
        </span>
        <span className="dtph-info-sep">·</span>
        <span title="Thực hành nhanh quan trọng hơn hoàn hảo">
          🏃 Luyện nhanh &gt; hoàn hảo
        </span>
        <span className="dtph-info-sep">·</span>
        <span title="Rèn luyện lâu dài, chỉnh sửa dần dần">
          🌱 Cải thiện dần
        </span>
      </div>

      {/* Hidden stop trigger for external callers */}
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
function findMostSimilarQuestion(statement, questions, threshold) {
  if (!statement) return null;
  const norm = removeAccentsAndLowercase(statement);
  let maxSim = -1,
    best = null;
  questions.forEach((qObj) => {
    qObj.qs.forEach((q) => {
      const sim = stringSimilarity.compareTwoStrings(
        norm,
        removeAccentsAndLowercase(q),
      );
      if (sim >= threshold && sim > maxSim) {
        maxSim = sim;
        best = qObj;
      }
    });
  });
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
