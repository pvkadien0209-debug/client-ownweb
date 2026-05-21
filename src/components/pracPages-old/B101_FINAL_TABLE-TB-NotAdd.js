import React from "react";

// Function to check if the element is an image URL
const isImageUrl = (url) => {
  return /\.(jpeg|jpg|gif|png|webp|svg)$/.test(url);
};

const TableTB = ({ data, color }) => {
  try {
    const ColorP =
      color !== undefined ? "2px solid " + color : "1px solid #ccc";

    const containerStyle = {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      cursor: "pointer",
      marginBottom: "15px",
    };

    const textStyle = {
      padding: "10px",
      border: ColorP,
      borderRadius: "4px",
      backgroundColor: "#f9f9f9",
      maxWidth: "150px",
      textAlign: "center",
    };

    const imageStyle = {
      maxWidth: "150px",
      maxHeight: "150px",
      objectFit: "cover",
      borderRadius: "4px",
      border: "1px solid #ccc",
    };

    return (
      <div style={containerStyle}>
        {data.map((element, index) => (
          <div key={index}>
            {isImageUrl(element) ? (
              <img src={element} alt={`element-${index}`} style={imageStyle} />
            ) : (
              <div style={textStyle}>{element}</div>
            )}
          </div>
        ))}
      </div>
    );
  } catch (error) {
    return null;
  }
};

export default TableTB;
