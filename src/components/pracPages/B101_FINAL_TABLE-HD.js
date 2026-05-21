import { useEffect, useState } from "react";

function TableHD({ data, data_TB, HINT, fnOnclick, PushAW = [] }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .no-copy-table * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  try {
    const colorMapping = {
      X: "green",
      XX: "dodgerblue",
      [HINT + "#hint"]: "red",
      MM: "purple",
      XXX: "black",
    };

    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    // Flatten data_TB to strings for quick lookup
    const data_TB_flat = data_TB.flatMap((row) =>
      row.map((item) => String(item)),
    );

    return (
      <table
        className="table table-striped no-copy-table"
        style={{
          textAlign: "left",
          whiteSpace: "pre-line",
          margin: "0 4%",
          width: "92%",
          cursor: "pointer",
          border: "1px solid #d0d5dd",
          borderRadius: "8px",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: "clamp(14px, 3.5vw, 16px)",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          userSelect: "none",
          marginTop: "8px",
          marginBottom: "4px",
        }}
        onCopy={(e) => e.preventDefault()}
      >
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => {
                const cellValue = String(row[header] || "");
                const isAnswerCell = data_TB_flat.includes(cellValue);
                // Selected = was an answer cell AND is in PushAW
                const isSelected = isAnswerCell && PushAW.includes(cellValue);
                const hasAsterisk = cellValue.includes("(*)");
                const hasQuestion = cellValue.includes("?");

                return (
                  <td
                    key={colIndex}
                    style={{
                      fontWeight: hasQuestion ? "bold" : "initial",
                      fontSize: hasAsterisk ? "larger" : undefined,
                      color: hasAsterisk ? "#1a56db" : "inherit",
                      WebkitUserSelect: "none",
                      MozUserSelect: "none",
                      msUserSelect: "none",
                      userSelect: "none",
                      padding: "6px 4px",
                    }}
                    onClick={() => {
                      if (isAnswerCell) {
                        fnOnclick(cellValue, "submit");
                      } else {
                        fnOnclick(row[header], "none");
                      }
                    }}
                  >
                    {colorMapping[row[header]] ? (
                      <span
                        style={{
                          padding: "0 25px",
                          backgroundColor: colorMapping[row[header]],
                          borderRadius: "5px",
                        }}
                      />
                    ) : isImageUrl(row[header]) ? (
                      <img
                        src={row[header]}
                        alt={`element-${rowIndex}`}
                        style={imageStyle}
                      />
                    ) : isSelected ? (
                      // ── SELECTED STATE ──────────────────────────
                      <div style={selectedCellStyle}>
                        <span
                          style={{
                            color: "#16a34a",
                            fontWeight: 700,
                            marginRight: 4,
                          }}
                        >
                          ✓
                        </span>
                        {row[header]}
                      </div>
                    ) : isAnswerCell ? (
                      // ── AVAILABLE ANSWER STATE ──────────────────
                      <div style={answerCellStyle}>
                        <i
                          style={{ color: "#2563eb" }}
                          className="bi bi-hand-index-thumb"
                        >
                          {" "}
                        </i>
                        {row[header]}{" "}
                      </div>
                    ) : (
                      // ── NORMAL CELL ─────────────────────────────
                      <div>{row[header]}</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  } catch (error) {
    console.error("Error rendering TableHD:", error);
    return null;
  }
}

export default TableHD;

// ── Helpers ──────────────────────────────────────────────────────────
const isImageUrl = (url) => {
  if (typeof url !== "string") return false;
  return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
};

const imageStyle = {
  maxWidth: "min(220px, 45vw)",
  maxHeight: "220px",
  objectFit: "cover",
  borderRadius: "6px",
  border: "2px solid #16a34a",
};

// Available-to-click answer: blue underline style
const answerCellStyle = {
  borderBottom: "3px solid #2563eb",
  borderLeft: "2px solid #93c5fd",
  padding: "10px 12px",
  borderRadius: "8px",
  backgroundColor: "#eff6ff",
  boxShadow: "0 2px 5px rgba(37,99,235,0.10)",
  transition: "background 0.2s",
};

// Already selected answer: green filled style
const selectedCellStyle = {
  padding: "10px 12px",
  borderRadius: "8px",
  backgroundColor: "#dcfce7",
  border: "2px solid #16a34a",
  boxShadow: "0 2px 5px rgba(22,163,74,0.18)",
  fontWeight: 600,
  color: "#14532d",
  transition: "background 0.2s",
};
