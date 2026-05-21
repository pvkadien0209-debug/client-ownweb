import { useEffect, useState } from "react";

function TableHD({ data, HINT }) {
  try {
    const colorMapping = {
      X: "green",
      XX: "dodgerblue",
      [HINT]: "red",
      MM: "purple",
      XXX: "black",
    };

    // Extract headers from the keys of the first object
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    return (
      <table className="table table-striped" style={{ whiteSpace: "pre-line" }}>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td key={colIndex}>
                  {colorMapping[row[header]] ? (
                    <span
                      style={{
                        padding: "0 25px",
                        backgroundColor: colorMapping[row[header]],
                        borderRadius: "5px",
                      }}
                    ></span>
                  ) : (
                    row[header]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  } catch (error) {
    return null;
  }
}

export default TableHD;
