import React, { useEffect, useState, useCallback, useMemo } from "react";
import { socket } from "../App";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import LinkAPI from "./T0_linkApi";
import read_by_Tts from "./readMessage_TtsServer";
import YouTubeVideoSearch from "../components/LearningHub/YouTubeVideoSearch";
import Nguyentacghepam from "../components/A1_BangUEOAI";
const ViewRes = ({ resultSt = [] }) => {
  // Use React hooks for animation effect
  const [prevResultLength, setPrevResultLength] = useState(0);
  // Effect to track result length changes
  useEffect(() => {
    if (resultSt && resultSt.length !== prevResultLength) {
      setPrevResultLength(resultSt?.length || 0);
    }
  }, [resultSt, prevResultLength]);
  try {
    // Define transition styles for smoother updates
    const containerStyle = {
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      lineHeight: 1.6,
      fontSize: "30px",
      padding: "12px",
      background: "#f8f9fa", // Changed from #fafafa to slightly darker
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // Increased shadow opacity
      transition: "all 2s ease-in-out",
      color: "#212529", // Changed from black to dark gray
      border: "1px solid #dee2e6", // Added border for better definition
    };
    // Common styles for result items with transitions
    const itemBaseStyle = {
      marginRight: "4px",
      padding: "2px 4px", // Increased padding
      display: "inline-block",
      borderRadius: "3px", // Added border radius
      transition:
        "color 1s ease, transform 1s ease, opacity 1s ease, background-color 1s ease",
      animation: "fadeIn 1s ease-in-out",
    };
    // Add keyframe animation for new items
    const keyframes = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes highlightNew {
        0% { background-color: rgba(3, 169, 244, 0.25); }
        100% { background-color: transparent; }
      }
    `;
    return (
      <div style={containerStyle}>
        <style>{keyframes}</style>
        {resultSt &&
          resultSt.map((item, index) => {
            const key = `res-${index}`;
            // Determine if this is a new item
            const isNew = index >= prevResultLength && prevResultLength > 0;
            const animationStyle = isNew
              ? {
                  animation: "fadeIn 0.4s ease-out, highlightNew 1.2s ease-out",
                  animationFillMode: "both",
                }
              : {};
            if (item.stt === false) {
              // Unmatched items - darker gray with background
              return (
                <i
                  key={key}
                  style={{
                    ...itemBaseStyle,
                    ...animationStyle,
                    color: "#6c757d", // Darker gray
                    backgroundColor: "#e9ecef", // Light gray background
                    borderBottom: "1px dotted #adb5bd",
                    opacity: 0.9,
                  }}
                >
                  {item.textuse}
                </i>
              );
            } else if (item.stt === true) {
              // Matched items - bold blue with light background
              return (
                <span
                  key={key}
                  style={{
                    ...itemBaseStyle,
                    ...animationStyle,
                    color: "#0d47a1", // Darker blue
                    backgroundColor: "#e3f2fd", // Light blue background
                    fontWeight: "600",
                    opacity: 1,
                  }}
                >
                  {item.textuse}
                </span>
              );
            } else if (item.stt === "check") {
              // Checked items - underlined teal with background
              return (
                <span
                  key={key}
                  style={{
                    ...itemBaseStyle,
                    ...animationStyle,
                    fontStyle: "italic",
                    color: "#004d40", // Darker teal
                    backgroundColor: "#e0f2f1", // Light teal background
                    textDecoration: "underline",
                    textDecorationStyle: "solid",
                    textDecorationColor: "#26a69a",
                    fontWeight: "500",
                  }}
                >
                  {item.textuse}
                </span>
              );
            } else {
              // Default - dark text with subtle background
              return (
                <span
                  key={key}
                  style={{
                    ...itemBaseStyle,
                    ...animationStyle,
                    color: "#343a40", // Darker default text
                    backgroundColor: "#f8f9fa", // Very light background
                  }}
                >
                  {item.textuse}
                </span>
              );
            }
          })}
      </div>
    );
  } catch (error) {
    return (
      <div
        style={{
          color: "#dc3545", // Bootstrap danger color
          padding: "12px",
          borderLeft: "4px solid #dc3545",
          backgroundColor: "#f8d7da", // Light red background
          borderRadius: "4px",
          transition: "all 0.3s ease",
          border: "1px solid #f5c6cb",
        }}
      >
        <strong>Error rendering results</strong>
      </div>
    );
  }
};
const Dictaphone = ({ CMDlist }) => {
  // State management
  const [numberTry, setNumberTry] = useState(0);
  const [SimilarCheckSet, setSimilarCheckSet] = useState("");
  const [cmdApartChat, setCmdApartChat] = useState("");
  const [idDinhDanh] = useState(() => localStorage.getItem("dinhDanh"));
  const [nameDinhDanh] = useState(
    () => localStorage.getItem("nameDinhDanh") || "",
  );
  const [resultSt, setresultSt] = useState("");
  const [sttProcessing, setsttProcessing] = useState(false);
  const [sttListenFromServer, setsttListenFromServer] = useState(false);
  // Tab state
  const [activeTab, setActiveTab] = useState(1);
  // Memoize commands to prevent unnecessary re-creation
  const commands = useMemo(
    () => [
      {
        command: [CMDlist],
        callback: (command) => {
          try {
            const interimRes = document.getElementById("interimRes");
            if (interimRes) interimRes.innerText = command;
          } catch (error) {
            console.error("Error updating interim result:", error);
          }
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: 0.5,
        bestMatchOnly: true,
      },
    ],
    [CMDlist],
  );
  // Speech recognition hook with memoized commands
  const { interimTranscript, transcript, listening, resetTranscript } =
    useSpeechRecognition({ commands });
  // Reset states when number of tries changes
  useEffect(() => {
    setresultSt("");
  }, [numberTry]);
  // Reset number of tries and function set when command list changes
  useEffect(() => {
    setNumberTry(0);
    setresultSt("");
  }, [CMDlist]);
  useEffect(() => {
    // Early return if transcript is too long (more than 2x the command length)
    if (transcript.length > CMDlist.length * 3) {
      stopListening();
      return;
    }
    if (interimTranscript === "" && transcript !== "" && CMDlist?.trim()) {
      try {
        let obj1 = {
          transcript: transcript.replace(/[^\w\s']/g, ""),
          CMDlist: CMDlist.replace(/[^\w\s']/g, ""),
        };
        let requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(obj1),
        };
        setsttProcessing(true);
        fetch(LinkAPI + "reg-Analyze", requestOptions)
          .then((res) => res.json())
          .then((json) => {
            setresultSt(json.data.resultSt);
            setCmdApartChat(json.data.CmdApartChat);
            setSimilarCheckSet(json.data.similaritySetCheckRs.join(" | "));
          })
          .finally(() => {
            setsttProcessing(false);
          });
      } catch (error) {
        console.log(error);
      }
    }
  }, [interimTranscript, transcript, CMDlist]);
  // Speech recognition control functions
  const startListening = useCallback(() => {
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
  }, []);
  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);
  // Send results handler
  const handleSendResults = useCallback(() => {
    stopListening();
    socket.emit("message", {
      text: cmdApartChat + " | " + SimilarCheckSet,
      time:
        "KQTH_" + (nameDinhDanh || (idDinhDanh ? idDinhDanh.slice(0, 4) : "")),
      group: localStorage.getItem("groupChat") || "all",
    });
    resetTranscript();
  }, [
    cmdApartChat,
    SimilarCheckSet,
    nameDinhDanh,
    idDinhDanh,
    stopListening,
    resetTranscript,
  ]);
  // Reset handler
  const handleReset = useCallback(() => {
    resetTranscript();
    setNumberTry((prev) => prev + 1);
  }, [resetTranscript]);
  // UI styles
  const containerStyles = {
    border: "1px solid #dee2e6", // Lighter border
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#ffffff", // Pure white background
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  };
  const disabledAreaStyles = {
    borderRadius: "10px",
    opacity: 0.6, // Slightly less opacity
    backgroundColor: "#f8f9fa", // Light gray instead of gray
    pointerEvents: "none",
    cursor: "not-allowed",
    border: "1px solid #dee2e6",
  };
  // Tab button styles
  const tabButtonStyles = {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "24px",
    padding: "8px",
    backgroundColor: "#f8f9fa", // Lighter background
    borderRadius: "12px",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
    border: "1px solid #dee2e6",
  };
  const getTabButtonStyle = (tabNumber) => ({
    flex: 1,
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: activeTab === tabNumber ? "#007bff" : "transparent",
    color: activeTab === tabNumber ? "#ffffff" : "#495057", // White text for active, dark gray for inactive
    boxShadow:
      activeTab === tabNumber ? "0 2px 8px rgba(0,123,255,0.3)" : "none",
    transform: activeTab === tabNumber ? "translateY(-1px)" : "none",
  });
  const tabContentStyles = {
    minHeight: "400px",
    padding: "20px",
    backgroundColor: "#ffffff", // Pure white background
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #e9ecef",
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 1:
        return (
          <div className="row">
            {/* Left column - Controls and instructions */}
            <div className="col-4">
              <button className="btn btn-info" onClick={handleReset}>
                Xóa nội dung (1)
              </button>{" "}
              <button
                id="stopListenBTN"
                className="btn btn-danger m-1"
                onClick={stopListening}
              >
                Tắt
              </button>{" "}
              {sttListenFromServer ? null : (
                <button
                  className="btn btn-primary m-1"
                  onClick={() => {
                    handleReset();
                    startListening();
                  }}
                >
                  Bắt đầu
                </button>
              )}
              <hr />
              <hr />
              <h4 style={{ color: "#495057" }}>Rèn luyện câu:</h4>
              <h2
                style={{
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  padding: "12px",
                  backgroundColor: "#e3f2fd", // Light blue background
                  borderRadius: "8px",
                  border: "1px solid #bbdefb",
                }}
                onCopy={(e) => e.preventDefault()}
              >
                <b style={{ color: "#0d47a1" }}>{CMDlist}</b>{" "}
                {/* Darker blue */}
              </h2>
              <b style={{ color: "#495057" }}>
                Bấm bắt đầu và đọc câu này lên để rèn luyện khả năng ghép âm.
              </b>
            </div>
            {/* Right column - Results display */}
            <div className="col-8">
              <h5 style={{ color: "#007bff" }}>
                {listening ? "Đang bật - Hãy nói . . ." : "Đang tắt."}{" "}
              </h5>
              {listening ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <div
                    id="divView01"
                    style={{
                      width: "100%",
                      overflow: "hidden",
                      transition: "opacity 0.5s ease-in-out",
                      marginBottom:
                        resultSt && resultSt.length > 0 ? "8px" : "0px",
                      fontFamily:
                        "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      lineHeight: 1.6,
                      fontSize: "30px",
                      opacity: resultSt && resultSt.length > 0 ? 1 : 0,
                    }}
                  >
                    <div>
                      <ViewRes resultSt={resultSt} />
                    </div>
                  </div>
                  <div
                    id="divView02"
                    style={{
                      width: "100%",
                      transition: "all 0.3s ease-in-out",
                      fontFamily:
                        "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      lineHeight: 1.6,
                      fontSize: "26px",
                      padding: "12px",
                      background: "#f8f9fa", // Light gray background
                      borderRadius: "8px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      fontStyle: "italic",
                      color: "#0d47a1", // Darker blue
                      minWidth: 0,
                      border: "1px solid #dee2e6",
                    }}
                  >
                    <i>{interimTranscript}</i>
                    <b style={{ color: "#dc3545" }}>
                      {sttProcessing ? "Đang xử lý câu nói ..." : null}
                    </b>
                  </div>
                  <hr />
                  <div
                    style={{
                      color: "#6f42c1", // Purple color
                      backgroundColor: "#f8f5ff", // Light purple background
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #e2d3f4",
                    }}
                  >
                    {SimilarCheckSet}
                  </div>
                  {sttProcessing ? (
                    <div style={{ color: "#dc3545", fontWeight: "bold" }}>
                      "Đang xử lý câu nói ..."
                    </div>
                  ) : (
                    <button
                      className="btn btn-danger"
                      onClick={handleSendResults}
                    >
                      XONG GỬI KẾT QUẢ
                    </button>
                  )}
                  <i style={{ color: "#6c757d" }}>
                    Chỉ cần (1) hoặc (2) đúng là đã đủ chuẩn thực hành.
                  </i>
                </div>
              ) : (
                <div style={disabledAreaStyles}>
                  <div style={{ padding: "16px" }}>
                    <ViewRes resultSt={resultSt} />
                    <hr />
                    <div
                      style={{
                        color: "#6f42c1",
                        backgroundColor: "#f8f5ff",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #e2d3f4",
                      }}
                    >
                      {SimilarCheckSet}
                    </div>
                    <hr />
                    <i style={{ color: "#6c757d" }}>
                      Chỉ cần (1) hoặc (2) đúng là đã đủ chuẩn thực hành.
                    </i>
                  </div>
                </div>
              )}
              <br />
              <div
                style={{
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffeaa7",
                  borderRadius: "8px",
                  padding: "12px",
                  marginTop: "16px",
                }}
              >
                <strong style={{ color: "#856404" }}>***</strong>
                <br />
                <i style={{ color: "#856404" }}>
                  - Đọc chuẩn (1) sẽ khó hơn, là cái chuẩn chúng ta hướng đến
                  trong dài hạn, yêu cầu rèn luyện lâu dài.
                </i>{" "}
                <br />
                <b style={{ color: "#155724" }}>
                  - Tuy nhiên đọc chuẩn (2) đã đủ để thực hành.
                </b>{" "}
                <br />
                <i style={{ color: "#856404" }}>
                  - Thực hành xử lý 1 bài tổng thể nhanh chóng trong thời gian
                  ngắn quan trọng hơn là chuẩn chỉnh 100% từng câu từng chữ.
                </i>
                <br />
                <i style={{ color: "#856404" }}>
                  - Rèn luyện là quá trình lâu dài, không cần phải hoàn hảo ngay
                  từ đầu. Trong quá trình rèn luyện, chúng ta sẽ nhận phản hồi
                  và chỉnh sửa dần dần.
                </i>{" "}
                <hr />
                <p
                  style={{
                    color: "#155724",
                    fontWeight: "bold",
                    marginBottom: 0,
                  }}
                >
                  Chúc các anh chị, các bạn được nhiều lợi lạc.
                </p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h3 style={{ marginBottom: "24px", color: "#495057" }}>
              Chức năng Nghe
            </h3>
            {!listening ? (
              sttListenFromServer ? (
                <div
                  style={{
                    fontSize: "18px",
                    color: "#6c757d",
                    backgroundColor: "#f8f9fa",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6",
                  }}
                >
                  Đang xử lý...
                </div>
              ) : (
                <button
                  style={{
                    padding: "16px 32px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#28a745",
                    color: "#ffffff", // White text
                    fontSize: "18px",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 8px rgba(40,167,69,0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => {
                    read_by_Tts(CMDlist, () => {});
                    setsttListenFromServer(true);
                    setTimeout(() => {
                      setsttListenFromServer(false);
                    }, 3000);
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 12px rgba(40,167,69,0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 8px rgba(40,167,69,0.3)";
                  }}
                >
                  🔊 Nghe máy đọc
                </button>
              )
            ) : (
              <div
                style={{
                  fontSize: "18px",
                  color: "#856404",
                  backgroundColor: "#fff3cd",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #ffeaa7",
                }}
              >
                Vui lòng tắt chế độ nghe trước khi sử dụng chức năng này.
              </div>
            )}
            <div
              style={{
                marginTop: "24px",
                color: "#6c757d",
                fontSize: "16px",
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
              }}
            >
              <p>Nhấn nút để nghe máy đọc câu mẫu</p>
              <p>Giúp bạn luyện nghe và phát âm chính xác</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <YouTubeVideoSearch nameSeach={CMDlist} />
            <div
              style={{
                marginTop: "20px",
                color: "#6c757d",
                fontSize: "14px",
                textAlign: "center",
                backgroundColor: "#f8f9fa",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
              }}
            >
              <p>Tìm kiếm video hướng dẫn liên quan đến câu luyện tập</p>
              <p>Giúp bạn hiểu rõ hơn về cách phát âm và ngữ điệu</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <Nguyentacghepam />
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="container mt-4" style={containerStyles}>
      {/* Tab Navigation */}
      <div style={tabButtonStyles}>
        <button
          style={getTabButtonStyle(1)}
          onClick={() => setActiveTab(1)}
          onMouseOver={(e) => {
            if (activeTab !== 1) {
              e.target.style.backgroundColor = "#e9ecef";
              e.target.style.color = "#495057";
            }
          }}
          onMouseOut={(e) => {
            if (activeTab !== 1) {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#495057";
            }
          }}
        >
          📚 Luyện đọc
        </button>
        <button
          style={getTabButtonStyle(2)}
          onClick={() => setActiveTab(2)}
          onMouseOver={(e) => {
            if (activeTab !== 2) {
              e.target.style.backgroundColor = "#e9ecef";
              e.target.style.color = "#495057";
            }
          }}
          onMouseOut={(e) => {
            if (activeTab !== 2) {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#495057";
            }
          }}
        >
          🔊 Nghe
        </button>
        <button
          style={getTabButtonStyle(3)}
          onClick={() => setActiveTab(3)}
          onMouseOver={(e) => {
            if (activeTab !== 3) {
              e.target.style.backgroundColor = "#e9ecef";
              e.target.style.color = "#495057";
            }
          }}
          onMouseOut={(e) => {
            if (activeTab !== 3) {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#495057";
            }
          }}
        >
          🎥 Xem hướng dẫn
        </button>
        <button
          style={getTabButtonStyle(4)}
          onClick={() => setActiveTab(4)}
          onMouseOver={(e) => {
            if (activeTab !== 4) {
              e.target.style.backgroundColor = "#e9ecef";
              e.target.style.color = "#495057";
            }
          }}
          onMouseOut={(e) => {
            if (activeTab !== 4) {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#495057";
            }
          }}
        >
          🧩 Bảng Ghép âm
        </button>
      </div>
      {/* Tab Content */}
      <div style={tabContentStyles}>{renderTabContent()}</div>
    </div>
  );
};
export default Dictaphone;
