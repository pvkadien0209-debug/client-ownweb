function BangUEOAI() {
  const cellStyle = {
    padding: "3px 6px",
    border: "1px solid #ddd",
    textAlign: "center",
    verticalAlign: "top",
  };
  const tableStyle = {
    borderCollapse: "collapse",
    width: "100%",
    marginBottom: "6px",
  };
  const ipaStyle = { color: "#999", fontSize: "16px" };
  const arrowStyle = { color: "#bbb", fontSize: "11px", margin: "0 2px" };
  const wordStyle = { color: "#000", fontWeight: "bold" };

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
      <table style={tableStyle}>
        {/* <thead>
          <tr>
            {groupUEOAI.map((g) => (
              <td key={g.head} style={{ ...cellStyle, fontWeight: "bold" }}>
                {g.head}
              </td>
            ))}
          </tr>
        </thead> */}
        <tbody>
          <tr>
            {groupUEOAI.map((g) => (
              <td key={g.head} style={cellStyle}>
                {/* Bước 1: IPA gốc */}
                <span style={ipaStyle}>{g.ipas.join(" / ")}</span>
                <br />
                <span style={arrowStyle}>↓</span>
                <br />
                {/* Bước 2: thay bằng chữ, in đen */}
                <span style={wordStyle}>{g.word}</span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <table style={tableStyle}>
        <tbody>
          <tr>
            {groupDouble.map((g) => (
              <td key={g.ipa} style={cellStyle}>
                <span style={ipaStyle}>{g.ipa}</span>
                <br />
                <span style={arrowStyle}>↓</span>
                <br />
                <span style={wordStyle}>{g.word}</span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <i style={{ fontSize: "16px", color: "#555" }}>
        (0) Tìm phiên âm IPA → (1) Thay IPA bằng chữ tương ứng (in đen). (2) Đọc
        trước to rõ, sau ngắn nhẹ, âm gió. (3) Đọc theo xu hướng âm, từ trái
        sang phải, từ âm chính sang âm dấu.
      </i>
    </div>
  );
}
export default BangUEOAI;
