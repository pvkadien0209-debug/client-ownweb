import React from "react";

const RegButton = ({ setGetSTTDictaphone }) => {
  const buttonStyle = {
    // position: "fixed",
    // top: "16%",
    // right: "7%",
    padding: "10px 20px",
    margin: "20px",
    fontSize: "1.5rem",
    color: "white",
    backgroundColor: "red",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.3s",
  };

  const buttonHoverStyle = {
    // backgroundColor: "#45a049",
    transform: "scale(1.05)",
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      id="RegButton"
      style={isHovered ? { ...buttonStyle, ...buttonHoverStyle } : buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setGetSTTDictaphone(true)}
    >
      <i className="bi bi-mic-fill"></i>
    </button>
  );
};

export default RegButton;
