import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, json } from "react-router-dom";
import { socket } from "../App";
import "bootstrap/dist/css/bootstrap.min.css";
import PracticeDIV from "./pracPages/B101_FINAL_PROJECTS";
import CountdownTimer from "./pracPages/B101_FINAL_CounterTime";
import LinkAPI from "../ulti/T0_linkApi";
import sendMessageToServer from "../ulti/sendMessage";
import shuffleArray from "../ulti/shuffleArray";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import DataPracticeComponent from "./pracPages/C_RoomOffline_LAYDULIEUTH";
const Room = ({ setSttRoom }) => {
  const { roomCode, currentIndex } = useParams();
  const locationSet = useLocation();
  const params = new URLSearchParams(locationSet.search);
  const [users, setUsers] = useState(null);
  const [roomInfo, setRoomInfo] = useState({
    fileName: roomCode,
    objList: [0, 1, 2, 3, 4, 5, 6],
    reverse: 1,
  });

  const [StartToGetData, setStartToGetData] = useState(false);

  const [IndexSets, setIndexSets] = useState(null);

  const [userClient, setUserClient] = useState(null);

  const [allReady, setAllReady] = useState(false);

  // const [AllReadyForPlay, setAllReadyForPlay] = useState(false);

  const [IsPause, setIsPause] = useState(false);

  const [numberBegin, setNumberBegin] = useState(0);
  const [SttCoundown, setSttCoundown] = useState("00");

  const [DataPracticingCharactor, setDataPracticingCharactor] = useState(null);
  const [DataPracticingOverRoll, setDataPracticingOverRoll] = useState(null);
  const [Score, setScore] = useState(
    getNumberWithDailyExpiry(
      "score" + (params.get("b") + params.get("a") || "")
    ) || 0
  );
  const [NumberOneByOneHost, setNumberOneByOneHost] = useState(0);

  const [Message, setMessage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Early return if Score is not a valid number
    if (typeof Score !== "number" || isNaN(Score)) {
      console.warn("Invalid Score value:", Score);
      return;
    }

    const executeScoreEffect = async () => {
      try {
        // === SAVE SCORE SECTION ===
        const saveScoreToStorage = () => {
          try {
            // Safe parameter extraction
            const paramB = params?.get?.("b") || "";
            const paramA = params?.get?.("a") || "";
            const scoreKey = `score${paramB}${paramA}`;
            const scoreToSave = Math.max(0, Score); // Ensure non-negative

            // Check if saveNumberWithDailyExpiry function exists
            if (typeof saveNumberWithDailyExpiry === "function") {
              saveNumberWithDailyExpiry(scoreKey, scoreToSave);
            } else {
              console.warn("saveNumberWithDailyExpiry function not available");
              // Fallback to localStorage
              localStorage.setItem(
                scoreKey,
                JSON.stringify({
                  value: scoreToSave,
                  timestamp: Date.now(),
                })
              );
            }
          } catch (storageError) {
            console.error("Error saving score to storage:", storageError);
          }
        };

        // === SOCKET EMISSION SECTION ===
        const emitSocketMessage = () => {
          try {
            // Only emit if Score is positive and socket exists
            if (Score <= 0 || !socket || typeof socket.emit !== "function") {
              return;
            }

            // Safe localStorage access
            let idDinhDanh = null;
            let nameDinhDanh = null;

            try {
              idDinhDanh = localStorage.getItem("dinhDanh");
              nameDinhDanh = localStorage.getItem("nameDinhDanh");
            } catch (localStorageError) {
              console.warn("LocalStorage access failed:", localStorageError);
            }

            // Prepare display name with fallbacks
            const displayName =
              nameDinhDanh ||
              (idDinhDanh ? String(idDinhDanh).slice(0, 4) : "") ||
              "Anonymous";

            // Validate data before emitting
            const messageData = {
              text: `[${Score}] Điểm | `,
              time: String(displayName),
              type: "notify",
              id: idDinhDanh || null,
            };

            socket.emit("messageReg", messageData);
          } catch (socketError) {
            console.error("Error emitting socket message:", socketError);
          }
        };

        // === EMAIL NOTIFICATION SECTION ===
        const sendEmailNotification = async () => {
          try {
            // Check conditions for email sending
            if (Score === 0 || Score % 10 !== 0 || !LinkAPI) {
              return;
            }

            // Validate required functions
            if (typeof formatTime !== "function") {
              console.warn("formatTime function not available for email");
              return;
            }

            // Safe localStorage access
            let nameValue = "NAMENULL";
            try {
              nameValue = localStorage.getItem("nameDinhDanh") || "NAMENULL";
            } catch (localStorageError) {
              console.warn(
                "LocalStorage access failed for email:",
                localStorageError
              );
            }

            // Safe parameter extraction and time formatting
            let timeParam = "N/A";
            let formattedTime = new Date().toLocaleString();

            try {
              const rawTimeParam = params?.get?.("time");
              if (rawTimeParam) {
                timeParam = decodeURIComponent(rawTimeParam);
              }
            } catch (decodeError) {
              console.warn("Time parameter decode failed:", decodeError);
            }

            try {
              formattedTime = formatTime(new Date());
            } catch (formatError) {
              console.warn("Time formatting failed:", formatError);
            }

            // Build request body safely
            const requestBody = {
              subjectText: [
                String(nameValue),
                "UPDATE",
                String(Score),
                String(timeParam),
                String(formattedTime),
                `Link: ${window.location.href}`,
              ].join(" | "),
              contentText: String(window.location.href),
              toEmail: "pvkadien0209@gmail.com",
            };

            // Validate request body
            if (!requestBody.subjectText || !requestBody.contentText) {
              throw new Error("Invalid request body data");
            }

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            // Make API request
            const response = await fetch(`${LinkAPI}mail-homework`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(requestBody),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Check response (but don't throw for non-critical email)
            if (!response.ok) {
              console.warn(
                `Email API responded with status ${response.status}`
              );
            } else {
              console.log("Email notification sent successfully");
            }
          } catch (emailError) {
            // Don't throw - email is not critical
            if (emailError.name === "AbortError") {
              console.warn("Email request timeout");
            } else {
              console.error("Error sending email notification:", emailError);
            }
          }
        };

        // Execute all operations
        saveScoreToStorage();
        emitSocketMessage();
        await sendEmailNotification();
      } catch (generalError) {
        console.error("General error in score effect:", generalError);
      }
    };

    // Execute the async function
    executeScoreEffect();
  }, [Score]); // Only re-run when Score changes

  // Note: Other dependencies (params, socket, LinkAPI, formatTime, saveNumberWithDailyExpiry)
  // are accessed directly from closure and assumed to be stable or acceptable to use stale values
  // useEffect(() => {
  //   try {
  //     const idSocket = socket.id.slice(0, 4);
  //     socket.emit("messageReg", { text: "[" + idSocket + "] " + Message });
  //   } catch (error) {}
  // }, [Message]);
  useEffect(() => {
    if (numberBegin !== 0) {
      setSttCoundown("01");
    }
  }, [numberBegin]);

  useEffect(() => {
    setSttRoom(true);
  }, []);
  useEffect(() => {
    if (SttCoundown === "01") {
      SpeechRecognition.stopListening();
    }
  }, [SttCoundown]);

  const fetchTitle = async () => {
    try {
      let response;
      if (roomInfo.fileName.charAt(1) === "z") {
        response = await fetch(`/jsonData/forseo/${roomInfo.fileName}.json`);
      } else {
        response = await fetch(`/jsonData/${roomInfo.fileName}.json`);
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      setDataPracticingOverRoll(data);

      let firstList = [currentIndex || 0];

      const aParam = params.get("a");
      if (aParam === "all") {
        firstList = Array.from({ length: data.length }, (_, i) => i);
      } else if (aParam) {
        try {
          const newList = parseStringToNumbers(aParam);
          if (newList && newList.length > 0) {
            firstList = newList;
          }
        } catch (error) {
          console.warn('Failed to parse "a" parameter:', error.message);
        }
      }

      const get_data_interleaveCharacters = interleaveCharacters(
        data,
        firstList,
        params.get("b"),
        params.get("up"),
        params.get("random"),
        params.get("fsp")
      );

      setDataPracticingCharactor(
        get_data_interleaveCharacters.interleaveCharacters_DATA
      );
      setIndexSets(get_data_interleaveCharacters.IndexSets);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleUpdateNewElenment = (key, value, mode) => {
    socket.emit("updateOneELEMENT", roomCode, socket.id, key, value, mode);
  };

  if (!StartToGetData) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f9f9f9",
        }}
      >
        <DataPracticeComponent
          roomCode={roomCode}
          currentIndex={currentIndex}
          setStartToGetData={setStartToGetData}
          fetchTitle={fetchTitle}
        />

        {/* <h1 style={{ marginBottom: "20px" }}>Dữ liệu thực hành</h1>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <img
            src="https://i.postimg.cc/Bv9MGGy8/favicon-ico.png"
            width={"220px"}
            style={{
              border: "1px solid blue",
              borderRadius: "15px",
              cursor: "pointer",
            }}
            onClick={() => {
              navigate(
                "/learninghub/" +
                  roomCode +
                  "?ls=" +
                  currentIndex +
                  "&&Fid=div_01_content_table_to_practice"
              );
            }}
          />

          <button
            onClick={() => {
              setStartToGetData(true);
              fetchTitle();
            }}
            style={{
              padding: "12px 24px",
              fontSize: "large",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#0059c1")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#0070f3")
            }
          >
            Bấm để bắt đầu lấy dữ liệu thực hành
          </button>
        </div> */}
      </div>
    );
  }

  if (params && IndexSets && params.get("qstable")) {
    return (
      <>
        <div style={{ padding: "5%", fontSize: "larger" }}>
          <h1 style={{ color: "blue" }}>
            Buổi phỏng vấn qua video giữa học viên và người hướng dẫn
          </h1>

          <h5>
            Nhiệm vụ của các học viên trong buổi phỏng vấn này bao gồm:
            <br />
            + Lắng nghe những câu hỏi từ người hướng dẫn;
            <br />
            + Sử dụng bảng thông tin để hỗ trợ quá trình trả lời;
            <br />+ Phân tích tình huống, đặt câu hỏi để làm rõ thông tin và tìm
            kiếm đáp án hợp lý.
          </h5>

          <i>
            Qua quá trình trao đổi, người hướng dẫn sẽ có cơ hội đánh giá quá
            trình thực hành, sự tiến bộ của học viên cũng như xác định những
            điểm yếu cần cải thiện. Đây không chỉ là kết quả cụ thể từ một quá
            trình rèn luyện mà còn là tài liệu để người thầy, cô có thể xây dựng
            những phương án hỗ trợ hiệu quả hơn, giúp học viên đạt được kết quả
            tốt nhất trong hành trình học tập.
          </i>
          <hr />
          {IndexSets.map((e, i) => (
            <div>
              <b>
                {i + 1}.{DataPracticingCharactor[e].fsp}
              </b>
              <hr />
              {DataPracticingCharactor[e].data.map((e1, i1) => (
                <div style={{ padding: "0 5px" }}>
                  {e1.qs} ==== {e1.aw}
                </div>
              ))}
              <hr />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (roomInfo === null) {
    return (
      <div className="container mt-3">
        <h1>Đang tải thông tin bài thực hành</h1>
        <h1>Vui lòng Đợi trong giây lát</h1>
      </div>
    );
  }
  if (DataPracticingCharactor === null) {
    return (
      <div className="container mt-3">
        <h1>Đang tải dữ liệu thực hành. Vui lòng đợi trong giây lát!</h1>
        <h1>
          Tùy thuộc vào tốc độ internet và cấu hình máy tính, việc tải và sắp
          xếp dữ liệu thực hành sẽ mất ít thời gian.{" "}
        </h1>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid green",
        borderRadius: "5px",
        padding: "20px 20px",
        display: "flex",
        maxHeight: "100vh",
      }}
    >
      <div
        id="roomUltiDiv"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "0px",
          gap: "5px",
          maxWidth: "600px",
          margin: "0 auto",
          height: "96vh",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "10px",
            height: "100px",
          }}
        >
          <div style={{ flex: 1 }}>
            {" "}
            <img
              src="https://i.postimg.cc/Bv9MGGy8/favicon-ico.png"
              width="60px"
              height="60px"
              style={{
                border: "1px solid blue",
                borderRadius: "15px",
                cursor: "pointer",
                flexShrink: 0,
              }}
              onClick={() => {
                navigate(
                  "/learninghub/" +
                    roomCode +
                    "?ls=" +
                    currentIndex +
                    "&&Fid=div_01_content_table_to_practice"
                );
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            {/* Start Button */}
            {(SttCoundown === "01" || numberBegin === 0) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                <button
                  className="btn btn-primary"
                  style={{
                    borderRadius: "50%",
                    width: "60px",
                    height: "60px",
                    fontSize: "24px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  }}
                  onClick={() => {
                    if (numberBegin === 0) {
                      setNumberBegin((D) => D + 1);
                      setTimeout(() => {
                        setSttCoundown("02");
                      }, 100);
                    } else {
                      setSttCoundown("02");
                    }
                  }}
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Score Card */}
        <div
          style={{
            backgroundColor: "#e6ccff",
            borderRadius: "15px",
            border: "1px solid black",
            padding: "10px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontStyle: "italic",
              marginBottom: "5px",
            }}
          >
            {params.get("time")
              ? decodeURIComponent(params.get("time")).slice(0, 9)
              : null}
          </div>
          <h5>{localStorage.getItem("nameDinhDanh") || "Chưa nhập tên"}</h5>
          <h3 style={{ color: "blue" }}>
            <b> Điểm ({Score})</b> /Lượt {numberBegin}
          </h3>
        </div>
        {/* Info Section */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "10px",
            border: "1px solid #dee2e6",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <strong>Thời gian:</strong> {formatTime(new Date())}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Mã bài tập:</strong> {params.get("note")}{" "}
            <em>{currentIndex}</em>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "small", fontWeight: "bold" }}>
              {params.get("a")}
            </span>
            <span style={{ fontSize: "small", fontStyle: "italic" }}>
              {splitIntoChunks(params.get("b"))}
            </span>
          </div>
        </div>

        {/* Submit Section */}
        <div
          id="NOPBAITAP"
          style={{
            backgroundColor: "#fff3cd",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #ffeaa7",
          }}
        >
          <div style={{ marginBottom: "15px" }}>
            <button
              onClick={(e) => {
                // Prevent double click
                if (e.target.disabled) return;

                try {
                  // Validate inputs first
                  if (!Score || Score <= 0) {
                    alert("Cần có điểm số để nộp bài");
                    return;
                  }

                  if (!LinkAPI) {
                    alert("Lỗi: Thiếu cấu hình API");
                    return;
                  }

                  if (typeof formatTime !== "function") {
                    alert("Lỗi: Hàm formatTime không hợp lệ");
                    return;
                  }

                  // Get button reference safely
                  const submitButton = e.target;
                  const originalText = submitButton.innerHTML;

                  // Disable button during submission
                  submitButton.disabled = true;
                  submitButton.innerHTML = "ĐANG NỘP BÀI...";
                  submitButton.style.cursor = "not-allowed";

                  // Get input values with safety checks
                  const nameValue = (() => {
                    try {
                      return localStorage.getItem("nameDinhDanh") || "NAMENULL";
                    } catch (error) {
                      console.warn("LocalStorage access failed:", error);
                      return "NAMENULL";
                    }
                  })();

                  // Safe parameter extraction
                  const timeParam = (() => {
                    try {
                      const param = params?.get?.("time");
                      return param ? decodeURIComponent(param) : "N/A";
                    } catch (error) {
                      console.warn("Time parameter decode failed:", error);
                      return "N/A";
                    }
                  })();

                  // Safe time formatting
                  const currentTime = (() => {
                    try {
                      return formatTime(new Date());
                    } catch (error) {
                      console.warn("Time formatting failed:", error);
                      return new Date().toLocaleString();
                    }
                  })();

                  const requestBody = {
                    subjectText: [
                      nameValue,
                      "SUBMIT",
                      Score,
                      timeParam,
                      currentTime,
                      `Link: ${window.location.href}`,
                    ].join(" | "),
                    contentText: window.location.href,
                    toEmail: "pvkadien0209@gmail.com",
                  };

                  // Create abort controller for timeout
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => {
                    controller.abort();
                  }, 30000); // 30 second timeout

                  fetch(LinkAPI + "mail-homework", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Accept: "application/json",
                    },
                    body: JSON.stringify(requestBody),
                    signal: controller.signal,
                  })
                    .then((response) => {
                      clearTimeout(timeoutId);

                      if (!response.ok) {
                        throw new Error(
                          `HTTP ${response.status}: ${response.statusText}`
                        );
                      }

                      return response.json();
                    })
                    .then((json) => {
                      if (json && json.success) {
                        const roomUltiDiv =
                          document.getElementById("roomUltiDiv");

                        if (roomUltiDiv !== null) {
                          Object.assign(roomUltiDiv.style, {
                            flexGrow: "12",
                            border: "1px solid #ccc",
                            borderRadius: "12px",
                            padding: "16px",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease-in-out",
                            backgroundColor: "pink",
                          });
                        }

                        const container = document.getElementById("NOPBAITAP");
                        if (container) {
                          container.innerHTML = `
                    <div style="text-align: center; padding: 20px; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 10px;">
                      <h2 style="color: #155724; margin: 0 0 15px 0;">✅ Đã nộp bài tập thành công!</h2>
                      <h1 style="color: #007bff; margin: 20px 0;">Điểm số: ${Score}</h1>
                      <p style="font-size: 16px; color: #6c757d; margin: 0 0 15px 0;">Chụp gửi kết quả (khung màu hồng) cho thầy cô!</p>
                      <button 
                        onclick="window.location.reload()" 
                        style="padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
                      >
                        Làm lại bài khác
                      </button>
                    </div>
                  `;
                        }

                        // Reset score safely
                        if (typeof setScore === "function") {
                          setScore(0);
                        } else {
                          console.warn("setScore function not available");
                        }
                      } else {
                        throw new Error(
                          json?.message || "Nộp bài không thành công"
                        );
                      }
                    })
                    .catch((error) => {
                      clearTimeout(timeoutId);
                      console.error("Lỗi khi nộp bài:", error);

                      // Determine error message
                      let errorMessage = "Có lỗi xảy ra, vui lòng thử lại sau";

                      if (error.name === "AbortError") {
                        errorMessage = "Yêu cầu bị timeout, vui lòng thử lại";
                      } else if (
                        error.message?.includes("NetworkError") ||
                        error.message?.includes("Failed to fetch")
                      ) {
                        errorMessage =
                          "Lỗi kết nối mạng, vui lòng kiểm tra internet";
                      } else if (
                        error.message &&
                        !error.message.includes("HTTP")
                      ) {
                        errorMessage = error.message;
                      }

                      alert(errorMessage);
                    })
                    .finally(() => {
                      // Re-enable button safely
                      if (submitButton && !submitButton.isConnected === false) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalText;
                        submitButton.style.cursor =
                          Score > 0 ? "pointer" : "not-allowed";
                      }
                    });
                } catch (error) {
                  console.error("Lỗi submit:", error);
                  alert("Có lỗi xảy ra, vui lòng thử lại sau");

                  // Re-enable button in catch block
                  const submitButton = e.target;
                  if (submitButton) {
                    submitButton.disabled = Score <= 0; // Only enable if score > 0
                    submitButton.innerHTML = "NỘP BÀI TẬP VỀ NHÀ";
                    submitButton.style.cursor =
                      Score > 0 ? "pointer" : "not-allowed";
                  }
                }
              }}
              className={`btn ${Score > 0 ? "btn-danger" : "btn-secondary"}`}
              disabled={Score <= 0}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "8px",
                cursor: Score > 0 ? "pointer" : "not-allowed",
                ...(Score <= 0 ? { opacity: 0.6 } : {}),
              }}
            >
              BẤM ĐỂ NỘP BÀI TẬP VỀ NHÀ
            </button>

            <div
              style={{
                marginTop: "8px",
                fontSize: "14px",
                fontStyle: "italic",
                color: "#856404",
              }}
            >
              GỬI ĐIỂM SỐ KẾT QUẢ VỀ EMAIL CỦA THẦY
            </div>

            {Score <= 0 && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#dc3545",
                }}
              >
                * Cần có điểm số để nộp bài
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 8,
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          gap: "10px",
          minHeight: 0, // Quan trọng để flex item có thể co lại
        }}
      >
        {/* Main Practice Container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: "1px solid #ddd",
            borderRadius: "15px",
            backgroundColor: "#fff0e6",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Header Bar - Optional status/info */}
          {SttCoundown === "02" && (
            <div
              style={{
                padding: "",
                backgroundColor: "#f8f9fa",
                borderBottom: "1px solid #dee2e6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "14px",
                color: "#6c757d",
              }}
            ></div>
          )}
          {/* Practice Content Area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: SttCoundown === "02" ? "20px" : "0",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Active Practice Component */}
            {SttCoundown === "02" && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <PracticeDIV
                  DataPracticingOverRoll={DataPracticingOverRoll}
                  DataPracticingCharactor={DataPracticingCharactor}
                  Score={Score}
                  setScore={setScore}
                  numberBegin={numberBegin}
                  indexSets={
                    IndexSets
                      ? IndexSets[(numberBegin - 1) % IndexSets.length]
                      : numberBegin - 1
                  }
                  TimeDefault={params.get("t") || 120}
                  regRate={params.get("r") || 0.5}
                  regRate_01={params.get("r01") || 0.6}
                  handleIncrementReadyClick={() => setNumberBegin((D) => D + 1)}
                  IsPause={false}
                  NumberOneByOneHost={0}
                  tableView={params.get("tb") || "Normal"}
                  setMessage={setMessage}
                  roomCode={roomCode}
                />
              </div>
            )}

            {/* Welcome/Start Screen */}
            {(SttCoundown === "01" || numberBegin === 0) && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 240, 230, 0.95)",
                  backdropFilter: "blur(5px)",
                }}
              >
                {/* Welcome Message */}
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "40px",
                    padding: "20px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    maxWidth: "500px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "28px",
                      color: "#2c3e50",
                      marginBottom: "15px",
                      fontWeight: "bold",
                    }}
                  >
                    🎯 Sẵn sàng luyện tập?
                  </h2>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#6c757d",
                      marginBottom: "10px",
                    }}
                  >
                    Nhấn vào hình bên dưới để bắt đầu phiên luyện tập
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      justifyContent: "center",
                      marginTop: "15px",
                      fontSize: "14px",
                      color: "#6c757d",
                    }}
                  >
                    <span>⏱️ Thời gian: {params.get("t") || 120}s</span>
                    <span>📊 Độ khó: {params.get("r") || 0.5}</span>
                    <span>🎲 Chế độ: {params.get("tb") || "Normal"}</span>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  className="btn btn-primary"
                  style={{
                    borderRadius: "50%",
                    width: "180px",
                    height: "180px",
                    fontSize: "40px",
                    fontWeight: "bold",
                    color: "white",
                    border: "4px solid #007bff",
                    backgroundImage:
                      "url('https://i.postimg.cc/s2GYz4SL/David-20.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: "0 8px 20px rgba(0,123,255,0.3)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.05)";
                    e.target.style.boxShadow =
                      "0 12px 30px rgba(0,123,255,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.boxShadow = "0 8px 20px rgba(0,123,255,0.3)";
                  }}
                  onClick={() => {
                    try {
                      const paramNote = (
                        params?.get("note") || ""
                      ).toUpperCase();

                      sendMessageToServer(
                        "Vào thực hành! Lượt (" +
                          (numberBegin ?? 0) +
                          ") | " +
                          (Score ?? 0) +
                          "  | " +
                          paramNote,
                        null,
                        "group10"
                      );
                      if (numberBegin === 0) {
                        setNumberBegin((D) => D + 1);
                        setTimeout(() => {
                          setSttCoundown("02");
                        }, 100);
                      } else {
                        setSttCoundown("02");
                      }
                    } catch (error) {
                      console.log("NÚT BẤM AVATAR THỰC HÀNH", error);
                    }
                  }}
                ></button>

                {/* Additional Info */}
                <div
                  style={{
                    marginTop: "30px",
                    textAlign: "center",
                    fontSize: "14px",
                    color: "#6c757d",
                  }}
                >
                  <p>
                    💡 Mẹo: Tập trung và thực hiện chính xác để đạt điểm cao!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;

