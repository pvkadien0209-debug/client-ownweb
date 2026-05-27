import React, { useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

/* ════════════════════════════════════════════════════════════════════
   DictaphoneONLY
   Nhiệm vụ duy nhất: ghi nhận transcript & điều khiển mic
   KHÔNG xử lý logic check / scoring / navigation
════════════════════════════════════════════════════════════════════ */
const DictaphoneONLY = ({ lang = "en-US", onTranscript }) => {
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [micEnabled, setMicEnabled] = useState(false);

  /* ── Start ──────────────────────────────────────────────────────── */
  const handleStart = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: lang });
    setMicEnabled(true);
  };

  /* ── Dừng ───────────────────────────────────────────────────────── */
  const handleStop = () => {
    const textTransript = document.getElementById("dtphTranscript");
    if (textTransript) textTransript.innerText = transcript.trim();

    setTimeout(() => {
      const btn = document.getElementById("checkBTN");
      if (btn) btn.click();
    }, 100);
    SpeechRecognition.stopListening();
    setMicEnabled(false);
    if (onTranscript) onTranscript(transcript);
  };

  /* ── Status ─────────────────────────────────────────────────────── */
  const status = !micEnabled
    ? { icon: "🔇", label: "Bấm Bắt đầu để nghe", cls: "dtph-off" }
    : listening
      ? { icon: "🎙️", label: "Đang nghe…", cls: "dtph-on" }
      : { icon: "⏳", label: "Đang kết nối lại…", cls: "dtph-wait" };

  return (
    <>
      <style>{`
        /* ── Container ── */
        .dtph-footer-inner {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 0 8px;
          box-sizing: border-box;
          min-height: 0;
        }

        /* ── Status icon ── */
        .dtph-status-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
          width: 28px;
          text-align: center;
          position: relative;
        }
        .dtph-on .dtph-status-icon::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: rgba(52, 211, 153, 0.25);
          animation: dtph-pulse 1.4s ease-in-out infinite;
        }
        @keyframes dtph-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.4); }
        }

        /* ── Transcript text area ── */
        .dtph-text-wrap {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          background: rgba(0,0,0,0.18);
          border-radius: 10px;
          padding: 5px 10px;
          min-height: 34px;
          max-height: 52px;
          overflow: hidden;
        }
        .dtph-transcript-text {
          font-size: 0.82rem;
          line-height: 1.35;
          color: #e2e8f0;
          word-break: break-word;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .dtph-placeholder-text {
          font-size: 0.78rem;
          color: rgba(226,232,240,0.45);
          font-style: italic;
        }

        /* ── Buttons group ── */
        .dtph-btn-group {
          display: flex;
          gap: 5px;
          flex-shrink: 0;
        }
        .dtph-ctrl-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          padding: 4px 7px;
          min-width: 46px;
          height: 44px;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          transition: transform 0.12s, opacity 0.12s;
          -webkit-tap-highlight-color: transparent;
        }
        .dtph-ctrl-btn:active { transform: scale(0.92); opacity: 0.85; }
        .dtph-ctrl-btn i { font-size: 1rem; }

        .dtph-btn-start {
          background: linear-gradient(135deg, #34d399, #059669);
          color: #fff;
          box-shadow: 0 2px 8px rgba(5,150,105,0.4);
        }
        .dtph-btn-stop {
          background: linear-gradient(135deg, #f87171, #dc2626);
          color: #fff;
          box-shadow: 0 2px 8px rgba(220,38,38,0.35);
        }
        .dtph-btn-next {
          background: linear-gradient(135deg, #60a5fa, #2563eb);
          color: #fff;
          box-shadow: 0 2px 8px rgba(37,99,235,0.35);
        }
        .dtph-ctrl-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* ── Listening indicator dot ── */
        .dtph-live-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
          margin-left: 5px;
          vertical-align: middle;
          animation: dtph-blink 1s step-start infinite;
        }
        @keyframes dtph-blink {
          50% { opacity: 0; }
        }
      `}</style>

      <div className={`dtph-footer-inner ${status.cls}`}>
        {/* Status icon */}
        <div className="dtph-status-icon">{status.icon}</div>

        {/* Transcript display */}
        <div className="dtph-text-wrap">
          {transcript.trim() ? (
            <span className="dtph-transcript-text" id="dtphTranscript">
              {transcript}
              {listening && <span className="dtph-live-dot" />}
            </span>
          ) : (
            <span className="dtph-placeholder-text">{status.label}</span>
          )}
        </div>

        {/* Control buttons */}
        <div className="dtph-btn-group">
          {!micEnabled ? (
            /* ── Bắt đầu ── */
            <button
              className="dtph-ctrl-btn dtph-btn-start"
              onClick={handleStart}
            >
              <i className="bi bi-mic-fill" />
              <span>Nghe</span>
            </button>
          ) : (
            <>
              <button
                className="dtph-ctrl-btn dtph-btn-stop"
                onClick={handleStop}
              >
                <i className="bi bi-stop-circle" />
                <span>Dừng</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hidden stop trigger (giữ tương thích với code cũ nếu cần) */}
      <button
        id="stopListenBTN"
        style={{ display: "none" }}
        onClick={handleStop}
      />
    </>
  );
};

export default DictaphoneONLY;
