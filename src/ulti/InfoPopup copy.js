import React, { useEffect, useState } from "react";
import { compareTwoStrings } from "string-similarity";
import { socket } from "../App";
/* ════════════════════════════════════════════════════════════════════
   getTopMatches — trả về N (mặc định 3) phiên âm khớp gần nhất với
   inputString trong phrasesArray, KHÔNG lọc theo ngưỡng điểm số
════════════════════════════════════════════════════════════════════ */
export function getTopMatches(inputString, phrasesArray, topN = 3) {
  if (
    !phrasesArray ||
    !Array.isArray(phrasesArray) ||
    phrasesArray.length === 0 ||
    !inputString ||
    !inputString.trim()
  ) {
    return [];
  }

  const normalize = (str) =>
    (str || "")
      .toLowerCase()
      .trim()
      .replace(/[.?!,]/g, "")
      .replace(/\s+/g, " ");

  const normalizedInput = normalize(inputString);

  const scored = phrasesArray.map((item) => ({
    item,
    score: compareTwoStrings(normalizedInput, normalize(item["IPA-01"])),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topN);
}

/* ════════════════════════════════════════════════════════════════════
   MatchResults — hiển thị 3 đáp án gần nhất dạng nút chọn; bấm vào
   đáp án nào thì đáp án đó hiện thẻ chi tiết bên dưới để dán vào ô
   phiên âm (#clearClassForTable) và cập nhật #DeCode
════════════════════════════════════════════════════════════════════ */
function MatchResults({ searchQuery, data }) {
  const [matches, setMatches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const top3 = getTopMatches(searchQuery, data, 3);
    setMatches(top3);
    setSelectedIndex(0);
  }, [searchQuery, data]);

  const selected = matches[selectedIndex];

  useEffect(() => {
    if (!selected) return;
    const ipa02 = selected.item["IPA-02"] || "";
    const ipa03 = selected.item["IPA-03"] || "";
    const ipa04 = selected.item["IPA-04"] || "";
    const decodeElement = document.getElementById("DeCode");
    if (decodeElement) {
      decodeElement.textContent = ipa02 + "zzz" + ipa03 + "zzz" + ipa04;
    }
  }, [selected]);

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

  const clearTextareaById = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.value = "";
      el.focus();
    }
  };

  if (!matches.length) {
    return (
      <p className="dtph-info-empty">
        Nhập câu cần tra cứu và bấm "Tìm" để hiển thị kết quả…
      </p>
    );
  }

  return (
    <div className="dtph-match-wrap">
      {/* ── Danh sách 3 đáp án gần nhất — bấm để chọn ── */}
      <div className="dtph-match-list">
        {matches.map((m, idx) => {
          const ipa01 = m.item["IPA-01"] || "(trống)";
          const pct = Math.round(m.score * 100);
          return (
            <button
              key={idx}
              type="button"
              className={`dtph-match-btn ${
                idx === selectedIndex ? "dtph-match-btn-active" : ""
              }`}
              onClick={() => setSelectedIndex(idx)}
              title={ipa01}
            >
              <span className="dtph-match-rank">#{idx + 1}</span>
              <span className="dtph-match-text">{ipa01}</span>
              <span className="dtph-match-score">{pct}%</span>
            </button>
          );
        })}
      </div>

      {/* ── Thẻ chi tiết của đáp án đang được chọn ── */}
      {selected && (
        <div className="reference-card py-2 px-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <h6 className="text-info mb-0">
              <i className="bi bi-info-circle me-1"></i>
              Thông tin tham khảo (đáp án #{selectedIndex + 1}):
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
            {[
              {
                label: "Câu gốc:",
                value: selected.item["IPA-01"] || "",
                cls: "text-info",
                btnCls: "btn-outline-info",
              },
              {
                label: "Dịch thô:",
                value: selected.item["IPA-02"] || "",
                cls: "text-info",
                btnCls: "btn-outline-info",
              },
              {
                label: "UK:",
                value: selected.item["IPA-03"] || "",
                cls: "text-success",
                btnCls: "btn-outline-success",
              },
              {
                label: "US:",
                value: selected.item["IPA-04"] || "",
                cls: "text-warning",
                btnCls: "btn-outline-warning",
              },
            ].map((f) => (
              <div className="d-flex align-items-center gap-1" key={f.label}>
                <small className={`${f.cls} fw-semibold`}>{f.label}</small>
                <strong style={{ color: "black" }}>{f.value}</strong>
                <button
                  type="button"
                  className={`btn btn-sm ${f.btnCls} py-0 px-1`}
                  title="Dán vào ô phiên âm"
                  onClick={() => appendToTextarea(f.value)}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   InfoPopup — popup tra cứu phiên âm tham khảo
   Props:
   - show: boolean, có hiển thị popup hay không
   - onClose: () => void
   - inputString / setInputString: giá trị ô input
   - searchQuery: giá trị thật sự dùng để tìm (set khi bấm Tìm)
   - onSearch: () => void, gọi khi bấm nút Tìm / Enter
   - data: mảng phrasesArray truyền cho getTopMatches
════════════════════════════════════════════════════════════════════ */
const BOTTOM_HEIGHT_EXPANDED = 400; // px — chiều cao khu textarea+bảng IPA khi bấm "Mở rộng"
const BOTTOM_HEIGHT_COLLAPSED = 200; // px — chiều cao khu textarea+bảng IPA khi "Thu gọn"

export default function InfoPopup({
  show,
  onClose,
  inputString,
  setInputString,
  searchQuery,
  onSearch,
  data,
  dataTable,
}) {
  const [expanded, setExpanded] = useState(false);
  const bottomHeight = expanded
    ? BOTTOM_HEIGHT_EXPANDED
    : BOTTOM_HEIGHT_COLLAPSED;

  const handleToggleRatio = () => setExpanded((v) => !v);

  if (!show) return null;

  return (
    <>
      <style>{`
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
          padding: 20px;
          box-shadow: 0 20px 60px rgba(15,23,42,0.35);
          display: flex;
          flex-direction: column;
          overflow: hidden; /* modal không tự tràn — mỗi khối con tự cuộn riêng */
          box-sizing: border-box;
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
        .dtph-info-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dtph-info-resize-btn {
          background: linear-gradient(135deg, #7dd3fc, #0ea5e9);
          border: none;
          color: #fff;
          height: 36px;
          padding: 0 12px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(14,165,233,0.4);
          font-weight: 700;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dtph-info-resize-btn:active { transform: scale(0.95); }
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

        /* ══ Khối chia trên/dưới ══
           - top: chiếm phần còn lại (flex: 1), tự cuộn nếu nội dung dài
           - bottom: chiều cao CỐ ĐỊNH theo px (500 / 100), không phụ thuộc modal
        */
        .dtph-info-split {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .dtph-info-top {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }
        .dtph-info-hr {
          flex-shrink: 0;
          border: none;
          border-top: 2px dashed #bae6fd;
          margin: 8px 0;
        }
        .dtph-info-bottom {
          flex-shrink: 0;
          overflow-y: auto; /* nếu nội dung bên trong cao hơn 100px lúc thu gọn thì tự cuộn, không tràn ra ngoài */
          transition: height 0.3s ease-in-out;
        }
        .dtph-info-result-area {
          height: 100%;
          overflow-y: auto;
          padding-bottom: 4px;
        }
        .dtph-info-empty {
          color: #64748b;
          font-style: italic;
          text-align: center;
          padding: 24px 0;
        }

        /* ══ Danh sách 3 đáp án gần nhất ══ */
        .dtph-match-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dtph-match-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .dtph-match-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          max-width: 100%;
          border: 2px solid #bae6fd;
          background: #f0f9ff;
          border-radius: 10px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: border-color 0.15s, background 0.15s;
        }
        .dtph-match-btn:active { transform: scale(0.97); }
        .dtph-match-btn-active {
          border-color: #0ea5e9;
          background: #e0f2fe;
          box-shadow: 0 0 0 2px rgba(14,165,233,0.25);
        }
        .dtph-match-rank {
          font-weight: 800;
          color: #0369a1;
          flex-shrink: 0;
        }
        .dtph-match-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 320px;
          color: #0c4a6e;
          font-weight: 600;
        }
        .dtph-match-score {
          flex-shrink: 0;
          font-weight: 700;
          color: #0d9488;
          background: rgba(13,148,136,0.12);
          border-radius: 6px;
          padding: 1px 6px;
          font-size: 0.75rem;
        }

        .dtph-info-textarea-wrap {
          background: linear-gradient(180deg, #ecfeff, #d0f3ff);
          border: 2px dashed #0ea5e9;
          border-radius: 16px;
          padding: 14px 16px 16px;
          box-shadow: 0 6px 20px rgba(14,165,233,0.18);
          height: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
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
          flex-shrink: 0;
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
          flex: 1;
          min-height: 0;
          width: 100%;
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
        .dtph-ipa-panel {
          height: 100%;
          overflow-y: auto;
        }
        .ipa-ref-table {
          width: 100%;bi-arrows-collapse
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

      <div className="dtph-info-overlay">
        <div className="dtph-info-modal">
          <div className="dtph-info-header">
            <h5 className="mb-0">
              <i className="bi bi-search me-2"></i>
              Tra cứu phiên âm tham khảo
            </h5>
            <div className="dtph-info-header-actions">
              {/* ── Nút chỉnh cao/thấp — đặt cạnh nút thoát ── */}
              <button
                type="button"
                className="dtph-info-resize-btn"
                onClick={handleToggleRatio}
                title={
                  expanded
                    ? "Thu gọn khu phiên âm (về 100px)"
                    : "Mở rộng khu phiên âm (lên 500px)"
                }
              >
                <i
                  className={`bi ${
                    expanded ? "bi-arrows-collapse" : "bi-arrows-expand"
                  }`}
                ></i>
                {expanded ? "Thu gọn" : "Mở rộng"}
              </button>
              <button className="dtph-info-close" onClick={onClose}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div className="dtph-info-search-row">
            <input
              type="text"
              className="dtph-info-search-input"
              placeholder="Nhập câu cần tra cứu…"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch();
              }}
            />
            <button
              type="button"
              className="dtph-info-search-btn"
              onClick={onSearch}
            >
              <i className="bi bi-search me-1"></i>
              Tìm
            </button>
          </div>

          {/* ══ Khu kết quả tra cứu — chiếm phần còn lại, tự cuộn ══ */}
          <div className="dtph-info-split">
            <div className="dtph-info-top">
              <div className="dtph-info-result-area">
                <MatchResults searchQuery={searchQuery} data={data} />
              </div>
            </div>

            <hr className="dtph-info-hr" />

            {/* ══ Khu textarea + bảng IPA — chiều cao CỐ ĐỊNH 500px / 100px ══ */}
            <div
              className="dtph-info-bottom"
              style={{ height: `${bottomHeight}px` }}
            >
              <div className="row g-3 h-100">
                <div className="col-12 col-md-8 h-100">
                  <div className="dtph-info-textarea-wrap">
                    <label className="dtph-info-textarea-label">
                      Phiên âm đã chọn:
                    </label>
                    <textarea
                      className="textarea-practice w-100"
                      id="clearClassForTable"
                      placeholder="Nhập phiên âm tại đây…"
                    ></textarea>
                  </div>
                </div>
                <div className="col-12 col-md-4 h-100">
                  <div className="dtph-ipa-panel">
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
                          {[
                            "Ei",
                            "Ai",
                            "Oi",
                            "Ơu",
                            "Au",
                            "I-ơ",
                            "E-ơ",
                            "U-ơ",
                          ].map((v) => (
                            <td key={v}>{v}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                    <i className="d-block small text-muted mt-1">
                      Xuất phát từ phiên âm (1) Xác định UE OAI Ơ (2) Ghép
                      trước, ghép sau (3) Đọc trước to rõ, sau ngắn nhẹ, theo xu
                      hướng âm từ trái sang phải, từ âm chính sang âm dấu!
                    </i>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-info py-0 px-1"
                      title="Gửi bài tập"
                      onClick={() => {
                        try {
                          const element =
                            document.getElementById("clearClassForTable");

                          if (!element) {
                            console.warn("Không tìm thấy #clearClassForTable");
                            return;
                          }

                          const dataGET = element.value;

                          socket.emit("messageReg", {
                            text: `BTJSON${JSON.stringify({
                              type: "gheptu",
                              data: dataGET,
                            })}`,
                            time: null,
                            type: "text",
                            id: null,
                          });
                        } catch (error) {
                          console.error("Lỗi khi tạo bài tập ghép từ:", error);
                        }
                      }}
                    >
                      Bài tập ghép từ#1
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