function interleaveCharacters(
  data_all,
  index_sets_t_get_pracData,
  filerSets,
  upCode,
  random,
  fsp
) {
  const numberGetPerOne = Math.floor(200 / index_sets_t_get_pracData.length);

  // Chọn ngẫu nhiên một trong ba giá trị: Math.floor(numberGetPerOne / 2), numberGetPerOne, hoặc 0
  const randomIndex = Math.floor(Math.random() * 3);
  const numberCut = [Math.floor(numberGetPerOne / 2), numberGetPerOne, 0][
    randomIndex
  ];
  let arrRes_gd_1 = [];
  console.log(index_sets_t_get_pracData);
  index_sets_t_get_pracData.forEach((e) => {
    let getUpCode = "charactor";
    if (upCode && data_all[e]["charactor" + upCode]) {
      getUpCode = "charactor" + upCode;
    }
    let resTemp = getArrayElements(
      filer_type_o_charactor(data_all[e][getUpCode], filerSets, fsp),
      numberCut,
      numberGetPerOne
    );
    arrRes_gd_1.push(resTemp);
  });

  let arrRes = [];

  for (let i = 0; i < numberGetPerOne; i++) {
    arrRes_gd_1.forEach((e) => {
      if (e[i]) {
        arrRes.push(e[i]);
      }
    });
  }
  console.log(arrRes.length, "Số phần tử bài học");
  let getdata_indexSet = [];
  if (random === "true") {
    getdata_indexSet = generateRandomArray(arrRes.length, true);
  } else {
    getdata_indexSet = generateRandomArray(arrRes.length, false);
  }
  return { interleaveCharacters_DATA: arrRes, indexSet_DATA: getdata_indexSet };
}
function filer_type_o_charactor(charactorSets, filerTypeSetsStringValue, fsp) {
  try {
    // Check if inputs are valid
    if (!filerTypeSetsStringValue || !Array.isArray(charactorSets)) {
      return charactorSets;
    }

    // Split the filter string into an array using "zz" as separator
    let filerTypeSetsArrayValue = filerTypeSetsStringValue.split("zz");
    console.log(filerTypeSetsArrayValue, "filerTypeSetsArrayValue");

    let res_after_filer = [];
    let filerTypeSetsArrayValueAll = [];
    let filerTypeSetsArrayValueSpecific = [];
    let rangeFilters = [];

    // Process each filter part
    filerTypeSetsArrayValue.forEach((e) => {
      if (e.includes("*")) {
        // Store the prefix (string before the "*") for wildcard matching
        filerTypeSetsArrayValueAll.push(e.replace("*", ""));
      } else if (e.includes("-")) {
        // Handle range filter like A1-5 or A9-10
        rangeFilters.push(e);
      } else {
        filerTypeSetsArrayValueSpecific.push(e);
      }
    });

    charactorSets.forEach((e) => {
      let isTypeMatch = false;

      // Check if the type exactly matches any specific filter
      if (filerTypeSetsArrayValueSpecific.includes(e?.type)) {
        isTypeMatch = true;
      } else {
        // Check if the type starts with any wildcard filter prefix
        for (let prefix of filerTypeSetsArrayValueAll) {
          if (e?.type && e.type.startsWith(prefix)) {
            isTypeMatch = true;
            break;
          }
        }

        // Check if the type falls within any range filter
        if (!isTypeMatch && e?.type) {
          for (let rangeFilter of rangeFilters) {
            // Parse the range filter (e.g., "A1-5" → prefix="A", start=1, end=5)
            const matches = rangeFilter.match(/([A-Za-z]*)(\d+)-(\d+)/);
            if (matches) {
              const prefix = matches[1];
              const start = parseInt(matches[2]);
              const end = parseInt(matches[3]);

              // Check if the type has the same prefix and a number in the range
              const typeMatches = e.type.match(new RegExp(`^${prefix}(\\d+)$`));
              if (typeMatches) {
                const typeNumber = parseInt(typeMatches[1]);
                if (typeNumber >= start && typeNumber <= end) {
                  isTypeMatch = true;
                  break;
                }
              }
            }
          }
        }
      }

      // Check if FSP matches (if FSP filter is provided)
      const eFspStr = (e?.fsp || "").toLowerCase();
      const fspStr = (fsp || "").toLowerCase();
      const isFspMatch = fsp ? eFspStr.includes(fspStr) : true;

      if (isTypeMatch && isFspMatch) {
        res_after_filer.push(e);
      }
    });

    return res_after_filer.length > 0 ? res_after_filer : [];
  } catch (error) {
    console.error("Lỗi trong filer_type_o_charactor:", error);
    return charactorSets;
  }
}

