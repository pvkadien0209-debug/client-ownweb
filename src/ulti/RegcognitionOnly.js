import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { compareTwoStrings } from "string-similarity";

/* ════════════════════════════════════════════════════════════════════
   StringSimilarityMatcher — render bảng tham khảo phiên âm khớp nhất
   với inputString trong phrasesArray (dùng bên trong popup INFO)
════════════════════════════════════════════════════════════════════ */
function StringSimilarityMatcher(inputString, phrasesArray) {
  if (
    !phrasesArray ||
    !Array.isArray(phrasesArray) ||
    phrasesArray.length === 0
  ) {
    return null;
  }
  // Helper: dán thêm nội dung vào textarea đã có, không ghi đè
  const appendToTextarea = (text) => {
    if (!text) return;
    const textarea = document.getElementById("clearClassForTable");
    if (textarea) {
      const current = textarea.value || "";
      textarea.value = current ? current + " " + text : text;
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    }
  };
  // Helper: xóa toàn bộ nội dung của một phần tử theo id
  const clearTextareaById = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.value = "";
      el.focus();
    }
  };

  // Chuẩn hóa chuỗi trước khi so sánh: lowercase, bỏ khoảng trắng thừa,
  // bỏ dấu câu cuối câu (. ? ! ,) để "what is your name" khớp với
  // "What is your name?"
  const normalize = (str) =>
    (str || "")
      .toLowerCase()
      .trim()
      .replace(/[.?!,]/g, "")
      .replace(/\s+/g, " ");

  const normalizedInput = normalize(inputString);

  try {
    let mockSimilarityScoreRate;
    let bestScore = 0;
    phrasesArray.forEach((e) => {
      const mockSimilarityScore = compareTwoStrings(
        normalizedInput,
        normalize(e["IPA-01"]),
      );
      if (mockSimilarityScore > 0.5 && mockSimilarityScore > bestScore) {
        bestScore = mockSimilarityScore;
        mockSimilarityScoreRate = e;
      }
    });
    // Check if we found a match
    if (mockSimilarityScoreRate) {
      const ipa01 = mockSimilarityScoreRate["IPA-01"] || "";
      const ipa02 = mockSimilarityScoreRate["IPA-02"] || "";
      const ipa03 = mockSimilarityScoreRate["IPA-03"] || "";
      const ipa04 = mockSimilarityScoreRate["IPA-04"] || "";
      const decodeElement = document.getElementById("DeCode");
      if (decodeElement) {
        decodeElement.textContent = ipa02 + "zzz" + ipa03 + "zzz" + ipa04;
      }
      return (
        <div className="reference-card py-2 px-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <h6 className="text-info mb-0">
              <i className="bi bi-info-circle me-1"></i>
              Thông tin tham khảo:
            </h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-info py-0 px-1"
              title="Xóa text"
              onClick={() => clearTextareaById("clearClassForTable")}
            >
              XXXX
            </button>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-3">
            <div className="d-flex align-items-center gap-1">
              <small className="text-info fw-semibold">Câu gốc:</small>
              <strong style={{ color: "black" }}>{ipa01}</strong>
              <button
                type="button"
                className="btn btn-sm btn-outline-info py-0 px-1"
                title="Dán vào ô phiên âm"
                onClick={() => appendToTextarea(ipa01)}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>

            <div className="d-flex align-items-center gap-1">
              <small className="text-info fw-semibold">Dịch thô:</small>
              <strong style={{ color: "black" }}>{ipa02}</strong>
              <button
                type="button"
                className="btn btn-sm btn-outline-info py-0 px-1"
                title="Dán vào ô phiên âm"
                onClick={() => appendToTextarea(ipa02)}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>

            <div className="d-flex align-items-center gap-1">
              <small className="text-success fw-semibold">UK:</small>
              <strong style={{ color: "black" }}>{ipa03}</strong>
              <button
                type="button"
                className="btn btn-sm btn-outline-success py-0 px-1"
                title="Dán vào ô phiên âm"
                onClick={() => appendToTextarea(ipa03)}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>

            <div className="d-flex align-items-center gap-1">
              <small className="text-warning fw-semibold">US:</small>
              <strong style={{ color: "black" }}>{ipa04}</strong>
              <button
                type="button"
                className="btn btn-sm btn-outline-warning py-0 px-1"
                title="Dán vào ô phiên âm"
                onClick={() => appendToTextarea(ipa04)}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  } catch (error) {
    console.error("Error in StringSimilarityMatcher:", error);
    return null;
  }
}

/* ════════════════════════════════════════════════════════════════════
   DictaphoneONLY — footer bar
   Layout: [Reset | Tiếp]  [transcript…]  [Bật/Tắt toggle]
════════════════════════════════════════════════════════════════════ */
const DictaphoneONLY = ({ IsReading, lang = "en-US", onTranscript, data }) => {
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [micEnabled, setMicEnabled] = useState(false);

  /* ── Popup INFO tra cứu phiên âm ────────────────────────────── */
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [inputString, setInputString] = useState(""); // giá trị đang gõ trong ô input
  const [searchQuery, setSearchQuery] = useState(""); // giá trị thật sự dùng để tìm (chỉ set khi bấm Tìm)

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

  /* ── Mở popup tra cứu, tự điền câu hiện tại nếu có ─────────── */
  const handleOpenInfo = () => {
    const prefill = transcript.trim();
    setInputString(prefill);
    setSearchQuery(prefill); // hiện kết quả sẵn cho câu vừa đọc, nếu có
    setShowInfoPopup(true);
  };

  const handleCloseInfo = () => {
    setShowInfoPopup(false);
  };

  /* ── Bấm Tìm: chỉ lúc này mới thực sự chạy tra cứu ─────────── */
  const handleSearchClick = () => {
    setSearchQuery(inputString.trim());
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
          transition: align-items 0.1s;
        }
        .dtph-bar.is-listening {
          align-items: flex-start;
        }
        /* ══ LEFT: Reset + Tiếp ══ */
        .dtph-left {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
          align-self: flex-start;
          margin-top: 2px;
          align-items: center;
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
          background: rgba(148,163,184,0.35);
          color: #f1f5f9;
          border: 1px solid rgba(226,232,240,0.35);
        }
        .dtph-btn-next {
          background: linear-gradient(135deg, #c4b5fd, #8b5cf6);
          color: #fff;
          box-shadow: 0 2px 10px rgba(139,92,246,0.55);
        }
        /* ══ CENTER: Transcript — dùng height thật để animate mượt ══ */
        .dtph-center {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background: rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 5px 10px;
          height: 44px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          transition: height 0.45s ease-in-out, border-color 0.25s, background 0.25s;
          text-align: right;
          box-sizing: border-box;
        }
        .dtph-bar.is-listening .dtph-center {
          height: 200px;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at center, rgba(52,211,153,0.14), rgba(255,255,255,0.05));
          border-color: rgba(74,222,168,0.55);
          box-shadow: 0 0 0 1px rgba(74,222,168,0.15) inset, 0 0 24px rgba(52,211,153,0.15);
        }
        .dtph-transcript-text {
          font-size: 0.82rem;
          line-height: 1.35;
          color: #f1f5f9;
          word-break: break-word;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          text-align: right;
          width: 100%;
          font-weight: 600;
          transition: font-size 0.3s ease-in-out, text-align 0.3s;
        }
        .dtph-bar.is-listening .dtph-transcript-text {
          font-size: 1.75rem;
          line-height: 1.5;
          font-weight: 800;
          -webkit-line-clamp: 30;
          text-align: center;
          color: #fff;
          text-shadow: 0 0 18px rgba(52,211,153,0.5), 0 2px 6px rgba(0,0,0,0.35);
          letter-spacing: 0.01em;
        }
        .dtph-placeholder-text {
          font-size: 0.76rem;
          color: rgba(241,245,249,0.5);
          font-style: italic;
          text-align: right;
          width: 100%;
          display: block;
          transition: font-size 0.3s ease-in-out, text-align 0.3s;
        }
        .dtph-bar.is-listening .dtph-placeholder-text {
          font-size: 1.25rem;
          text-align: center;
          color: rgba(255,255,255,0.85);
          font-weight: 600;
        }
        /* live blink dot */
        .dtph-live-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ade80;
          margin-left: 6px;
          vertical-align: middle;
          box-shadow: 0 0 8px rgba(74,222,128,0.9);
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
          align-self: flex-start;
          margin-top: 2px;
          transition: transform 0.12s, box-shadow 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .dtph-toggle-btn:active { transform: scale(0.90); }
        .dtph-toggle-btn i { font-size: 1.15rem; line-height: 1; }
        /* OFF → Bật (xanh lá tươi) */
        .dtph-toggle-off {
          background: linear-gradient(135deg, #6ee7b7, #10b981);
          color: #063d2c;
          box-shadow: 0 2px 12px rgba(16,185,129,0.55);
        }
        /* ON → Tắt (đỏ-hồng tươi, pulse) */
        .dtph-toggle-on {
          background: linear-gradient(135deg, #fca5a5, #ef4444);
          color: #fff;
          box-shadow: 0 2px 12px rgba(239,68,68,0.55);
          animation: dtph-toggle-pulse 1.6s ease-in-out infinite;
        }
        @keyframes dtph-toggle-pulse {
          0%, 100% { box-shadow: 0 2px 12px rgba(239,68,68,0.55); }
          50%       { box-shadow: 0 2px 26px rgba(239,68,68,0.9); }
        }
        /* AUTO-STOPPED → Bật lại (cam vàng tươi) */
        .dtph-toggle-warn {
          background: linear-gradient(135deg, #fde047, #f59e0b);
          color: #1c1917;
          box-shadow: 0 2px 12px rgba(245,158,11,0.55);
          animation: dtph-toggle-warn-pulse 0.9s ease-in-out infinite;
        }
        @keyframes dtph-toggle-warn-pulse {
          0%, 100% { box-shadow: 0 2px 12px rgba(245,158,11,0.55); }
          50%       { box-shadow: 0 2px 26px rgba(245,158,11,0.9); }
        }
        /* ══ POPUP INFO tra cứu phiên âm — to, sáng, tươi ══ */
        .dtph-info-overlay {
          position: fixed;
          inset: 0;
          background: rgba(30,41,59,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 16px;
        }
        .dtph-info-modal {
          background: linear-gradient(180deg, #ffffff, #f0f9ff);
          border: 1px solid rgba(148,163,184,0.25);
          border-radius: 18px;
          width: 96vw;
          height: 92vh;
          max-width: 1100px;
          overflow-y: auto;
          padding: 20px;
          box-shadow: 0 20px 60px rgba(15,23,42,0.35);
          display: flex;
          flex-direction: column;
        }
        .dtph-info-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .dtph-info-header h5 {
          color: #0e7490;
          font-weight: 800;
        }
        .dtph-info-close {
          background: linear-gradient(135deg, #fca5a5, #ef4444);
          border: none;
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(239,68,68,0.45);
        }
        .dtph-info-search-row {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .dtph-info-search-input {
          flex: 1;
          border-radius: 10px;
          border: 2px solid #7dd3fc;
          padding: 10px 14px;
          font-size: 1rem;
        }
        .dtph-info-search-input:focus {
          outline: none;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14,165,233,0.2);
        }
        .dtph-info-search-btn {
          border: none;
          border-radius: 10px;
          padding: 0 22px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #6ee7b7, #10b981);
          box-shadow: 0 2px 12px rgba(16,185,129,0.5);
          cursor: pointer;
        }
        .dtph-info-search-btn:active { transform: scale(0.96); }
        .dtph-info-result-area {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 14px;
        }
        .dtph-info-empty {
          color: #64748b;
          font-style: italic;
          text-align: center;
          padding: 24px 0;
        }
        /* ══ Khu vực textarea phiên âm — trọng tâm của popup ══ */
        .dtph-info-textarea-wrap {
          flex-shrink: 0;
          background: linear-gradient(180deg, #ecfeff, #d0f3ff);
          border: 2px dashed #0ea5e9;
          border-radius: 16px;
          padding: 14px 16px 16px;
          box-shadow: 0 6px 20px rgba(14,165,233,0.18);
        }
        .dtph-info-textarea-label {
          font-weight: 800;
          font-size: 1.05rem;
          color: #0369a1;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.01em;
        }
        .dtph-info-textarea-label::before {
          content: "";
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0ea5e9;
          box-shadow: 0 0 8px rgba(14,165,233,0.8);
        }
        #clearClassForTable {
          border: 3px solid #38bdf8;
          border-radius: 12px;
          padding: 16px 18px;
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.5;
          color: #0c4a6e;
          background: #ffffff;
          height: 300px;
          box-shadow: 0 2px 10px rgba(14,165,233,0.12) inset;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        #clearClassForTable::placeholder {
          color: #7dd3fc;
          font-weight: 600;
          font-style: italic;
        }
        #clearClassForTable:focus {
          outline: none;
          border-color: #0284c7;
          box-shadow: 0 0 0 4px rgba(14,165,233,0.25);
        }
          .ipa-ref-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.2rem;
  table-layout: fixed;
}
.ipa-ref-table td {
  border: 1px solid #dee2e6;
  padding: 1px 2px;
  line-height: 1.1;
  text-align: center;
}
.ipa-ref-table .ipa-head td {
  background: #eef7fb;
  font-weight: 600;
  color: #0d6efd;
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
                  ? "Đang nghe… | Khi đọc duy nhất 1 từ có thể hệ thống sẽ nhận dạng chậm hơn đôi chút!"
                  : "Đang kết nối…"
                : "Bấm Bật để bắt đầu"}
            </span>
          )}
        </div>
        {/* ══ LEFT: Toggle Bật/Tắt ══ */}
        <button
          className={`dtph-toggle-btn ${toggleState.cls}`}
          onClick={handleToggle}
          disabled={IsReading}
          title={toggleState.label}
        >
          {IsReading ? (
            "Chờ đọc xong"
          ) : (
            <>
              <i className={`bi ${toggleState.icon}`} />{" "}
              <span>{toggleState.label}</span>
            </>
          )}
        </button>
        {/* ══ RIGHT: Xóa + Tiếp + INFO ══ */}
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
          {/* INFO — mở popup tra cứu phiên âm tham khảo */}
          <button
            className="dtph-sm-btn dtph-btn-next"
            onClick={handleOpenInfo}
            disabled={listening}
            title="Bảng thông tin tham khảo"
          >
            <i className="bi bi-arrow-right-circle" />
            <span>INFO</span>
          </button>
          AAAAAAAAAAAAAAAAAAAAAa
        </div>
      </div>

      {/* ══ Popup tra cứu phiên âm — to, sáng, tươi; chỉ nút X mới đóng được ══ */}
      {showInfoPopup && (
        <div className="dtph-info-overlay">
          <div className="dtph-info-modal">
            <div className="dtph-info-header">
              <h5 className="mb-0">
                <i className="bi bi-search me-2"></i>
                Tra cứu phiên âm tham khảo
              </h5>
              <button className="dtph-info-close" onClick={handleCloseInfo}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Ô nhập tìm kiếm câu cần tra cứu => inputString + nút Tìm */}
            <div className="dtph-info-search-row">
              <input
                type="text"
                className="dtph-info-search-input"
                placeholder="Nhập câu cần tra cứu…"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchClick();
                }}
              />
              <button
                type="button"
                className="dtph-info-search-btn"
                onClick={handleSearchClick}
              >
                <i className="bi bi-search me-1"></i>
                Tìm
              </button>
            </div>

            {/* Kết quả tra cứu — chỉ hiện sau khi bấm Tìm; bấm ô kết quả sẽ dán vào textarea bên dưới */}
            <div className="dtph-info-result-area">
              {StringSimilarityMatcher(searchQuery, data) || (
                <p className="dtph-info-empty">
                  Nhập câu cần tra cứu và bấm "Tìm" để hiển thị kết quả…
                </p>
              )}
            </div>

            {/* Ô nhập phiên âm — trọng tâm popup, đích đến khi bấm dán */}
            <div className="row g-3">
              <div className="col-12 col-md-8">
                <div className="dtph-info-textarea-wrap">
                  <label className="dtph-info-textarea-label">
                    Phiên âm đã chọn:
                  </label>
                  <textarea
                    className="textarea-practice w-100"
                    id="clearClassForTable"
                    rows="6"
                    placeholder="Nhập phiên âm tại đây…"
                  ></textarea>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <table className="ipa-ref-table">
                  <tbody>
                    <tr className="ipa-head">
                      {["U", "E", "O", "A", "I", "Ơ"].map((h) => (
                        <td key={h}>{h}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>
                        uː
                        <br />ʊ
                      </td>
                      <td>
                        e<br />ɛ
                      </td>
                      <td>
                        ɒ<br />
                        ɔː
                      </td>
                      <td>
                        ɑː
                        <br />æ<br />ʌ
                      </td>
                      <td>
                        iː
                        <br />ɪ
                      </td>
                      <td>
                        ɜː
                        <br />ə
                      </td>
                    </tr>
                    <tr className="ipa-head">
                      {["eɪ", "aɪ", "ɔɪ", "əʊ", "aʊ", "ɪə", "eə", "ʊə"].map(
                        (h) => (
                          <td key={h}>{h}</td>
                        ),
                      )}
                    </tr>
                    <tr>
                      {["Ei", "Ai", "Oi", "Ơu", "Au", "I-ơ", "E-ơ", "U-ơ"].map(
                        (v) => (
                          <td key={v}>{v}</td>
                        ),
                      )}
                    </tr>
                  </tbody>
                </table>

                <i className="d-block small text-muted mt-1">
                  Xuất phát từ phiên âm (1) Xác định UE OAI Ơ (2) Ghép trước,
                  ghép sau (3) Đọc trước to rõ, sau ngắn nhẹ, theo xu hướng âm
                  từ trái sang phải, từ âm chính sang âm dấu!
                </i>
              </div>
            </div>
          </div>
        </div>
      )}

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
