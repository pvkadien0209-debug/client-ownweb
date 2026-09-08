import { useState, useCallback, useRef, useEffect } from "react";
function BangUEOAI() {
  const cellStyle = {
    padding: "3px 6px",
    border: "1px solid #ddd",
    textAlign: "center",
    verticalAlign: "top",
    cursor: "pointer",
  };
  const tableStyle = {
    borderCollapse: "collapse",
    border: "5px solid purple",
    width: "100%",
    marginBottom: "6px",
    cursor: "pointer",
  };
  const ipaStyle = { color: "#999", fontSize: "16px" };
  const arrowStyle = { color: "#bbb", fontSize: "11px", margin: "0 2px" };
  const wordStyle = { color: "#000", fontWeight: "bold" };
  const HIGHLIGHT_BG = "#fff59d";
  const BLINK_ANIMATION_NAME = "bangUEOAIBlink";
  const BLINK_DURATION_MS = 400; // tổng thời gian nhấp nháy trước khi dừng lại ở màu
  const BLINK_STEP_MS = 200; // mỗi lần chớp
  const BLINK_ITERATIONS = BLINK_DURATION_MS / BLINK_STEP_MS;
  // các id đang được highlight tại thời điểm hiện tại
  const [activeIds, setActiveIds] = useState(() => new Set());
  // các id đang trong giai đoạn nhấp nháy (1s đầu sau khi bật highlight)
  const [blinkingIds, setBlinkingIds] = useState(() => new Set());
  // lưu timeout của từng id để có thể huỷ khi cần (tắt sớm / clear all / unmount)
  const blinkTimersRef = useRef({});
  useEffect(() => {
    return () => {
      Object.values(blinkTimersRef.current).forEach(clearTimeout);
      blinkTimersRef.current = {};
    };
  }, []);
  const clearBlinkTimer = useCallback((id) => {
    if (blinkTimersRef.current[id]) {
      clearTimeout(blinkTimersRef.current[id]);
      delete blinkTimersRef.current[id];
    }
  }, []);
  const toggleHighlight = useCallback(
    (id) => {
      setActiveIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          // đang highlight -> bỏ highlight (tắt luôn nhấp nháy nếu có)
          next.delete(id);
          clearBlinkTimer(id);
          setBlinkingIds((prevBlink) => {
            if (!prevBlink.has(id)) return prevBlink;
            const nb = new Set(prevBlink);
            nb.delete(id);
            return nb;
          });
        } else {
          // chưa highlight -> bật highlight kèm nhấp nháy 1s rồi mới dừng lại ở màu
          next.add(id);
          setBlinkingIds((prevBlink) => {
            const nb = new Set(prevBlink);
            nb.add(id);
            return nb;
          });
          clearBlinkTimer(id);
          blinkTimersRef.current[id] = setTimeout(() => {
            setBlinkingIds((prevBlink) => {
              if (!prevBlink.has(id)) return prevBlink;
              const nb = new Set(prevBlink);
              nb.delete(id);
              return nb;
            });
            delete blinkTimersRef.current[id];
          }, BLINK_DURATION_MS);
        }
        return next;
      });
    },
    [clearBlinkTimer],
  );
  const handleClick = useCallback(
    (id) => (e) => {
      e.stopPropagation(); // không cho bubble lên cha (table)
      toggleHighlight(id);
    },
    [toggleHighlight],
  );
  // bấm nút gôm -> xoá hết highlight toàn bộ (thay cho double click trước đây)
  const clearAllHighlights = useCallback(() => {
    Object.values(blinkTimersRef.current).forEach(clearTimeout);
    blinkTimersRef.current = {};
    setActiveIds(new Set());
    setBlinkingIds(new Set());
  }, []);
  const withHighlight = (style, id) => {
    const isBlinking = blinkingIds.has(id);
    const isActive = activeIds.has(id);
    if (isBlinking) {
      return {
        ...style,
        animation: `${BLINK_ANIMATION_NAME} ${BLINK_STEP_MS}ms ease-in-out ${BLINK_ITERATIONS}`,
        animationFillMode: "forwards",
      };
    }
    return {
      ...style,
      backgroundColor: isActive ? HIGHLIGHT_BG : "transparent",
      transition: "background-color 0.4s ease",
    };
  };
  // map: mỗi ô = [ipa1, ipa2, ...] -> chữ thay thế
  const groupUEOAI = [
    { head: "U", ipas: ["uː", "ʊ"], word: "U" },
    { head: "E", ipas: ["e", "ɛ"], word: "E" },
    { head: "O", ipas: ["ɒ", "ɔː"], word: "O" },
    { head: "A", ipas: ["ɑː", "æ", "ʌ"], word: "A" },
    { head: "I", ipas: ["iː", "ɪ"], word: "I" },
    { head: "Ơ", ipas: ["ɜː", "ə"], word: "Ơ" },
  ];
  const groupDouble = [
    { ipa: "eɪ", word: "Ei" },
    { ipa: "aɪ", word: "Ai" },
    { ipa: "ɔɪ", word: "Oi" },
    { ipa: "əʊ", word: "Ơu" },
    { ipa: "aʊ", word: "Au" },
    { ipa: "ɪə", word: "I-ơ" },
    { ipa: "eə", word: "E-ơ" },
    { ipa: "ʊə", word: "U-ơ" },
  ];
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        lineHeight: 1.3,
        fontSize: "18px",
        padding: "10px",
        maxWidth: "480px",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "6px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <style>{`
        @keyframes ${BLINK_ANIMATION_NAME} {
          0%, 100% { background-color: ${HIGHLIGHT_BG}; }
          50% { background-color: transparent; }
        }
      `}</style>
      <i style={{ fontSize: "16px", color: "#555" }}>
        {[
          "(B) Tìm phiên âm IPA → ",
          "(1) Thay IPA bằng chữ tương ứng (in đen). ",
          "(2) Đọc trước to rõ, sau ngắn nhẹ, âm gió. ",
          "(3) Đọc theo xu hướng âm, từ trái sang phải, từ âm chính sang âm dấu.",
        ].map((text, idx) => {
          const id = `instr-${idx}`;
          return (
            <span
              key={id}
              style={withHighlight({ cursor: "pointer" }, id)}
              onClick={handleClick(id)}
            >
              {text}
            </span>
          );
        })}
      </i>{" "}
      <button
        type="button"
        onClick={clearAllHighlights}
        title="Xoá toàn bộ highlight"
        aria-label="Xoá toàn bộ highlight"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          verticalAlign: "middle",
          width: "26px",
          height: "26px",
          padding: 0,
          border: "1px solid #ccc",
          borderRadius: "5px",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <g transform="rotate(-45 12 12)">
            <rect
              x="4"
              y="8"
              width="16"
              height="8"
              rx="2"
              fill="#f48fb1"
              stroke="#555"
              strokeWidth="1"
            />
            <rect
              x="4"
              y="8"
              width="8"
              height="8"
              rx="2"
              fill="#90caf9"
              stroke="#555"
              strokeWidth="1"
            />
          </g>
        </svg>
      </button>
      <table
        style={withHighlight(tableStyle, "table-ueoai")}
        onClick={handleClick("table-ueoai")}
      >
        <tbody>
          <tr>
            {groupUEOAI.map((g) => {
              const tdId = `td-ueoai-${g.head}`;
              return (
                <td
                  key={g.head}
                  style={withHighlight(cellStyle, tdId)}
                  onClick={handleClick(tdId)}
                >
                  <span style={ipaStyle}>{g.ipas.join(" / ")}</span>
                  <br />
                  <span style={arrowStyle}>↓</span>
                  <br />
                  <span style={wordStyle}>{g.word}</span>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
      <table
        style={withHighlight(tableStyle, "table-double")}
        onClick={handleClick("table-double")}
      >
        <tbody>
          <tr>
            {groupDouble.map((g) => {
              const tdId = `td-double-${g.ipa}`;
              return (
                <td
                  key={g.ipa}
                  style={withHighlight(cellStyle, tdId)}
                  onClick={handleClick(tdId)}
                >
                  <span style={ipaStyle}>{g.ipa}</span>
                  <br />
                  <span style={arrowStyle}>↓</span>
                  <br />
                  <span style={wordStyle}>{g.word}</span>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
      <div style={{ fontSize: "14px", color: "#555", marginTop: "10px" }}>
        <hr />
        <i>
          Tiếng Việt và tiếng Anh có nhiều điểm khác biệt trong phát âm, nhưng
          giữa hai ngôn ngữ vẫn tồn tại những nét tương đồng có thể tận dụng.
          Phương pháp này bắt đầu từ việc{" "}
          <strong>tìm ra cái quen thuộc để làm cầu nối</strong>, rồi từng bước
          làm quen và dung hòa những điểm khác biệt. Nhờ đó, việc học phát âm
          tiếng Anh trở nên{" "}
          <strong>
            dễ tiếp cận hơn, bớt cảm giác xa lạ và đặc biệt là có logic để hiểu,
            ghi nhớ và vận dụng
          </strong>
          .
        </i>{" "}
      </div>
    </div>
  );
}
export default BangUEOAI;