function splitAndConcatArray(array, m) {
  const n = array.length;
  const splitIndex = Math.floor((n * m) / 10);

  const arr1 = array.slice(0, splitIndex);
  const arr2 = array.slice(splitIndex);

  const resultArray = arr2.concat(arr1);

  return resultArray;
}

function generateRandomArray(m, stt_random) {
  let randomArray = [];
  for (let i = 0; i < m; i++) {
    randomArray.push(i);
  }
  if (stt_random) {
    return shuffleArray(randomArray);
  }
  return randomArray;
}
function saveNumberWithDailyExpiry(key, value) {
  const now = new Date();

  // Thời gian hết hạn tính bằng mili giây
  const expiry = now.getTime() + 20 * 60 * 1000;

  const item = {
    value: value,
    expiry: expiry,
  };

  localStorage.setItem(key, JSON.stringify(item));
}

function getNumberWithDailyExpiry(key) {
  const itemStr = localStorage.getItem(key);

  // Kiểm tra nếu không có dữ liệu
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date().getTime();

  // Kiểm tra nếu hết hạn
  if (now > item.expiry) {
    localStorage.removeItem(key); // Xóa dữ liệu hết hạn
    return null;
  }

  return item.value; // Trả về số nếu chưa hết hạn
}

/**
 * Parses a string to extract numbers, handling special separators
 * zz or a: separates individual numbers
 * - or b: defines a range between two numbers
 *
 * Examples:
 * "0zz2-4" => [0, 2, 3, 4]
 * "0a2b4" => [0, 2, 3, 4]
 *
 * @param {string} input - The string to parse
 * @return {Array|null} - Array of numbers or null if invalid
 */
