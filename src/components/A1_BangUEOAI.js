import { useState, useCallback } from "react";
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
  // các id đang được highlight tại thời điểm hiện tại
  const [activeIds, setActiveIds] = useState(() => new Set());
  const toggleHighlight = useCallback((id) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id); // đang highlight -> bỏ highlight
      } else {
        next.add(id); // chưa highlight -> bật highlight
      }
      return next;
    });
  }, []);
  const handleClick = useCallback(
    (id) => (e) => {
      e.stopPropagation(); // không cho bubble lên cha (table)
      toggleHighlight(id);
    },
    [toggleHighlight],
  );
  const withHighlight = (style, id) => ({
    ...style,
    backgroundColor: activeIds.has(id) ? HIGHLIGHT_BG : "transparent",
    transition: "background-color 0.4s ease",
  });
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
      <i style={{ fontSize: "16px", color: "#555" }}>
        {[
          "(0) Tìm phiên âm IPA → ",
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
      </i>
    </div>
  );
}
export default BangUEOAI;
