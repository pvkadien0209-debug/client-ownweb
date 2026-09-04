import React, { useState, useEffect, useRef } from "react";
import { socket } from "../App";
import ChatInput from "./ChatInput";
import { useNavigate } from "react-router-dom";
import SpeechRecognition from "react-speech-recognition";
import ChatBaitap from "./ChatWidgetBaitap";
import {
  handle_cmd_f_admin,
  tachStringTheoHttp,
  getGroupColor,
  getGroupDisplayName,
} from "../ulti/chatUlti";

const ChatWidget = () => {
  const [chatHistory, setChatHistory] = useState({});
  const [NotifyHistory, setNotifyHistory] = useState([]);
  const [onlineNumber, setOnlineNumber] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentGroup, setCurrentGroup] = useState(
    localStorage.getItem("groupChat") || "all",
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("nameDinhDanh") || "",
  );
  const [isEditingName, setIsEditingName] = useState(
    !localStorage.getItem("nameDinhDanh"),
  );
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  /* ── Popup bài tập — lưu trực tiếp msg.text (chuỗi chứa BTJSON), null = đóng ── */
  const [baitapPopup, setBaitapPopup] = useState(null);

  let numberMark = 1;
  // Khởi tạo lịch sử chat cho tất cả các nhóm
  useEffect(() => {
    const initialChatHistory = {
      all: [],
      group1: [],
      group2: [],
      group3: [],
      group4: [],
      group5: [],
      group6: [],
      group7: [],
      group8: [],
      group9: [],
      group10: [],
    };
    setChatHistory(initialChatHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem("groupChat", currentGroup);
  }, [currentGroup]);

  useEffect(() => {
    socket.on("message", (newMessage) => {
      if (newMessage.type === "notify") {
        setNotifyHistory((prevHistory) => {
          const filteredHistory = prevHistory.filter(
            (item) => item.id !== newMessage.id,
          );
          return [newMessage, ...filteredHistory];
        });
      } else {
        // Xác định nhóm của tin nhắn (mặc định là 'all' nếu không có group)
        const messageGroup = newMessage.group || "all";
        setChatHistory((prevHistory) => ({
          ...prevHistory,
          [messageGroup]: [...(prevHistory[messageGroup] || []), newMessage],
        }));
        // Xử lý admin commands
        handle_cmd_f_admin(newMessage, navigate, setIsOpen);
      }
      if (!isOpen) {
        setUnreadCount((prevCount) => prevCount + 1);
      }
    });
    socket.on("onlineNumber", (newNumber) => {
      setOnlineNumber(newNumber);
    });
    socket.on("messageHistory", (history) => {
      let historyMessage = {
        all: [],
        group1: [],
        group2: [],
        group3: [],
        group4: [],
        group5: [],
        group6: [],
        group7: [],
        group8: [],
        group9: [],
        group10: [],
      };
      let historyNotify = [];
      history.forEach((e) => {
        if (e.type && e.type === "notify") {
          historyNotify.push(e);
        } else {
          const messageGroup = e.group || "all";
          if (historyMessage[messageGroup]) {
            historyMessage[messageGroup].push(e);
          }
        }
      });
      setChatHistory(historyMessage);
      setNotifyHistory(historyNotify);
    });
    return () => {
      socket.off("message");
      socket.off("onlineNumber");
      socket.off("messageHistory");
    };
  }, [isOpen, navigate]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [chatHistory, isOpen, currentGroup]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleNameChange = (e) => {
    // Limit input to 8 characters
    if (e.target.value.length <= 8) {
      setUserName(e.target.value);
    }
  };

  const saveUserName = () => {
    if (userName.trim()) {
      localStorage.setItem("nameDinhDanh", userName);
      setIsEditingName(false);
    }
  };

  const handleEditName = () => {
    setUserName(""); // Reset name field
    setIsEditingName(true);
  };

  const handleGroupChange = (e) => {
    setCurrentGroup(e.target.value);
  };

  const currentGroupColor = getGroupColor(currentGroup);
  const currentChatHistory = chatHistory[currentGroup] || [];

  const containerStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: isOpen ? "400px" : "70px",
    height: isOpen ? "80vh" : "70px",
    borderRadius: isOpen ? "16px" : "50%",
    overflow: "hidden",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1050,
    boxShadow: isOpen
      ? "0 10px 40px rgba(0, 0, 0, 0.15)"
      : "0 8px 25px rgba(0, 0, 0, 0.15)",
    border: isOpen ? "1px solid #e9ecef" : "3px solid #ffffff",
  };

  // Chat icon when closed - with favicon background
  const chatIconStyle = {
    width: "70px",
    height: "70px",
    background: `linear-gradient(135deg, ${currentGroupColor} 0%, ${currentGroupColor}aa 100%)`,
    borderRadius: "50%",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    backgroundImage: `url('https://i.postimg.cc/Bv9MGGy8/favicon-ico.png')`,
    backgroundSize: "70px 60px",
    backgroundPosition: "calc(50% - 3px) center", // Moved 5px to the left from center
    backgroundRepeat: "no-repeat",
  };

  const headerStyle = {
    padding: "12px 16px",
    background: `linear-gradient(135deg, ${currentGroupColor} 0%, ${currentGroupColor}dd 100%)`,
    color: "white",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "background 0.3s ease",
  };

  const notifyStyle = {
    padding: isOpen ? "8px 12px" : "0px",
    height: isOpen ? "auto" : "0px",
    maxHeight: isOpen ? "110px" : "0px",
    background: "#f8f9fa",
    borderBottom: "1px solid #e9ecef",
    overflowY: "auto",
    transition: "all 0.3s ease",
  };

  const notifyNameStyle = {
    padding: isOpen ? "10px 16px" : "0px",
    height: isOpen ? "auto" : "0px",
    background: "#e3f2fd",
    borderBottom: "1px solid #e9ecef",
    fontSize: "small",
    transition: "all 0.3s ease",
    overflow: "hidden",
  };

  const groupSelectStyle = {
    padding: isOpen ? "8px 16px" : "0px",
    height: isOpen ? "auto" : "0px",
    background: `${currentGroupColor}15`,
    borderBottom: "1px solid #e9ecef",
    transition: "all 0.3s ease",
    overflow: "hidden",
  };

  const historyStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    background: "#fafafa",
    listStyleType: "none",
    margin: 0,
  };

  const messageStyle = {
    marginBottom: "12px",
    padding: "12px",
    background: "white",
    borderRadius: "12px",
    fontSize: "14px",
    border: `1px solid ${currentGroupColor}30`,
    borderLeft: `4px solid ${currentGroupColor}`,
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  const notificationItemStyle = {
    background: "white",
    border: "1px solid #e9ecef",
    borderRadius: "6px",
    padding: "6px 8px",
    marginBottom: "4px",
    fontSize: "11px",
    color: "#6c757d",
    display: "inline-block",
    marginRight: "4px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  };

  return (
    <>
      {/* Bootstrap CSS */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
        rel="stylesheet"
      />
      <style jsx>{`
        .chat-icon-hover:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25) !important;
        }
        .chat-header-hover:hover {
          background: linear-gradient(
            135deg,
            ${currentGroupColor}ee 0%,
            ${currentGroupColor}bb 100%
          ) !important;
        }
        .message-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        .chat-input-focus:focus {
          border-color: ${currentGroupColor} !important;
          box-shadow: 0 0 0 2px ${currentGroupColor}33 !important;
        }
        .btn-chat-save {
          background: ${currentGroupColor};
          border-color: ${currentGroupColor};
          transition: all 0.2s ease;
        }
        .btn-chat-save:hover {
          background: ${currentGroupColor}dd;
          border-color: ${currentGroupColor}dd;
        }
        .btn-chat-edit {
          color: ${currentGroupColor};
          border-color: ${currentGroupColor};
          background: transparent;
          transition: all 0.2s ease;
        }
        .btn-chat-edit:hover {
          background: ${currentGroupColor};
          border-color: ${currentGroupColor};
          color: white;
        }
        .group-select {
          border-color: ${currentGroupColor};
          background-color: white;
        }
        .group-select:focus {
          border-color: ${currentGroupColor};
          box-shadow: 0 0 0 2px ${currentGroupColor}33;
        }
        .unread-badge-animation {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        @media (max-width: 768px) {
          .chat-container-mobile {
            width: ${isOpen ? "350px" : "60px"} !important;
            height: ${isOpen ? "80vh" : "60px"} !important;
          }
          .chat-icon-mobile {
            width: 60px !important;
            height: 60px !important;
            background-size: 35px 35px !important;
          }
        }
        @media (max-width: 480px) {
          .chat-container-mobile {
            width: ${isOpen ? "300px" : "55px"} !important;
            height: ${isOpen ? "80vh" : "55px"} !important;
          }
          .chat-icon-mobile {
            width: 55px !important;
            height: 55px !important;
            background-size: 30px 30px !important;
          }
        }
      `}</style>
      <div style={containerStyle} className="chat-container-mobile">
        {!isOpen ? (
          <div
            style={chatIconStyle}
            className="chat-icon-hover chat-icon-mobile position-relative"
            onClick={toggleChat}
          >
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger unread-badge-animation"
                style={{ fontSize: "10px", minWidth: "20px" }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        ) : (
          <>
            {/* Notification Section */}
            <div style={notifyStyle} className="chat-scrollbar">
              {NotifyHistory.slice(0, 9).map((msg, index) => (
                <div key={index} style={notificationItemStyle}>
                  <i className="bi bi-info-circle me-1"></i>
                  {msg.text} <small className="text-muted">({msg.time})</small>
                </div>
              ))}
            </div>
            {/* User Name Section */}
            {isEditingName ? (
              <div style={notifyNameStyle}>
                <div className="d-flex align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm me-2 chat-input-focus"
                    value={userName}
                    onChange={handleNameChange}
                    placeholder="Nhập tên (tối đa 8 ký tự)"
                    maxLength={8}
                    style={{ borderRadius: "6px", fontSize: "0.9rem" }}
                  />
                  <button
                    className="btn btn-sm btn-chat-save text-blue"
                    onClick={saveUserName}
                    style={{
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      border: "1px solid green",
                    }}
                  >
                    <i className="bi bi-check-lg"></i>
                  </button>
                </div>
              </div>
            ) : isOpen ? (
              <div style={notifyNameStyle}>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-medium text-dark">
                    <i className="bi bi-person-circle me-1"></i>
                    {userName || "Guest"}
                  </span>
                  <button
                    className="btn btn-outline-primary btn-sm btn-chat-edit"
                    onClick={handleEditName}
                    style={{ borderRadius: "6px", fontSize: "0.75rem" }}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Đổi tên
                  </button>
                </div>
              </div>
            ) : null}
            {/* Group Selection */}
            <div style={groupSelectStyle}>
              <div className="d-flex align-items-center">
                <label
                  className="form-label mb-0 me-2 text-muted"
                  style={{ fontSize: "0.8rem" }}
                >
                  <i className="bi bi-chat-dots me-1"></i>
                  Chọn nhóm:
                </label>
                <select
                  className="form-select form-select-sm group-select"
                  value={currentGroup}
                  onChange={handleGroupChange}
                  style={{ fontSize: "0.8rem", maxWidth: "200px" }}
                >
                  <option value="all">Chat Toàn Thể</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={`group${i + 1}`}>
                      Nhóm Chat {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Chat Header */}
            <div
              style={headerStyle}
              className="chat-header-hover"
              onClick={toggleChat}
            >
              <div className="d-flex align-items-center">
                <div
                  className="me-2 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "28px",
                    height: "28px",
                    backgroundImage: `url('https://i.postimg.cc/Bv9MGGy8/favicon-ico.png')`,
                    backgroundSize: "26px 26px",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  }}
                ></div>
                <div>
                  <div className="fw-semibold">
                    {getGroupDisplayName(currentGroup)}{" "}
                    {unreadCount > 0 && (
                      <span
                        className="badge bg-danger ms-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                    {userName || "Guest"} • Online: {onlineNumber}
                  </div>
                </div>
              </div>
              <i
                className="bi bi-chevron-down"
                style={{
                  fontSize: "0.7rem",
                  borderRadius: "15px",
                  padding: "10px",
                  background: "#ffffff33",
                }}
              >
                Đóng khung chat
              </i>
            </div>
            {/* Chat Messages */}
            <ul style={historyStyle} className="chat-scrollbar">
              {currentChatHistory.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i
                    className="bi bi-chat-dots display-6 d-block mb-2"
                    style={{ opacity: 0.5, color: currentGroupColor }}
                  ></i>
                  <p className="mb-0">
                    Chưa có tin nhắn nào trong{" "}
                    {getGroupDisplayName(currentGroup)}
                  </p>
                </div>
              ) : (
                currentChatHistory.map((msg, index) => (
                  <li
                    key={index}
                    style={messageStyle}
                    className="message-hover"
                  >
                    <div>
                      {msg.text.includes("http://") ||
                      msg.text.includes("https://")
                        ? tachStringTheoHttp(msg.text).map((e, i) =>
                            e.includes("http://") || e.includes("https://") ? (
                              <div key={i}>
                                <br />
                                <button
                                  className="btn btn-primary btn-sm"
                                  style={{
                                    borderRadius: "8px",
                                    background: `linear-gradient(135deg, ${currentGroupColor} 0%, ${currentGroupColor}dd 100%)`,
                                    border: "none",
                                  }}
                                  onClick={() => {
                                    SpeechRecognition.stopListening();
                                    try {
                                      const parsedUrl = new URL(e);
                                      const pathOnly =
                                        parsedUrl.pathname + parsedUrl.search;
                                      const isPhamVanDien =
                                        e.includes("/phamvandien.id.vn");
                                      const isCurrentPhamVanDien =
                                        window.location.href.includes(
                                          "/phamvandien.id.vn",
                                        );
                                      if (
                                        (isPhamVanDien &&
                                          isCurrentPhamVanDien) ||
                                        !isPhamVanDien
                                      ) {
                                        window.location.href = e;
                                        return;
                                      }
                                      if (e.includes("/roomoffline")) {
                                        navigate("/");
                                        setTimeout(() => {
                                          navigate(pathOnly);
                                        }, 500);
                                      } else {
                                        navigate(pathOnly);
                                      }
                                    } catch (err) {
                                      console.error(
                                        "Lỗi URL không hợp lệ:",
                                        err,
                                      );
                                    }
                                  }}
                                >
                                  <i className="bi bi-link-45deg me-1"></i>
                                  Bấm vào đây
                                </button>
                                <br />
                              </div>
                            ) : (
                              e
                            ),
                          )
                        : msg.text.includes("BTJSON")
                          ? "Ká Điện - Ghép âm"
                          : msg.text}

                      {/* ── Nút BÀI TẬP# — hiện khi msg.text chứa BTJSON ── */}
                      {msg.text.includes("BTJSON") && (
                        <div className="mt-2">
                          <button
                            className="btn btn-sm"
                            style={{
                              borderRadius: "8px",
                              background: `linear-gradient(135deg, ${currentGroupColor} 0%, ${currentGroupColor}dd 100%)`,
                              border: "none",
                              color: "white",
                              fontWeight: 600,
                            }}
                            onClick={() => {
                              SpeechRecognition.stopListening();
                              setBaitapPopup(msg.text);
                            }}
                          >
                            <i className="bi bi-pencil-square me-1"></i>
                            BÀI TẬP# {numberMark}
                          </button>
                        </div>
                      )}
                    </div>
                    <div
                      className="text-end mt-2"
                      style={{ fontSize: "0.75rem", color: "#6c757d" }}
                    >
                      <i className="bi bi-clock me-1"></i>
                      {msg.time}{" "}
                      {msg.text.includes("roomoffline") && (
                        <span className="text-primary">
                          <i className="bi bi-laptop me-1"></i>
                          LÀM BÀI THỰC HÀNH
                        </span>
                      )}
                    </div>
                  </li>
                ))
              )}
              <div ref={chatEndRef} />
            </ul>
            <ChatInput currentGroup={currentGroup} />
          </>
        )}
      </div>

      {/* ══ Popup Bài tập — luôn ưu tiên hiển thị hàng đầu ══ */}
      {baitapPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "96vw",
              height: "92vh",
              maxWidth: "1100px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(15,23,42,0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: `linear-gradient(135deg, ${currentGroupColor} 0%, ${currentGroupColor}dd 100%)`,
                color: "white",
                flexShrink: 0,
              }}
            >
              <span className="fw-semibold">
                <i className="bi bi-pencil-square me-2"></i>
                Bài tập
              </span>
              <button
                className="btn btn-sm"
                style={{
                  background: "rgba(255,255,255,0.25)",
                  border: "none",
                  color: "white",
                  borderRadius: "8px",
                }}
                onClick={() => setBaitapPopup(null)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              <ChatBaitap data={baitapPopup} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
