// RoomofflineV2InputPanel.js
//
// File MỚI — khu vực nhập liệu trung tâm của RoomofflineV2.
// Tái sử dụng cùng thư viện speech-to-text mà bản cũ dùng
// (react-speech-recognition, xem client/src/ulti/RegcognitionOnly.js), nhưng
// KHÔNG import/sửa RegcognitionOnly.js — vì bản cũ tự động chọn Nói/Text theo
// thiết bị (mobile → text, desktop → nói), còn V2 cần một nút "slide" cho
// người dùng TỰ chọn Nói hoặc Text bất kể thiết bị.
//
// Bước 2c: nút slide Nói/Text được chuyển lên hàng nút gọn phía trên (component
// cha — RoomofflineV2.js), theo đúng bố cục người dùng mô tả
// "[ [Nghe câu hỏi - Câu mới(Bắt đầu)] [Nói/Text] ]". Vì vậy `mode` giờ là
// prop do component cha điều khiển (controlled), panel này chỉ còn lo phần
// bắt giọng nói / nhập chữ theo đúng `mode` được truyền vào.
//
// onSubmit(text): được gọi khi bấm "Gửi" — trả về câu trả lời (từ giọng nói
// hoặc gõ tay) để component cha so khớp đúng/sai với câu hiện tại.
//
// Bước "kiểm tra toàn diện" (audit so với logic cũ): thêm nút "Xóa" — TÁI HIỆN
// đúng hành vi handleReset trong client/src/ulti/RegcognitionOnly.js (bản cũ):
// chỉ xóa transcript/nội dung đang gõ để nói/gõ lại câu trả lời, KHÔNG tắt mic,
// KHÔNG gửi đi — khác với "Gửi" (gửi đi rồi mới xóa để chuẩn bị câu tiếp theo).
//
// Cùng bước này: đồng bộ "tắt mic khi đang đọc" giống RegcognitionOnly.js bản
// cũ — nhận prop `isReading` từ RoomofflineV2.js để disable nút mic, và có nút
// ẩn #sttStopBTN để ReadMessage_2024.js (TÁI SỬ DỤNG nguyên, không sửa) tự bấm
// tắt mic ngay trước khi phát âm thanh, tránh mic tự thu lại tiếng đọc của máy.
//
// Enter = Gửi: ở chế độ Text, bấm Enter trong ô nhập được tính như bấm nút
// "Gửi" (Shift+Enter vẫn xuống dòng bình thường) — TÁI HIỆN đúng hành vi ô
// nhập chữ mobile trong RegcognitionOnly.js bản cũ.

