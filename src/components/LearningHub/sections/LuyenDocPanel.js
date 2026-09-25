// LuyenDocPanel.js
//
// File MỚI — thay cho việc gọi trực tiếp <Dictaphone CMDlist={CMDlist} />
// ở Tab 2 "Speech to text" của PracticeGhepAmModal.js.
//
// LÝ DO: Tab 2 giờ CHỈ CẦN đúng phần "Luyện đọc" (case 1 bên trong
// Dictaphone = RegcognitionV2024-05-NG_FOR_TEACHING.js — file dùng chung với
// LearningHub_prac_st_only.js, KHÔNG được sửa). Cách làm trước đó (ẩn 3 tab
// con bằng CSS !important + tự bấm hộ nút "Luyện đọc" bằng JS sau khi mount)
// khá gượng ép. Theo yêu cầu mới "chỉ là luyện đọc thì không cần tab nữa,
// xóa luôn code thừa", file này SAO CHÉP lại đúng nội dung + toàn bộ logic
// của case 1 (Dictaphone không export case 1 riêng để tái dùng, và ViewRes/
// isMobileDevice bên trong đó cũng không export ra ngoài) thành 1 component
// ĐỘC LẬP, không có tab bar, và chỉnh đúng 1 điểm khác so với bản gốc: nút
// "XONG GỬI KẾT QUẢ" đặt RA NGOÀI điều kiện `listening` nên LUÔN HIỂN THỊ kể
// cả khi đã tắt mic (bản gốc trong Dictaphone chỉ hiện nút này khi đang bật
// mic — xem nhánh `{listening ? (...) : (...)}` trong file gốc).
//
// Dictaphone.js (RegcognitionV2024-05-NG_FOR_TEACHING.js) VẪN GIỮ NGUYÊN,
// không sửa gì — LearningHub_prac_st_only.js dùng file đó không bị ảnh
// hưởng gì bởi thay đổi này.
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { socket } from "../../../App";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import LinkAPI from "../../../ulti/T0_linkApi";

// SAO CHÉP từ RegcognitionV2024-05-NG_FOR_TEACHING.js (hàm nội bộ, không
// export ra để tái dùng) — phát hiện điện thoại để tắt gọi API reg-Analyze.
const isMobileDevice = () =>
  typeof navigator !== "undefined" &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