function parseStringToNumbers(input) {
  try {
    // Replace the defined separators with standard markers for processing
    const normalizedInput = input
      .replace(/zz/g, "a") // Replace 'zz' with 'a'
      .replace(/-/g, "b"); // Replace '-' with 'b'

    // Split the string using regex to capture separators and numbers
    const parts = normalizedInput.split(/([ab])/);
    let result = [];
    let currentNumber = null;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();

      // Skip empty parts
      if (!part) continue;

      if (part === "a") {
        // 'a' is just a separator, we continue to the next part
        continue;
      } else if (part === "b") {
        // 'b' indicates a range, we need the numbers before and after
        if (currentNumber !== null && i + 1 < parts.length) {
          const nextPart = parts[i + 1].trim();
          if (nextPart && !isNaN(nextPart)) {
            const end = parseInt(nextPart);
            // Generate all numbers in the range (inclusive)
            for (let j = currentNumber + 1; j <= end; j++) {
              result.push(j);
            }
            i++; // Skip the next part as we've already processed it
          }
        }
      } else if (!isNaN(part)) {
        // This is a number
        currentNumber = parseInt(part);
        result.push(currentNumber);
      }
    }

    console.log("Parsed result:", result);
    return result.length > 0 ? result : null;
  } catch (error) {
    console.error("Error parsing string:", error);
    return null;
  }
}

function getArrayElements(arr, m, n) {
  // Tính toán chỉ mục m sao cho không vượt quá độ dài mảng
  const startIndex = m % arr.length;

  // Xếp lại mảng từ startIndex đến hết và nối với phần đầu mảng
  const rotatedArr = arr.slice(startIndex).concat(arr.slice(0, startIndex));

  // Nếu n >= arr.length, trả về toàn bộ mảng đã xoay
  if (n >= arr.length) {
    return rotatedArr;
  }

  // Nếu n < arr.length, trả về n phần tử đầu tiên của mảng đã xoay
  return rotatedArr.slice(0, n);
}
function splitIntoChunks(paramB) {
  if (!paramB) {
    return null;
  }

  // Remove all 'zz' from the string
  paramB = paramB.replace(/zz/g, "");

  let chunks = "";
  for (let i = 0; i < paramB.length; i += 6) {
    chunks += " " + paramB.substring(i, i + 6);
  }

  return chunks.trim(); // Remove leading space
}

const formatTime = (date) => {
  if (!date) return "";
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
};
