import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, json } from "react-router-dom";

const DataPracticeComponent = ({
  roomCode,
  currentIndex,
  setStartToGetData,
  fetchTitle,
}) => {
  // State quản lý tên người dùng
  const [userName, setUserName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [startToGetData, setStartToGetDataLocal] = useState(false);
  const [hasExistingName, setHasExistingName] = useState(false);

  // Khởi tạo state - kiểm tra tên đã tồn tại chưa
  useEffect(() => {
    const savedName = localStorage.getItem("nameDinhDanh") || "";
    if (savedName) {
      setUserName(savedName);
      setHasExistingName(true);
      setIsEditingName(false);
    } else {
      setHasExistingName(false);
      setIsEditingName(false);
    }
  }, []);

  // Xử lý thay đổi tên
  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length <= 8) {
      setUserName(value);
    }
  };

  // Lưu tên người dùng
  const saveUserName = () => {
    const trimmedName = userName.trim();
    if (trimmedName) {
      setIsEditingName(false);
      setHasExistingName(true);
      localStorage.setItem("nameDinhDanh", trimmedName);
      console.log("Đã lưu tên:", trimmedName);
    } else {
      alert("Vui lòng nhập tên!");
    }
  };

  // Xử lý chỉnh sửa tên
  const handleEditName = () => {
    setIsEditingName(true);
  };

  // Mock function lấy dữ liệu
  const handleFetchTitle = () => {
    if (!hasExistingName) {
      alert("Vui lòng nhập tên trước khi lấy dữ liệu!");
      return;
    }
    console.log("Đang lấy dữ liệu thực hành...");
    setStartToGetDataLocal(true);
    if (setStartToGetData) setStartToGetData(true);
    if (fetchTitle) {
      fetchTitle();
    } else {
      // Fallback nếu không có fetchTitle prop
      setTimeout(() => {
        alert("Dữ liệu đã được lấy thành công!");
        setStartToGetDataLocal(false);
        if (setStartToGetData) setStartToGetData(false);
      }, 1000);
    }
  };

  // Mock navigate function
  const navigate = useNavigate();

  // Styles
  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
    padding: "20px",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
    fontSize: "2.5rem",
    fontWeight: "bold",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    alignItems: "start",
  };

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  };

  const nameInputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "1.1rem",
    textAlign: "center",
    marginBottom: "15px",
    outline: "none",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px 20px",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "10px",
    transition: "background-color 0.3s ease",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#0070f3",
    color: "white",
    height: "100px",
    fontSize: "large",
  };

  const successButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#28a745",
    color: "white",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d",
    color: "white",
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#ccc",
    color: "#666",
    cursor: "not-allowed",
    opacity: 0.6,
    height: "100px",
  };

  const logoStyle = {
    width: "100%",
    maxWidth: "200px",
    border: "2px solid #0070f3",
    borderRadius: "15px",
    cursor: hasExistingName ? "pointer" : "not-allowed",
    transition: "transform 0.3s ease",
    opacity: hasExistingName ? 1 : 0.5,
    marginBottom: "20px",
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Dữ liệu thực hành</h1>

      <div style={gridStyle}>
        {/* Cột 1: Logo */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: "20px", color: "#333" }}>PVD ENGLISH</h3>
          <img
            src="https://i.postimg.cc/Bv9MGGy8/favicon-ico.png"
            style={logoStyle}
            onClick={() => {
              if (hasExistingName) {
                navigate(
                  "/learninghub/" +
                    (roomCode || "DEMO123") +
                    "?ls=" +
                    (currentIndex || 0) +
                    "&&Fid=div_01_content_table_to_practice"
                );
              } else {
                alert("Vui lòng nhập tên trước khi tiếp tục!");
              }
            }}
            onMouseOver={(e) => {
              if (hasExistingName) {
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          />
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Bấm để chuyển đến trang bảng thông tin thực hành
          </p>
        </div>

        {/* Cột 2: Thông tin nhập */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: "20px", color: "#333" }}>
            👤 Thông tin nhập
          </h3>

          {/* Trường hợp đã có tên */}
          {hasExistingName && !isEditingName && (
            <div>
              <div
                style={{
                  backgroundColor: "#e8f5e8",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  border: "1px solid #28a745",
                }}
              >
                <p style={{ margin: 0, fontWeight: "bold", color: "#155724" }}>
                  ✅ Tên đã lưu: {userName}
                </p>
              </div>
              <button
                onClick={handleEditName}
                style={secondaryButtonStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#5a6268";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#6c757d";
                }}
              >
                ✏️ Đổi tên
              </button>
              <button
                onClick={handleFetchTitle}
                style={
                  startToGetData ? disabledButtonStyle : primaryButtonStyle
                }
                disabled={startToGetData}
                onMouseOver={(e) => {
                  if (!startToGetData) {
                    e.currentTarget.style.backgroundColor = "#0059c1";
                  }
                }}
                onMouseOut={(e) => {
                  if (!startToGetData) {
                    e.currentTarget.style.backgroundColor = "#0070f3";
                  }
                }}
              >
                {startToGetData ? (
                  <span>🔄 Đang lấy dữ liệu...</span>
                ) : (
                  <span>🚀 Lấy dữ liệu</span>
                )}
              </button>
            </div>
          )}

          {/* Trường hợp chưa có tên hoặc đang chỉnh sửa */}
          {(!hasExistingName || isEditingName) && (
            <div>
              <p style={{ marginBottom: "15px", color: "#666" }}>
                Vui lòng nhập tên của bạn
              </p>
              <input
                type="text"
                value={userName}
                onChange={handleNameChange}
                placeholder="Nhập tên (tối đa 8 ký tự)"
                maxLength={8}
                style={nameInputStyle}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    saveUserName();
                  }
                }}
                autoFocus
              />
              <button
                onClick={saveUserName}
                style={successButtonStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#218838";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#28a745";
                }}
              >
                ✓ Lưu tên
              </button>
              <button
                onClick={handleFetchTitle}
                style={disabledButtonStyle}
                disabled={true}
              >
                🔒 Lấy dữ liệu (cần nhập tên)
              </button>
            </div>
          )}

          <p style={{ marginTop: "15px", color: "#666", fontSize: "0.9rem" }}>
            Tên sẽ được lưu để sử dụng cho lần sau
          </p>
        </div>

        {/* Cột 3: Hướng dẫn */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: "20px", color: "#333" }}>📋 Hướng dẫn</h3>
          <div
            style={{
              textAlign: "left",
              lineHeight: "1.6",
              fontSize: "0.95rem",
            }}
          >
            {hasExistingName ? (
              <>
                <p>
                  <strong>🚀 Lấy dữ liệu:</strong> Bấm nút "Lấy dữ liệu" để tải
                  dữ liệu mới nhất
                </p>
                <p>
                  <strong>📖 Thực hành:</strong> Bấm vào logo để chuyển đến
                  trang bảng thông tin thực hành
                </p>
                <p>
                  <strong>✏️ Đổi tên:</strong> Bấm nút "Đổi tên" để thay đổi tên
                  hiện tại
                </p>
                <p>
                  <strong>💾 Tự động lưu:</strong> Tên của bạn sẽ được lưu tự
                  động
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>1.</strong> Nhập tên của bạn (tối đa 8 ký tự)
                </p>
                <p>
                  <strong>2.</strong> Bấm nút "Lưu tên" để xác nhận
                </p>
                <p>
                  <strong>3.</strong> Sau khi lưu tên, bạn có thể:
                </p>
                <p style={{ paddingLeft: "15px" }}>
                  • Lấy dữ liệu thực hành
                  <br />• Chuyển đến trang thực hành
                </p>
                <p>
                  <strong>⚠️ Lưu ý:</strong> Phải nhập tên trước khi sử dụng các
                  tính năng
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPracticeComponent;