// SAO CHÉP NGUYÊN VẸN từ RegcognitionV2024-05-NG_FOR_TEACHING.js (component
// nội bộ, không export ra để tái dùng) — hiển thị kết quả so khớp từng từ.
const ViewRes = ({ resultSt = [] }) => {
  const [prevResultLength, setPrevResultLength] = useState(0);
  useEffect(() => {
    if (resultSt && resultSt.length !== prevResultLength) {
      setPrevResultLength(resultSt?.length || 0);
    }
  }, [resultSt, prevResultLength]);
  try {
    const containerStyle = {
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      lineHeight: 1.5,
      fontSize: "20px",
      padding: "10px 12px",
      background: "#f8f9fa",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      transition: "all 2s ease-in-out",
      color: "#212529",
      border: "1px solid #dee2e6",
    };
    const itemBaseStyle = {
      marginRight: "4px",
      padding: "2px 4px",
      display: "inline-block",
      borderRadius: "3px",
      transition:
        "color 1s ease, transform 1s ease, opacity 1s ease, background-color 1s ease",
      animation: "fadeIn 1s ease-in-out",
    };
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
            const isNew = index >= prevResultLength && prevResultLength > 0;
            const animationStyle = isNew
              ? {
                  animation: "fadeIn 0.4s ease-out, highlightNew 1.2s ease-out",
                  animationFillMode: "both",
                }
              : {};
            if (item.stt === false) {
              return (
                <i
                  key={key}
                  style={{
                    ...itemBaseStyle,
                    ...animationStyle,
                    color: "#6c757d",
                    backgroundColor: "#e9ecef",
                    borderBottom: "1px dotted #adb5bd",
                    opacity: 0.9,
                  }}
                >
                  {item.textuse}
                </i>
              );
            } else if (item.stt === true) {
              return (
                <span
                  key={key}
                  style={{
                    ...itemBaseStyle,
                    ...animationStyle,
                    color: "#0d47a1",
                    backgroundColor: "#e3f2fd",
                    fontWeight: "600",
                    opacity: 1,
                  }}
                >
                  {item.textuse}
                </span>
              );
            } else if (item.stt === "check") {
              return (
                <span
                  key={key}
                  style={{
                    ...itemBaseStyle,
                    ...animationStyle,
                    fontStyle: "italic",
                    color: "#004d40",
                    backgroundColor: "#e0f2f1",
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
              return (
                <span
                  key={key}
                  style={{
                    ...itemBaseStyle,
                    ...animationStyle,
                    color: "#343a40",
                    backgroundColor: "#f8f9fa",
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
          color: "#dc3545",
          padding: "12px",
          borderLeft: "4px solid #dc3545",
          backgroundColor: "#f8d7da",
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

export default function LuyenDocPanel({
  CMDlist,
  readCorrectSaved,
  onFinishReading,
  // true khi popup ĐANG MỞ và đang ở đúng tab "Luyện đọc" — panel này vẫn
  // luôn nằm trong DOM (chỉ ẩn bằng CSS khi đổi tab, xem PracticeGhepAmModal.js),
  // nên cần prop này để biết khi nào phải TỰ TẮT mic.
  isActive,
  // true khi Tab 1 ("Nghe máy đọc") đang phát audio — dùng để khoá nút "Bắt
  // đầu" bên dưới, tránh mic tự thu lại tiếng máy đọc nếu người dùng bấm
  // "Nghe" ở Tab 1 rồi chuyển ngay sang Tab 2 trong lúc máy vẫn đang đọc
  // (xem ghi chú ở handleListenTts trong PracticeGhepAmModal.js).
  isSpeaking,
}) {
  // State — SAO CHÉP từ case 1 của Dictaphone (bỏ activeTab/sttListenFromServer
  // vì không còn tab "Nghe" ở component này nữa).
  const [numberTry, setNumberTry] = useState(0);
  const [SimilarCheckSet, setSimilarCheckSet] = useState("");
  const [cmdApartChat, setCmdApartChat] = useState("");
  const [idDinhDanh] = useState(() => localStorage.getItem("dinhDanh"));
  const [nameDinhDanh] = useState(
    () => localStorage.getItem("nameDinhDanh") || "",
  );
  const [resultSt, setresultSt] = useState("");
  const [sttProcessing, setsttProcessing] = useState(false);

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
  const { interimTranscript, transcript, listening, resetTranscript } =
    useSpeechRecognition({ commands });

  useEffect(() => {
    setresultSt("");
  }, [numberTry]);

  // BUG ĐÃ SỬA: trước đây đổi câu (CMDlist) chỉ reset resultSt/numberTry
  // (giao diện) mà KHÔNG xoá transcript nhận diện giọng nói thực sự — do
  // transcript của react-speech-recognition là state DÙNG CHUNG toàn cục
  // (nhiều nơi cùng useSpeechRecognition() nhận cùng 1 giá trị), nên câu 1
  // đọc đúng thì lưu được, nhưng sang câu 2 vẫn còn dính transcript câu 1
  // (ngày càng dài ra), so khớp với câu MỚI luôn sai → không check/lưu được
  // nữa. Gọi resetTranscript() ngay khi đổi câu để mỗi câu luôn bắt đầu từ
  // transcript rỗng, kể cả khi đang bật mic liên tục qua nhiều câu.
  //
  // BUG THỨ 2 ĐÃ SỬA (phát hiện khi rà lại logic): resetTranscript() cập
  // nhật state của react-speech-recognition KHÔNG đồng bộ ngay trong lần
  // render này — nó chỉ phản ánh ở lần render SAU. Nếu effect bên dưới (kiểm
  // tra transcript quá dài để tự tắt mic + gọi reg-Analyze) chạy CÙNG lượt
  // với effect đổi câu này (cả 2 đều phụ thuộc CMDlist), nó vẫn thấy
  // transcript CŨ (của câu trước) trong khi CMDlist đã là câu MỚI — có thể
  // tự tắt mic nhầm hoặc gọi 1 lần reg-Analyze sai dữ liệu ngay lúc vừa đổi
  // câu. `pendingResetRef` đánh dấu "vừa đổi câu, đang chờ transcript thật
  // sự về rỗng" để effect bên dưới BỎ QUA đúng 1 lượt chạy bị dính dữ liệu cũ
  // đó, rồi tự hết hiệu lực ngay khi transcript đã thực sự phản ánh đúng.
  const pendingResetRef = useRef(false);
  useEffect(() => {
    setNumberTry(0);
    setresultSt("");
    pendingResetRef.current = true;
    resetTranscript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CMDlist]);

  useEffect(() => {
    if (pendingResetRef.current) {
      if (transcript === "" && interimTranscript === "") {
        pendingResetRef.current = false;
      } else {
        // Lượt chạy này vẫn còn dính transcript của câu TRƯỚC (do
        // resetTranscript() chưa kịp phản ánh) — bỏ qua, đợi lượt kế tiếp.
        return;
      }
    }
    if (transcript.length > CMDlist.length * 3) {
      stopListening();
      return;
    }
    if (isMobileDevice()) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interimTranscript, transcript, CMDlist]);

  const startListening = useCallback(() => {
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
  }, []);
  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  // TỰ TẮT mic khi rời khỏi panel này — đóng popup HOẶC chuyển sang tab
  // khác trong popup (cả 2 trường hợp đều làm `isActive` hoá false, vì
  // panel này luôn nằm trong DOM, chỉ ẩn bằng CSS — xem prop `isActive` ở
  // PracticeGhepAmModal.js). Tránh trường hợp mic vẫn ngầm ghi âm dù người
  // học đã rời khỏi màn hình luyện đọc.
  useEffect(() => {
    if (!isActive) {
      stopListening();
    }
  }, [isActive, stopListening]);

  // Phòng thêm trường hợp component này bị unmount hẳn (VD: rời khỏi trang
  // Learning Hub) trong lúc mic đang bật — luôn tắt mic khi unmount.
  useEffect(() => {
    return () => {
      SpeechRecognition.stopListening();
    };
  }, []);

  // "Xong, gửi kết quả" đảm nhiệm CẢ 2 việc: 1) gửi kết quả qua socket
  // (như cũ), 2) chấm "đọc đúng >65%" và lưu vào bảng (gọi onFinishReading —
  // hàm thật nằm ở PracticeGhepAmModal.js). KHÔNG còn chấm tự động theo dõi
  // transcript liên tục nữa — CHỈ chấm đúng lúc bấm nút này, cho logic đơn
  // giản, dễ theo dõi. Phải gọi onFinishReading bằng transcript HIỆN TẠI
  // TRƯỚC KHI resetTranscript() xoá nó.
  const handleSendResults = useCallback(() => {
    stopListening();
    if (typeof onFinishReading === "function") {
      onFinishReading(transcript);
    }
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
    onFinishReading,
    transcript,
  ]);
  const handleReset = useCallback(() => {
    resetTranscript();
    setNumberTry((prev) => prev + 1);
  }, [resetTranscript]);

  // ── Thông báo "đã lưu: đọc đúng >65%" — CHỈ còn dòng badge nhỏ cạnh trạng
  // thái mic (bỏ toast nổi góc phải theo yêu cầu, dòng nhỏ là đủ).
  // `readCorrectSaved` (từ PracticeGhepAmModal.js, đúng phần đọc >65% đã lưu
  // vào progressByValue cho câu này) là NGUỒN đọc đúng — ở đây chỉ hiển thị
  // lại cho người học biết, không tự tính toán lại.

  return (
    <div className="row g-3">
      {/* Cột trái — điều khiển + câu đang luyện */}
      <div className="col-12 col-md-4">
        <div className="d-flex flex-wrap gap-2 mb-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handleReset}
            title="Xóa nội dung đã nhận diện"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>Xóa
          </button>
          <button
            id="stopListenBTN"
            className="btn btn-sm btn-outline-danger"
            onClick={stopListening}
            title="Tắt micro"
          >
            <i className="bi bi-mic-mute-fill me-1"></i>Tắt
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              handleReset();
              startListening();
            }}
            disabled={isSpeaking}
            title={isSpeaking ? "Chờ máy đọc xong đã" : "Bắt đầu nói"}
          >
            <i className="bi bi-mic-fill me-1"></i>Bắt đầu
          </button>
        </div>

        <div className="info-card gam-compact-card mb-2">
          <div className="text-muted small mb-1">
            <i className="bi bi-chat-quote me-1"></i>Rèn luyện câu
          </div>
          <p
            className="practice-sentence mb-0"
            style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)" }}
            onCopy={(e) => e.preventDefault()}
          >
            {CMDlist}
          </p>
        </div>
        <p className="text-muted small mb-0">
          Bấm "Bắt đầu" rồi đọc câu này lên để luyện ghép âm.
        </p>
      </div>

      {/* Cột phải — trạng thái + kết quả. Nút "Xong, gửi kết quả" đặt NGOÀI
          điều kiện `listening` nên LUÔN HIỂN THỊ kể cả khi đã tắt mic. */}
      <div className="col-12 col-md-8">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <span
            className={`badge ${
              listening ? "text-bg-primary" : "text-bg-secondary"
            }`}
          >
            <i
              className={`bi ${
                listening ? "bi-record-circle" : "bi-mic-mute"
              } me-1`}
            ></i>
            {listening ? "Đang bật — hãy nói..." : "Đang tắt"}
          </span>
          {readCorrectSaved ? (
            <span className="badge text-bg-success gam-readcorrect-badge">
              <i className="bi bi-check-circle-fill me-1"></i>
              Đã lưu: đọc đúng &gt;65%
            </span>
          ) : null}
        </div>

        {listening ? (
          <div className="d-flex flex-column w-100">
            <div
              id="divView01"
              style={{
                width: "100%",
                overflow: "hidden",
                transition: "opacity 0.5s ease-in-out",
                marginBottom: resultSt && resultSt.length > 0 ? "8px" : "0px",
                opacity: resultSt && resultSt.length > 0 ? 1 : 0,
              }}
            >
              <ViewRes resultSt={resultSt} />
            </div>
            <div id="divView02" className="gam-luyendoc-interim">
              <i>{interimTranscript}</i>
              <b style={{ color: "#dc3545" }}>
                {sttProcessing ? " Đang xử lý câu nói..." : null}
              </b>
            </div>
            {SimilarCheckSet ? (
              <div className="gam-luyendoc-simcheck mt-2">
                {SimilarCheckSet}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="gam-luyendoc-disabled">
            <ViewRes resultSt={resultSt} />
            {SimilarCheckSet ? (
              <div className="gam-luyendoc-simcheck mt-2">
                {SimilarCheckSet}
              </div>
            ) : null}
          </div>
        )}

        {sttProcessing ? (
          <div className="text-danger fw-bold">Đang xử lý câu nói...</div>
        ) : (
          <button
            className="btn btn-danger w-100"
            onClick={handleSendResults}
          >
            <i className="bi bi-send-check-fill me-2"></i>Xong, gửi kết quả
          </button>
        )}
      </div>
    </div>
  );
}
