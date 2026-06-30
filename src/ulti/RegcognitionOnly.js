import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
/* ════════════════════════════════════════════════════════════════════
   DictaphoneONLY — footer bar
   Layout: [Reset | Tiếp]  [transcript…]  [Bật/Tắt toggle]
════════════════════════════════════════════════════════════════════ */
const DictaphoneONLY = ({ lang = "en-US", onTranscript }) => {
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [micEnabled, setMicEnabled] = useState(false);
  /* ── Auto-detect mobile browser tự dừng ────────────────────────
     Khi micEnabled=true nhưng listening tắt → reset cờ để nút
     tự chuyển sang trạng thái "cần bật lại"
  ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (micEnabled && !listening) {
      setMicEnabled(false);
    }
  }, [listening]); // eslint-disable-line
  /* ── Toggle Bật / Tắt ───────────────────────────────────────── */
  const handleToggle = () => {
    if (micEnabled) {
      // Đang bật → tắt
      SpeechRecognition.stopListening();
      setMicEnabled(false);
    } else {
      // Đang tắt → bật
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: lang });
      setMicEnabled(true);
    }
  };
  /* ── Tiếp: gửi transcript đi xử lý → reset → nghe câu mới ──── */
  const handleNext = () => {
    const current = transcript.trim();
    // Ghi vào DOM để Dictaphone-check đọc
    const el = document.getElementById("dtphTranscript");
    if (el) el.innerText = current;
    // Kích hoạt check sau khi DOM cập nhật
    setTimeout(() => {
      document.getElementById("checkBTN")?.click();
    }, 100);
    if (onTranscript) onTranscript(current);
    // Reset và tiếp tục nghe câu mới
    resetTranscript();
    // SpeechRecognition.stopListening();
    // setTimeout(() => {
    //   SpeechRecognition.startListening({ continuous: true, language: lang });
    //   setMicEnabled(true);
    // }, 200);
  };
  /* ── Reset: xóa transcript, giữ nguyên trạng thái mic ──────── */
  const handleReset = () => {
    resetTranscript();
  };
  /* ── Trạng thái toggle button ───────────────────────────────── */
  // micEnabled=false              → "Bật"   (xanh)
  // micEnabled=true, listening    → "Tắt"   (đỏ, pulse)
  // micEnabled=false sau auto-stop → "Bật lại" (cam) — handled by useEffect above
  const autoStopped = !micEnabled && transcript.trim().length > 0;
  const toggleState = micEnabled
    ? { label: "Tắt", cls: "dtph-toggle-on", icon: "bi-mic-fill" }
    : autoStopped
      ? { label: "Bật lại", cls: "dtph-toggle-warn", icon: "bi-mic" }
      : { label: "Bật", cls: "dtph-toggle-off", icon: "bi-mic-mute-fill" };
  const hasText = transcript.trim().length > 0;
  return (
    <>
      <style>{`
        /* ── Wrapper ── */
        .dtph-bar {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 6px;
          padding: 0 6px;
          box-sizing: border-box;
          min-height: 0;
        }
        /* ══ LEFT: Reset + Tiếp ══ */
        .dtph-left {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }
        .dtph-sm-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
          border: none;
          border-radius: 9px;
          cursor: pointer;
          width: 44px;
          height: 44px;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          transition: transform 0.12s, opacity 0.12s;
          -webkit-tap-highlight-color: transparent;
          flex-shrink: 0;
        }
        .dtph-sm-btn:active  { transform: scale(0.90); }
        .dtph-sm-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .dtph-sm-btn i { font-size: 1rem; line-height: 1; }
        .dtph-btn-reset {
          background: rgba(100,116,139,0.28);
          color: #94a3b8;
          border: 1px solid rgba(148,163,184,0.2);
        }
        .dtph-btn-next {
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff;
          box-shadow: 0 2px 8px rgba(124,58,237,0.4);
        }
        /* ══ CENTER: Transcript ══ */
        .dtph-center {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background: rgba(0,0,0,0.20);
          border-radius: 10px;
          padding: 5px 10px;
          min-height: 36px;
          max-height: 54px;
          overflow: hidden;
          border: 1px solid transparent;
          transition: border-color 0.25s;
          text-align: right;
        }
        .dtph-bar.is-listening .dtph-center {
          border-color: rgba(52,211,153,0.35);
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
          text-align: right;
          width: 100%;
        }
        .dtph-placeholder-text {
          font-size: 0.76rem;
          color: rgba(226,232,240,0.38);
          font-style: italic;
          text-align: right;
          width: 100%;
          display: block;
        }
        /* live blink dot */
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
        @keyframes dtph-blink { 50% { opacity: 0; } }
        /* ══ RIGHT: Toggle Bật/Tắt ══ */
        .dtph-toggle-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
          border: none;
          border-radius: 11px;
          cursor: pointer;
          width: 52px;
          height: 52px;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          flex-shrink: 0;
          transition: transform 0.12s, box-shadow 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .dtph-toggle-btn:active { transform: scale(0.90); }
        .dtph-toggle-btn i { font-size: 1.15rem; line-height: 1; }
        /* OFF → Bật */
        .dtph-toggle-off {
          background: linear-gradient(135deg, #34d399, #059669);
          color: #fff;
          box-shadow: 0 2px 10px rgba(5,150,105,0.38);
        }
        /* ON → Tắt (với pulse) */
        .dtph-toggle-on {
          background: linear-gradient(135deg, #f87171, #dc2626);
          color: #fff;
          box-shadow: 0 2px 10px rgba(220,38,38,0.4);
          animation: dtph-toggle-pulse 1.6s ease-in-out infinite;
        }
        @keyframes dtph-toggle-pulse {
          0%, 100% { box-shadow: 0 2px 10px rgba(220,38,38,0.4); }
          50%       { box-shadow: 0 2px 20px rgba(220,38,38,0.75); }
        }
        /* AUTO-STOPPED → Bật lại (cam cảnh báo) */
        .dtph-toggle-warn {
          background: linear-gradient(135deg, #fbbf24, #d97706);
          color: #1c1917;
          box-shadow: 0 2px 10px rgba(217,119,6,0.45);
          animation: dtph-toggle-warn-pulse 0.9s ease-in-out infinite;
        }
        @keyframes dtph-toggle-warn-pulse {
          0%, 100% { box-shadow: 0 2px 10px rgba(217,119,6,0.45); }
          50%       { box-shadow: 0 2px 20px rgba(217,119,6,0.8); }
        }
      `}</style>
      <div className={`dtph-bar ${listening ? "is-listening" : ""}`}>
        {/* ══ CENTER: Transcript ══ */}
        <div className="dtph-center">
          {hasText ? (
            <span className="dtph-transcript-text">
              {transcript}
              {listening && <span className="dtph-live-dot" />}
            </span>
          ) : (
            <span className="dtph-placeholder-text">
              {micEnabled
                ? listening
                  ? "Đang nghe…"
                  : "Đang kết nối…"
                : "Bấm Bật để bắt đầu"}
            </span>
          )}
        </div>
        {/* ══ LEFT: Toggle Bật/Tắt ══ */}
        <button
          className={`dtph-toggle-btn ${toggleState.cls}`}
          onClick={handleToggle}
          title={toggleState.label}
        >
          <i className={`bi ${toggleState.icon}`} />
          <span>{toggleState.label}</span>
        </button>
        {/* ══ RIGHT: Xóa + Tiếp ══ */}
        <div className="dtph-left">
          {/* Xóa */}
          <button
            className="dtph-sm-btn dtph-btn-reset"
            onClick={handleReset}
            title="Xóa transcript"
          >
            <i className="bi bi-trash3" />
            <span>Xóa</span>
          </button>
          {/* Tiếp — chỉ enable khi có text */}
          <button
            className="dtph-sm-btn dtph-btn-next"
            onClick={handleNext}
            disabled={!hasText}
            title="Gửi & nghe câu mới"
          >
            <i className="bi bi-arrow-right-circle" />
            <span>Gửi</span>
          </button>
        </div>
      </div>
      {/* Hidden triggers */}
      <button
        id="stopListenBTN"
        style={{ display: "none" }}
        onClick={handleToggle}
      />
      <button
        id="sttStopBTN"
        style={{ display: "none" }}
        onClick={() => {
          SpeechRecognition.stopListening();
          setMicEnabled(false);
        }}
      />
      <button
        id="sttStartBTN"
        style={{ display: "none" }}
        onClick={() => {
          SpeechRecognition.startListening({
            continuous: true,
            language: lang,
          });
          setMicEnabled(true);
        }}
      />
    </>
  );
};
export default DictaphoneONLY;