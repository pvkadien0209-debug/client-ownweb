function BangUEOAI() {
  const cellStyle = { padding: "6px 10px", border: "1px solid #ddd" };
  const tableStyle = {
    borderCollapse: "collapse",
    width: "100%",
    marginBottom: "12px",
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        lineHeight: 1.4,
        fontSize: "16px",
        padding: "16px",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <table style={tableStyle}>
        <thead>
          <tr>
            {["U", "E", "O", "A", "I", "Ơ"].map((h) => (
              <td key={h} style={{ ...cellStyle, fontWeight: "bold" }}>
                {h}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cellStyle}>
              uː
              <br />ʊ
            </td>
            <td style={cellStyle}>
              e<br />ɛ
            </td>
            <td style={cellStyle}>
              ɒ<br />
              ɔː
            </td>
            <td style={cellStyle}>
              ɑː
              <br />æ<br />ʌ
            </td>
            <td style={cellStyle}>
              iː
              <br />ɪ
            </td>
            <td style={cellStyle}>
              ɜː
              <br />ə
            </td>
          </tr>
        </tbody>
      </table>

      <table style={tableStyle}>
        <thead>
          <tr>
            {["eɪ", "aɪ", "ɔɪ", "əʊ", "aʊ", "ɪə", "eə", "ʊə"].map((h) => (
              <td key={h} style={{ ...cellStyle, fontWeight: "bold" }}>
                {h}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {["Ei", "Ai", "Oi", "Ơu", "Au", "I-ơ", "E-ơ", "U-ơ"].map((v) => (
              <td key={v} style={cellStyle}>
                {v}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <b>
        (1) Xác định UE OAI Ơ (2) Ghép trước, ghép sau (3) Đọc trước to rõ, sau
        ngắn nhẹ, theo xu hướng âm từ trái sang phải, từ âm chính sang âm dấu!
      </b>
    </div>
  );
}

export default BangUEOAI;