import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const RoomofflineV2InputPanel = ({ mode, onSubmit, isReading, questionIndex }) => {
  const [typedText, setTypedText] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState("");

  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Nếu trình duyệt tự dừng nghe (im lặng quá lâu…) thì đưa nút mic về trạng
  // thái tắt, giống hành vi ở RegcognitionOnly.js.
  useEffect(() => {
    if (mode !== "noi") return;
    if (micOn && !listening) setMicOn(false);
  }, [listening, mode]); // eslint-disable-line

  // Nếu chế độ đổi sang "text" thì dọn dẹp phần "nói": tắt mic nếu đang bật,
  // và LUÔN xóa transcript cũ (dù mic đang bật hay đã tắt sẵn) — vì transcript
  // của react-speech-recognition là state DÙNG CHUNG toàn cục (không tự mất
  // khi đổi mode, xem cùng bug đã sửa ở LuyenDocPanel.js). Nếu không xóa, lỡ
  // người dùng bật lại "Nói" sau đó thì transcript CŨ (của lần nói trước, có
  // thể là câu trả lời cho câu hỏi khác) vẫn còn dính lại, và nút "Gửi" chỉ
  // check `currentValue.trim()` nên có thể bị gửi nhầm mà không cần nói lại.
  useEffect(() => {
    if (mode !== "noi") {
      if (micOn) {
        SpeechRecognition.stopListening();
        setMicOn(false);
      }
      resetTranscript();
    }
  }, [mode]); // eslint-disable-line

  // TÁI HIỆN đúng bug đã sửa ở LuyenDocPanel.js: transcript nói trên là state
  // DÙNG CHUNG toàn cục, không tự xóa khi component này unmount/remount —
  // trong khi RoomofflineV2.js lại UNMOUNT HẲN panel này mỗi khi hết câu qua
  // resetToUnselected() (gọi qua setTimeout khi đúng/sai/bỏ qua) rồi MOUNT
  // LẠI một panel mới cho câu tiếp theo. Nếu không xóa, transcript của câu
  // TRƯỚC vẫn còn dính lại ngay từ lúc panel mới vừa mount xong, có thể bị
  // gửi nhầm làm câu trả lời cho câu MỚI mà người dùng chưa hề nói gì.
  //
  // BỔ SUNG (rà lại logic phát hiện thiếu sót): "Câu mới" (handleNextSentence
  // trong RoomofflineV2.js) lại đổi THẲNG currentQIndex từ câu A sang câu B,
  // KHÔNG đi qua resetToUnselected() nên KHÔNG có lúc nào currentItem là null
  // — panel này không hề unmount/remount cho trường hợp này, nên hiệu ứng chỉ
  // chạy 1 lần lúc mount ([] rỗng) sẽ bỏ sót đúng lúc cần xóa nhất: nếu mic
  // đang bật liên tục mà bấm "Câu mới" thay vì "Gửi", transcript câu cũ dính
  // sang câu mới. Sửa bằng cách nhận prop `questionIndex` (= currentQIndex
  // của component cha) và đổi dependency thành [questionIndex] — hiệu ứng sẽ
  // chạy lại mỗi khi CÂU ĐỔI, bất kể có unmount/remount hay không.
  useEffect(() => {
    resetTranscript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex]);

  // Phòng thêm trường hợp component này bị unmount hẳn (RoomofflineV2.js
  // unmount panel này mỗi khi hết câu, xem ghi chú ở trên) trong lúc mic đang
  // bật — TỰ TẮT mic khi unmount, giống hệt pattern đã áp dụng ở
  // LuyenDocPanel.js ("Phòng thêm trường hợp component này bị unmount hẳn").
  // Tránh trường hợp mic vẫn ngầm ghi âm dù người học đã rời khỏi câu này.
  useEffect(() => {
    return () => {
      SpeechRecognition.stopListening();
    };
  }, []);

  const handleToggleMic = () => {
    if (micOn) {
      SpeechRecognition.stopListening();
      setMicOn(false);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
      setMicOn(true);
    }
  };

  const currentValue = mode === "noi" ? transcript : typedText;

  const handleSubmit = () => {
    const value = (currentValue || "").trim();
    if (!value) return;
    setLastSubmitted(value);
    if (typeof onSubmit === "function") onSubmit(value);
    if (mode === "noi") {
      resetTranscript();
    } else {
      setTypedText("");
    }
  };

  // Bước kiểm tra toàn diện: nút "Xóa" — chỉ xóa nội dung đang có (transcript
  // hoặc ô gõ) để nói/gõ lại, KHÔNG tắt mic, KHÔNG submit — giống hệt
  // handleReset trong client/src/ulti/RegcognitionOnly.js (bản cũ).
  const handleReset = () => {
    if (mode === "noi") {
      resetTranscript();
    } else {
      setTypedText("");
    }
  };

  return (
    <div className="v2ip-root">
      <style>{`
        .v2ip-root {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
        }
        .v2ip-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 140px;
        }
        .v2ip-mic-btn {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          border: none;
          background: #7c3aed;
          color: #fff;
          font-size: 1.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(124,58,237,0.35);
          transition: background 0.15s, transform 0.1s;
        }
        .v2ip-mic-btn.on { background: #dc2626; animation: v2ip-pulse 1.4s ease-in-out infinite; }
        .v2ip-mic-btn:active { transform: scale(0.93); }
        .v2ip-mic-btn:disabled {
          background: #a7b0be;
          cursor: not-allowed;
          animation: none;
        }
        @keyframes v2ip-pulse {
          0%, 100% { box-shadow: 0 4px 14px rgba(220,38,38,0.35); }
          50% { box-shadow: 0 4px 22px rgba(220,38,38,0.6); }
        }
        .v2ip-transcript {
          min-height: 28px;
          font-size: 1rem;
          color: #1e293b;
          text-align: center;
          padding: 0 8px;
        }
        .v2ip-textarea {
          width: 100%;
          min-height: 100px;
          border-radius: 10px;
          border: 1px solid #d8d3ef;
          padding: 10px 12px;
          font-size: 1rem;
          resize: vertical;
        }
        .v2ip-submit-row {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .v2ip-submit-btn {
          border: none;
          background: #16a34a;
          color: #fff;
          font-weight: 700;
          padding: 10px 26px;
          border-radius: 10px;
          cursor: pointer;
        }
        .v2ip-submit-btn:disabled {
          background: #a7b0be;
          cursor: not-allowed;
        }
        .v2ip-reset-btn {
          border: 1px solid #cbd5e1;
          background: #f1f5f9;
          color: #475569;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
        }
        .v2ip-reset-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .v2ip-last {
          font-size: 0.8rem;
          color: #64748b;
          text-align: center;
        }
      `}</style>

      <div className="v2ip-body">
        {mode === "noi" ? (
          browserSupportsSpeechRecognition ? (
            <>
              <button
                type="button"
                className={`v2ip-mic-btn ${micOn ? "on" : ""}`}
                onClick={handleToggleMic}
                disabled={isReading}
                title={isReading ? "Chờ đọc xong" : undefined}
              >
                <i className={`bi ${micOn ? "bi-mic-fill" : "bi-mic-mute-fill"}`}></i>
              </button>
              <div className="v2ip-transcript">
                {isReading
                  ? "🔊 Đang đọc câu hỏi, chờ một chút…"
                  : transcript || "Nhấn mic và nói câu trả lời…"}
              </div>
            </>
          ) : (
            <div className="v2ip-transcript">
              Trình duyệt này không hỗ trợ nhận diện giọng nói — hãy chuyển
              sang chế độ Text.
            </div>
          )
        ) : (
          <textarea
            className="v2ip-textarea"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            onKeyDown={(e) => {
              // Enter = Gửi (giống ô nhập chữ mobile trong RegcognitionOnly.js
              // bản cũ); Shift+Enter vẫn xuống dòng bình thường.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Nhập câu trả lời… (Enter để gửi, Shift+Enter xuống dòng)"
          />
        )}
      </div>

      <div className="v2ip-submit-row">
        <button
          type="button"
          className="v2ip-reset-btn"
          onClick={handleReset}
          disabled={!currentValue || !currentValue.trim()}
          title="Xóa nội dung hiện tại để nói/gõ lại"
        >
          <i className="bi bi-trash3"></i> Xóa
        </button>
        <button
          type="button"
          className="v2ip-submit-btn"
          onClick={handleSubmit}
          disabled={!currentValue || !currentValue.trim()}
        >
          Gửi
        </button>
      </div>

      {lastSubmitted && (
        <div className="v2ip-last">Câu trả lời vừa gửi: “{lastSubmitted}”</div>
      )}

      {/* Nút ẩn — ReadMessage_2024.js tự bấm (disableButton()) ngay trước khi
          phát âm thanh để tắt mic, tránh mic tự thu lại tiếng đọc của máy. */}
      <button
        id="sttStopBTN"
        style={{ display: "none" }}
        onClick={() => {
          if (mode !== "noi") return;
          SpeechRecognition.stopListening();
          setMicOn(false);
        }}
      />
    </div>
  );
};

export default RoomofflineV2InputPanel;
