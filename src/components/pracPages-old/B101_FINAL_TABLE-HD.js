import { useEffect, useState } from "react";

function TableHD({ data, data_TB, HINT, fnOnclick }) {
  // Add global style to prevent text selection in this component
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

    // Extract headers from the keys of the first object
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    // Format data_TB into a flat array of strings
    const data_TB_newformat = data_TB.flatMap((row) =>
      row.map((item) => String(item))
    );

    return (
      <table
        className="table table-striped no-copy-table"
        style={{
          textAlign: "left",
          whiteSpace: "pre-line",
          margin: "5%",
          width: "90%",
          cursor: "pointer",
          border: "1px solid black",
          borderRadius: "5px",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          userSelect: "none",
        }}
        onCopy={(e) => e.preventDefault()}
      >
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => {
                const cellValue = String(row[header] || "");
                const isHighlighted = data_TB_newformat.includes(cellValue);
                const hasAsterisk = cellValue.includes("(*)");
                const hasQuestion = cellValue.includes("?");

                return (
                  <td
                    style={{
                      fontWeight: hasQuestion ? "bold" : "initial",
                      fontSize: hasAsterisk ? "larger" : "large",
                      color: hasAsterisk ? "blue" : "inherit",
                      WebkitUserSelect: "none",
                      MozUserSelect: "none",
                      msUserSelect: "none",
                      userSelect: "none",
                    }}
                    key={colIndex}
                    onClick={() => {
                      if (isHighlighted) {
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
                      ></span>
                    ) : isImageUrl(row[header]) ? (
                      <img
                        src={row[header]}
                        alt={`element-${rowIndex}`}
                        style={imageStyle}
                      />
                    ) : (
                      <div
                        style={
                          isHighlighted
                            ? {
                                borderBottom: "4px solid blue",
                                borderLeft: "1px solid blue",
                                padding: "15px",
                                borderRadius: "8px",
                                backgroundColor: "#f0f8ff",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                              }
                            : {}
                        }
                      >
                        {isHighlighted && (
                          <i
                            style={{ color: "green" }}
                            className="bi bi-hand-index-thumb"
                          >
                            {" "}
                          </i>
                        )}{" "}
                        {row[header]}{" "}
                      </div>
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

// Helper functions
const isImageUrl = (url) => {
  if (typeof url !== "string") return false;
  return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
};

const imageStyle = {
  maxWidth: "250px",
  maxHeight: "250px",
  objectFit: "cover",
  borderRadius: "4px",
  border: "2px solid green",
};
